# GitHub-Pages-DEV

## Ziel und Branchmodell

- Repository: `DrMilos33/MilosApps-Irgendwo`, öffentlich;
- Quellbranch: `codex/somewhere-now-dev`;
- kanonischer späterer Quellbranch: `main`, durch dieselbe CI geschützt;
- Artefaktbranch: `gh-pages`, Pages-Quelle `/`;
- DEV-URL: `https://drmilos33.github.io/MilosApps-Irgendwo/`;
- Health: `https://drmilos33.github.io/MilosApps-Irgendwo/health/somewhere-now.json`;
- Production: nicht freigegeben.

Source und Artefakt bleiben getrennt. `gh-pages` enthält keine handgepflegte
App-Quelle, sondern ausschließlich das reproduzierbar gebaute `dist` eines
grünen Source-SHAs.

## Reproduzierbarer Build

```powershell
pnpm install --frozen-lockfile
pnpm test:all
pnpm build:pages
$env:SOURCE_SHA = git rev-parse HEAD
pnpm build:pages:release
```

`build:pages:release` baut mit `/MilosApps-Irgendwo/`, prüft Vendor-Locks,
Unterpfade, Manifest und Service Worker, stempelt anschließend den vollständigen
Source-SHA und prüft danach nochmals `health.json`,
`health/somewhere-now.json`, `app-metadata.json` und `deployment.json`.

## Offline- und Readiness-Grenze

Der Service Worker leitet seine Basis aus `self.registration.scope` ab. Er
precacht die App-Shell, das gebaute App-Bundle und die gelockten externen
Vendorassets. Readiness-, Metadaten- und Deploymentpfade sind network-only und
werden nie in diesen Cache geschrieben. Ein Offline-Reload darf die Fach-App
öffnen; ein Healthcheck muss dagegen online die aktuelle Revision belegen oder
fehlschlagen.

## Veröffentlichung und Rollback

Vor Repository-Erstellung, Push oder Pages-Aktivierung wird der genaue
Source-SHA mit Tests und Rollback im Portfolio koordiniert. Nach grünem Source-
CI wird ausschließlich dessen gestempeltes `dist` non-force auf `gh-pages`
veröffentlicht. Die externe Abnahme prüft URL, Health-SHA, MIME-Typen,
No-Login-Direktaufruf und die vollständige Browsermatrix.

Rollback bedeutet, `gh-pages` non-force auf das zuletzt gesunde Artefakt
zurückzuführen. Vor dem ersten gesunden Release kann Pages deaktiviert werden;
Source, Railway, Portal und Production bleiben dabei unberührt.
