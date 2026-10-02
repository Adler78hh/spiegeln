import { useEffect, useRef, useState } from 'react';
import { ANIMAL_ORDER, ANIMALS, type AnimalId } from '../../profiles/animals';
import { findColor, tintOf } from '../../profiles/colors';
import type { Group, Profile, Store } from '../../storage/store';
import { ProfileImage } from '../Avatar';
import { PlusIcon, TrashIcon } from '../icons';
import { ConfirmRow } from './AdultPage';

interface Props {
  store: Store;
  group: Group;
  /** Kinder dieser Gruppe. */
  profiles: Profile[];
  onChange: (all: Profile[]) => void;
  /**
   * Gratisversion: feste Tierprofile. Nur der Name lässt sich ändern;
   * statt Löschen gibt es Zurücksetzen (Antworten weg, Name wieder Tiername).
   */
  fixed?: boolean;
}

/** Kinder einer Gruppe: umbenennen, Tier ändern, neu anlegen, löschen. */
export function ProfileManager({ store, group, profiles, onChange, fixed }: Props) {
  const [confirmAll, setConfirmAll] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [animalFor, setAnimalFor] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [newId, setNewId] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const busy = useRef(false);
  const focused = useRef<string | null>(null);
  const tint = tintOf(findColor(group.color).hex);

  const used = new Set(profiles.map((p) => p.animal).filter(Boolean));
  const nextAnimal = ANIMAL_ORDER.find((a) => !used.has(a.id));

  const reload = async () => onChange(await store.listProfiles());

  // Neues Profil sichtbar machen: hinscrollen, Namensfeld markieren.
  useEffect(() => {
    if (!newId || focused.current === newId) return;
    const input = listRef.current?.querySelector<HTMLInputElement>(`#profile-name-${CSS.escape(newId)}`);
    if (!input) return;
    input.closest('li')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input.focus({ preventScroll: true });
    input.select();
    focused.current = newId;
  }, [newId, profiles]);

  useEffect(() => {
    if (!newId) return;
    const t = setTimeout(() => setNewId(null), 2500);
    return () => clearTimeout(t);
  }, [newId]);

  const rename = async (p: Profile, input: HTMLInputElement) => {
    const name = input.value;
    if (!name.trim()) input.value = p.name;
    if (!name.trim() || name.trim() === p.name) return;
    await store.updateProfile(p.id, { name });
    await reload();
  };

  const setAnimal = async (p: Profile, animal: AnimalId | null) => {
    if (busy.current) return;
    busy.current = true;
    try {
      // Trägt das Profil noch den Tiernamen, wandert der Name mit dem Tier mit.
      const keepsAnimalName = p.animal !== null && p.name === ANIMALS[p.animal].name;
      await store.updateProfile(p.id, animal && keepsAnimalName ? { animal, name: ANIMALS[animal].name } : { animal });
      setAnimalFor(null);
      await reload();
    } finally {
      busy.current = false;
    }
  };

  const add = async () => {
    // Schnelles Doppeltippen darf kein Tier doppelt vergeben.
    if (!nextAnimal || busy.current) return;
    busy.current = true;
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
    try {
      const created = await store.createProfile(group.id, nextAnimal.name, nextAnimal.id);
      await reload();
      setNewId(created.id);
    } finally {
      busy.current = false;
    }
  };

  const remove = async (id: string) => {
    if (fixed) await store.resetProfile(id);
    else await store.deleteProfile(id);
    setConfirmId(null);
    await reload();
  };

  const resetAll = async () => {
    for (const p of profiles) await store.resetProfile(p.id);
    setConfirmAll(false);
    await reload();
  };

  return (
    <>
      <div className="tab-toolbar">
        {fixed ? (
          <>
            <p className="hint">
              Den Namen des Kindes ins Feld schreiben, dann erscheint er unter dem Tier. Zurücksetzen löscht die Antworten und gibt dem Profil
              wieder den Tiernamen, z. B. zum neuen Schuljahr.
            </p>
            <button className="text-btn" onClick={() => setConfirmAll(true)}>
              <TrashIcon /> Alle zurücksetzen
            </button>
            {confirmAll && (
              <ConfirmRow
                text="Alle Kinder zurücksetzen? Alle Namen und Antworten werden gelöscht."
                confirmLabel="Zurücksetzen"
                onConfirm={resetAll}
                onCancel={() => setConfirmAll(false)}
              />
            )}
          </>
        ) : (
          <>
            <p className="hint">
              Den Namen des Kindes ins Feld schreiben, dann erscheint er unter dem Tier. Antippen des Bildes wählt ein anderes Tier oder „Kein Tier“
              (dann erscheinen die ersten beiden Buchstaben des Namens).
            </p>
            <button className={`text-btn primary add-profile ${flash ? 'flash' : ''}`} onClick={add} disabled={!nextAnimal}>
              <PlusIcon size={22} /> Neues Profil
            </button>
          </>
        )}
      </div>
      <ul className="manage-list" ref={listRef}>
        {profiles.map((p) => (
          <li key={p.id} className={`manage-row ${p.id === newId ? 'is-new' : ''}`}>
            {fixed ? (
              <span className="avatar-pick" style={{ background: tint }}>
                <ProfileImage profile={p} />
              </span>
            ) : (
              <button
                className="avatar-pick"
                style={{ background: tint }}
                aria-label={`Bild für ${p.name} ändern`}
                onClick={() => setAnimalFor(animalFor === p.id ? null : p.id)}
              >
                <ProfileImage profile={p} />
              </button>
            )}
            <label className="name-field" htmlFor={`profile-name-${p.id}`}>
              <span>Name des Kindes{p.animal ? ` (${ANIMALS[p.animal].name})` : ''}</span>
              <input
                key={p.name}
                id={`profile-name-${p.id}`}
                className="name-input"
                defaultValue={p.name}
                maxLength={24}
                placeholder={p.animal ? ANIMALS[p.animal].name : 'Name'}
                onBlur={(e) => rename(p, e.target)}
                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              />
            </label>
            <button className="tool-btn" aria-label={fixed ? `${p.name} zurücksetzen` : `${p.name} löschen`} onClick={() => setConfirmId(p.id)}>
              <TrashIcon />
            </button>
            {animalFor === p.id && (
              <div className="animal-choice">
                <button
                  aria-label="Kein Tier (Anfangsbuchstaben)"
                  className={`no-animal ${p.animal === null ? 'selected' : ''}`}
                  style={{ background: tint }}
                  onClick={() => setAnimal(p, null)}
                >
                  <ProfileImage profile={{ name: p.name, animal: null }} />
                </button>
                {ANIMAL_ORDER.map((a) => {
                  const taken = a.id !== p.animal && used.has(a.id);
                  return (
                    <button
                      key={a.id}
                      aria-label={taken ? `${a.name} (schon vergeben)` : a.name}
                      className={a.id === p.animal ? 'selected' : ''}
                      disabled={taken}
                      onClick={() => setAnimal(p, a.id)}
                    >
                      <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(a.svg)}`} alt="" />
                    </button>
                  );
                })}
              </div>
            )}
            {confirmId === p.id && (
              <ConfirmRow
                text={fixed ? `„${p.name}“ zurücksetzen? Name und alle Antworten werden gelöscht.` : `„${p.name}“ mit allen Antworten und gemerkten Figuren löschen?`}
                confirmLabel={fixed ? 'Zurücksetzen' : 'Löschen'}
                onConfirm={() => remove(p.id)}
                onCancel={() => setConfirmId(null)}
              />
            )}
          </li>
        ))}
      </ul>
      {!fixed && !nextAnimal && <p className="hint">Alle {ANIMAL_ORDER.length} Tiere sind in dieser Gruppe vergeben.</p>}
    </>
  );
}
