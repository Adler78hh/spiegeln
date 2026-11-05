import { useEffect, useState } from 'react';
import { Store, type Group, type Profile } from '../storage/store';
import { ProfilePicker } from '../ui/ProfilePicker';
import type { AreaId } from './areas';
import { AreaScreen } from './AreaScreen';
import { ZerlegenAdult } from './ZerlegenAdult';
import { ZerlegenHome } from './ZerlegenHome';

/** Zuletzt gewählte Gruppe, nur auf diesem Gerät. */
const GROUP_KEY = 'zerlegen.gruppe';
function loadGroupId(): string | null {
  try {
    return localStorage.getItem(GROUP_KEY);
  } catch {
    return null;
  }
}
function saveGroupId(id: string) {
  try {
    localStorage.setItem(GROUP_KEY, id);
  } catch {
    // Ohne Speicher gilt die Wahl nur bis zum Neuladen.
  }
}

type ScreenState = { name: 'profiles' } | { name: 'adult' } | { name: 'home' } | { name: 'area'; area: AreaId };

/**
 * App „Zerlegen“: Profilwahl, Gruppen und Erwachsenenbereich wie bei
 * Spiegeln; hinter jedem Profil die Bereiche Blitzsehen, Zerlegen, Muster.
 */
export default function ZerlegenApp() {
  const [store, setStore] = useState<Store | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState<string | null>(loadGroupId);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [screen, setScreen] = useState<ScreenState>({ name: 'profiles' });

  useEffect(() => {
    let alive = true;
    Store.open(undefined, () => location.reload())
      .then(async (s) => {
        if (!alive) return;
        setStore(s);
        const data = await s.ensureDefaults();
        if (!alive) return;
        setGroups(data.groups);
        setProfiles(data.profiles);
      })
      .catch((e) => {
        console.error(e);
        setError('Der Speicher auf diesem Gerät ist nicht verfügbar.');
      });
    return () => {
      alive = false;
    };
  }, []);

  const group = groups.find((g) => g.id === groupId) ?? groups[0];

  const switchProfile = async () => {
    if (store) setProfiles(await store.listProfiles());
    setProfile(null);
    setScreen({ name: 'profiles' });
  };

  if (error) return <div className="message">{error}</div>;
  if (!store) return <div className="loading" aria-label="Lädt"><span className="spinner" /></div>;

  if (screen.name === 'adult') {
    return (
      <ZerlegenAdult
        store={store}
        groups={groups}
        onGroupsChange={setGroups}
        profiles={profiles}
        onProfilesChange={setProfiles}
        onExit={() => {
          setProfile(null);
          setScreen({ name: 'profiles' });
        }}
      />
    );
  }

  if (screen.name === 'profiles' || !profile) {
    if (!group) return <div className="loading" aria-label="Lädt"><span className="spinner" /></div>;
    return (
      <ProfilePicker
        groups={groups}
        group={group}
        profiles={profiles.filter((p) => p.groupId === group.id)}
        onPick={(p) => {
          setProfile(p);
          setScreen({ name: 'home' });
        }}
        onGroupChange={(id) => {
          setGroupId(id);
          saveGroupId(id);
        }}
        onAdult={() => setScreen({ name: 'adult' })}
      />
    );
  }

  if (screen.name === 'area') return <AreaScreen area={screen.area} onBack={() => setScreen({ name: 'home' })} />;

  return (
    <ZerlegenHome
      profile={profile}
      group={groups.find((g) => g.id === profile.groupId)}
      onSwitchProfile={switchProfile}
      onArea={(area) => setScreen({ name: 'area', area })}
    />
  );
}
