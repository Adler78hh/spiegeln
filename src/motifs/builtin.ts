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
    // Dach: gleichschenklig-rechtwinkliges Dreieck; Wand: Quadrat mit der
    // Dachbreite als Seite; Fenster: Quadrat aus vier Teilquadraten; Tür:
    // zwei Fensterquadrate übereinander.
    svg: svg(`
      <g stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
        <rect x="124" y="26" width="16" height="34" fill="#a1887f"/>
        <rect x="44" y="72" width="112" height="112" fill="#f6c983"/>
        <polygon points="44,72 100,16 156,72" fill="#e0675f"/>
        <rect x="57" y="112" width="36" height="72" fill="#7fa6d6"/>
        <circle cx="86" cy="150" r="3" fill="${INK}"/>
        <rect x="107" y="112" width="36" height="36" fill="#d7eef9"/>
        <line x1="125" y1="112" x2="125" y2="148"/>
        <line x1="107" y1="130" x2="143" y2="130"/>
      </g>`),
    errorVariants: [[['fill="#e0675f"', 'fill="#8cc68a"']], [['fill="#7fa6d6"', 'fill="#ffd166"']]],
    swapVariants: [
      {
        // Tür und Fenster tauschen die Plätze; der Schornstein unterscheidet
        // das Ergebnis vom Spiegelbild des Originals.
        replacements: [
          ['<rect x="57" y="112" width="36" height="72"', '<rect x="107" y="112" width="36" height="72"'],
          ['<circle cx="86" cy="150"', '<circle cx="136" cy="150"'],
          ['<rect x="107" y="112" width="36" height="36"', '<rect x="57" y="112" width="36" height="36"'],
          ['<line x1="125" y1="112" x2="125" y2="148"/>', '<line x1="75" y1="112" x2="75" y2="148"/>'],
          ['<line x1="107" y1="130" x2="143" y2="130"/>', '<line x1="57" y1="130" x2="93" y2="130"/>'],
        ],
        markers: [[125, 160], [75, 130], [132, 40]],
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
        // Die Schwanzflosse sitzt am Bauch statt hinten; Auge und Maul
        // unterscheiden das Ergebnis vom gespiegelten Original.
        replacements: [['M140,100 L178,68 L170,100 L178,132 Z', 'M88,126 L120,164 L88,156 L56,164 Z']],
        markers: [[88, 152], [62, 92], [46, 110]],
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
  },  {
    id: 'schnecke',
    name: 'Schnecke',
    svg: svg(`
      <g stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
        <line x1="40" y1="90" x2="30" y2="60"/>
        <line x1="58" y1="90" x2="66" y2="58"/>
        <circle cx="30" cy="57" r="5" fill="${INK}"/>
        <circle cx="66" cy="55" r="5" fill="${INK}"/>
        <path d="M28,165 L28,110 Q28,86 50,86 Q70,86 70,110 L70,140 L176,140 Q186,152 176,165 Z" fill="#b9d98c"/>
        <circle cx="118" cy="100" r="46" fill="#f4a259"/>
        <path d="M112,100 a6,6 0 1,1 12,0 a14,14 0 1,1 -28,0 a22,22 0 1,1 44,0 a30,30 0 1,1 -60,0" fill="none"/>
        <circle cx="44" cy="104" r="4" fill="${INK}" stroke="none"/>
        <path d="M38,120 Q46,127 54,120" fill="none"/>
      </g>`),
    errorVariants: [[['fill="#f4a259"', 'fill="#8fb8de"']], [['fill="#b9d98c"', 'fill="#f3a6c8"']]],
    swapVariants: [
      {
        // Farben von Haus und Körper vertauscht.
        replacements: [
          ['fill="#f4a259"', 'fill="TMP"'],
          ['fill="#b9d98c"', 'fill="#f4a259"'],
          ['fill="TMP"', 'fill="#b9d98c"'],
        ],
        markers: [[118, 100], [150, 152]],
      },
    ],
  },
  {
    id: 'boot',
    name: 'Segelboot',
    svg: svg(`
      <g stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
        <line x1="100" y1="28" x2="100" y2="140"/>
        <polygon points="100,28 100,46 76,37" fill="#e0675f"/>
        <polygon points="106,40 106,130 166,130" fill="#fff6e0"/>
        <polygon points="94,64 94,130 52,130" fill="#f6c983"/>
        <path d="M28,140 L172,140 L150,172 L50,172 Z" fill="#c98a5a"/>
        <circle cx="72" cy="156" r="6" fill="#d7eef9"/>
        <circle cx="100" cy="156" r="6" fill="#d7eef9"/>
        <circle cx="128" cy="156" r="6" fill="#d7eef9"/>
      </g>`),
    errorVariants: [[['fill="#e0675f"', 'fill="#8cc68a"']], [['fill="#f6c983"', 'fill="#8fb8de"']]],
    swapVariants: [
      {
        // Fahne zeigt in die andere Richtung, das große Segel bleibt rechts.
        replacements: [['points="100,28 100,46 76,37"', 'points="100,28 100,46 124,37"']],
        markers: [[112, 37], [130, 105], [78, 112]],
      },
    ],
  },
  {
    id: 'auto',
    name: 'Auto',
    svg: svg(`
      <g stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
        <path d="M24,140 L24,116 Q24,104 36,104 L82,104 L100,74 L148,74 Q158,74 162,84 L176,110 L176,140 Z" fill="#6fa8dc"/>
        <path d="M106,82 L144,82 L154,104 L94,104 Z" fill="#d7eef9"/>
        <line x1="124" y1="82" x2="124" y2="104"/>
        <rect x="26" y="111" width="13" height="10" rx="2" fill="#ffd166"/>
        <line x1="110" y1="116" x2="122" y2="116"/>
        <circle cx="58" cy="146" r="17" fill="#5b4636"/>
        <circle cx="58" cy="146" r="7" fill="#d9cdb8"/>
        <circle cx="146" cy="146" r="17" fill="#5b4636"/>
        <circle cx="146" cy="146" r="7" fill="#d9cdb8"/>
      </g>`),
    errorVariants: [[['fill="#d7eef9"', 'fill="#ffd166"']], [['fill="#6fa8dc"', 'fill="#e0675f"']]],
    swapVariants: [
      {
        // Scheinwerfer sitzt hinten statt vorne.
        replacements: [['<rect x="26" y="111"', '<rect x="161" y="113"']],
        markers: [[167, 118], [124, 92], [40, 108]],
      },
    ],
  },
  {
    id: 'dreieck',
    name: 'Dreieck',
    svg: svg(`
      <polygon points="40,160 160,160 40,50" fill="#8cc68a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`),
    errorVariants: [],
    swapVariants: [],
  },
  {
    id: 'l-form',
    name: 'L-Form',
    svg: svg(`
      <path d="M50,30 L90,30 L90,130 L150,130 L150,170 L50,170 Z" fill="#6fa8dc" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`),
    errorVariants: [],
    swapVariants: [],
  },
  {
    id: 'viertelkreis',
    name: 'Viertelkreis',
    svg: svg(`
      <path d="M50,160 L50,50 A110,110 0 0,1 160,160 Z" fill="#ffd166" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="80" cy="130" r="10" fill="#e0675f" stroke="${INK}" stroke-width="4"/>`),
    errorVariants: [],
    swapVariants: [],
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
