# Quellen und Lizenzen

Stand der Prüfung: 2026-08-02.

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
  Windgeschwindigkeit und Böen.
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
- Vertrag/Tag: `public-app-essentials/v1.0.0`.
- Exakter Shared-Commit:
  `b09e09008ff05fe87f05bc647a7c4964ff13e6f6`.
- Übernahme: feste lokale Kopie mit fünf SHA-256-gelockten Artefakten; kein
  CDN und kein Runtimeimport aus einem anderen Repository.
- App-spezifische Module: Ladebildschirm, `no-cookies`-Datenschutzhinweis mit
  lokaler Speicherung und Teilen; Datum und Ortssuche sind deaktiviert.
- Der Build erhält beide CSS-Verweise als externe Same-Origin-Ressourcen und
  liefert alle fünf Vendorartefakte bytegleich zum Lock aus.
- Texte, Theme-Tokens und das Inline-SVG-App-Icon bleiben Eigentum dieser App.

## Eigene Inhalte

- Szene: ausschließlich HTML und CSS aus diesem Repository; keine Bilder,
  Karten, Webcams oder fremden Designs.
- Klang: prozedurale Oszillator- und Rauschsignale über Web Audio; keine
  Audiodateien.
- Texte: für diese App neu geschrieben.
- Vorschaubild: Screenshot der eigenen App. Alle sichtbaren Szenenelemente sind
  prozedural erzeugt; die App darf diesen Screenshot für Portal-DEV verwenden.

## Schutzregel

Die App importiert keine Nachrichten-, Katastrophen- oder Warnmeldungen.
Wettercodes und Windwerte, die auf schwere oder potenziell gefährliche
Bedingungen hindeuten, werden nicht als unterhaltsamer Moment verwendet. Die
Oberfläche zeigt in diesem Fall nur Zeit und Tageslicht und erklärt die
bewusste Auslassung. Diese Filterung ist keine Wetterwarnung und ersetzt keine
offizielle Warnquelle.
