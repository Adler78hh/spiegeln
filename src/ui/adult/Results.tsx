import { useEffect, useState } from 'react';
import type { Answer, Challenge, ChallengeAnswers } from '../../challenges/types';
import type { MotifInfo } from '../../motifs/library';
import { animalImageUrl } from '../../profiles/animals';
import type { Profile, Store } from '../../storage/store';
import { CheckIcon, CrossIcon } from '../icons';
import { MirrorCanvas } from '../MirrorCanvas';
import { useMotifImage } from '../useMotifImage';
import { AdultPage } from './AdultPage';

interface Props {
  store: Store;
  profiles: Profile[];
  challenges: Challenge[];
  motifs: MotifInfo[];
  onBack: () => void;
}

/** Ergebnisübersicht: Profil → Herausforderung → Eingaben je Zielfigur. */
export function Results({ store, profiles, challenges, motifs, onBack }: Props) {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, ChallengeAnswers>>({});
  const [detail, setDetail] = useState<{ targetIndex: number; answer: Answer } | null>(null);

  useEffect(() => {
    if (profileId) store.getAnswers(profileId).then(setAnswers);
  }, [store, profileId]);

  const profile = profiles.find((p) => p.id === profileId);
  const challenge = challenges.find((c) => c.id === challengeId);

  if (!profile) {
    return (
      <AdultPage title="Ergebnisse: Profil wählen" onBack={onBack}>
        <div className="result-profiles">
          {profiles.map((p) => (
            <button key={p.id} className="profile-tile small" onClick={() => setProfileId(p.id)}>
              <img src={animalImageUrl(p.animal)} alt="" />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </AdultPage>
    );
  }

  if (!challenge) {
    return (
      <AdultPage title={`Ergebnisse von ${profile.name}`} onBack={() => setProfileId(null)}>
        <ul className="manage-list">
          {challenges.map((c) => {
            const a = answers[c.id] ?? {};
            const fits = c.targets.filter((t) => a[t.id]?.decision === 'fits').length;
            const impossible = c.targets.filter((t) => a[t.id]?.decision === 'impossible').length;
            const open = c.targets.length - fits - impossible;
            const motif = motifs.find((m) => m.id === c.motifId);
            return (
              <li key={c.id}>
                <button className="manage-row as-button" onClick={() => setChallengeId(c.id)}>
                  {motif && <img className="motif-thumb" src={motif.src} alt="" />}
                  <strong className="row-title">{c.name}</strong>
                  <span className="row-meta">
                    {fits} Passt · {impossible} Geht nicht · {open} noch offen
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </AdultPage>
    );
  }

  const a = answers[challenge.id] ?? {};
  const motif = motifs.find((m) => m.id === challenge.motifId);

  return (
    <AdultPage title={`${profile.name}: ${challenge.name}`} onBack={() => setChallengeId(null)}>
      <table className="result-table">
        <thead>
          <tr>
            <th>Nr.</th>
            <th>Zielfigur</th>
            <th>Eingabe des Kindes</th>
            <th>Spiegelergebnis des Kindes</th>
          </tr>
        </thead>
        <tbody>
          {challenge.targets.map((t, i) => {
            const ans = a[t.id];
            return (
              <tr key={t.id} className={ans ? 'clickable' : ''} onClick={() => ans && setDetail({ targetIndex: i, answer: ans })}>
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
                <td>{ans?.snapshot && <img className="result-img" src={ans.snapshot} alt="Spiegelergebnis" />}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="hint">Eine bearbeitete Zeile antippen, um die gespeicherte Konfiguration groß zu sehen.</p>

      {detail && motif && (
        <ResultDetail
          motif={motif}
          answer={detail.answer}
          targetImage={challenge.targets[detail.targetIndex].image}
          number={detail.targetIndex + 1}
          onClose={() => setDetail(null)}
        />
      )}
    </AdultPage>
  );
}

function ResultDetail(props: { motif: MotifInfo; answer: Answer; targetImage: string; number: number; onClose: () => void }) {
  const { motif, answer, targetImage, number, onClose } = props;
  const image = useMotifImage(motif);
  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label={`Figur ${number}`}>
      <div className="dialog result-detail">
        <div className="result-detail-body">
          <div className="result-work">
            <MirrorCanvas
              image={image}
              imageSize={{ width: motif.aspect, height: 1 }}
              scene={answer.scene}
              onSceneChange={() => {}}
              snap={false}
              showOutline={false}
              interactive={false}
            />
          </div>
          <div className="result-target">
            <p>Zielfigur {number}</p>
            <img src={targetImage} alt="" />
            <p className={`answer ${answer.decision}`}>{answer.decision === 'fits' ? 'Passt' : 'Geht nicht'}</p>
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
