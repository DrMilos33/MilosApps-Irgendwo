# Visuelle Richtung: kompaktes Menü, großes Momentfenster

Diese Datei hält die übertragbaren Designentscheidungen von „Irgendwo ist
gerade …“ als Referenz fest. Sie ist kein CSS-Paket und keine
Runtimeabhängigkeit. Andere Apps dürfen die Prinzipien bewusst in ihrem eigenen
Repository und Lifecycle übernehmen.

## Produktgewichtung

1. Die Erlebnis- oder Arbeitsfläche erhält den größten Anteil des Viewports.
2. Desktop: eine ruhige, schmale Menüspalte links und eine deutlich größere
   Hauptfläche rechts.
3. Mobil: Versprechen, Auswahl und Hauptaktion stehen vor der Hauptfläche;
   Details folgen danach.
4. Werbung oder Randinhalte dürfen diese Gewichtung nicht umkehren.

## Linkes Menü

- Ein kleiner Kicker benennt das Momentfenster.
- Die dreizeilige Serifüberschrift „Gerade jetzt / irgendwo / auf der Erde.“
  bleibt kompakt; nur „irgendwo“ trägt die warme Akzentfarbe.
- Ein kurzer Satz erklärt das Versprechen. Ortsname, Momentgeschichte, Wetter
  und Begründung gehören nicht in diese Spalte.
- Vier mindestens 44 px hohe Wahlflächen bilden ein ruhiges 2×2-Raster.
- Die breite Hauptaktion ist visuell eindeutig; Teilen und Sitzungsstand sind
  nachgeordnet.
- Längere dynamische Texte auf der rechten Seite dürfen die Position der
  Hauptaktion nicht verändern.

## Großes, ehrliches Fotofenster

- Ein lokales atmosphärisches Foto dominiert die Fläche.
- „Live-Daten“ und „Atmosphärenfoto · nicht live“ stehen gleichzeitig sichtbar
  im Bild. Das Foto darf nie als aktuelle Kameraansicht behauptet werden.
- Ort, Momenttitel und Ein-Satz-Detail liegen als kontrastreiche, kurze
  Überlagerung im unteren Bildbereich.
- Unter dem Bild folgen Fototitel, sichtbare Attribution, Lizenz sowie aktuelle
  Ortszeit-, Wetter- und Tageslichtdaten.
- Die Motive stehen für Morgen-, Abend- oder Nachtlicht. Wenn Bildort und
  gewählter Datenort voneinander abweichen, wird diese Grenze direkt genannt.

## Responsiver Prüfvertrag

- 1440×900: Fotofenster mindestens 1,75-mal so breit wie das Menü.
- Tablet: Fotofenster mindestens 1,5-mal so breit wie das Menü.
- 390×844: Hauptaktion liegt im ersten Viewport, Bild beginnt danach sichtbar.
- 360×800 bei 200 % Textzoom: kein horizontaler Überlauf.
- DE/EN, Tastaturfokus, 44-px-Ziele, Reduced Motion, Dark Mode und Axe bleiben
  Teil der Abnahme.

## Wiederverwendung

Die Richtung passt zu Apps mit einer dominanten Karte, Visualisierung, Vorschau
oder Arbeitsfläche. Andere Apps übernehmen die Gewichtung, nicht zwingend das
dunkle Theme, die Serifenschrift oder die Akzentfarbe. Shell- und
Essentials-Verträge werden dadurch nicht ersetzt.
