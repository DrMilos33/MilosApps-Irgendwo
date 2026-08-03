# DEV-Integrationsvertrag

Vertragsstand: `public-app-shell/v2.0.3` plus
`public-app-essentials/v1.1.5` vom 2026-08-03.

## Metadaten

| Feld | Wert |
|---|---|
| App-Key | `somewhere-now` |
| Titel | `Irgendwo ist gerade …` |
| Kurzbeschreibung | `Atmosphärische Morgen-, Abend- und Nachtmomente mit echter Ortszeit, Licht und Wetter.` |
| Sprachen | `de`, `en` (vollständige Fach-UI, lokal persistiert) |
| Status | `DEV` |
| Authentifizierung | keine |
| Portalroute | `/apps/somewhere-now` |
| Lokale DEV-URL | `http://127.0.0.1:4316/` |
| Unabhängige HTTPS-DEV-URL | `https://drmilos33.github.io/MilosApps-Irgendwo/` |
| Externer Healthcheck | `https://drmilos33.github.io/MilosApps-Irgendwo/health/somewhere-now.json` |
| Lokaler Readiness-Pfad | `/health/somewhere-now.json` |
| Metadaten | `/app-metadata.json` |
| Vorschaubild | `/preview.png` |
| Vorschaubildrechte | eigener App-Screenshot; Abendfoto Eduardo Pereira, Public Domain Mark 1.0, mit Attribution in App und Metadaten |

Die maschinenlesbare Fassung liegt in
[`public/app-metadata.json`](../public/app-metadata.json).

## Readiness

Ein gültiger Readiness-Response enthält:

```json
{
  "status": "ok",
  "appKey": "somewhere-now",
  "environment": "DEV",
  "readiness": true,
  "shellContract": "public-app-shell/v2.0.3",
  "essentialsContract": "public-app-essentials/v1.1.5",
  "productionApproved": false
}
```

Der E2E-Start prüft diese sieben Werte inhaltlich. Ein HTTP-200, eine generische
`/health.json` oder ein fremder Dienst auf demselben Port gelten nicht als
bereit. Port `4316` ist lokal reserviert; `strictPort` lässt Starts bei einer
Kollision fehlschlagen. Der Testlauf verwendet keinen vorhandenen Server
ungeprüft weiter.

## Portalgrenze

- Portal-DEV führt `/apps/somewhere-now` als Redirect auf die später
  abgestimmte unabhängige HTTPS-DEV-URL.
- Direktaufruf und vollständige Baseline funktionieren ohne Portal und ohne
  Login.
- Das Portal importiert keinen App-Quellcode, keine App-Daten und keine
  Secrets.
- Ein Portal-Ausfall verhindert den direkten App-Aufruf nicht.
- Portaländerungen gehören ausschließlich dem Portal-Task.

Die drei Atmosphärenfotos liegen lokal im App-Artefakt. Es existieren keine
Cross-Origin-Bild-, Webcam- oder Videomodi. Die Live-Grenze wird direkt im
Fotofenster benannt; Readiness und Portalroute bleiben davon unabhängig.

## Noch nicht freigegeben

- keine Production-URL;
- kein Production-Deployment;
- keine kommerzielle Nutzung des freien Open-Meteo-Endpunkts;
- keine Eintragung einer erfundenen DEV-URL.

## Eigenständiger Pages-DEV-Lifecycle

Die App ist eine statische Vite/PWA und wird deshalb app-eigen über GitHub
Pages veröffentlicht. Das Quellrepository ist
`DrMilos33/MilosApps-Irgendwo`; `codex/somewhere-now-dev` enthält den geprüften
Quellstand, `gh-pages` ausschließlich das aus genau diesem SHA gebaute und
gestempelte Artefakt. Ein App-Release ist erst gültig, wenn Source-CI,
Artefakt-SHA, Readiness und externe No-Login-Browsermatrix grün sind.

Der lokale Root-Modus `/` und der Pages-Modus `/MilosApps-Irgendwo/` bleiben
getrennt reproduzierbar. Manifest, Service Worker, Share-URL und externe
Same-Origin-Vendorassets sind unterpfadfähig. Health, App-Metadaten und
`deployment.json` sind ausdrücklich nicht Teil des Offline-Precaches und
werden network-only beantwortet, damit sie stets die aktuelle Revision
belegen.

Die drei JPEGs sind Teil des basisbewussten Offline-Precaches. Die strikte
CSP-Regression erlaubt Bilder, Skripte und Styles ausschließlich von
Same-Origin (zuzüglich des bestehenden `data:`-Iconpfads); Frames sind nicht
erforderlich.

Das leere Railway-Projekt `8f67be1c-9824-4750-838e-bf3bc639bf2c` bleibt als
historische, durch die Free-Plan-Ressourcengrenze blockierte Ressource
unverändert bestehen. Es ist nicht mehr Zielhost dieser statischen App; es wird
weder aufgewertet noch gelöscht.

Rollback ist die zuletzt extern gesund geprüfte `gh-pages`-Artefaktrevision
zusammen mit ihrem Source-SHA. Vor der ersten Aktivierung kann Pages wieder
deaktiviert und der Artefaktbranch entfernt werden, ohne Railway, Portal oder
Production zu verändern. Production bleibt `false` und unverändert.
