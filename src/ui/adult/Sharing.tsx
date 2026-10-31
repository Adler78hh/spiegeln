import { useRef, useState } from 'react';
import type { Answer, Challenge, ChallengeAnswers } from '../../challenges/types';
import type { MotifInfo } from '../../motifs/library';
import { checkParcelFile, DEFAULT_PREFS, type ChallengePhotos, type Group, type InboxItem, type Parcel, type Photo, type Profile, type Store, type ToolPrefs } from '../../storage/store';
import { ProfileImage } from '../Avatar';
import { ChallengePlay } from '../ChallengePlay';
import { downloadJson, safeFileName } from '../download';
import { CheckIcon, ChallengeIcon, CrossIcon, MailIcon, SendIcon } from '../icons';
import { AdultPage } from './AdultPage';

/** Die ersten Zielfiguren als kleine Vorschau. */
export function ParcelPreview({ challenge, count = 6 }: { challenge: Challenge; count?: number }) {
  return (
    <span className="parcel-preview">
      {challenge.targets.slice(0, count).map((t) => (
        <img key={t.id} src={t.image} alt="" />
      ))}
    </span>
  );
}

/** Die Lehrkraft spielt eine Herausforderung zum Test; nichts wird gespeichert. */
export function TestPlay({ challenge, motif, onBack }: { challenge: Challenge; motif: MotifInfo | undefined; onBack: () => void }) {
  const [answers, setAnswers] = useState<ChallengeAnswers>({});
  const [photos, setPhotos] = useState<ChallengePhotos>({});
  const [prefs, setPrefs] = useState<ToolPrefs>(DEFAULT_PREFS);
  return (
    <ChallengePlay
      challenge={challenge}
      motif={motif}
      answers={answers}
      onAnswer={(id: string, a: Answer) => setAnswers((all) => ({ ...all, [id]: a }))}
      photos={photos}
      onPhoto={(id: string, p: Photo | null) =>
        setPhotos(({ [id]: _old, ...rest }) => (p ? { ...rest, [id]: p } : rest))
      }
      prefs={prefs}
      onPrefsChange={setPrefs}
      onBack={onBack}
    />
  );
}

/** An eine andere Gruppe auf diesem Gerät oder als Datei an ein anderes Gerät verschicken. */
function SendDialog(props: { store: Store; parcel: () => Promise<Parcel>; groups: Group[]; fromGroupId: string; onDone: (text: string) => void; onCancel: () => void }) {
  const { store, parcel, groups, fromGroupId, onDone, onCancel } = props;
  const others = groups.filter((g) => g.id !== fromGroupId);
  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label="An Gruppe senden">
      <div className="dialog send-dialog">
        <h2>An Gruppe senden</h2>
        {others.length > 0 && <p className="hint">Auf diesem Gerät: Die Herausforderung landet im Posteingang der Gruppe.</p>}
        <div className="send-targets">
          {others.map((g) => (
            <button
              key={g.id}
              className="text-btn"
              onClick={async () => {
                await store.send(await parcel(), { groupId: g.id });
                onDone(`An „${g.name}“ gesendet.`);
              }}
            >
              <SendIcon size={22} /> {g.name}
            </button>
          ))}
        </div>
        <p className="hint">Für ein anderes Gerät: als Datei speichern und z. B. per AirDrop oder E-Mail weitergeben. Dort im Posteingang „Datei öffnen“.</p>
        <button
          className="text-btn"
          onClick={async () => {
            const p = await parcel();
            downloadJson({ app: 'spiegeln', type: 'herausforderung', format: 1, parcel: p }, `spiegeln-${safeFileName(p.challenge.name)}.json`);
            onDone('Datei gespeichert.');
          }}
        >
          Als Datei speichern …
        </button>
        <div className="dialog-actions">
          <button className="text-btn" onClick={onCancel}>
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}

