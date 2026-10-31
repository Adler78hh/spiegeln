import { describe, expect, it } from 'vitest';
import { PdfDoc } from './minipdf';

describe('PDF', () => {
  it('Aufbau mit Seiten, Text (Umlaute), Bild und gültiger Querverweistabelle', () => {
    const doc = new PdfDoc();
    const img = { data: Uint8Array.from([0xff, 0xd8, 0xff, 0xd9]), width: 2, height: 2 };
    doc.addPage().text(10, 20, 12, 'Größe „Haus“ (1)', { bold: true }).rect(10, 30, 50, 40).image(img, 10, 30, 50, 40);
    doc.addPage().image(img, 0, 0, 10, 10);
    const bytes = doc.toBytes();
    const s = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
    expect(s.startsWith('%PDF-1.4')).toBe(true);
    expect(s).toContain('/Count 2');
    expect(s).toContain('Gr\\366\\337e \\204Haus\\223 \\(1\\)');
    // Ein Bild, auf beiden Seiten benutzt
    expect(s.match(/\/Subtype \/Image/g)).toHaveLength(1);
    // xref-Einträge zeigen auf „n 0 obj“
    const xref = Number(/startxref\n(\d+)/.exec(s)![1]);
    const entries = s.slice(xref).split('\n').slice(3).filter((l) => / n $/.test(l));
    for (const [i, e] of entries.entries()) expect(s.slice(Number(e.slice(0, 10)))).toMatch(new RegExp(`^${i + 1} 0 obj`));
  });
});
