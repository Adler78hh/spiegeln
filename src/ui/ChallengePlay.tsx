import { useMemo, useRef, useState } from 'react';
import { initialScene, mirrorTransform, type Scene } from '../geometry';
import { unsolvableCount, type Answer, type Challenge, type ChallengeAnswers, type Decision } from '../challenges/types';
import { boundsCenter } from '../challenges/generate';
import { contentBounds, createFigureBuffer, cropSquare, renderComposite } from '../render/composite';
import { BackIcon, CheckIcon, CrossIcon, StarIcon } from './icons';
import { MirrorCanvas } from './MirrorCanvas';
import type { ToolPrefs } from '../storage/store';
import { MirrorTools } from './MirrorTools';
import { useMotifImage } from './useMotifImage';

const IMAGE_SIZE = { width: 1, height: 1 };
/** Auflösung, in der das Spiegelergebnis berechnet wird. */
const RENDER_PX = 768;
/** Auflösung des gespeicherten Spiegelergebnisses. */
const SNAPSHOT_PX = 256;

interface Props {
  challenge: Challenge;
  answers: ChallengeAnswers;
  onAnswer: (targetId: string, answer: Answer) => void;
  prefs: ToolPrefs;
  onPrefsChange: (p: ToolPrefs) => void;
  onBack: () => void;
}

/** Modus 2: Startfigur drehen/spiegeln und zu jeder Zielfigur entscheiden. */
export function ChallengePlay({ challenge, answers, onAnswer, prefs, onPrefsChange, onBack }: Props) {
  const image = useMotifImage(challenge.motifId);
  const targets = challenge.targets;
  const firstOpen = targets.find((t) => !answers[t.id]) ?? targets[0];
  const [selectedId, setSelectedId] = useState(firstOpen.id);
  const [scene, setScene] = useState<Scene>(() => answers[firstOpen.id]?.scene ?? initialScene());
  const figureRef = useRef<{ image: HTMLImageElement; buffer: HTMLCanvasElement } | null>(null);

  const selected = targets.find((t) => t.id === selectedId) ?? targets[0];
  const unsolvable = unsolvableCount(challenge);
  const allDone = useMemo(() => targets.every((t) => answers[t.id]), [targets, answers]);

  const select = (id: string) => {
    setSelectedId(id);
    setScene(answers[id]?.scene ?? initialScene());
  };

  const snapshot = (s: Scene): string | undefined => {
    if (!image) return undefined;
    if (figureRef.current?.image !== image) {
      figureRef.current = { image, buffer: createFigureBuffer(image, 1, RENDER_PX) };
    }
    const fig = figureRef.current.buffer;
    const full = renderComposite(RENDER_PX, s, fig, fig, mirrorTransform(s.mirror));
    // Gleicher Ausschnitt wie bei den Zielbildern, damit man vergleichen kann.
    return cropSquare(full, boundsCenter(contentBounds(full)), challenge.viewSize, SNAPSHOT_PX).toDataURL('image/png');
  };

  const decide = (decision: Decision) => {
    onAnswer(selected.id, {
      decision,
      scene,
      snapshot: decision === 'fits' ? snapshot(scene) : undefined,
      updatedAt: Date.now(),
    });
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

  return (
    <div className="screen challenge-screen">
      <main className="work">
        <MirrorCanvas
          image={image}
          imageSize={IMAGE_SIZE}
          scene={scene}
          onSceneChange={setScene}
          snap={prefs.snap}
          showOutline={prefs.showOutline}
        />
      </main>
      <aside className="side challenge-side">
        <div className="side-top">
          <button className="tool-btn" aria-label="Zurück" onClick={onBack}>
            <BackIcon />
          </button>
          {allDone && (
            <span className="done-star" aria-label="Alle Figuren bearbeitet">
              <StarIcon size={36} />
            </span>
          )}
          <MirrorTools prefs={prefs} onPrefsChange={onPrefsChange} onReset={() => setScene(initialScene())} />
        </div>

        <div className="target-big">
          <img src={selected.image} alt="Ausgewählte Zielfigur" />
        </div>

        <div className="target-area">
          <div className="unsolvable-hint" aria-label={`${unsolvable} Figuren gehen nicht`}>
            <span className="hint-icon">
              <CrossIcon size={22} />
            </span>
            <span className="hint-count">{unsolvable}</span>
            <span className="hint-text">gehen nicht</span>
          </div>
          <div className="target-grid" role="listbox" aria-label="Zielfiguren">
            {targets.map((t, i) => {
              const a = answers[t.id];
              return (
                <button
                  key={t.id}
                  role="option"
                  aria-selected={t.id === selected.id}
                  aria-label={`Figur ${i + 1}${a ? (a.decision === 'fits' ? ', passt' : ', geht nicht') : ''}`}
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

        <div className="decide">
          <button className={`decide-btn fits ${current === 'fits' ? 'chosen' : ''}`} onClick={() => decide('fits')}>
            <CheckIcon size={36} />
            <span>Passt</span>
          </button>
          <button
            className={`decide-btn impossible ${current === 'impossible' ? 'chosen' : ''}`}
            onClick={() => decide('impossible')}
          >
            <CrossIcon size={36} />
            <span>Geht nicht</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
