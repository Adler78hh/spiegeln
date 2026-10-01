import { animalImageUrl } from '../profiles/animals';
import type { Profile } from '../storage/store';

interface Props {
  profiles: Profile[];
  onPick: (p: Profile) => void;
}

/** Profilwahl über große Tierbilder. */
export function ProfilePicker({ profiles, onPick }: Props) {
  return (
    <div className="picker-screen">
      <div className="profile-grid" role="list">
        {profiles.map((p) => (
          <button key={p.id} role="listitem" className="profile-tile" onClick={() => onPick(p)}>
            <img src={animalImageUrl(p.animal)} alt="" />
            <span>{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
