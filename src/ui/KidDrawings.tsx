import type { CustomMotif } from '../storage/store';
import { BackIcon, PenIcon } from './icons';

interface Props {
  /** Nur die eigenen Zeichnungen des Kindes. */
  drawings: CustomMotif[];
  onNew: () => void;
  onEdit: (m: CustomMotif) => void;
  onBack: () => void;
}

/** Eigene Zeichnungen eines Kindes: neu zeichnen oder weiterbearbeiten. */
export function KidDrawings({ drawings, onNew, onEdit, onBack }: Props) {
  return (
    <div className="list-screen">
      <div className="list-top">
        <button className="tool-btn" aria-label="Zurück" onClick={onBack}>
          <BackIcon />
        </button>
      </div>
      <div className="motif-grid" role="list" aria-label="Meine Bilder">
        <button className="motif-tile add-motif" aria-label="Neues Bild zeichnen" onClick={onNew}>
          <PenIcon size={56} />
          <span>Neues Bild</span>
        </button>
        {drawings.map((m) => (
          <button key={m.id} className="motif-tile" role="listitem" aria-label={`${m.name} bearbeiten`} onClick={() => onEdit(m)}>
            <img src={m.image} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}
