import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Challenge, ChallengeAnswers } from '../../challenges/types';
import { checkAnswers } from '../../challenges/check';
import { findColor, tintOf } from '../../profiles/colors';
import type { ChallengePhotos, Group, Profile, Store } from '../../storage/store';
import { ProfileImage } from '../Avatar';
import { BackIcon, CheckIcon, CrossIcon } from '../icons';

/** Antworten und Sicherungen eines Kindes, je Herausforderung. */
export interface KidData {
  profile: Profile;
  answers: Record<string, ChallengeAnswers>;
  photos: Record<string, ChallengePhotos>;
}

export async function loadKid(store: Store, profile: Profile): Promise<KidData> {
  const [answers, photos] = await Promise.all([store.getAnswers(profile.id), store.getPhotos(profile.id)]);
  return { profile, answers, photos };
}

/** Zielfiguren je Zeile in der Detailansicht und im Ausdruck. */
const PER_ROW = 8;

/**
 * Lösungen eines Kindes zu einer Herausforderung: je Zielfigur ein Dreierpack
 * (Zielfigur, gesicherte Figur, Antwort). Fehlendes bleibt als leeres Feld.
 */
export function SolutionGrid({ challenge, answers, photos }: { challenge: Challenge; answers: ChallengeAnswers; photos: ChallengePhotos }) {
  const result = checkAnswers(challenge, answers);
  const rows: Challenge['targets'][] = [];
  for (let i = 0; i < challenge.targets.length; i += PER_ROW) rows.push(challenge.targets.slice(i, i + PER_ROW));
  return (
    <section className="solution-block">
      <h3 className="solution-title">
        {challenge.name}
        <span className="solution-score">
          richtig {result.correct}/{result.total}
        </span>
      </h3>
      {rows.map((row, r) => (
        <div className="solution-row" key={r}>
          {row.map((t, i) => {
            const a = answers[t.id];
            const p = photos[t.id];
            const ok = result.perTarget[t.id];
            return (
              <div className="solution-pack" key={t.id}>
                <img className="solution-img" src={t.image} alt={`Zielfigur ${r * PER_ROW + i + 1}`} />
                {p ? <img className="solution-img" src={p.image} alt="Gesicherte Figur" /> : <span className="solution-img empty" />}
                <span className={`solution-info ${a ? (ok ? 'right' : 'wrong') : ''}`}>
                  <span className="solution-num">{r * PER_ROW + i + 1}</span>
                  {a && (
                    <>
                      {a.decision === 'fits' ? <CheckIcon size={16} /> : <CrossIcon size={16} />}
                      <span>{ok ? 'richtig' : 'falsch'}</span>
                    </>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}

/** Kopf einer Seite bzw. der Detailansicht: Gruppe, Tier, Name. */
function KidHead({ group, profile, date }: { group: Group; profile: Profile; date?: string }) {
  const tint = tintOf(findColor(group.color).hex);
  return (
    <div className="kid-head">
      <span className="kid-head-avatar" style={{ background: tint }}>
        <ProfileImage profile={profile} />
      </span>
      <span className="kid-head-text">
        <span className="kid-head-group">{group.name}</span>
        <span className="kid-head-name">{profile.name}</span>
      </span>
      {date && <span className="kid-head-date">{date}</span>}
    </div>
  );
}

/** Detailansicht eines Kindes: alle Herausforderungen als Raster. */
export function KidDetail(props: { store: Store; group: Group; profile: Profile; challenges: Challenge[]; onBack: () => void }) {
  const { store, group, profile, challenges, onBack } = props;
  const [data, setData] = useState<KidData | null>(null);
  const [printing, setPrinting] = useState<'pick' | Challenge[] | null>(null);

  useEffect(() => {
    let alive = true;
    loadKid(store, profile).then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, [store, profile]);

  return (
    <div className="kid-detail">
      <div className="sub-header">
        <button className="tool-btn" aria-label="Zurück zur Übersicht" onClick={onBack}>
          <BackIcon />
        </button>
        <KidHead group={group} profile={profile} />
        <button className="text-btn primary print-btn" onClick={() => setPrinting('pick')} disabled={!data}>
          Drucken
        </button>
      </div>
      <p className="hint">Je Zielfigur: oben die Zielfigur, darunter die gesicherte Figur (Fotoapparat), darunter die Antwort.</p>
      {data && challenges.map((c) => <SolutionGrid key={c.id} challenge={c} answers={data.answers[c.id] ?? {}} photos={data.photos[c.id] ?? {}} />)}
      {printing === 'pick' && <PrintDialog challenges={challenges} onCancel={() => setPrinting(null)} onPrint={setPrinting} />}
      {data && Array.isArray(printing) && <PrintSheets group={group} kids={[data]} challenges={printing} onDone={() => setPrinting(null)} />}
    </div>
  );
}

/** „Alle Kinder drucken“: lädt alle Kinder der Gruppe und druckt je Kind eine Seite (oder mehr). */
export function PrintAll(props: { store: Store; group: Group; profiles: Profile[]; challenges: Challenge[]; onDone: () => void }) {
  const { store, group, profiles, challenges, onDone } = props;
  const [picked, setPicked] = useState<Challenge[] | null>(null);
  const [kids, setKids] = useState<KidData[] | null>(null);

  useEffect(() => {
    if (!picked) return;
    let alive = true;
    Promise.all(profiles.map((p) => loadKid(store, p))).then((k) => alive && setKids(k));
    return () => {
      alive = false;
    };
  }, [picked, store, profiles]);

  if (!picked) return <PrintDialog challenges={challenges} onCancel={onDone} onPrint={setPicked} />;
  if (!kids) return null;
  return <PrintSheets group={group} kids={kids} challenges={picked} onDone={onDone} />;
}

const PICK_KEY = 'spiegeln-druckauswahl';

/** Gemerkte Auswahl (nur dieses Gerät); ohne Speicher sind alle angehakt. */
function loadPick(challenges: Challenge[]): Set<string> {
  try {
    const raw = localStorage.getItem(PICK_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as { on: string[]; known: string[] };
      const known = new Set(saved.known);
      // Neu hinzugekommene Herausforderungen sind angehakt.
      return new Set(challenges.map((c) => c.id).filter((id) => saved.on.includes(id) || !known.has(id)));
    }
  } catch {
    /* ohne Speicher: alle */
  }
  return new Set(challenges.map((c) => c.id));
}

function savePick(challenges: Challenge[], on: Set<string>) {
  try {
    localStorage.setItem(PICK_KEY, JSON.stringify({ on: [...on], known: challenges.map((c) => c.id) }));
  } catch {
    /* nicht schlimm */
  }
}

/** Auswahl der Herausforderungen für den Ausdruck. */
export function PrintDialog(props: { challenges: Challenge[]; onPrint: (picked: Challenge[]) => void; onCancel: () => void }) {
  const { challenges, onPrint, onCancel } = props;
  const [on, setOn] = useState(() => loadPick(challenges));
  const toggle = (id: string) =>
    setOn((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const picked = challenges.filter((c) => on.has(c.id));

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label="Drucken">
      <div className="dialog print-dialog">
        <h2>Welche Herausforderungen drucken?</h2>
        <div className="print-quick">
          <button className="text-btn" onClick={() => setOn(new Set(challenges.map((c) => c.id)))}>
            Alle
          </button>
          <button className="text-btn" onClick={() => setOn(new Set())}>
            Keine
          </button>
        </div>
        <ul className="print-list">
          {challenges.map((c) => (
            <li key={c.id}>
              <label className="print-choice">
                <input type="checkbox" checked={on.has(c.id)} onChange={() => toggle(c.id)} />
                <span>{c.name}</span>
                <span className="row-meta">{c.targets.length} Figuren</span>
              </label>
            </li>
          ))}
        </ul>
        <p className="hint">Im Druckfenster lässt sich auch „Als PDF sichern“ wählen.</p>
        <div className="dialog-actions">
          <button className="text-btn" onClick={onCancel}>
            Abbrechen
          </button>
          <button
            className="text-btn primary"
            disabled={picked.length === 0}
            onClick={() => {
              savePick(challenges, on);
              onPrint(picked);
            }}
          >
            Drucken
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Druckansicht: je Kind eine neue Seite mit Gruppe, Tier, Name und
 * Druckdatum, darunter die Raster. Wird nur beim Drucken sichtbar.
 */
function PrintSheets(props: { group: Group; kids: KidData[]; challenges: Challenge[]; onDone: () => void }) {
  const { group, kids, challenges, onDone } = props;
  const ref = useRef<HTMLDivElement>(null);
  const date = new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    let alive = true;
    const finish = () => alive && onDone();
    // Erst drucken, wenn alle Bilder geladen sind.
    const imgs = [...(ref.current?.querySelectorAll('img') ?? [])];
    Promise.all(imgs.map((img) => img.decode().catch(() => undefined))).then(() => {
      if (!alive) return;
      // Die Druckansicht bleibt (unsichtbar) stehen, bis der Druck fertig ist:
      // Auf dem iPad kehrt print() sofort zurück.
      window.addEventListener('afterprint', finish, { once: true });
      window.print();
    });
    return () => {
      alive = false;
      window.removeEventListener('afterprint', finish);
    };
  }, []);

  return createPortal(
    <div className="print-sheets" ref={ref}>
      {kids.map((k) => (
        <article className="print-page" key={k.profile.id}>
          <KidHead group={group} profile={k.profile} date={date} />
          {challenges.map((c) => (
            <SolutionGrid key={c.id} challenge={c} answers={k.answers[c.id] ?? {}} photos={k.photos[c.id] ?? {}} />
          ))}
        </article>
      ))}
    </div>,
    document.body,
  );
}
