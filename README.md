# Irgendwo ist gerade …

Eigenständige öffentliche MilosApps-Web-App mit dem App-Key `somewhere-now`.

Ein Klick führt zu einem realen Ort, an dem gerade ein verständlicher,
interessanter Moment stattfindet. Zeit, Tageslicht und Wetter erzeugen eine
eigene abstrakte Szene mit optionalem prozeduralem Klang.

## Feste Grenzen

- kein Konto und keine App-Datenbank;
- keine fremden Webcams oder Medien;
- eigener DEV-Lifecycle, Production nicht freigegeben;
- keine Shared-Laufzeitabhängigkeit; die öffentliche Shell ist als feste,
  gelockte Kopie aus `public-app-shell/v2.0.3` im Repository enthalten;
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
pnpm test:shell
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

`pnpm test:all` prüft zuerst Manifest, Vendor-Lock und SHA-256-Hashes und führt
danach Logiktests, Build und Browsermatrix aus.
Details stehen im [QA-Bericht](docs/QA_REPORT.md).

## Öffentliche App-Shell

Die Shell ist aus `DrMilos33/MilosApps-Shared`, Tag
`public-app-shell-v2.0.3`, Commit
`ed898412306e22c6ae1b10ee8953df29f8acd627` vendort. Maßgeblich sind
[`milos-app.json`](milos-app.json) und
[`vendor/milosapps-shell/v2/shell-lock.json`](vendor/milosapps-shell/v2/shell-lock.json).
Es gibt weder CDN- noch Runtime-Importe aus einem anderen Repository.

Der Build lässt den gelockten Vendorpfad von Vite unverändert und kopiert ihn
bytegleich nach `dist/vendor/…`. Dadurch funktionieren die externen
Same-Origin-Styles auch unter `style-src 'self'` ohne Nonce, Hash oder
`unsafe-inline`.

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
