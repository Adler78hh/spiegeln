import { useState } from 'react';
import type { Challenge, ChallengeAnswers } from '../challenges/types';
import type { CustomMotif, Profile } from '../storage/store';
import { ProfileImage } from './Avatar';
import { BackIcon, ChallengeEditIcon, ChallengeIcon, CheckIcon, PenIcon, SendIcon, SparkleIcon, TrashIcon } from './icons';

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
  /** Bekommene Herausforderungen (Posteingang) mit dem Bild ihrer Figur. */
  received: Array<{ challenge: Challenge; image: string }>;
  onDeleteReceived: (c: Challenge) => void;
  /** Andere Kinder der Gruppe zum Verschicken (fehlt, wenn ausgeschaltet). */
  classmates?: Profile[];
  onSend: (c: Challenge, to: Profile) => Promise<void>;
  onBack: () => void;
}

/** Eigene Herausforderungen eines Kindes: Bilder zeichnen und daraus Herausforderungen machen. */
export function KidDrawings(props: Props) {
  const { drawings, challenges, answers, busyId, askRegenerate, onRegenerate, onNew, onEdit, onCreate, onPlay, onEditChallenge, received, onDeleteReceived, classmates, onSend, onBack } = props;
  const [chosen, setChosen] = useState<CustomMotif | null>(null);
  const [chosenReceived, setChosenReceived] = useState<Challenge | null>(null);
  const [sending, setSending] = useState<Challenge | null>(null);
  const [sent, setSent] = useState<Profile | null>(null);
  const progress = (c: Challenge) => c.targets.filter((t) => answers[c.id]?.[t.id]).length;
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
          const done = c ? progress(c) : 0;
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
        {received.map(({ challenge: c, image }) => (
          <button key={c.id} className="motif-tile kid-drawing received" role="listitem" aria-label={`Von ${c.receivedFrom?.name}`} onClick={() => setChosenReceived(c)}>
            <img src={image} alt="" />
            <span className="from-badge">
              <ProfileImage profile={{ name: c.receivedFrom?.name ?? '', animal: (c.receivedFrom?.animal ?? null) as Profile['animal'] }} />
            </span>
            <span className="challenge-badge">
              <ChallengeIcon size={20} /> {progress(c)}/{c.targets.length}
            </span>
          </button>
        ))}
      </div>

      {sent && (
        <div className="sent-toast" role="status" onAnimationEnd={() => setSent(null)}>
          <CheckIcon size={28} /> <ProfileImage profile={sent} /> {sent.name}
        </div>
      )}

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
                    <ChallengeEditIcon size={56} />
                    <span>Herausforderung ändern</span>
                  </button>
                  {classmates && classmates.length > 0 && (
                    <button className="kid-action" onClick={() => act(() => setSending(challenge))}>
                      <SendIcon size={56} />
                      <span>Verschicken</span>
                    </button>
                  )}
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

      {chosenReceived && (
        <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label="Was möchtest du tun?" onClick={() => setChosenReceived(null)}>
          <div className="dialog kid-actions" onClick={(e) => e.stopPropagation()}>
            <span className="kid-from-line">
              <ProfileImage profile={{ name: chosenReceived.receivedFrom?.name ?? '', animal: (chosenReceived.receivedFrom?.animal ?? null) as Profile['animal'] }} />
              {chosenReceived.receivedFrom?.name}
            </span>
            <div className="kid-action-row">
              <button className="kid-action primary" onClick={() => {
                  setChosenReceived(null);
                  onPlay(chosenReceived);
                }}>
                <ChallengeIcon size={56} />
                <span>Spielen</span>
              </button>
              <button className="kid-action" onClick={() => {
                  setChosenReceived(null);
                  onDeleteReceived(chosenReceived);
                }}>
                <TrashIcon size={56} />
                <span>Löschen</span>
              </button>
            </div>
            <button className="text-btn" onClick={() => setChosenReceived(null)}>
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {sending && classmates && (
        <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label="An wen verschicken?" onClick={() => setSending(null)}>
          <div className="dialog kid-actions send-pick" onClick={(e) => e.stopPropagation()}>
            <SendIcon size={40} />
            <div className="classmates">
              {classmates.map((p) => (
                <button
                  key={p.id}
                  className="classmate"
                  aria-label={`An ${p.name} verschicken`}
                  onClick={async () => {
                    const c = sending;
                    setSending(null);
                    await onSend(c, p);
                    setSent(p);
                  }}
                >
                  <ProfileImage profile={p} />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
            <button className="text-btn" onClick={() => setSending(null)}>
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
