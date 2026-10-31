/**
 * Sehr kleiner PDF-Erzeuger (A4, Text in Helvetica, JPEG-Bilder, Linien).
 * Maße in Millimetern, Ursprung oben links.
 */
const MM = 72 / 25.4;
export const A4 = { w: 210, h: 297 };

export interface PdfImage {
  /** JPEG-Daten. */
  data: Uint8Array;
  width: number;
  height: number;
}

/** Text → Bytes in WinAnsi (deckt ä, ö, ü, ß, „ “ ab). */
function winAnsi(s: string): number[] {
  const special: Record<string, number> = { '„': 0x84, '“': 0x93, '”': 0x94, '–': 0x96, '—': 0x97, '…': 0x85, '€': 0x80 };
  return [...s].map((ch) => special[ch] ?? (ch.charCodeAt(0) < 256 ? ch.charCodeAt(0) : 0x3f));
}

function pdfString(s: string): string {
  return (
    '(' +
    winAnsi(s)
      .map((c) => (c === 0x28 || c === 0x29 || c === 0x5c ? '\\' + String.fromCharCode(c) : c < 32 || c > 126 ? '\\' + c.toString(8).padStart(3, '0') : String.fromCharCode(c)))
      .join('') +
    ')'
  );
}

const n = (v: number) => (Math.round(v * 100) / 100).toString();

export class PdfPage {
  ops: string[] = [];
  images: number[] = [];
  constructor(private doc: PdfDoc) {}

  private y(mm: number) {
    return (A4.h - mm) * MM;
  }

  /** Text; `y` ist die Grundlinie. */
  text(x: number, y: number, size: number, s: string, opts: { bold?: boolean; align?: 'left' | 'center' | 'right' } = {}): this {
    const w = textWidth(s, size, !!opts.bold);
    const left = opts.align === 'center' ? x - w / 2 : opts.align === 'right' ? x - w : x;
    this.ops.push(`BT /${opts.bold ? 'F2' : 'F1'} ${size} Tf ${n(left * MM)} ${n(this.y(y))} Td ${pdfString(s)} Tj ET`);
    return this;
  }

  rect(x: number, y: number, w: number, h: number, lineWidth = 0.3, gray = 0.6): this {
    this.ops.push(`${gray} G ${n(lineWidth * MM)} w ${n(x * MM)} ${n(this.y(y + h))} ${n(w * MM)} ${n(h * MM)} re S`);
    return this;
  }

  line(x1: number, y1: number, x2: number, y2: number, lineWidth = 0.3, gray = 0.3): this {
    this.ops.push(`${gray} G ${n(lineWidth * MM)} w ${n(x1 * MM)} ${n(this.y(y1))} m ${n(x2 * MM)} ${n(this.y(y2))} l S`);
    return this;
  }

  /** Bild in das Rechteck einpassen (mittig, Seitenverhältnis bleibt). */
  image(img: PdfImage, x: number, y: number, w: number, h: number): this {
    const k = Math.min(w / img.width, h / img.height);
    const iw = img.width * k;
    const ih = img.height * k;
    const id = this.doc.imageId(img);
    if (!this.images.includes(id)) this.images.push(id);
    this.ops.push(`q ${n(iw * MM)} 0 0 ${n(ih * MM)} ${n((x + (w - iw) / 2) * MM)} ${n(this.y(y + (h - ih) / 2 + ih))} cm /Im${id} Do Q`);
    return this;
  }
}

/** Ungefähre Breite (mm) eines Textes in Helvetica. */
export function textWidth(s: string, size: number, bold = false): number {
  // Mittlere Zeichenbreiten (1/1000 em); grob, reicht zum Zentrieren.
  const avg = bold ? 590 : 540;
  const narrow = /[iljtf.,:;!|' ]/;
  let units = 0;
  for (const ch of s) units += narrow.test(ch) ? 300 : /[mwMW]/.test(ch) ? 850 : /[A-ZÄÖÜ]/.test(ch) ? 680 : avg;
  return ((units / 1000) * size) / MM;
}

export class PdfDoc {
  pages: PdfPage[] = [];
  private imgs: PdfImage[] = [];

  addPage(): PdfPage {
    const p = new PdfPage(this);
    this.pages.push(p);
    return p;
  }

  imageId(img: PdfImage): number {
    let i = this.imgs.indexOf(img);
    if (i < 0) i = this.imgs.push(img) - 1;
    return i;
  }

  toBytes(): Uint8Array {
    const chunks: Uint8Array[] = [];
    let length = 0;
    const offsets: number[] = [];
    const enc = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);
    const push = (b: Uint8Array) => {
      chunks.push(b);
      length += b.length;
    };
    const obj = (id: number, body: string | Uint8Array[], dict?: string) => {
      offsets[id] = length;
      if (typeof body === 'string') push(enc(`${id} 0 obj\n${body}\nendobj\n`));
      else {
        push(enc(`${id} 0 obj\n${dict}\nstream\n`));
        body.forEach(push);
        push(enc('\nendstream\nendobj\n'));
      }
    };

    // 1 Katalog, 2 Seitenbaum, 3/4 Schriften, dann Bilder, dann je Seite Seite + Inhalt.
    const imgBase = 5;
    const pageBase = imgBase + this.imgs.length;
    push(enc('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n'));
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    const kids = this.pages.map((_p, i) => `${pageBase + 2 * i} 0 R`).join(' ');
    obj(2, `<< /Type /Pages /Kids [${kids}] /Count ${this.pages.length} >>`);
    obj(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    obj(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    this.imgs.forEach((img, i) =>
      obj(
        imgBase + i,
        [img.data],
        `<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.data.length} >>`,
      ),
    );
    this.pages.forEach((p, i) => {
      const id = pageBase + 2 * i;
      const xo = p.images.map((k) => `/Im${k} ${imgBase + k} 0 R`).join(' ');
      obj(
        id,
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${n(A4.w * MM)} ${n(A4.h * MM)}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << ${xo} >> >> /Contents ${id + 1} 0 R >>`,
      );
      const content = enc(p.ops.join('\n'));
      obj(id + 1, [content], `<< /Length ${content.length} >>`);
    });
    const count = pageBase + 2 * this.pages.length;
    const xref = length;
    let table = `xref\n0 ${count}\n0000000000 65535 f \n`;
    for (let i = 1; i < count; i++) table += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    push(enc(`${table}trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`));
    const out = new Uint8Array(length);
    let at = 0;
    for (const c of chunks) {
      out.set(c, at);
      at += c.length;
    }
    return out;
  }
}
