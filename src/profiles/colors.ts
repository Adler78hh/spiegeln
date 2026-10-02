/**
 * Farben der Gruppen. Jede Gruppe heißt zunächst wie ihre Farbe; die Farbe
 * selbst lässt sich danach nicht mehr ändern.
 */

export interface GroupColor {
  id: string;
  name: string;
  /** Volle Farbe (Oval mit dem Gruppennamen). */
  hex: string;
}

export const GROUP_COLORS: GroupColor[] = [
  { id: 'weiss', name: 'Weiß', hex: '#ffffff' },
  { id: 'beige', name: 'Beige', hex: '#e8d5b0' },
  { id: 'gelb', name: 'Gelb', hex: '#ffd83d' },
  { id: 'sonne', name: 'Sonne', hex: '#ffb300' },
  { id: 'gold', name: 'Gold', hex: '#d4a72c' },
  { id: 'orange', name: 'Orange', hex: '#f28c28' },
  { id: 'feuer', name: 'Feuer', hex: '#e8461e' },
  // Rot und Blau sind die reinen RGB-Grundfarben, Grün ist etwas abgeschwächt.
  { id: 'rot', name: 'Rot', hex: '#ff0000' },
  { id: 'rubin', name: 'Rubin', hex: '#9b111e' },
  { id: 'rosa', name: 'Rosa', hex: '#f7a8c4' },
  { id: 'fuchsia', name: 'Fuchsia', hex: '#f03ca8' },
  { id: 'magenta', name: 'Magenta', hex: '#c8007f' },
  { id: 'lila', name: 'Lila', hex: '#8e4ec6' },
  { id: 'flieder', name: 'Flieder', hex: '#c3a3e0' },
  { id: 'lavendel', name: 'Lavendel', hex: '#a9a6e8' },
  { id: 'aubergine', name: 'Aubergine', hex: '#5b2a4f' },
  { id: 'himmel', name: 'Himmel', hex: '#79c2f0' },
  { id: 'cyan', name: 'Cyan', hex: '#1fc8e0' },
  { id: 'tuerkis', name: 'Türkis', hex: '#2ab7a9' },
  { id: 'blau', name: 'Blau', hex: '#0000ff' },
  { id: 'ozean', name: 'Ozean', hex: '#1f5fa8' },
  { id: 'petrol', name: 'Petrol', hex: '#1e6f73' },
  { id: 'mint', name: 'Mint', hex: '#9ee6c4' },
  { id: 'lind', name: 'Lind', hex: '#cfe08a' },
  { id: 'limette', name: 'Limette', hex: '#9ed12e' },
  { id: 'gruen', name: 'Grün', hex: '#2ecc40' },
  { id: 'gras', name: 'Gras', hex: '#4caf50' },
  { id: 'olive', name: 'Olive', hex: '#808a2c' },
  { id: 'haselnuss', name: 'Haselnuss', hex: '#b07a46' },
  { id: 'schoko', name: 'Schoko', hex: '#5e3a24' },
  { id: 'grau', name: 'Grau', hex: '#9a9a9a' },
  { id: 'schwarz', name: 'Schwarz', hex: '#222222' },
];

export function findColor(id: string): GroupColor {
  return GROUP_COLORS.find((c) => c.id === id) ?? GROUP_COLORS[0];
}

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const toHex = (v: number[]) => `#${v.map((x) => Math.round(x).toString(16).padStart(2, '0')).join('')}`;

/** Heller Hintergrund für die Tierkacheln einer Gruppe. */
export function tintOf(hex: string, strength = 0.38): string {
  return toHex(rgb(hex).map((c) => 255 + (c - 255) * strength));
}

/** Gut lesbare Schriftfarbe auf der vollen Farbe. */
export function textOn(hex: string): string {
  const [r, g, b] = rgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.3 ? '#3b2f25' : '#ffffff';
}

/**
 * Vorgeschlagener Name für eine neue Gruppe in dieser Farbe: der Farbname,
 * bei schon vergebener Farbe mit Nummer („Gelb2“, „Gelb3“ …).
 */
export function suggestGroupName(colorId: string, usedColorIds: string[]): string {
  const name = findColor(colorId).name;
  const n = usedColorIds.filter((c) => c === colorId).length;
  return n === 0 ? name : `${name}${n + 1}`;
}

/** Erste Farbe, die noch keine Gruppe hat (sonst die am seltensten benutzte). */
export function firstFreeColor(usedColorIds: string[]): string {
  let best = GROUP_COLORS[0].id;
  let bestCount = Infinity;
  for (const c of GROUP_COLORS) {
    const n = usedColorIds.filter((u) => u === c.id).length;
    if (n < bestCount) {
      best = c.id;
      bestCount = n;
    }
  }
  return best;
}

/** Die ersten beiden Buchstaben des Namens, groß geschrieben. */
export function initialsOf(name: string): string {
  const letters = Array.from(name.trim()).filter((ch) => /\p{L}|\p{N}/u.test(ch));
  return letters.length ? letters.slice(0, 2).join('').toUpperCase() : '?';
}
