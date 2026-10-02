import { useState } from 'react';
import { ANIMALS } from '../profiles/animals';
import { findColor, textOn, tintOf } from '../profiles/colors';
import type { Group, Profile } from '../storage/store';
import { FULL_VERSION_URL, GRATIS } from '../edition';
import { AdultGateButton } from './adult/AdultGate';
import { ProfileImage } from './Avatar';
import { BackIcon } from './icons';
import { useLongPress } from './useLongPress';

interface Props {
  groups: Group[];
  group: Group;
  /** Profile der gewählten Gruppe. */
  profiles: Profile[];
  onPick: (p: Profile) => void;
  onGroupChange: (id: string) => void;
  onAdult: () => void;
}

/** Profilwahl über große Tierbilder; oben das Oval der Gruppe. */
export function ProfilePicker({ groups, group, profiles, onPick, onGroupChange, onAdult }: Props) {
  const [choosing, setChoosing] = useState(false);
  const color = findColor(group.color).hex;
  const tint = tintOf(color);

  if (choosing) {
    return (
      <GroupChooser
        groups={groups}
        current={group.id}
        onChoose={(id) => {
          onGroupChange(id);
          setChoosing(false);
        }}
        onCancel={() => setChoosing(false)}
      />
    );
  }

  return (
    <div className="picker-screen">
      {GRATIS && (
        <p className="full-version-hint">
          <strong>Spiegeln gratis</strong> – freies Spiegeln, eigene Herausforderungen und mehrere Klassen gibt es in der{' '}
          <a href={FULL_VERSION_URL} target="_blank" rel="noopener">
            Vollversion
          </a>
          .
        </p>
      )}
      <div className="gate-corner">
        {!GRATIS && <GroupOval group={group} onLongPress={() => setChoosing(true)} />}
        <AdultGateButton onOpen={onAdult} />
      </div>
      <div className="profile-grid" role="list">
        {profiles.map((p) => (
          <button key={p.id} role="listitem" className="profile-tile" style={{ background: tint }} onClick={() => onPick(p)}>
            <ProfileImage profile={p} />
            <span>{p.name}</span>
            {p.animal && p.name !== ANIMALS[p.animal].name && <small className="animal-name">{ANIMALS[p.animal].name}</small>}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Oval mit dem Gruppennamen: 3 Sekunden drücken öffnet die Gruppenauswahl. */
function GroupOval({ group, onLongPress }: { group: Group; onLongPress: () => void }) {
  const { progress, handlers } = useLongPress(onLongPress);
  const hex = findColor(group.color).hex;
  return (
    <button
      className="group-oval"
      style={{ background: hex, color: textOn(hex) }}
      aria-label={`Gruppe ${group.name} (3 Sekunden gedrückt halten zum Wechseln)`}
      {...handlers}
    >
      <span className="group-oval-progress" style={{ transform: `scaleX(${progress})`, opacity: progress > 0 ? 1 : 0 }} />
      <span className="group-oval-name">{group.name}</span>
    </button>
  );
}

function GroupChooser(props: { groups: Group[]; current: string; onChoose: (id: string) => void; onCancel: () => void }) {
  const { groups, current, onChoose, onCancel } = props;
  return (
    <div className="group-chooser">
      <header className="group-chooser-top">
        <button className="tool-btn" aria-label="Zurück" onClick={onCancel}>
          <BackIcon />
        </button>
      </header>
      <div className="group-chooser-list" role="list">
        {groups.map((g) => {
          const hex = findColor(g.color).hex;
          return (
            <button
              key={g.id}
              role="listitem"
              className={`group-oval big ${g.id === current ? 'current' : ''}`}
              style={{ background: hex, color: textOn(hex) }}
              onClick={() => onChoose(g.id)}
            >
              <span className="group-oval-name">{g.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
