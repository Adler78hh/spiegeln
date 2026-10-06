import { useEffect, useState } from 'react';
import type { Answer, Challenge, ChallengeAnswers } from '../../challenges/types';
import type { MotifInfo } from '../../motifs/library';
import { checkAnswers } from '../../challenges/check';
import { findColor, tintOf } from '../../profiles/colors';
import type { ChallengePhotos, Group, Photo, Profile, Store } from '../../storage/store';
import { ProfileImage } from '../Avatar';
import { BackIcon, CheckIcon, CrossIcon } from '../icons';
import { MirrorCanvas } from '../MirrorCanvas';
import { useMotifImage } from '../useMotifImage';
import { KidDetail, PrintAll } from './KidSheet';

interface Props {
  store: Store;
  group: Group;
  /** Kinder der Gruppe. */
  profiles: Profile[];
  challenges: Challenge[];
  motifs: MotifInfo[];
  /** Gewähltes Kind (Detailansicht) oder Zelle Kind × Herausforderung, vom Elternteil gehalten. */
  open: ResultCell | null;
  onOpen: (cell: ResultCell | null) => void;
}

export interface ResultCell {
  profileId: string;
  /** Ohne Herausforderung: Detailansicht des Kindes. */
  challengeId?: string;
}

/** Ergebnisse einer Gruppe: Kinder × Herausforderungen, Antippen zeigt Details. */
export function Results({ store, group, profiles, challenges, motifs, open, onOpen }: Props) {
  const [answers, setAnswers] = useState<Record<string, Record<string, ChallengeAnswers>> | null>(null);
  const [photos, setPhotos] = useState<Record<string, Record<string, ChallengePhotos>>>({});
  // Zähler statt Schalter: jedes Antippen öffnet das Druckmenü neu.
  const [printAll, setPrintAll] = useState(0);
  const tint = tintOf(findColor(group.color).hex);

  const ids = profiles.map((p) => p.id).join(',');
  useEffect(() => {
    let alive = true;
    Promise.all(ids.split(',').filter(Boolean).map(async (id) => [id, await store.getAnswers(id)] as const)).then((all) => {
      if (alive) setAnswers(Object.fromEntries(all));
    });
    Promise.all(ids.split(',').filter(Boolean).map(async (id) => [id, await store.getPhotos(id)] as const)).then((all) => {
      if (alive) setPhotos(Object.fromEntries(all));
    });
    return () => {
      alive = false;
    };
  }, [store, ids]);

  if (!answers) return null;

  const profile = open && profiles.find((p) => p.id === open.profileId);
  const challenge = open && challenges.find((c) => c.id === open.challengeId);
  if (profile && !open.challengeId) {
    return <KidDetail store={store} group={group} profile={profile} challenges={challenges} onBack={() => onOpen(null)} />;
  }
  if (profile && challenge) {
    return (
      <ChallengeResult
        profile={profile}
        challenge={challenge}
        answers={answers[profile.id]?.[challenge.id] ?? {}}
        photos={photos[profile.id]?.[challenge.id] ?? {}}
        motif={motifs.find((m) => m.id === challenge.motifId)}
        onBack={() => onOpen(null)}
      />
    );
  }

  if (profiles.length === 0) return <p className="empty">In dieser Gruppe gibt es noch keine Kinder.</p>;

  return (
    <>
      <div className="results-actions">
        <button className="text-btn primary" onClick={() => setPrintAll((n) => n + 1)}>
          Alle Kinder drucken
        </button>
      </div>
      {printAll > 0 && <PrintAll key={printAll} store={store} group={group} profiles={profiles} challenges={challenges} onDone={() => setPrintAll(0)} />}
      <div className="matrix-scroll">
        <table className="result-matrix">
          <thead>
            <tr>
              <th className="kid-col">Kind</th>
              {challenges.map((c) => {
                const motif = motifs.find((m) => m.id === c.motifId);
                return (
                  <th key={c.id}>
                    {motif && <img className="matrix-motif" src={motif.src} alt="" />}
                    <span>{c.name}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id}>
                <th className="kid-col" scope="row">
                  <button className="matrix-kid" aria-label={`${p.name}: Detailansicht`} onClick={() => onOpen({ profileId: p.id })}>
                    <span className="matrix-avatar" style={{ background: tint }}>
                      <ProfileImage profile={p} />
                    </span>
                    {p.name}
                  </button>
                </th>
                {challenges.map((c) => {
                  const a = answers[p.id]?.[c.id];
                  const started = a && c.targets.some((t) => a[t.id]);
                  const result = started ? checkAnswers(c, a) : null;
                  return (
                    <td key={c.id}>
                      <button
                        className={`matrix-cell ${result ? '' : 'empty-cell'}`}
                        aria-label={`${p.name}, ${c.name}: ${result ? `richtig ${result.correct} von ${result.total}` : 'noch nicht begonnen'}`}
                        onClick={() => onOpen({ profileId: p.id, challengeId: c.id })}
                      >
                        {result ? `richtig ${result.correct}/${result.total}` : '–'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="hint">„richtig“ zählt die Entscheidungen „Passt“/„Geht nicht“, die stimmen; offene Figuren zählen als nicht richtig. Ein Kind antippen für seine Detailansicht mit allen Herausforderungen, ein Feld antippen für die Einzelheiten.</p>
    </>
  );
}

/** Eingaben eines Kindes zu einer Herausforderung, je Zielfigur. */
function ChallengeResult(props: {
  profile: Profile;
  challenge: Challenge;
  answers: ChallengeAnswers;
  photos: ChallengePhotos;
  motif: MotifInfo | undefined;
  onBack: () => void;
}) {
  const { profile, challenge, answers: a, photos, motif, onBack } = props;
  const [detail, setDetail] = useState<{ targetIndex: number; answer?: Answer; photo?: Photo } | null>(null);

  return (
    <div className="challenge-result">
      <div className="sub-header">
        <button className="tool-btn" aria-label="Zurück zur Übersicht" onClick={onBack}>
          <BackIcon />
        </button>
        <h2>
          {profile.name}: {challenge.name}
        </h2>
      </div>
      <table className="result-table">
        <thead>
          <tr>
            <th>Nr.</th>
            <th>Zielfigur</th>
            <th>Eingabe des Kindes</th>
            <th>Gesicherte Figur</th>
          </tr>
        </thead>
        <tbody>
          {challenge.targets.map((t, i) => {
            const ans = a[t.id];
            const photo = photos[t.id];
            const open = ans || photo;
            return (
              <tr key={t.id} className={open ? 'clickable' : ''} onClick={() => open && setDetail({ targetIndex: i, answer: ans, photo })}>
                <td className="num">{i + 1}</td>
                <td>
                  <img className="result-img" src={t.image} alt="" />
                  <span className={`chip ${t.solvable ? 'fits' : 'impossible'}`}>{t.solvable ? 'lösbar' : 'unlösbar'}</span>
                </td>
                <td>
                  {!ans && <span className="answer open">noch offen</span>}
                  {ans?.decision === 'fits' && (
                    <span className="answer fits">
                      <CheckIcon size={20} /> Passt
                    </span>
                  )}
                  {ans?.decision === 'impossible' && (
                    <span className="answer impossible">
                      <CrossIcon size={20} /> Geht nicht
                    </span>
                  )}
                </td>
                <td>{photo && <img className="result-img" src={photo.image} alt="Gesicherte Figur" />}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="hint">Eine bearbeitete Zeile antippen, um die gesicherte Lage (sonst die Lage beim Antworten) groß zu sehen.</p>

      {detail && motif && (
        <ResultDetail
          motif={motif}
          answer={detail.answer}
          photo={detail.photo}
          targetImage={challenge.targets[detail.targetIndex].image}
          number={detail.targetIndex + 1}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}

/** Groß: gesicherte Lage (sonst die Lage beim Antworten) neben der Zielfigur. */
function ResultDetail(props: { motif: MotifInfo; answer?: Answer; photo?: Photo; targetImage: string; number: number; onClose: () => void }) {
  const { motif, answer, photo, targetImage, number, onClose } = props;
  const scene = photo?.scene ?? answer?.scene;
  const image = useMotifImage(motif);
  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label={`Figur ${number}`}>
      <div className="dialog result-detail">
        <div className="result-detail-body">
          <div className="result-work">
            <MirrorCanvas
              image={image}
              imageSize={{ width: motif.aspect, height: 1 }}
              scene={scene!}
              onSceneChange={() => {}}
              snap={false}
              showOutline={false}
              interactive={false}
            />
          </div>
          <div className="result-target">
            <p>Zielfigur {number}</p>
            <img src={targetImage} alt="" />
            {answer && <p className={`answer ${answer.decision}`}>{answer.decision === 'fits' ? 'Passt' : 'Geht nicht'}</p>}
            <p>{photo ? 'gesicherte Lage' : 'Lage beim Antworten'}</p>
          </div>
        </div>
        <div className="dialog-actions">
          <button className="text-btn primary" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
