import { useState } from 'react';
import { BUILTIN_CHALLENGES, loadChallenges } from '../../challenges/builtin';
import { newDraft, type Draft } from '../../challenges/draft';
import type { Challenge } from '../../challenges/types';
import type { MotifInfo } from '../../motifs/library';
import { newId, type CustomMotif, type Profile, type Store } from '../../storage/store';
import { MotifCreator } from '../MotifCreator';
import { AdultHome, type AdultSection } from './AdultHome';
import { ChallengeEditor } from './ChallengeEditor';
import { ChallengeManager } from './ChallengeManager';
import { MotifManager } from './MotifManager';
import { ProfileManager } from './ProfileManager';
import { Results } from './Results';

interface Props {
  store: Store;
  profiles: Profile[];
  onProfilesChange: (p: Profile[]) => void;
  customMotifs: CustomMotif[];
  onCustomMotifsChange: (m: CustomMotif[]) => void;
  motifs: MotifInfo[];
  challenges: Challenge[];
  onChallengesChange: (c: Challenge[]) => void;
  onExit: () => void;
}

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

/** Erwachsenenbereich: Editor, Ergebnisse, Profile, eigene Motive. */
export function AdultArea(props: Props) {
  const { store, profiles, onProfilesChange, customMotifs, onCustomMotifsChange, motifs, challenges, onChallengesChange, onExit } = props;
  const [section, setSection] = useState<AdultSection | null>(null);
  const [editing, setEditing] = useState<{ draft: Draft; createdAt: number } | null>(null);
  const [creatingMotif, setCreatingMotif] = useState(false);

  const reloadChallenges = async () => onChallengesChange(await loadChallenges(store));

  if (creatingMotif) {
    return (
      <MotifCreator
        onCancel={() => setCreatingMotif(false)}
        onSave={async (m) => {
          await store.addMotif(m);
          onCustomMotifsChange(await store.listMotifs());
          setCreatingMotif(false);
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
    case 'profiles':
      return <ProfileManager store={store} profiles={profiles} onChange={onProfilesChange} onBack={() => setSection(null)} />;
    case 'motifs':
      return (
        <MotifManager
          store={store}
          motifs={customMotifs}
          challenges={challenges}
          onChange={onCustomMotifsChange}
          onCreate={() => setCreatingMotif(true)}
          onBack={() => setSection(null)}
        />
      );
    case 'challenges':
      return (
        <ChallengeManager
          challenges={challenges.map((c) => ({ ...c, builtin: BUILTIN_IDS.has(c.id) }))}
          motifs={motifs}
          onNew={(motifId) => {
            const motif = motifs.find((m) => m.id === motifId);
            setEditing({ draft: newDraft(`eigen-${newId()}`, motifId, motif?.name ?? 'Neue Herausforderung'), createdAt: Date.now() });
          }}
          onEdit={(c) => setEditing({ draft: draftFrom(c), createdAt: c.createdAt ?? Date.now() })}
          onDelete={async (id) => {
            await store.deleteChallenge(id);
            await reloadChallenges();
          }}
          onBack={() => setSection(null)}
        />
      );
    case 'results':
      return <Results store={store} profiles={profiles} challenges={challenges} motifs={motifs} onBack={() => setSection(null)} />;
    default:
      return <AdultHome onOpen={setSection} onExit={onExit} />;
  }
}
