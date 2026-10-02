import type { MotifInfo } from '../motifs/library';
import { BackIcon, PlusIcon } from './icons';

interface Props {
  motifs: MotifInfo[];
  onPick: (id: string) => void;
  onCreateMotif: () => void;
  onBack: () => void;
}

/** Frei spiegeln, Schritt 1: ein Motiv wählen (große Kacheln, eigenes Bild zuerst). */
export function MotifPicker({ motifs, onPick, onCreateMotif, onBack }: Props) {
  return (
    <div className="list-screen">
      <div className="list-top">
        <button className="tool-btn" aria-label="Zurück" onClick={onBack}>
          <BackIcon />
        </button>
      </div>
      <div className="motif-grid" role="list" aria-label="Bild wählen">
        <button className="motif-tile add-motif" aria-label="Eigenes Motiv" onClick={onCreateMotif}>
          <PlusIcon size={56} />
          <span>Eigenes Bild</span>
        </button>
        {motifs.map((m) => (
          <button key={m.id} className="motif-tile" role="listitem" aria-label={m.name} onClick={() => onPick(m.id)}>
            <img src={m.src} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}
