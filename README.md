# Irgendwo ist gerade …

Eigenständige öffentliche MilosApps-Web-App mit dem App-Key `somewhere-now`.

Ein Klick führt zu einem realen Ort, an dem gerade ein verständlicher,
interessanter Moment stattfindet. Zeit, Tageslicht und Wetter erzeugen eine
eigene abstrakte Szene mit optionalem prozeduralem Klang.

## Feste Grenzen

- kein Konto und keine App-Datenbank;
- keine fremden Webcams oder Medien;
- eigener DEV-Lifecycle, Production nicht freigegeben;
- keine Shared-Abhängigkeit ohne veröffentlichten Release;
- Portal-DEV bindet nur über dokumentierte Metadaten und URL an.

Siehe [Produktbrief](docs/PRODUCT_BRIEF.md), [QA-Plan](docs/QA_PLAN.md) und
[Erkenntnisse](docs/LEARNINGS.md).

## Lokaler DEV-Stand

Voraussetzungen:

- Node.js 24 oder neuer;
- pnpm 11.

```powershell
pnpm install
pnpm dev
```

Die App läuft ausschließlich auf dem reservierten lokalen Port
`http://127.0.0.1:4316`. Bei einer Portkollision bricht der Start ab. Der
app-spezifische Readiness-Endpunkt ist:

```text
http://127.0.0.1:4316/health/somewhere-now.json
```

Eine gültige Antwort enthält unter anderem `"appKey": "somewhere-now"` und
`"readiness": true`. Ein beliebiger HTTP-200 ist kein gültiger
Readiness-Nachweis.

## Qualitätssicherung

```powershell
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

`pnpm test:all` führt Logiktests, Build und Browsermatrix nacheinander aus.
Details stehen im [QA-Bericht](docs/QA_REPORT.md).

## Daten und Datenschutz

- Der Browser sendet nur die Koordinaten des von der App gewählten Orts an
  Open-Meteo; ein Nutzerstandort wird weder angefragt noch übertragen.
- Ortszeit und Sonnenstand werden lokal berechnet.
- Es gibt keine Analyse, Cookies, Konten oder App-Datenbank.
- Exakte Ortskoordinaten erscheinen weder in der Oberfläche noch in der
  Teilkarte.
- Klang entsteht erst nach Nutzeraktion vollständig im Browser.

Quellen und Lizenzgrenzen sind in
[Quellen und Lizenzen](docs/SOURCES_AND_LICENSES.md) dokumentiert. Der
Portalvertrag steht in [DEV-Vertrag](docs/DEV_CONTRACT.md).
