import { useEffect, useRef, useState } from 'react';
import { LONG_PRESS_MS } from '../adult/gate';

/**
 * Langes Drücken: `onDone` erst nach `ms` Millisekunden Halten. `progress`
 * (0…1) zeigt den Fortschritt an.
 *
 * Abgebrochen wird nur durch Loslassen. Bricht der Browser die Berührung
 * selbst ab (Tablets tun das z. B., um Text zu markieren oder ein Menü zu
 * zeigen), läuft die Zeit weiter, statt von vorn zu beginnen.
 */
export function useLongPress(onDone: () => void, ms = LONG_PRESS_MS) {
  const [progress, setProgress] = useState(0);
  const start = useRef(0);
  const raf = useRef(0);
  const running = useRef(false);
  const done = useRef(onDone);
  done.current = onDone;

  const stop = () => {
    running.current = false;
    cancelAnimationFrame(raf.current);
    window.removeEventListener('pointerup', stop);
    window.removeEventListener('touchend', stop);
    window.removeEventListener('mouseup', stop);
    setProgress(0);
  };

  const begin = (e: React.PointerEvent) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ohne Zeigerfang geht es auch.
    }
    if (running.current) return;
    running.current = true;
    // Loslassen irgendwo auf der Seite beendet das Drücken.
    window.addEventListener('pointerup', stop);
    window.addEventListener('touchend', stop);
    window.addEventListener('mouseup', stop);
    start.current = performance.now();
    const tick = () => {
      const p = (performance.now() - start.current) / ms;
      if (p >= 1) {
        stop();
        done.current();
        return;
      }
      setProgress(p);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => stop, []);

  return {
    progress,
    handlers: {
      onPointerDown: begin,
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    },
  };
}
