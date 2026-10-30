import { useEffect, useRef, useState } from 'react';
import {
  addTarget,
  counts,
  KIND_LABELS,
  removeTarget,
  setPlan,
  shuffleTargets,
  toggleSolvable,
  type Draft,
  type DraftTarget,
} from '../../challenges/draft';
import { canvasFromImage, differsFromMirror, finalizeTargets, lookOf, looksSame, RAW_PX, renderMirror, renderRaw, type FigureSource } from '../../challenges/render';
import { allOnOriginalSide, shuffle, solvableFirst } from '../../challenges/generate';
import { suggestScenes } from '../../challenges/suggest';
import { createFigureBuffer, motifToFigurePoint, sampleFigure } from '../../render/composite';
import type { Challenge, TargetKind } from '../../challenges/types';
import { flipSide, initialScene, type Scene } from '../../geometry';
import { applyVariant, findBuiltinMotif, svgToImage } from '../../motifs/builtin';
import { loadImage, type MotifInfo } from '../../motifs/library';
import { DEFAULT_PREFS, newId, type ToolPrefs } from '../../storage/store';
import { DrawingEditor, type DrawingBackground } from '../DrawingEditor';
import { MirrorCanvas } from '../MirrorCanvas';
import { MirrorTools } from '../MirrorTools';
import { useMotifImage } from '../useMotifImage';
import { BackIcon, CheckIcon, ShuffleIcon, SparkleIcon, TrashIcon } from '../icons';
import { ImageCropper } from './ImageCropper';

interface Props {
  draft: Draft;
  motif: MotifInfo;
  onSave: (c: Challenge) => Promise<void>;
  onCancel: () => void;
}

type Overlay =
  | { type: 'paint-target'; background: DrawingBackground; scene: Scene }
  | { type: 'paint-motif'; background: DrawingBackground; scene: Scene }
  | { type: 'crop'; image: HTMLImageElement }
  | { type: 'paint-upload'; background: DrawingBackground };

interface Pending {
  target: DraftTarget;
  message: string;
}

const toUrl = (c: HTMLCanvasElement) => c.toDataURL('image/png');

