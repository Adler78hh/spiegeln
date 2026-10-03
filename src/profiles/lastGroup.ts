import { GRATIS, ZERLEGEN } from '../edition';

/** Zuletzt gewählte Gruppe, nur auf diesem Gerät (eigener Eintrag je Ausgabe). */
const GROUP_KEY = ZERLEGEN ? 'zerlegen.gruppe' : GRATIS ? 'spiegeln-gratis.gruppe' : 'spiegeln.gruppe';

export function loadGroupId(): string | null {
  try {
    return localStorage.getItem(GROUP_KEY);
  } catch {
    return null;
  }
}

export function saveGroupId(id: string) {
  try {
    localStorage.setItem(GROUP_KEY, id);
  } catch {
    // Ohne Speicher gilt die Wahl nur bis zum Neuladen.
  }
}
