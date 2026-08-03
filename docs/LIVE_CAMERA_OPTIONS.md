# Entscheidungsnotiz: Satellit und kuratierte Webcams

Stand: 3. August 2026. Die Nutzerentscheidung aktiviert einen engen Teil der
früheren Optionen: drei kuratierte Windy-Player als seltenes Extra sowie einen
separaten NASA-Satellitenblick. Eine freie oder automatische Webcamsuche bleibt
ausgeschlossen.

## Produktgrenze

Die App bleibt eine statische, vollständig öffentliche PWA ohne Backend. Die
eigene prozedurale Datenszene ist der sofortige, offlinefähige Standard. Externe
Ansichten werden weder vorab geladen noch gecacht und sind klar von diesem
lokalen Kern getrennt. Ein Ortswechsel entfernt bereits geladene Fremdmedien.

## Implementierter Kameraumfang

| App-Ort | Windy-ID | Kamera | Betreiberquelle | geprüft |
|---|---:|---|---|---|
| Tromsø | `1345854014` | Fjellheisen | `https://webcam.fjellheisen.no/` | 2026-08-03 |
| Reykjavík | `1545635591` | Miðbakki-Hafen | `https://www.webcamtaxi.com/en/iceland/reykjavik/miobakki-harbour-cam.html` | 2026-08-03 |
| Kapstadt | `1170887551` | Tafelberg von Milnerton | `https://www.kapstadt.de/reisefuehrer/westkueste/milnerton/webcam` | 2026-08-03 |

Das sind drei von 33 kuratierten Orten. Die Auswahl ist absichtlich selten.
Der Button wird an allen anderen Orten nicht angezeigt. Der Embed lädt erst
nach Klick, verwendet den offiziellen Windy-Player und zeigt sowohl Windy- als
auch Betreiberlink. Medien werden nicht kopiert, gestreckt, überlagert oder im
App-Cache gespeichert.

Windy bietet die Einbettung offiziell an und erklärt, dass der Embed keine
Cookies oder anderen Trackingverfahren verwendet:

- https://embed.windy.com/config/webcam
- https://api.windy.com/webcams/terms
- https://api.windy.com/webcams/pricing

Der freie Weg erlaubt Link oder Embed. Die App verwendet weder Webcams-API-Key
noch kurzlebige Bild-URLs. Eine dynamische weltweite Suche würde weiterhin
einen app-eigenen Proxy/Backend-Lifecycle und einen gesonderten Vertrag
erfordern.

## NASA-Satellitenblick

Der optionale Satellitenmodus verwendet einen einzelnen standardisierten
NASA-GIBS-WMS-GetMap-Ausschnitt des kuratierten Orts. Angefragt wird zunächst
der robuste UTC-Vortag, bei Bildfehler genau einmal der Tag davor. Die Ansicht
nennt das Aufnahmedatum, sagt ausdrücklich „Nahe-Echtzeit, nicht live“ und
verlinkt den passenden Ausschnitt in NASA Worldview.

- Dienst: `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi`
- Ebene: `MODIS_Terra_CorrectedReflectance_TrueColor`
- Quelle/Protokoll: https://nasa-gibs.github.io/gibs-api-docs/access-basics/
- vertiefende Ansicht: https://worldview.earthdata.nasa.gov/

Die App speichert das Bild nicht, verwendet kein NASA-Logo und behauptet weder
sekundengenaue Aktualität noch eine NASA-Empfehlung der App.

## Lokaler datengetriebener Kern

Die Datenszene reagiert auf Sonnenhöhe/-richtung und zusätzlich auf
Wolkendichte, Luftfeuchte, Sichtweite, kurzwellige Strahlung,
Windgeschwindigkeit und Windrichtung. Diese Rohwerte werden auf eine begrenzte
Menge eigener visueller Zustände abgebildet; es entstehen keine frei
eingesetzten Inline-CSS-Werte. Akute Gefahrencodes und starke Windwerte bleiben
wie zuvor von der Wetterinszenierung ausgeschlossen.

„Dem Licht folgen“ wählt Morgen- beziehungsweise Abendlicht nicht mehr zufällig
aus einer Topliste. Nach der ersten Etappe wird das nächste zeitlich spätere
passende Licht gesucht; nach dem Ende der verfügbaren Runde beginnt die Spur
beim frühesten noch verfügbaren Ereignis neu. Direkte Orts- und
Szenenwiederholungen bleiben ausgeschlossen.

Fallen Open-Meteo, NASA oder Windy aus, bleiben Ortszeit, Sonnenstand,
Lichtreise und die prozedurale Datenszene bedienbar.

## Nicht verwendet

Skyline-Livestreams werden nicht übernommen. Skyline erlaubt öffentlichen
Seiten nach eigener FAQ nur das jeweils bereitgestellte Fünf-Minuten-Fotogramm-
Embed; ein allgemeiner Streamimport wäre nicht von dieser Freigabe gedeckt.
Auch YouTube-Streams werden wegen zusätzlicher Tracking-/Consent- und
Verfügbarkeitsgrenzen nicht verwendet.
