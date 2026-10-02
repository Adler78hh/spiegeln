import { useMemo } from 'react';
import { besideScene, initialScene, type Scene } from '../geometry';
import { figureRightEdge } from '../render/composite';

/**
 * Startlage für das Spiegeln: Spiegel knapp rechts neben der Figur. Solange
 * das Bild noch lädt, die alte Mittellage (es ist dann ohnehin nichts zu sehen).
 */
export function useStartScene(image: HTMLImageElement | null | undefined, aspect: number): () => Scene {
  const edge = useMemo(() => (image ? figureRightEdge(image, aspect) : null), [image, aspect]);
  return () => (edge === null ? initialScene() : besideScene(edge));
}
