import type { ReactNode } from 'react';
import { FlashIcon, PatternIcon, SplitIcon } from '../ui/icons';

export type AreaId = 'blitzsehen' | 'zerlegen' | 'muster';

/** Die drei Bereiche hinter jedem Profil, in dieser Reihenfolge. */
export const AREAS: Array<{ id: AreaId; label: string; icon: (size: number) => ReactNode }> = [
  { id: 'blitzsehen', label: 'Blitzsehen', icon: (size) => <FlashIcon size={size} /> },
  { id: 'zerlegen', label: 'Zerlegen', icon: (size) => <SplitIcon size={size} /> },
  { id: 'muster', label: 'Muster', icon: (size) => <PatternIcon size={size} /> },
];
