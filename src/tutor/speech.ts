/**
 * Vorlesen mit der Stimme des Geräts (auf dem iPad z. B. „Anna“, am besten
 * in der Version „Erweitert“/„Premium“, unter Bedienungshilfen → Gesprochene
 * Inhalte → Stimmen laden). Ohne Sprachausgabe bleibt nur der Text.
 */
let chosen: SpeechSynthesisVoice | null | undefined;

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  const german = voices.filter((v) => v.lang.toLowerCase().startsWith('de'));
  if (!german.length) return null;
  const score = (v: SpeechSynthesisVoice) =>
    (/premium/i.test(v.name) ? 8 : 0) + (/enhanced|erweitert|verbessert/i.test(v.name) ? 4 : 0) + (/anna/i.test(v.name) ? 2 : 0) + (v.lang === 'de-DE' ? 1 : 0);
  return german.sort((a, b) => score(b) - score(a))[0];
}

export function speak(text: string): void {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  if (!synth) return;
  if (chosen === undefined || chosen === null) chosen = pickVoice();
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'de-DE';
  if (chosen) u.voice = chosen;
  u.rate = 0.9;
  synth.speak(u);
}

export function stopSpeaking(): void {
  window.speechSynthesis?.cancel();
}

// Manche Browser liefern die Stimmen erst später.
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    chosen = pickVoice();
  });
}
