import { findColor, tintOf } from '../profiles/colors';
import type { Group, Profile } from '../storage/store';
import { ProfileImage } from '../ui/Avatar';
import { AREAS, type AreaId } from './areas';

interface Props {
  profile: Profile;
  group: Group | undefined;
  onSwitchProfile: () => void;
  onArea: (area: AreaId) => void;
}

/** Startbildschirm von Zerlegen: drei große Kacheln, oben das eigene Tier. */
export function ZerlegenHome({ profile, group, onSwitchProfile, onArea }: Props) {
  const tint = tintOf(findColor(group?.color ?? 'weiss').hex);
  return (
    <div className="home-screen">
      <div className="home-top">
        <button className="avatar-btn" style={{ background: tint }} aria-label={`${profile.name} – Profil wechseln`} onClick={onSwitchProfile}>
          <ProfileImage profile={profile} />
          <span>{profile.name}</span>
        </button>
      </div>
      <div className="home home-many">
        {AREAS.map((a) => (
          <button key={a.id} className="home-tile" onClick={() => onArea(a.id)}>
            {a.icon(120)}
            <span>{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
