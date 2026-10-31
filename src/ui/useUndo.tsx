import { useEffect, useRef, useState, type ReactNode } from 'react';
import { UndoIcon } from './icons';

const UNDO_MS = 6000;

interface Pending {
  id: string;
  label: string;
  commit: () => void | Promise<void>;
  timer: ReturnType<typeof setTimeout>;
}

/**
 * Löschen/Ablehnen mit „Rückgängig“: Der Eintrag verschwindet sofort, wird
 * aber erst nach ein paar Sekunden wirklich entfernt. Ein zweites Löschen
 * oder Verlassen der Seite führt das vorige sofort aus.
 */
export function useUndo(): { hidden: Set<string>; schedule: (id: string, label: string, commit: () => void | Promise<void>) => void; toast: ReactNode } {
  const [pending, setPending] = useState<Pending | null>(null);
  const ref = useRef<Pending | null>(null);
  ref.current = pending;

  const run = (p: Pending) => {
    clearTimeout(p.timer);
    void Promise.resolve(p.commit()).catch(console.error);
  };

  useEffect(
    () => () => {
      if (ref.current) run(ref.current);
    },
    [],
  );

  const schedule = (id: string, label: string, commit: () => void | Promise<void>) => {
    if (ref.current) run(ref.current);
    const p: Pending = {
      id,
      label,
      commit,
      timer: setTimeout(() => {
        void Promise.resolve(commit()).catch(console.error);
        setPending((cur) => (cur?.id === id ? null : cur));
      }, UNDO_MS),
    };
    ref.current = p;
    setPending(p);
  };

  const toast = pending && (
    <div className="undo-toast" role="status">
      <span>{pending.label}</span>
      <button
        className="text-btn"
        onClick={() => {
          clearTimeout(pending.timer);
          ref.current = null;
          setPending(null);
        }}
      >
        <UndoIcon /> Rückgängig
      </button>
    </div>
  );

  return { hidden: new Set(pending ? [pending.id] : []), schedule, toast };
}
