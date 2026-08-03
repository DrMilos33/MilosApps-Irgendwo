# QA-Bericht

Letzte Aktualisierung: 2026-08-03.

## Automatisierte Matrix

| Ebene | Abdeckung |
|---|---|
| Shared-Verträge | portable Validatoren für Shell v2.0.3 mit fünf sowie Essentials v1.1.2 mit sechs gelockten Verbraucherartefakten, Manifesthash und SHA-256-Prüfung |
| Logik | 32 Tests: vollständige DE/EN-Texte, Auswahlranking, zwölf Szenenprofile, Orts-/Datumsdarstellung, Gefahrfilter sowie Teilpayload ohne Query oder Koordinaten |
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

Der aktuelle Abschlusslauf führte 81 Projektfälle aus: 59 bestanden, 22
bewusst projektübergreifend redundante Spezialfälle wurden übersprungen. Der
Shell- und Essentials-Validator, 32/32 Logiktests und der
TypeScript-/Vite-Build samt Build-Artefaktprüfung waren ebenfalls grün.

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

## Essentials-v1.0-Baseline – zwei Verbesserungsrunden

### Verified

- `public-app-essentials/v1.0.0` ist exakt auf Shared-Commit
  `b09e09008ff05fe87f05bc647a7c4964ff13e6f6` gepinnt; der portable Validator
  bestätigt alle fünf Lockartefakte.
- Der CSS-first Ladebildschirm erscheint bei frischem und gedrosseltem Start,
  verwendet einen Absatz statt einer Überschrift und verschwindet erst nach
  `milosapps:ready`. Die Dokumentstruktur enthält genau eine H1.
- Der Datenschutzhinweis sagt wahrheitsgemäß „keine Werbe- oder
  Tracking-Cookies“, benennt lokale Sprache/Einstellungen, besitzt ein
  44-px-Ziel und bleibt nach Bestätigung und Reload geschlossen.
- Teilen funktioniert über native Web Share API, Clipboard-Fallback und den
  erwartbaren `AbortError`-Pfad. Der Payload enthält weder Queryparameter noch
  genaue Ortskoordinaten.
- DE/EN samt Reload-Persistenz, Reduced Motion, Tastatur, Fokus, 1440 × 900,
  390 × 844 und 360 × 800 bei 200 % Textzoom sind grün. Smartphone und
  Desktop wurden zusätzlich sichtbar im In-App-Browser geprüft.
- Abschlussmatrix: 55 bestanden, 20 planmäßig übersprungen; zusätzlich beide
  Validatoren, 27/27 Logiktests, Build und Build-Artefaktprüfung grün.

### Confirmed defects

1. Vite zog die neuen Essentials-CSS-Dateien zunächst in den App-Bundle ein
   und entfernte die externen Links. Korrektur: `vite-ignore` erhält beide
   Same-Origin-Links; die Build-Prüfung scheitert, wenn sie fehlen, als
   `data:`-URL erscheinen oder ein Vendorbyte vom Lock abweicht.
2. Beim ersten Offline-Neuladen blieb der Loader stehen, weil die neu
   vendorten, transitiv importierten Module vor der Service-Worker-Kontrolle
   geladen worden waren und deshalb nicht sicher im Cache lagen. Korrektur:
   alle Shell- und Essentials-Browserartefakte sind explizite Precache-Einträge;
   der Offline-Regressionsfall ist danach grün.
3. Acht parallele Chromium-Worker führten unter Windows zu sporadischen
   Browser-Teardown-Timeouts. Isolierte Wiederholungen belegten keinen
   App-Fehler. Die reproduzierbare Abschlussmatrix verwendet vier Worker und
   lief vollständig grün.

### Proposed UI/UX changes

- Der gemeinsame, klein skalierte Loader, der kompakte Datenschutzhinweis und
  die einheitliche Teilen-Aktion ersetzen die bisherigen Einzellösungen, ohne
  die ruhige App-Identität oder die primäre „Noch einmal“-Aktion zu verdrängen.
- Datumsauswahl und Ortssuche bleiben vertragsgemäß deaktiviert, weil diese App
  keine Nutzereingabe für Datum oder Ort anbietet.

### Technical improvements

- Readiness und App-Metadaten nennen zusätzlich
  `public-app-essentials/v1.0.0`; eine fremde oder veraltete Instanz wird im
  E2E-Setup abgewiesen.
