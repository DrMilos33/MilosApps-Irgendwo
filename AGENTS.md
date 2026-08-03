# Irgendwo ist gerade … Repository-Regeln

## Zuständigkeit

Dieses Repository enthält ausschließlich `Irgendwo ist gerade …` mit dem
App-Key `somewhere-now`. Fachlogik anderer MilosApps gehört nicht hierher.

## Portfolio-Verträge

- App-Klasse: `öffentlich`
- Plattformen: `Web, mobil und Desktop`
- Datenhaltung: `optionale Einstellungen lokal; keine App-Datenbank`
- Deployment: `app-eigenes GitHub-Pages-DEV; Production nicht freigegeben`
- Gemeinsame Laufzeitabhängigkeiten: `keine`; veröffentlichte Verträge werden
  ausschließlich fest gepinnt, vendort und lokal gelockt

Wenn der lokale MilosApps Workspace verfügbar ist, vor appübergreifenden
Änderungen die Register-, Portfolio-, Identity- und
`docs/PORTFOLIO_LEARNINGS.md`-Dokumente dort lesen.

## Arbeitsgrenzen

- Nur Dateien dieses Repositorys ändern.
- Keine Datenbank, Cookies, Secrets oder Quellcode mit anderen Apps teilen.
- Fremde Webcams, Fotos, Audiodateien und Texte nicht übernehmen.
- Wetter-, Orts- und Zeitzonendaten auf Lizenz, Attribution und Aktualität
  prüfen.
- Katastrophen, menschliches Leid und gefährliche Ereignisse nicht als
  Unterhaltung inszenieren.
- DEV und Production strikt trennen; Production nur nach ausdrücklicher
  Freigabe verändern.

## Qualität

- Automatisierte Logik-, Zustands- und End-to-End-Tests aufbauen.
- Nach dem ersten lauffähigen Stand mindestens zwei QA-/Verbesserungsrunden
  durchführen.
- Mobile und Desktop, Touch, Maus, Tastatur, reduzierte Bewegung, langsames Netz
  und Offlinezustand prüfen.
- Allgemeine Erkenntnisse in `docs/LEARNINGS.md` festhalten und zurückmelden.
- Abschluss mit Branch, Commit, Tests, DEV-Status, Portalvertrag und Blockern
  dokumentieren.
