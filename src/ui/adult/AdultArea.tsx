import { useState } from 'react';
import { GRATIS } from '../../edition';
import { isColorName, suggestGroupName } from '../../profiles/colors';
import { BUILTIN_CHALLENGES, loadChallenges } from '../../challenges/builtin';
import { newDraft, type Draft } from '../../challenges/draft';
import type { Challenge } from '../../challenges/types';
import type { MotifInfo } from '../../motifs/library';
import { newId, type CustomMotif, type Group, type Profile, type Store } from '../../storage/store';
import { MotifCreator } from '../MotifCreator';
import { AdultHome } from './AdultHome';
import { ChallengeIcon, PeopleIcon, PhotoIcon } from '../icons';
import { ChallengeEditor } from './ChallengeEditor';
import { ChallengeManager } from './ChallengeManager';
import { MotifManager } from './MotifManager';
import { GroupList, GroupPage, NewGroupDialog, type GroupTab } from './Groups';
import { Results } from './Results';

interface Props {
  store: Store;
  groups: Group[];
  onGroupsChange: (g: Group[]) => void;
  profiles: Profile[];
  onProfilesChange: (p: Profile[]) => void;
  customMotifs: CustomMotif[];
  onCustomMotifsChange: (m: CustomMotif[]) => void;
  motifs: MotifInfo[];
  challenges: Challenge[];
  onChallengesChange: (c: Challenge[]) => void;
  onExit: () => void;
}

type AdultSection = 'groups' | 'motifs' | 'challenges';

const SPIEGELN_TILES = [
  { id: 'groups', label: 'Gruppen', icon: <PeopleIcon size={56} />, hint: 'Kinder und Ergebnisse je Gruppe' },
  { id: 'challenges', label: 'Herausforderungen', icon: <ChallengeIcon size={56} />, hint: 'Eigene erstellen und bearbeiten' },
  { id: 'motifs', label: 'Eigene Motive', icon: <PhotoIcon size={56} />, hint: 'Fotos und Zeichnungen verwalten' },
] as const;

const BUILTIN_IDS = new Set(BUILTIN_CHALLENGES.map((c) => c.id));

function draftFrom(c: Challenge): Draft {
  return {
    id: c.id,
    name: c.name,
    motifId: c.motifId,
    plannedTotal: c.plan?.total ?? c.targets.length,
    plannedUnsolvable: c.plan?.unsolvable ?? c.targets.filter((t) => !t.solvable).length,
    targets: c.targets.map((t) => ({ ...t, raw: t.raw ?? t.image })),
  };
}

/** Erwachsenenbereich: Gruppen (Kinder, Ergebnisse), Herausforderungen, eigene Motive. */
export function AdultArea(props: Props) {
  const { store, groups, onGroupsChange, profiles, onProfilesChange, customMotifs, onCustomMotifsChange, motifs, challenges, onChallengesChange, onExit } = props;
  const [section, setSection] = useState<AdultSection | null>(null);
  const [editing, setEditing] = useState<{ draft: Draft; createdAt: number } | null>(null);
  // Motiv anlegen: von wo aus (Motivverwaltung oder Startfigur-Auswahl)?
  const [creatingMotif, setCreatingMotif] = useState<null | 'motifs' | 'pick'>(null);
  const [picking, setPicking] = useState(false);
  const [newMotifId, setNewMotifId] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [groupTab, setGroupTab] = useState<GroupTab>('kids');
  const [resultCell, setResultCell] = useState<{ profileId: string; challengeId: string } | null>(null);
  const [creatingGroup, setCreatingGroup] = useState(false);

  const reloadGroups = async () => {
    onGroupsChange(await store.listGroups());
    onProfilesChange(await store.listProfiles());
  };

  const openGroup = (id: string | null) => {
    setGroupId(id);
    setGroupTab('kids');
    setResultCell(null);
  };

  const reloadChallenges = async () => onChallengesChange(await loadChallenges(store));

  const resultsOf = (group: Group) => (
    <Results
      store={store}
      group={group}
      profiles={profiles.filter((p) => p.groupId === group.id)}
      challenges={challenges}
      motifs={motifs}
      open={resultCell}
      onOpen={setResultCell}
    />
  );

  // Gratisversion: nur die eine Klasse mit Namen und Ergebnissen.
  if (GRATIS && groups[0]) {
    return (
      <GroupPage
        store={store}
        group={groups[0]}
        groups={groups}
        profiles={profiles}
        onProfilesChange={onProfilesChange}
        onRename={async () => {}}
        onRecolor={async () => {}}
        onDelete={async () => {}}
        tab={groupTab}
        onTabChange={(t) => {
          setGroupTab(t);
          setResultCell(null);
        }}
        results={resultsOf(groups[0])}
        onBack={onExit}
        limited
      />
    );
  }

  if (creatingMotif) {
    return (
      <MotifCreator
        onCancel={() => setCreatingMotif(null)}
        onSave={async (m) => {
          const created = await store.addMotif(m);
          onCustomMotifsChange(await store.listMotifs());
          setNewMotifId(created.id);
          setCreatingMotif(null);
        }}
      />
    );
  }

  if (editing) {
    const motif = motifs.find((m) => m.id === editing.draft.motifId);
    if (motif) {
      return (
        <ChallengeEditor
          draft={editing.draft}
          motif={motif}
          onCancel={() => setEditing(null)}
          onSave={async (c) => {
            await store.saveChallenge({ ...c, createdAt: editing.createdAt }, false, editing.createdAt);
            await reloadChallenges();
            setEditing(null);
          }}
        />
      );
    }
  }

  switch (section) {
    case 'groups': {
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
            onTabChange={(t) => {
              setGroupTab(t);
              setResultCell(null);
            }}
            results={resultsOf(group)}
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
    case 'motifs':
      return (
        <MotifManager
          store={store}
          motifs={customMotifs}
          challenges={challenges}
          onChange={onCustomMotifsChange}
          onCreate={() => setCreatingMotif('motifs')}
          onBack={() => setSection(null)}
        />
      );
    case 'challenges':
      return (
        <ChallengeManager
          challenges={challenges.map((c) => ({ ...c, builtin: BUILTIN_IDS.has(c.id) }))}
          motifs={motifs}
          picking={picking}
          onPickingChange={setPicking}
          onCreateMotif={() => setCreatingMotif('pick')}
          highlightMotifId={newMotifId}
          onNew={(motifId) => {
            setPicking(false);
            setNewMotifId(null);
            const motif = motifs.find((m) => m.id === motifId);
            setEditing({ draft: newDraft(`eigen-${newId()}`, motifId, motif?.name ?? 'Neue Herausforderung'), createdAt: Date.now() });
          }}
          onEdit={(c) => setEditing({ draft: draftFrom(c), createdAt: c.createdAt ?? Date.now() })}
          onDelete={async (id) => {
            await store.deleteChallenge(id);
            await reloadChallenges();
          }}
          onBack={() => {
            setPicking(false);
            setSection(null);
          }}
        />
      );
    default:
      return <AdultHome tiles={SPIEGELN_TILES} onOpen={setSection} onExit={onExit} />;
  }
}
