import { useState } from 'react';
import { ANIMALS, animalImageUrl, DEFAULT_ANIMALS, type AnimalId } from '../../profiles/animals';
import type { Profile, Store } from '../../storage/store';
import { PlusIcon, TrashIcon } from '../icons';
import { AdultPage, ConfirmRow } from './AdultPage';

interface Props {
  store: Store;
  profiles: Profile[];
  onChange: (p: Profile[]) => void;
  onBack: () => void;
}

/** Profile umbenennen, Tier ändern, neu anlegen, löschen. */
export function ProfileManager({ store, profiles, onChange, onBack }: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [animalFor, setAnimalFor] = useState<string | null>(null);

  const reload = async () => onChange(await store.listProfiles());

  const rename = async (p: Profile, name: string) => {
    if (!name.trim() || name.trim() === p.name) return;
    await store.updateProfile(p.id, { name });
    await reload();
  };

  const setAnimal = async (p: Profile, animal: AnimalId) => {
    await store.updateProfile(p.id, { animal });
    setAnimalFor(null);
    await reload();
  };

  const add = async () => {
    const used = new Set(profiles.map((p) => p.animal));
    const animal = DEFAULT_ANIMALS.find((a) => !used.has(a.id))?.id ?? 'fuchs';
    await store.createProfile(ANIMALS[animal].name, animal);
    await reload();
  };

  const remove = async (id: string) => {
    await store.deleteProfile(id);
    setConfirmId(null);
    await reload();
  };

  return (
    <AdultPage
      title="Profile"
      onBack={onBack}
      actions={
        <button className="text-btn primary" onClick={add}>
          <PlusIcon size={22} /> Neues Profil
        </button>
      }
    >
      <ul className="manage-list">
        {profiles.map((p) => (
          <li key={p.id} className="manage-row">
            <button className="avatar-pick" aria-label={`Tier für ${p.name} ändern`} onClick={() => setAnimalFor(animalFor === p.id ? null : p.id)}>
              <img src={animalImageUrl(p.animal)} alt="" />
            </button>
            <input
              id={`profile-name-${p.id}`}
              className="name-input"
              defaultValue={p.name}
              maxLength={24}
              aria-label="Name"
              onBlur={(e) => rename(p, e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            />
            <button className="tool-btn" aria-label={`${p.name} löschen`} onClick={() => setConfirmId(p.id)}>
              <TrashIcon />
            </button>
            {animalFor === p.id && (
              <div className="animal-choice">
                {DEFAULT_ANIMALS.map((a) => (
                  <button key={a.id} aria-label={a.name} className={a.id === p.animal ? 'selected' : ''} onClick={() => setAnimal(p, a.id)}>
                    <img src={animalImageUrl(a.id)} alt="" />
                  </button>
                ))}
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
    </AdultPage>
  );
}
