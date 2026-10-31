import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Challenge } from '../../challenges/types';

/** Zielfiguren je Seite: erste Seite 4 (oben die Ausgangsfigur), danach 8. */
export function worksheetPages<T>(targets: T[]): T[][] {
  const pages: T[][] = [targets.slice(0, 4)];
  for (let i = 4; i < targets.length; i += 8) pages.push(targets.slice(i, i + 8));
  return pages;
}

/**
 * Arbeitsblatt zum Ausdrucken (A4 hoch, Raster 2 × 4, jede Zielfigur ein
 * Achtel der Seite). Seite 1: oben die Ausgangsfigur über vier Felder.
 */
export function WorksheetPrint({ challenge, figure, onDone }: { challenge: Challenge; figure: string | undefined; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const pages = worksheetPages(challenge.targets);

  useEffect(() => {
    let alive = true;
    const finish = () => alive && onDone();
    const imgs = [...(ref.current?.querySelectorAll('img') ?? [])];
    Promise.all(imgs.map((img) => img.decode().catch(() => undefined))).then(() => {
      if (!alive) return;
      window.addEventListener('afterprint', finish, { once: true });
      window.print();
    });
    return () => {
      alive = false;
      window.removeEventListener('afterprint', finish);
    };
    // Nur einmal drucken.
  }, []);

  let n = 0;
  return createPortal(
    <div className="print-sheets" ref={ref}>
      {pages.map((targets, p) => (
        <article className="print-page ws-page" key={p}>
          {p === 0 && (
            <section className="ws-start">
              <header className="ws-head">
                <strong>{challenge.name}</strong>
                <span>Name: ____________________</span>
              </header>
              <p className="ws-task">Welche Figuren kannst du mit dem Spiegel legen? Kreuze an.</p>
              {figure && <img className="ws-figure" src={figure} alt="Ausgangsfigur" />}
            </section>
          )}
          {targets.map((t) => {
            n++;
            return (
              <section className="ws-cell" key={t.id}>
                <span className="ws-num">{n}</span>
                <img src={t.image} alt={`Zielfigur ${n}`} />
                <span className="ws-boxes">
                  <span>☐ passt</span>
                  <span>☐ geht nicht</span>
                </span>
              </section>
            );
          })}
        </article>
      ))}
    </div>,
    document.body,
  );
}
