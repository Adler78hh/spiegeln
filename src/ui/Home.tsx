import { findColor, tintOf } from '../profiles/colors';
import type { Group, Profile } from '../storage/store';
import { ProfileImage } from './Avatar';
import { ChallengeIcon, MirrorIcon } from './icons';

interface Props {
  profile: Profile;
  group: Group | undefined;
  onSwitchProfile: () => void;
  onFree: () => void;
  onChallenges: () => void;
}

/** Startbildschirm: zwei große Kacheln, oben das eigene Tier. */
export function Home({ profile, group, onSwitchProfile, onFree, onChallenges }: Props) {
  const tint = tintOf(findColor(group?.color ?? 'weiss').hex);
  return (
    <div className="home-screen">
      <div className="home-top">
        <button className="avatar-btn" style={{ background: tint }} aria-label={`${profile.name} – Profil wechseln`} onClick={onSwitchProfile}>
          <ProfileImage profile={profile} />
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
