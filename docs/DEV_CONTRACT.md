# DEV-Integrationsvertrag

Vertragsstand: `1.0-dev` vom 2026-07-30.

## Metadaten

| Feld | Wert |
|---|---|
| App-Key | `somewhere-now` |
| Titel | `Irgendwo ist gerade …` |
| Kurzbeschreibung | `Ein stilles Fenster zu einem realen Moment irgendwo auf der Erde.` |
| Sprache | `de` |
| Status | `DEV` |
| Authentifizierung | keine |
| Portalroute | `/apps/somewhere-now` |
| Lokale DEV-URL | `http://127.0.0.1:4316/` |
| Unabhängige HTTPS-DEV-URL | noch nicht bereitgestellt; nicht erfinden |
| Healthcheck | `/health/somewhere-now.json` |
| Metadaten | `/app-metadata.json` |
| Vorschaubild | `/preview.png` |
| Vorschaubildrechte | eigener App-Screenshot; alle sichtbaren Szenenelemente prozedural erzeugt |

Die maschinenlesbare Fassung liegt in
[`public/app-metadata.json`](../public/app-metadata.json).

## Readiness

Ein gültiger Readiness-Response enthält:

```json
{
  "status": "ok",
  "appKey": "somewhere-now",
  "environment": "DEV",
  "readiness": true
}
```

Der E2E-Start prüft diese vier Werte inhaltlich. Ein HTTP-200, eine generische
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

## Noch nicht freigegeben

- keine Production-URL;
- kein Production-Deployment;
- keine kommerzielle Nutzung des freien Open-Meteo-Endpunkts;
- keine Eintragung einer erfundenen DEV-URL.
