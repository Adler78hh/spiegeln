import { useRef, useState } from 'react';
import { boundsCenter } from '../challenges/generate';
import { initialScene, mirrorTransform, type Scene } from '../geometry';
import { BUILTIN_MOTIFS, svgDataUrl } from '../motifs/builtin';
import { contentBounds, createFigureBuffer, cropSquare, renderComposite } from '../render/composite';
import type { Snapshot, ToolPrefs } from '../storage/store';
import { BackIcon, CameraIcon } from './icons';
import { MirrorCanvas } from './MirrorCanvas';
import { MirrorTools } from './MirrorTools';
import { useMotifImage } from './useMotifImage';

const IMAGE_SIZE = { width: 1, height: 1 };
const RENDER_PX = 768;
const SNAPSHOT_PX = 256;

interface Props {
  prefs: ToolPrefs;
  onPrefsChange: (p: ToolPrefs) => void;
  snapshots: Snapshot[];
  onSnapshot: (s: Omit<Snapshot, 'id' | 'createdAt' | 'profileId'>) => void;
  onBack: () => void;
}

/** Bild der aktuellen Figur, auf den Inhalt zugeschnitten. */
function renderSnapshot(image: HTMLImageElement, scene: Scene): string {
  const fig = createFigureBuffer(image, 1, RENDER_PX);
  const full = renderComposite(RENDER_PX, scene, fig, fig, mirrorTransform(scene.mirror));
  const b = contentBounds(full);
  const size = b ? Math.min(1, Math.max(b.maxX - b.minX, b.maxY - b.minY) * 1.15) : 1;
  return cropSquare(full, boundsCenter(b), size, SNAPSHOT_PX).toDataURL('image/png');
}

/** Modus 1: Bild wählen, frei spiegeln und Figuren merken. */
export function FreeMirror({ prefs, onPrefsChange, snapshots, onSnapshot, onBack }: Props) {
  const [motifId, setMotifId] = useState(BUILTIN_MOTIFS[0].id);
  const image = useMotifImage(motifId);
  const [scene, setScene] = useState<Scene>(initialScene);
  const [flash, setFlash] = useState(false);
  const flashTimer = useRef(0);

  const remember = () => {
    if (!image) return;
    onSnapshot({ motifId, scene, image: renderSnapshot(image, scene) });
    setFlash(true);
    clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(false), 250);
  };

  const restore = (s: Snapshot) => {
    setMotifId(s.motifId);
    setScene(s.scene);
  };

  return (
    <div className="screen">
      <main className={`work ${flash ? 'flash' : ''}`}>
        <MirrorCanvas
          image={image}
          imageSize={IMAGE_SIZE}
          scene={scene}
          onSceneChange={setScene}
          snap={prefs.snap}
          showOutline={prefs.showOutline}
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
          {BUILTIN_MOTIFS.map((m) => (
            <button
              key={m.id}
              role="radio"
              aria-checked={m.id === motifId}
              aria-label={m.name}
              className={`motif-btn ${m.id === motifId ? 'selected' : ''}`}
              onClick={() => {
                setMotifId(m.id);
                setScene(initialScene());
              }}
            >
              <img src={svgDataUrl(m.svg)} alt="" />
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
