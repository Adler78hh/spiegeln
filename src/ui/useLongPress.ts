import { useEffect, useRef, useState } from 'react';
import { LONG_PRESS_MS } from '../adult/gate';

/**
 * Langes Drücken: `onDone` erst nach `ms` Millisekunden ununterbrochenem
 * Halten. `progress` (0…1) zeigt den Fortschritt an.
 */
export function useLongPress(onDone: () => void, ms = LONG_PRESS_MS) {
  const [progress, setProgress] = useState(0);
  const start = useRef(0);
  const raf = useRef(0);
  const done = useRef(onDone);
  done.current = onDone;

  const stop = () => {
    cancelAnimationFrame(raf.current);
    setProgress(0);
  };

  const begin = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    cancelAnimationFrame(raf.current);
    start.current = performance.now();
    const tick = () => {
      const p = (performance.now() - start.current) / ms;
      if (p >= 1) {
        setProgress(0);
        done.current();
        return;
      }
      setProgress(p);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return {
    progress,
    handlers: {
      onPointerDown: begin,
      onPointerUp: stop,
      onPointerCancel: stop,
      onPointerLeave: stop,
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    },
  };
}