/** Editor für eigene Herausforderungen (Erwachsenenbereich). */
export function ChallengeEditor({ draft: initial, motif, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState(initial);
  const [scene, setScene] = useState<Scene>(initialScene);
  const [prefs, setPrefs] = useState<ToolPrefs>(DEFAULT_PREFS);
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  /** Rückmeldung nach dem Speichern einer lösbaren Figur (ID der neuen Figur). */
  const [savedId, setSavedId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const image = useMotifImage(motif);
  const c = counts(draft);
  const builtin = findBuiltinMotif(motif.id);

  const source = (): FigureSource | null => (image ? { image, aspect: motif.aspect } : null);

  const add = (t: Omit<DraftTarget, 'id' | 'image'>) => {
    const id = newId();
    setDraft((d) => addTarget(d, { ...t, id, image: t.raw }));
    setMessage(null);
    return id;
  };

  useEffect(() => {
    if (!savedId) return;
    const timer = setTimeout(() => setSavedId(null), 1800);
    return () => clearTimeout(timer);
  }, [savedId]);

  /** Fügt eine unlösbare Figur hinzu; warnt, wenn sie wie ein Spiegelbild aussieht. */
  const addUnsolvable = (canvas: HTMLCanvasElement, kind: TargetKind, s?: Scene) => {
    const src = source();
    const target: DraftTarget = { id: newId(), raw: toUrl(canvas), image: toUrl(canvas), solvable: false, kind, scene: s };
    if (src && s && !differsFromMirror(canvas, src, s)) {
      setPending({ target, message: 'Achtung: Diese Figur sieht aus wie ein normales Spiegelbild und ist wahrscheinlich doch lösbar.' });
      return;
    }
    setDraft((d) => addTarget(d, target));
    setMessage(null);
  };

  const addSolvable = () => {
    const src = source();
    if (!src) return;
    setSavedId(add({ raw: toUrl(renderRaw(src, scene, 'mirror')), solvable: true, kind: 'mirror', scene }));
  };

  /**
   * Füllt bis zur Vorgabe mit automatischen Vorschlägen auf. Frühere
   * Vorschläge werden ersetzt, selbst gemachte Figuren bleiben.
   */
  const suggest = async () => {
    const src = source();
    if (!src) return;
    const kept = draft.targets.filter((t) => !t.auto);
    const missing = counts({ ...draft, targets: kept });
    if (!missing.missingSolvable && !missing.missingUnsolvable) {
      setMessage('Die Vorgabe ist schon erfüllt. Für Vorschläge die Anzahl der Zielfiguren erhöhen.');
      return;
    }
    setSuggesting(true);
    setMessage(null);
    await new Promise((r) => setTimeout(r, 30));
    try {
      const samples = sampleFigure(createFigureBuffer(src.image, src.aspect, RAW_PX), src.aspect);
      const seed = Date.now() % 1_000_000_007;
      const used = new Set<string>();
      // Keine zwei Zielfiguren, die gleich aussehen (auch nicht wie selbst gemachte).
      const looks = await Promise.all(kept.filter((t) => t.kind !== 'upload').map(async (t) => lookOf(canvasFromImage(await loadImage(t.raw)))));
      const fresh = (canvas: HTMLCanvasElement) => {
        const look = lookOf(canvas);
        if (looks.some((l) => looksSame(l, look))) return false;
        looks.push(look);
        return true;
      };
      const make = (canvas: HTMLCanvasElement, solvable: boolean, kind: TargetKind, s: Scene): DraftTarget => {
        const raw = toUrl(canvas);
        return { id: newId(), raw, image: raw, solvable, kind, scene: s, auto: true };
      };
      const rendered = new Map<Scene, HTMLCanvasElement>();
      const added = suggestScenes(samples, missing.missingSolvable, seed, {
        used,
        accept: (s) => {
          const canvas = renderRaw(src, s, 'mirror');
          rendered.set(s, canvas);
          return fresh(canvas);
        },
      }).map(({ scene: s }) => make(rendered.get(s)!, true, 'mirror', s));

      // Unlösbare: reihum gedreht, verschoben und (falls es eine Vorlage gibt) vertauscht.
      const swap = builtin?.swapVariants[0];
      const swapImage = swap ? await svgToImage(applyVariant(builtin!.svg, swap.replacements)) : null;
      const markers = swap ? swap.markers.map(([x, y]) => motifToFigurePoint({ x: x / 200, y: y / 200 }, motif.aspect)) : [];
      const kinds: TargetKind[] = swapImage ? ['rotate', 'translate', 'swap'] : ['rotate', 'translate'];
      for (let i = 0; i < missing.missingUnsolvable; i++) {
        for (const kind of [kinds[i % kinds.length], ...kinds]) {
          let canvas: HTMLCanvasElement | null = null;
          const [hit] = suggestScenes(samples, 1, seed + 101 * (i + 1), {
            mode: kind === 'swap' ? 'mirror' : (kind as 'rotate' | 'translate'),
            used,
            start: i * 4,
            accept: (s) => {
              if (kind === 'swap' && !allOnOriginalSide(markers, s)) return false;
              canvas =
                kind === 'swap'
                  ? renderRaw(src, s, 'mirror', { image: swapImage!, aspect: motif.aspect })
                  : renderRaw(src, s, kind as 'rotate' | 'translate');
              return differsFromMirror(canvas, src, s) && fresh(canvas);
            },
          });
          if (hit && canvas) {
            added.push(make(canvas, false, kind, hit.scene));
            break;
          }
        }
      }
      const targets = solvableFirst([...kept, ...shuffle(added, seed)], (t) => t.solvable);
      setDraft((d) => ({ ...d, targets }));
      const short = missing.missingSolvable + missing.missingUnsolvable - added.length;
      if (short > 0) setMessage(`${short} Vorschläge ließen sich nicht finden.`);
    } finally {
      setSuggesting(false);
    }
  };

  const addTransformed = (mode: 'rotate' | 'translate') => {
    const src = source();
    if (src) addUnsolvable(renderRaw(src, scene, mode), mode, scene);
  };

  const startError = () => {
    const src = source();
    if (!src) return;
    const base = renderMirror(src, scene);
    setOverlay({ type: 'paint-target', background: { image: base, width: base.width, height: base.height }, scene });
  };

  const startSwapPaint = () => {
    if (!image) return;
    setOverlay({ type: 'paint-motif', background: { image, width: image.naturalWidth, height: image.naturalHeight }, scene });
  };

  const addSwapFrom = async (variantImage: CanvasImageSource, s: Scene) => {
    const src = source();
    if (!src) return;
    addUnsolvable(renderRaw(src, s, 'mirror', { image: variantImage, aspect: motif.aspect }), 'swap', s);
  };

  const addSwapTemplate = async () => {
    if (!builtin?.swapVariants[0]) return;
    const img = await svgToImage(applyVariant(builtin.svg, builtin.swapVariants[0].replacements));
    await addSwapFrom(img, scene);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const url = URL.createObjectURL(file);
    try {
      setOverlay({ type: 'crop', image: await loadImage(url) });
    } catch {
      setMessage('Dieses Bild konnte nicht geöffnet werden.');
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    }
  };

  const select = (t: DraftTarget) => {
    if (t.scene) setScene(t.scene);
  };

  const save = async () => {
    if (!draft.targets.length) {
      setMessage('Bitte mindestens eine Zielfigur hinzufügen.');
      return;
    }
    setBusy(true);
    try {
      const { targets, viewSize } = await finalizeTargets(draft.targets, loadImage);
      await onSave({
        id: draft.id,
        name: draft.name.trim() || motif.name,
        motifId: draft.motifId,
        targets,
        viewSize,
        plan: { total: draft.plannedTotal, unsolvable: draft.plannedUnsolvable },
      });
    } finally {
      setBusy(false);
    }
  };

  // ---------- Überlagerungen ----------

  if (overlay?.type === 'paint-target' || overlay?.type === 'paint-motif' || overlay?.type === 'paint-upload') {
    const ov = overlay;
    return (
      <DrawingEditor
        background={ov.background}
        onCancel={() => setOverlay(null)}
        onSave={async (r) => {
          setOverlay(null);
          const img = await loadImage(r.image);
          if (ov.type === 'paint-target') addUnsolvable(canvasFromImage(img), 'error', ov.scene);
          else if (ov.type === 'paint-motif') await addSwapFrom(img, ov.scene);
          else addUnsolvable(canvasFromImage(img), 'upload');
        }}
      />
    );
  }

  const mismatch = draft.targets.length > 0 && !c.matchesPlan;

  return (
    <div className="screen editor-screen">
      <main className="work">
        <MirrorCanvas
          image={image}
          imageSize={{ width: motif.aspect, height: 1 }}
          scene={scene}
          onSceneChange={setScene}
          snap={prefs.snap}
          showOutline={prefs.showOutline}
          hideLine={prefs.hideLine}
        />
      </main>
      <aside className="side editor-side">
        <div className="side-top">
          <button className="tool-btn" aria-label="Abbrechen" onClick={onCancel}>
            <BackIcon />
          </button>
          <input
            id="challenge-name"
            className="name-input"
            value={draft.name}
            maxLength={30}
            aria-label="Name der Herausforderung"
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </div>

        <section className="editor-section">
          <div className="plan">
            <Stepper label="Zielfiguren" value={draft.plannedTotal} onChange={(v) => setDraft(setPlan(draft, v, draft.plannedUnsolvable))} />
            <Stepper label="davon unlösbar" value={draft.plannedUnsolvable} onChange={(v) => setDraft(setPlan(draft, draft.plannedTotal, v))} />
            <button className="text-btn suggest-btn" disabled={!image || suggesting} onClick={suggest}>
              <SparkleIcon /> {suggesting ? 'Erzeuge …' : 'Automatische Vorschläge'}
            </button>
          </div>
          <p className="plan-status">
            Lösbar {c.solvable} / {draft.plannedTotal - draft.plannedUnsolvable} · Unlösbar {c.unsolvable} / {draft.plannedUnsolvable}
          </p>
        </section>

        <section className="editor-section">
          <h2>Lösbare Zielfigur</h2>
          <p className="hint">Startfigur auf der Arbeitsfläche drehen/verschieben und den Spiegel anlegen.</p>
          <button className={`text-btn primary wide ${savedId ? 'just-saved' : ''}`} disabled={!image} onClick={addSolvable} aria-live="polite">
            <CheckIcon size={22} />{' '}
            {savedId ? `Gespeichert (lösbar ${c.solvable} von ${draft.plannedTotal - draft.plannedUnsolvable})` : 'Als lösbare Zielfigur speichern'}
          </button>
        </section>

        <section className="editor-section">
          <h2>Unlösbare Zielfigur</h2>
          <p className="hint">Ausgangspunkt ist jeweils die aktuelle Lage auf der Arbeitsfläche.</p>
          <div className="button-grid">
            <button className="text-btn" disabled={!image} onClick={startError}>
              Fehler einbauen
            </button>
            <button className="text-btn" disabled={!image} onClick={() => addTransformed('rotate')}>
              Gedreht (180°)
            </button>
            <button className="text-btn" disabled={!image} onClick={() => addTransformed('translate')}>
              Verschoben
            </button>
            <button className="text-btn" disabled={!image} onClick={startSwapPaint}>
              Teile ändern, dann spiegeln
            </button>
            {builtin?.swapVariants[0] && (
              <button className="text-btn" disabled={!image} onClick={addSwapTemplate}>
                Vorlage: Teile vertauscht
              </button>
            )}
            <button className="text-btn" onClick={() => fileRef.current?.click()}>
              Eigenes Bild
            </button>
          </div>
          <p className="hint">
            Bei vertauschten Teilen darauf achten, dass ein unterscheidendes Teil (z. B. der Schornstein) im Bild ist.
          </p>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
        </section>

        {pending && (
          <div className="warning" role="alert">
            <p>{pending.message}</p>
            <div className="dialog-actions">
              <button className="text-btn" onClick={() => setPending(null)}>
                Verwerfen
              </button>
              <button
                className="text-btn primary"
                onClick={() => {
                  setDraft((d) => addTarget(d, pending.target));
                  setPending(null);
                }}
              >
                Trotzdem hinzufügen
              </button>
            </div>
          </div>
        )}

        <section className="editor-section">
          <div className="section-head">
            <h2>Zielfiguren ({draft.targets.length})</h2>
            <button className="text-btn" disabled={draft.targets.length < 2} onClick={() => setDraft(shuffleTargets(draft, Date.now()))}>
              <ShuffleIcon /> Mischen
            </button>
          </div>
          <ol className="editor-targets">
            {draft.targets.map((t, i) => (
              <li key={t.id} className={`editor-target ${t.solvable ? 'solvable' : 'unsolvable'} ${t.id === savedId ? 'is-new' : ''}`}>
                <button className="editor-thumb" aria-label={`Figur ${i + 1} in die Arbeitsfläche laden`} onClick={() => select(t)} disabled={!t.scene}>
                  <img src={t.raw} alt="" />
                </button>
                <span className="kind">
                  {KIND_LABELS[t.kind]}
                  {t.auto ? ' · Vorschlag' : ''}
                </span>
                <button
                  className={`chip ${t.solvable ? 'fits' : 'impossible'}`}
                  aria-label="Kennzeichnung umschalten"
                  onClick={() => setDraft(toggleSolvable(draft, t.id))}
                >
                  {t.solvable ? 'lösbar' : 'unlösbar'}
                </button>
                <button className="icon-btn" aria-label={`Figur ${i + 1} entfernen`} onClick={() => setDraft(removeTarget(draft, t.id))}>
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ol>
        </section>

        {message && <p className="warning-text">{message}</p>}
        {mismatch && <p className="hint">Die Anzahl weicht von der Vorgabe ab. Speichern ist trotzdem möglich.</p>}

        <div className="editor-footer">
          <MirrorTools prefs={prefs} onPrefsChange={setPrefs} onReset={() => setScene(initialScene())} onFlip={() => setScene(flipSide)} />
          <button className="text-btn primary wide" disabled={busy || !draft.targets.length} onClick={save}>
            {busy ? 'Speichert …' : 'Herausforderung speichern'}
          </button>
        </div>
      </aside>

      {overlay?.type === 'crop' && (
        <ImageCropper
          image={overlay.image}
          onCancel={() => setOverlay(null)}
          onDone={(sq) => setOverlay({ type: 'paint-upload', background: { image: sq, width: sq.width, height: sq.height } })}
        />
      )}
    </div>
  );
}

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="stepper">
      <span>{label}</span>
      <button className="step-btn" aria-label={`${label} verringern`} onClick={() => onChange(value - 1)}>
        –
      </button>
      <strong>{value}</strong>
      <button className="step-btn" aria-label={`${label} erhöhen`} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}
