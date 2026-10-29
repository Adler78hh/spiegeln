/**
 * Tierbilder für die Profile. Alle Bilder sind eigens für diese App
 * gezeichnet (Koordinatensystem 100 × 100).
 */

export type AnimalId =
  | 'mathewaschbaer'
  | 'fuchs'
  | 'eule'
  | 'igel'
  | 'baer'
  | 'hase'
  | 'katze'
  | 'frosch'
  | 'pinguin'
  | 'loewe'
  | 'maus'
  | 'hund'
  | 'schwein'
  | 'kuh'
  | 'schaf'
  | 'elefant'
  | 'giraffe'
  | 'zebra'
  | 'tiger'
  | 'nilpferd'
  | 'krake'
  | 'panda'
  | 'koala'
  | 'affe'
  | 'waschbaer'
  | 'eichhoernchen'
  | 'huhn'
  | 'ente'
  | 'marienkaefer'
  | 'biene'
  | 'schildkroete'
  | 'hummel'
  | 'fledermaus'
  | 'qualle'
  | 'spinne'
  | 'schlange'
  | 'ratte'
  | 'regenwurm'
  | 'schnecke'
  | 'regenbogendrache';

export interface Animal {
  id: AnimalId;
  name: string;
  svg: string;
}

const INK = '#4a3b2f';
const svg = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${body}</svg>`;

/** Augenpaar mit Glanzpunkt. */
/**
 * Pupille: dunkler Kreis mit weißem Glanzpunkt oben rechts – bei allen Tieren
 * gleich (auch auf weißem Augapfel), damit die Augen einheitlich aussehen.
 */
const pupil = (cx: number, cy: number, r: number) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${INK}"/><circle cx="${+(cx + r / 3).toFixed(2)}" cy="${+(cy - r / 3).toFixed(2)}" r="${+(r * 0.31).toFixed(2)}" fill="#fff"/>`;

const eyes = (y: number, dx = 13, r = 4.5) => `
  ${pupil(50 - dx, y, r)}
  ${pupil(50 + dx, y, r)}`;

const smile = (y: number, w = 7) =>
  `<path d="M${50 - w},${y} Q50,${y + 6} ${50 + w},${y}" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`;

