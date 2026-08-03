# Quellen und Lizenzen

Stand der Prüfung: 2026-08-03.

## Wetter: Open-Meteo

- Primärquelle:
  [Forecast API](https://open-meteo.com/en/docs)
- Nutzungsbedingungen:
  [Terms](https://open-meteo.com/en/terms)
- Datenlizenz: CC BY 4.0.
- Verwendeter Dienst:
  `https://api.open-meteo.com/v1/forecast`
- Verwendete aktuelle Modellwerte: Temperatur, gefühlte Temperatur,
  Niederschlag, Regen, Schauer, Schnee, WMO-Wettercode, Wolkenbedeckung,
  relative Luftfeuchte, Sichtweite, Windgeschwindigkeit, Windrichtung, Böen
  und kurzwellige Strahlung.
- Zeitformat: `GMT`, damit der Zeitstempel als UTC-Instant eindeutig
  ausgewertet werden kann.
- Laufzeitgrenze des freien Endpunkts: ausschließlich nichtkommerzieller DEV
  unter den veröffentlichten Rate-Limits. Vor einer kommerziellen oder
  werbefinanzierten Veröffentlichung ist ein passender Open-Meteo-Tarif
  erforderlich.
- Attribution in der App: `Wetter: Open-Meteo · CC BY 4.0`.
- Änderungen: Modellwerte werden gerundet, auf Aktualität geprüft und in eine
  eigene deutschsprachige Momentbeschreibung übersetzt.
- Haftungsgrenze: Modellwerte können unvollständig, ungenau, verspätet oder
  nicht erreichbar sein. Die App kennzeichnet diese Zustände und verwendet
  Wetter nicht für sicherheitskritische Entscheidungen.

## Satellitenbilder: NASA GIBS

- Primärquelle und Zugriffsvertrag:
  [NASA GIBS Access Basics](https://nasa-gibs.github.io/gibs-api-docs/access-basics/)
- Bilddienst: öffentlicher OGC-WMS-GetMap-Endpunkt unter
  `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi`.
- Ebene: `MODIS_Terra_CorrectedReflectance_TrueColor`.
- NASA-Medienrichtlinie:
  [NASA Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/).
- Verwendung: informativer regionaler Ausschnitt des UTC-Vortags; bei
  Bildfehler genau ein Rückfall auf zwei Tage zuvor. Das Aufnahmedatum und die
  Grenze „Nahe-Echtzeit, nicht live“ bleiben sichtbar.
- Attribution: `NASA GIBS` direkt an der Ansicht sowie Link zum entsprechenden
  [NASA Worldview](https://worldview.earthdata.nasa.gov/)-Ausschnitt.
- Grenze: kein NASA-Logo, keine NASA-Empfehlungsbehauptung, keine Übernahme
  gekennzeichneter Drittinhalte. Das Bild wird erst nach Nutzeraktion geladen,
  nicht verändert, nicht lokal kopiert und nicht vom Service Worker gecacht.

Empfohlener Quellenhinweis: „We acknowledge the use of imagery provided by
services from NASA's Global Imagery Browse Services (GIBS), part of NASA's
Earth Science Data and Information System (ESDIS).“

## Webcams: offizieller Windy-Embed

- Primärquelle:
  [Windy Webcam Embed](https://embed.windy.com/config/webcam)
- Nutzungsgrenzen:
  [Windy Webcams Terms](https://api.windy.com/webcams/terms) und
  [Pricing](https://api.windy.com/webcams/pricing).
- Verwendet werden ausschließlich die offiziellen Player-URLs für die drei in
  [`LIVE_CAMERA_OPTIONS.md`](LIVE_CAMERA_OPTIONS.md) dokumentierten IDs.
- Windy-Link und Betreiberquelle stehen sichtbar bei jedem Player. Bilder
  werden nicht kopiert, vergrößert, überlagert oder zwischengespeichert.
- Der Player lädt ausschließlich nach Nutzeraktion. Laut offizieller
  Embed-Konfiguration verwendet Windy Embed keine Cookies oder andere
  Trackingverfahren. Übliche technische Verbindungsdaten an den Drittanbieter
  bleiben dennoch transparent im Datenschutzinventar dokumentiert.
- Keine Webcams-API, kein Schlüssel und keine dynamische freie Suche.

## Orte: GeoNames

- Primärquelle:
  [GeoNames Gazetteer Downloads](https://download.geonames.org/export/dump/)
- Datensatz: `cities5000.zip`, Snapshot vom 2026-07-29.
- Datenlizenz: CC BY 4.0.
- Verwendete Felder: GeoName-ID, Ortsname, WGS84-Koordinaten und
  IANA-Zeitzonen-ID.
- Änderungen: kleiner kuratierter Ausschnitt, deutsche Schreibweisen einzelner
  Orts- und Ländernamen, eigene Landschaftskategorie und eigener Szenen-Seed.
- Attribution in der App: `Ortsdaten: GeoNames · CC BY 4.0`.
- Datenschutzgrenze: Die Koordinaten gehören ausschließlich zum kuratierten
  Ort. Die App fragt keinen Nutzerstandort ab.

## Zeitzonen: IANA-Daten über `Intl`

- Primärquelle:
  [IANA Time Zone Database](https://www.iana.org/time-zones)
- Laufzeit: `Intl.DateTimeFormat` des jeweiligen Browsers.
- Zweck: lokale Uhrzeit, lokales Datum, Sommerzeit und Datumsgrenzen.
- Grenze: Der Browser oder das Betriebssystem liefert seine installierte
  IANA-Version. Die IANA-Seite wies bei der Prüfung Version `2026c` als aktuell
  aus; die App behauptet nicht, dass jeder Client bereits diese Version nutzt.

## Sonnenstand: SunCalc

- Primärquelle und Dokumentation:
  [SunCalc](https://github.com/mourner/suncalc)
- Eingesetzte Version: `2.0.1`.
- Lizenz: BSD-2-Clause.
- Zweck: Sonnenhöhe, Sonnenrichtung, Sonnenaufgang, Sonnenuntergang, Polartag
  und Polarnacht.
- Attribution in der App: `Sonnenstand: SunCalc · BSD-2-Clause`.
- Der vollständige Lizenzhinweis steht in
[THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).

## MilosApps Public App Shell

- Kanonische Quelle:
  [DrMilos33/MilosApps-Shared](https://github.com/DrMilos33/MilosApps-Shared)
- Vertrag/Tag: `public-app-shell/v2.0.3`.
- Exakter Shared-Commit:
  `ed898412306e22c6ae1b10ee8953df29f8acd627`.
- Übernahme: feste lokale Kopie mit fünf SHA-256-gelockten Artefakten; kein
  CDN und kein Runtimeimport aus einem anderen Repository.
- Release-Hash `milos-app-shell.js`:
  `bff9c09ae64e453d186508a4372a1cacc17b4dcd30b770046c7f4efee53731b3`.
- Release-Hash `milos-app-shell.css`:
  `662093d5dce4147b7e962a882b570b478a437a78c77d92242eb3c96191a019a9`.
- Das App-Icon, Theme-Tokens und sämtliche sichtbaren DE/EN-Fachtexte gehören
  weiterhin dieser App; die Shell liefert nur den gemeinsamen Rahmen.

## MilosApps Public App Essentials

- Kanonische Quelle:
  [DrMilos33/MilosApps-Shared](https://github.com/DrMilos33/MilosApps-Shared)
- Vertrag/Tag: `public-app-essentials/v1.1.5`.
- Exakter Shared-Commit:
  `2942132ad3bf6cf39edc9f52ed918de6a230be23`.
- Übernahme: feste lokale Kopie mit sechs SHA-256-gelockten
  Verbraucherartefakten einschließlich Manifest-Schema; kein
  CDN und kein Runtimeimport aus einem anderen Repository.
- App-spezifische Module: Ladebildschirm, dauerhafter `no-cookies`-
  Datenschutzlink und Teilen; Datum und Ortssuche sind deaktiviert.
- Der Build erhält beide CSS-Verweise als externe Same-Origin-Ressourcen und
  liefert alle sechs Vendorartefakte bytegleich zum Lock aus.
- Texte, Theme-Tokens und das Inline-SVG-App-Icon bleiben Eigentum dieser App.

## Eigene Inhalte

- Datenszene: ausschließlich HTML und CSS aus diesem Repository; keine
  übernommenen Bilder, Karten, Kameraaufnahmen oder fremden Designs.
- Externe Satelliten-/Webcamansichten sind getrennte Opt-in-Modi und werden
  nicht Bestandteil der eigenen prozeduralen Szene.
- Klang: prozedurale Oszillator- und Rauschsignale über Web Audio; keine
  Audiodateien.
- Texte: für diese App neu geschrieben.
- Vorschaubild: Screenshot ausschließlich der standardmäßigen eigenen
  Datenszene. NASA-/Webcaminhalte dürfen nicht in ein app-eigenes Portalbild
  übernommen werden.

## Schutzregel

Die App importiert keine Nachrichten-, Katastrophen- oder Warnmeldungen.
Wettercodes und Windwerte, die auf schwere oder potenziell gefährliche
Bedingungen hindeuten, werden nicht als unterhaltsamer Moment verwendet. Die
Oberfläche zeigt in diesem Fall nur Zeit und Tageslicht und erklärt die
bewusste Auslassung. Diese Filterung ist keine Wetterwarnung und ersetzt keine
offizielle Warnquelle.
