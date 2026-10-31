/** Zeigehand des Tutors. */

/** Hand mit ausgestrecktem Zeigefinger; die Fingerspitze liegt bei (20, 3). */
export function Hand() {
  return (
    <svg className="guide-hand" viewBox="0 0 44 52" width="44" height="52">
      <path
        d="M16 26V7a4 4 0 0 1 8 0v15l2-1a4 4 0 0 1 5 2l1 1a4 4 0 0 1 5 3v2a4 4 0 0 1 3 4v6c0 7-6 12-13 12h-3c-6 0-10-3-12-8l-5-10a3.5 3.5 0 0 1 6-4z"
        fill="#ffe0bd"
        stroke="#4a3b2f"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M24 22v6M31 24v5M37 29v3" stroke="#4a3b2f" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}


/** Blinkende Hand auf einem Knopf (der Knopf braucht die Klasse „tutor-target“). */
export function ButtonGuide() {
  return (
    <span className="btn-guide" aria-hidden="true">
      <span className="guide-finger">
        <Hand />
      </span>
    </span>
  );
}
