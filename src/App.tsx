import { useEffect, useState } from 'react';
import { loadChallenges } from './challenges/builtin';
import type { Answer, Challenge, ChallengeAnswers } from './challenges/types';
import { allMotifs, BUILTIN_MOTIF_INFOS } from './motifs/library';
import { Store, type ChallengePhotos, type CustomMotif, type Photo, type Group, type Profile, type Snapshot, type ToolPrefs } from './storage/store';
import { ChallengeList } from './ui/ChallengeList';
import { ChallengePlay } from './ui/ChallengePlay';
import { FreeMirror } from './ui/FreeMirror';
import { Home } from './ui/Home';
import { MotifCreator } from './ui/MotifCreator';
import { MotifPicker } from './ui/MotifPicker';
import { AdultArea } from './ui/adult/AdultArea';
import { GRATIS } from './edition';
import { ANIMAL_ORDER } from './profiles/animals';
import { ProfilePicker } from './ui/ProfilePicker';

/** Zuletzt gewählte Gruppe, nur auf diesem Gerät. */
const GROUP_KEY = GRATIS ? 'spiegeln-gratis.gruppe' : 'spiegeln.gruppe';
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

type ScreenState =
  | { name: 'profiles' }
  | { name: 'adult' }
  | { name: 'home' }
  | { name: 'free-pick' }
  | { name: 'free' }
  | { name: 'create-motif' }
  | { name: 'challenges' }
  | { name: 'challenge'; id: string };