- Der Build kopiert Shell und Essentials eng begrenzt und bytegleich; Locks,
  Hashes, MIME-Typen und externe CSS-Verweise werden am erzeugten `dist`
  fail-closed geprüft.
- Der Service Worker cached ausschließlich eigene statische Vertrags- und
  App-Artefakte; Wetterantworten bleiben weiterhin ungecached.

## UX-Refinement 2026-08 – Analyse-Design-Realaufgabe-Test

### Runde 1 – Warum dieser Moment?

| Schritt | Evidenz |
|---|---|
| Analyse | Der Ausgangsstand wählte Orte gleichverteilt. Der Moment konnte nach einer gewöhnlichen Wetterantwort wechseln, und die Oberfläche erklärte weder Auswahlgrund noch Produktversprechen ausreichend. Wiederholte reale Klicks konnten einen der letzten Orte direkt erneut zeigen. |
| Design | Ortszeit und lokal berechnetes Tageslicht bilden den stabilen Kern. Lichtwechsel innerhalb einer Stunde, lokale Mitternacht, Polartag/-nacht, Golden Hour und Dämmerung erhalten ein nachvollziehbares Ranking. Die letzten sechs Orte und drei Landschaften fließen als Neuheitsfenster ein. |
| Realaufgabe | Einstieg ohne Standortfreigabe, danach siebenmal „Nächsten Moment entdecken“ bei normaler, langsamer und fehlender Wetterantwort. Der Nutzer muss sofort erkennen, was die App liefert und warum der gewählte Ort gerade interessant ist. |
| Test | Baseline `pnpm test:all`: Shell-/Essentials-Validator grün, 27/27 Logiktests, Build PASS, 55 Browserfälle bestanden und 20 profilspezifisch übersprungen. Nach der Änderung: 29/29 Logiktests, Build PASS, sechs fokussierte Desktoppfade sowie sichtbare 1440-×900- und 390-×844-Abnahme grün. |
| Ergebnis | Produktversprechen, konkrete Hauptaktion und „Ausgewählt, weil …“ sind sichtbar. Sieben Ergebnisse bleiben ohne Ortswiederholung; gewöhnliches Wetter ergänzt Fakten und Szene, verändert aber die Kernaussage nicht. Gefährliches Wetter darf weiterhin nur in den zurückhaltenden Zustand wechseln. |

### Runde 2 – Szenenvielfalt und Sitzungsneuheit

| Schritt | Evidenz |
|---|---|
| Analyse | Fünf reine Rotationsvarianten der gleichen Hügelformen erzeugten zu wenig Wiederholungsreiz. Der Share-Text war korrekt, aber ohne klaren Lesepfad. Eine Sitzung zeigte nicht, was bereits entdeckt worden war. |
| Design | Zwölf deterministische Szenenprofile kombinieren Bergkontur, Wolken-/Sternlage, landschaftsspezifische Geländedetails, Stadtlichter und arktisches Nachtlicht. Die Auswahl meidet zusätzlich die letzten fünf Szenenprofile. Ein sitzungsgebundener Fortschritt benennt Orte und Landschaften; Share folgt Ort → Moment → Ortszeit → App-Kontext. |
| Realaufgabe | Eine Reise aus sieben Klicks muss verschiedene Orte und mindestens sechs Szenenprofile liefern, den Fortschritt nach jedem Klick aktualisieren und einen verständlichen Text ohne Koordinaten oder Orts-Query teilen. |
| Test | 32/32 Logiktests und Build-Vendorprüfung PASS. Fokussiert: vier Share-/Reisepfade Desktop, erneuter Sieben-Orte-Pfad, Smartphone-Hauptpfad sowie Reduced Motion/360×800 bei 200 % grün. Im sichtbaren 390-×844-Test lieferten sechs aufeinanderfolgende Ergebnisse sechs verschiedene Profile und drei Landschaften. |
| Ergebnis | Die Szene besitzt mehr als doppelt so viele Grundprofile und sichtbare Landschaftsdetails. Native Share-Erfolg und -Abbruch bleiben still, der Clipboard-Fallback viewportfest. Die Smartphone-Abnahme fand zwei Regressionen: Sitzungsinfo stand wegen fehlender Grid-Reihenfolge vor der H1; bei 200 % machte die lange Hauptaktion 3 px Horizontalüberlauf. Beide Fehler wurden behoben und als Regression erneut grün geprüft. |

