# QA-Bericht

Letzte Aktualisierung: 2026-07-30.

## Automatisierte Matrix

| Ebene | Abdeckung |
|---|---|
| Logik | 20 Tests: Orte, IANA-Zeit, Sommerzeit, Datumsgrenzen, Polartag/-nacht, Wettervalidierung, Gefahrfilter, deterministische Momentauswahl und koordinatenfreie Teilkarte |
| Smartphone | Pixel-7-Emulation mit Touch und mobilem Viewport |
| Tablet | iPad-Abmessungen und Touch in Chromium |
| Desktop | 1440 × 1000, Maus und Tastatur |
| Barrierefreiheit | axe-core in der Hauptansicht, Tastaturdialog, Fokus, Namen/Rollen, Kontrast, Reflow und reduzierte Bewegung |
| Resilienz | schnelle Wiederholungen, Abbruch veralteter Requests, Netzfehler, Timeout, alte Daten, Offline-Neuladen und Service-Worker-Cache |
| Grenzen | IANA-Datumswechsel, Sommerzeit, Polartag, Polarnacht, schwere Wettercodes, blockiertes Audio |

Spezialfälle werden paarweise ausgeführt: Timeout, Zeitzonengrenzen und
Service-Worker-Offlineneuladen, App-Resume, Wiederanlauf nach einem Fehler und
Ressourcenbudget laufen einmal im Desktopprojekt; die
geräteabhängigen Hauptflüsse, Accessibility, wiederholten Eingaben,
Fehlerzustände und Reflowprüfungen laufen in allen drei Projekten.

## Runde 1 – erster lauffähiger Stand

### Verified

- Sofortstart ohne Anmeldung oder Standortfreigabe.
- Ortszeit und Sonnenstand bleiben ohne Wetter verfügbar.
- Wetterquelle, Modellzeit und Alt-Daten-Zustand werden sichtbar benannt.
- Gefahrfilter ersetzt Wetterinszenierung durch Zeit und Tageslicht.
- Klang bleibt ohne Nutzeraktion aus und scheitert bei Browserblockade
  verständlich.
- 20/20 Logiktests, erfolgreicher TypeScript-/Vite-Build und 30/30 ausgeführte
  Browserfälle nach Korrektur.

### Confirmed defects

1. Primäraktion und Zustandsbadge unterschritten zunächst WCAG-AA-Kontrast.
   Korrektur: dunklerer Akzent und opake, kontrastierte Badgefarben.
2. Das erste Offline-Caching legte die gehashten Build-Assets nicht zuverlässig
   vor. Korrektur: Assets werden aus dem erzeugten `index.html` ermittelt und
   cache-first ausgeliefert.
3. Eine generische Readiness auf einem bereits belegten Standardport konnte
   eine fremde App akzeptieren. Korrektur: reservierter Port `4316`,
   `strictPort`, keine ungeprüfte Wiederverwendung und inhaltliche Prüfung des
   App-Keys.
4. Das Tablet-Geräteprofil wählte implizit WebKit, obwohl die Matrix Chromium
   vorsieht. Korrektur: Browser explizit auf Chromium festgelegt.
5. Die erste Zoomsimulation vergrößerte das Layout künstlich statt den
   effektiven CSS-Viewport zu verkleinern. Korrektur: reproduzierbare
   Reflow-Viewports von 320, 512 und 720 CSS-Pixeln.

### Proposed UI/UX changes

Die Umsetzung war ausdrücklich freigegeben; die bestätigten Änderungen wurden
in derselben Runde umgesetzt:

- kontraststärkere Primäraktion;
- opake Faktenkarte für verlässliche Lesbarkeit auf jeder Szene;
- klar benannter Retry bei fehlenden oder älteren Wetterdaten;
- direkte Ortslinks über `?place=<id>` für reproduzierbare, nicht sensible
  Ansichten.

### Technical improvements

- AbortController plus Requestnummer verhindert, dass verspätete Antworten
  einen neueren Ort überschreiben.
