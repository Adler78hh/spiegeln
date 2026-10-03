import { useState, type ReactNode } from 'react';
import { ANIMAL_ORDER } from '../../profiles/animals';
import { findColor, firstFreeColor, GROUP_COLORS, suggestGroupName, textOn } from '../../profiles/colors';
import type { Group, Profile, Store } from '../../storage/store';
import { CheckIcon, PlusIcon, TrashIcon } from '../icons';
import { AdultPage, ConfirmRow } from './AdultPage';
import { ProfileManager } from './ProfileManager';

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
/** Raster der 32 Gruppenfarben; schon vergebene Farben sind gekennzeichnet. */
function ColorGrid({ value, usedColors, onPick }: { value: string; usedColors: string[]; onPick: (id: string) => void }) {
  return (
    <div className="color-grid" role="radiogroup" aria-label="Farbe">
      {GROUP_COLORS.map((c) => {
        const uses = usedColors.filter((u) => u === c.id).length;
        return (
          <button
            key={c.id}
            role="radio"
            aria-checked={c.id === value}
            aria-label={uses ? `${c.name} (schon ${uses}× vergeben)` : c.name}
            className={`color-swatch ${c.id === value ? 'selected' : ''} ${uses ? 'used' : ''}`}
            onClick={() => onPick(c.id)}
          >
            <span className="swatch" style={{ background: c.hex, color: textOn(c.hex) }}>
              {c.id === value && <CheckIcon size={22} />}
            </span>
            <span className="swatch-name">{c.name}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Farbe einer bestehenden Gruppe ändern. */
function RecolorDialog(props: { group: Group; groups: Group[]; onPick: (id: string) => void; onCancel: () => void }) {
  const { group, groups, onPick, onCancel } = props;
  const usedColors = groups.filter((g) => g.id !== group.id).map((g) => g.color);
  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label="Farbe ändern">
      <div className="dialog new-group">
        <h2>Farbe der Gruppe {group.name}</h2>
        <ColorGrid value={group.color} usedColors={usedColors} onPick={onPick} />
        <div className="dialog-actions">
          <button className="text-btn" onClick={onCancel}>
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}

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
        <p className="field-label">Farbe</p>
        <ColorGrid value={color} usedColors={usedColors} onPick={pickColor} />
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
  /** Neue Farbe (der Name wechselt mit, wenn er noch der Farbname ist). */
  onRecolor: (color: string) => void;
  onDelete: () => void;
  tab: GroupTab;
  onTabChange: (t: GroupTab) => void;
  /** Inhalt des Reiters „Ergebnisse“ (je App verschieden). */
  results: ReactNode;
  onBack: () => void;
  /** Gratisversion: eine feste Klasse, kein Umbenennen oder Löschen der Gruppe. */
  limited?: boolean;
}

export type GroupTab = 'kids' | 'results';

/** Eine Gruppe: Name, Farbe, Löschen; Reiter „Kinder“ und „Ergebnisse“. */
export function GroupPage(props: PageProps) {
  const { store, group, groups, profiles, onProfilesChange, onRename, onRecolor, onDelete, tab, onTabChange, results, onBack, limited } = props;
  const [confirm, setConfirm] = useState(false);
  const [recolor, setRecolor] = useState(false);
  const color = findColor(group.color);
  const kids = profiles.filter((p) => p.groupId === group.id);
  const isLast = groups.length <= 1;

  return (
    <AdultPage title={limited ? 'Klasse' : `Gruppe ${group.name}`} onBack={onBack}>
      {!limited && (
      <div className="group-head">
        <button
          className="group-swatch"
          style={{ background: color.hex }}
          aria-label={`Farbe ändern (jetzt ${color.name})`}
          title="Farbe ändern"
          onClick={() => setRecolor(true)}
        />
        {recolor && (
          <RecolorDialog
            group={group}
            groups={groups}
            onPick={(id) => {
              setRecolor(false);
              if (id !== group.color) onRecolor(id);
            }}
            onCancel={() => setRecolor(false)}
          />
        )}
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
      )}

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
          <ProfileManager store={store} group={group} profiles={kids} onChange={onProfilesChange} fixed={limited} />
        ) : (
          results
        )}
      </div>
    </AdultPage>
  );
}
