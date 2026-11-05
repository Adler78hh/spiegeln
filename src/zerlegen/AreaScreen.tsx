import { BackIcon } from '../ui/icons';
import { AREAS, type AreaId } from './areas';

/** Ein Bereich (Blitzsehen, Zerlegen, Muster) – die Übungen folgen. */
export function AreaScreen({ area, onBack }: { area: AreaId; onBack: () => void }) {
  const info = AREAS.find((a) => a.id === area)!;
  return (
    <div className="area-screen">
      <div className="list-top">
        <button className="tool-btn" aria-label="Zurück" onClick={onBack}>
          <BackIcon />
        </button>
      </div>
      <div className="area-soon">
        {info.icon(120)}
        <h1>{info.label}</h1>
        <p>Hier gibt es bald Übungen.</p>
      </div>
    </div>
  );
}
