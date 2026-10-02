import { useState } from 'react';
import { isCorrect, makeQuestion, type Question } from '../../adult/gate';
import { useLongPress } from '../useLongPress';
import { BackIcon, GearIcon } from '../icons';

/**
 * Zahnrad für Erwachsene: 3 Sekunden gedrückt halten, dann eine
 * Einmaleins-Aufgabe lösen.
 */
export function AdultGateButton({ onOpen }: { onOpen: () => void }) {
  const [question, setQuestion] = useState<Question | null>(null);
  const { progress, handlers } = useLongPress(() => setQuestion(makeQuestion()));

  return (
    <>
      <button
        className="gate-btn"
        aria-label="Erwachsenenbereich (3 Sekunden gedrückt halten)"
        {...handlers}
      >
        <svg className="gate-ring" viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r="17" pathLength={1} strokeDasharray={`${progress} 1`} opacity={progress > 0 ? 1 : 0} />
        </svg>
        <GearIcon size={26} />
      </button>
      {question && (
        <MathDialog
          question={question}
          onCancel={() => setQuestion(null)}
          onSolved={() => {
            setQuestion(null);
            onOpen();
          }}
          onWrong={() => setQuestion(makeQuestion())}
        />
      )}
    </>
  );
}

function MathDialog(props: { question: Question; onCancel: () => void; onSolved: () => void; onWrong: () => void }) {
  const { question, onCancel, onSolved, onWrong } = props;
  const [input, setInput] = useState('');
  const [wrong, setWrong] = useState(false);

  const press = (k: string) => {
    setWrong(false);
    if (k === '⌫') setInput((v) => v.slice(0, -1));
    else if (input.length < 3) setInput((v) => v + k);
  };

  const submit = () => {
    if (isCorrect(question, input)) onSolved();
    else {
      setWrong(true);
      setInput('');
      onWrong();
    }
  };

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label="Aufgabe für Erwachsene">
      <div className="dialog math-dialog">
        <p className="math-hint">Für Erwachsene: Bitte rechnen.</p>
        <p className="math-question">
          {question.a} · {question.b} = <span className="math-input">{input || '?'}</span>
        </p>
        {wrong && <p className="math-wrong">Nicht richtig. Neue Aufgabe.</p>}
        <div className="numpad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK'].map((k) => (
            <button
              key={k}
              className={`num-btn ${k === 'OK' ? 'ok' : ''}`}
              onClick={() => (k === 'OK' ? submit() : press(k))}
              aria-label={k === '⌫' ? 'Löschen' : k}
            >
              {k}
            </button>
          ))}
        </div>
        <button className="text-btn" onClick={onCancel}>
          <BackIcon /> Abbrechen
        </button>
      </div>
    </div>
  );
}
