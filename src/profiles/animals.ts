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
  | 'maus';

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
};

/** Vorinstallierte Profile in dieser Reihenfolge. */
export const DEFAULT_ANIMALS: Animal[] = [
  ANIMALS.fuchs,
  ANIMALS.eule,
  ANIMALS.igel,
  ANIMALS.baer,
  ANIMALS.hase,
  ANIMALS.katze,
  ANIMALS.frosch,
  ANIMALS.pinguin,
  ANIMALS.loewe,
  ANIMALS.maus,
];

export const animalImageUrl = (id: AnimalId): string =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent((ANIMALS[id] ?? ANIMALS.fuchs).svg)}`;
