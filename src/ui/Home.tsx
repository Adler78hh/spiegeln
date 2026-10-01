import { ChallengeIcon, MirrorIcon } from './icons';

interface Props {
  onFree: () => void;
  onChallenges: () => void;
}

/** Startbildschirm: zwei große Kacheln. */
export function Home({ onFree, onChallenges }: Props) {
  return (
    <div className="home">
      <button className="home-tile" onClick={onFree}>
        <MirrorIcon size={120} />
        <span>Freies Spiegeln</span>
      </button>
      <button className="home-tile" onClick={onChallenges}>
        <ChallengeIcon size={120} />
        <span>Herausforderungen</span>
      </button>
    </div>
  );
}
