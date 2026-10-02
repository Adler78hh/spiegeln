import { INVERT_PALETTE } from '../render/composite';
import type { ToolPrefs } from '../storage/store';
import { FlipIcon, HideLineIcon, InvertNegativeIcon, InvertTwoToneIcon, OutlineIcon, ResetIcon, SnapIcon } from './icons';

interface Props {
  prefs: ToolPrefs;
  onPrefsChange: (p: ToolPrefs) => void;
  onReset: () => void;
  /** Spiegel umdrehen: die andere Seite wird gespiegelt. */
  onFlip: () => void;
  /** Knöpfe für die Farbumkehr anbieten (nur freies Spiegeln). */
  withInvert?: boolean;
}

/**
 * Werkzeugknöpfe in festen Blöcken: Winkel, Spiegelachse, Umriss; darunter
 * (nur frei) die beiden Farbumkehr-Knöpfe; dann Spiegel umdrehen und
 * Zurücksetzen. Die
 * Farbauswahl hat einen festen Platz, damit beim Ein- und Ausschalten kein
 * Knopf springt.
 */
export function MirrorTools({ prefs, onPrefsChange, onReset, onFlip, withInvert }: Props) {
  const invert = prefs.invert ?? 'none';
  const toggleInvert = (mode: 'silhouette' | 'negative') => onPrefsChange({ ...prefs, invert: invert === mode ? 'none' : mode });
  const colorsShown = invert === 'silhouette';
  return (
    <div className={`tools ${withInvert ? 'tools-free' : ''}`}>
      <div className="tool-group tool-group-view">
        <button
          className={`tool-btn ${prefs.snap ? 'on' : ''}`}
          aria-pressed={prefs.snap}
          aria-label="Einrasten auf 15 Grad"
          onClick={() => onPrefsChange({ ...prefs, snap: !prefs.snap })}
        >
          <SnapIcon />
        </button>
        <button
          className={`tool-btn ${prefs.hideLine ? 'on' : ''}`}
          aria-pressed={!!prefs.hideLine}
          aria-label="Spiegelachse ausblenden"
          onClick={() => onPrefsChange({ ...prefs, hideLine: !prefs.hideLine })}
        >
          <HideLineIcon />
        </button>
        <button
          className={`tool-btn ${prefs.showOutline ? 'on' : ''}`}
          aria-pressed={prefs.showOutline}
          aria-label="Umriss der Figur"
          onClick={() => onPrefsChange({ ...prefs, showOutline: !prefs.showOutline })}
        >
          <OutlineIcon />
        </button>
      </div>
      {withInvert && (
        <div className="tool-group tool-group-invert">
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
        </div>
      )}
      <div className="tool-group tool-group-actions">
        <button className="tool-btn" aria-label="Spiegel umdrehen" onClick={onFlip}>
          <FlipIcon />
        </button>
        <button className="tool-btn" aria-label="Zurücksetzen" onClick={onReset}>
          <ResetIcon />
        </button>
      </div>
      {withInvert && (
        <div
          className={`invert-colors ${colorsShown ? '' : 'is-hidden'}`}
          role="radiogroup"
          aria-label="Farbe der Umkehr"
          aria-hidden={!colorsShown}
        >
          {INVERT_PALETTE.map((c) => (
            <button
              key={c.hex}
              role="radio"
              aria-checked={prefs.invertColor === c.hex}
              aria-label={c.name}
              tabIndex={colorsShown ? 0 : -1}
              className={`invert-swatch ${prefs.invertColor === c.hex ? 'selected' : ''}`}
              style={{ background: c.hex }}
              onClick={() => onPrefsChange({ ...prefs, invertColor: c.hex })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
