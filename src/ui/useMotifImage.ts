import { useEffect, useState } from 'react';
import { loadImage, type MotifInfo } from '../motifs/library';

/** Lädt das Bild eines Motivs (vorinstalliert oder eigen). */
export function useMotifImage(motif: MotifInfo | undefined): HTMLImageElement | null {
  const [image, setImage] = useState<{ src: string; img: HTMLImageElement } | null>(null);
  const src = motif?.src;
  useEffect(() => {
    if (!src) return;
    let alive = true;
    loadImage(src).then((img) => alive && setImage({ src, img }), console.error);
    return () => {
      alive = false;
    };
  }, [src]);
  // Nur das Bild des aktuellen Motivs liefern (kein kurzes Aufblitzen des alten).
  return image && image.src === src ? image.img : null;
}
