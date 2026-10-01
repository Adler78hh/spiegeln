import { useRef, useState } from 'react';
import { boundsCenter } from '../challenges/generate';
import { initialScene, mirrorTransform, type Scene } from '../geometry';
import type { MotifInfo } from '../motifs/library';
import { contentBounds, createFigureBuffer, cropSquare, renderComposite } from '../render/composite';
import type { Snapshot, ToolPrefs } from '../storage/store';
import { BackIcon, CameraIcon, PlusIcon } from './icons';
import { MirrorCanvas } from './MirrorCanvas';
import { MirrorTools } from './MirrorTools';
import { useMotifImage } from './useMotifImage';

const RENDER_PX = 768;
const SNAPSHOT_PX = 256;

interface Props {
  motifs: MotifInfo[];
  motifId: string;
  onMotifChange: (id: string) => void;
  onCreateMotif: () => void;
  prefs: ToolPrefs;
  onPrefsChange: (p: ToolPrefs) => void;
  snapshots: Snapshot[];
  onSnapshot: (s: Omit<Snapshot, 'id' | 'createdAt' | 'profileId'>) => void;
  onBack: () => void;
}

/** Bild der aktuellen Figur, auf den Inhalt zugeschnitten. */
function renderSnapshot(image: HTMLImageElement, aspect: number, scene: Scene): string {
  const fig = createFigureBuffer(image, aspect, RENDER_PX);
  const full = renderComposite(RENDER_PX, scene, fig, fig, mirrorTransform(scene.mirror));
  const b = contentBounds(full);
  const size = b ? Math.min(1, Math.max(b.maxX - b.minX, b.maxY - b.minY) * 1.15) : 1;
  return cropSquare(full, boundsCenter(b), size, SNAPSHOT_PX).toDataURL('image/png');
}

/** Modus 1: Bild wählen, frei spiegeln und Figuren merken. */
export function FreeMirror(props: Props) {
  const { motifs, motifId, onMotifChange, onCreateMotif, prefs, onPrefsChange, snapshots, onSnapshot, onBack } = props;
  const motif = motifs.find((m) => m.id === motifId) ?? motifs[0];
  const image = useMotifImage(motif);
  const [scene, setScene] = useState<Scene>(initialScene);
  const [flash, setFlash] = useState(false);
  const flashTimer = useRef(0);

  const remember = () => {
    if (!image) return;
    onSnapshot({ motifId: motif.id, scene, image: renderSnapshot(image, motif.aspect, scene) });
    setFlash(true);
    clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(false), 250);
  };

  const restore = (s: Snapshot) => {
    if (!motifs.some((m) => m.id === s.motifId)) return; // Motiv wurde gelöscht
    onMotifChange(s.motifId);
    setScene(s.scene);
  };

  return (
    <div className="screen">
      <main className={`work ${flash ? 'flash' : ''}`}>
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
      <aside className="side free-side">
        <div className="side-top">
          <button className="tool-btn" aria-label="Zurück" onClick={onBack}>
            <BackIcon />
          </button>
          <button className="tool-btn camera-btn" aria-label="Figur merken" onClick={remember}>
            <CameraIcon />
          </button>
        </div>
        <div className="motif-list" role="radiogroup" aria-label="Bild wählen">
          <button className="motif-btn add-motif" aria-label="Eigenes Motiv" onClick={onCreateMotif}>
            <PlusIcon size={34} />
            <span>Eigenes Bild</span>
          </button>
          {motifs.map((m) => (
            <button
              key={m.id}
              role="radio"
              aria-checked={m.id === motif.id}
              aria-label={m.name}
              className={`motif-btn ${m.id === motif.id ? 'selected' : ''}`}
              onClick={() => {
                onMotifChange(m.id);
                setScene(initialScene());
              }}
            >
              <img src={m.src} alt="" />
            </button>
          ))}
        </div>
        {snapshots.length > 0 && (
          <div className="gallery" aria-label="Gemerkte Figuren">
            {snapshots.map((s) => (
              <button key={s.id} className="gallery-item" aria-label="Gemerkte Figur öffnen" onClick={() => restore(s)}>
                <img src={s.image} alt="" />
              </button>
            ))}
          </div>
        )}
        <MirrorTools prefs={prefs} onPrefsChange={onPrefsChange} onReset={() => setScene(initialScene())} />
      </aside>
    </div>
  );
}
