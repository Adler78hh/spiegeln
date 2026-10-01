import { animalImageUrl } from '../profiles/animals';
import type { Profile } from '../storage/store';
import { ChallengeIcon, MirrorIcon } from './icons';

interface Props {
  profile: Profile;
  onSwitchProfile: () => void;
  onFree: () => void;
  onChallenges: () => void;
}

/** Startbildschirm: zwei große Kacheln, oben das eigene Tier. */
export function Home({ profile, onSwitchProfile, onFree, onChallenges }: Props) {
  return (
    <div className="home-screen">
      <div className="home-top">
        <button className="avatar-btn" aria-label={`${profile.name} – Profil wechseln`} onClick={onSwitchProfile}>
          <img src={animalImageUrl(profile.animal)} alt="" />
          <span>{profile.name}</span>
        </button>
      </div>
      <div className="home">
        <button className="home-tile" onClick={onFree}>
          <MirrorIcon size={120} />
          <span>Freies Spiegeln</span>
        </button>
        <button className="home-tile" onClick={onChallenges}>
          <ChallengeIcon size={120} />
          <span>Herausforderungen</span>
        </button>
      </div>
    </div>
  );
}
