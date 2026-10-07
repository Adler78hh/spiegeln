import type { ReactNode } from 'react';
import { GRATIS, FULL_VERSION_URL } from '../../edition';
import { CameraIcon, CheckIcon, CrossIcon, FlipIcon, GearIcon, HideLineIcon, OutlineIcon, ResetIcon, SaveIcon, SnapIcon, ThumbsUpIcon } from '../icons';
import { AdultPage } from './AdultPage';

function Item({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <li className="help-item">
      <span className="help-icon">{icon}</span>
      <span>{children}</span>
    </li>
  );
}

/** Kurze Hilfe für Lehrkräfte direkt in der App. */
export function HelpPage({ onBack }: { onBack: () => void }) {
  return (
    <AdultPage title="Hilfe" onBack={onBack}>
      <section className="help-block">
        <h2>Für die Kinder</h2>
        <ul className="help-list">
          <Item>Jedes Kind tippt auf sein Tier. {GRATIS ? 'Dann geht es direkt zu den Herausforderungen.' : 'Dann wählt es „Frei spiegeln“ oder „Herausforderungen“.'}</Item>
          <Item>Den Spiegel an den roten Punkten verschieben und drehen. Die silbergraue Seite bleibt, die weiße Seite zeigt das Spiegelbild.</Item>
          <Item icon={<FlipIcon />}>Spiegel umdrehen: Die andere Seite der Figur wird gespiegelt.</Item>
          <Item icon={<SnapIcon />}>Einrasten in 15°-Schritten.</Item>
          <Item icon={<HideLineIcon />}>Spiegelachse ausblenden.</Item>
          <Item icon={<OutlineIcon />}>Umriss der Figur zeigen.</Item>
          <Item icon={<ResetIcon />}>Alles zurück an den Anfang.</Item>
        </ul>
      </section>

      <section className="help-block">
        <h2>Herausforderungen</h2>
        <ul className="help-list">
          <Item>Eine Zielfigur antippen und versuchen, sie mit dem Spiegel nachzubauen.</Item>
          <Item icon={<CameraIcon />}>
            Fotoapparat: sichert Figur und Spiegel dieser Zielfigur (grün). Beim Zurückkehren steht alles wieder so da. Erneut antippen hebt die Sicherung auf.
          </Item>
          <Item icon={<CheckIcon />}>Passt: Die Zielfigur lässt sich spiegeln. Am besten erst sichern, dann „Passt“.</Item>
          <Item icon={<CrossIcon />}>Geht nicht: Die Zielfigur lässt sich nicht spiegeln. Ein Hinweis zeigt, wie viele nicht gehen.</Item>
          <Item icon={<ThumbsUpIcon />}>Sind alle bearbeitet, zeigt der Daumen, wie viele Entscheidungen richtig sind – nicht welche.</Item>
        </ul>
      </section>

      <section className="help-block">
        <h2>Erwachsenenbereich</h2>
        <ul className="help-list">
          <Item icon={<GearIcon />}>Zugang: das Zahnrad 3 Sekunden gedrückt halten und eine Einmaleins-Aufgabe lösen.</Item>
          {!GRATIS && (
            <>
              <Item>Gruppen: neue Gruppe mit Farbe und Kinderzahl anlegen. Den Farbkreis antippen, um die Farbe zu ändern.</Item>
              <Item>Gruppe wechseln (Profilauswahl): den farbigen Gruppenknopf 3 Sekunden gedrückt halten.</Item>
            </>
          )}
          <Item>Kinder: Namen eintragen. „Zurücksetzen“ löscht Antworten und Sicherungen eines Kindes.</Item>
          <Item>Freischalten: festlegen, welche Herausforderungen die Kinder einer Gruppe sehen. Ergebnisse und Druck zeigen nur diese; Antworten bleiben beim Ausblenden erhalten.</Item>
          <Item>Ergebnisse: Tabelle Kind × Herausforderung. Ein Kind antippen zeigt seine Detailansicht mit Zielfigur, Sicherung und Antwort.</Item>
          <Item>Drucken: in der Detailansicht ein Kind, über der Tabelle alle Kinder. Herausforderungen auswählen, im Druckfenster geht auch „Als PDF sichern“.</Item>
          {!GRATIS && <Item>Eigene Motive (Foto oder Zeichnung) und eigene Herausforderungen lassen sich im Erwachsenenbereich anlegen.</Item>}
        </ul>
      </section>

      <section className="help-block">
        <h2>Daten</h2>
        <ul className="help-list">
          <Item>Alle Daten bleiben auf diesem Gerät. Es gibt keine Anmeldung und keine Übertragung ins Internet.</Item>
          <Item>Die App auf den Home-Bildschirm legen (iPad: Teilen → „Zum Home-Bildschirm“). Dann läuft sie ohne Internet, und das Gerät löscht die Daten nicht von selbst.</Item>
          <Item icon={<SaveIcon />}>
            Datensicherung: regelmäßig eine Sicherungsdatei speichern, z. B. vor den Ferien. Damit lassen sich die Daten auch auf ein anderes Gerät
            übertragen{GRATIS ? ' oder in die Vollversion übernehmen' : ''}.
          </Item>
        </ul>
      </section>

      {GRATIS && (
        <p className="hint">
          Die Vollversion bietet mehrere Gruppen, freies Spiegeln, eigene Motive und eigene Herausforderungen:{' '}
          <a href={FULL_VERSION_URL}>{FULL_VERSION_URL}</a>
        </p>
      )}
    </AdultPage>
  );
}
