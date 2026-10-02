import { animalImageUrl } from '../profiles/animals';
import { initialsOf } from '../profiles/colors';
import type { Profile } from '../storage/store';

/** Profilbild: Tier oder – ohne Tier – die Anfangsbuchstaben des Namens. */
export function ProfileImage({ profile }: { profile: Pick<Profile, 'name' | 'animal'> }) {
  if (profile.animal) return <img className="profile-image" src={animalImageUrl(profile.animal)} alt="" />;
  return (
    <svg className="profile-image initials" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="44" fill="#fff" fillOpacity=".55" stroke="#4a3b2f" strokeOpacity=".25" strokeWidth="3" />
      <text x="50" y="52" textAnchor="middle" dominantBaseline="central" fontSize="40" fontWeight="800" fill="#4a3b2f">
        {initialsOf(profile.name)}
      </text>
    </svg>
  );
}
