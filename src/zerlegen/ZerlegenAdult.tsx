import { useState } from 'react';
import { isColorName, suggestGroupName } from '../profiles/colors';
import type { Group, Profile, Store } from '../storage/store';
import { PeopleIcon } from '../ui/icons';
import { AdultHome } from '../ui/adult/AdultHome';
import { GroupList, GroupPage, NewGroupDialog, type GroupTab } from '../ui/adult/Groups';

interface Props {
  store: Store;
  groups: Group[];
  onGroupsChange: (g: Group[]) => void;
  profiles: Profile[];
  onProfilesChange: (p: Profile[]) => void;
  onExit: () => void;
}

const TILES = [{ id: 'groups', label: 'Gruppen', icon: <PeopleIcon size={56} />, hint: 'Kinder und Ergebnisse je Gruppe' }] as const;

/** Erwachsenenbereich von Zerlegen: Gruppen mit Kindern, wie bei Spiegeln. */
export function ZerlegenAdult({ store, groups, onGroupsChange, profiles, onProfilesChange, onExit }: Props) {
  const [section, setSection] = useState<'groups' | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [groupTab, setGroupTab] = useState<GroupTab>('kids');
  const [creatingGroup, setCreatingGroup] = useState(false);

  const reloadGroups = async () => {
    onGroupsChange(await store.listGroups());
    onProfilesChange(await store.listProfiles());
  };

  const openGroup = (id: string | null) => {
    setGroupId(id);
    setGroupTab('kids');
  };

  if (section !== 'groups') return <AdultHome tiles={TILES} onOpen={setSection} onExit={onExit} />;

  const group = groups.find((g) => g.id === groupId);
  if (group) {
    return (
      <GroupPage
        store={store}
        group={group}
        groups={groups}
        profiles={profiles}
        onProfilesChange={onProfilesChange}
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
        tab={groupTab}
        onTabChange={setGroupTab}
        results={<p className="empty">Ergebnisse erscheinen hier, sobald es Übungen gibt.</p>}
        onBack={() => openGroup(null)}
      />
    );
  }
  return (
    <>
      <GroupList groups={groups} profiles={profiles} onOpen={openGroup} onNew={() => setCreatingGroup(true)} onBack={() => setSection(null)} />
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
