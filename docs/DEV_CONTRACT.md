# DEV-Integrationsvertrag

Vertragsstand: `public-app-shell/v2.0.3-dev` vom 2026-08-01.

## Metadaten

| Feld | Wert |
|---|---|
| App-Key | `somewhere-now` |
| Titel | `Irgendwo ist gerade …` |
| Kurzbeschreibung | `Ein stilles Fenster zu einem realen Moment irgendwo auf der Erde.` |
| Sprachen | `de`, `en` (vollständige Fach-UI, lokal persistiert) |
| Status | `DEV` |
| Authentifizierung | keine |
| Portalroute | `/apps/somewhere-now` |
| Lokale DEV-URL | `http://127.0.0.1:4316/` |
| Unabhängige HTTPS-DEV-URL | noch nicht bereitgestellt; nicht erfinden |
| Externer Healthcheck | `null`, solange kein HTTPS-DEV existiert |
| Lokaler Readiness-Pfad | `/health/somewhere-now.json` |
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
  "readiness": true,
  "shellContract": "public-app-shell/v2.0.3",
  "productionApproved": false
}
```

Der E2E-Start prüft diese sechs Werte inhaltlich. Ein HTTP-200, eine generische
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

## Externer DEV-Blocker

Der lokale, vollständig getestete DEV-Stand ist bereit. Eine unabhängige
HTTPS-DEV-URL kann derzeit nicht wahrheitsgemäß übergeben werden:

- für dieses Repository ist kein Git-Remote oder GitHub-Repository
  eingetragen;
- das Railway-Projekt `8f67be1c-9824-4750-838e-bf3bc639bf2c` ist in der
  Umgebung `development` erreichbar, besitzt aber weiterhin weder Service
  noch Domain;
- der einmal freigegebene Railway-CLI-Versuch scheiterte an der
  Free-Plan-Ressourcengrenze; ein Upgrade oder Alternativhosting ist nicht
  freigegeben;
- ein Production-Deployment ist ausdrücklich nicht freigegeben.

Bis derselbe DEV-Lifecycle einen echten Dienst und eine HTTPS-Domain liefert,
bleiben `dev.url`, `dev.healthUrl`, `devUrl` und `healthcheck` in den externen
Metadaten gemeinsam `null`. `http://127.0.0.1:4316/` ist ausschließlich die
lokale Prüfadresse und darf nicht als Portalziel verwendet werden.

Rollback des lokalen Shell-/UI-Wechsels ist der vorherige gesunde Commit
`06f62fa6c54553e5f0a1bf792827d223854b867e`. Production bleibt `false` und
unverändert.
