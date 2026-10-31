import { useEffect, useMemo, useRef, useState } from 'react';
import { flipSide, mirrorTransform, type Scene } from '../geometry';
import { unsolvableCount, type Answer, type Challenge, type ChallengeAnswers, type Decision } from '../challenges/types';
import { boundsCenter } from '../challenges/generate';
import { contentBounds, createFigureBuffer, cropSquare, renderComposite } from '../render/composite';
import { BackIcon, CameraIcon, CheckIcon, CrossIcon, ThumbsUpIcon } from './icons';
import { COMMANDS, INTRO, pointerFor, sceneClose, scriptFor, stepDone, TUTOR_CHALLENGE, type FinalStep, type Step } from '../tutor/script';
import { createMatcher, type Matcher } from '../tutor/match';
import { speak, stopSpeaking } from '../tutor/speech';
import { ProfileImage } from './Avatar';
import { ButtonGuide } from './GuideHand';
import type { Profile } from '../storage/store';
import { checkAnswers } from '../challenges/check';
import { MirrorCanvas } from './MirrorCanvas';
import type { ChallengePhotos, Photo, ToolPrefs } from '../storage/store';
import { MirrorTools } from './MirrorTools';
import { useMotifImage } from './useMotifImage';
import { useStartScene } from './useStartScene';
import type { MotifInfo } from '../motifs/library';

/** Auflösung, in der das Spiegelergebnis berechnet wird. */
const RENDER_PX = 768;
/** Auflösung des Bildes einer Sicherung. */
const PHOTO_PX = 256;

interface Props {
  challenge: Challenge;
  motif: MotifInfo | undefined;
  answers: ChallengeAnswers;
  onAnswer: (targetId: string, answer: Answer) => void;
  /** Sicherungen (Fotoapparat) dieser Herausforderung. */
  photos: ChallengePhotos;
  /** Sicherung setzen (Photo) oder aufheben (null). */
  onPhoto: (targetId: string, photo: Photo | null) => void;
  prefs: ToolPrefs;
  onPrefsChange: (p: ToolPrefs) => void;
  onBack: () => void;
  /** Tutor (Tier des Kindes); fehlt, wenn die Lehrkraft ihn ausgeschaltet hat. */
  tutor?: Pick<Profile, 'name' | 'animal'>;
}

/** Laufende Führung des Tutors zu einer Zielfigur. */
interface Guide {
  targetId: string;
  steps: Step[];
  /** Nächster auszuführender Befehl. */
  index: number;
  /** Lage beim Erteilen des Befehls (zum Erkennen, ob er ausgeführt wurde). */
  base: Scene;
  intro: boolean;
}

