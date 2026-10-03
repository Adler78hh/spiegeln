import { useEffect, useRef, useState } from 'react';
import { boundsCenter } from '../challenges/generate';
import { flipSide, mirrorTransform, type Scene } from '../geometry';
import type { MotifInfo } from '../motifs/library';
import { contentBounds, createFigureBuffer, cropSquare, renderComposite, renderInvertedComposite, type InvertMode } from '../render/composite';
import type { Snapshot, ToolPrefs } from '../storage/store';
import { BackIcon, CameraIcon } from './icons';
import { MirrorCanvas } from './MirrorCanvas';
import { MirrorTools } from './MirrorTools';
import { useMotifImage } from './useMotifImage';
import { useStartScene } from './useStartScene';

const RENDER_PX = 768;
const SNAPSHOT_PX = 256;

interface Props {
  motifs: MotifInfo[];
  motifId: string;
  prefs: ToolPrefs;
  onPrefsChange: (p: ToolPrefs) => void;
  snapshots: Snapshot[];
  onSnapshot: (s: Omit<Snapshot, 'id' | 'createdAt' | 'profileId'>) => void;
  onBack: () => void;
}

/** Bild der aktuellen Figur, auf den Inhalt zugeschnitten. */
function renderSnapshot(image: HTMLImageElement, aspect: number, scene: Scene, invert: InvertMode, color: string): string {
  const fig = createFigureBuffer(image, aspect, RENDER_PX);
  const full = renderComposite(RENDER_PX, scene, fig, fig, mirrorTransform(scene.mirror));
  const b = contentBounds(full);
  const size = b ? Math.min(1, Math.max(b.maxX - b.minX, b.maxY - b.minY) * 1.15) : 1;
  // Mit Farbumkehr wird das Bild so gemerkt, wie es zu sehen ist (samt Hintergrund),
  // aber mit demselben Ausschnitt wie ohne.
  const shown = invert === 'none' ? full : renderInvertedComposite(RENDER_PX, scene, fig, invert, color);
  return cropSquare(shown, boundsCenter(b), size, SNAPSHOT_PX).toDataURL('image/png');
}

/** Modus 1, Schritt 2: mit dem gewählten Motiv frei spiegeln und Figuren merken. */
export function FreeMirror(props: Props) {
  const { motifs, motifId, prefs, onPrefsChange, snapshots, onSnapshot, onBack } = props;
  const motif = motifs.find((m) => m.id === motifId) ?? motifs[0];
  const image = useMotifImage(motif);
  const startScene = useStartScene(image, motif.aspect);
  const [scene, setScene] = useState<Scene>(startScene);
  // Spiegel neben die Figur setzen, sobald das Bild geladen ist.
  const touched = useRef(false);
  useEffect(() => {
    if (image && !touched.current) setScene(startScene());
  }, [image]);
  const changeScene = (s: Scene) => {
    touched.current = true;
    setScene(s);
  };
  const [flash, setFlash] = useState(false);
  const flashTimer = useRef(0);

  const remember = () => {
    if (!image) return;
    onSnapshot({ motifId: motif.id, scene, image: renderSnapshot(image, motif.aspect, scene, prefs.invert ?? 'none', prefs.invertColor) });
    setFlash(true);
    clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(false), 250);
  };

  // Nur die gemerkten Figuren zu diesem Motiv.
  const own = snapshots.filter((s) => s.motifId === motif.id);
  const restore = (s: Snapshot) => changeScene(s.scene);

  return (
    <div className="screen">
      <main className={`work ${flash ? 'flash' : ''}`}>
        {/* Zurück immer oben links über der Arbeitsfläche, wie auf den Auswahlseiten. */}
        <div className="work-top">
          <button className="tool-btn" aria-label="Zurück" onClick={onBack}>
            <BackIcon />
          </button>
        </div>
        <MirrorCanvas
          image={image}
          imageSize={{ width: motif.aspect, height: 1 }}
          scene={scene}
          onSceneChange={changeScene}
          snap={prefs.snap}
          showOutline={prefs.showOutline}
          hideLine={prefs.hideLine}
          invert={prefs.invert ?? 'none'}
          invertColor={prefs.invertColor}
        />
      </main>
      <aside className="side free-side">
        <div className="side-top">
          <button className="tool-btn camera-btn" aria-label="Figur merken" onClick={remember}>
            <CameraIcon />
          </button>
        </div>
        {own.length > 0 ? (
          <div className="gallery" aria-label="Gemerkte Figuren">
            {own.map((s) => (
              <button key={s.id} className="gallery-item" aria-label="Gemerkte Figur öffnen" onClick={() => restore(s)}>
                <img src={s.image} alt="" />
              </button>
            ))}
          </div>
        ) : (
          <div className="gallery-space" />
        )}
        <MirrorTools prefs={prefs} onPrefsChange={onPrefsChange} onReset={() => setScene(startScene())} onFlip={() => setScene(flipSide)} withInvert />
      </aside>
    </div>
  );
}
