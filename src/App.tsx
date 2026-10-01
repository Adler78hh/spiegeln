import { useEffect, useState } from 'react';
import { createMirror, UNIT_RECT, type MirrorState } from './geometry';
import { BUILTIN_MOTIFS, svgDataUrl, svgToImage } from './motifs/builtin';
import { MirrorCanvas } from './ui/MirrorCanvas';
import { ResetIcon, SnapIcon } from './ui/icons';

const IMAGE_SIZE = { width: 1, height: 1 };

export default function App() {
  const [motifId, setMotifId] = useState(BUILTIN_MOTIFS[0].id);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [mirror, setMirror] = useState<MirrorState>(() => createMirror(UNIT_RECT));
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
          mirror={mirror}
          onMirrorChange={setMirror}
          rotation={0}
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
          <button className="tool-btn" aria-label="Spiegel zurücksetzen" onClick={() => setMirror(createMirror(UNIT_RECT))}>
            <ResetIcon />
          </button>
        </div>
      </aside>
    </div>
  );
}
