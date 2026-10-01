import { useState } from 'react';
import type { Challenge } from '../../challenges/types';
import type { CustomMotif, Store } from '../../storage/store';
import { PlusIcon, TrashIcon } from '../icons';
import { AdultPage, ConfirmRow } from './AdultPage';

interface Props {
  store: Store;
  motifs: CustomMotif[];
  challenges: Challenge[];
  onChange: (m: CustomMotif[]) => void;
  onCreate: () => void;
  onBack: () => void;
}

/** Eigene Motive umbenennen und löschen. */
export function MotifManager({ store, motifs, challenges, onChange, onCreate, onBack }: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const reload = async () => onChange(await store.listMotifs());

  return (
    <AdultPage
      title="Eigene Motive"
      onBack={onBack}
      actions={
        <button className="text-btn primary" onClick={onCreate}>
          <PlusIcon size={22} /> Neues Motiv
        </button>
      }
    >
      {motifs.length === 0 && <p className="empty">Noch keine eigenen Motive. Mit „Neues Motiv“ ein Foto oder eine Zeichnung anlegen.</p>}
      <ul className="manage-list">
        {motifs.map((m) => {
          const usedIn = challenges.filter((c) => c.motifId === m.id);
          return (
            <li key={m.id} className="manage-row">
              <img className="motif-thumb" src={m.image} alt="" />
              <input
                id={`motif-name-${m.id}`}
                className="name-input"
                defaultValue={m.name}
                maxLength={30}
                aria-label="Name"
                onBlur={async (e) => {
                  if (e.target.value.trim() && e.target.value.trim() !== m.name) {
                    await store.renameMotif(m.id, e.target.value);
                    await reload();
                  }
                }}
                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              />
              <span className="row-meta">{m.source === 'photo' ? 'Foto' : 'Zeichnung'}</span>
              <button className="tool-btn" aria-label={`${m.name} löschen`} onClick={() => setConfirmId(m.id)}>
                <TrashIcon />
              </button>
              {confirmId === m.id &&
                (usedIn.length ? (
                  <ConfirmRow
                    text={`Wird in ${usedIn.map((c) => `„${c.name}“`).join(', ')} verwendet. Bitte zuerst diese Herausforderung löschen.`}
                    confirmLabel="Verstanden"
                    onConfirm={() => setConfirmId(null)}
                    onCancel={() => setConfirmId(null)}
                  />
                ) : (
                  <ConfirmRow
                    text={`Motiv „${m.name}“ löschen?`}
                    confirmLabel="Löschen"
                    onConfirm={async () => {
                      await store.deleteMotif(m.id);
                      setConfirmId(null);
                      await reload();
                    }}
                    onCancel={() => setConfirmId(null)}
                  />
                ))}
            </li>
          );
        })}
      </ul>
    </AdultPage>
  );
}
