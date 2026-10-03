import type { ReactNode } from 'react';

export interface AdultTile<S extends string> {
  id: S;
  label: string;
  icon: ReactNode;
  hint: string;
}

interface Props<S extends string> {
  /** Bereiche des Erwachsenenbereichs (je App verschieden). */
  tiles: readonly AdultTile<S>[];
  onOpen: (s: S) => void;
  onExit: () => void;
}

/** Startseite des Erwachsenenbereichs. */
export function AdultHome<S extends string>({ tiles, onOpen, onExit }: Props<S>) {
  return (
    <div className="adult-screen">
      <header className="adult-header">
        <h1>Erwachsenenbereich</h1>
        <button className="text-btn primary" onClick={onExit}>
          Fertig
        </button>
      </header>
      <div className="adult-tiles">
        {tiles.map((t) => (
          <button key={t.id} className="adult-tile" onClick={() => onOpen(t.id)}>
            {t.icon}
            <strong>{t.label}</strong>
            <span>{t.hint}</span>
          </button>
        ))}
      </div>
      <p className="adult-note">Alle Daten bleiben auf diesem Gerät.</p>
    </div>
  );
}
