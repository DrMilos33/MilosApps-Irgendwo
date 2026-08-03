# QA-Plan: Irgendwo ist gerade …

## Logik und Verträge

- Zeitzonen, Datumssprung, Polartag und Polarnacht;
- Ranking, Wiederholungsschutz und chronologische Lichtspur;
- Morgen-/Abend-/Nachtfokus wählt das zugehörige lokale Foto;
- jede Bilddatei besitzt Quelle, Autor und Lizenz;
- fehlende, veraltete und gefährliche Wetterzustände;
- DE/EN, Teiltext ohne Koordinaten, Shell-/Essentials-Locks;
- Root- und Pages-Build, App-Key, DEV-Health und Productiongrenze.

## Runde 1: Gestaltung und reale Aufgabe

- 1440×900, Tablet und 390×844: schmales linkes Menü, dominantes Fotofenster;
- Hauptaktion im ersten Smartphone-Viewport;
- dynamische Momenttexte verändern die Position der linken Hauptaktion um
  höchstens 1 px;
- alle vier Suchrichtungen funktionieren und wechseln Datenort sowie Bildphase;
- lokale Bilder sind vollständig geladen, korrekt beschnitten und ohne
  Drittanbieterrequest sichtbar;
- Attribution, Lizenz und „nicht live“-Grenze sind sichtbar.

## Runde 2: Robustheit

- 360×800 bei 200 % Textzoom ohne horizontalen Überlauf;
- Tastatur, Fokus, 44-px-Ziele, Axe, Dark Mode und Reduced Motion;
- schneller Wiederholungsklick, Timeout, Offline, Retry und App-Resume;
- Audio blockiert/stumm;
- DE/EN plus Reload;
- Offline-Erstinstallation mit allen drei Fotos, aber network-only Health;
- strikte Same-Origin-CSP und korrekte JPEG-/Vendor-MIME-Typen.

## Pages-DEV

- Root `/` und Pages-Unterpfad `/MilosApps-Irgendwo/` getrennt prüfen;
- Source-SHA nach dem Stempel in Health, Metadaten und `deployment.json`;
- alle drei Fotos im basisbewussten Offline-Precache;
- externe HTTPS-Matrix ohne Login auf Smartphone, Tablet und Desktop;
- Portalroute nur read-only revalidieren; Production bleibt 404.
