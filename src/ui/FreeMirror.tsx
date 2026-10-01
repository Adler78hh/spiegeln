import { useState } from 'react';
import { initialScene, type Scene } from '../geometry';
import { BUILTIN_MOTIFS, svgDataUrl } from '../motifs/builtin';
import { BackIcon } from './icons';
import { MirrorCanvas } from './MirrorCanvas';
import { MirrorTools, type ToolPrefs } from './MirrorTools';
import { useMotifImage } from './useMotifImage';

const IMAGE_SIZE = { width: 1, height: 1 };

interface Props {
  prefs: ToolPrefs;
  onPrefsChange: (p: ToolPrefs) => void;
  onBack: () => void;
}

/** Modus 1: Bild wählen und frei spiegeln. */
export function FreeMirror({ prefs, onPrefsChange, onBack }: Props) {
  const [motifId, setMotifId] = useState(BUILTIN_MOTIFS[0].id);
  const image = useMotifImage(motifId);
  const [scene, setScene] = useState<Scene>(initialScene);

  return (
    <div className="screen">
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
      <aside className="side">
        <div className="side-top">
          <button className="tool-btn" aria-label="Zurück" onClick={onBack}>
            <BackIcon />
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
              onClick={() => setMotifId(m.id)}
            >
              <img src={svgDataUrl(m.svg)} alt="" />
            </button>
          ))}
        </div>
        <MirrorTools prefs={prefs} onPrefsChange={onPrefsChange} onReset={() => setScene(initialScene())} />
      </aside>
    </div>
  );
}
