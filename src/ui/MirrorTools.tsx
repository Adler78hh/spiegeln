import type { ToolPrefs } from '../storage/store';
import { HideLineIcon, InvertNegativeIcon, InvertTwoToneIcon, OutlineIcon, ResetIcon, SnapIcon } from './icons';

interface Props {
  prefs: ToolPrefs;
  onPrefsChange: (p: ToolPrefs) => void;
  onReset: () => void;
  /** Knöpfe für die Farbumkehr anbieten (nur freies Spiegeln). */
  withInvert?: boolean;
}

/** Werkzeugknöpfe: 15°-Einrasten, Umriss, Achse ausblenden, Farbumkehr (frei), Zurücksetzen. */
export function MirrorTools({ prefs, onPrefsChange, onReset, withInvert }: Props) {
  const invert = prefs.invert ?? 'none';
  const toggleInvert = (mode: 'silhouette' | 'negative') => onPrefsChange({ ...prefs, invert: invert === mode ? 'none' : mode });
  return (
    <div className="tools">
      <button
        className={`tool-btn ${prefs.snap ? 'on' : ''}`}
        aria-pressed={prefs.snap}
        aria-label="Einrasten auf 15 Grad"
        onClick={() => onPrefsChange({ ...prefs, snap: !prefs.snap })}
      >
        <SnapIcon />
      </button>
      <button
        className={`tool-btn ${prefs.showOutline ? 'on' : ''}`}
        aria-pressed={prefs.showOutline}
        aria-label="Umriss der Figur"
        onClick={() => onPrefsChange({ ...prefs, showOutline: !prefs.showOutline })}
      >
        <OutlineIcon />
      </button>
      <button
        className={`tool-btn ${prefs.hideLine ? 'on' : ''}`}
        aria-pressed={!!prefs.hideLine}
        aria-label="Spiegelachse ausblenden"
        onClick={() => onPrefsChange({ ...prefs, hideLine: !prefs.hideLine })}
      >
        <HideLineIcon />
      </button>
      {withInvert && (
        <>
          <button
            className={`tool-btn ${invert === 'silhouette' ? 'on' : ''}`}
            aria-pressed={invert === 'silhouette'}
            aria-label="Farbumkehr zweifarbig"
            onClick={() => toggleInvert('silhouette')}
          >
            <InvertTwoToneIcon />
          </button>
          <button
            className={`tool-btn ${invert === 'negative' ? 'on' : ''}`}
            aria-pressed={invert === 'negative'}
            aria-label="Farbumkehr als Negativ"
            onClick={() => toggleInvert('negative')}
          >
            <InvertNegativeIcon />
          </button>
        </>
      )}
      <button className="tool-btn" aria-label="Zurücksetzen" onClick={onReset}>
        <ResetIcon />
      </button>
    </div>
  );
}
