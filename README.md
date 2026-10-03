# Spiegeln

Lern-App zur Achsensymmetrie für Klasse 1/2 (Web-App für Tablets).

Im selben Projekt entsteht die App **Zerlegen** für den Mathematikunterricht
in der Grundschule: gleiche Profilwahl, gleiche Gruppen und gleicher
Erwachsenenbereich, hinter jedem Profil die Bereiche *Blitzsehen*, *Zerlegen*
und *Muster* (werden nach und nach gefüllt). Zerlegen hat eigene Daten auf dem
Gerät und eigene App-Symbole (`public-zerlegen/`).

```bash
npm install
npm run dev       # Entwicklungsserver (im LAN erreichbar, z. B. fürs Tablet)
npm run dev:zerlegen  # dasselbe für die App Zerlegen
npm test          # Unit-Tests
npm run build     # Produktions-Build nach dist/
```

## Aufbau

- `src/geometry/` – reine Geometrie- und Spiegel-Logik ohne DOM (getestet):
  Randschnittpunkte, Einrasten der Anfasspunkte, Spiegelung, Figurlage
- `src/challenges/` – Herausforderungen: Erzeugen der Zielfiguren, Entwurf im Editor
- `src/drawing/` – Datenmodell des Zeichenwerkzeugs
- `src/storage/` – Speicherung im Gerät (IndexedDB): Gruppen, Profile, Antworten,
  gemerkte Figuren, eigene Motive, Herausforderungen
- `src/render/` – Canvas-Zeichnen der Arbeitsfläche und Zielbilder
- `src/motifs/`, `src/profiles/` – selbst gezeichnete Motive, 30 Tierbilder, Gruppenfarben
- `src/ui/` – Oberfläche; `src/ui/adult/` – Erwachsenenbereich
- `src/zerlegen/` – App Zerlegen (Startbildschirm, Bereiche, Erwachsenenbereich)

## Erwachsenenbereich

Auf der Profilwahl das Zahnrad oben rechts 3 Sekunden gedrückt halten und die
Einmaleins-Aufgabe lösen. Dort: Gruppen (Kinder und Ergebnisse je Gruppe),
Herausforderungen erstellen, eigene Motive verwalten.

## Gruppen

Jede Gruppe hat eine eigene Farbe (32 Farben, danach mit Nummer, z. B.
„Gelb2“) und eigene Kinder; jedes Tier gibt es pro Gruppe höchstens einmal.
Ohne Tier zeigt das Profilbild die ersten beiden Buchstaben des Namens.
Gewechselt wird auf der Profilwahl: das Oval mit dem Gruppennamen 3 Sekunden
gedrückt halten. Die zuletzt gewählte Gruppe merkt sich das Gerät.
Herausforderungen und eigene Motive gelten für alle Gruppen.

## Installieren und offline nutzen

Die App ist eine PWA: Nach dem ersten Öffnen über HTTPS speichert sie alle
Dateien im Gerät und funktioniert danach ohne Internet. Auf dem Tablet im
Browser „Zum Home-Bildschirm hinzufügen“ wählen. Dafür muss die App über
HTTPS ausgeliefert werden; über eine einfache LAN-Adresse (http) installieren
Browser keine Service Worker.

Veröffentlicht wird automatisch über GitHub Pages (Workflow
`.github/workflows/deploy.yml`, bei jedem Push auf `main`):
https://adler78hh.github.io/spiegeln/ – Zerlegen unter
https://adler78hh.github.io/spiegeln/zerlegen/

Einmalig nötig: im Repository unter *Settings → Pages* bei *Source*
„GitHub Actions“ wählen.
