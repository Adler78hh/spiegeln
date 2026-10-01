import { ANIMALS, animalImageUrl } from '../profiles/animals';
import type { Profile } from '../storage/store';
import { AdultGateButton } from './adult/AdultGate';

interface Props {
  profiles: Profile[];
  onPick: (p: Profile) => void;
  onAdult: () => void;
}

/** Profilwahl über große Tierbilder. */
export function ProfilePicker({ profiles, onPick, onAdult }: Props) {
  return (
    <div className="picker-screen">
      <div className="gate-corner">
        <AdultGateButton onOpen={onAdult} />
      </div>
      <div className="profile-grid" role="list">
        {profiles.map((p) => (
          <button key={p.id} role="listitem" className="profile-tile" onClick={() => onPick(p)}>
            <img src={animalImageUrl(p.animal)} alt="" />
            <span>{p.name}</span>
            {p.name !== ANIMALS[p.animal].name && <small className="animal-name">{ANIMALS[p.animal].name}</small>}
          </button>
        ))}
      </div>
    </div>
  );
}