export const ANIMALS: Record<AnimalId, Animal> = {
  // Wie der Mathe-Waschbär aus dem Arbeitsheft: mit Matrosen-Strickmütze.
  mathewaschbaer: {
    id: 'mathewaschbaer',
    name: 'Mathe-Waschbär',
    svg: svg(`
      <path d="M18,42 L20,16 L40,28 Z" fill="#7d838b"/><path d="M82,42 L80,16 L60,28 Z" fill="#7d838b"/>
      <path d="M23,34 L24,23 L33,29 Z" fill="#fff"/><path d="M77,34 L76,23 L67,29 Z" fill="#fff"/>
      <ellipse cx="50" cy="56" rx="36" ry="30" fill="#9aa0a8"/>
      <path d="M30,42 Q50,34 70,42 Q50,40 30,42 Z" fill="#fff"/>
      <path d="M16,56 Q30,42 46,52 L50,57 L54,52 Q70,42 84,56 Q70,66 54,60 L50,62 L46,60 Q30,66 16,56 Z" fill="#3c4250"/>
      <circle cx="35" cy="54" r="5" fill="#fff"/><circle cx="65" cy="54" r="5" fill="#fff"/>
      ${pupil(35, 54, 3.4)}${pupil(65, 54, 3.4)}
      <ellipse cx="50" cy="73" rx="14" ry="10" fill="#fff"/><ellipse cx="50" cy="68" rx="5" ry="3.5" fill="${INK}"/><path d="M46,75 Q50,81 54,75" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/><path d="M32,30 Q31,9 50,8 Q69,9 68,30 Z" fill="#1f3a6b"/>
      <g stroke="#2d4f8a" stroke-width="1.8" stroke-linecap="round"><line x1="34" y1="18" x2="34" y2="27"/><line x1="39" y1="14" x2="39" y2="27"/><line x1="44" y1="14" x2="44" y2="27"/><line x1="49" y1="14" x2="49" y2="27"/><line x1="54" y1="14" x2="54" y2="27"/><line x1="59" y1="14" x2="59" y2="27"/><line x1="64" y1="18" x2="64" y2="27"/></g>
      <rect x="28" y="26" width="44" height="11" rx="5" fill="#28488a"/>
      <g stroke="#1f3a6b" stroke-width="1.4"><line x1="31" y1="28.5" x2="31" y2="35.5"/><line x1="34" y1="28.5" x2="34" y2="35.5"/><line x1="37" y1="28.5" x2="37" y2="35.5"/><line x1="40" y1="28.5" x2="40" y2="35.5"/><line x1="43" y1="28.5" x2="43" y2="35.5"/><line x1="46" y1="28.5" x2="46" y2="35.5"/><line x1="49" y1="28.5" x2="49" y2="35.5"/><line x1="52" y1="28.5" x2="52" y2="35.5"/><line x1="55" y1="28.5" x2="55" y2="35.5"/><line x1="58" y1="28.5" x2="58" y2="35.5"/><line x1="61" y1="28.5" x2="61" y2="35.5"/><line x1="64" y1="28.5" x2="64" y2="35.5"/><line x1="67" y1="28.5" x2="67" y2="35.5"/><line x1="70" y1="28.5" x2="70" y2="35.5"/></g>`),
  },
  fuchs: {
    id: 'fuchs',
    name: 'Fuchs',
    svg: svg(`
      <path d="M18,18 L36,34 L28,46 Z" fill="#e8823a"/>
      <path d="M82,18 L64,34 L72,46 Z" fill="#e8823a"/>
      <path d="M22,24 L32,34 L28,40 Z" fill="#995e34"/>
      <path d="M78,24 L68,34 L72,40 Z" fill="#995e34"/>
      <path d="M20,40 Q50,18 80,40 Q78,66 50,88 Q22,66 20,40 Z" fill="#f08c3e"/>
      <path d="M22,48 Q36,52 50,72 Q64,52 78,48 Q74,70 50,88 Q26,70 22,48 Z" fill="#fff4e6"/>
      ${eyes(48, 14, 4)}
      <ellipse cx="50" cy="80" rx="5" ry="4" fill="${INK}"/>`),
  },
  eule: {
    id: 'eule',
    name: 'Eule',
    svg: svg(`
      <path d="M22,26 L30,10 L38,24 Z" fill="#8d6748"/>
      <path d="M78,26 L70,10 L62,24 Z" fill="#8d6748"/>
      <ellipse cx="50" cy="56" rx="34" ry="38" fill="#a07a58"/>
      <ellipse cx="50" cy="68" rx="20" ry="22" fill="#e7cfa9"/>
      <circle cx="36" cy="42" r="13" fill="#fff" stroke="#f2b632" stroke-width="3"/>
      <circle cx="64" cy="42" r="13" fill="#fff" stroke="#f2b632" stroke-width="3"/>
      ${pupil(36, 42, 6.5)}
      ${pupil(64, 42, 6.5)}
      <path d="M45,54 L55,54 L50,63 Z" fill="#f08c3e"/>`),
  },
  igel: {
    id: 'igel',
    name: 'Igel',
    // Stachelkleid rund um den Kopf (statt einzelner Zacken obendrauf).
    svg: svg(`
      <polygon points="24.0,79.0 6.1,80.7 20.6,70.0 3.0,65.9 20.2,60.4 4.9,50.9 22.9,51.1 11.3,37.3 28.4,43.2 21.8,26.4 36.1,37.4 35.1,19.4 45.2,34.4 50.0,17.0 54.8,34.4 64.9,19.4 63.9,37.4 78.2,26.4 71.6,43.2 88.7,37.3 77.1,51.1 95.1,50.9 79.8,60.4 97.0,65.9 79.4,70.0 93.9,80.7 76.0,79.0" fill="#5a4434"/>
      <polygon points="24.0,74.5 11.0,72.8 22.0,65.6 10.2,59.8 23.0,56.6 13.6,47.3 26.8,48.3 20.9,36.6 33.0,41.7 31.2,28.7 41.0,37.5 43.5,24.5 50.0,36.0 56.5,24.5 59.0,37.5 68.8,28.7 67.0,41.7 79.1,36.6 73.2,48.3 86.4,47.3 77.0,56.6 89.8,59.8 78.0,65.6 89.0,72.8 76.0,74.5" fill="#7a5e49"/>
      <ellipse cx="50" cy="66" rx="27" ry="24" fill="#d9b48f"/>
      <ellipse cx="50" cy="76" rx="15" ry="11" fill="#f1dcc3"/>
      ${eyes(60, 11, 4)}
      <circle cx="50" cy="73" r="5" fill="${INK}"/>
      ${smile(81, 5)}
      <circle cx="31" cy="72" r="4" fill="#e9b3ae"/>
      <circle cx="69" cy="72" r="4" fill="#e9b3ae"/>`),
  },
  baer: {
    id: 'baer',
    name: 'Bär',
    svg: svg(`
      <circle cx="24" cy="26" r="13" fill="#8a5a3c"/>
      <circle cx="76" cy="26" r="13" fill="#8a5a3c"/>
      <circle cx="24" cy="26" r="6" fill="#c99a74"/>
      <circle cx="76" cy="26" r="6" fill="#c99a74"/>
      <circle cx="50" cy="54" r="36" fill="#9b6845"/>
      <ellipse cx="50" cy="68" rx="17" ry="13" fill="#d9b48f"/>
      ${eyes(48, 14, 4.5)}
      <ellipse cx="50" cy="62" rx="6" ry="4.5" fill="${INK}"/>
      ${smile(70, 6)}`),
  },
  hase: {
    id: 'hase',
    name: 'Hase',
    svg: svg(`
      <ellipse cx="36" cy="24" rx="9" ry="22" fill="#d6d2cc"/>
      <ellipse cx="64" cy="24" rx="9" ry="22" fill="#d6d2cc"/>
      <ellipse cx="36" cy="25" rx="4.5" ry="15" fill="#f3b3c3"/>
      <ellipse cx="64" cy="25" rx="4.5" ry="15" fill="#f3b3c3"/>
      <circle cx="50" cy="62" r="31" fill="#e8e4de"/>
      ${eyes(56, 12, 4)}
      <path d="M45,66 L55,66 L50,71 Z" fill="#e88aa0"/>
      <path d="M50,71 L50,76 M50,76 Q45,80 41,77 M50,76 Q55,80 59,77" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="31" cy="70" r="5" fill="#efc7ce"/>
      <circle cx="69" cy="70" r="5" fill="#efc7ce"/>`),
  },
  katze: {
    id: 'katze',
    name: 'Katze',
    svg: svg(`
      <path d="M17,54 Q12,30 20,11 Q34,16 48,32 Z" fill="#9aa0a8"/>
      <path d="M83,54 Q88,30 80,11 Q66,16 52,32 Z" fill="#9aa0a8"/>
      <path d="M23,42 Q21,28 24,19 Q33,23 40,31 Z" fill="#f3b3c3"/>
      <path d="M77,42 Q79,28 76,19 Q67,23 60,31 Z" fill="#f3b3c3"/>
      <ellipse cx="50" cy="58" rx="35" ry="31" fill="#aeb4bc"/>
      <path d="M40,30 L44,42 M50,28 L50,42 M60,30 L56,42" stroke="#7d838b" stroke-width="3" stroke-linecap="round"/>
      ${eyes(56, 13, 4.5)}
      <path d="M46,66 L54,66 L50,70 Z" fill="#e88aa0"/>
      <path d="M50,70 Q46,76 42,73 M50,70 Q54,76 58,73" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M18,64 L36,67 M18,72 L36,71 M82,64 L64,67 M82,72 L64,71" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>`),
  },
  frosch: {
    id: 'frosch',
    name: 'Frosch',
    svg: svg(`
      <circle cx="32" cy="30" r="15" fill="#6fbf5b"/>
      <circle cx="68" cy="30" r="15" fill="#6fbf5b"/>
      <ellipse cx="50" cy="62" rx="40" ry="28" fill="#7cc867"/>
      <circle cx="32" cy="29" r="9" fill="#fff"/>
      <circle cx="68" cy="29" r="9" fill="#fff"/>
      ${pupil(32, 29, 5.6)}
      ${pupil(68, 29, 5.6)}
      <path d="M26,66 Q50,86 74,66" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="44" cy="54" r="1.8" fill="${INK}"/>
      <circle cx="56" cy="54" r="1.8" fill="${INK}"/>
      <circle cx="22" cy="66" r="5" fill="#c3bb9e"/>
      <circle cx="78" cy="66" r="5" fill="#c3bb9e"/>`),
  },
  pinguin: {
    id: 'pinguin',
    name: 'Pinguin',
    svg: svg(`
      <ellipse cx="50" cy="54" rx="36" ry="40" fill="#3c4250"/>
      <path d="M50,30 Q30,22 22,46 Q20,74 50,88 Q80,74 78,46 Q70,22 50,30 Z" fill="#fff"/>
      ${eyes(50, 13, 4.5)}
      <path d="M42,60 Q50,56 58,60 Q50,70 42,60 Z" fill="#f2a33a"/>
      <circle cx="30" cy="64" r="5" fill="#f8d1db"/>
      <circle cx="70" cy="64" r="5" fill="#f8d1db"/>`),
  },
  loewe: {
    id: 'loewe',
    name: 'Löwe',
    svg: svg(`
      <path d="M50,4 L58,14 L70,8 L72,20 L86,18 L82,30 L94,36 L86,46 L96,56 L84,62 L90,74 L76,76 L76,90 L64,84 L58,96 L50,86 L42,96 L36,84 L24,90 L24,76 L10,74 L16,62 L4,56 L14,46 L6,36 L18,30 L14,18 L28,20 L30,8 L42,14 Z" fill="#d9822b"/>
      <circle cx="50" cy="52" r="30" fill="#f6c45a"/>
      <circle cx="28" cy="30" r="7" fill="#f6c45a"/>
      <circle cx="72" cy="30" r="7" fill="#f6c45a"/>
      ${eyes(48, 12, 4.5)}
      <ellipse cx="50" cy="66" rx="13" ry="9" fill="#fbe2a6"/>
      <path d="M45,60 L55,60 L50,65 Z" fill="${INK}"/>
      <path d="M50,65 Q46,71 42,68 M50,65 Q54,71 58,68" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`),
  },
  maus: {
    id: 'maus',
    name: 'Maus',
    svg: svg(`
      <circle cx="22" cy="34" r="18" fill="#9aa0a8"/>
      <circle cx="78" cy="34" r="18" fill="#9aa0a8"/>
      <circle cx="22" cy="34" r="11" fill="#f3b3c3"/>
      <circle cx="78" cy="34" r="11" fill="#f3b3c3"/>
      <ellipse cx="50" cy="62" rx="30" ry="28" fill="#b3b8bf"/>
      ${eyes(56, 11, 4)}
      <circle cx="50" cy="72" r="5" fill="#e88aa0"/>
      <path d="M22,70 L40,72 M22,78 L40,76 M78,70 L60,72 M78,78 L60,76" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>
      ${smile(78, 4)}`),
  },
  hund: {
    id: 'hund',
    name: 'Hund',
    svg: svg(`
      <ellipse cx="50" cy="54" rx="30" ry="32" fill="#d9a873"/>
      <ellipse cx="62" cy="45" rx="10" ry="9" fill="#f3e1c7"/>
      <ellipse cx="22" cy="46" rx="11" ry="23" fill="#8a5a3c" transform="rotate(14 22 46)"/>
      <ellipse cx="78" cy="46" rx="11" ry="23" fill="#8a5a3c" transform="rotate(-14 78 46)"/>
      ${eyes(46, 12, 4.5)}
      <ellipse cx="50" cy="70" rx="15" ry="11" fill="#f3e1c7"/>
      <path d="M46,74 Q50,86 54,74 Z" fill="#e88aa0"/>
      <ellipse cx="50" cy="64" rx="6" ry="4.5" fill="${INK}"/>
      ${smile(71, 6)}`),
  },
  schwein: {
    id: 'schwein',
    name: 'Schwein',
    svg: svg(`
      <path d="M17,46 Q12,22 22,9 Q36,14 46,28 Z" fill="#f6b8c6"/>
      <path d="M83,46 Q88,22 78,9 Q64,14 54,28 Z" fill="#f6b8c6"/>
      <path d="M23,36 Q21,22 25,16 Q33,20 39,28 Z" fill="#e89aac"/>
      <path d="M77,36 Q79,22 75,16 Q67,20 61,28 Z" fill="#e89aac"/>
      <circle cx="50" cy="56" r="34" fill="#f6b8c6"/>
      ${eyes(46, 14, 4)}
      <ellipse cx="50" cy="65" rx="15" ry="11" fill="#ee9db0"/>
      <ellipse cx="45" cy="65" rx="3" ry="4" fill="#b85c74"/>
      <ellipse cx="55" cy="65" rx="3" ry="4" fill="#b85c74"/>
      ${smile(80, 5)}`),
  },
  kuh: {
    id: 'kuh',
    name: 'Kuh',
    svg: svg(`
      <path d="M30,24 Q22,10 30,4 Q31,15 38,21 Z" fill="#e6d6b0"/>
      <path d="M70,24 Q78,10 70,4 Q69,15 62,21 Z" fill="#e6d6b0"/>
      <ellipse cx="15" cy="40" rx="13" ry="7" fill="#fff" stroke="#d8cfc2" stroke-width="2" transform="rotate(15 15 40)"/>
      <ellipse cx="85" cy="40" rx="13" ry="7" fill="#fff" stroke="#d8cfc2" stroke-width="2" transform="rotate(-15 85 40)"/>
      <ellipse cx="50" cy="52" rx="30" ry="36" fill="#fff" stroke="#d8cfc2" stroke-width="2"/>
      <path d="M26,30 Q34,20 44,28 Q46,40 34,42 Q24,40 26,30 Z" fill="#6b4a36"/>
      <ellipse cx="68" cy="56" rx="7" ry="9" fill="#6b4a36"/>
      ${eyes(46, 13, 4)}
      <ellipse cx="50" cy="74" rx="24" ry="15" fill="#f3b3c3"/>
      <ellipse cx="41" cy="72" rx="3.5" ry="4.5" fill="#b85c74"/>
      <ellipse cx="59" cy="72" rx="3.5" ry="4.5" fill="#b85c74"/>
      ${smile(80, 5)}`),
  },
  schaf: {
    id: 'schaf',
    name: 'Schaf',
    svg: svg(`
      <g fill="#f1ece2" stroke="#d9cfbf" stroke-width="2">
        <circle cx="30" cy="28" r="14"/><circle cx="50" cy="22" r="15"/><circle cx="70" cy="28" r="14"/>
        <circle cx="20" cy="48" r="13"/><circle cx="80" cy="48" r="13"/>
        <circle cx="26" cy="70" r="14"/><circle cx="74" cy="70" r="14"/><circle cx="50" cy="80" r="14"/>
      </g>
      <circle cx="50" cy="52" r="32" fill="#f1ece2"/>
      <ellipse cx="25" cy="50" rx="11" ry="5" fill="#5a4a40" transform="rotate(20 25 50)"/>
      <ellipse cx="75" cy="50" rx="11" ry="5" fill="#5a4a40" transform="rotate(-20 75 50)"/>
      <ellipse cx="50" cy="58" rx="18" ry="24" fill="#5a4a40"/>
      <circle cx="43" cy="52" r="5" fill="#fff"/>
      <circle cx="57" cy="52" r="5" fill="#fff"/>
      ${pupil(43, 52, 3.4)}
      ${pupil(57, 52, 3.4)}
      <path d="M45,70 Q50,75 55,70" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`),
  },
  elefant: {
    id: 'elefant',
    name: 'Elefant',
    svg: svg(`
      <ellipse cx="18" cy="48" rx="18" ry="25" fill="#9aa5b1"/>
      <ellipse cx="82" cy="48" rx="18" ry="25" fill="#9aa5b1"/>
      <ellipse cx="19" cy="48" rx="10" ry="16" fill="#e8b4c0"/>
      <ellipse cx="81" cy="48" rx="10" ry="16" fill="#e8b4c0"/>
      <circle cx="50" cy="46" r="29" fill="#aab4bf"/>
      <path d="M41,56 Q40,80 47,92 Q54,98 59,90 Q52,82 59,56 Z" fill="#aab4bf"/>
      <path d="M44,72 L55,72 M46,81 L55,80" stroke="#8792a0" stroke-width="2" stroke-linecap="round"/>
      ${eyes(42, 12, 4)}
      <circle cx="30" cy="56" r="5" fill="#d6b3c1"/>
      <circle cx="70" cy="56" r="5" fill="#d6b3c1"/>`),
  },
  giraffe: {
    id: 'giraffe',
    name: 'Giraffe',
    svg: svg(`
      <path d="M40,24 L37,8 M60,24 L63,8" stroke="#d9a04a" stroke-width="5" stroke-linecap="round"/>
      <circle cx="37" cy="7" r="5" fill="#8a5a3c"/>
      <circle cx="63" cy="7" r="5" fill="#8a5a3c"/>
      <ellipse cx="20" cy="34" rx="13" ry="6" fill="#f2c14e" transform="rotate(-20 20 34)"/>
      <ellipse cx="80" cy="34" rx="13" ry="6" fill="#f2c14e" transform="rotate(20 80 34)"/>
      <ellipse cx="50" cy="48" rx="27" ry="31" fill="#f6c95a"/>
      <path d="M32,30 Q38,26 42,32 Q38,38 32,36 Z M60,28 Q68,26 68,34 Q62,38 58,34 Z M26,48 Q30,44 32,50 Q28,54 26,48 Z M70,48 Q74,44 75,51 Q71,54 70,48 Z" fill="#c98a3a"/>
      <ellipse cx="50" cy="74" rx="22" ry="16" fill="#f3dca0"/>
      ${eyes(46, 12, 4)}
      <ellipse cx="43" cy="70" rx="2.5" ry="3" fill="${INK}"/>
      <ellipse cx="57" cy="70" rx="2.5" ry="3" fill="${INK}"/>
      ${smile(78, 6)}`),
  },
  zebra: {
    id: 'zebra',
    name: 'Zebra',
    svg: svg(`
      <path d="M28,32 L22,8 L42,22 Z" fill="#fff" stroke="#2d2d2d" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M72,32 L78,8 L58,22 Z" fill="#fff" stroke="#2d2d2d" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M40,16 L44,4 L50,12 L56,4 L60,16 Z" fill="#2d2d2d"/>
      <ellipse cx="50" cy="50" rx="28" ry="34" fill="#fff" stroke="#2d2d2d" stroke-width="2.5"/>
      <path d="M24,38 Q32,42 37,35 M23,52 Q32,55 37,48 M76,38 Q68,42 63,35 M77,52 Q68,55 63,48 M43,20 Q50,30 57,20 M46,30 Q50,36 54,30" stroke="#2d2d2d" stroke-width="4" fill="none" stroke-linecap="round"/>
      ${eyes(46, 13, 4)}
      <ellipse cx="50" cy="72" rx="20" ry="14" fill="#5a5a5a"/>
      <ellipse cx="43" cy="70" rx="3" ry="4" fill="#222"/>
      <ellipse cx="57" cy="70" rx="3" ry="4" fill="#222"/>
      <path d="M44,79 Q50,83 56,79" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>`),
  },
  tiger: {
    id: 'tiger',
    name: 'Tiger',
    svg: svg(`
      <circle cx="24" cy="26" r="11" fill="#f39a3a"/>
      <circle cx="76" cy="26" r="11" fill="#f39a3a"/>
      <circle cx="24" cy="26" r="5" fill="#fff4e6"/>
      <circle cx="76" cy="26" r="5" fill="#fff4e6"/>
      <ellipse cx="50" cy="55" rx="37" ry="32" fill="#f39a3a"/>
      <path d="M43,26 L46,36 M50,24 L50,38 M57,26 L54,36 M14,48 L27,51 M14,58 L27,59 M86,48 L73,51 M86,58 L73,59" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
      <ellipse cx="50" cy="71" rx="22" ry="14" fill="#fff4e6"/>
      ${eyes(49, 13, 4.5)}
      <path d="M45,63 L55,63 L50,69 Z" fill="${INK}"/>
      <path d="M50,69 Q46,75 42,72 M50,69 Q54,75 58,72" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`),
  },
  nilpferd: {
    id: 'nilpferd',
    name: 'Nilpferd',
    svg: svg(`
      <circle cx="28" cy="20" r="8" fill="#8e7f9e"/>
      <circle cx="72" cy="20" r="8" fill="#8e7f9e"/>
      <ellipse cx="50" cy="40" rx="29" ry="23" fill="#a596b5"/>
      <ellipse cx="50" cy="67" rx="40" ry="25" fill="#b3a5c2"/>
      ${eyes(36, 12, 4)}
      <ellipse cx="37" cy="58" rx="4.5" ry="3.5" fill="#6e5f80"/>
      <ellipse cx="63" cy="58" rx="4.5" ry="3.5" fill="#6e5f80"/>
      <path d="M26,74 Q50,88 74,74" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="18" cy="66" r="5" fill="#e0afc3"/>
      <circle cx="82" cy="66" r="5" fill="#e0afc3"/>`),
  },
  krake: {
    id: 'krake',
    name: 'Krake',
    // Wie Spinne und Qualle: Kopf oben, acht Arme darunter.
    svg: svg(`
      <path d="M29,58 Q20.3,69 7.9,76.4 Q1.9,83.4 1.9,75.4 M35,58 Q29.4,71.8 18.9,80.9 Q12.9,87.9 12.9,79.9 M41,58 Q39,73.7 31,84.1 Q25,91.1 25,83.1 M47,58 Q49,74.7 43.6,85.8 Q37.6,92.8 37.6,84.8 M53,58 Q51,74.7 56.4,85.8 Q62.4,92.8 62.4,84.8 M59,58 Q61,73.7 69,84.1 Q75,91.1 75,83.1 M65,58 Q70.6,71.8 81.1,80.9 Q87.1,87.9 87.1,79.9 M71,58 Q79.7,69 92.1,76.4 Q98.1,83.4 98.1,75.4" stroke="#d9608a" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="50" cy="38" rx="30" ry="28" fill="#e8739c"/>
      <circle cx="34" cy="20" r="4" fill="#f3a3bf"/>
      <circle cx="62" cy="16" r="3" fill="#f3a3bf"/>
      <circle cx="70" cy="27" r="4.5" fill="#f3a3bf"/>
      ${eyes(40, 12, 5)}
      ${smile(51, 6)}
      <circle cx="28" cy="48" r="5" fill="#fabdd2"/>
      <circle cx="72" cy="48" r="5" fill="#fabdd2"/>`),
  },
  panda: {
    id: 'panda',
    name: 'Panda',
    svg: svg(`
      <circle cx="24" cy="24" r="12" fill="#2d2d2d"/>
      <circle cx="76" cy="24" r="12" fill="#2d2d2d"/>
      <circle cx="50" cy="54" r="35" fill="#fff" stroke="#d8d8d8" stroke-width="2"/>
      <ellipse cx="36" cy="50" rx="9" ry="12" fill="#2d2d2d" transform="rotate(35 36 50)"/>
      <ellipse cx="64" cy="50" rx="9" ry="12" fill="#2d2d2d" transform="rotate(-35 64 50)"/>
      <circle cx="37" cy="49" r="4.6" fill="#fff"/>
      <circle cx="63" cy="49" r="4.6" fill="#fff"/>
      ${pupil(37, 49, 3)}
      ${pupil(63, 49, 3)}
      <ellipse cx="50" cy="65" rx="6" ry="4.5" fill="#2d2d2d"/>
      ${smile(72, 5)}`),
  },
  koala: {
    id: 'koala',
    name: 'Koala',
    // Breite Ohren mit weißem, zottigem Fell und eine große Nase, damit der
    // Koala nicht wie die Maus aussieht.
    svg: svg(`
      <circle cx="21" cy="36" r="19" fill="#8f96a3"/>
      <circle cx="31.0" cy="36.0" r="5" fill="#f4f1ee"/>
      <circle cx="28.7" cy="42.4" r="5" fill="#f4f1ee"/>
      <circle cx="22.7" cy="45.8" r="5" fill="#f4f1ee"/>
      <circle cx="16.0" cy="44.7" r="5" fill="#f4f1ee"/>
      <circle cx="11.6" cy="39.4" r="5" fill="#f4f1ee"/>
      <circle cx="11.6" cy="32.6" r="5" fill="#f4f1ee"/>
      <circle cx="16.0" cy="27.3" r="5" fill="#f4f1ee"/>
      <circle cx="22.7" cy="26.2" r="5" fill="#f4f1ee"/>
      <circle cx="28.7" cy="29.6" r="5" fill="#f4f1ee"/>
      <circle cx="21" cy="36" r="9" fill="#f4f1ee"/>
      <circle cx="79" cy="36" r="19" fill="#8f96a3"/>
      <circle cx="89.0" cy="36.0" r="5" fill="#f4f1ee"/>
      <circle cx="86.7" cy="42.4" r="5" fill="#f4f1ee"/>
      <circle cx="80.7" cy="45.8" r="5" fill="#f4f1ee"/>
      <circle cx="74.0" cy="44.7" r="5" fill="#f4f1ee"/>
      <circle cx="69.6" cy="39.4" r="5" fill="#f4f1ee"/>
      <circle cx="69.6" cy="32.6" r="5" fill="#f4f1ee"/>
      <circle cx="74.0" cy="27.3" r="5" fill="#f4f1ee"/>
      <circle cx="80.7" cy="26.2" r="5" fill="#f4f1ee"/>
      <circle cx="86.7" cy="29.6" r="5" fill="#f4f1ee"/>
      <circle cx="79" cy="36" r="9" fill="#f4f1ee"/>
      <ellipse cx="50" cy="58" rx="34" ry="29" fill="#a3aab6"/>
      <ellipse cx="50" cy="77" rx="16" ry="8" fill="#d9dde3"/>
      ${eyes(50, 16, 4)}
      <path d="M50,52 C60,52 62,60 61,67 C60,74 55,77 50,77 C45,77 40,74 39,67 C38,60 40,52 50,52 Z" fill="#2f3440"/>
      <ellipse cx="46" cy="58" rx="3" ry="2" fill="#979aa0"/>`),
  },
  affe: {
    id: 'affe',
    name: 'Affe',
    svg: svg(`
      <circle cx="16" cy="50" r="11" fill="#8a5a3c"/>
      <circle cx="84" cy="50" r="11" fill="#8a5a3c"/>
      <circle cx="16" cy="50" r="6" fill="#e8c39e"/>
      <circle cx="84" cy="50" r="6" fill="#e8c39e"/>
      <circle cx="50" cy="50" r="35" fill="#8a5a3c"/>
      <path d="M50,36 Q38,22 28,34 Q22,48 30,58 Q24,76 50,84 Q76,76 70,58 Q78,48 72,34 Q62,22 50,36 Z" fill="#e8c39e"/>
      ${eyes(46, 11, 4.5)}
      <circle cx="47" cy="61" r="1.8" fill="${INK}"/>
      <circle cx="53" cy="61" r="1.8" fill="${INK}"/>
      <path d="M38,69 Q50,80 62,69" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`),
  },
  waschbaer: {
    id: 'waschbaer',
    name: 'Waschbär',
    svg: svg(`
      <path d="M18,42 L22,14 L42,28 Z" fill="#7d838b"/>
      <path d="M82,42 L78,14 L58,28 Z" fill="#7d838b"/>
      <path d="M23,34 L25,21 L34,28 Z" fill="#fff"/>
      <path d="M77,34 L75,21 L66,28 Z" fill="#fff"/>
      <ellipse cx="50" cy="56" rx="36" ry="30" fill="#9aa0a8"/>
      <path d="M30,42 Q50,32 70,42 Q50,40 30,42 Z" fill="#fff"/>
      <path d="M16,56 Q30,42 46,52 L50,57 L54,52 Q70,42 84,56 Q70,66 54,60 L50,62 L46,60 Q30,66 16,56 Z" fill="#3c4250"/>
      <circle cx="35" cy="54" r="5" fill="#fff"/>
      <circle cx="65" cy="54" r="5" fill="#fff"/>
      ${pupil(35, 54, 3.4)}
      ${pupil(65, 54, 3.4)}
      <ellipse cx="50" cy="73" rx="14" ry="10" fill="#fff"/>
      <ellipse cx="50" cy="68" rx="5" ry="3.5" fill="${INK}"/>
      ${smile(75, 4)}`),
  },
  eichhoernchen: {
    id: 'eichhoernchen',
    name: 'Eichhörnchen',
    svg: svg(`
      <path d="M19,50 Q14,26 24,10 Q26,2 30,4 Q30,10 33,13 Q42,22 46,32 Z" fill="#d9743a"/>
      <path d="M81,50 Q86,26 76,10 Q74,2 70,4 Q70,10 67,13 Q58,22 54,32 Z" fill="#d9743a"/>
      <path d="M25,40 Q23,26 28,16 Q35,23 39,31 Z" fill="#f3c9a8"/>
      <path d="M75,40 Q77,26 72,16 Q65,23 61,31 Z" fill="#f3c9a8"/>
      <ellipse cx="50" cy="56" rx="32" ry="30" fill="#d9743a"/>
      <ellipse cx="50" cy="70" rx="21" ry="15" fill="#fbe2c4"/>
      ${eyes(51, 13, 4.5)}
      <ellipse cx="50" cy="63" rx="4.5" ry="3.2" fill="${INK}"/>
      <path d="M46,71 L46,79 L54,79 L54,71 Z M50,71 L50,79" fill="#fff" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
      <circle cx="30" cy="66" r="5" fill="#f6c6c3"/>
      <circle cx="70" cy="66" r="5" fill="#f6c5c3"/>`),
  },
  huhn: {
    id: 'huhn',
    name: 'Huhn',
    svg: svg(`
      <path d="M36,28 Q34,10 43,15 Q47,2 54,13 Q62,4 65,24 Z" fill="#e0322b"/>
      <circle cx="50" cy="56" r="32" fill="#fff" stroke="#e2dccf" stroke-width="2"/>
      ${eyes(50, 14, 4)}
      <path d="M41,58 L59,58 L50,70 Z" fill="#f2a33a"/>
      <ellipse cx="50" cy="77" rx="5" ry="7" fill="#e0322b"/>
      <circle cx="29" cy="64" r="5" fill="#f8d1db"/>
      <circle cx="71" cy="64" r="5" fill="#f8d1db"/>`),
  },
  ente: {
    id: 'ente',
    name: 'Ente',
    // Lachender Schnabel mit hochgezogenen Mundwinkeln.
    svg: svg(`
      <path d="M47,20 Q44,6 51,3 Q50,10 57,9 Q52,14 55,20 Z" fill="#f5c932"/>
      <circle cx="50" cy="52" r="34" fill="#ffd94a"/>
      ${eyes(42, 13, 5)}
      <path d="M28,60 Q50,50 72,60 Q66,80 50,80 Q34,80 28,60 Z" fill="#f28c28"/>
      <path d="M31,62 Q50,74 69,62" fill="none" stroke="#c96a12" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="24" cy="54" r="5" fill="#f7be9f"/>
      <circle cx="76" cy="54" r="5" fill="#f7be9f"/>`),
  },
  marienkaefer: {
    id: 'marienkaefer',
    name: 'Marienkäfer',
    // Wie die Schildkröte: gepunkteter Panzer oben, Gesicht darunter.
    svg: svg(`
      <path d="M8,58 Q8,10 50,10 Q92,10 92,58 Z" fill="#e0322b"/>
      <path d="M50,11 L50,57" stroke="#2d2d2d" stroke-width="2.5"/>
      <circle cx="31" cy="27" r="6" fill="#2d2d2d"/>
      <circle cx="69" cy="27" r="6" fill="#2d2d2d"/>
      <circle cx="20" cy="47" r="5" fill="#2d2d2d"/>
      <circle cx="80" cy="47" r="5" fill="#2d2d2d"/>
      <circle cx="38" cy="45" r="4" fill="#2d2d2d"/>
      <circle cx="62" cy="45" r="4" fill="#2d2d2d"/>
      <ellipse cx="50" cy="60" rx="25" ry="22" fill="#2d2d2d"/>
      <circle cx="40" cy="56" r="5.5" fill="#fff"/>
      <circle cx="60" cy="56" r="5.5" fill="#fff"/>
      ${pupil(40, 56, 3.6)}
      ${pupil(60, 56, 3.6)}
      <path d="M42,68 Q50,74 58,68" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="32" cy="66" r="3.5" fill="#b88080"/>
      <circle cx="68" cy="66" r="3.5" fill="#b88080"/>`),
  },
  biene: {
    id: 'biene',
    name: 'Biene',
    // Kopf ohne Streifen; die Streifen sitzen am Körper darunter.
    svg: svg(`
      <defs><clipPath id="bienenkoerper"><ellipse cx="50" cy="80" rx="26" ry="15"/></clipPath></defs>
      <ellipse cx="20" cy="68" rx="15" ry="9" fill="#d6eef8" stroke="#9cc9de" stroke-width="2" transform="rotate(-25 20 68)"/>
      <ellipse cx="80" cy="68" rx="15" ry="9" fill="#d6eef8" stroke="#9cc9de" stroke-width="2" transform="rotate(25 80 68)"/>
      <ellipse cx="50" cy="80" rx="26" ry="15" fill="#ffd23f"/>
      <g clip-path="url(#bienenkoerper)" fill="#2d2d2d">
        <rect x="20" y="74" width="60" height="5"/>
        <rect x="20" y="84" width="60" height="5"/>
      </g>
      <path d="M43,18 Q39,8 33,6 M57,18 Q61,8 67,6" fill="none" stroke="#2d2d2d" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="33" cy="6" r="3.5" fill="#2d2d2d"/>
      <circle cx="67" cy="6" r="3.5" fill="#2d2d2d"/>
      <circle cx="50" cy="40" r="25" fill="#ffd23f"/>
      ${eyes(37, 10, 4.2)}
      ${smile(48, 6)}
      <circle cx="33" cy="45" r="4.2" fill="#f7b185"/>
      <circle cx="67" cy="45" r="4.2" fill="#f7b185"/>`),
  },
  schildkroete: {
    id: 'schildkroete',
    name: 'Schildkröte',
    svg: svg(`
      <path d="M8,58 Q8,10 50,10 Q92,10 92,58 Z" fill="#8a6a3c"/>
      <path d="M38,18 L62,18 L68,32 L50,40 L32,32 Z M14,50 L20,34 L30,38 L28,50 Z M86,50 L80,34 L70,38 L72,50 Z" fill="#a8834c"/>
      <ellipse cx="50" cy="58" rx="26" ry="24" fill="#8cc152"/>
      ${eyes(53, 11, 4.5)}
      ${smile(65, 7)}
      <circle cx="32" cy="62" r="4.5" fill="#cab996"/>
      <circle cx="68" cy="62" r="4.5" fill="#cab996"/>`),
  },
  // Längsstreifen in Regenbogenfarben, die oben in Hörner und Stacheln auslaufen.
  spinne: {
    id: 'spinne',
    name: 'Spinne',
    // Wie Krake und Qualle: Kopf, acht Beine (je vier auf jeder Seite).
    svg: svg(`
      <path d="M34,42 L16,22 L4,44 M34,49 L14.5,33 L6,59 M34,56 L13,44 L8,74 M34,63 L11.5,55 L10,89 M66,42 L84,22 L96,44 M66,49 L85.5,33 L94,59 M66,56 L87,44 L92,74 M66,63 L88.5,55 L90,89" stroke="#4a3a5c" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="50" cy="44" rx="23" ry="22" fill="#6b5683"/>
      ${pupil(43, 31, 2.2)}
      ${pupil(57, 31, 2.2)}
      <circle cx="41" cy="42" r="6" fill="#fff"/>
      <circle cx="59" cy="42" r="6" fill="#fff"/>
      ${pupil(41, 42, 3.8)}
      ${pupil(59, 42, 3.8)}
      <path d="M43,54 Q50,60 57,54" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="33" cy="52" r="3.5" fill="#ca8cad"/>
      <circle cx="67" cy="52" r="3.5" fill="#ca8cad"/>`),
  },
  qualle: {
    id: 'qualle',
    name: 'Qualle',
    // Wie Krake und Spinne: Schirm oben, acht Fäden darunter.
    svg: svg(`
      <path d="M24,54 q4,5 0,10 q-4,5 0,10 q4,5 0,10 q-4,5 0,10 M31.4,54 q4,5 0,10 q-4,5 0,10 q4,5 0,10 q-4,5 0,10 M38.9,54 q4,5 0,10 q-4,5 0,10 q4,5 0,10 q-4,5 0,10 M46.3,54 q4,5 0,10 q-4,5 0,10 q4,5 0,10 q-4,5 0,10 M53.7,54 q4,5 0,10 q-4,5 0,10 q4,5 0,10 q-4,5 0,10 M61.1,54 q4,5 0,10 q-4,5 0,10 q4,5 0,10 q-4,5 0,10 M68.6,54 q4,5 0,10 q-4,5 0,10 q4,5 0,10 q-4,5 0,10 M76,54 q4,5 0,10 q-4,5 0,10 q4,5 0,10 q-4,5 0,10" stroke="#9d86e8" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M20,52 Q20,12 50,12 Q80,12 80,52 Q75,57 70,52 Q65,57 60,52 Q55,57 50,52 Q45,57 40,52 Q35,57 30,52 Q25,57 20,52 Z" fill="#b9a7f0"/>
      <path d="M30,24 Q38,16 48,16" fill="none" stroke="#eae5fa" stroke-width="3" stroke-linecap="round"/>
      ${eyes(36, 11, 4.5)}
      ${smile(45, 5)}
      <circle cx="30" cy="43" r="4" fill="#e7b1dd"/>
      <circle cx="70" cy="43" r="4" fill="#e7b1dd"/>`),
  },
  hummel: {
    id: 'hummel',
    name: 'Hummel',
    // Dick, rund und flauschig (anders als die schlanke Biene), weißes Hinterteil.
    svg: svg(`
      <defs><clipPath id="hummelfell"><ellipse cx="50" cy="57" rx="36" ry="33"/><circle cx="85" cy="57" r="4.2"/><circle cx="84.2" cy="63.7" r="4.2"/><circle cx="82" cy="70" r="4.2"/><circle cx="78.3" cy="75.8" r="4.2"/><circle cx="73.4" cy="80.8" r="4.2"/><circle cx="67.5" cy="84.7" r="4.2"/><circle cx="60.8" cy="87.4" r="4.2"/><circle cx="53.7" cy="88.8" r="4.2"/><circle cx="46.3" cy="88.8" r="4.2"/><circle cx="39.2" cy="87.4" r="4.2"/><circle cx="32.5" cy="84.7" r="4.2"/><circle cx="26.6" cy="80.8" r="4.2"/><circle cx="21.7" cy="75.8" r="4.2"/><circle cx="18" cy="70" r="4.2"/><circle cx="15.8" cy="63.7" r="4.2"/><circle cx="15" cy="57" r="4.2"/><circle cx="15.8" cy="50.3" r="4.2"/><circle cx="18" cy="44" r="4.2"/><circle cx="21.7" cy="38.2" r="4.2"/><circle cx="26.6" cy="33.2" r="4.2"/><circle cx="32.5" cy="29.3" r="4.2"/><circle cx="39.2" cy="26.6" r="4.2"/><circle cx="46.3" cy="25.2" r="4.2"/><circle cx="53.7" cy="25.2" r="4.2"/><circle cx="60.8" cy="26.6" r="4.2"/><circle cx="67.5" cy="29.3" r="4.2"/><circle cx="73.4" cy="33.2" r="4.2"/><circle cx="78.3" cy="38.2" r="4.2"/><circle cx="82" cy="44" r="4.2"/><circle cx="84.2" cy="50.3" r="4.2"/></clipPath></defs>
      <ellipse cx="24" cy="24" rx="13" ry="9" fill="#e3f1f8" stroke="#a9cfe0" stroke-width="2" transform="rotate(-30 24 24)"/>
      <ellipse cx="76" cy="24" rx="13" ry="9" fill="#e3f1f8" stroke="#a9cfe0" stroke-width="2" transform="rotate(30 76 24)"/>
      <g clip-path="url(#hummelfell)">
        <rect x="0" y="0" width="100" height="64" fill="#f7c948"/>
        <rect x="0" y="64" width="100" height="11" fill="#2d2d2d"/>
        <rect x="0" y="75" width="100" height="8" fill="#f7c948"/>
        <rect x="0" y="83" width="100" height="20" fill="#eadbc0"/>
      </g>
      <path d="M43,24 Q41,15 36,13 M57,24 Q59,15 64,13" fill="none" stroke="#2d2d2d" stroke-width="3" stroke-linecap="round"/>
      <circle cx="36" cy="13" r="3.5" fill="#2d2d2d"/>
      <circle cx="64" cy="13" r="3.5" fill="#2d2d2d"/>
      ${eyes(42, 12, 4.5)}
      ${smile(52, 6)}
      <circle cx="30" cy="50" r="4.5" fill="#f4ae88"/>
      <circle cx="70" cy="50" r="4.5" fill="#f4ae88"/>`),
  },
  fledermaus: {
    id: 'fledermaus',
    name: 'Fledermaus',
    // Ausgebreitete Flügel, großer Kopf mit großen Ohren, kleine Zähnchen.
    svg: svg(`
      <path d="M50,52 L4,28 Q10,44 2,56 Q14,52 16,64 Q24,56 32,66 Z M50,52 L96,28 Q90,44 98,56 Q86,52 84,64 Q76,56 68,66 Z" fill="#5a4a6b"/>
      <path d="M32,40 L25,8 L48,30 Z M68,40 L75,8 L52,30 Z" fill="#6f5d82"/>
      <path d="M33,35 L29,16 L43,30 Z M67,35 L71,16 L57,30 Z" fill="#e8b4c8"/>
      <circle cx="50" cy="52" r="27" fill="#7a6890"/>
      <ellipse cx="50" cy="63" rx="15" ry="11" fill="#b8a6c8"/>
      ${eyes(48, 11, 4.8)}
      <ellipse cx="50" cy="59" rx="3.5" ry="2.4" fill="${INK}"/>
      <path d="M43,66 Q50,72 57,66" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M45,67.2 L46.8,72 L48.6,68.4 Z M55,67.2 L53.2,72 L51.4,68.4 Z" fill="#fff"/>
      <circle cx="32" cy="58" r="4" fill="#c395af"/>
      <circle cx="68" cy="58" r="4" fill="#c395af"/>`),
  },
  schlange: {
    id: 'schlange',
    name: 'Schlange',
    // Aufgerollter Körper, der Kopf sitzt oben auf dem Hals und schaut nach vorn.
    svg: svg(`
      <ellipse cx="50" cy="86" rx="40" ry="11" fill="#4f9a3e"/>
      <ellipse cx="50" cy="83" rx="40" ry="11" fill="#5fae4c"/>
      <ellipse cx="50" cy="74" rx="31" ry="9" fill="#4f9a3e"/>
      <ellipse cx="50" cy="71" rx="31" ry="9" fill="#5fae4c"/>
      <circle cx="24" cy="84" r="2.6" fill="#a6d98a"/>
      <circle cx="76" cy="84" r="2.6" fill="#a6d98a"/>
      <circle cx="33" cy="72" r="2.4" fill="#a6d98a"/>
      <circle cx="67" cy="72" r="2.4" fill="#a6d98a"/>
      <path d="M38,70 Q36,52 42,44 L58,44 Q64,52 62,70 Z" fill="#6cc055"/>
      <ellipse cx="50" cy="36" rx="25" ry="21" fill="#7ccf63"/>
      <ellipse cx="50" cy="50" rx="12" ry="5" fill="#9fdc86"/>
      <circle cx="38" cy="22" r="3" fill="#a6d98a"/>
      <circle cx="62" cy="22" r="3" fill="#a6d98a"/>
      ${eyes(33, 10, 5)}
      ${smile(43, 6)}
      <path d="M50,46 L50,52 M50,52 L47,55.5 M50,52 L53,55.5" fill="none" stroke="#e0323a" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="30" cy="41" r="4" fill="#c3be9d"/>
      <circle cx="70" cy="41" r="4" fill="#c3be9d"/>`),
  },
  ratte: {
    id: 'ratte',
    name: 'Ratte',
    // Braun, kleine Ohren, lange Schnauze mit Nagezähnen (anders als die Maus).
    svg: svg(`
      <circle cx="26" cy="28" r="12" fill="#9b7b66"/>
      <circle cx="74" cy="28" r="12" fill="#9b7b66"/>
      <circle cx="26" cy="28" r="7" fill="#f0b9c3"/>
      <circle cx="74" cy="28" r="7" fill="#f0b9c3"/>
      <ellipse cx="50" cy="50" rx="28" ry="27" fill="#9b7b66"/>
      <ellipse cx="50" cy="70" rx="15" ry="14" fill="#c9ad98"/>
      ${eyes(46, 11, 4)}
      <circle cx="50" cy="74" r="4.5" fill="#e88aa0"/>
      <rect x="46.5" y="80" width="3" height="5" rx="1" fill="#fff" stroke="#d9cfc4" stroke-width=".8"/>
      <rect x="50.5" y="80" width="3" height="5" rx="1" fill="#fff" stroke="#d9cfc4" stroke-width=".8"/>
      <path d="M20,68 L37,71 M20,76 L37,75 M80,68 L63,71 M80,76 L63,75" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>`),
  },
  regenwurm: {
    id: 'regenwurm',
    name: 'Regenwurm',
    // Der Wurm richtet sich auf; der Kopf ist das obere Ende des Körpers und schaut nach vorn.
    svg: svg(`
      <path d="M14,84 Q28,90 42,85 Q55,80 53,66 Q50,54 50,42" fill="none" stroke="#e89aa6" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M26,77 Q27,84 26,91 M36,77 Q38,84 37,91 M41,69 Q52,67 63,70 M40,60 Q50,58 61,60" fill="none" stroke="#d47888" stroke-width="2" stroke-linecap="round"/>
      <path d="M39,52 Q50,50 61,52" fill="none" stroke="#f4c0c8" stroke-width="5" stroke-linecap="round"/>
      <circle cx="50" cy="34" r="19" fill="#e89aa6"/>
      ${eyes(31, 7.5, 4)}
      ${smile(40, 5)}
      <circle cx="37" cy="39" r="3.5" fill="#f7c6cf"/>
      <circle cx="63" cy="39" r="3.5" fill="#f7c6cf"/>`),
  },
  schnecke: {
    id: 'schnecke',
    name: 'Schnecke',
    // Haus mit Spirale, Augen auf Stielen.
    svg: svg(`
      <circle cx="62" cy="46" r="28" fill="#e0a458" stroke="#b9783a" stroke-width="3"/>
      <path d="M63.5,46 L63.7,46.3 L63.9,46.6 L64.1,47 L64.1,47.4 L64.1,47.9 L63.9,48.4 L63.7,48.9 L63.3,49.4 L62.8,49.8 L62.3,50.1 L61.7,50.4 L60.9,50.5 L60.2,50.6 L59.4,50.5 L58.6,50.2 L57.8,49.9 L57.1,49.3 L56.4,48.7 L55.8,47.9 L55.3,47 L55,45.9 L54.8,44.9 L54.8,43.7 L55,42.5 L55.4,41.4 L56,40.3 L56.7,39.2 L57.7,38.3 L58.8,37.5 L60,36.8 L61.4,36.4 L62.9,36.1 L64.4,36.1 L65.9,36.3 L67.5,36.8 L68.9,37.5 L70.3,38.5 L71.6,39.7 L72.7,41.1 L73.5,42.6 L74.2,44.4 L74.5,46.2 L74.6,48.1 L74.4,50.1 L73.9,52 L73.1,53.9 L72,55.6 L70.6,57.2 L68.9,58.6 L67.1,59.7 L65,60.6 L62.8,61.1 L60.5,61.3 L58.2,61.2 L55.9,60.7 L53.6,59.8 L51.4,58.6 L49.5,57.1 L47.7,55.2 L46.3,53.1 L45.1,50.8 L44.4,48.2 L44,45.5 L44,42.8 L44.4,40.1 L45.3,37.4 L46.5,34.8 L48.2,32.5 L50.2,30.3 L52.5,28.5 L55.2,27.1 L58,26 L61.1,25.4 L64.2,25.2 L67.3,25.5 L70.4,26.3 L73.4,27.5 L76.2,29.3 L78.8,31.4 L81,33.9 L82.8,36.8" fill="none" stroke="#b9783a" stroke-width="3" stroke-linecap="round"/>
      <path d="M6,92 Q8,76 26,72 L86,76 Q96,80 94,92 Z" fill="#b7d48a"/>
      <path d="M24,54 L18,30 M36,54 L40,30" stroke="#a3c475" stroke-width="5" stroke-linecap="round"/>
      <circle cx="18" cy="28" r="6.5" fill="#fff" stroke="${INK}" stroke-width="1.8"/>
      <circle cx="40" cy="28" r="6.5" fill="#fff" stroke="${INK}" stroke-width="1.8"/>
      ${pupil(18, 28, 4)}
      ${pupil(40, 28, 4)}
      <ellipse cx="30" cy="68" rx="19" ry="16" fill="#b7d48a"/>
      <path d="M23,70 Q30,77 37,70" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="17" cy="70" r="4" fill="#e1bdb2"/>
      <circle cx="43" cy="70" r="4" fill="#e1bdb2"/>`),
  },
  regenbogendrache: {
    id: 'regenbogendrache',
    name: 'Regenbogendrache',
    svg: svg(`
      <defs><clipPath id="dh"><ellipse cx="50" cy="56" rx="34" ry="30"/></clipPath></defs>
      <path d="M18,44 Q12,22 22,10 Q24,26 30,32 Z" fill="#e53935"/><path d="M82,44 Q88,22 78,10 Q76,26 70,32 Z" fill="#8e24aa"/><path d="M27.33,34 L33.00,14 L38.67,34 Z" fill="#fb8c00"/><path d="M38.67,34 L44.33,8 L50.00,34 Z" fill="#fdd835"/><path d="M50.00,34 L55.67,8 L61.33,34 Z" fill="#43a047"/><path d="M61.33,34 L67.00,14 L72.67,34 Z" fill="#1e88e5"/><g clip-path="url(#dh)"><rect x="16.00" y="0" width="11.63" height="100" fill="#e53935"/><rect x="27.33" y="0" width="11.63" height="100" fill="#fb8c00"/><rect x="38.67" y="0" width="11.63" height="100" fill="#fdd835"/><rect x="50.00" y="0" width="11.63" height="100" fill="#43a047"/><rect x="61.33" y="0" width="11.63" height="100" fill="#1e88e5"/><rect x="72.67" y="0" width="11.63" height="100" fill="#8e24aa"/></g>
      <ellipse cx="50" cy="73" rx="21" ry="13" fill="#fff"/>
      <circle cx="37" cy="50" r="7" fill="#fff"/><circle cx="63" cy="50" r="7" fill="#fff"/>${pupil(37, 50, 4)}${pupil(63, 50, 4)}
      <circle cx="44" cy="70" r="2" fill="${INK}"/><circle cx="56" cy="70" r="2" fill="${INK}"/><path d="M43,76 Q50,82 57,76" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`),
  },
};

/** Feste Reihenfolge aller Tiere: neue Gruppen bekommen die ersten N. */
/** Erst der Mathe-Waschbär, dann alle Tiere alphabetisch, zuletzt der Regenbogendrache. */
const FIRST: AnimalId[] = ['mathewaschbaer'];
const LAST: AnimalId[] = ['regenbogendrache'];
export const ANIMAL_ORDER: Animal[] = [
  ...FIRST.map((id) => ANIMALS[id]),
  ...Object.values(ANIMALS)
    .filter((a) => !FIRST.includes(a.id) && !LAST.includes(a.id))
    .sort((x, y) => x.name.localeCompare(y.name, 'de')),
  ...LAST.map((id) => ANIMALS[id]),
];

/** Vorinstallierte Profile der ersten Gruppe. */
export const DEFAULT_ANIMALS: Animal[] = ANIMAL_ORDER.slice(0, 10);

export const animalImageUrl = (id: AnimalId): string =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent((ANIMALS[id] ?? ANIMALS.fuchs).svg)}`;
