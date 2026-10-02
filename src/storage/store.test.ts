import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initialScene } from '../geometry';
import type { Challenge } from '../challenges/types';
import { openDB } from 'idb';
import { Store } from './store';

let store: Store;
let n = 0;

beforeEach(async () => {
  store = await Store.open(`test-${n++}`);
});
afterEach(() => store.close());

const answer = (decision: 'fits' | 'impossible') => ({ decision, scene: initialScene(), updatedAt: 1 });

describe('Profile', () => {
  it('legt beim ersten Start Gruppe Weiß mit 10 Tierprofilen an, nur einmal', async () => {
    const first = await store.ensureDefaults();
    expect(first.groups.map((g) => [g.name, g.color])).toEqual([['Weiß', 'weiss']]);
    expect(first.profiles.map((p) => p.name)).toEqual([
      'Fuchs', 'Eule', 'Igel', 'Bär', 'Hase', 'Katze', 'Frosch', 'Pinguin', 'Löwe', 'Maus',
    ]);
    expect(first.profiles.every((p) => p.groupId === first.groups[0].id)).toBe(true);
    const again = await store.ensureDefaults();
    expect(again.groups).toHaveLength(1);
    expect(again.profiles).toHaveLength(10);
  });

  it('anlegen, umbenennen, löschen', async () => {
    const { groups } = await store.ensureDefaults();
    const p = await store.createProfile(groups[0].id, '  Lotta ', 'katze');
    expect(p.name).toBe('Lotta');
    expect((await store.listProfiles()).at(-1)!.id).toBe(p.id);
    const renamed = await store.updateProfile(p.id, { name: 'Lotte' });
    expect(renamed.name).toBe('Lotte');
    await store.deleteProfile(p.id);
    expect((await store.listProfiles()).find((x) => x.id === p.id)).toBeUndefined();
  });

  it('Einstellungen werden pro Profil gespeichert', async () => {
    const p = await store.createProfile('g', 'Ben', 'baer');
    await store.updateProfile(p.id, { prefs: { snap: true, showOutline: true, hideLine: true, invert: 'negative' } });
    const [loaded] = await store.listProfiles();
    expect(loaded.prefs).toEqual({ snap: true, showOutline: true, hideLine: true, invert: 'negative' });
  });
});

describe('Gruppen', () => {
  it('neue Gruppe bekommt die ersten N Tiere', async () => {
    await store.ensureDefaults();
    const g = await store.createGroup('Gelb', 'gelb', 12);
    const kids = (await store.listProfiles()).filter((p) => p.groupId === g.id);
    expect(kids.map((p) => p.animal)).toEqual([
      'fuchs', 'eule', 'igel', 'baer', 'hase', 'katze', 'frosch', 'pinguin', 'loewe', 'maus', 'hund', 'schwein',
    ]);
    expect((await store.listGroups()).map((x) => x.name)).toEqual(['Weiß', 'Gelb']);
  });

  it('umbenennen behält die Farbe, löschen entfernt Kinder und Antworten', async () => {
    await store.ensureDefaults();
    const g = await store.createGroup('Rot', 'rot', 2);
    await store.renameGroup(g.id, ' Klasse 1a ');
    const [, renamed] = await store.listGroups();
    expect([renamed.name, renamed.color]).toEqual(['Klasse 1a', 'rot']);
    const kid = (await store.listProfiles()).find((p) => p.groupId === g.id)!;
    await store.saveAnswer(kid.id, 'haus-1', 'haus-1-1', answer('fits'));
    await store.deleteGroup(g.id);
    expect(await store.listGroups()).toHaveLength(1);
    expect((await store.listProfiles()).some((p) => p.groupId === g.id)).toBe(false);
    expect(await store.getAnswers(kid.id)).toEqual({});
  });

  it('bisherige Profile (Version 2) kommen mit allen Antworten in Gruppe Weiß', async () => {
    const name = `alt-${n++}`;
    const old = await openDB(name, 2, {
      upgrade(db) {
        db.createObjectStore('profiles', { keyPath: 'id' });
        const answers = db.createObjectStore('answers', { keyPath: ['profileId', 'challengeId', 'targetId'] });
        answers.createIndex('byProfile', 'profileId');
        const snaps = db.createObjectStore('snapshots', { keyPath: 'id' });
        snaps.createIndex('byProfile', 'profileId');
        db.createObjectStore('challenges', { keyPath: 'id' });
        db.createObjectStore('motifs', { keyPath: 'id' });
      },
    });
    await old.put('profiles', { id: 'p1', name: 'Lotta', animal: 'katze', order: 0, prefs: {}, createdAt: 1 });
    await old.put('answers', { ...answer('fits'), profileId: 'p1', challengeId: 'haus-1', targetId: 'haus-1-1' });
    old.close();

    const s2 = await Store.open(name);
    const { groups, profiles } = await s2.ensureDefaults();
    expect(groups.map((g) => g.name)).toEqual(['Weiß']);
    expect(profiles.map((p) => [p.name, p.groupId])).toEqual([['Lotta', groups[0].id]]);
    expect((await s2.getAnswers('p1'))['haus-1']['haus-1-1'].decision).toBe('fits');
    s2.close();
  });

  it('Profil ohne Tier', async () => {
    const p = await store.createProfile('g', 'Mia', null);
    expect((await store.listProfiles())[0].animal).toBeNull();
    expect(p.animal).toBeNull();
  });
});

