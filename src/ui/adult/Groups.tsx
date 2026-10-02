import { useState } from 'react';
import type { Challenge } from '../../challenges/types';
import type { MotifInfo } from '../../motifs/library';
import { ANIMAL_ORDER } from '../../profiles/animals';
import { findColor, firstFreeColor, GROUP_COLORS, suggestGroupName, textOn } from '../../profiles/colors';
import type { Group, Profile, Store } from '../../storage/store';
import { CheckIcon, PlusIcon, TrashIcon } from '../icons';
import { AdultPage, ConfirmRow } from './AdultPage';
import { ProfileManager } from './ProfileManager';
import { Results } from './Results';

const MAX_KIDS = ANIMAL_ORDER.length;

interface ListProps {
  groups: Group[];
  profiles: Profile[];
  onOpen: (id: string) => void;
  onNew: () => void;
  onBack: () => void;
}

/** Alle Gruppen mit Anzahl der Kinder. */
export function GroupList({ groups, profiles, onOpen, onNew, onBack }: ListProps) {
  return (
    <AdultPage
      title="Gruppen"
      onBack={onBack}
      actions={
        <button className="text-btn primary" onClick={onNew}>
          <PlusIcon size={22} /> Neue Gruppe
        </button>
      }
    >
      <ul className="manage-list">
        {groups.map((g) => {
          const hex = findColor(g.color).hex;
          const n = profiles.filter((p) => p.groupId === g.id).length;
          return (
            <li key={g.id}>
              <button className="manage-row as-button" onClick={() => onOpen(g.id)}>
                <span className="group-oval small" style={{ background: hex, color: textOn(hex) }}>
                  <span className="group-oval-name">{g.name}</span>
                </span>
                <span className="row-meta">{n === 1 ? '1 Kind' : `${n} Kinder`}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </AdultPage>
  );
}

/** Neue Gruppe: Farbe, Name und Anzahl der Kinder wählen. */
export function NewGroupDialog(props: { groups: Group[]; onCreate: (name: string, color: string, count: number) => void; onCancel: () => void }) {
  const { groups, onCreate, onCancel } = props;
  const usedColors = groups.map((g) => g.color);
  const [color, setColor] = useState(() => firstFreeColor(usedColors));
  const [name, setName] = useState(() => suggestGroupName(color, usedColors));
  const [nameEdited, setNameEdited] = useState(false);
  const [countText, setCountText] = useState('20');
  const [busy, setBusy] = useState(false);

  const pickColor = (id: string) => {
    setColor(id);
    if (!nameEdited) setName(suggestGroupName(id, usedColors));
  };
  const clamp = (n: number) => Math.max(1, Math.min(MAX_KIDS, Math.round(n) || 1));
  const count = clamp(Number(countText));
  const setCount = (f: (n: number) => number) => setCountText(String(clamp(f(count))));

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label="Neue Gruppe">
      <div className="dialog new-group">
        <h2>Neue Gruppe</h2>
        <p className="field-label">Farbe (lässt sich später nicht ändern)</p>
        <div className="color-grid" role="radiogroup" aria-label="Farbe">
          {GROUP_COLORS.map((c) => {
            const uses = usedColors.filter((u) => u === c.id).length;
            return (
              <button
                key={c.id}
                role="radio"
                aria-checked={c.id === color}
                aria-label={uses ? `${c.name} (schon ${uses}× vergeben)` : c.name}
                className={`color-swatch ${c.id === color ? 'selected' : ''} ${uses ? 'used' : ''}`}
                onClick={() => pickColor(c.id)}
              >
                <span className="swatch" style={{ background: c.hex, color: textOn(c.hex) }}>
                  {c.id === color && <CheckIcon size={22} />}
                </span>
                <span className="swatch-name">{c.name}</span>
              </button>
            );
          })}
        </div>
        <label className="name-field">
          <span>Name der Gruppe</span>
          <input
            id="new-group-name"
            className="name-input"
            value={name}
            maxLength={24}
            onChange={(e) => {
              setName(e.target.value);
              setNameEdited(true);
            }}
          />
        </label>
        <div className="count-field">
          <span className="field-label">Anzahl der Kinder</span>
          <div className="stepper">
            <button className="tool-btn" aria-label="Ein Kind weniger" onClick={() => setCount((n) => n - 1)} disabled={count <= 1}>
              −
            </button>
            <input
              className="name-input count-input"
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_KIDS}
              value={countText}
              aria-label="Anzahl der Kinder"
              onChange={(e) => setCountText(e.target.value.replace(/\D/g, '').slice(0, 2))}
              onBlur={() => setCountText(String(count))}
            />
            <button className="tool-btn" aria-label="Ein Kind mehr" onClick={() => setCount((n) => n + 1)} disabled={count >= MAX_KIDS}>
              +
            </button>
          </div>
          <span className="hint">Die Kinder bekommen zunächst die ersten {count} Tiere; Namen und Tiere lassen sich danach ändern.</span>
        </div>
        <div className="dialog-actions">
          <button className="text-btn" onClick={onCancel}>
            Abbrechen
          </button>
          <button
            className="text-btn primary"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              onCreate(name.trim() || findColor(color).name, color, count);
            }}
          >
            Anlegen
          </button>
        </div>
      </div>
    </div>
  );
}

