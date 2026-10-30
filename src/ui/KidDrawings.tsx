import { useState } from 'react';
import type { Challenge, ChallengeAnswers } from '../challenges/types';
import type { CustomMotif } from '../storage/store';
import { BackIcon, ChallengeIcon, EditIcon, PenIcon, SparkleIcon } from './icons';

interface Props {
  /** Nur die eigenen Zeichnungen des Kindes. */
  drawings: CustomMotif[];
  /** Eigene Herausforderungen des Kindes, je Zeichnung (Motiv-ID). */
  challenges: Record<string, Challenge>;
  answers: Record<string, ChallengeAnswers>;
  /** Zeichnung, zu der gerade eine Herausforderung entsteht. */
  busyId: string | null;
  /** Nach dem Ändern eines Bildes mit Herausforderung: neu erstellen? */
  askRegenerate: CustomMotif | null;
  onRegenerate: (m: CustomMotif, yes: boolean) => void;
  onNew: () => void;
  onEdit: (m: CustomMotif) => void;
  onCreate: (m: CustomMotif) => void;
  onPlay: (c: Challenge) => void;
  onEditChallenge: (c: Challenge) => void;
  onBack: () => void;
}

/** Eigene Herausforderungen eines Kindes: Bilder zeichnen und daraus Herausforderungen machen. */
export function KidDrawings(props: Props) {
  const { drawings, challenges, answers, busyId, askRegenerate, onRegenerate, onNew, onEdit, onCreate, onPlay, onEditChallenge, onBack } = props;
  const [chosen, setChosen] = useState<CustomMotif | null>(null);
  const challenge = chosen ? challenges[chosen.id] : undefined;
  const act = (f: () => void) => {
    setChosen(null);
    f();
  };

  return (
    <div className="list-screen">
      <div className="list-top">
        <button className="tool-btn" aria-label="Zurück" onClick={onBack}>
          <BackIcon />
        </button>
      </div>
      <div className="motif-grid" role="list" aria-label="Meine Bilder">
        <button className="motif-tile add-motif" aria-label="Neues Bild zeichnen" onClick={onNew}>
          <PenIcon size={56} />
          <span>Neues Bild</span>
        </button>
        {drawings.map((m) => {
          const c = challenges[m.id];
          const done = c ? c.targets.filter((t) => answers[c.id]?.[t.id]).length : 0;
          return (
            <button key={m.id} className="motif-tile kid-drawing" role="listitem" aria-label={`${m.name} auswählen`} onClick={() => setChosen(m)} disabled={busyId !== null}>
              <img src={m.image} alt="" />
              {c && (
                <span className="challenge-badge" aria-label={`Herausforderung: ${done} von ${c.targets.length} bearbeitet`}>
                  <ChallengeIcon size={20} /> {done}/{c.targets.length}
                </span>
              )}
              {busyId === m.id && (
                <span className="tile-busy" aria-label="Herausforderung entsteht">
                  <span className="spinner" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {chosen && (
        <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label="Was möchtest du tun?" onClick={() => setChosen(null)}>
          <div className="dialog kid-actions" onClick={(e) => e.stopPropagation()}>
            <img className="kid-actions-img" src={chosen.image} alt="" />
            <div className="kid-action-row">
              <button className="kid-action" onClick={() => act(() => onEdit(chosen))}>
                <PenIcon size={56} />
                <span>Bild ändern</span>
              </button>
              {challenge ? (
                <>
                  <button className="kid-action primary" onClick={() => act(() => onPlay(challenge))}>
                    <ChallengeIcon size={56} />
                    <span>Spielen</span>
                  </button>
                  <button className="kid-action" onClick={() => act(() => onEditChallenge(challenge))}>
                    <EditIcon size={56} />
                    <span>Herausforderung ändern</span>
                  </button>
                </>
              ) : (
                <button className="kid-action primary" onClick={() => act(() => onCreate(chosen))}>
                  <SparkleIcon size={56} />
                  <span>Herausforderung machen</span>
                </button>
              )}
            </div>
            <button className="text-btn" onClick={() => setChosen(null)}>
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {askRegenerate && (
        <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label="Herausforderung neu machen?">
          <div className="dialog kid-actions">
            <img className="kid-actions-img" src={askRegenerate.image} alt="" />
            <p className="kid-question">Dein Bild ist neu. Herausforderung neu machen?</p>
            <div className="kid-action-row">
              <button className="kid-action primary" onClick={() => onRegenerate(askRegenerate, true)}>
                <SparkleIcon size={56} />
                <span>Ja, neu machen</span>
              </button>
              <button className="kid-action" onClick={() => onRegenerate(askRegenerate, false)}>
                <ChallengeIcon size={56} />
                <span>Nein, alte behalten</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
