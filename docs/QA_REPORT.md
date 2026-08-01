# QA-Bericht

Letzte Aktualisierung: 2026-08-01.

## Automatisierte Matrix

| Ebene | Abdeckung |
|---|---|
| Shell-Vertrag | portabler v2.0.3-Validator, fünf gelockte Vendorartefakte und SHA-256-Prüfung |
| Logik | 26 Tests: zusätzlich vollständige DE/EN-Texte, englische Orts-/Datumsdarstellung, Gefahrfilter und Teilkarte |
| Smartphone | Pixel-7-Touchprofil mit exakt 390 × 844 CSS-Pixeln |
| Tablet | iPad-Abmessungen und Touch in Chromium |
| Desktop | 1440 × 900, Maus und Tastatur |
| Barrierefreiheit | axe-core 4.12.1, funktionaler Shadow-Skiplink, sichtbarer Fokus, 44-px-Ziele, Kontrast, 360 × 800 bei 200 % Textzoom und Reduced Motion |
| CSP | echte Response mit `default-src 'self'; script-src 'self'; style-src 'self'`, externe Shell-/Theme-CSS, korrekte MIME-Typen und null CSP-Logs |
| Resilienz | schnelle Wiederholungen, Abbruch veralteter Requests, Netzfehler, Timeout, alte Daten, Offline-Neuladen und Service-Worker-Cache |
| Grenzen | IANA-Datumswechsel, Sommerzeit, Polartag, Polarnacht, schwere Wettercodes, blockiertes Audio |

Spezialfälle werden paarweise ausgeführt: Timeout, Zeitzonengrenzen und
Service-Worker-Offlineneuladen, App-Resume, Wiederanlauf nach einem Fehler und
Ressourcenbudget laufen einmal im Desktopprojekt; die
geräteabhängigen Hauptflüsse, Accessibility, wiederholten Eingaben,
Fehlerzustände und Reflowprüfungen laufen in allen drei Projekten.

Der aktuelle Abschlusslauf führte 60 Projektfälle aus: 46 bestanden, 14
bewusst projektübergreifend redundante Spezialfälle wurden übersprungen. Der
gesonderte Shell-Validator, 26/26 Logiktests und der TypeScript-/Vite-Build
waren ebenfalls grün.

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

## Shell-Migration – Verbesserungsrunde 1

### Verified

- Vollständige DE/EN-Fachoberfläche einschließlich dynamischer Status-,
  Wetter-, Tageslicht-, Dialog-, Audio- und Teiltexte.
- Sprachwahl im Shell-Header aktualisiert App und Shell gemeinsam und bleibt
  nach Reload im app-spezifischen Local-Storage-Schlüssel erhalten.
- Direkter No-Login-Aufruf, DEV-Badge, absolute DEV-Links, genau ein H1 sowie
  kompakter Footer sind auf Smartphone, Tablet und Desktop vorhanden.
- Der vendorte v2.0.2-Zwischenstand bestand Validator, Logiktests und Build;
  er wurde wegen zentralem CSP-Publish-Stopp nie committed oder veröffentlicht.

### Confirmed defects

1. Bei 360 × 800 und 200 % Textzoom liefen die zweispaltigen Faktenzeilen und
   die Szenenbeschriftung horizontal über. Korrektur: schmale Faktenkarte
   einspaltig, Beschriftung stapelbar und lange Fachtexte umbrechbar.
2. Axe 4.12.1 meldet am Shadow-Knoten
   `milos-app-shell >>> a.skip[href="#main"]` die moderaten Best-Practice-Regeln
   `region` und `skip-link`. Das ist die zentral bestätigte statische
   Shadow→Light-DOM-Analysergrenze, keine WCAG-A/AA-Regelverletzung. Der Test
   erwartet ausschließlich diese beiden exakt begrenzten Meldungen und prüft
   den realen Tastaturpfad separat.
3. v2.0.2 verwendete CSP-blockierte Inline-Shellstyles. Der Zwischenstand
   blieb unveröffentlicht; es wurde kein `unsafe-inline`, Nonce, Hash oder
   App-Workaround ergänzt.

