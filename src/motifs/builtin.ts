/**
 * Vorinstallierte Motive. Alle Motive sind eigens für diese App gezeichnet.
 * Koordinatensystem jeweils 200 × 200.
 */
export interface BuiltinMotif {
  id: string;
  name: string;
  svg: string;
  /**
   * Fehlervarianten für unlösbare Zielfiguren: jeweils Textersetzungen im
   * SVG (andere Farbe oder fehlendes Detail).
   */
  errorVariants: Array<Array<[from: string, to: string]>>;
  /**
   * Varianten mit vertauschten Teilen (z. B. Tür und Fenster). Daraus
   * entstehen symmetrische, sehr ähnliche, aber unlösbare Zielfiguren.
   * `markers` (Motivkoordinaten 0…200) müssen alle im verwendeten Teil liegen,
   * damit die Figur nicht doch durch Spiegeln des Originals entstehen kann.
   */
  swapVariants: Array<{ replacements: Array<[from: string, to: string]>; markers: Array<[number, number]> }>;
}

const svg = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="1024" height="1024">${body}</svg>`;

const INK = '#5b4636';

export const BUILTIN_MOTIFS: BuiltinMotif[] = [
  {
    id: 'haus',
    name: 'Haus',
    svg: svg(`
      <g stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
        <rect x="120" y="42" width="18" height="40" fill="#a1887f"/>
        <rect x="42" y="92" width="112" height="82" fill="#f6c983"/>
        <polygon points="30,96 98,34 166,96" fill="#e0675f"/>
        <rect x="56" y="118" width="32" height="56" rx="4" fill="#7fa6d6"/>
        <circle cx="80" cy="147" r="3" fill="${INK}"/>
        <rect x="106" y="112" width="34" height="30" fill="#d7eef9"/>
        <line x1="123" y1="112" x2="123" y2="142"/>
        <line x1="106" y1="127" x2="140" y2="127"/>
      </g>`),
    errorVariants: [[['fill="#e0675f"', 'fill="#8cc68a"']], [['fill="#7fa6d6"', 'fill="#ffd166"']]],
    swapVariants: [
      {
        // Tür und Fenster tauschen die Plätze; der Schornstein unterscheidet
        // das Ergebnis vom Spiegelbild des Originals.
        replacements: [
          ['<rect x="56" y="118" width="32" height="56" rx="4"', '<rect x="108" y="118" width="32" height="56" rx="4"'],
          ['<circle cx="80" cy="147"', '<circle cx="132" cy="147"'],
          ['<rect x="106" y="112" width="34" height="30"', '<rect x="58" y="112" width="34" height="30"'],
          ['<line x1="123" y1="112" x2="123" y2="142"/>', '<line x1="75" y1="112" x2="75" y2="142"/>'],
          ['<line x1="106" y1="127" x2="140" y2="127"/>', '<line x1="58" y1="127" x2="92" y2="127"/>'],
        ],
        markers: [[124, 146], [75, 127], [129, 60]],
      },
    ],
  },
  {
    id: 'fisch',
    name: 'Fisch',
    svg: svg(`
      <g stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
        <path d="M84,66 Q100,48 120,68" fill="#f59a4a"/>
        <path d="M140,100 L178,68 L170,100 L178,132 Z" fill="#f59a4a"/>
        <path d="M30,100 Q86,40 146,100 Q86,160 30,100 Z" fill="#ffc46b"/>
        <path d="M104,66 Q94,100 104,134" fill="none"/>
        <path d="M122,76 Q114,100 122,124" fill="none"/>
        <circle cx="62" cy="92" r="8" fill="#fff"/>
        <circle cx="60" cy="92" r="3" fill="${INK}" stroke="none"/>
        <path d="M40,108 Q46,113 52,110" fill="none"/>
      </g>`),
    errorVariants: [[['fill="#f59a4a"', 'fill="#7fa6d6"']], [['fill="#ffc46b"', 'fill="#f3a6c8"']]],
    swapVariants: [
      {
        // Rückenflosse sitzt am Bauch; Auge und Maul unterscheiden das
        // Ergebnis vom an der Längsachse gespiegelten Original.
        replacements: [['M84,66 Q100,48 120,68', 'M84,134 Q100,152 120,132']],
        markers: [[102, 140], [62, 92], [46, 110]],
      },
    ],
  },
  {
    id: 'formen',
    name: 'Formen',
    svg: svg(`
      <g stroke="${INK}" stroke-width="4" stroke-linejoin="round">
        <rect x="38" y="58" width="70" height="70" fill="#6fa8dc"/>
        <polygon points="108,128 108,58 168,128" fill="#8cc68a"/>
        <circle cx="72" cy="154" r="20" fill="#ffd166"/>
      </g>`),
    errorVariants: [[['fill="#6fa8dc"', 'fill="#e0675f"']], [['fill="#8cc68a"', 'fill="#ffd166"']]],
    swapVariants: [
      {
        // Kreis wandert unter das Dreieck.
        replacements: [['<circle cx="72" cy="154"', '<circle cx="138" cy="154"']],
        markers: [[73, 93], [128, 105], [138, 154]],
      },
    ],
  },
];

export const svgDataUrl = (svgText: string): string =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;

export function svgToImage(svgText: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = svgDataUrl(svgText);
  return img.decode().then(() => img);
}

/** Wendet eine Fehlervariante (Textersetzungen) auf ein SVG an. */
export function applyVariant(svgText: string, replacements: Array<[string, string]>): string {
  return replacements.reduce((s, [from, to]) => s.split(from).join(to), svgText);
}

export function findBuiltinMotif(id: string): BuiltinMotif | undefined {
  return BUILTIN_MOTIFS.find((m) => m.id === id);
}
