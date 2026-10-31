import { useState } from 'react';
import type { Challenge } from '../../challenges/types';
import { PrintIcon } from '../icons';
import { downloadWorksheet } from './Worksheet';

/** Einheitlicher Knopf „Arbeitsblatt drucken“: erzeugt eine PDF-Datei. */
export function WorksheetButton({ challenge, figure }: { challenge: Challenge; figure: string | undefined }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="text-btn worksheet-btn"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await downloadWorksheet(challenge, figure);
        } catch (e) {
          console.error(e);
        } finally {
          setBusy(false);
        }
      }}
    >
      <PrintIcon size={22} /> {busy ? 'Erzeuge PDF …' : 'Arbeitsblatt drucken'}
    </button>
  );
}
