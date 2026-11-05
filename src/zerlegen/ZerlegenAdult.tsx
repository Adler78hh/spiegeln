import { useState } from 'react';
import { isColorName, suggestGroupName } from '../profiles/colors';
import type { Group, Profile, Store } from '../storage/store';
import { PeopleIcon } from '../ui/icons';
import { AdultPage } from '../ui/adult/AdultPage';
import { GroupHead, GroupList, NewGroupDialog } from '../ui/adult/Groups';
import { ProfileManager } from '../ui/adult/ProfileManager';

interface Props {
  store: Store;
  groups: Group[];
  onGroupsChange: (g: Group[]) => void;
  profiles: Profile[];
  onProfilesChange: (p: Profile[]) => void;
  onExit: () => void;
}

/** Erwachsenenbereich von Zerlegen: Gruppen mit Kindern, wie bei Spiegeln. */
export function ZerlegenAdult({ store, groups, onGroupsChange, profiles, onProfilesChange, onExit }: Props) {
  const [inGroups, setInGroups] = useState(false);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [tab, setTab] = useState<'kids' | 'results'>('kids');
  const [creatingGroup, setCreatingGroup] = useState(false);

  const reloadGroups = async () => {
    onGroupsChange(await store.listGroups());
    onProfilesChange(await store.listProfiles());
  };

  const openGroup = (id: string | null) => {
    setGroupId(id);
    setTab('kids');
  };

  if (!inGroups) {
    return (
      <div className="adult-screen">
        <header className="adult-header">
          <h1>Erwachsenenbereich</h1>
          <button className="text-btn primary" onClick={onExit}>
            Fertig
          </button>
        </header>
        <div className="adult-tiles">
          <button className="adult-tile" onClick={() => setInGroups(true)}>
            <PeopleIcon size={56} />
            <strong>Gruppen</strong>
            <span>Kinder und Ergebnisse je Gruppe</span>
          </button>
        </div>
        <p className="adult-note">Alle Daten bleiben auf diesem Gerät.</p>
      </div>
    );
  }

  const group = groups.find((g) => g.id === groupId);
  if (group) {
    const kids = profiles.filter((p) => p.groupId === group.id);
    return (
      <AdultPage title={group.name} onBack={() => openGroup(null)}>
        <GroupHead
          group={group}
          groups={groups}
          kidCount={kids.length}
          onRename={async (name) => {
            await store.renameGroup(group.id, name);
            await reloadGroups();
          }}
          onRecolor={async (color) => {
            const others = groups.filter((g) => g.id !== group.id).map((g) => g.color);
            const name = isColorName(group.name, group.color) ? suggestGroupName(color, others) : group.name;
            await store.recolorGroup(group.id, color, name);
            await reloadGroups();
          }}
          onDelete={async () => {
            await store.deleteGroup(group.id);
            openGroup(null);
            await reloadGroups();
          }}
        />
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'kids'} className={`tab ${tab === 'kids' ? 'active' : ''}`} onClick={() => setTab('kids')}>
            Kinder
          </button>
          <button role="tab" aria-selected={tab === 'results'} className={`tab ${tab === 'results' ? 'active' : ''}`} onClick={() => setTab('results')}>
            Ergebnisse
          </button>
        </div>
        <div className="tab-panel" role="tabpanel">
          {tab === 'kids' ? (
            <ProfileManager store={store} group={group} profiles={kids} onChange={onProfilesChange} />
          ) : (
            <p className="empty">Ergebnisse erscheinen hier, sobald es Übungen gibt.</p>
          )}
        </div>
      </AdultPage>
    );
  }
  return (
    <>
      <GroupList groups={groups} profiles={profiles} onOpen={openGroup} onNew={() => setCreatingGroup(true)} onBack={() => setInGroups(false)} />
      {creatingGroup && (
        <NewGroupDialog
          groups={groups}
          onCancel={() => setCreatingGroup(false)}
          onCreate={async (name, color, count) => {
            const g = await store.createGroup(name, color, count);
            await reloadGroups();
            setCreatingGroup(false);
            openGroup(g.id);
          }}
        />
      )}
    </>
  );
}
