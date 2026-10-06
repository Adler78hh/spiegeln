/**
 * Lokale Speicherung im Gerät (IndexedDB). Keine Daten verlassen das Gerät.
 *
 * Stores:
 * - groups:     Gruppen (z. B. Klassen), jede mit eigener Farbe
 * - profiles:   Profile der Kinder, jedes in genau einer Gruppe
 * - answers:    Eingaben pro Profil × Herausforderung × Zielfigur
 * - snapshots:  gemerkte Figuren aus dem freien Spiegeln, pro Profil
 * - photos:     Sicherungen (Fotoapparat) pro Profil × Herausforderung × Zielfigur
 * - challenges: Herausforderungen (vorinstalliert und selbst erstellt)
 */
import { GRATIS } from '../edition';
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Answer, Challenge, ChallengeAnswers } from '../challenges/types';
import type { Scene } from '../geometry';
import type { InvertMode } from '../render/composite';
import { ANIMAL_ORDER, ANIMALS, DEFAULT_ANIMALS, type Animal, type AnimalId } from '../profiles/animals';
import { findColor } from '../profiles/colors';

export interface ToolPrefs {
  snap: boolean;
  showOutline: boolean;
  /** Spiegelachse ausblenden (Anfasspunkte bleiben sichtbar). */
  hideLine: boolean;
  /** Farbumkehr im freien Spiegeln. */
  invert: InvertMode;
  /** Farbe der zweifarbigen Umkehr (neben Schwarz). */
  invertColor: string;
}

export const DEFAULT_PREFS: ToolPrefs = { snap: false, showOutline: false, hideLine: false, invert: 'none', invertColor: '#f28c28' };

export interface Group {
  id: string;
  name: string;
  /** Farbe (siehe GROUP_COLORS), nach dem Anlegen fest. */
  color: string;
  order: number;
  createdAt: number;
  /** Für diese Gruppe ausgeblendete Herausforderungen (neue sind sichtbar). */
  hiddenChallenges?: string[];
}

export interface Profile {
  id: string;
  groupId: string;
  name: string;
  /** Tier im Profilbild; null = Anfangsbuchstaben des Namens. */
  animal: AnimalId | null;
  /** Reihenfolge in der Profilauswahl. */
  order: number;
  prefs: ToolPrefs;
  createdAt: number;
}

export interface Snapshot {
  id: string;
  profileId: string;
  motifId: string;
  scene: Scene;
  /** Bild der Figur (Daten-URL). */
  image: string;
  createdAt: number;
}

/** Sicherung einer Zielfigur: Lage von Figur und Spiegel samt Bild. */
export interface Photo {
  scene: Scene;
  /** Spiegelergebnis (Daten-URL), gleicher Ausschnitt wie die Zielfigur. */
  image: string;
  createdAt: number;
}

/** Sicherungen einer Herausforderung: Zielfigur-ID → Sicherung. */
export type ChallengePhotos = Record<string, Photo>;

export interface PhotoRecord extends Photo {
  profileId: string;
  challengeId: string;
  targetId: string;
}

/** Eigenes Motiv (Foto oder Zeichnung), für alle Profile sichtbar. */
export interface CustomMotif {
  id: string;
  name: string;
  source: 'photo' | 'drawing';
  /** Bild als Daten-URL (Foto: JPEG, Zeichnung: PNG mit Transparenz). */
  image: string;
  width: number;
  height: number;
  createdAt: number;
}

export interface AnswerRecord extends Answer {
  profileId: string;
  challengeId: string;
  targetId: string;
}

interface SpiegelnSchema extends DBSchema {
  groups: { key: string; value: Group };
  profiles: { key: string; value: Profile };
  answers: {
    key: [string, string, string];
    value: AnswerRecord;
    indexes: { byProfile: string };
  };
  snapshots: { key: string; value: Snapshot; indexes: { byProfile: string } };
  photos: {
    key: [string, string, string];
    value: PhotoRecord;
    indexes: { byProfile: string };
  };
  challenges: { key: string; value: StoredChallenge };
  motifs: { key: string; value: CustomMotif };
}

type StoredChallenge = Challenge & { builtin: boolean; order: number };