- Readiness prüft Dienstidentität statt Erreichbarkeit.
- Der Service Worker cached nur eigene statische Assets; Wetterantworten werden
  nicht persistent gespeichert.
- Regressionstor: `pnpm test`, `pnpm build`, `pnpm test:e2e`.

## Runde 2 – visuelle und resiliente Vertiefung

### Verified

- Helles und dunkles Systemdesign bestehen die automatisierte
  Accessibility-Prüfung auf Smartphone, Tablet und Desktop.
- Die Primäraktion bleibt auf allen drei Start-Viewports ohne Scrollen
  erreichbar; auf dem Smartphone folgt sie direkt auf den erklärenden Text.
- Dialogfokus kehrt nach dem Schließen zur auslösenden Ortsaktion zurück.
- Nach Netzfehler führt „Wetter erneut versuchen“ ohne Szenenwechsel in den
  aktuellen Zustand zurück.
- Nach Hintergrund/Resume bleibt ein aktivierter Klangzustand erhalten, ohne
  Audio ungefragt zu starten.
- Die Startansicht bleibt unter zehn geladenen Ressourcen und meldet eine neue
  Interaktion innerhalb von 100 ms im DOM.
- Der In-App-Browser zeigte in der finalen Smartphone- und Desktop-Sicht keine
  Konsolenfehler.
- Abschlusslauf: 20/20 Logiktests, erfolgreicher Produktionsbuild und 36/36
  ausgeführte Browserfälle. Zwölf projektübergreifend redundante Spezialfälle
  wurden entsprechend der dokumentierten Paarstrategie übersprungen.

### Confirmed defects

1. Eine feste Textfarbe auf dem Wurzelelement machte Titel und Fakten im
   dunklen Systemdesign nahezu unsichtbar. Korrektur: sämtliche geerbten
   Textfarben folgen nun den Theme-Tokens; dunkle Ansichten besitzen eigene
   axe-Regressionstests.
2. Die Akzentfarbe der Faktenüberschriften hatte im dunklen Design zu wenig
   Kontrast. Korrektur: ein separates, kontrastgeprüftes
   `--accent-text`-Token für beide Farbschemata.
3. Auf kleinen Smartphones lag die häufigste Aktion erst hinter Szene und
   Faktenkarte. Korrektur: Die mobile Reihenfolge setzt Einordnung, Aktion und
   Status vor die visuelle Szene.

### Proposed UI/UX changes

Die Umsetzung war freigegeben; alle bestätigten Änderungen wurden in der
zweiten Runde umgesetzt:

- mobile Informationshierarchie auf die eigentliche Interaktion ausgerichtet;
- dunkle Darstellung als vollwertiger, separat geprüfter Zustand;
- sichtbarer Retry bleibt in derselben Szene und unterbricht den ruhigen
  Nutzungskontext nicht.

### Technical improvements

- Theme-spezifische Accessibility-Tests verhindern, dass reine
  Hellmodus-Prüfungen geerbte Farbkollisionen übersehen.
- Fokus-, Resume- und Recovery-Tests sichern Zustandsübergänge zusätzlich zum
  sichtbaren Ergebnis ab.
- Ein kleines Ressourcen- und Reaktionsbudget dient als frühe Regression,
  ohne schwankende Netzwerkzeiten als harte Leistungsmetrik zu verwenden.

## Noch nicht testbar

- Reale Audioausgabequalität auf physischem iOS-/Android-Gerät; automatisiert
  sind Aktivierung, Blockade und Zustand prüfbar, nicht der gehörte Klang.
- Echte OS-Browserzoom-Tasten in der Headless-Laufzeit; Reflow wird über die
  entsprechenden effektiven CSS-Viewports geprüft.
- Externe HTTPS-DEV-URL und Portalredirect, weil noch kein eigenständiger
  Hostingdienst verbunden ist.
- Screenreader-Sprachausgabe; DOM-Semantik und Accessibility-Tree sind
  automatisiert prüfbar, die tatsächliche Ausgabe benötigt ein physisches
  Assistenztechnik-Setup.
