/**
 * Gemeinsame Sicht auf vorinstallierte und eigene Motive.
 */
import type { CustomMotif } from '../storage/store';
import { BUILTIN_MOTIFS, svgDataUrl } from './builtin';

export interface MotifInfo {
  id: string;
  name: string;
  /** Bildquelle (Daten-URL). */
  src: string;
  /** Seitenverhältnis Breite / Höhe. */
  aspect: number;
  builtin: boolean;
}

export const BUILTIN_MOTIF_INFOS: MotifInfo[] = BUILTIN_MOTIFS.map((m) => ({
  id: m.id,
  name: m.name,
  src: svgDataUrl(m.svg),
  aspect: 1,
  builtin: true,
}));

export function customMotifInfo(m: CustomMotif): MotifInfo {
  return { id: m.id, name: m.name, src: m.image, aspect: m.width / m.height, builtin: false };
}

export function allMotifs(custom: CustomMotif[]): MotifInfo[] {
  return [...BUILTIN_MOTIF_INFOS, ...custom.map(customMotifInfo)];
}

/** Lädt ein Bild aus einer Quelle (wartet, bis es dekodiert ist). */
export function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = src;
  return img.decode().then(() => img);
}
