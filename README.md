# Spiegeln

Lern-App zur Achsensymmetrie für Klasse 1/2 (Web-App für Tablets).

```bash
npm install
npm run dev       # Entwicklungsserver (im LAN erreichbar, z. B. fürs Tablet)
npm test          # Unit-Tests
npm run build     # Produktions-Build nach dist/
```

## Aufbau

- `src/geometry/` – reine Geometrie- und Spiegel-Logik ohne DOM (getestet):
  Randschnittpunkte, Einrasten der Anfasspunkte, Spiegelung, Figurlage
- `src/challenges/` – Herausforderungen: Erzeugen der Zielfiguren, Entwurf im Editor
- `src/drawing/` – Datenmodell des Zeichenwerkzeugs
- `src/storage/` – Speicherung im Gerät (IndexedDB): Profile, Antworten,
  gemerkte Figuren, eigene Motive, Herausforderungen
- `src/render/` – Canvas-Zeichnen der Arbeitsfläche und Zielbilder
- `src/motifs/`, `src/profiles/` – selbst gezeichnete Motive und Tierbilder
- `src/ui/` – Oberfläche; `src/ui/adult/` – Erwachsenenbereich

## Erwachsenenbereich

Auf der Profilwahl das Zahnrad oben rechts 3 Sekunden gedrückt halten und die
Einmaleins-Aufgabe lösen. Dort: Ergebnisse, Herausforderungen erstellen,
Profile und eigene Motive verwalten.
