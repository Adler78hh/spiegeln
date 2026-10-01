/** Einfache, selbst gezeichnete Symbole (24 × 24). */
import type { ReactNode } from 'react';

const Icon = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
