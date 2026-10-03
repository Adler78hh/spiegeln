import type { ReactNode } from 'react';
import { findColor, tintOf } from '../profiles/colors';
import type { Group, Profile } from '../storage/store';
import { ProfileImage } from './Avatar';

export interface HomeTile {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

interface Props {
  profile: Profile;
  group: Group | undefined;
  onSwitchProfile: () => void;
  tiles: HomeTile[];
}

/** Startbildschirm: große Kacheln, oben das eigene Tier. */
export function Home({ profile, group, onSwitchProfile, tiles }: Props) {
  const tint = tintOf(findColor(group?.color ?? 'weiss').hex);
  return (
    <div className="home-screen">
      <div className="home-top">
        <button className="avatar-btn" style={{ background: tint }} aria-label={`${profile.name} – Profil wechseln`} onClick={onSwitchProfile}>
          <ProfileImage profile={profile} />
          <span>{profile.name}</span>
        </button>
      </div>
      <div className={`home ${tiles.length > 2 ? 'home-many' : ''}`}>
        {tiles.map((t) => (
          <button key={t.label} className="home-tile" onClick={t.onClick}>
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
