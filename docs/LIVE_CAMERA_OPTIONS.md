# Entscheidungsnotiz: echte Livekameras

Stand: 3. August 2026. Diese Notiz dokumentiert Optionen; sie aktiviert keine
fremden Medien und ändert den aktuellen Produktvertrag nicht.

## Aktuelle Grenze

Die App ist heute eine statische, vollständig öffentliche PWA ohne Backend und
ohne fremde Webcams oder Medien. Das Live-Fenster kombiniert eigene
prozedurale Grafik mit Ortszeit, Sonnenstand und Wetterdaten. Eine echte Kamera
würde Medienlizenz, Drittanbieter-Netzwerkzugriff, CSP, Datenschutz,
Ausfallverhalten und Moderation als neue Produktgrenzen einführen.

## Empfohlener Kameraweg: kuratierte Windy-Einbettungen

Windy bietet offiziell konfigurierbare Webcam-Einbettungen an und erklärt für
den Embed, keine Cookies oder sonstiges Tracking zu verwenden:
https://embed.windy.com/config/webcam

Für „Morgenlicht“, „Abendlicht“ und „Nachtseite“ wäre die kleinste wartbare
Lösung kein unkontrolliertes Web-Scraping, sondern eine app-eigene kuratierte
Liste von etwa 12 bis 20 überprüften Kameras:

1. Für jede Kamera werden Windy-Embed-URL, Ort, Zeitzone, Betreiberhinweis und
   letzter manueller Prüfzeitpunkt festgehalten.
2. Die bestehende Sonnenstandslogik wählt aus dieser Liste nur Orte, deren
   aktuelle Lichtphase zur Nutzerwahl passt.
3. Vor dem Laden bleibt die eigene prozedurale Szene sichtbar. Erst die
   ausdrückliche Aktion „Livekamera laden“ baut die Drittverbindung auf.
4. Fällt der Embed aus oder passt das Bild nicht mehr, bleibt die eigene Szene
   als ehrlicher Fallback erhalten.
5. Windy-Herkunft und Link bleiben sichtbar; Bilder werden weder kopiert noch
   zwischengespeichert oder überlagert.

Dieser Weg benötigt keinen öffentlich sichtbaren API-Schlüssel. Für eine
vollständig dynamische weltweite Suche wäre dagegen die Webcams API nötig.
Windy verlangt einen API-Key, kurzlebige Bild-URLs und Links beziehungsweise
Attribution; die Bedingungen und Preisgrenzen stehen hier:
https://api.windy.com/webcams/docs
https://api.windy.com/webcams/terms
https://api.windy.com/webcams/pricing

Ein API-Schlüssel gehört nicht in die statische Pages-App. Eine dynamische
Suche würde deshalb einen app-eigenen Proxy/Backend-Lifecycle erfordern.

## Nicht bevorzugt: YouTube-Livestreams

YouTube erlaubt offizielle IFrame-Einbettungen und bietet einen
Privacy-Enhanced-Host. Der Player teilt dennoch Daten mit YouTube, benötigt
einen Referrer und unterliegt API-, Branding-, Größen- und Consentregeln. Ein
Kanal kann die Einbettung außerdem später deaktivieren. Für die aktuelle
no-cookies-/Static-PWA-Grenze ist das schwerer sauber zu betreiben als ein
kuratierter Windy-Embed.

Offizielle Nachweise:

- https://support.google.com/youtube/answer/171780
- https://developers.google.com/youtube/player_parameters
- https://developers.google.com/youtube/terms/required-minimum-functionality

## Medienfreie Alternative

Falls die Grenze „keine fremden Medien“ bestehen bleibt, sollte das Live-Fenster
nicht wie eine Kamera wirken, sondern sichtbar zu einem „Live-Atlas“ werden:

- kleine Tag-/Nacht-Weltkugel mit Route zum ausgewählten Ort;
- animierte Wolken-, Wind-, Regen-, Nebel- und Sichtweitenebenen aus vorhandenen
  Daten, vollständig selbst gezeichnet;
- Sonnenaufgangs-/Sonnenuntergangs-Countdown und Lichtkurve;
- Mondphase, Sterne und Stadtlichtintensität lokal berechnet;
- Vergleich „hier“ gegen „dort“ ohne Nutzerstandort, beispielsweise Berliner
  Referenzzeit gegen Ortszeit;
- Zeitreise-Regler von jetzt bis zur nächsten Lichtphase, ohne fremde Bilder.

Diese Alternative behält Offlinefähigkeit, no-cookies und den statischen
Pages-Lifecycle. Sie ist weniger unmittelbar als eine Kamera, aber deutlich
lebendiger als eine einzelne abstrakte Szene und vollständig unter eigener
Gestaltungs- und Ausfallkontrolle.
