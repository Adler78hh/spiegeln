import type { ReactNode } from 'react';
import { ChallengeIcon, PeopleIcon, PhotoIcon } from '../icons';

export type AdultSection = 'groups' | 'motifs' | 'challenges';

interface Props {
  onOpen: (s: AdultSection) => void;
  onExit: () => void;
}

/** Startseite des Erwachsenenbereichs. */
export function AdultHome({ onOpen, onExit }: Props) {
  const tiles: Array<{ id: AdultSection; label: string; icon: ReactNode; hint: string }> = [
    { id: 'groups', label: 'Gruppen', icon: <PeopleIcon size={56} />, hint: 'Kinder und Ergebnisse je Gruppe' },
    { id: 'challenges', label: 'Herausforderungen', icon: <ChallengeIcon size={56} />, hint: 'Eigene erstellen und bearbeiten' },
    { id: 'motifs', label: 'Eigene Motive', icon: <PhotoIcon size={56} />, hint: 'Fotos und Zeichnungen verwalten' },
  ];
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