interface PageProps {
  store: Store;
  group: Group;
  groups: Group[];
  profiles: Profile[];
  onProfilesChange: (all: Profile[]) => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  challenges: Challenge[];
  motifs: MotifInfo[];
  tab: GroupTab;
  onTabChange: (t: GroupTab) => void;
  resultCell: { profileId: string; challengeId: string } | null;
  onResultCell: (c: { profileId: string; challengeId: string } | null) => void;
  onBack: () => void;
}

export type GroupTab = 'kids' | 'results';

/** Eine Gruppe: Name, Farbe, Löschen; Reiter „Kinder“ und „Ergebnisse“. */
export function GroupPage(props: PageProps) {
  const { store, group, groups, profiles, onProfilesChange, onRename, onDelete, challenges, motifs, tab, onTabChange, onBack } = props;
  const [confirm, setConfirm] = useState(false);
  const color = findColor(group.color);
  const kids = profiles.filter((p) => p.groupId === group.id);
  const isLast = groups.length <= 1;

  return (
    <AdultPage title={`Gruppe ${group.name}`} onBack={onBack}>
      <div className="group-head">
        <span className="group-swatch" style={{ background: color.hex }} aria-hidden="true" />
        <label className="name-field" htmlFor="group-name">
          <span>Name der Gruppe (Farbe: {color.name})</span>
          <input
            key={group.name}
            id="group-name"
            className="name-input"
            defaultValue={group.name}
            maxLength={24}
            onBlur={(e) => {
              const name = e.target.value.trim();
              if (!name) e.target.value = group.name;
              else if (name !== group.name) onRename(name);
            }}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          />
        </label>
        <button className="text-btn" onClick={() => setConfirm(true)} disabled={isLast} title={isLast ? 'Die letzte Gruppe kann nicht gelöscht werden.' : undefined}>
          <TrashIcon /> Gruppe löschen
        </button>
        {isLast && <p className="hint group-last-hint">Die letzte Gruppe kann nicht gelöscht werden.</p>}
        {confirm && (
          <ConfirmRow
            text={`Gruppe „${group.name}“ mit ${kids.length === 1 ? '1 Kind' : `${kids.length} Kindern`} und allen Ergebnissen löschen?`}
            confirmLabel="Löschen"
            onConfirm={() => {
              setConfirm(false);
              onDelete();
            }}
            onCancel={() => setConfirm(false)}
          />
        )}
      </div>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'kids'} className={`tab ${tab === 'kids' ? 'active' : ''}`} onClick={() => onTabChange('kids')}>
          Kinder
        </button>
        <button role="tab" aria-selected={tab === 'results'} className={`tab ${tab === 'results' ? 'active' : ''}`} onClick={() => onTabChange('results')}>
          Ergebnisse
        </button>
      </div>

      <div className="tab-panel" role="tabpanel">
        {tab === 'kids' ? (
          <ProfileManager store={store} group={group} profiles={kids} onChange={onProfilesChange} />
        ) : (
          <Results
            store={store}
            group={group}
            profiles={kids}
            challenges={challenges}
            motifs={motifs}
            open={props.resultCell}
            onOpen={props.onResultCell}
          />
        )}
      </div>
    </AdultPage>
  );
}
