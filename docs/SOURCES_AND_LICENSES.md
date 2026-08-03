# Quellen und Lizenzen

Stand der Prüfung: 2026-08-03.

## Atmosphärenfotos

Die drei Motive liegen als lokale 1280-px-JPEG-Kopien im Repository. Die App
lädt sie von derselben Origin, verwendet keine Wikimedia-Hotlinks und sendet
beim Anzeigen keine Daten an Fotografen oder Plattformen. CSS darf das Bild je
nach Viewport sichtbar beschneiden; die Dateien selbst wurden nicht kreativ
bearbeitet. Die Oberfläche nennt Autor, Lizenz und Quellseite direkt am Motiv
und erklärt, dass das Foto die Lichtstimmung statt den ausgewählten Datenort
zeigt.

### Morgen

- Werk: [The Golden hour – Sunrise at the Killer Mountain, the mighty Nanga Parbat](https://commons.wikimedia.org/wiki/File:The_Golden_hour_-_Sunrise_at_the_Killer_Mountain,_the_mighty_Nanga_Parbat.jpg)
- Urheber: Mohammad Yaseen
- Aufnahmedatum: 30. April 2018
- Lizenz: [Creative Commons Attribution-ShareAlike 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- lokale Datei: `public/media/atmosphere/morning-nanga-parbat.jpg`
- SHA-256: `b5ac8793a49f3c40336fc7e8cfbef2924fae0a8da2ca4ec6e4a42c5aa0a8d661`

### Abend

- Werk: [Lisbon, Tagus river, fog, mist, sea, golden hour, light, sun, sunset, bridge](https://commons.wikimedia.org/wiki/File:Lisbon,_Tagus_river,_fog,_mist,_sea,golden_hour,_light,_sun,_sunset,_bridge_(50706209197).jpg)
- Urheber: Eduardo Pereira
- Aufnahmedatum: 15. September 2020
- Status: [Public Domain Mark 1.0](https://creativecommons.org/publicdomain/mark/1.0/), von Wikimedia nach dem Flickr-Import geprüft
- lokale Datei: `public/media/atmosphere/evening-lisbon.jpg`
- SHA-256: `8b95f66670031e6b710852c6e4041a7608f36800bd0bf0bb28df3c30e4d2d554`

### Nacht

- Werk: [Northern lights in Tromso](https://commons.wikimedia.org/wiki/File:Northern_lights_in_Tromso.jpg)
- Urheber: Ddgfoto
- Aufnahmedatum: 25. Februar 2014
- Lizenz: [Creative Commons Attribution-ShareAlike 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- lokale Datei: `public/media/atmosphere/night-tromso.jpg`
- SHA-256: `68e691e4622c197c41a1d22bc2e28b0b5a68574737f5981c984b5723e378fd15`

## Wetter: Open-Meteo

- Primärquelle: [Forecast API](https://open-meteo.com/en/docs)
- Bedingungen: [Terms](https://open-meteo.com/en/terms)
- Datenlizenz: CC BY 4.0.
- Verwendeter Endpunkt: `https://api.open-meteo.com/v1/forecast`.
- Übertragen werden nur die Koordinaten des app-seitig gewählten Orts, nie ein
  Nutzerstandort.
- Die App rundet Modellwerte, prüft Aktualität und blendet potenziell
  gefährliche Wetterlagen als Unterhaltung aus.
- Vor kommerzieller oder werbefinanzierter Veröffentlichung ist der passende
  Open-Meteo-Tarif erneut zu prüfen.

## Orte: GeoNames

- Primärquelle: [GeoNames Gazetteer Downloads](https://download.geonames.org/export/dump/)
- Datensatz: `cities5000.zip`, Snapshot vom 2026-07-29.
- Lizenz: CC BY 4.0.
- Verwendet werden GeoName-ID, Ortsname, grobe WGS84-Koordinaten und
  IANA-Zeitzone; einzelne deutsche Bezeichnungen und Kategorien sind app-eigen.

## Zeit und Sonnenstand

- Zeitzonen: [IANA Time Zone Database](https://www.iana.org/time-zones) über
  `Intl.DateTimeFormat` des Browsers.
- Sonnenstand: [SunCalc 2.0.1](https://github.com/mourner/suncalc),
  BSD-2-Clause. Der vollständige Lizenztext steht in
  [`THIRD_PARTY_NOTICES.md`](../THIRD_PARTY_NOTICES.md).

## MilosApps-Verträge

- `public-app-shell/v2.0.3` @
  `ed898412306e22c6ae1b10ee8953df29f8acd627`;
- `public-app-essentials/v1.1.5` @
  `2942132ad3bf6cf39edc9f52ed918de6a230be23`;
- feste lokale Vendor-Kopien mit SHA-256-Locks, kein CDN und kein
  Runtimeimport aus einem anderen Repository.

## Eigene Inhalte und Grenzen

- Texte, Auswahl-, Zeit-, Wetter- und Darstellungslogik sind app-eigen.
- Klang entsteht erst nach Nutzeraktion per Web Audio; es gibt keine
  Audiodateien.
- Satelliten-, Event-, Zeitraffer-, Webcam- und Livevideo-Ideen wurden
  verworfen und sind weder Runtimefunktion noch Netzwerkabhängigkeit.
- Die Schutzregel gegen akute Katastrophen und gefährliche Wetterinszenierung
  bleibt bestehen und ersetzt keine offizielle Warnquelle.
