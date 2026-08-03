# QA-Plan: Irgendwo ist gerade …

## Automatisierbare Logik

- Zeitzonen, Datumssprung und Sommerzeit;
- Sonnenaufgang, Sonnenuntergang, Polartag und Polarnacht;
- Momentauswahl mit festen Datenfixtures und reproduzierbarem Zufall;
- Ausschluss ungeeigneter oder riskanter Ereigniskategorien;
- fehlende, veraltete und teilweise Wetterdaten;
- Teilkarte ohne versteckte genaue Koordinaten.
- vollständige DE/EN-Fachtexte, Ortsnamen und Datumsformate;
- Shell- und Essentials-Manifeste, Vendor-Locks und SHA-256-Artefakte;
- Teilpayload ohne Query oder genaue Koordinaten.
- Ranking interessanter Licht-/Ortszeitmomente, Ausschluss der letzten sechs
  Orte und Neuheit der letzten fünf Szenenprofile;
- zwölf deterministische Szenenprofile und Sitzungsfortschritt ohne
  Persistenz;

## Simulierte Nutzung

- wiederholte schnelle „Noch einmal“-Eingaben;
- langsames Netz, Timeout, Offline und Wiederholung;
- Smartphone, Tablet, Desktop, Touch, Maus und Tastatur;
- Audio blockiert, stumm, unterbrochen und nach App-Rückkehr;
- reduzierte Bewegung, hoher Zoom, lange Ortsnamen und lokalisierte Datumswerte.
- strikte Same-Origin-CSP ohne Inline-Styles sowie externe Shell-CSS-MIME-Typen;
- Sprachpersistenz und funktionaler Shadow-DOM-Skiplink nach Reload.
- CSS-first Start bei langsamem/frischem Laden, genau eine Dokument-H1;
- wahrheitsgemäßer Datenschutzstatus, 44-px-Aktion und Persistenz;
- Teilen über native API, Clipboard-Fallback und erwartbaren Abbruch;
- beide externen Essentials-CSS-Dateien im tatsächlich gebauten HTML.
- Hauptreise mit sieben Ergebnissen, mindestens sechs Szenenprofilen und
  sichtbarem Drei-Orte-Verlauf;

## Verbesserungsrunden

1. Happy Path, Datenlogik und vollständige Zustände.
2. Fehler-, Missbrauchs-, Barrierefreiheits-, Performance- und
   Wiederholungsprüfung; Probleme beheben und gesamte Matrix erneut ausführen.
3. Vergleich mit Sky, Gravity Loop, Welcher Müll?, Noch hell?, Wolkenpost und
   Nudelrechner auf Einstieg, Verständlichkeit und Wiederholungswert; mindestens
   eine daraus abgeleitete Verbesserung erneut prüfen.

## Pages-DEV-Matrix

- Root-Build `/` und Pages-Build `/MilosApps-Irgendwo/` getrennt prüfen;
- basisbewusste Manifest-, Share-, Service-Worker-, Health- und Vendorpfade;
- Offline-Erstinstallation und Offline-Reload der App-Shell;
- Health, App-Metadaten und `deployment.json` niemals aus dem Service-Worker-
  Cache beantworten;
- gestempelten vollständigen Source-SHA in allen vier Release-Metadaten prüfen;
- externe HTTPS-Matrix ohne Login auf Smartphone, Tablet und Desktop;
- 360×800 bei 200 Prozent, 390×844 und 1440×900 ohne horizontalen Überlauf;
- Icon und externe Vendorassets mit korrektem MIME-Typ sowie Readiness mit
  `appKey=somewhere-now`, `environment=DEV` und `productionApproved=false`.
