/**
 * Vorinstallierte Motive. Alle Motive sind eigens für diese App gezeichnet.
 * Koordinatensystem jeweils 200 × 200.
 */
export interface BuiltinMotif {
  id: string;
  name: string;
  svg: string;
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
  },
];

export const svgDataUrl = (svgText: string): string =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;

export function svgToImage(svgText: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = svgDataUrl(svgText);
  return img.decode().then(() => img);
}