/** Alle Herausforderungen, die die Kinder einer Gruppe selbst gemacht haben. */
export function KidChallengesPage(props: {
  store: Store;
  group: Group;
  groups: Group[];
  profiles: Profile[];
  challenges: Challenge[];
  onTest: (c: Challenge) => void;
  onAdopted: () => Promise<void>;
  onBack: () => void;
}) {
  const { store, group, groups, profiles, challenges, onTest, onAdopted, onBack } = props;
  const [sending, setSending] = useState<{ c: Challenge; kid: Profile } | null>(null);
  const [notice, setNotice] = useState<{ id: string; text: string } | null>(null);
  const kids = profiles.filter((p) => p.groupId === group.id);
  const own = (kid: Profile) => challenges.filter((c) => c.ownerProfileId === kid.id && !c.receivedFrom);
  const withChallenges = kids.filter((k) => own(k).length > 0);

  return (
    <AdultPage title={`Herausforderungen der Kinder · ${group.name}`} onBack={onBack}>
      {withChallenges.length === 0 && <p className="hint">Noch hat kein Kind dieser Gruppe eine eigene Herausforderung gemacht.</p>}
      {withChallenges.map((kid) => (
        <section key={kid.id} className="kid-challenges">
          <h2 className="kid-challenges-head">
            <ProfileImage profile={kid} /> {kid.name}
          </h2>
          {own(kid).map((c) => (
            <div key={c.id} className="parcel-row">
              <ParcelPreview challenge={c} />
              <span className="parcel-actions">
                <button className="text-btn" onClick={() => onTest(c)}>
                  <ChallengeIcon size={22} /> Testen
                </button>
                <button
                  className="text-btn"
                  onClick={async () => {
                    const name = `${c.name} (${kid.name})`;
                    await store.adopt(await store.pack(c, { name: kid.name, animal: kid.animal, groupName: group.name }), { onlyGroupId: group.id, name, received: false });
                    await onAdopted();
                    setNotice({ id: c.id, text: `Übernommen als „${name}“, freigeschaltet nur für ${group.name}.` });
                  }}
                >
                  <CheckIcon size={22} /> Übernehmen
                </button>
                <button className="text-btn" onClick={() => setSending({ c, kid })}>
                  <SendIcon size={22} /> An Gruppe senden
                </button>
              </span>
              {notice?.id === c.id && <p className="hint notice">{notice.text}</p>}
            </div>
          ))}
        </section>
      ))}
      {sending && (
        <SendDialog
          store={store}
          groups={groups}
          fromGroupId={group.id}
          parcel={() => store.pack(sending.c, { name: sending.kid.name, animal: sending.kid.animal, groupName: group.name })}
          onCancel={() => setSending(null)}
          onDone={(text) => {
            setNotice({ id: sending.c.id, text });
            setSending(null);
          }}
        />
      )}
    </AdultPage>
  );
}

/** Absender in einer Zeile: Tier, Name, Gruppe. */
function SenderLine({ item }: { item: Parcel }) {
  return (
    <span className="sender-line">
      {item.from.animal !== undefined && <ProfileImage profile={{ name: item.from.name, animal: (item.from.animal ?? null) as Profile['animal'] }} />}
      <strong>{item.challenge.name}</strong>
      <span className="row-meta">
        von {item.from.name}
        {item.from.groupName && item.from.groupName !== item.from.name ? ` (${item.from.groupName})` : ''}
      </span>
    </span>
  );
}

/** Posteingang einer Gruppe: verschickte Herausforderungen annehmen oder ablehnen. */
export function GroupInboxPage(props: { store: Store; group: Group; items: InboxItem[]; onChanged: () => Promise<void>; onAccepted: () => Promise<void>; onBack: () => void }) {
  const { store, group, items, onChanged, onAccepted, onBack } = props;
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const mine = items.filter((i) => i.toGroupId === group.id);

  const open = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      const parcel = checkParcelFile(JSON.parse(await file.text()));
      await store.send(parcel, { groupId: group.id });
      await onChanged();
    } catch (e) {
      setError(e instanceof SyntaxError ? 'Die Datei konnte nicht gelesen werden.' : (e as Error).message);
    }
  };

  return (
    <AdultPage
      title={`Posteingang · ${group.name}`}
      onBack={onBack}
      actions={
        <button className="text-btn" onClick={() => fileRef.current?.click()}>
          Datei öffnen …
        </button>
      }
    >
      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={(e) => {
          void open(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <p className="hint">
        Herausforderungen, die an diese Gruppe geschickt wurden. Angenommene stehen danach unter „Herausforderungen“ und sind zunächst nur für diese Gruppe
        freigeschaltet.
      </p>
      {error && <p className="warning-text">{error}</p>}
      {notice && <p className="hint notice">{notice}</p>}
      {mine.length === 0 && (
        <p className="empty-inbox">
          <MailIcon size={40} /> Der Posteingang ist leer.
        </p>
      )}
      {mine.map((item) => (
        <div key={item.id} className="parcel-row">
          <SenderLine item={item} />
          <ParcelPreview challenge={item.challenge} />
          <span className="parcel-actions">
            <button
              className="text-btn primary"
              onClick={async () => {
                await store.adopt(item, { onlyGroupId: group.id, received: true });
                await store.deleteInbox(item.id);
                await onAccepted();
                await onChanged();
                setNotice(`„${item.challenge.name}“ angenommen.`);
              }}
            >
              <CheckIcon size={22} /> Annehmen
            </button>
            <button
              className="text-btn"
              onClick={async () => {
                await store.deleteInbox(item.id);
                await onChanged();
              }}
            >
              <CrossIcon size={22} /> Ablehnen
            </button>
          </span>
        </div>
      ))}
    </AdultPage>
  );
}