/**
 * Datensicherung als Datei: alles außer den mitgelieferten Herausforderungen
 * (die erzeugt die App selbst; von ihnen steht nur die Version darin, damit
 * Antworten zu inzwischen geänderten Herausforderungen nicht falsch zugeordnet werden).
 */
export interface Backup {
  app: 'spiegeln';
  format: 1;
  edition: 'full' | 'gratis';
  createdAt: number;
  groups: Group[];
  profiles: Profile[];
  answers: AnswerRecord[];
  photos: PhotoRecord[];
  snapshots: Snapshot[];
  motifs: CustomMotif[];
  /** Selbst erstellte Herausforderungen. */
  challenges: StoredChallenge[];
  /** Mitgelieferte Herausforderungen: ID → Version. */
  builtinVersions: Record<string, number | null>;
}

/**
 * Prüft eine eingelesene Sicherungsdatei. Wirft einen Fehler mit einem
 * verständlichen Text, wenn sie nicht passt.
 */
export function checkBackup(raw: unknown, gratis: boolean): Backup {
  const b = raw as Partial<Backup> | null;
  if (!b || b.app !== 'spiegeln' || typeof b.format !== 'number') throw new Error('Das ist keine Sicherungsdatei von Spiegeln.');
  if (b.format > 1) throw new Error('Diese Sicherung stammt aus einer neueren Version der App. Bitte die App zuerst aktualisieren.');
  const lists = ['groups', 'profiles', 'answers', 'photos', 'snapshots', 'motifs', 'challenges'] as const;
  if (lists.some((k) => !Array.isArray(b[k])) || typeof b.builtinVersions !== 'object') throw new Error('Die Sicherungsdatei ist unvollständig.');
  if (gratis && b.edition !== 'gratis') throw new Error('Eine Sicherung der Vollversion lässt sich in der Gratisversion nicht wiederherstellen.');
  if (b.groups!.length === 0) throw new Error('Die Sicherung enthält keine Gruppe.');
  return b as Backup;
}

/** Eigene Datenbank je Ausgabe: Gratis- und Vollversion teilen sich keine Daten. */
export const DB_NAME = GRATIS ? 'spiegeln-gratis' : 'spiegeln';
const DB_VERSION = 4;

