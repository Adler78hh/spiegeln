import type { MotifInfo } from '../motifs/library';
import { BackIcon } from './icons';

interface Props {
  motifs: MotifInfo[];
  onPick: (id: string) => void;
  onBack: () => void;
}

/** Frei spiegeln, Schritt 1: ein Motiv wählen (große Kacheln; eigene Zeichnungen des Kindes stehen mit drin). */
export function MotifPicker({ motifs, onPick, onBack }: Props) {
  return (
    <div className="list-screen">
      <div className="list-top">
        <button className="tool-btn" aria-label="Zurück" onClick={onBack}>
          <BackIcon />
        </button>
      </div>
      <div className="motif-grid" role="list" aria-label="Bild wählen">
        {motifs.filter((m) => !m.hidden).map((m) => (
          <button key={m.id} className="motif-tile" role="listitem" aria-label={m.name} onClick={() => onPick(m.id)}>
            <img src={m.src} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}
