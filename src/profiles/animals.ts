/**
 * Tierbilder für die Profile. Alle Bilder sind eigens für diese App
 * gezeichnet (Koordinatensystem 100 × 100).
 */

export type AnimalId =
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
  | 'schildkroete';

export interface Animal {
  id: AnimalId;
  name: string;
  svg: string;
}

const INK = '#4a3b2f';
const svg = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${body}</svg>`;

/** Augenpaar mit Glanzpunkt. */
const eyes = (y: number, dx = 13, r = 4.5) => `
  <circle cx="${50 - dx}" cy="${y}" r="${r}" fill="${INK}"/>
  <circle cx="${50 + dx}" cy="${y}" r="${r}" fill="${INK}"/>
  <circle cx="${50 - dx + 1.5}" cy="${y - 1.5}" r="1.4" fill="#fff"/>
  <circle cx="${50 + dx + 1.5}" cy="${y - 1.5}" r="1.4" fill="#fff"/>`;

const smile = (y: number, w = 7) =>
  `<path d="M${50 - w},${y} Q50,${y + 6} ${50 + w},${y}" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`;

export const ANIMALS: Record<AnimalId, Animal> = {
  fuchs: {
    id: 'fuchs',
    name: 'Fuchs',
    svg: svg(`
      <path d="M18,18 L36,34 L28,46 Z" fill="#e8823a"/>
      <path d="M82,18 L64,34 L72,46 Z" fill="#e8823a"/>
      <path d="M22,24 L32,34 L28,40 Z" fill="#4a3b2f" opacity=".5"/>
      <path d="M78,24 L68,34 L72,40 Z" fill="#4a3b2f" opacity=".5"/>
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
      <circle cx="36" cy="43" r="6" fill="${INK}"/>
      <circle cx="64" cy="43" r="6" fill="${INK}"/>
      <circle cx="38" cy="41" r="2" fill="#fff"/>
      <circle cx="66" cy="41" r="2" fill="#fff"/>
      <path d="M45,54 L55,54 L50,63 Z" fill="#f08c3e"/>`),
  },
  igel: {
    id: 'igel',
    name: 'Igel',
    svg: svg(`
      <path d="M12,62 L8,44 L20,48 L18,30 L30,38 L34,20 L44,32 L52,14 L58,32 L70,20 L72,38 L84,32 L80,48 L92,46 L86,62 Z" fill="#6d5442"/>
      <ellipse cx="50" cy="64" rx="30" ry="26" fill="#d9b48f"/>
      <ellipse cx="50" cy="74" rx="16" ry="12" fill="#f1dcc3"/>
      ${eyes(58, 12, 4)}
      <circle cx="50" cy="72" r="5" fill="${INK}"/>
      ${smile(80, 5)}`),
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
      <circle cx="31" cy="70" r="5" fill="#f3b3c3" opacity=".6"/>
      <circle cx="69" cy="70" r="5" fill="#f3b3c3" opacity=".6"/>`),
  },
  katze: {
    id: 'katze',
    name: 'Katze',
    svg: svg(`
      <path d="M16,46 L20,12 L44,30 Z" fill="#9aa0a8"/>
      <path d="M84,46 L80,12 L56,30 Z" fill="#9aa0a8"/>
      <path d="M22,36 L24,20 L36,30 Z" fill="#f3b3c3"/>
      <path d="M78,36 L76,20 L64,30 Z" fill="#f3b3c3"/>
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
      <circle cx="33" cy="30" r="5" fill="${INK}"/>
      <circle cx="69" cy="30" r="5" fill="${INK}"/>
      <path d="M26,66 Q50,86 74,66" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="44" cy="54" r="1.8" fill="${INK}"/>
      <circle cx="56" cy="54" r="1.8" fill="${INK}"/>
      <circle cx="22" cy="66" r="5" fill="#f3b3c3" opacity=".6"/>
      <circle cx="78" cy="66" r="5" fill="#f3b3c3" opacity=".6"/>`),
  },
  pinguin: {
    id: 'pinguin',
    name: 'Pinguin',
    svg: svg(`
      <ellipse cx="50" cy="54" rx="36" ry="40" fill="#3c4250"/>
      <path d="M50,30 Q30,22 22,46 Q20,74 50,88 Q80,74 78,46 Q70,22 50,30 Z" fill="#fff"/>
      ${eyes(50, 13, 4.5)}
      <path d="M42,60 Q50,56 58,60 Q50,70 42,60 Z" fill="#f2a33a"/>
      <circle cx="30" cy="64" r="5" fill="#f3b3c3" opacity=".6"/>
      <circle cx="70" cy="64" r="5" fill="#f3b3c3" opacity=".6"/>`),
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
      <path d="M20,38 L22,12 L42,26 Z" fill="#e89aac"/>
      <path d="M80,38 L78,12 L58,26 Z" fill="#e89aac"/>
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
      <circle cx="44" cy="53" r="2.6" fill="${INK}"/>
      <circle cx="58" cy="53" r="2.6" fill="${INK}"/>
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
      <circle cx="30" cy="56" r="5" fill="#f3b3c3" opacity=".6"/>
      <circle cx="70" cy="56" r="5" fill="#f3b3c3" opacity=".6"/>`),
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
      <circle cx="18" cy="66" r="5" fill="#f3b3c3" opacity=".7"/>
      <circle cx="82" cy="66" r="5" fill="#f3b3c3" opacity=".7"/>`),
  },
  krake: {
    id: 'krake',
    name: 'Krake',
    svg: svg(`
      <path d="M26,62 Q14,80 24,92 M38,66 Q32,84 40,94 M50,68 L50,94 M62,66 Q68,84 60,94 M74,62 Q86,80 76,92" stroke="#d9608a" stroke-width="9" fill="none" stroke-linecap="round"/>
      <ellipse cx="50" cy="44" rx="32" ry="30" fill="#e8739c"/>
      <circle cx="34" cy="26" r="4" fill="#f3a3bf"/>
      <circle cx="62" cy="22" r="3" fill="#f3a3bf"/>
      <circle cx="70" cy="32" r="4.5" fill="#f3a3bf"/>
      ${eyes(46, 12, 5)}
      ${smile(57, 6)}
      <circle cx="28" cy="54" r="5" fill="#ffd0df" opacity=".8"/>
      <circle cx="72" cy="54" r="5" fill="#ffd0df" opacity=".8"/>`),
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
      <circle cx="37" cy="49" r="4" fill="#fff"/>
      <circle cx="63" cy="49" r="4" fill="#fff"/>
      <circle cx="37.5" cy="49.5" r="2.2" fill="${INK}"/>
      <circle cx="63.5" cy="49.5" r="2.2" fill="${INK}"/>
      <ellipse cx="50" cy="65" rx="6" ry="4.5" fill="#2d2d2d"/>
      ${smile(72, 5)}`),
  },
  koala: {
    id: 'koala',
    name: 'Koala',
    svg: svg(`
      <circle cx="20" cy="34" r="17" fill="#9aa0a8"/>
      <circle cx="80" cy="34" r="17" fill="#9aa0a8"/>
      <circle cx="20" cy="34" r="10" fill="#f1e8e8"/>
      <circle cx="80" cy="34" r="10" fill="#f1e8e8"/>
      <ellipse cx="50" cy="56" rx="32" ry="30" fill="#aeb4bc"/>
      ${eyes(50, 15, 4)}
      <ellipse cx="50" cy="62" rx="8" ry="11" fill="#3c4250"/>
      ${smile(78, 5)}`),
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
      <circle cx="35.5" cy="54.5" r="2.8" fill="${INK}"/>
      <circle cx="65.5" cy="54.5" r="2.8" fill="${INK}"/>
      <ellipse cx="50" cy="73" rx="14" ry="10" fill="#fff"/>
      <ellipse cx="50" cy="68" rx="5" ry="3.5" fill="${INK}"/>
      ${smile(75, 4)}`),
  },
  eichhoernchen: {
    id: 'eichhoernchen',
    name: 'Eichhörnchen',
    svg: svg(`
      <path d="M20,42 L24,12 L28,3 L32,14 L42,28 Z" fill="#c8662a"/>
      <path d="M80,42 L76,12 L72,3 L68,14 L58,28 Z" fill="#c8662a"/>
      <ellipse cx="50" cy="56" rx="32" ry="30" fill="#d9743a"/>
      <ellipse cx="50" cy="70" rx="21" ry="15" fill="#fbe2c4"/>
      ${eyes(51, 13, 4.5)}
      <ellipse cx="50" cy="63" rx="4.5" ry="3.2" fill="${INK}"/>
      <path d="M46,71 L46,79 L54,79 L54,71 Z M50,71 L50,79" fill="#fff" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
      <circle cx="30" cy="66" r="5" fill="#f3b3c3" opacity=".6"/>
      <circle cx="70" cy="66" r="5" fill="#f3b3c3" opacity=".6"/>`),
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
      <circle cx="29" cy="64" r="5" fill="#f3b3c3" opacity=".6"/>
      <circle cx="71" cy="64" r="5" fill="#f3b3c3" opacity=".6"/>`),
  },
  ente: {
    id: 'ente',
    name: 'Ente',
    svg: svg(`
      <path d="M47,20 Q44,6 51,3 Q50,10 57,9 Q52,14 55,20 Z" fill="#f5c932"/>
      <circle cx="50" cy="52" r="34" fill="#ffd94a"/>
      ${eyes(45, 13, 4.5)}
      <ellipse cx="50" cy="67" rx="21" ry="10" fill="#f28c28"/>
      <path d="M31,67 Q50,72 69,67" fill="none" stroke="#c96a12" stroke-width="2" stroke-linecap="round"/>
      <circle cx="26" cy="58" r="5" fill="#f3b3c3" opacity=".7"/>
      <circle cx="74" cy="58" r="5" fill="#f3b3c3" opacity=".7"/>`),
  },
  marienkaefer: {
    id: 'marienkaefer',
    name: 'Marienkäfer',
    svg: svg(`
      <circle cx="50" cy="60" r="34" fill="#e0322b"/>
      <path d="M50,42 L50,94" stroke="#2d2d2d" stroke-width="2.5"/>
      <circle cx="31" cy="63" r="6" fill="#2d2d2d"/>
      <circle cx="69" cy="63" r="6" fill="#2d2d2d"/>
      <circle cx="37" cy="82" r="5" fill="#2d2d2d"/>
      <circle cx="63" cy="82" r="5" fill="#2d2d2d"/>
      <path d="M42,22 Q36,10 29,9 M58,22 Q64,10 71,9" fill="none" stroke="#2d2d2d" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="29" cy="9" r="3.5" fill="#2d2d2d"/>
      <circle cx="71" cy="9" r="3.5" fill="#2d2d2d"/>
      <circle cx="50" cy="36" r="20" fill="#2d2d2d"/>
      <circle cx="43" cy="34" r="5" fill="#fff"/>
      <circle cx="57" cy="34" r="5" fill="#fff"/>
      <circle cx="43.5" cy="35" r="2.5" fill="${INK}"/>
      <circle cx="57.5" cy="35" r="2.5" fill="${INK}"/>
      <path d="M44,44 Q50,49 56,44" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`),
  },
  biene: {
    id: 'biene',
    name: 'Biene',
    svg: svg(`
      <ellipse cx="22" cy="28" rx="16" ry="10" fill="#d6eef8" stroke="#9cc9de" stroke-width="2" transform="rotate(-30 22 28)"/>
      <ellipse cx="78" cy="28" rx="16" ry="10" fill="#d6eef8" stroke="#9cc9de" stroke-width="2" transform="rotate(30 78 28)"/>
      <path d="M42,26 Q38,12 32,10 M58,26 Q62,12 68,10" fill="none" stroke="#2d2d2d" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="32" cy="10" r="3.5" fill="#2d2d2d"/>
      <circle cx="68" cy="10" r="3.5" fill="#2d2d2d"/>
      <circle cx="50" cy="56" r="32" fill="#ffd23f"/>
      <path d="M28,36 Q50,28 72,36 L76,42 Q50,34 24,42 Z" fill="#2d2d2d"/>
      <path d="M23,70 Q50,80 77,70 L72,79 Q50,89 28,79 Z" fill="#2d2d2d"/>
      ${eyes(52, 12, 4.5)}
      ${smile(62, 6)}
      <circle cx="30" cy="60" r="5" fill="#f3a3a3" opacity=".7"/>
      <circle cx="70" cy="60" r="5" fill="#f3a3a3" opacity=".7"/>`),
  },
  schildkroete: {
    id: 'schildkroete',
    name: 'Schildkröte',
    svg: svg(`
      <path d="M8,58 Q8,10 50,10 Q92,10 92,58 Z" fill="#8a6a3c"/>
      <path d="M38,18 L62,18 L68,32 L50,40 L32,32 Z M14,50 L20,34 L30,38 L28,50 Z M86,50 L80,34 L70,38 L72,50 Z" fill="#a8834c"/>
      <ellipse cx="50" cy="66" rx="26" ry="24" fill="#8cc152"/>
      ${eyes(61, 11, 4.5)}
      ${smile(73, 7)}
      <circle cx="32" cy="70" r="4.5" fill="#f3b3c3" opacity=".6"/>
      <circle cx="68" cy="70" r="4.5" fill="#f3b3c3" opacity=".6"/>`),
  },
};

/** Feste Reihenfolge aller Tiere: neue Gruppen bekommen die ersten N. */
export const ANIMAL_ORDER: Animal[] = Object.values(ANIMALS);

/** Vorinstallierte Profile der ersten Gruppe. */
export const DEFAULT_ANIMALS: Animal[] = ANIMAL_ORDER.slice(0, 10);

export const animalImageUrl = (id: AnimalId): string =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent((ANIMALS[id] ?? ANIMALS.fuchs).svg)}`;
