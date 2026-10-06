import { useEffect, useRef, useState } from 'react';
import { GRATIS } from '../../edition';
import { checkBackup, type Backup, type Store } from '../../storage/store';
import { isInstalled, requestPersistence } from '../../storage/persist';
import { SaveIcon } from '../icons';
import { AdultPage, ConfirmRow } from './AdultPage';

const LAST_KEY = GRATIS ? 'spiegeln-gratis.letzteSicherung' : 'spiegeln.letzteSicherung';

const dateText = (ms: number) => new Date(ms).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });

function lastBackup(): number | null {
  try {
    const v = Number(localStorage.getItem(LAST_KEY));
    return v > 0 ? v : null;
  } catch {
    return null;
  }
}

/** Zustand des Speichers: dauerhaft? installiert? (für den Hinweis) */
export function useStorageSafety(): { persisted: boolean | null; installed: boolean } {
  const [persisted, setPersisted] = useState<boolean | null>(null);
  useEffect(() => {
    requestPersistence().then(setPersisted);
  }, []);
  return { persisted, installed: isInstalled() };
}

/** Hinweis, solange das Gerät die Daten irgendwann löschen dürfte. */
export function StorageHint() {
  const { persisted, installed } = useStorageSafety();
  if (persisted !== false || installed) return null;
  return (
    <p className="storage-hint">
      <strong>Tipp:</strong> Die App auf den Home-Bildschirm legen (iPad: Teilen → „Zum Home-Bildschirm“). Sonst kann der Browser die Daten
      löschen, wenn die App längere Zeit nicht benutzt wird. Zusätzlich regelmäßig eine Datensicherung speichern.
    </p>
  );
}

/** Datensicherung: alles in eine Datei speichern oder aus einer Datei wiederherstellen. */
export function BackupPage({ store, onBack }: { store: Store; onBack: () => void }) {
  const [last, setLast] = useState(lastBackup);
  const [pending, setPending] = useState<Backup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const backup = await store.exportBackup();
      const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${GRATIS ? 'spiegeln-gratis' : 'spiegeln'}-sicherung-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      try {
        localStorage.setItem(LAST_KEY, String(backup.createdAt));
      } catch {
        /* nicht schlimm */
      }
      setLast(backup.createdAt);
    } catch {
      setError('Die Sicherung konnte nicht gespeichert werden.');
    } finally {
      setBusy(false);
    }
  };

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      setPending(checkBackup(JSON.parse(await file.text()), GRATIS));
    } catch (e) {
      setError(e instanceof SyntaxError ? 'Das ist keine Sicherungsdatei von Spiegeln.' : (e as Error).message);
    }
  };

  const restore = async (b: Backup) => {
    setBusy(true);
    try {
      await store.importBackup(b);
      // Neu laden, damit alle Ansichten die wiederhergestellten Daten zeigen.
      window.location.reload();
    } catch {
      setError('Die Sicherung konnte nicht wiederhergestellt werden. Die bisherigen Daten sind unverändert.');
      setBusy(false);
      setPending(null);
    }
  };

  return (
    <AdultPage title="Datensicherung" onBack={onBack}>
      <StorageHint />
      <section className="backup-block">
        <h2>Sicherung speichern</h2>
        <p className="hint">
          Alle Gruppen, Kinder, Antworten, Fotoapparat-Sicherungen{GRATIS ? '' : ', gemerkten Figuren, eigenen Motive und Herausforderungen'} in einer Datei.
          Damit lassen sich die Daten auf ein anderes Gerät übertragen{GRATIS ? ' oder in die Vollversion übernehmen' : ''}.
        </p>
        <button className="text-btn primary" onClick={save} disabled={busy}>
          <SaveIcon size={22} /> Sicherung speichern
        </button>
        <p className="hint">{last ? `Letzte Sicherung auf diesem Gerät: ${dateText(last)}` : 'Auf diesem Gerät wurde noch keine Sicherung gespeichert.'}</p>
      </section>

      <section className="backup-block">
        <h2>Sicherung wiederherstellen</h2>
        <p className="hint">Ersetzt alle Daten auf diesem Gerät durch die Daten aus der Sicherungsdatei.</p>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(e) => {
            void pick(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <button className="text-btn" onClick={() => fileRef.current?.click()} disabled={busy}>
          Sicherungsdatei wählen …
        </button>
        {pending && (
          <ConfirmRow
            text={`Sicherung vom ${dateText(pending.createdAt)} (${pending.groups.length === 1 ? '1 Gruppe' : `${pending.groups.length} Gruppen`}, ${pending.profiles.length} Kinder) wiederherstellen? Alle jetzigen Daten auf diesem Gerät werden ersetzt.`}
            confirmLabel="Wiederherstellen"
            onConfirm={() => restore(pending)}
            onCancel={() => setPending(null)}
          />
        )}
      </section>
      {error && (
        <p className="backup-error" role="alert">
          {error}
        </p>
      )}
    </AdultPage>
  );
}
