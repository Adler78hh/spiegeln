import { useEffect, useState } from 'react';
import { findBuiltinMotif, svgToImage } from '../motifs/builtin';

/** Lädt das Bild eines vorinstallierten Motivs. */
export function useMotifImage(motifId: string): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    let alive = true;
    const motif = findBuiltinMotif(motifId);
    if (!motif) return;
    svgToImage(motif.svg).then((img) => alive && setImage(img));
    return () => {
      alive = false;
    };
  }, [motifId]);
  return image;
}
