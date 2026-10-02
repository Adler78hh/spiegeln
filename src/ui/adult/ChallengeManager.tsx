import { useState } from 'react';
import { unsolvableCount, type Challenge } from '../../challenges/types';
import type { MotifInfo } from '../../motifs/library';
import { EditIcon, PenIcon, PhotoIcon, PlusIcon, TrashIcon } from '../icons';
import { AdultPage, ConfirmRow } from './AdultPage';

export interface ManagedChallenge extends Challenge {
  builtin: boolean;
}

interface Props {
  challenges: ManagedChallenge[];
  motifs: MotifInfo[];
  onNew: (motifId: string) => void;
  /** Startfigur-Auswahl offen? (von außen gesteuert, bleibt beim Motiv-Anlegen erhalten) */
  picking: boolean;
  onPickingChange: (v: boolean) => void;
  /** Eigenes Motiv anlegen (Foto oder Zeichnung). */
  onCreateMotif: () => void;
  /** Zuletzt angelegtes Motiv (wird hervorgehoben). */
  highlightMotifId?: string | null;
  onEdit: (c: ManagedChallenge) => void;
  onDelete: (id: string) => Promise<void>;
  onBack: () => void;
}

/** Liste der Herausforderungen; eigene lassen sich bearbeiten und löschen. */
export function ChallengeManager(props: Props) {
  const { challenges, motifs, onNew, onEdit, onDelete, onBack, picking, onPickingChange: setPicking, onCreateMotif, highlightMotifId } = props;
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const motifOf = (id: string) => motifs.find((m) => m.id === id);
  // Eigene Motive zuerst, das neueste vorne.
  const custom = motifs.filter((m) => !m.builtin).reverse();
  const builtin = motifs.filter((m) => m.builtin && !m.hidden);

  if (picking) {
    return (
      <AdultPage title="Startfigur wählen" onBack={() => setPicking(false)}>
        <button className="create-motif-btn" onClick={onCreateMotif}>
          <span className="create-motif-icons">
            <PhotoIcon size={44} />
            <PenIcon size={40} />
          </span>
          <span className="create-motif-text">
            <strong>Eigenes Motiv anlegen</strong>
            <span>Foto aufnehmen, aus der Galerie wählen oder selbst zeichnen</span>
          </span>
        </button>

        <h2 className="pick-heading">Eigene Motive</h2>
        {custom.length === 0 ? (
          <p className="empty">Noch keine eigenen Motive. Mit dem Knopf oben eines anlegen.</p>
        ) : (
          <div className="motif-pick-grid">
            {custom.map((m) => (
              <PickTile key={m.id} motif={m} highlight={m.id === highlightMotifId} onPick={onNew} />
            ))}
          </div>
        )}

        <h2 className="pick-heading">Vorinstallierte Motive</h2>
        <div className="motif-pick-grid">
          {builtin.map((m) => (
            <PickTile key={m.id} motif={m} onPick={onNew} />
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

function PickTile({ motif, highlight, onPick }: { motif: MotifInfo; highlight?: boolean; onPick: (id: string) => void }) {
  return (
    <button className={`motif-btn ${highlight ? 'selected new' : ''}`} aria-label={motif.name} onClick={() => onPick(motif.id)}>
      {highlight && <span className="new-badge">Neu</span>}
      <img src={motif.src} alt="" />
      <span>{motif.name}</span>
    </button>
  );
}
