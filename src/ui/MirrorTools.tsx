import type { ToolPrefs } from '../storage/store';
import { HideLineIcon, OutlineIcon, ResetIcon, SnapIcon } from './icons';

interface Props {
  prefs: ToolPrefs;
  onPrefsChange: (p: ToolPrefs) => void;
  onReset: () => void;
}

/** Werkzeugknöpfe: 15°-Einrasten, Umriss, Achse ausblenden, Zurücksetzen. */
export function MirrorTools({ prefs, onPrefsChange, onReset }: Props) {
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
      <button className="tool-btn" aria-label="Zurücksetzen" onClick={onReset}>
        <ResetIcon />
      </button>
    </div>
  );
}
