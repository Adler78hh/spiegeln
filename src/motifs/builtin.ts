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
  /**
   * Nicht mehr zur Auswahl angeboten (bleibt nur für schon gespeicherte
   * eigene Herausforderungen und gemerkte Figuren erhalten).
   */
  hidden?: boolean;
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
        <polygon points="108,128 108,58 178,128" fill="#8cc68a"/>
        <circle cx="72" cy="154" r="20" fill="#ffd166"/>
      </g>`),
    errorVariants: [
      [['fill="#6fa8dc"', 'fill="#e0675f"']],
      [['fill="#8cc68a"', 'fill="#ffd166"']],
      // Nur das Dreieck (Quadrat und Kreis fehlen).
      [
        ['<rect x="38" y="58" width="70" height="70" fill="#6fa8dc"/>', ''],
        ['<circle cx="72" cy="154" r="20" fill="#ffd166"/>', ''],
      ],
    ],
    swapVariants: [
      {
        // Kreis wandert unter das Dreieck.
        replacements: [['<circle cx="72" cy="154"', '<circle cx="143" cy="154"']],
        markers: [[73, 93], [131, 105], [143, 154]],
      },
      {
        // Dreieck andersherum (oben am Quadrat). Der Kreis muss mit im Bild
        // sein, sonst wäre das Ergebnis doch mit dem Original erreichbar.
        replacements: [['<polygon points="108,128 108,58 178,128"', '<polygon points="108,58 108,128 178,58"']],
        markers: [[90, 93], [131, 82], [85, 160]],
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
    errorVariants: [
      [['fill="#f4a259"', 'fill="#8fb8de"']],
      [['fill="#b9d98c"', 'fill="#f3a6c8"']],
      // Ohne Fühler.
      [
        ['<line x1="40" y1="90" x2="30" y2="60"/>', ''],
        ['<line x1="58" y1="90" x2="66" y2="58"/>', ''],
        [`<circle cx="30" cy="57" r="5" fill="${INK}"/>`, ''],
        [`<circle cx="66" cy="55" r="5" fill="${INK}"/>`, ''],
      ],
      // Spirale dreht andersherum, Auge rechts im Kopf statt links.
      [
        ['M112,100 a6,6 0 1,1 12,0 a14,14 0 1,1 -28,0 a22,22 0 1,1 44,0 a30,30 0 1,1 -60,0', 'M124,100 a6,6 0 1,0 -12,0 a14,14 0 1,0 28,0 a22,22 0 1,0 -44,0 a30,30 0 1,0 60,0'],
        ['<circle cx="44" cy="104" r="4"', '<circle cx="54" cy="104" r="4"'],
      ],
    ],
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
    // Beide Segel sind gleichschenklig-rechtwinklige Dreiecke.
    svg: svg(`
      <g stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
        <line x1="100" y1="24" x2="100" y2="140"/>
        <polygon points="100,24 100,40 80,32" fill="#e0675f"/>
        <polygon points="106,66 106,130 170,130" fill="#fff6e0"/>
        <polygon points="94,82 94,130 46,130" fill="#f6c983"/>
        <path d="M28,140 L172,140 L150,172 L50,172 Z" fill="#c98a5a"/>
        <circle cx="72" cy="156" r="6" fill="#d7eef9"/>
        <circle cx="100" cy="156" r="6" fill="#d7eef9"/>
        <circle cx="128" cy="156" r="6" fill="#d7eef9"/>
      </g>`),
    errorVariants: [
      [['fill="#e0675f"', 'fill="#8cc68a"']],
      [['fill="#f6c983"', 'fill="#8fb8de"']],
      // Kleines Segel in der Farbe des großen.
      [['fill="#f6c983"', 'fill="#fff6e0"']],
    ],
    swapVariants: [
      {
        // Fahne zeigt in die andere Richtung, das große Segel bleibt rechts.
        replacements: [['points="100,24 100,40 80,32"', 'points="100,24 100,40 120,32"']],
        markers: [[110, 32], [127, 109], [78, 114]],
      },
    ],
  },
  {
    id: 'auto',
    name: 'Auto',
    // Fenster: vorne Quadrat mit angesetztem gleichschenklig-rechtwinkligem
    // Dreieck, Mitte Quadrat, hinten Dreieck; Kabine vorne und hinten 45°.
    svg: svg(`
      <g stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
        <path d="M24,140 L24,114 Q24,104 34,104 L38,104 L68,74 L132,74 L162,104 L166,104 Q176,104 176,114 L176,140 Z" fill="#6fa8dc"/>
        <polygon points="46,104 70,80 94,80 94,104" fill="#d7eef9"/>
        <rect x="100" y="80" width="24" height="24" fill="#d7eef9"/>
        <polygon points="130,80 130,104 154,104" fill="#d7eef9"/>
        <rect x="26" y="111" width="13" height="10" rx="2" fill="#ffd166"/>
        <line x1="104" y1="116" x2="116" y2="116"/>
        <circle cx="58" cy="146" r="17" fill="#5b4636"/>
        <circle cx="58" cy="146" r="7" fill="#d9cdb8"/>
        <circle cx="146" cy="146" r="17" fill="#5b4636"/>
        <circle cx="146" cy="146" r="7" fill="#d9cdb8"/>
      </g>`),
    errorVariants: [
      [['fill="#d7eef9"', 'fill="#ffd166"']],
      [['fill="#6fa8dc"', 'fill="#e0675f"']],
      // Ohne Türgriff.
      [['<line x1="104" y1="116" x2="116" y2="116"/>', '']],
    ],
    swapVariants: [
      {
        // Scheinwerfer sitzt hinten statt vorne.
        replacements: [['<rect x="26" y="111"', '<rect x="161" y="113"']],
        markers: [[167, 118], [124, 92], [40, 108]],
      },
    ],
  },
  {
    id: 'eichhoernchen',
    name: 'Eichhörnchen',
    // Gedreht um 30° und senkrecht knapp hinter der Nase gespiegelt, entsteht
    // ein Kuhkopf: Ohren als Hörner und Kuhohren, die hellen Bäuche als Maul,
    // die beiden Fellbögen als Nüstern.
    svg: svg(`
      <g stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
        <path d="M114,172 C152,178 190,152 186,110 C182,74 148,76 152,52 C155,34 174,28 186,38 C178,18 142,16 132,44 C122,74 154,94 152,122 C150,148 130,154 114,150 Z" fill="#d9822b"/>
        <ellipse cx="96" cy="136" rx="36" ry="42" fill="#e8994a"/>
        <path d="M66,118 C60,150 72,176 98,176 C122,176 126,148 120,124 C112,100 72,100 66,118 Z" fill="#fbe2c4"/>
        <path d="M97,138 q5,-6 10,0" fill="none" transform="rotate(-30 102 137)"/>
        <path d="M58,24 L66,56 L80,48 Z" fill="#e8994a"/>
        <path d="M106,22 L88,50 L102,58 Z" fill="#e8994a"/>
        <circle cx="80" cy="78" r="27" fill="#e8994a"/>
        <ellipse cx="58" cy="88" rx="15" ry="12" fill="#e8994a"/>
        <circle cx="44" cy="86" r="4.5" fill="${INK}"/>
        <circle cx="70" cy="72" r="7" fill="#fff"/>
        <circle cx="68" cy="73" r="3.5" fill="${INK}" stroke="none"/>
        <path d="M58,24 L54,15 M58,24 L62,14 M106,22 L104,12 M106,22 L112,14"/>
        <ellipse cx="44" cy="122" rx="12" ry="10" fill="#b5835a"/>
        <path d="M34,118 Q44,108 54,118" fill="#8a5a3c"/>
        <ellipse cx="58" cy="124" rx="8" ry="6" fill="#e8994a"/>
        <ellipse cx="74" cy="176" rx="16" ry="7" fill="#e8994a"/>
      </g>`),
    errorVariants: [
      // Schwanz blau.
      [['fill="#d9822b"', 'fill="#8fb8de"']],
      // Ohne Fellbögen (bei der Kuh: ohne Nüstern).
      [['<path d="M97,138 q5,-6 10,0" fill="none" transform="rotate(-30 102 137)"/>', '']],
      // Ohne Pinsel an den Ohren.
      [['<path d="M58,24 L54,15 M58,24 L62,14 M106,22 L104,12 M106,22 L112,14"/>', '']],
      // Zusätzliches Auge mitten in der hinteren Kopfhälfte, Blick geradeaus.
      [
        [
          '<circle cx="70" cy="72" r="7" fill="#fff"/>',
          `<circle cx="70" cy="72" r="7" fill="#fff"/><circle cx="90" cy="74" r="7" fill="#fff"/><circle cx="90" cy="74" r="3.5" fill="${INK}" stroke="none"/>`,
        ],
      ],
    ],
    swapVariants: [],
  },
  {
    id: 'hasen',
    name: 'Stoffhasen',
    // Zwei Stoffhasen gleicher Form, jeder in sich symmetrisch: hinten
    // magenta, vorne rosa mit Weste und goldener Brosche auf der linken
    // Westenhälfte. Der vordere reicht nicht über die Mittelachse des hinteren.
    svg: svg(`
      <g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <g transform="translate(130 104)">
          <ellipse cx="-14" cy="-58" rx="11" ry="27" fill="#c8007f" transform="rotate(-8 -14 -58)"/>
          <ellipse cx="14" cy="-58" rx="11" ry="27" fill="#c8007f" transform="rotate(8 14 -58)"/>
          <ellipse cx="-14" cy="-56" rx="5.5" ry="19" fill="#e982bd" stroke="none" transform="rotate(-8 -14 -56)"/>
          <ellipse cx="14" cy="-56" rx="5.5" ry="19" fill="#e982bd" stroke="none" transform="rotate(8 14 -56)"/>
          <ellipse cx="-37" cy="30" rx="11" ry="23" fill="#c8007f" transform="rotate(14 -37 30)"/>
          <ellipse cx="37" cy="30" rx="11" ry="23" fill="#c8007f" transform="rotate(-14 37 30)"/>
          <ellipse cx="0" cy="36" rx="36" ry="34" fill="#c8007f"/>
          <ellipse cx="0" cy="38" rx="19" ry="23" fill="#e982bd"/>
          <ellipse cx="-29" cy="62" rx="18" ry="15" fill="#c8007f"/>
          <ellipse cx="29" cy="62" rx="18" ry="15" fill="#c8007f"/>
          <ellipse cx="-29" cy="63" rx="10" ry="10" fill="#e982bd"/>
          <ellipse cx="29" cy="63" rx="10" ry="10" fill="#e982bd"/>
          <ellipse cx="0" cy="-16" rx="31" ry="27" fill="#c8007f"/>
          <ellipse cx="0" cy="-7" rx="14" ry="11" fill="#e982bd"/>
          <circle cx="-11" cy="-21" r="3.2" fill="${INK}" stroke="none"/>
          <circle cx="11" cy="-21" r="3.2" fill="${INK}" stroke="none"/>
          <path d="M-4,-12 L4,-12 L0,-8 Z" fill="${INK}"/>
          <path d="M0,-8 L0,-4 M0,-4 Q-5,0 -8,-3 M0,-4 Q5,0 8,-3" fill="none"/>
        </g>
        <g transform="translate(70 116)">
          <ellipse cx="-14" cy="-58" rx="11" ry="27" fill="#f7a8c4" transform="rotate(-8 -14 -58)"/>
          <ellipse cx="14" cy="-58" rx="11" ry="27" fill="#f7a8c4" transform="rotate(8 14 -58)"/>
          <ellipse cx="-14" cy="-56" rx="5.5" ry="19" fill="#fde0ea" stroke="none" transform="rotate(-8 -14 -56)"/>
          <ellipse cx="14" cy="-56" rx="5.5" ry="19" fill="#fde0ea" stroke="none" transform="rotate(8 14 -56)"/>
          <ellipse cx="-37" cy="30" rx="11" ry="23" fill="#f7a8c4" transform="rotate(14 -37 30)"/>
          <ellipse cx="37" cy="30" rx="11" ry="23" fill="#f7a8c4" transform="rotate(-14 37 30)"/>
          <ellipse cx="0" cy="36" rx="36" ry="34" fill="#f7a8c4"/>
          <ellipse cx="0" cy="38" rx="19" ry="23" fill="#fde0ea"/>
          <ellipse cx="-29" cy="62" rx="18" ry="15" fill="#f7a8c4"/>
          <ellipse cx="29" cy="62" rx="18" ry="15" fill="#f7a8c4"/>
          <ellipse cx="-29" cy="63" rx="10" ry="10" fill="#fde0ea"/>
          <ellipse cx="29" cy="63" rx="10" ry="10" fill="#fde0ea"/>
          <ellipse cx="0" cy="-16" rx="31" ry="27" fill="#f7a8c4"/>
          <ellipse cx="0" cy="-7" rx="14" ry="11" fill="#fde0ea"/>
          <circle cx="-11" cy="-21" r="3.2" fill="${INK}" stroke="none"/>
          <circle cx="11" cy="-21" r="3.2" fill="${INK}" stroke="none"/>
          <path d="M-4,-12 L4,-12 L0,-8 Z" fill="${INK}"/>
          <path d="M0,-8 L0,-4 M0,-4 Q-5,0 -8,-3 M0,-4 Q5,0 8,-3" fill="none"/>
          <path d="M-28,10 Q-18,4 -9,6 L-8,44 Q-20,50 -32,42 Q-36,26 -28,10 Z" fill="#8fb8de"/>
          <path d="M28,10 Q18,4 9,6 L8,44 Q20,50 32,42 Q36,26 28,10 Z" fill="#8fb8de"/>
          <circle cx="-19" cy="25" r="5" fill="#f2c14e"/>
        </g>
      </g>`),
    errorVariants: [
      // Ohne Brosche.
      [['<circle cx="-19" cy="25" r="5" fill="#f2c14e"/>', '']],
      // Der hintere Hase trägt auch eine Weste (ohne Brosche).
      [['</g>\n        <g transform="translate(70 116)">', '<path d="M-28,10 Q-18,4 -9,6 L-8,44 Q-20,50 -32,42 Q-36,26 -28,10 Z" fill="#8fb8de"/><path d="M28,10 Q18,4 9,6 L8,44 Q20,50 32,42 Q36,26 28,10 Z" fill="#8fb8de"/></g>\n        <g transform="translate(70 116)">']],
    ],
    swapVariants: [
      {
        // Farben der beiden Hasen vertauscht (vorne magenta, hinten rosa).
        replacements: [
          ['#f7a8c4', 'TMP1'],
          ['#fde0ea', 'TMP2'],
          ['#c8007f', '#f7a8c4'],
          ['#e982bd', '#fde0ea'],
          ['TMP1', '#c8007f'],
          ['TMP2', '#e982bd'],
        ],
        markers: [],
      },
    ],
  },
  {
    id: 'wuerfel',
    name: 'Würfel',
    // Isometrischer Würfel: Sechseck aus drei Rauten (60°/120°), Seitenlänge 60.
    // Ecken: oben (100,40), rechts oben (152,70), rechts unten (152,130),
    // unten (100,160), links unten (48,130), links oben (48,70), Mitte (100,100).
    svg: svg(`
      <g stroke="${INK}" stroke-width="4" stroke-linejoin="round">
        <polygon points="100,40 152,70 100,100 48,70" fill="#1fc8e0"/>
        <polygon points="48,70 100,100 100,160 48,130" fill="#e6007e"/>
        <polygon points="100,100 152,70 152,130 100,160" fill="#ffe500"/>
      </g>`),
    errorVariants: [
      // Spiegelverkehrter Würfel (für „nur der Würfel selbst“: Original links,
      // Spiegelbild davon ergibt die rechte Seite des Originals).
      [
        ['<g stroke="', '<g transform="translate(200 0) scale(-1 1)"><g stroke="'],
        ['</g>', '</g></g>'],
      ],
    ],
    swapVariants: [],
  },
  {
    id: 'stifte',
    name: 'Buntstifte',
    // Fünf gleiche Buntstifte (in sich symmetrisch) auf den Kanten zweier
    // gleichseitiger Dreiecke (Seitenlänge 106); an den Ecken bleibt Platz
    // für eine Spiegelachse. Sie unterscheiden sich nur in Farbe und Lage.
    svg: svg(`
      <g stroke="${INK}" stroke-width="2.5" stroke-linejoin="round">
        <g transform="translate(73.50 145.90) rotate(0.00)"><path d="M-36,-6.5 L22,-6.5 L22,6.5 L-36,6.5 Z" fill="#e6007e"/><path d="M22,-6.5 L36,0 L22,6.5 Z" fill="#f4d3ad"/><path d="M31.5,-2.09 L36,0 L31.5,2.09 Z" fill="#e6007e"/></g>
        <g transform="translate(47.00 100.00) rotate(120.00)"><path d="M-36,-6.5 L22,-6.5 L22,6.5 L-36,6.5 Z" fill="#2fa84f"/><path d="M22,-6.5 L36,0 L22,6.5 Z" fill="#f4d3ad"/><path d="M31.5,-2.09 L36,0 L31.5,2.09 Z" fill="#2fa84f"/></g>
        <g transform="translate(100.00 100.00) rotate(60.00)"><path d="M-36,-6.5 L22,-6.5 L22,6.5 L-36,6.5 Z" fill="#1fc8e0"/><path d="M22,-6.5 L36,0 L22,6.5 Z" fill="#f4d3ad"/><path d="M31.5,-2.09 L36,0 L31.5,2.09 Z" fill="#1fc8e0"/></g>
        <g transform="translate(126.50 54.10) rotate(180.00)"><path d="M-36,-6.5 L22,-6.5 L22,6.5 L-36,6.5 Z" fill="#e2231a"/><path d="M22,-6.5 L36,0 L22,6.5 Z" fill="#f4d3ad"/><path d="M31.5,-2.09 L36,0 L31.5,2.09 Z" fill="#e2231a"/></g>
        <g transform="translate(153.00 100.00) rotate(-60.00)"><path d="M-36,-6.5 L22,-6.5 L22,6.5 L-36,6.5 Z" fill="#ffd600"/><path d="M22,-6.5 L36,0 L22,6.5 Z" fill="#f4d3ad"/><path d="M31.5,-2.09 L36,0 L31.5,2.09 Z" fill="#ffd600"/></g>
      </g>`),
    // Fehler: ein Stift umgedreht. Wird er an seiner Mitte gespiegelt, erscheint
    // er dadurch wie ein gewöhnlicher Stift mit nur einer Spitze.
    errorVariants: [
      [['translate(73.50 145.90) rotate(0.00)', 'translate(73.50 145.90) rotate(180.00)']],
      [['translate(47.00 100.00) rotate(120.00)', 'translate(47.00 100.00) rotate(300.00)']],
      [['translate(126.50 54.10) rotate(180.00)', 'translate(126.50 54.10) rotate(0.00)']],
    ],
    swapVariants: [],
  },
  {
    id: 'gesicht',
    name: 'Gesicht',
    // Senkrecht gespiegelt wird der Mund fröhlich oder traurig, waagrecht
    // gespiegelt wird die Locke zum Mund. Die runde Nase sitzt genau in der Mitte.
    svg: svg(`
      <circle cx="100" cy="100" r="80" fill="#ffd84d" stroke="${INK}" stroke-width="6"/>
      <g fill="${INK}">
        <circle cx="50" cy="56" r="3.5"/>
        <circle cx="68" cy="45" r="3.5"/>
        <circle cx="145" cy="57" r="3.5"/>
        <circle cx="157" cy="67" r="3.5"/>
        <circle cx="68" cy="78" r="8"/>
        <circle cx="132" cy="78" r="8"/>
      </g>
      <g fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
        <path d="M95,58 L92,50 L101,45 C114,41 126,45 131,58"/>
        <path d="M68,116 C68,130 82,133 100,133 C118,133 130,138 132,155"/>
      </g>
      <circle cx="100" cy="100" r="10" fill="#ef7f5a" stroke="${INK}" stroke-width="4"/>`),
    // Fehler: ohne Nase; Locke seitenverkehrt.
    errorVariants: [
      [[`<circle cx="100" cy="100" r="10" fill="#ef7f5a" stroke="${INK}" stroke-width="4"/>`, '']],
      [['M95,58 L92,50 L101,45 C114,41 126,45 131,58', 'M127,58 L130,50 L121,45 C108,41 96,45 91,58']],
    ],
    swapVariants: [],
  },
  {
    id: 'boa',
    name: 'BOA',
    // Das Wort BOA in Großbuchstaben, Magenta. Jeder Buchstabe ist in sich
    // symmetrisch (B waagrecht, O beides, A senkrecht); zwischen den
    // Buchstaben ist Platz für eine Spiegelachse.
    svg: svg(`
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20,60 L20,140 M20,60 L34,60 A20,20 0 0 1 34,100 L20,100 M20,100 L34,100 A20,20 0 0 1 34,140 L20,140 M100,60 A20,40 0 1 1 100,140 A20,40 0 1 1 100,60 Z M146,140 L166,60 L186,140 M151.5,118 L180.5,118" stroke="${INK}" stroke-width="18"/>
        <path d="M20,60 L20,140 M20,60 L34,60 A20,20 0 0 1 34,100 L20,100 M20,100 L34,100 A20,20 0 0 1 34,140 L20,140 M100,60 A20,40 0 1 1 100,140 A20,40 0 1 1 100,60 Z M146,140 L166,60 L186,140 M151.5,118 L180.5,118" stroke="#e6007e" stroke-width="11"/>
      </g>`),
    // Fehler: [0] B seitenverkehrt (gespiegelt erscheint es richtig herum,
    // „BOB“ kann so nicht entstehen), [1] A ohne Querstrich.
    errorVariants: [
      [['M20,60 L20,140 M20,60 L34,60 A20,20 0 0 1 34,100 L20,100 M20,100 L34,100 A20,20 0 0 1 34,140 L20,140', 'M54,60 L54,140 M54,60 L40,60 A20,20 0 0 0 40,100 L54,100 M54,100 L40,100 A20,20 0 0 0 40,140 L54,140']],
      [[' M151.5,118 L180.5,118"', '"']],
    ],
    swapVariants: [],
  },
  {
    id: 'tetraktys',
    name: 'Tetraktys',
    // Zehn Kreise im gleichseitigen Dreieck (Reihen zu 1, 2, 3, 4),
    // Mittelpunktabstand 56, Radius 10: weit genug auseinander, dass sich
    // durch Spiegeln jede Anzahl von 1 bis 20 ganzer Kreise legen lässt.
    svg: svg(`
      <g stroke="${INK}" stroke-width="4">
        <circle cx="100.00" cy="27.25" r="10" fill="#1e6f73"/>
        <circle cx="72.00" cy="75.75" r="10" fill="#1e6f73"/>
        <circle cx="128.00" cy="75.75" r="10" fill="#1e6f73"/>
        <circle cx="44.00" cy="124.25" r="10" fill="#1e6f73"/>
        <circle cx="100.00" cy="124.25" r="10" fill="#1e6f73"/>
        <circle cx="156.00" cy="124.25" r="10" fill="#1e6f73"/>
        <circle cx="16.00" cy="172.75" r="10" fill="#1e6f73"/>
        <circle cx="72.00" cy="172.75" r="10" fill="#1e6f73"/>
        <circle cx="128.00" cy="172.75" r="10" fill="#1e6f73"/>
        <circle cx="184.00" cy="172.75" r="10" fill="#1e6f73"/>
      </g>`),
    errorVariants: [],
    swapVariants: [],
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
    id: 'quadrat',
    name: 'Quadrat',
    // Seitenlänge 110.
    svg: svg(`
      <rect x="45" y="45" width="110" height="110" fill="#6fa8dc" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`),
    errorVariants: [],
    swapVariants: [],
  },
  {
    id: 'rechteck',
    name: 'Rechteck',
    // Seitenverhältnis 1 : 2.
    svg: svg(`
      <rect x="30" y="65" width="140" height="70" fill="#f4a261" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`),
    errorVariants: [],
    swapVariants: [],
  },
  {
    id: 'trapez',
    name: 'Trapez',
    // Quadrat (Seite 60) mit zwei gleichschenklig-rechtwinkligen Dreiecken links und rechts.
    svg: svg(`
      <polygon points="70,70 130,70 190,130 10,130" fill="#e0675f" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`),
    errorVariants: [],
    swapVariants: [],
  },
  {
    id: 'parallelogramm',
    name: 'Parallelogramm',
    // Quadrat (Seite 60) mit je einem gleichschenklig-rechtwinkligen Dreieck links unten und rechts oben.
    svg: svg(`
      <polygon points="70,70 190,70 130,130 10,130" fill="#b39ddb" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`),
    errorVariants: [],
    swapVariants: [],
  },
  {
    id: 'kreis',
    name: 'Kreis',
    // Radius 60.
    svg: svg(`
      <circle cx="100" cy="100" r="60" fill="#ffd166" stroke="${INK}" stroke-width="4"/>`),
    errorVariants: [],
    swapVariants: [],
  },
  {
    id: 'gleichseitiges-dreieck',
    name: 'Gleichseitiges Dreieck',
    // Seitenlänge 140.
    svg: svg(`
      <polygon points="30,160.6 170,160.6 100,39.4" fill="#4fb3a9" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`),
    errorVariants: [],
    swapVariants: [],
  },
  {
    id: 'l-form',
    name: 'L-Form',
    hidden: true,
    svg: svg(`
      <path d="M50,30 L90,30 L90,130 L150,130 L150,170 L50,170 Z" fill="#6fa8dc" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`),
    errorVariants: [],
    swapVariants: [],
  },
  {
    id: 'viertelkreis',
    name: 'Viertelkreis',
    hidden: true,
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