### Vergleich mit sechs Schwester-Apps

Read-only verglichen wurden die aktuellen DEV-Einstiege am 2026-08-03 im
In-App-Browser. Bewertet wurden Einstieg, Verständlichkeit und
Wiederholungswert; kein fremdes Repository wurde verändert.

| App | Einstieg und Verständlichkeit | Wiederholungswert | Übertragbarer Befund |
|---|---|---|---|
| Sky | „The sky. Now.“, sofortiges Planetarium und klare Ortsaktion | Drehen, Zoomen und Zeit verändern denselben Zustand direkt | Veränderung muss als Zustand sichtbar bleiben. |
| Gravity Loop | Startaktion und Spielregel stehen direkt am Spielfeld | Punkte, Sterne, Schild und Bestwert machen Fortschritt greifbar | Eine Zahl allein reicht nur, wenn ihr Gegenstand klar ist. |
| Welcher Müll? | Suche, kurze Erklärung und drei Beispiele ergeben einen eindeutigen ersten Schritt | Neue Gegenstände liefern wiederholt konkreten Nutzen | Beispiele und Ergebnisbezug reduzieren Erklärungsaufwand. |
| Noch hell? | Frage, Ortsweg und aktuelles Ja/Nein-Ergebnis sind sofort erkennbar | Ort und Tageszeit erzeugen wiederkehrenden Alltagsnutzen | Ein Ergebnis braucht eine eindeutige, stabile Kernaussage. |
| Wolkenpost | nummerierter Ablauf von Reisendem über Startpunkt bis Flug | neue Zeichnung, Ort und Windroute erzeugen Variation | Schritte machen eine längere Reise beherrschbar. |
| Nudelrechner | konkrete Leitfrage, vier nummerierte Eingabebereiche und erwartetes Ergebnis | Parameteränderungen machen das Modell wiederholt erforschbar | Fortschritt wird verständlich, wenn vergangene Zustände benannt sind. |

**Daraus folgende weitere Verbesserung:** Unter dem Sitzungszähler zeigt eine
kompakte, nicht interaktive Liste die letzten drei Entdeckungen und markiert den
aktuellen Ort semantisch mit `aria-current`. Sie bleibt nur im Arbeitsspeicher,
wird bei DE/EN neu lokalisiert und verdrängt die Hauptaktion auf keinem
Startviewport. Der Sieben-Orte-E2E verlangt exakt drei Einträge und genau einen
aktuellen Eintrag; Smartphone-Reflow und Build sind danach erneut grün.

### Finaler Essentials-v1.1.2-Abschluss

- `public-app-essentials/v1.1.2` ist exakt auf Shared-Commit
  `b14aac6107b75f03ff49e74160af7e7e30c29e59` gepinnt. Der portable
  Verifier bestätigt Manifesthash, getrennten physischen Iconpfad
  `public/favicon.svg`, Runtimepfad `favicon.svg`, stabiles Entry-Modul und
  alle sechs Lockartefakte.
- Source und lokale HTTP-Antwort des Loader-Icons sind bytegleich
  (`sha256:6f1080d60851cd2fecc238b54044c115be6a2aa963811ee4775c5fd5bcc3d05b`);
  die Antwort liefert 200 und `image/svg+xml`.
- Der erste Abschlusslauf fand zwei echte Integrationsregressionen: Der
  Loader-Test drosselte noch den früheren Hash-Entry, und der Service Worker
  precachte das neue stabile `/src/entry.js` nicht. Nach Korrektur bestanden
  die vier fokussierten Fälle und anschließend die gesamte Matrix mit 59
  bestandenen Fällen, 22 Profilskips und 0 Fehlern.
- Sichtbare Browserabnahme: 390 × 844 ergab 375/375 px
  Client-/Scrollbreite, eine im Startviewport vollständige Hauptaktion und
  genau eine H1; 1440 × 900 ergab 1425/1425 px und eine vollständige ruhige
  Momentansicht. 360 × 800 bei 200 % bleibt automatisiert ohne horizontalen
  Überlauf, mit reduziertem Bewegungsverhalten und Footerabschluss grün.
