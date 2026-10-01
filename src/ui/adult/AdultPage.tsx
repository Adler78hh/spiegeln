import type { ReactNode } from 'react';
import { BackIcon } from '../icons';

/** Rahmen einer Unterseite im Erwachsenenbereich. */
export function AdultPage({ title, onBack, actions, children }: { title: string; onBack: () => void; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="adult-screen">
      <header className="adult-header">
        <button className="tool-btn" aria-label="Zurück" onClick={onBack}>
          <BackIcon />
        </button>
        <h1>{title}</h1>
        <div className="adult-actions">{actions}</div>
      </header>
      <div className="adult-body">{children}</div>
    </div>
  );
}

/** Bestätigung im Seiteninhalt (statt Browser-Dialog). */
export function ConfirmRow({ text, confirmLabel, onConfirm, onCancel }: { text: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="confirm-row" role="alertdialog">
      <span>{text}</span>
      <button className="text-btn danger" onClick={onConfirm}>
        {confirmLabel}
      </button>
      <button className="text-btn" onClick={onCancel}>
        Abbrechen
      </button>
    </div>
  );
}
