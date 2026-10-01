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
