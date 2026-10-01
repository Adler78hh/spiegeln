# Spiegeln

Lern-App zur Achsensymmetrie für Klasse 1/2 (PWA, offline, Tablet).

```bash
npm install
npm run dev       # Entwicklungsserver (im LAN erreichbar, z. B. fürs Tablet)
npm test          # Unit-Tests (Geometrie, Gesten)
npm run build     # Produktions-Build nach dist/
```

## Aufbau

- `src/geometry/` – reine Geometrie- und Spiegel-Logik ohne DOM, vollständig getestet
- `src/render/` – Canvas-Renderer der Arbeitsfläche
- `src/input/` – Gesten-Hilfen (Tippen erkennen)
- `src/motifs/` – vorinstallierte, selbst gezeichnete Motive
- `src/ui/` – React-Oberfläche
