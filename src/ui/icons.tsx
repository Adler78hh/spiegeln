/** Einfache, selbst gezeichnete Symbole (24 × 24). */
import type { ReactNode } from 'react';

const Icon = ({ children, size = 32 }: { children: ReactNode; size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

/** Winkelmesser-Symbol für das 15°-Einrasten. */
export const SnapIcon = () => (
  <Icon>
    <path d="M3 20h18" />
    <path d="M3 20 17 6" />
    <path d="M10 20a7 7 0 0 0-2-4.9" />
    <circle cx="17" cy="6" r="1.6" fill="currentColor" />
  </Icon>
);

/** Gestricheltes Haus: Umriss ein/aus. */
export const OutlineIcon = () => (
  <Icon>
    <path d="M4 11 12 4l8 7v9H4z" strokeDasharray="2.6 2.4" />
  </Icon>
);

/** Zwei Anfasspunkte mit nur angedeuteter Achse: Spiegelachse aus/ein. */
export const HideLineIcon = () => (
  <Icon>
    <circle cx="12" cy="4.5" r="2.5" stroke="#e0322b" />
    <circle cx="12" cy="19.5" r="2.5" stroke="#e0322b" />
    <path d="M12 8.5v7" strokeDasharray="1.5 2.5" />
    <path d="M5 19 19 5" />
  </Icon>
);

/** Spiegelachse mit Doppelpfeil: Spiegel umdrehen (andere Seite spiegeln). */
export const FlipIcon = () => (
  <Icon>
    <path d="M12 3v18" stroke="#e0322b" />
    <path d="M4.5 9.5c2-3 5-3 7.5-3s5.5 0 7.5 3" />
    <path d="M4 6.5v3.5h3.5" />
    <path d="M20 6.5v3.5h-3.5" />
    <path d="M6 17h-2" />
    <path d="M20 17h-2" />
  </Icon>
);

export const ResetIcon = () => (
  <Icon>
    <path d="M4 12a8 8 0 1 0 2.4-5.7" />
    <path d="M4 4v4.5h4.5" />
  </Icon>
);

export const BackIcon = () => (
  <Icon>
    <path d="M15 5 8 12l7 7" />
  </Icon>
);

/** Halbe Figur + rote Linie: freies Spiegeln. */
export const MirrorIcon = ({ size = 32 }: { size?: number }) => (
  <Icon size={size}>
    <path d="M11 5 4 19h7z" fill="currentColor" fillOpacity=".25" />
    <path d="M13 5l7 14h-7z" strokeDasharray="2.4 2" />
    <path d="M12 2v20" stroke="#e0322b" />
  </Icon>
);

/** Kleine Bildkacheln: Herausforderungen. */
export const ChallengeIcon = ({ size = 32 }: { size?: number }) => (
  <Icon size={size}>
    <rect x="3" y="3" width="8" height="8" rx="2" />
    <rect x="13" y="3" width="8" height="8" rx="2" />
    <rect x="3" y="13" width="8" height="8" rx="2" />
    <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" fillOpacity=".25" />
  </Icon>
);

export const CheckIcon = ({ size = 32 }: { size?: number }) => (
  <Icon size={size}>
    <path d="M5 12.5 10 17.5 19 7" strokeWidth="3" />
  </Icon>
);

export const CrossIcon = ({ size = 32 }: { size?: number }) => (
  <Icon size={size}>
    <path d="M6 6l12 12M18 6 6 18" strokeWidth="3" />
  </Icon>
);

/** Stern: alle Zielfiguren bearbeitet. */
export const StarIcon = ({ size = 32 }: { size?: number }) => (
  <Icon size={size}>
    <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1-4.5-4.2 6.1-.8z" fill="currentColor" />
  </Icon>
);

/** Fotoapparat: Figur merken. */
export const CameraIcon = ({ size = 32 }: { size?: number }) => (
  <Icon size={size}>
    <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
    <circle cx="12" cy="13" r="3.5" />
  </Icon>
);

export const PenIcon = ({ size = 32 }: { size?: number }) => (
  <Icon size={size}>
    <path d="M4 20l1-5L16 4l4 4L9 19z" />
    <path d="M14 6l4 4" />
  </Icon>
);

export const EraserIcon = () => (
  <Icon>
    <path d="M8 20h12" />
    <path d="M4 15 14 5l6 6-9 9H8z" />
    <path d="M9 10l6 6" />
  </Icon>
);

export const RectIcon = () => (
  <Icon>
    <rect x="4" y="6" width="16" height="12" rx="1" fill="currentColor" fillOpacity=".3" />
  </Icon>
);

export const EllipseIcon = () => (
  <Icon>
    <ellipse cx="12" cy="12" rx="8" ry="6" fill="currentColor" fillOpacity=".3" />
  </Icon>
);

export const TriangleIcon = () => (
  <Icon>
    <path d="M12 4 21 19H3z" fill="currentColor" fillOpacity=".3" />
  </Icon>
);

export const UndoIcon = () => (
  <Icon>
    <path d="M9 7 4 12l5 5" />
    <path d="M4 12h11a5 5 0 0 1 0 10h-3" />
  </Icon>
);

export const TrashIcon = () => (
  <Icon>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </Icon>
);

export const PlusIcon = ({ size = 32 }: { size?: number }) => (
  <Icon size={size}>
    <path d="M12 5v14M5 12h14" strokeWidth="3" />
  </Icon>
);

/** Bild/Foto aus der Galerie. */
export const PhotoIcon = ({ size = 32 }: { size?: number }) => (
  <Icon size={size}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="9" cy="10" r="2" />
    <path d="M3 17l5-5 4 4 3-3 6 6" />
  </Icon>
);

export const GearIcon = ({ size = 32 }: { size?: number }) => (
  <Icon size={size}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
    <circle cx="12" cy="12" r="6.5" />
  </Icon>
);

export const PeopleIcon = ({ size = 32 }: { size?: number }) => (
  <Icon size={size}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <circle cx="17" cy="9" r="2.8" />
    <path d="M16 14.2a5 5 0 0 1 6 4.8" />
  </Icon>
);

export const ListIcon = ({ size = 32 }: { size?: number }) => (
  <Icon size={size}>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <path d="M4 6h.01M4 12h.01M4 18h.01" strokeWidth="3.5" />
  </Icon>
);

export const ShuffleIcon = () => (
  <Icon>
    <path d="M3 7h4l10 10h4M3 17h4l3-3M14 10l3-3h4" />
    <path d="M18 4l3 3-3 3M18 14l3 3-3 3" />
  </Icon>
);

export const EditIcon = () => (
  <Icon>
    <path d="M4 20h4L19 9l-4-4L4 16z" />
  </Icon>
);

/** Daumen hoch: Entscheidungen prüfen lassen. */
export const ThumbsUpIcon = ({ size = 32 }: { size?: number }) => (
  <Icon size={size}>
    <path d="M7 10v10H4V10z" fill="currentColor" fillOpacity=".25" />
    <path d="M7 10l4-7c1.5 0 2.5 1.2 2.2 2.7L12.5 9H19a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.8 20H7" />
  </Icon>
);

/** Zweifarbige Umkehr: Form schwarz auf Farbe, gespiegelt Farbe auf Schwarz. */
export const InvertTwoToneIcon = () => (
  <svg viewBox="0 0 24 24" width={32} height={32} aria-hidden="true">
    <rect x="2.5" y="3.5" width="9.5" height="17" rx="1.5" fill="#f28c28" />
    <rect x="12" y="3.5" width="9.5" height="17" rx="1.5" fill="#1d1b19" />
    <path d="M12 7a5 5 0 0 0 0 10z" fill="#1d1b19" />
    <path d="M12 7a5 5 0 0 1 0 10z" fill="#f28c28" />
  </svg>
);

/** Negativ: Spiegelhälfte mit umgekehrten Farben. */
export const InvertNegativeIcon = () => (
  <svg viewBox="0 0 24 24" width={32} height={32} aria-hidden="true">
    <rect x="2.5" y="3.5" width="9.5" height="17" rx="1.5" fill="#fffdf8" stroke="#5b4636" strokeWidth="1.5" />
    <rect x="12" y="3.5" width="9.5" height="17" rx="1.5" fill="#2d2a26" />
    <path d="M12 7a5 5 0 0 0 0 10z" fill="#f28c28" />
    <path d="M12 7a5 5 0 0 1 0 10z" fill="#0d73d7" />
  </svg>
);
