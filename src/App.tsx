import { useEffect, useState } from 'react';
import { loadBuiltinChallenges } from './challenges/builtin';
import type { Answer, Challenge, ChallengeAnswers } from './challenges/types';
import { ChallengeList } from './ui/ChallengeList';
import { ChallengePlay } from './ui/ChallengePlay';
import { FreeMirror } from './ui/FreeMirror';
import { Home } from './ui/Home';
import type { ToolPrefs } from './ui/MirrorTools';

type ScreenState = { name: 'home' } | { name: 'free' } | { name: 'challenges' } | { name: 'challenge'; id: string };

export default function App() {
  const [screen, setScreen] = useState<ScreenState>({ name: 'home' });
  const [prefs, setPrefs] = useState<ToolPrefs>({ snap: false, showOutline: false });
  const [challenges, setChallenges] = useState<Challenge[] | null>(null);
  // Antworten pro Herausforderung (wird mit den Profilen dauerhaft gespeichert).
  const [answers, setAnswers] = useState<Record<string, ChallengeAnswers>>({});

  useEffect(() => {
    loadBuiltinChallenges().then((c) => {
      setChallenges(c);
      if (import.meta.env.DEV) (window as unknown as { __challenges: Challenge[] }).__challenges = c;
    }, (e) => console.error(e));
  }, []);

  const saveAnswer = (challengeId: string, targetId: string, answer: Answer) =>
    setAnswers((all) => ({ ...all, [challengeId]: { ...all[challengeId], [targetId]: answer } }));

  switch (screen.name) {
    case 'home':
      return <Home onFree={() => setScreen({ name: 'free' })} onChallenges={() => setScreen({ name: 'challenges' })} />;
    case 'free':
      return <FreeMirror prefs={prefs} onPrefsChange={setPrefs} onBack={() => setScreen({ name: 'home' })} />;
    case 'challenges':
      return (
        <ChallengeList
          challenges={challenges}
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
          key={challenge.id}
          challenge={challenge}
          answers={answers[challenge.id] ?? {}}
          onAnswer={(targetId, a) => saveAnswer(challenge.id, targetId, a)}
          prefs={prefs}
          onPrefsChange={setPrefs}
          onBack={() => setScreen({ name: 'challenges' })}
        />
      );
    }
  }
}
