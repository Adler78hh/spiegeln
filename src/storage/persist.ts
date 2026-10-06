/**
 * Dauerhafter Speicher: Ohne ihn darf der Browser die Daten bei Platzmangel
 * oder (Safari) nach einer Woche ohne Nutzung löschen. Auf dem Home-Bildschirm
 * installierte Apps sind davon ausgenommen.
 */
export async function requestPersistence(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

/** Läuft die App vom Home-Bildschirm (installiert) statt im Browser-Tab? */
export function isInstalled(): boolean {
  try {
    return window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
  } catch {
    return false;
  }
}
