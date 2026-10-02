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
}

/** Kinder einer Gruppe: umbenennen, Tier ändern, neu anlegen, löschen. */
export function ProfileManager({ store, group, profiles, onChange }: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [animalFor, setAnimalFor] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [newId, setNewId] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const tint = tintOf(findColor(group.color).hex);

  const used = new Set(profiles.map((p) => p.animal).filter(Boolean));
  const nextAnimal = ANIMAL_ORDER.find((a) => !used.has(a.id));

  const reload = async () => onChange(await store.listProfiles());

  // Neues Profil sichtbar machen: hinscrollen, Namensfeld markieren.
  useEffect(() => {
    if (!newId) return;
    const input = listRef.current?.querySelector<HTMLInputElement>(`#profile-name-${CSS.escape(newId)}`);
    if (!input) return;
    input.closest('li')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input.focus({ preventScroll: true });
    input.select();
    const t = setTimeout(() => setNewId(null), 2500);
    return () => clearTimeout(t);
  }, [newId, profiles]);

  const rename = async (p: Profile, name: string) => {
    if (!name.trim() || name.trim() === p.name) return;
    await store.updateProfile(p.id, { name });
    await reload();
  };

  const setAnimal = async (p: Profile, animal: AnimalId | null) => {
    // Trägt das Profil noch den Tiernamen, wandert der Name mit dem Tier mit.
    const keepsAnimalName = p.animal !== null && p.name === ANIMALS[p.animal].name;
    await store.updateProfile(p.id, animal && keepsAnimalName ? { animal, name: ANIMALS[animal].name } : { animal });
    setAnimalFor(null);
    await reload();
  };

  const add = async () => {
    if (!nextAnimal) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
    const created = await store.createProfile(group.id, nextAnimal.name, nextAnimal.id);
    await reload();
    setNewId(created.id);
  };

  const remove = async (id: string) => {
    await store.deleteProfile(id);
    setConfirmId(null);
    await reload();
  };

  return (
    <>
      <div className="tab-toolbar">
        <p className="hint">
          Den Namen des Kindes ins Feld schreiben, dann erscheint er unter dem Tier. Antippen des Bildes wählt ein anderes Tier oder „Kein Tier“
          (dann erscheinen die ersten beiden Buchstaben des Namens).
        </p>
        <button className={`text-btn primary add-profile ${flash ? 'flash' : ''}`} onClick={add} disabled={!nextAnimal}>
          <PlusIcon size={22} /> Neues Profil
        </button>
      </div>
      <ul className="manage-list" ref={listRef}>
        {profiles.map((p) => (
          <li key={p.id} className={`manage-row ${p.id === newId ? 'is-new' : ''}`}>
            <button
              className="avatar-pick"
              style={{ background: tint }}
              aria-label={`Bild für ${p.name} ändern`}
              onClick={() => setAnimalFor(animalFor === p.id ? null : p.id)}
            >
              <ProfileImage profile={p} />
            </button>
            <label className="name-field" htmlFor={`profile-name-${p.id}`}>
              <span>Name des Kindes{p.animal ? ` (${ANIMALS[p.animal].name})` : ''}</span>
              <input
                key={p.name}
                id={`profile-name-${p.id}`}
                className="name-input"
                defaultValue={p.name}
                maxLength={24}
                placeholder={p.animal ? ANIMALS[p.animal].name : 'Name'}
                onBlur={(e) => rename(p, e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              />
            </label>
            <button className="tool-btn" aria-label={`${p.name} löschen`} onClick={() => setConfirmId(p.id)}>
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
                text={`„${p.name}“ mit allen Antworten und gemerkten Figuren löschen?`}
                confirmLabel="Löschen"
                onConfirm={() => remove(p.id)}
                onCancel={() => setConfirmId(null)}
              />
            )}
          </li>
        ))}
      </ul>
      {!nextAnimal && <p className="hint">Alle 30 Tiere sind in dieser Gruppe vergeben.</p>}
    </>
  );
}