export function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export class Store {
  private constructor(private db: IDBPDatabase<SpiegelnSchema>) {}

  static async open(name = DB_NAME, onOutdated?: () => void): Promise<Store> {
    const db = await openDB<SpiegelnSchema>(name, DB_VERSION, {
      // Eine neuere App-Version (z. B. in einem zweiten Fenster) will die
      // Datenbank umbauen: diese Verbindung freigeben, sonst wartet sie ewig.
      blocking() {
        db.close();
        onOutdated?.();
      },
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('profiles', { keyPath: 'id' });
          const answers = db.createObjectStore('answers', { keyPath: ['profileId', 'challengeId', 'targetId'] });
          answers.createIndex('byProfile', 'profileId');
          const snaps = db.createObjectStore('snapshots', { keyPath: 'id' });
          snaps.createIndex('byProfile', 'profileId');
          db.createObjectStore('challenges', { keyPath: 'id' });
        }
        if (oldVersion < 2) {
          db.createObjectStore('motifs', { keyPath: 'id' });
        }
        if (oldVersion < 3) {
          db.createObjectStore('groups', { keyPath: 'id' });
        }
        if (oldVersion < 4) {
          const photos = db.createObjectStore('photos', { keyPath: ['profileId', 'challengeId', 'targetId'] });
          photos.createIndex('byProfile', 'profileId');
        }
      },
    });
    return new Store(db);
  }

  close(): void {
    this.db.close();
  }

  // ---------- Datensicherung ----------

  async exportBackup(): Promise<Backup> {
    const challenges = await this.db.getAll('challenges');
    return {
      app: 'spiegeln',
      format: 1,
      edition: GRATIS ? 'gratis' : 'full',
      createdAt: Date.now(),
      groups: await this.db.getAll('groups'),
      profiles: await this.db.getAll('profiles'),
      answers: await this.db.getAll('answers'),
      photos: await this.db.getAll('photos'),
      snapshots: await this.db.getAll('snapshots'),
      motifs: await this.db.getAll('motifs'),
      challenges: challenges.filter((c) => !c.builtin),
      builtinVersions: Object.fromEntries(challenges.filter((c) => c.builtin).map((c) => [c.id, c.version ?? null])),
    };
  }

  /**
   * Ersetzt alle Daten dieses Geräts durch die Sicherung. Mitgelieferte
   * Herausforderungen bleiben die des Geräts; Antworten und Sicherungen zu
   * ihnen kommen nur mit, wenn die Version gleich ist.
   */
  async importBackup(b: Backup): Promise<void> {
    const deviceBuiltins = (await this.db.getAll('challenges')).filter((c) => c.builtin);
    const customIds = new Set(b.challenges.map((c) => c.id));
    const sameVersion = new Set(deviceBuiltins.filter((c) => (c.version ?? null) === b.builtinVersions[c.id]).map((c) => c.id));
    const keep = (challengeId: string) => customIds.has(challengeId) || sameVersion.has(challengeId);

    const stores = ['groups', 'profiles', 'answers', 'photos', 'snapshots', 'motifs', 'challenges'] as const;
    const tx = this.db.transaction(stores, 'readwrite');
    for (const s of stores) if (s !== 'challenges') await tx.objectStore(s).clear();
    const ch = tx.objectStore('challenges');
    let cursor = await ch.openCursor();
    while (cursor) {
      if (!cursor.value.builtin) await cursor.delete();
      cursor = await cursor.continue();
    }
    for (const g of b.groups) await tx.objectStore('groups').put(g);
    for (const p of b.profiles) await tx.objectStore('profiles').put(p);
    for (const a of b.answers) if (keep(a.challengeId)) await tx.objectStore('answers').put(a);
    for (const p of b.photos) if (keep(p.challengeId)) await tx.objectStore('photos').put(p);
    for (const s of b.snapshots) await tx.objectStore('snapshots').put(s);
    for (const m of b.motifs) await tx.objectStore('motifs').put(m);
    for (const c of b.challenges) await ch.put({ ...c, builtin: false });
    await tx.done;
  }

  // ---------- Gruppen ----------

  async listGroups(): Promise<Group[]> {
    const all = await this.db.getAll('groups');
    return all.sort((a, b) => a.order - b.order || a.createdAt - b.createdAt);
  }

  /**
   * Beim ersten Start: Gruppe „Weiß“ mit den ersten Tierprofilen (10, in der
   * Gratisversion alle). Profile aus älteren Versionen (noch ohne Gruppe)
   * kommen in die erste Gruppe.
   */
  async ensureDefaults(animals: Animal[] = DEFAULT_ANIMALS): Promise<{ groups: Group[]; profiles: Profile[] }> {
    let groups = await this.listGroups();
    if (groups.length === 0) {
      const weiss = findColor('weiss');
      const group: Group = { id: newId(), name: weiss.name, color: weiss.id, order: 0, createdAt: Date.now() };
      await this.db.put('groups', group);
      groups = [group];
      if ((await this.db.count('profiles')) === 0) {
        await this.addProfiles(group.id, animals.map((a) => a.id), 0);
      }
    }
    const tx = this.db.transaction('profiles', 'readwrite');
    let cursor = await tx.store.openCursor();
    while (cursor) {
      if (!cursor.value.groupId) await cursor.update({ ...cursor.value, groupId: groups[0].id });
      cursor = await cursor.continue();
    }
    await tx.done;
    return { groups, profiles: await this.listProfiles() };
  }

  /** Neue Gruppe mit den ersten `count` Tieren in fester Reihenfolge. */
  async createGroup(name: string, color: string, count: number): Promise<Group> {
    const groups = await this.listGroups();
    const order = groups.reduce((m, g) => Math.max(m, g.order), -1) + 1;
    const group: Group = { id: newId(), name: name.trim() || findColor(color).name, color, order, createdAt: Date.now() };
    await this.db.put('groups', group);
    const n = Math.max(1, Math.min(ANIMAL_ORDER.length, Math.round(count)));
    await this.addProfiles(group.id, ANIMAL_ORDER.slice(0, n).map((a) => a.id), 0);
    return group;
  }

  async renameGroup(id: string, name: string): Promise<void> {
    const g = await this.db.get('groups', id);
    if (g && name.trim()) await this.db.put('groups', { ...g, name: name.trim() });
  }

  /** Legt fest, welche Herausforderungen die Kinder der Gruppe nicht sehen. */
  async setHiddenChallenges(id: string, hidden: string[]): Promise<void> {
    const g = await this.db.get('groups', id);
    if (g) await this.db.put('groups', { ...g, hiddenChallenges: hidden });
  }

  async recolorGroup(id: string, color: string, name: string): Promise<void> {
    const g = await this.db.get('groups', id);
    if (g) await this.db.put('groups', { ...g, color, name: name.trim() || g.name });
  }

  /** Löscht eine Gruppe mit allen Kindern, Antworten und Schnappschüssen. */
  async deleteGroup(id: string): Promise<void> {
    const profiles = (await this.listProfiles()).filter((p) => p.groupId === id);
    for (const p of profiles) await this.deleteProfile(p.id);
    await this.db.delete('groups', id);
  }

  // ---------- Profile ----------

  async listProfiles(): Promise<Profile[]> {
    const all = await this.db.getAll('profiles');
    // Ältere Profile kennen neuere Einstellungen noch nicht → Standardwerte ergänzen.
    return all
      .map((p) => ({ ...p, prefs: { ...DEFAULT_PREFS, ...p.prefs } }))
      .sort((a, b) => a.order - b.order || a.createdAt - b.createdAt);
  }

  private async addProfiles(groupId: string, animals: AnimalId[], firstOrder: number): Promise<void> {
    const tx = this.db.transaction('profiles', 'readwrite');
    const now = Date.now();
    await Promise.all(
      animals.map((a, i) =>
        tx.store.put({ id: newId(), groupId, name: ANIMALS[a].name, animal: a, order: firstOrder + i, prefs: DEFAULT_PREFS, createdAt: now + i }),
      ),
    );
    await tx.done;
  }

  async createProfile(groupId: string, name: string, animal: AnimalId | null): Promise<Profile> {
    const profiles = (await this.listProfiles()).filter((p) => p.groupId === groupId);
    const order = profiles.reduce((m, p) => Math.max(m, p.order), -1) + 1;
    const profile: Profile = { id: newId(), groupId, name: name.trim(), animal, order, prefs: DEFAULT_PREFS, createdAt: Date.now() };
    await this.db.put('profiles', profile);
    return profile;
  }

  async updateProfile(id: string, change: Partial<Pick<Profile, 'name' | 'animal' | 'prefs' | 'order'>>): Promise<Profile> {
    const p = await this.db.get('profiles', id);
    if (!p) throw new Error('Profil nicht gefunden');
    const next = { ...p, ...change, name: (change.name ?? p.name).trim() };
    await this.db.put('profiles', next);
    return next;
  }

  /** Löscht ein Profil mit allen Antworten und Schnappschüssen. */
  async deleteProfile(id: string): Promise<void> {
    await this.clearProfile(id, true);
  }

  /**
   * Setzt ein Profil zurück: Antworten und Schnappschüsse weg, der Name
   * wieder der Tiername (Gratisversion: Profile bleiben immer erhalten).
   */
  async resetProfile(id: string): Promise<void> {
    await this.clearProfile(id, false);
    const p = await this.db.get('profiles', id);
    if (p?.animal) await this.db.put('profiles', { ...p, name: ANIMALS[p.animal].name });
  }

  private async clearProfile(id: string, removeProfile: boolean): Promise<void> {
    const tx = this.db.transaction(['profiles', 'answers', 'snapshots', 'photos'], 'readwrite');
    if (removeProfile) await tx.objectStore('profiles').delete(id);
    for (const store of ['answers', 'snapshots', 'photos'] as const) {
      const index = tx.objectStore(store).index('byProfile');
      let cursor = await index.openCursor(IDBKeyRange.only(id));
      while (cursor) {
        await cursor.delete();
        cursor = await cursor.continue();
      }
    }
    await tx.done;
  }

  // ---------- Antworten ----------

  /** Alle Antworten eines Profils: Herausforderung → Zielfigur → Antwort. */
  async getAnswers(profileId: string): Promise<Record<string, ChallengeAnswers>> {
    const records = await this.db.getAllFromIndex('answers', 'byProfile', profileId);
    const out: Record<string, ChallengeAnswers> = {};
    for (const { profileId: _p, challengeId, targetId, ...answer } of records) {
      (out[challengeId] ??= {})[targetId] = answer;
    }
    return out;
  }

  async saveAnswer(profileId: string, challengeId: string, targetId: string, answer: Answer): Promise<void> {
    await this.db.put('answers', { ...answer, profileId, challengeId, targetId });
  }

  /** Entfernt alle Antworten und Sicherungen aller Profile zu einer Herausforderung. */
  async deleteAnswersForChallenge(challengeId: string): Promise<void> {
    const tx = this.db.transaction(['answers', 'photos'], 'readwrite');
    for (const store of ['answers', 'photos'] as const) {
      let cursor = await tx.objectStore(store).openCursor();
      while (cursor) {
        if (cursor.value.challengeId === challengeId) await cursor.delete();
        cursor = await cursor.continue();
      }
    }
    await tx.done;
  }

  // ---------- Sicherungen (Fotoapparat) ----------

  /** Alle Sicherungen eines Profils: Herausforderung → Zielfigur → Sicherung. */
  async getPhotos(profileId: string): Promise<Record<string, ChallengePhotos>> {
    const records = await this.db.getAllFromIndex('photos', 'byProfile', profileId);
    const out: Record<string, ChallengePhotos> = {};
    for (const { profileId: _p, challengeId, targetId, ...photo } of records) {
      (out[challengeId] ??= {})[targetId] = photo;
    }
    return out;
  }

  async savePhoto(profileId: string, challengeId: string, targetId: string, photo: Photo): Promise<void> {
    await this.db.put('photos', { ...photo, profileId, challengeId, targetId });
  }

  async deletePhoto(profileId: string, challengeId: string, targetId: string): Promise<void> {
    await this.db.delete('photos', [profileId, challengeId, targetId]);
  }

  // ---------- Schnappschüsse ----------

  async listSnapshots(profileId: string): Promise<Snapshot[]> {
    const all = await this.db.getAllFromIndex('snapshots', 'byProfile', profileId);
    return all.sort((a, b) => b.createdAt - a.createdAt);
  }

  async addSnapshot(s: Omit<Snapshot, 'id' | 'createdAt'>): Promise<Snapshot> {
    const snap: Snapshot = { ...s, id: newId(), createdAt: Date.now() };
    await this.db.put('snapshots', snap);
    return snap;
  }

  async deleteSnapshot(id: string): Promise<void> {
    await this.db.delete('snapshots', id);
  }

  // ---------- Eigene Motive ----------

  async listMotifs(): Promise<CustomMotif[]> {
    const all = await this.db.getAll('motifs');
    return all.sort((a, b) => a.createdAt - b.createdAt);
  }

  async addMotif(m: Omit<CustomMotif, 'id' | 'createdAt'>): Promise<CustomMotif> {
    const motif: CustomMotif = { ...m, id: `eigen-${newId()}`, createdAt: Date.now() };
    await this.db.put('motifs', motif);
    return motif;
  }

  async renameMotif(id: string, name: string): Promise<void> {
    const m = await this.db.get('motifs', id);
    if (m) await this.db.put('motifs', { ...m, name: name.trim() || m.name });
  }

  async deleteMotif(id: string): Promise<void> {
    await this.db.delete('motifs', id);
  }

  // ---------- Herausforderungen ----------

  async listChallenges(): Promise<Array<Challenge & { builtin: boolean }>> {
    const all = await this.db.getAll('challenges');
    return all.sort((a, b) => a.order - b.order).map(({ order: _o, ...c }) => c);
  }

  async saveChallenge(c: Challenge, builtin: boolean, order: number): Promise<void> {
    await this.db.put('challenges', { ...c, builtin, order });
  }

  /** Löscht eine Herausforderung mit allen Antworten dazu. */
  async deleteChallenge(id: string): Promise<void> {
    await this.db.delete('challenges', id);
    await this.deleteAnswersForChallenge(id);
  }
}
