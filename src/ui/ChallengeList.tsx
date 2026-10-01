import type { Challenge, ChallengeAnswers } from '../challenges/types';
import type { MotifInfo } from '../motifs/library';
import { BackIcon, StarIcon } from './icons';

interface Props {
  challenges: Challenge[] | null;
  motifs: MotifInfo[];
  answers: Record<string, ChallengeAnswers>;
  onOpen: (id: string) => void;
  onBack: () => void;
}

/** Auswahl einer Herausforderung über ihr Startmotiv. */
export function ChallengeList({ challenges, motifs, answers, onOpen, onBack }: Props) {
  return (
    <div className="list-screen">
      <div className="list-top">
        <button className="tool-btn" aria-label="Zurück" onClick={onBack}>
          <BackIcon />
        </button>
      </div>
      {!challenges ? (
        <div className="loading" aria-label="Lädt">
          <span className="spinner" />
        </div>
      ) : (
        <div className="challenge-grid">
          {challenges.map((c) => {
            const done = c.targets.filter((t) => answers[c.id]?.[t.id]).length;
            const total = c.targets.length;
            const motif = motifs.find((m) => m.id === c.motifId);
            return (
              <button key={c.id} className="challenge-tile" aria-label={c.name} onClick={() => onOpen(c.id)}>
                {motif && <img src={motif.src} alt="" />}
                <span className="progress" aria-label={`${done} von ${total} bearbeitet`}>
                  <span className="progress-bar" style={{ width: `${(100 * done) / total}%` }} />
                </span>
                {done === total && (
                  <span className="tile-star">
                    <StarIcon size={28} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
