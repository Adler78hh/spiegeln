/**
 * Ausgabe der App: Vollversion oder „Spiegeln gratis“. Wird beim Bauen
 * festgelegt (`vite build --mode gratis`).
 *
 * Die Gratisversion hat eine Klasse mit allen Tieren, nur die mitgelieferten
 * Herausforderungen (kein freies Spiegeln, keine eigenen Herausforderungen
 * oder Motive) und einen Erwachsenenbereich nur mit Namen und Ergebnissen.
 */
export const GRATIS = import.meta.env.VITE_EDITION === 'gratis';

/** Adresse der Vollversion (Hinweis in der Gratisversion). */
export const FULL_VERSION_URL = 'https://adler78hh.github.io/spiegeln/';
