import { useEffect, useState } from 'react';
import { createMirror, INITIAL_FIGURE, UNIT_RECT } from './geometry';
import { BUILTIN_MOTIFS, svgDataUrl, svgToImage } from './motifs/builtin';
import { MirrorCanvas, type Scene } from './ui/MirrorCanvas';
import { ResetIcon, SnapIcon } from './ui/icons';

const IMAGE_SIZE = { width: 1, height: 1 };
const initialScene = (): Scene => ({ mirror: createMirror(UNIT_RECT), figure: INITIAL_FIGURE });

export default function App() {
  const [motifId, setMotifId] = useState(BUILTIN_MOTIFS[0].id);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scene, setScene] = useState<Scene>(initialScene);
  const [snap, setSnap] = useState(false);

  useEffect(() => {
    let alive = true;
    const motif = BUILTIN_MOTIFS.find((m) => m.id === motifId)!;
    svgToImage(motif.svg).then((img) => alive && setImage(img));
    return () => {
      alive = false;
    };
  }, [motifId]);

  return (
    <div className="screen">
      <main className="work">
        <MirrorCanvas
          image={image}
          imageSize={IMAGE_SIZE}
          scene={scene}
          onSceneChange={setScene}
          snap={snap}
        />
      </main>
      <aside className="side">
        <div className="motif-list" role="radiogroup" aria-label="Bild wählen">
          {BUILTIN_MOTIFS.map((m) => (
            <button
              key={m.id}
              role="radio"
              aria-checked={m.id === motifId}
              aria-label={m.name}
              className={`motif-btn ${m.id === motifId ? 'selected' : ''}`}
              onClick={() => setMotifId(m.id)}
            >
              <img src={svgDataUrl(m.svg)} alt="" />
            </button>
          ))}
        </div>
        <div className="tools">
          <button
            className={`tool-btn ${snap ? 'on' : ''}`}
            aria-pressed={snap}
            aria-label="Einrasten auf 15 Grad"
            onClick={() => setSnap((s) => !s)}
          >
            <SnapIcon />
          </button>
          <button className="tool-btn" aria-label="Zurücksetzen" onClick={() => setScene(initialScene())}>
            <ResetIcon />
          </button>
        </div>
      </aside>
    </div>
  );
}