describe('Antworten', () => {
  it('werden pro Profil getrennt gespeichert', async () => {
    const a = await store.createProfile('g', 'A', 'fuchs');
    const b = await store.createProfile('g', 'B', 'eule');
    await store.saveAnswer(a.id, 'haus-1', 'haus-1-1', answer('fits'));
    await store.saveAnswer(a.id, 'haus-1', 'haus-1-2', answer('impossible'));
    await store.saveAnswer(b.id, 'haus-1', 'haus-1-1', answer('impossible'));

    const ra = await store.getAnswers(a.id);
    expect(ra['haus-1']['haus-1-1'].decision).toBe('fits');
    expect(ra['haus-1']['haus-1-2'].decision).toBe('impossible');
    expect('profileId' in ra['haus-1']['haus-1-1']).toBe(false);
    const rb = await store.getAnswers(b.id);
    expect(Object.keys(rb['haus-1'])).toEqual(['haus-1-1']);
    expect(rb['haus-1']['haus-1-1'].decision).toBe('impossible');
  });

  it('eine geänderte Entscheidung überschreibt die alte', async () => {
    const a = await store.createProfile('g', 'A', 'fuchs');
    await store.saveAnswer(a.id, 'c', 't', answer('fits'));
    await store.saveAnswer(a.id, 'c', 't', answer('impossible'));
    expect((await store.getAnswers(a.id)).c.t.decision).toBe('impossible');
  });

  it('Löschen eines Profils entfernt seine Antworten und Schnappschüsse', async () => {
    const a = await store.createProfile('g', 'A', 'fuchs');
    const b = await store.createProfile('g', 'B', 'eule');
    await store.saveAnswer(a.id, 'c', 't', answer('fits'));
    await store.saveAnswer(b.id, 'c', 't', answer('fits'));
    await store.addSnapshot({ profileId: a.id, motifId: 'haus', scene: initialScene(), image: 'data:' });
    await store.deleteProfile(a.id);
    expect(await store.getAnswers(a.id)).toEqual({});
    expect(await store.listSnapshots(a.id)).toEqual([]);
    expect(Object.keys(await store.getAnswers(b.id))).toEqual(['c']);
  });
});

describe('Antworten zu einer Herausforderung verwerfen', () => {
  it('betrifft alle Profile, aber nur diese Herausforderung', async () => {
    const a = await store.createProfile('g', 'A', 'fuchs');
    const b = await store.createProfile('g', 'B', 'eule');
    await store.saveAnswer(a.id, 'haus-1', 't1', answer('fits'));
    await store.saveAnswer(b.id, 'haus-1', 't1', answer('fits'));
    await store.saveAnswer(a.id, 'fisch-1', 't1', answer('fits'));
    await store.deleteAnswersForChallenge('haus-1');
    expect(Object.keys(await store.getAnswers(a.id))).toEqual(['fisch-1']);
    expect(await store.getAnswers(b.id)).toEqual({});
  });
});

describe('Schnappschüsse', () => {
  it('neueste zuerst, pro Profil, löschbar', async () => {
    const a = await store.createProfile('g', 'A', 'fuchs');
    const s1 = await store.addSnapshot({ profileId: a.id, motifId: 'haus', scene: initialScene(), image: 'x1' });
    await new Promise((r) => setTimeout(r, 2));
    const s2 = await store.addSnapshot({ profileId: a.id, motifId: 'fisch', scene: initialScene(), image: 'x2' });
    expect((await store.listSnapshots(a.id)).map((s) => s.id)).toEqual([s2.id, s1.id]);
    await store.deleteSnapshot(s1.id);
    expect((await store.listSnapshots(a.id)).map((s) => s.id)).toEqual([s2.id]);
  });
});

describe('Eigene Motive', () => {
  it('anlegen (mit eigener ID-Kennung), auflisten, löschen', async () => {
    const m = await store.addMotif({ name: 'Mein Bild', source: 'drawing', image: 'data:x', width: 300, height: 200 });
    expect(m.id.startsWith('eigen-')).toBe(true);
    await new Promise((r) => setTimeout(r, 2));
    const m2 = await store.addMotif({ name: 'Foto', source: 'photo', image: 'data:y', width: 10, height: 10 });
    expect((await store.listMotifs()).map((x) => x.id)).toEqual([m.id, m2.id]);
    await store.renameMotif(m.id, ' Katze ');
    expect((await store.listMotifs())[0].name).toBe('Katze');
    await store.deleteMotif(m.id);
    expect((await store.listMotifs()).map((x) => x.id)).toEqual([m2.id]);
  });
});

describe('Herausforderungen', () => {
  it('werden in Reihenfolge gespeichert und geladen', async () => {
    const c = (id: string): Challenge => ({ id, name: id, motifId: 'haus', targets: [], viewSize: 1 });
    await store.saveChallenge(c('b'), true, 1);
    await store.saveChallenge(c('a'), false, 0);
    const list = await store.listChallenges();
    expect(list.map((x) => x.id)).toEqual(['a', 'b']);
    expect(list[1].builtin).toBe(true);
  });

  it('Löschen entfernt auch die Antworten', async () => {
    const p = await store.createProfile('g', 'A', 'fuchs');
    await store.saveChallenge({ id: 'x', name: 'x', motifId: 'haus', targets: [], viewSize: 1 }, false, 9);
    await store.saveAnswer(p.id, 'x', 't', answer('fits'));
    await store.deleteChallenge('x');
    expect(await store.listChallenges()).toEqual([]);
    expect(await store.getAnswers(p.id)).toEqual({});
  });
});
