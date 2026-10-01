/**
 * Lokale Speicherung im Gerät (IndexedDB). Keine Daten verlassen das Gerät.
 *
 * Stores:
 * - profiles:   Profile der Kinder
 * - answers:    Eingaben pro Profil × Herausforderung × Zielfigur
 * - snapshots:  gemerkte Figuren aus dem freien Spiegeln, pro Profil
 * - challenges: Herausforderungen (vorinstalliert und selbst erstellt)
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Answer, Challenge, ChallengeAnswers } from '../challenges/types';
import type { Scene } from '../geometry';
import { DEFAULT_ANIMALS, type AnimalId } from '../profiles/animals';

export interface ToolPrefs {
  snap: boolean;
  showOutline: boolean;
  /** Spiegelachse ausblenden (Anfasspunkte bleiben sichtbar). */
  hideLine: boolean;
  /** Goldener Rahmen, wenn eine Zielfigur genau getroffen ist (Erwachsenenbereich). */
  goldFrame: boolean;
}

export const DEFAULT_PREFS: ToolPrefs = { snap: false, showOutline: false, hideLine: false, goldFrame: true };

export interface Profile {
  id: string;
  name: string;
  animal: AnimalId;
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

interface AnswerRecord extends Answer {
  profileId: string;
  challengeId: string;
  targetId: string;
}

interface SpiegelnSchema extends DBSchema {
  profiles: { key: string; value: Profile };
  answers: {
    key: [string, string, string];
    value: AnswerRecord;
    indexes: { byProfile: string };
  };
  snapshots: { key: string; value: Snapshot; indexes: { byProfile: string } };
  challenges: { key: string; value: Challenge & { builtin: boolean; order: number } };
  motifs: { key: string; value: CustomMotif };
}

export const DB_NAME = 'spiegeln';
const DB_VERSION = 2;

export function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export class Store {
  private constructor(private db: IDBPDatabase<SpiegelnSchema>) {}

  static async open(name = DB_NAME): Promise<Store> {
    const db = await openDB<SpiegelnSchema>(name, DB_VERSION, {
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
      },
    });
    return new Store(db);
  }

  close(): void {
    this.db.close();
  }

  // ---------- Profile ----------

  async listProfiles(): Promise<Profile[]> {
    const all = await this.db.getAll('profiles');
    // Ältere Profile kennen neuere Einstellungen noch nicht → Standardwerte ergänzen.
    return all
      .map((p) => ({ ...p, prefs: { ...DEFAULT_PREFS, ...p.prefs } }))
      .sort((a, b) => a.order - b.order || a.createdAt - b.createdAt);
  }

  /** Legt beim ersten Start die 10 Tierprofile an. */
  async ensureDefaultProfiles(): Promise<Profile[]> {
    if ((await this.db.count('profiles')) === 0) {
      const tx = this.db.transaction('profiles', 'readwrite');
      const now = Date.now();
      await Promise.all(
        DEFAULT_ANIMALS.map((a, i) =>
          tx.store.put({ id: newId(), name: a.name, animal: a.id, order: i, prefs: DEFAULT_PREFS, createdAt: now + i }),
        ),
      );
      await tx.done;
    }
    return this.listProfiles();
  }

  async createProfile(name: string, animal: AnimalId): Promise<Profile> {
    const profiles = await this.listProfiles();
    const order = profiles.reduce((m, p) => Math.max(m, p.order), -1) + 1;
    const profile: Profile = { id: newId(), name: name.trim(), animal, order, prefs: DEFAULT_PREFS, createdAt: Date.now() };
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
    const tx = this.db.transaction(['profiles', 'answers', 'snapshots'], 'readwrite');
    await tx.objectStore('profiles').delete(id);
    for (const store of ['answers', 'snapshots'] as const) {
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

  /** Entfernt alle Antworten aller Profile zu einer Herausforderung. */
  async deleteAnswersForChallenge(challengeId: string): Promise<void> {
    const tx = this.db.transaction('answers', 'readwrite');
    let cursor = await tx.store.openCursor();
    while (cursor) {
      if (cursor.value.challengeId === challengeId) await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
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
