import { useState } from 'react';
import { unsolvableCount, type Challenge } from '../../challenges/types';
import type { MotifInfo } from '../../motifs/library';
import { EditIcon, PlusIcon, TrashIcon } from '../icons';
import { AdultPage, ConfirmRow } from './AdultPage';

export interface ManagedChallenge extends Challenge {
  builtin: boolean;
}

interface Props {
  challenges: ManagedChallenge[];
  motifs: MotifInfo[];
  onNew: (motifId: string) => void;
  onEdit: (c: ManagedChallenge) => void;
  onDelete: (id: string) => Promise<void>;
  onBack: () => void;
}

/** Liste der Herausforderungen; eigene lassen sich bearbeiten und löschen. */
export function ChallengeManager({ challenges, motifs, onNew, onEdit, onDelete, onBack }: Props) {
  const [picking, setPicking] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const motifOf = (id: string) => motifs.find((m) => m.id === id);

  if (picking) {
    return (
      <AdultPage title="Startfigur wählen" onBack={() => setPicking(false)}>
        <div className="motif-pick-grid">
          {motifs.map((m) => (
            <button key={m.id} className="motif-btn" aria-label={m.name} onClick={() => onNew(m.id)}>
              <img src={m.src} alt="" />
              <span>{m.name}</span>
            </button>
          ))}
        </div>
      </AdultPage>
    );
  }

  return (
    <AdultPage
      title="Herausforderungen"
      onBack={onBack}
      actions={
        <button className="text-btn primary" onClick={() => setPicking(true)}>
          <PlusIcon size={22} /> Neue Herausforderung
        </button>
      }
    >
      <ul className="manage-list">
        {challenges.map((c) => (
          <li key={c.id} className="manage-row">
            {motifOf(c.motifId) && <img className="motif-thumb" src={motifOf(c.motifId)!.src} alt="" />}
            <strong className="row-title">{c.name}</strong>
            <span className="row-meta">
              {c.targets.length} Figuren, {unsolvableCount(c)} unlösbar{c.builtin ? ' · vorinstalliert' : ''}
            </span>
            {!c.builtin && (
              <>
                <button className="tool-btn" aria-label={`${c.name} bearbeiten`} onClick={() => onEdit(c)}>
                  <EditIcon />
                </button>
                <button className="tool-btn" aria-label={`${c.name} löschen`} onClick={() => setConfirmId(c.id)}>
                  <TrashIcon />
                </button>
              </>
            )}
            {confirmId === c.id && (
              <ConfirmRow
                text={`„${c.name}“ mit allen Antworten der Kinder löschen?`}
                confirmLabel="Löschen"
                onConfirm={async () => {
                  await onDelete(c.id);
                  setConfirmId(null);
                }}
                onCancel={() => setConfirmId(null)}
              />
            )}
          </li>
        ))}
      </ul>
    </AdultPage>
  );
}
