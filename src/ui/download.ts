/** Bietet Daten als JSON-Datei zum Speichern an (Download bzw. „Teilen“ auf dem iPad). */
export function downloadJson(data: unknown, fileName: string): void {
  downloadBlob(new Blob([JSON.stringify(data)], { type: 'application/json' }), fileName);
}

/** Bietet eine Datei zum Speichern an. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Dateiname ohne Sonderzeichen. */
export function safeFileName(name: string): string {
  return (
    name
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'herausforderung'
  );
}
