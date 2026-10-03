import { useEffect, useState } from 'react';
import { loadGroupId, saveGroupId } from '../profiles/lastGroup';
import { Store, type Group, type Profile } from '../storage/store';
import { Home } from '../ui/Home';
import { ProfilePicker } from '../ui/ProfilePicker';
import { AREAS, type AreaId } from './areas';
import { AreaScreen } from './AreaScreen';
import { ZerlegenAdult } from './ZerlegenAdult';

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
    // Daten nicht vom Browser aufräumen lassen (z. B. Safari nach 7 Tagen ohne Nutzung).
    navigator.storage?.persist?.().catch(() => {});
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
    <Home
      profile={profile}
      group={groups.find((g) => g.id === profile.groupId)}
      onSwitchProfile={switchProfile}
      tiles={AREAS.map((a) => ({ label: a.label, icon: a.icon(120), onClick: () => setScreen({ name: 'area', area: a.id }) }))}
    />
  );
}
