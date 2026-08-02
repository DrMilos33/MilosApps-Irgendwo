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

## Verbesserungsrunden

1. Happy Path, Datenlogik und vollständige Zustände.
2. Fehler-, Missbrauchs-, Barrierefreiheits-, Performance- und
   Wiederholungsprüfung; Probleme beheben und gesamte Matrix erneut ausführen.
