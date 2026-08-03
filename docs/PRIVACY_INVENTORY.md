# Datenschutz- und Endgeräteinventar

Stand: 2026-08-03. Gültig für den lokalen DEV-Stand von `somewhere-now`.

## Zugriff nach Zweck

| Technik | Schlüssel/Inhalt | Zweck | Laufzeit | Erforderlich |
|---|---|---|---|---|
| `localStorage` | `milosapps.somewhere-now.language` | ausdrücklich gewählte DE-/EN-Sprache über Seitenaufrufe beibehalten | bis der Nutzer Browserdaten löscht | ja, für die gewählte Sprache |
| Cache Storage | `somewhere-now-shell-v*` mit eigenen HTML-, JS-, CSS-, Icon- und vendorten Vertragsartefakten | App-Hülle nach dem ersten Laden auch bei Netzausfall öffnen | versionsgebunden; alter Cache wird beim nächsten Service-Worker-Aktivieren entfernt | ja, für den zugesagten Offline-Kern |
| Arbeitsspeicher | letzte Orts- und Szenenprofile der aktuellen Reise | Direktwiederholungen vermeiden und die letzten drei Entdeckungen zeigen | nur bis Tab/Seite geschlossen wird | ja, für Sitzungsneuheit; nicht persistent |
| Arbeitsspeicher/Web Audio | Ein/Aus-Zustand des optionalen Klangs | Klang nur nach ausdrücklicher Nutzeraktion steuern | nur bis Tab/Seite geschlossen wird | nein; keine Speicherung |

Es werden keine Cookies, kein `sessionStorage`, keine IndexedDB, keine
Analysekennung und kein optionales Tracking verwendet. Der frühere
`milosapps.somewhere-now.privacyNotice.v1`-Schlüssel wird bei der Migration nur
entfernt und danach weder gelesen noch geschrieben. Weil kein
einwilligungspflichtiger Zugriff stattfindet, zeigt die App keinen
Schein-Einwilligungsbanner. Eine dauerhafte Datenschutzverknüpfung bleibt
sichtbar.

## Netzwerk und Datenweitergabe

- Open-Meteo erhält ausschließlich die Koordinaten des von der App kuratiert
  ausgewählten Orts. Die App fragt keinen Nutzerstandort ab.
- Wetterantworten werden nicht im Service Worker oder in Browser-Speichern
  persistiert.
- Geteilte Texte enthalten Ortsname, verständlichen Moment und Ortszeit, aber
  keine Koordinaten, GeoName-ID oder Orts-Query in der URL.
- Es gibt kein Konto, keine App-Datenbank, keine Werbe- oder
  Analyseschnittstelle.

## Prüfnachweis

Unit- und Browsertests inventarisieren die sichtbaren Datenschutzpfade,
verwerfen den alten Hinweis-Schlüssel, prüfen die DE-/EN-Sprachpersistenz und
belegen den Offline-Cache. `rg`-Audits auf `localStorage`, `sessionStorage`,
`document.cookie`, `indexedDB` und Cache-Nutzung gehören zum
Abschlussreview.
