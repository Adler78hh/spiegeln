import type { InboxItem, Profile } from '../storage/store';
import { ProfileImage } from './Avatar';
import { ParcelPreview } from './adult/Sharing';
import { BackIcon, CheckIcon, CrossIcon, MailIcon } from './icons';

/** Posteingang eines Kindes: zugeschickte Herausforderungen annehmen oder ablehnen. */
export function KidInbox({ items, onAccept, onReject, onBack }: { items: InboxItem[]; onAccept: (i: InboxItem) => void; onReject: (i: InboxItem) => void; onBack: () => void }) {
  return (
    <div className="list-screen">
      <div className="list-top">
        <button className="tool-btn" aria-label="Zurück" onClick={onBack}>
          <BackIcon />
        </button>
        <MailIcon size={40} />
      </div>
      {items.length === 0 && (
        <p className="empty-inbox">
          <MailIcon size={56} /> Leer
        </p>
      )}
      <div className="kid-inbox">
        {items.map((item) => (
          <div key={item.id} className="kid-inbox-item">
            <span className="kid-inbox-from">
              <ProfileImage profile={{ name: item.from.name, animal: (item.from.animal ?? null) as Profile['animal'] }} />
              <span>{item.from.name}</span>
            </span>
            <img className="kid-inbox-figure" src={item.motif.image} alt="" />
            <ParcelPreview challenge={item.challenge} count={4} />
            <span className="kid-inbox-actions">
              <button className="kid-action primary small" aria-label="Annehmen" onClick={() => onAccept(item)}>
                <CheckIcon size={40} />
              </button>
              <button className="kid-action small" aria-label="Ablehnen" onClick={() => onReject(item)}>
                <CrossIcon size={40} />
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