/** Modus 2: Startfigur drehen/spiegeln und zu jeder Zielfigur entscheiden. */
export function ChallengePlay({ challenge, motif, answers, onAnswer, photos, onPhoto, prefs, onPrefsChange, onBack, tutor }: Props) {
  const image = useMotifImage(motif);
  const aspect = motif?.aspect ?? 1;
  const targets = challenge.targets;
  const firstOpen = targets.find((t) => !answers[t.id]) ?? targets[0];
  const [selectedId, setSelectedId] = useState(firstOpen.id);
  const startScene = useStartScene(image, aspect);
  // Gesicherte Zielfigur: Figur und Spiegel wie beim Sichern, sonst die Startlage.
  const [scene, setScene] = useState<Scene>(() => photos[firstOpen.id]?.scene ?? startScene());
  // Ist das Bild erst nach dem Öffnen geladen, den Spiegel neben die Figur setzen
  // (solange das Kind noch nichts verändert hat).
  const touched = useRef(false);
  useEffect(() => {
    if (image && !touched.current && !photos[selectedId]) {
      const s = startScene();
      setScene(s);
      setGuide((g) => (g ? { ...g, base: s } : g));
    }
  }, [image]);
  const changeScene = (s: Scene) => {
    touched.current = true;
    setScene(s);
  };
  const figureRef = useRef<{ image: HTMLImageElement; buffer: HTMLCanvasElement } | null>(null);

  const selected = targets.find((t) => t.id === selectedId) ?? targets[0];
  const unsolvable = unsolvableCount(challenge);
  const allDone = useMemo(() => targets.every((t) => answers[t.id]), [targets, answers]);

  // Selbstkontrolle: erst wenn alles bearbeitet ist. Angezeigt wird nur die
  // Anzahl richtiger Entscheidungen, nicht welche Figuren falsch sind. Ändert
  // das Kind danach eine Antwort, verschwindet die Anzeige wieder.
  const [checkedAt, setCheckedAt] = useState<number | null>(null);
  const check = useMemo(() => (checkedAt === null ? null : checkAnswers(challenge, answers)), [checkedAt, challenge, answers]);
  const checkCurrent = check !== null && checkedAt !== null && targets.every((t) => (answers[t.id]?.updatedAt ?? Infinity) <= checkedAt);

  // ---------- Tutor (nur Haus, Zielfiguren 1–6) ----------
  // Beim ersten Öffnen führt er automatisch, danach nur auf Antippen seines Symbols.
  const tutorOn = !!tutor && challenge.id === TUTOR_CHALLENGE;
  const [autoTutor] = useState(() => tutorOn && !prefs.tutorSeen?.includes(challenge.id));
  const [guide, setGuide] = useState<Guide | null>(null);
  const [matched, setMatched] = useState(false);
  const matcher = useRef<Matcher | null>(null);
  const stepsAt = (id: string) => (tutorOn ? scriptFor(challenge.id, targets.findIndex((t) => t.id === id)) : null);
  const startGuide = (id: string, s: Scene, intro = false) => {
    const steps = stepsAt(id);
    setGuide(steps ? { targetId: id, steps, index: 0, base: s, intro } : null);
  };
  useEffect(() => {
    if (!autoTutor) return;
    onPrefsChange({ ...prefs, tutorSeen: [...(prefs.tutorSeen ?? []), challenge.id] });
    if (!answers[selectedId]) startGuide(selectedId, scene, targets[0].id === selectedId);
  }, []);
  useEffect(() => () => stopSpeaking(), []);

  const select = (id: string) => {
    setSelectedId(id);
    const s = photos[id]?.scene ?? startScene();
    setScene(s);
    if (autoTutor && !answers[id]) startGuide(id, s);
    else setGuide(null);
  };

  const renderPhoto = (s: Scene): string | undefined => {
    if (!image) return undefined;
    if (figureRef.current?.image !== image) {
      figureRef.current = { image, buffer: createFigureBuffer(image, aspect, RENDER_PX) };
    }
    const fig = figureRef.current.buffer;
    const full = renderComposite(RENDER_PX, s, fig, fig, mirrorTransform(s.mirror));
    // Gleicher Ausschnitt wie bei den Zielbildern, damit man vergleichen kann.
    return cropSquare(full, boundsCenter(contentBounds(full)), challenge.viewSize, PHOTO_PX).toDataURL('image/png');
  };

  const decide = (decision: Decision) => {
    onAnswer(selected.id, { decision, scene, updatedAt: Date.now() });
    // Weiter zur nächsten offenen Zielfigur (falls es eine gibt).
    const idx = targets.findIndex((t) => t.id === selected.id);
    for (let k = 1; k < targets.length; k++) {
      const t = targets[(idx + k) % targets.length];
      if (!answers[t.id]) {
        select(t.id);
        return;
      }
    }
  };

  const current = answers[selected.id]?.decision;
  const photo = photos[selected.id];

  // Vergleich mit der Zielfigur, solange der Tutor führt.
  useEffect(() => {
    matcher.current = null;
    setMatched(false);
    if (!guide || !image) return;
    let alive = true;
    createMatcher(image, aspect, selected.image, challenge.viewSize).then((m) => {
      if (alive) matcher.current = m;
    }, console.error);
    return () => {
      alive = false;
    };
  }, [guide?.targetId, image]);

  useEffect(() => {
    if (!guide) return;
    const ok = (selected.scene && sceneClose(selected.scene, scene)) || !!matcher.current?.matches(scene);
    setMatched(ok);
    // Befehl ausgeführt → nächster (die Lage von jetzt ist der neue Ausgangspunkt).
    const step = guide.steps[guide.index];
    if (step && stepDone(step, guide.base, scene, prefs.snap)) setGuide({ ...guide, index: guide.index + 1, base: scene });
  }, [scene, prefs.snap, guide?.targetId, guide?.index]);

  // Was sagt der Tutor gerade? Passt das Bild: Foto, dann „Passt“. Sonst der
  // nächste Befehl (sind alle ausgeführt, bleibt der letzte stehen).
  const phase: Step | FinalStep | null = !guide
    ? null
    : matched || photo
    ? photo
      ? 'fits'
      : 'photo'
    : guide.steps[Math.min(guide.index, guide.steps.length - 1)];
  // „Ich helfe dir.“ nur vor dem ersten Befehl der ersten Figur.
  const withIntro = !!guide?.intro && guide.index === 0 && phase === guide.steps[0];
  const said = phase ? `${withIntro ? `${INTRO} ` : ''}${COMMANDS[phase]}` : '';
  useEffect(() => {
    if (said) speak(said);
  }, [said, guide?.targetId]);
  // Hat das Kind entschieden, ist die Führung zu dieser Figur vorbei.
  useEffect(() => {
    if (guide && answers[guide.targetId] && guide.targetId === selectedId) setGuide(null);
  }, [answers]);
  const canvasGuide = phase && phase !== 'photo' && phase !== 'fits' ? pointerFor(phase, scene) : null;
  const toolHighlight = phase === 'snap' || phase === 'flip' ? phase : null;

  // Fotoapparat: sichern bzw. die Sicherung wieder aufheben. Weiterbewegen
  // ändert eine Sicherung nicht; neu sichern heißt erst entsichern.
  const togglePhoto = () => {
    if (photo) {
      onPhoto(selected.id, null);
      return;
    }
    const img = renderPhoto(scene);
    if (img) onPhoto(selected.id, { scene, image: img, createdAt: Date.now() });
  };

  return (
    <div className="screen challenge-screen">
      <main className="work">
        {/* Zurück immer oben links über der Arbeitsfläche, wie auf den Auswahlseiten. */}
        <div className="work-top">
          <button className="tool-btn" aria-label="Zurück" onClick={onBack}>
            <BackIcon />
          </button>
        </div>
        <MirrorCanvas
          image={image}
          imageSize={{ width: aspect, height: 1 }}
          scene={scene}
          onSceneChange={changeScene}
          snap={prefs.snap}
          showOutline={prefs.showOutline}
          hideLine={prefs.hideLine}
          guide={canvasGuide}
        />
      </main>
      <aside className="side challenge-side">
        <div className="side-top">
          <MirrorTools
            prefs={prefs}
            onPrefsChange={onPrefsChange}
            onReset={() => {
              const s = startScene();
              setScene(s);
              setGuide((g) => (g ? { ...g, index: 0, base: s } : g));
            }}
            onFlip={() => setScene(flipSide)}
            highlight={toolHighlight}
            tutor={
              // Bei „Haus“ bleibt der Platz immer frei, damit die Knöpfe nicht springen.
              tutorOn && tutor ? (
                <button
                  className={`tool-btn tutor-btn ${guide ? 'on' : ''} ${stepsAt(selected.id) ? '' : 'is-hidden'}`}
                  disabled={!stepsAt(selected.id)}
                  aria-label="Tutor: Hilfe"
                  aria-pressed={!!guide}
                  onClick={() => (guide ? (setGuide(null), stopSpeaking()) : startGuide(selected.id, scene))}
                >
                  <ProfileImage profile={tutor} />
                </button>
              ) : undefined
            }
          />
        </div>

        <div className={`target-row ${guide && tutor ? 'with-tutor' : ''}`}>
          <div className="target-big">
            <img src={selected.image} alt="Ausgewählte Zielfigur" />
          </div>
          {guide && tutor && phase && (
            <div className="tutor-bubble" role="status">
              <button className="tutor-say" aria-label="Noch einmal vorlesen" onClick={() => speak(said)}>
                <ProfileImage profile={tutor} />
                <span>{said}</span>
              </button>
              <button
                className="tutor-close"
                aria-label="Tutor schließen"
                onClick={() => {
                  setGuide(null);
                  stopSpeaking();
                }}
              >
                <CrossIcon size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="target-area">
          <div className="hint-row">
            {/* Ohne unlösbare Figuren (z. B. Tetraktys) entfällt der Hinweis. */}
            {unsolvable > 0 && (
              <div className="unsolvable-hint" aria-label={unsolvable === 1 ? '1 Figur unlösbar' : `${unsolvable} Figuren unlösbar`}>
                <span className="hint-icon">
                  <CrossIcon size={22} />
                </span>
                <span className="hint-count">{unsolvable}</span>
                <span className="hint-text">unlösbar</span>
              </div>
            )}
            {checkCurrent && check && (
              <div className="check-summary" role="status">
                <ThumbsUpIcon size={22} />
                <span className="hint-text">
                  <span className="hint-count">{check.correct}</span> von <span className="hint-count">{check.total}</span>{' '}
                  richtig
                </span>
              </div>
            )}
          </div>
          <div className={`target-grid ${targets.length > 12 ? 'many' : ''} ${targets.length > 24 ? 'very-many' : ''}`} role="listbox" aria-label="Zielfiguren">
            {targets.map((t, i) => {
              const a = answers[t.id];
              return (
                <button
                  key={t.id}
                  role="option"
                  aria-selected={t.id === selected.id}
                  aria-label={`Figur ${i + 1}${a ? (a.decision === 'fits' ? ', passt' : ', unlösbar') : ''}`}
                  className={`target-thumb ${t.id === selected.id ? 'selected' : ''}`}
                  onClick={() => select(t.id)}
                >
                  <img src={t.image} alt="" />
                  {a && (
                    <span className={`badge ${a.decision}`}>
                      {a.decision === 'fits' ? <CheckIcon size={16} /> : <CrossIcon size={16} />}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {allDone && !checkCurrent && (
          <button className="check-btn" aria-label="Prüfen, ob alles stimmt" onClick={() => setCheckedAt(Date.now())}>
            <ThumbsUpIcon size={40} />
          </button>
        )}

        <div className="decide">
          <button
            className={`photo-btn ${photo ? 'saved' : ''} ${phase === 'photo' ? 'tutor-target' : ''}`}
            aria-pressed={!!photo}
            aria-label={photo ? 'Gesichert – antippen zum Entsichern' : 'Sichern'}
            onClick={togglePhoto}
          >
            <CameraIcon size={36} />
            {phase === 'photo' && <ButtonGuide />}
          </button>
          <button className={`decide-btn fits ${current === 'fits' ? 'chosen' : ''} ${phase === 'fits' ? 'tutor-target' : ''}`} onClick={() => decide('fits')}>
            <CheckIcon size={36} />
            <span>Passt</span>
            {phase === 'fits' && <ButtonGuide />}
          </button>
          <button
            className={`decide-btn impossible ${current === 'impossible' ? 'chosen' : ''}`}
            onClick={() => decide('impossible')}
          >
            <CrossIcon size={36} />
            <span>Unlösbar</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
