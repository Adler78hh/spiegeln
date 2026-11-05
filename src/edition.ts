/**
 * Ausgabe der App, beim Bauen festgelegt (`vite build --mode …`):
 * - Spiegeln (Vollversion)
 * - „Spiegeln gratis“ (`--mode gratis`)
 * - Zerlegen (`--mode zerlegen`): eigene App mit Blitzsehen, Zerlegen und
 *   Muster; Profilwahl, Gruppen und Erwachsenenbereich wie bei Spiegeln.
 *
 * Die Gratisversion hat eine Klasse mit allen Tieren, nur die mitgelieferten
 * Herausforderungen (kein freies Spiegeln, keine eigenen Herausforderungen
 * oder Motive) und einen Erwachsenenbereich nur mit Namen und Ergebnissen.
 */
export const GRATIS = import.meta.env.VITE_EDITION === 'gratis';

/** Die App „Zerlegen“ statt „Spiegeln“. */
export const ZERLEGEN = import.meta.env.VITE_EDITION === 'zerlegen';

/** Adresse der Vollversion (Hinweis in der Gratisversion). */
export const FULL_VERSION_URL = 'https://adler78hh.github.io/spiegeln/';