export default function App() {
  const [store, setStore] = useState<Store | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState<string | null>(loadGroupId);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [screen, setScreen] = useState<ScreenState>({ name: 'profiles' });
  const [challenges, setChallenges] = useState<Challenge[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, ChallengeAnswers>>({});
  const [photos, setPhotos] = useState<Record<string, ChallengePhotos>>({});
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [customMotifs, setCustomMotifs] = useState<CustomMotif[]>([]);
  const [freeMotifId, setFreeMotifId] = useState(BUILTIN_MOTIF_INFOS[0].id);
  const motifs = allMotifs(customMotifs);

  useEffect(() => {
    let alive = true;
    // Daten nicht vom Browser aufräumen lassen (z. B. Safari nach 7 Tagen ohne Nutzung).
    navigator.storage?.persist?.().catch(() => {});
    Store.open(undefined, () => location.reload())
      .then(async (s) => {
        if (!alive) return;
        setStore(s);
        // Gratisversion: eine Klasse mit allen Tieren.
        const data = await s.ensureDefaults(GRATIS ? ANIMAL_ORDER : undefined);
        setGroups(data.groups);
        setProfiles(data.profiles);
        setCustomMotifs(await s.listMotifs());
        const c = await loadChallenges(s);
        if (!alive) return;
        setChallenges(c);
        if (import.meta.env.DEV) (window as unknown as { __challenges: Challenge[] }).__challenges = c;
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

  const chooseGroup = (id: string) => {
    setGroupId(id);
    saveGroupId(id);
  };

  const pickProfile = async (p: Profile) => {
    if (!store) return;
    setProfile(p);
    setAnswers(await store.getAnswers(p.id));
    setPhotos(await store.getPhotos(p.id));
    setSnapshots(await store.listSnapshots(p.id));
    // Gratisversion ohne freies Spiegeln: gleich zu den Herausforderungen.
    setScreen(GRATIS ? { name: 'challenges' } : { name: 'home' });
  };

  const switchProfile = async () => {
    if (store) setProfiles(await store.listProfiles());
    setProfile(null);
    setScreen({ name: 'profiles' });
  };

  const setPrefs = (prefs: ToolPrefs) => {
    if (!profile || !store) return;
    setProfile({ ...profile, prefs });
    store.updateProfile(profile.id, { prefs }).catch(console.error);
  };

  const saveAnswer = (challengeId: string, targetId: string, answer: Answer) => {
    if (!profile || !store) return;
    setAnswers((all) => ({ ...all, [challengeId]: { ...all[challengeId], [targetId]: answer } }));
    store.saveAnswer(profile.id, challengeId, targetId, answer).catch(console.error);
  };

  const savePhoto = (challengeId: string, targetId: string, photo: Photo | null) => {
    if (!profile || !store) return;
    setPhotos((all) => {
      const { [targetId]: _old, ...rest } = all[challengeId] ?? {};
      return { ...all, [challengeId]: photo ? { ...rest, [targetId]: photo } : rest };
    });
    const done = photo ? store.savePhoto(profile.id, challengeId, targetId, photo) : store.deletePhoto(profile.id, challengeId, targetId);
    done.catch(console.error);
  };

  const addSnapshot = async (s: Omit<Snapshot, 'id' | 'createdAt' | 'profileId'>) => {
    if (!profile || !store) return;
    const snap = await store.addSnapshot({ ...s, profileId: profile.id });
    setSnapshots((all) => [snap, ...all]);
  };

  const addMotif = async (m: Omit<CustomMotif, 'id' | 'createdAt'>) => {
    if (!store) return;
    const motif = await store.addMotif(m);
    setCustomMotifs((all) => [...all, motif]);
    setFreeMotifId(motif.id);
    setScreen({ name: 'free' });
  };

  if (error) return <div className="message">{error}</div>;
  if (!store) return <div className="loading" aria-label="Lädt"><span className="spinner" /></div>;

  if (screen.name === 'adult') {
    return (
      <AdultArea
        store={store}
        groups={groups}
        onGroupsChange={setGroups}
        profiles={profiles}
        onProfilesChange={setProfiles}
        customMotifs={customMotifs}
        onCustomMotifsChange={setCustomMotifs}
        motifs={motifs}
        challenges={challenges ?? []}
        onChallengesChange={setChallenges}
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
        onPick={pickProfile}
        onGroupChange={chooseGroup}
        onAdult={() => setScreen({ name: 'adult' })}
      />
    );
  }

  switch (screen.name) {
    case 'home':
      return (
        <Home
          profile={profile}
          group={groups.find((g) => g.id === profile.groupId)}
          onSwitchProfile={switchProfile}
          onFree={() => setScreen({ name: 'free-pick' })}
          onChallenges={() => setScreen({ name: 'challenges' })}
        />
      );
    case 'free-pick':
      return (
        <MotifPicker
          motifs={motifs}
          onPick={(id) => {
            setFreeMotifId(id);
            setScreen({ name: 'free' });
          }}
          onCreateMotif={() => setScreen({ name: 'create-motif' })}
          onBack={() => setScreen({ name: 'home' })}
        />
      );
    case 'free':
      return (
        <FreeMirror
          motifs={motifs}
          motifId={freeMotifId}
          prefs={profile.prefs}
          onPrefsChange={setPrefs}
          snapshots={snapshots}
          onSnapshot={addSnapshot}
          onBack={() => setScreen({ name: 'free-pick' })}
        />
      );
    case 'create-motif':
      return <MotifCreator onSave={addMotif} onCancel={() => setScreen({ name: 'free-pick' })} />;
    case 'challenges':
      return (
        <ChallengeList
          challenges={challenges}
          motifs={motifs}
          answers={answers}
          onOpen={(id) => setScreen({ name: 'challenge', id })}
          onBack={GRATIS ? switchProfile : () => setScreen({ name: 'home' })}
        />
      );
    case 'challenge': {
      const challenge = challenges?.find((c) => c.id === screen.id);
      if (!challenge) return null;
      return (
        <ChallengePlay
          key={`${profile.id}-${challenge.id}`}
          challenge={challenge}
          motif={motifs.find((m) => m.id === challenge.motifId)}
          answers={answers[challenge.id] ?? {}}
          onAnswer={(targetId, a) => saveAnswer(challenge.id, targetId, a)}
          photos={photos[challenge.id] ?? {}}
          onPhoto={(targetId, p) => savePhoto(challenge.id, targetId, p)}
          prefs={profile.prefs}
          onPrefsChange={setPrefs}
          onBack={() => setScreen({ name: 'challenges' })}
        />
      );
    }
  }
}