### Proposed UI/UX changes

- App-Titel bleibt als ruhige Identität über dem eigentlichen Moment und wird
  auf kleinen Viewports vor Ort, Moment, Primäraktion und Status eingeordnet.
- DE/UK-Flaggen behalten immer sichtbare `DE`-/`EN`-Labels; die Fachoberfläche
  wechselt vollständig statt nur den Rahmen zu übersetzen.

### Technical improvements

- Das Locale-Modul hört `milosapps:localechange` und initialisiert zusätzlich
  aus `document.documentElement.lang`, wodurch ein Start-Race vermieden wird.
- Szenenvarianten und Partikel verwenden CSP-sichere Datenattribute und
  statische CSS-Zustände statt `style.setProperty`.
- Readiness prüft zusätzlich Shell-Version und `productionApproved=false`.

## Shell-Migration – Verbesserungsrunde 2

### Verified

- `public-app-shell/v2.0.3` ist exakt auf Shared-Commit
  `ed898412306e22c6ae1b10ee8953df29f8acd627` gepinnt; der portable Validator
  bestätigt alle fünf Lockartefakte.
- Strikte Same-Origin-CSP: Host `display:grid`, Brand `display:flex`, Icon
  38 px, alle Controls mindestens 44 px, beide externe CSS-Dateien geladen,
  korrekte JS-/CSS-MIME-Typen und null CSP-Meldungen.
- 390 × 844, Tablet und 1440 × 900 ohne horizontalen Überlauf; zusätzlich
  360 × 800 bei 200 % Textzoom ohne Überlauf oder Leerraum unter dem Footer.
- Skiplink setzt beim Tastaturpfad `tabindex=-1`, fokussiert das echte
  `main[slot=main]` und bleibt nach DE/EN sowie Reload funktionsfähig.
- Abschlussmatrix: 46 bestanden, 14 planmäßig übersprungen; zusätzlich
  Validator, 26/26 Logiktests und Build grün.

### Confirmed defects

1. Vite 8 wandelte die neue Theme-CSS zunächst beim Bundle in eine `data:`-URL
   um, die `style-src 'self'` korrekt blockierte. Korrektur: das gelockte
   Bootstrap-Script wird per `vite-ignore` nicht transformiert; ein enger
   Build-Hook kopiert den Vendorordner bytegleich nach `dist/vendor/…`.
2. App-eigene dynamische Szenenwerte verwendeten noch Inline-Style-Mutationen.
   Korrektur: endliche, prozedurale Datenzustände und CSS-Selektoren; der
   strikte CSP-Test findet im gerenderten Dokument kein `[style]`.

### Proposed UI/UX changes

- Keine weiteren visuellen Änderungen nach der zweiten Runde erforderlich;
  die ruhige App-Identität und die bestehende Interaktionshierarchie bleiben
  erhalten.

### Technical improvements

- Der Build liefert den Shell-Hash bytegleich zum gelockten Quellartefakt aus.
- Die CSP-E2E prüft echte Response-Header statt nur Quelltextmuster.
- Externe DEV-Felder bleiben gemeinsam `null`; dadurch ist der Blocker
  maschinenlesbar, ohne lokale URLs als Portalziele auszugeben.

## Noch nicht testbar

- Reale Audioausgabequalität auf physischem iOS-/Android-Gerät; automatisiert
  sind Aktivierung, Blockade und Zustand prüfbar, nicht der gehörte Klang.
- Echte OS-Browserzoom-Tasten in der Headless-Laufzeit; Reflow wird zusätzlich
  mit 200 % Root-Textzoom bei 360 × 800 geprüft.
- Externe HTTPS-DEV-URL und Portalredirect, weil noch kein eigenständiger
  Hostingdienst verbunden ist.
- Screenreader-Sprachausgabe; DOM-Semantik und Accessibility-Tree sind
  automatisiert prüfbar, die tatsächliche Ausgabe benötigt ein physisches
  Assistenztechnik-Setup.
