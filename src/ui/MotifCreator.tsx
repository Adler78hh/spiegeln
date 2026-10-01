import { useRef, useState } from 'react';
import { fitWithin } from '../drawing/model';
import { loadImage } from '../motifs/library';
import type { CustomMotif } from '../storage/store';
import { DrawingEditor } from './DrawingEditor';
import { BackIcon, CheckIcon, PenIcon, PhotoIcon } from './icons';

/** Größte Kantenlänge importierter Fotos (Pixel). */
const PHOTO_MAX_SIDE = 1024;

type NewMotif = Omit<CustomMotif, 'id' | 'createdAt'>;

interface Props {
  onSave: (m: NewMotif) => void;
  onCancel: () => void;
}

/** Foto verkleinern und als JPEG ablegen. Das Bild wird sonst nicht verändert. */
async function importPhoto(file: File): Promise<NewMotif> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const size = fitWithin(img.naturalWidth, img.naturalHeight, PHOTO_MAX_SIDE);
    const c = document.createElement('canvas');
    c.width = size.width;
    c.height = size.height;
    const g = c.getContext('2d')!;
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, 0, 0, size.width, size.height);
    return { name: 'Foto', source: 'photo', image: c.toDataURL('image/jpeg', 0.9), ...size };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Eigenes Motiv anlegen: Foto (Kamera/Galerie) oder Zeichnung. */
export function MotifCreator({ onSave, onCancel }: Props) {
  const [mode, setMode] = useState<'choose' | 'draw' | 'photo'>('choose');
  const [photo, setPhoto] = useState<NewMotif | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setError(null);
      setPhoto(await importPhoto(file));
      setMode('photo');
    } catch {
      setError('Dieses Bild konnte nicht geöffnet werden. Bitte ein anderes Foto wählen.');
    }
  };

  if (mode === 'draw') {
    return (
      <DrawingEditor
        onCancel={() => setMode('choose')}
        onSave={(r) => onSave({ name: 'Zeichnung', source: 'drawing', ...r })}
      />
    );
  }

  if (mode === 'photo' && photo) {
    return (
      <div className="creator-screen">
        <div className="list-top">
          <button className="tool-btn" aria-label="Zurück" onClick={() => setMode('choose')}>
            <BackIcon />
          </button>
        </div>
        <div className="photo-preview">
          <img src={photo.image} alt="Gewähltes Foto" />
        </div>
        <div className="creator-actions">
          <button className="decide-btn fits" onClick={() => onSave(photo)}>
            <CheckIcon size={36} />
            <span>Als Motiv speichern</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="creator-screen">
      <div className="list-top">
        <button className="tool-btn" aria-label="Zurück" onClick={onCancel}>
          <BackIcon />
        </button>
      </div>
      <div className="home">
        <button className="home-tile" onClick={() => fileRef.current?.click()}>
          <PhotoIcon size={110} />
          <span>Foto</span>
        </button>
        <button className="home-tile" onClick={() => setMode('draw')}>
          <PenIcon size={110} />
          <span>Zeichnen</span>
        </button>
      </div>
      {error && <p className="creator-error">{error}</p>}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
    </div>
  );
}
