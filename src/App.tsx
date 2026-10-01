import { useEffect, useState } from 'react';
import { loadChallenges } from './challenges/builtin';
import type { Answer, Challenge, ChallengeAnswers } from './challenges/types';
import { allMotifs, BUILTIN_MOTIF_INFOS } from './motifs/library';
import { Store, type CustomMotif, type Profile, type Snapshot, type ToolPrefs } from './storage/store';
import { ChallengeList } from './ui/ChallengeList';
import { ChallengePlay } from './ui/ChallengePlay';
import { FreeMirror } from './ui/FreeMirror';
import { Home } from './ui/Home';
import { MotifCreator } from './ui/MotifCreator';
import { ProfilePicker } from './ui/ProfilePicker';

type ScreenState =
  | { name: 'profiles' }
  | { name: 'home' }
  | { name: 'free' }
  | { name: 'create-motif' }
  | { name: 'challenges' }
  | { name: 'challenge'; id: string };

export default function App() {
  const [store, setStore] = useState<Store | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [screen, setScreen] = useState<ScreenState>({ name: 'profiles' });
  const [challenges, setChallenges] = useState<Challenge[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, ChallengeAnswers>>({});
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [customMotifs, setCustomMotifs] = useState<CustomMotif[]>([]);
  const [freeMotifId, setFreeMotifId] = useState(BUILTIN_MOTIF_INFOS[0].id);
  const motifs = allMotifs(customMotifs);

  useEffect(() => {
    let alive = true;
    Store.open()
      .then(async (s) => {
        if (!alive) return;
        setStore(s);
        setProfiles(await s.ensureDefaultProfiles());
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

  const pickProfile = async (p: Profile) => {
    if (!store) return;
    setProfile(p);
    setAnswers(await store.getAnswers(p.id));
    setSnapshots(await store.listSnapshots(p.id));
    setScreen({ name: 'home' });
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

  if (screen.name === 'profiles' || !profile) {
    return <ProfilePicker profiles={profiles} onPick={pickProfile} />;
  }

  switch (screen.name) {
    case 'home':
      return (
        <Home
          profile={profile}
          onSwitchProfile={switchProfile}
          onFree={() => setScreen({ name: 'free' })}
          onChallenges={() => setScreen({ name: 'challenges' })}
        />
      );
    case 'free':
      return (
        <FreeMirror
          motifs={motifs}
          motifId={freeMotifId}
          onMotifChange={setFreeMotifId}
          onCreateMotif={() => setScreen({ name: 'create-motif' })}
          prefs={profile.prefs}
          onPrefsChange={setPrefs}
          snapshots={snapshots}
          onSnapshot={addSnapshot}
          onBack={() => setScreen({ name: 'home' })}
        />
      );
    case 'create-motif':
      return <MotifCreator onSave={addMotif} onCancel={() => setScreen({ name: 'free' })} />;
    case 'challenges':
      return (
        <ChallengeList
          challenges={challenges}
          motifs={motifs}
          answers={answers}
          onOpen={(id) => setScreen({ name: 'challenge', id })}
          onBack={() => setScreen({ name: 'home' })}
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
          prefs={profile.prefs}
          onPrefsChange={setPrefs}
          onBack={() => setScreen({ name: 'challenges' })}
        />
      );
    }
  }
}