- Der no-cookies-Modus erzeugt kein Banner und keinen Dismiss-Key. Der exakte
  Datenschutzlink bleibt in DE/EN dauerhaft erreichbar; als persistenter
  Web-Storage-Zugriff ist ausschließlich die notwendige Sprachwahl
  inventarisiert. Cache Storage enthält nur die eigene App-Hülle und keine
  Wetterantworten.

### Railway-DEV-Revalidierung vom 2026-08-03

- Vor der externen Mutation bestätigte Railway CLI 5.30.3 das Zielprojekt
  `8f67be1c-9824-4750-838e-bf3bc639bf2c`, die Umgebung `development`
  (`92da5276-b6d5-45e9-9203-9dde08c141c6`) und null vorhandene Services.
- Die app-eigene Diensterstellung mit
  `railway add --service somewhere-now --json` scheiterte vor Upload und
  Artefakterzeugung exakt mit `Free plan resource provision limit exceeded`.
- Eine anschließende read-only Statusprüfung bestätigte weiterhin null
  Services und null Service-Instanzen. Es entstanden kein Deployment, keine
  Domain und keine HTTPS-DEV-/Health-URL. Portal und Production blieben
  unverändert.

### GitHub-Pages-DEV-Releasekandidat vom 2026-08-03

- Die Architekturkorrektur ordnet die statische Vite/PWA einem app-eigenen
  GitHub-Pages-Lifecycle statt Railway zu. Das leere Railway-Projekt bleibt
  unverändert erhalten und ist nicht mehr das Hostingziel.
- Root- und Pages-Build sind getrennt. Die Root-Matrix bestand beide
  Vertragsverifier, 32/32 Logiktests, Buildgate sowie 59 Browserfälle bei 22
  absichtlichen Profilskips und 0 Fehlern. Die vollständige Pages-Matrix am
  lokalen Unterpfad `/MilosApps-Irgendwo/` bestand ebenfalls mit 59/22/0.
- Die erste Pages-Offlineregression fand einen echten Browserunterschied:
  Vites Preview-Antworten mit `Vary: Origin` wurden trotz vollständig gefülltem
  Cache beim Reload nicht gefunden. Für ausschließlich app-eigene,
  bytegelockte Same-Origin-Shellressourcen verwendet der Cache-Lookup deshalb
  zusätzlich `ignoreVary`; der fokussierte Fall und danach die Vollmatrix sind
  grün.
- Der Release-Crosscheck fand außerdem einen veraltbaren Healthzustand:
  `health.json` und `health/somewhere-now.json` lagen im langlebigen
  Offline-Precache. Health, App-Metadaten und `deployment.json` sind nun aus dem
  Precache ausgeschlossen und network-only. Der E2E beweist gemeinsam, dass
  die App-Hülle offline lädt und der Healthcheck offline bewusst fehlschlägt.
- `build:pages:release` prüft nach dem Stempel alle drei vorhandenen
  Health-/Metadatendateien und das neu erzeugte `deployment.json` auf denselben
  vollständigen Source-SHA, DEV-Identität und `productionApproved=false`.
  Externe E2E akzeptieren nur eine credential-freie HTTPS-URL plus explizit
  erwarteten vollständigen SHA.
- Die externe GitHub-Pages-Abnahme ist absichtlich nachgelagert: Zuerst wird
  dieser exakte Quell-SHA committed und per Source-CI geprüft. URL, Artefakt-SHA
  und externe No-Login-Matrix werden anschließend im DEV-Handoff festgehalten,
  ohne die geprüfte Source↔Artefakt-Bindung durch einen Doku-Folgecommit zu
  verändern.

## Noch nicht testbar

- Reale Audioausgabequalität auf physischem iOS-/Android-Gerät; automatisiert
  sind Aktivierung, Blockade und Zustand prüfbar, nicht der gehörte Klang.
- Echte OS-Browserzoom-Tasten in der Headless-Laufzeit; Reflow wird zusätzlich
  mit 200 % Root-Textzoom bei 360 × 800 geprüft.
- Externe HTTPS-DEV-Matrix und Portalredirect sind releaseabhängig und werden
  erst nach Commit, grünem Source-CI und Pages-Veröffentlichung geprüft. Der
  Portalredirect bleibt bis zum separaten dev-verified Handoff inaktiv.
- Screenreader-Sprachausgabe; DOM-Semantik und Accessibility-Tree sind
  automatisiert prüfbar, die tatsächliche Ausgabe benötigt ein physisches
  Assistenztechnik-Setup.
