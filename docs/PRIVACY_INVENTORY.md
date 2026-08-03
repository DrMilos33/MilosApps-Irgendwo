# Datenschutz- und Endgeräteinventar

Stand: 2026-08-03. Gültig für `somewhere-now`.

## Zugriff nach Zweck

| Technik | Schlüssel/Inhalt | Zweck | Laufzeit | Erforderlich |
|---|---|---|---|---|
| `localStorage` | `milosapps.somewhere-now.language` | gewählte DE-/EN-Sprache beibehalten | bis Browserdaten gelöscht werden | ja |
| Cache Storage | `somewhere-now-shell-v16` mit eigenen HTML-, JS-, CSS-, Icon-, Foto- und Vendorartefakten | App nach dem ersten Laden offline öffnen | versionsgebunden | ja |
| Arbeitsspeicher | letzte Orte und aktuelle Suchrichtung | Direktwiederholungen vermeiden und Reise erklären | bis Tabende | ja |
| Arbeitsspeicher/Web Audio | Ein/Aus des optionalen Klangs | Klang nur nach Nutzeraktion | bis Tabende | nein |

Es werden keine Cookies, kein `sessionStorage`, keine IndexedDB, keine
Analysekennung und kein optionales Tracking verwendet. Daher gibt es keinen
Schein-Einwilligungsbanner; die dauerhafte Datenschutzverknüpfung bleibt
sichtbar.

## Netzwerk und Datenweitergabe

- Open-Meteo erhält ausschließlich die Koordinaten des von der App gewählten
  Orts. Ein Nutzerstandort wird nicht angefragt.
- Die drei Atmosphärenfotos werden lokal von derselben App-Domain ausgeliefert.
  Wikimedia Commons, Fotografen oder Lizenzseiten erhalten beim Anzeigen keine
  Anfrage. Erst ein bewusster Klick auf Quelle oder Lizenz öffnet deren Seite.
- Wetterantworten werden weder im Service Worker noch in persistenten
  Browser-Speichern abgelegt.
- Geteilte Texte enthalten Ortsname, Moment und Ortszeit, aber keine
  Koordinaten, GeoName-ID oder Orts-Query.
- Es gibt kein Konto, keine App-Datenbank und keine app-eigene Werbe- oder
  Analyseschnittstelle.

## Prüfnachweis

Unit- und Browsertests prüfen DE/EN-Persistenz, den dauerhaften
Datenschutzpfad, lokale Bild-URLs, ausbleibende Drittmedien-Anfragen und den
Offline-Cache. `rg`-Audits auf `localStorage`, `sessionStorage`, Cookies,
IndexedDB und Cache-Nutzung gehören zum Abschlussreview.
