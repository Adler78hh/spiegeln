/**
 * Arbeitsblatt als PDF (A4 hoch). Jede Seite hat Platz für 8 Zielfiguren
 * (Raster 2 × 4, je ein Achtel der Seite). Auf Seite 1 nimmt oben die
 * Ausgangsfigur den Platz von 4 Zielfiguren ein.
 */
import type { Challenge } from '../../challenges/types';
import { loadImage } from '../../motifs/library';
import { A4, PdfDoc, type PdfImage } from '../../pdf/minipdf';
import { downloadBlob, safeFileName } from '../download';

/** Zielfiguren je Seite: erste Seite 4 (oben die Ausgangsfigur), danach 8. */
export function worksheetPages<T>(targets: T[]): T[][] {
  const pages: T[][] = [targets.slice(0, 4)];
  for (let i = 4; i < targets.length; i += 8) pages.push(targets.slice(i, i + 8));
  return pages;
}

/** Bild als JPEG auf weißem Grund (Transparenz → weiß). */
async function jpeg(src: string, maxPx: number): Promise<PdfImage> {
  const img = await loadImage(src);
  const k = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(img.naturalWidth * k));
  c.height = Math.max(1, Math.round(img.naturalHeight * k));
  const g = c.getContext('2d')!;
  g.fillStyle = '#fff';
  g.fillRect(0, 0, c.width, c.height);
  g.drawImage(img, 0, 0, c.width, c.height);
  // Hintergrund der Arbeitsfläche (cremeweiß) auf Papier rein weiß.
  const data = g.getImageData(0, 0, c.width, c.height);
  const [r0, g0, b0] = [0xff, 0xfd, 0xf8];
  for (let i = 0; i < data.data.length; i += 4) {
    const d = Math.abs(data.data[i] - r0) + Math.abs(data.data[i + 1] - g0) + Math.abs(data.data[i + 2] - b0);
    if (d < 12) data.data[i] = data.data[i + 1] = data.data[i + 2] = 255;
  }
  g.putImageData(data, 0, 0);
  const b64 = c.toDataURL('image/jpeg', 0.9).split(',')[1];
  return { data: Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0)), width: c.width, height: c.height };
}

const MARGIN = 12;
const W = A4.w - 2 * MARGIN;
const H = A4.h - 2 * MARGIN;
const CW = W / 2;
const CH = H / 4;

export async function worksheetPdf(challenge: Challenge, figure: string | undefined): Promise<Uint8Array> {
  const doc = new PdfDoc();
  const pages = worksheetPages(challenge.targets);
  const fig = figure ? await jpeg(figure, 900) : null;
  const images = await Promise.all(challenge.targets.map((t) => jpeg(t.image, 512)));
  let num = 0;
  pages.forEach((targets, p) => {
    const page = doc.addPage();
    let cell = 0;
    if (p === 0) {
      // Kopf und Ausgangsfigur über vier Felder
      const x = MARGIN;
      const y = MARGIN;
      page.rect(x, y, W, 2 * CH);
      page.text(x + 5, y + 9, 15, challenge.name, { bold: true });
      page.text(x + W - 5, y + 9, 12, 'Name: ______________________', { align: 'right' });
      page.text(x + W / 2, y + 17, 11, 'Welche Figuren kannst du mit dem Spiegel legen? Kreuze an.', { align: 'center' });
      if (fig) page.image(fig, x + 10, y + 22, W - 20, 2 * CH - 28);
      cell = 4;
    }
    for (const _t of targets) {
      const col = cell % 2;
      const row = Math.floor(cell / 2);
      const x = MARGIN + col * CW;
      const y = MARGIN + row * CH;
      page.rect(x, y, CW, CH);
      page.text(x + 3.5, y + 7.5, 14, String(num + 1), { bold: true });
      page.image(images[num], x + 10, y + 3, CW - 20, CH - 15);
      const by = y + CH - 9;
      page.rect(x + CW / 2 - 34, by, 4.5, 4.5, 0.35, 0.2).text(x + CW / 2 - 27.5, by + 3.8, 12, 'passt');
      page.rect(x + CW / 2 + 2, by, 4.5, 4.5, 0.35, 0.2).text(x + CW / 2 + 8.5, by + 3.8, 12, 'unlösbar');
      num++;
      cell++;
    }
    if (pages.length > 1) page.text(A4.w / 2, A4.h - 5, 8, `Seite ${p + 1} von ${pages.length}`, { align: 'center' });
  });
  return doc.toBytes();
}

/** Erzeugt das Arbeitsblatt und bietet es als PDF-Datei an. */
export async function downloadWorksheet(challenge: Challenge, figure: string | undefined): Promise<void> {
  const bytes = await worksheetPdf(challenge, figure);
  downloadBlob(new Blob([bytes as BlobPart], { type: 'application/pdf' }), `arbeitsblatt-${safeFileName(challenge.name)}.pdf`);
}
