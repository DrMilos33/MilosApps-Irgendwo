# Visuelle Richtung: ruhige Erlebnisfläche

Diese Datei hält die übertragbaren Designentscheidungen von
„Irgendwo ist gerade …“ als Referenz fest. Sie ist kein CSS-Paket und keine
Runtimeabhängigkeit. Andere Apps dürfen die Prinzipien bewusst übernehmen,
müssen sie aber in ihrem eigenen Repository, Theme und Lifecycle umsetzen.

## Produktgewichtung

1. Die eigentliche Erlebnis- oder Arbeitsfläche erhält den größten Anteil des
   Viewports. Kontext und Steuerung erklären sie, konkurrieren aber nicht mit
   ihr.
2. Auf Desktop und Tablet bleibt die Kontextspalte bewusst schmal. Die
   Erlebnisfläche ist mindestens 1,75-mal beziehungsweise 1,5-mal so breit.
3. Auf Mobilgeräten lautet die Reihenfolge: kompakter Kontext, Auswahl,
   Hauptaktion, Erlebnisfläche, danach Verlauf und Nebenaktionen.
4. Werbung oder zukünftige Randinhalte dürfen diese Gewichtung nicht
   umkehren. Produktdesign hat im App-Viewport Vorrang.

## Kompakter Kontext statt Hero-Block

- App-Name und Ein-Satz-Versprechen bilden eine ruhige Introzeile.
- Ort, Momenttitel, Ein-Satz-Erklärung und Warum-jetzt-Begründung besitzen feste
  Höhenbudgets für realistisch kurze und lange Übersetzungen.
- Der Momenttitel ist ausdrucksstark, aber nie größer als die eigentliche
  Erlebnisfläche. Zwei Zeilen sind das Maximum im normalen Layout.
- Die Hauptaktion verändert ihre vertikale Position bei kurzen und langen
  Momenttexten um höchstens einen Pixel.
- Interaktive Ziele bleiben trotz der visuellen Verdichtung mindestens 44 px
  groß. Kompaktheit entsteht durch Hierarchie und Abstände, nicht durch kleine
  Bedienflächen.

## Große, ehrliche Live-Fläche

- Eine zusammenhängende Fläche verbindet Atmosphäre und belegbare Live-Daten.
- Herkunft und Grenze werden direkt benannt: Eine prozedurale Datenszene wird
  nicht als Kameraaufnahme ausgegeben.
- Dateninformationen bleiben lesbar in derselben Fläche, bilden aber keine
  konkurrierende zweite Kartenlandschaft.
- Wetter-, Zeit- oder Sprachupdates dürfen weder Hauptaktion noch
  Flächenproportionen verschieben.

## Responsiver Prüfvertrag

- 1440 × 900: Erlebnisfläche mindestens 1,75-mal so breit wie der Kontext.
- Tablet: Erlebnisfläche mindestens 1,5-mal so breit wie der Kontext.
- 390 × 844: Erlebnisfläche steht vor Verlauf und Nebenaktionen.
- 360 × 800 bei 200 % Textzoom: kein horizontaler Überlauf.
- Kurze und lange Titel/Details/Begründungen: Hauptaktion bleibt pixelstabil.
- DE/EN, Tastaturfokus, 44-px-Ziele, Reduced Motion, Dark Mode und Axe bleiben
  Teil der Abnahme.

## Wiederverwendung

Diese Richtung ist besonders geeignet für Apps mit einer dominanten Karte,
Visualisierung, Szene, Vorschau oder Arbeitsfläche. Daten- oder Formularapps
übernehmen die Gewichtung, nicht zwingend die dunkle Atmosphäre, Serifenschrift
oder Akzentfarbe. App-Identität bleibt app-eigen; gemeinsame Shell- und
Essentials-Verträge werden nicht durch diese Referenz ersetzt.
