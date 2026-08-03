# Irgendwo-ist-gerade-Erkenntnisse

## 2026-07-30 – Readiness ist eine Identitätsprüfung

**Beobachtung und Evidenz:** Ein früher Playwright-Lauf akzeptierte auf dem
damaligen Standardport `4173` einen erreichbaren Gravity-Loop-Dienst und prüfte
dadurch eine fremde App. Ein generischer HTTP-200 belegte nur Erreichbarkeit,
nicht App-Identität.

**Änderung und Regression:** Der reservierte Port ist `4316` mit `strictPort`.
Playwright verwendet `reuseExistingServer: false`; der Global-Setup prüft
`status`, `appKey`, `environment` und `readiness` aus
`/health/somewhere-now.json`. Der Abschlusslauf bestand mit 36 ausgeführten
Browserfällen.

**Übertragbarkeit:** Jeder lokale DEV-/E2E-Dienst sollte einen reservierten
Port bei Kollision ablehnen und seine erwartete Identität inhaltlich prüfen.
Die Aussage gilt für parallele MilosApps-Dienste, nicht als Ersatz für
Authentifizierung geschützter Produktionssysteme.

## 2026-07-30 – Kernnutzen und Netzzusatz getrennt modellieren

**Beobachtung und Evidenz:** Ortszeit, Datum und Sonnenstand lassen sich lokal
aus gepflegten Koordinaten und IANA-Zeitzonen bestimmen. Wetter ist dagegen ein
verzögerbarer oder ausfallender Netzzusatz.

**Änderung und Regression:** Die Szene entsteht sofort aus lokalen Daten;
Wetter ergänzt sie mit eigenem Lade-, Alt-, Fehler-, Timeout- und
Gefahrfilterzustand. Der Service Worker cached nur eigene statische Assets,
keine Wetterantworten. Logiktests prüfen Datumsgrenzen und Polartag/-nacht;
Browsertests prüfen Offline-Neuladen, alte Daten, Timeout und Recovery.

**Übertragbarkeit:** Öffentliche Apps werden belastbarer, wenn ihr
unverzichtbarer Nutzen nicht von optionalen APIs abhängt. Die Aussage gilt nur,
wenn lokale Daten fachlich ausreichen; aktuelle Fremddaten dürfen nicht als
lokal aktuell ausgegeben werden.

## 2026-07-30 – Dunkles Design braucht eine eigene Prüfachse

**Beobachtung und Evidenz:** Die helle axe-Prüfung war grün, obwohl eine feste
geerbte Textfarbe im dunklen Systemdesign Titel und Werte nahezu unsichtbar
machte. Die visuelle Desktopprüfung reproduzierte den Fehler.

**Änderung und Regression:** Geerbte Farben folgen Theme-Tokens, und
Faktenüberschriften besitzen ein separates Kontrast-Token. Helles und dunkles
Systemdesign werden nun in allen drei Browserprojekten mit axe geprüft.

**Übertragbarkeit:** Ein einziges Farbschema deckt Kontrastregressionen anderer
Themes nicht ab. Diese Erkenntnis betrifft Apps mit system- oder
nutzergesteuertem Farbschema.

## 2026-07-30 – Mobile Reihenfolge ist Teil der Bedienbarkeit

**Beobachtung und Evidenz:** Auf dem Smartphone lag „Noch einmal“ zunächst
hinter der großen Szene und der Faktenkarte. Die Aktion funktionierte, war aber
im ersten Viewport nicht sichtbar.

**Änderung und Regression:** Im schmalen Layout stehen Einordnung, Aktion und
Status vor der Szene. Ein Browsertest sichert die vollständige Sichtbarkeit der
Primäraktion im initialen Smartphone-, Tablet- und Desktop-Viewport.

**Übertragbarkeit:** Responsive QA sollte nicht nur Überlauf prüfen, sondern
auch, ob die häufigste Aktion ohne Suche erreichbar ist. Die konkrete
Reihenfolge bleibt produktspezifisch.

## 2026-07-30 – Gefahrfilter muss fachlich bescheiden bleiben

**Beobachtung und Evidenz:** Aktuelle Wettercodes können gefährliche Lagen
andeuten, ersetzen aber keine amtliche Warnung.

**Änderung und Regression:** Bei ausgewählten schweren Codes oder sehr starkem
Wind zeigt die App nur Zeit und Tageslicht und erklärt den Verzicht auf
Wetterinszenierung. Tests sichern Code- und Windgrenzen. Die Oberfläche nennt
den Zustand ausdrücklich nicht „Unwetterwarnung“.

**Übertragbarkeit:** Unterhaltungsprodukte sollten sensible Zustände ausblenden
und die Grenze ihrer Quelle transparent machen. Die Schwellen sind eine
Produktmoderation, keine sicherheitskritische Klassifikation.

## 2026-08-01 – Vendor-Lock muss auch den ausgelieferten Build schützen

**Beobachtung und Evidenz:** Die v2.0.3-Shell war im Repository korrekt
gelockt, doch Vite 8 wandelte ihre externe Theme-CSS im Produktionsbuild in
eine `data:`-URL um. Eine echte Response mit `style-src 'self'` blockierte
diese URL; Quelltext- und Lockprüfung allein hätten den Fehler übersehen.

**Änderung und Regression:** Das Bootstrap-Script ist für die HTML-Transformation
mit `vite-ignore` markiert. Ein enger Build-Hook kopiert ausschließlich den
gelockten Vendorordner nach `dist/vendor/…`. Validator, Hashvergleich,
MIME-Prüfung und eine echte CSP-E2E sichern den ausgelieferten Zustand.

**Übertragbarkeit:** Bei vendorten Browserverträgen muss die Prüfung nach dem
Bundler stattfinden. Die Aussage gilt für Artefakte, deren relative URLs oder
Hashes Teil des Vertrags sind; normale App-Module dürfen weiterhin gebündelt
werden.

## 2026-08-01 – CSP-Sicherheit endet nicht an der Shared-Komponente

**Beobachtung und Evidenz:** Nach dem zentralen CSP-Patch setzte die App selbst
Sonnenposition, Szenen-Seed und Partikelwerte noch mit `style.setProperty`.
Auch fachlich legitime Inline-Styles verstoßen gegen eine strikte
`style-src 'self'`-Grenze.

**Änderung und Regression:** Die Szene quantisiert ihre prozeduralen Werte in
endliche `data-*`-Zustände; Positionen, Varianten und Partikelstaffelung liegen
in statischem CSS. Der CSP-Test prüft zusätzlich, dass kein gerendertes
`[style]`-Attribut verbleibt.

**Übertragbarkeit:** Eine CSP-sichere Shell macht nicht automatisch die ganze
App CSP-sicher. Jeder Verbraucher muss eigene Inline-Style-Mutationen separat
auditieren. Die Quantisierung eignet sich für dekorative Visualisierungen,
nicht für fachlich notwendige kontinuierliche Präzision.

## 2026-08-01 – Shadow-DOM-Analyse braucht einen funktionalen Gegenbeweis

**Beobachtung und Evidenz:** Axe 4.12.1 meldet `region` und `skip-link` moderat
am Shadow-Skiplink, weil es den programmatischen Fokuspfad zum slotted
Light-DOM-Main statisch nicht auflösen kann. Der tatsächliche Tastaturpfad ist
funktionsfähig.

**Änderung und Regression:** Die App ignoriert die Regeln nicht global. Der
Test akzeptiert nur exakt diese zwei zentral bewerteten Meldungen am bekannten
Knoten und lässt jede andere Verletzung scheitern. Separat werden Aktivierung,
`tabindex=-1`, Fokus und Sprach-/Reloadzustände geprüft.

**Übertragbarkeit:** Eine begrenzte Toolgrenze darf nicht pauschal alle Regeln
abschalten. Erwartete Meldung, Knoten, Impact, Toolversion und funktionaler
Gegenbeweis müssen gemeinsam dokumentiert sein.

## 2026-08-01 – Blockierte DEV-Felder sind ein atomarer Zustand

**Beobachtung und Evidenz:** Ohne Railway-Service und Domain gibt es weder eine
echte HTTPS-App-URL noch einen externen Healthcheck. Eine lokale oder erfundene
URL würde den Portalvertrag fälschlich als veröffentlichbar erscheinen lassen.

**Änderung und Regression:** `dev.url` und `dev.healthUrl` sowie die externen
Metadatenfelder bleiben gemeinsam `null`; lokale Readiness läuft getrennt auf
Port 4316 mit App-Key-, Umgebungs-, Shell- und Productionprüfung.

**Übertragbarkeit:** URL und Health-URL sollten bei blockierten Apps atomar
fehlen und bei veröffentlichten Apps atomar vorhanden sein. Das gilt nicht für
rein lokale Testpfade, die ausdrücklich außerhalb des Portalvertrags stehen.

## 2026-08-02 – Vendor-Locks müssen bis ins gebaute HTML reichen

**Beobachtung und Evidenz:** Vite erhielt die gelockten Essentials-Dateien im
Repository, bündelte beim ersten Build aber beide extern vorgesehenen
CSS-Verweise. Ein gültiger Quell-Lock belegte damit noch nicht den vereinbarten
Browser-Runtimevertrag.

**Änderung und Regression:** Die HTML-Links bleiben explizit von der
Transformation ausgenommen. Die Build-Prüfung liest das erzeugte `index.html`,
verlangt beide externen Vendor-URLs, verwirft `data:`-Inlining und vergleicht
jedes ausgelieferte Artefakt bytegleich mit Lock und Quellkopie.

**Übertragbarkeit:** Wenn URL-Form, CSP oder MIME-Typ Teil eines vendorten
Vertrags sind, muss das Release-Gate das gebaute Artefakt statt nur den
Quellbaum prüfen. Das gilt nicht für gewöhnliche, bewusst gebündelte App-CSS.

## 2026-08-02 – Erstinstallation braucht explizites transitives Precache

**Beobachtung und Evidenz:** Beim ersten Onlineaufruf wurden neue Vendor-Module
vor aktiver Service-Worker-Kontrolle transitiv importiert. Sie erschienen
dadurch nicht zuverlässig im Cache; ein direkt folgendes Offline-Neuladen
blieb im Ladebildschirm stehen.

**Änderung und Regression:** Alle browserseitig benötigten Shell- und
Essentials-Bootstrap-, Runtime- und CSS-Artefakte stehen explizit im
Install-Precache. Der Paarfall „erster Onlineaufruf → offline → Reload“ läuft
nach der Korrektur grün.

**Übertragbarkeit:** Ein Runtime-Cache allein garantiert bei der
Service-Worker-Erstinstallation keine Offlinefähigkeit transitiver Module.
Explizites Precache ist für eine kleine, gelockte statische Abhängigkeitsmenge
geeignet; große oder dynamische Datenbestände benötigen eine andere Strategie.

## 2026-08-03 – Wiederholungswert braucht fachliche Neuheit und sichtbare Erinnerung

**Beobachtung und Evidenz:** Eine gleichverteilte Ortsauswahl mit fünf nur
gedrehten Hügelprofilen konnte trotz vieler Orte schnell gleichförmig wirken.
Im Vergleich mit sechs Schwester-Apps vermitteln besonders Gravity Loop,
Wolkenpost und Nudelrechner ihren veränderten Zustand sichtbar.

**Änderung und Regression:** Die Auswahl rankt Licht-/Ortszeitübergänge,
vermeidet die letzten sechs Orte und bei ausreichender Auswahl die letzten
fünf von zwölf Szenenprofilen. Sitzungszähler und die letzten drei
Entdeckungen bleiben flüchtig im Arbeitsspeicher. Unit-Tests belegen alle
zwölf Profile im Ortsbestand; der reale Sieben-Klick-Pfad verlangt
sieben Orte und mindestens sechs Profile.

**Übertragbarkeit:** Wiederholungswert sollte nicht nur durch mehr zufällige
Assets entstehen. Eine kleine fachliche Neuheitsregel plus sichtbarer, nicht
zwingend persistenter Verlauf kann Vielfalt verständlich machen. Das konkrete
Fenster und Ranking bleiben produktspezifisch.

## 2026-08-03 – Neue Elemente brauchen explizite mobile Grid-Reihenfolge

**Beobachtung und Evidenz:** `.moment-copy` wird im schmalen Layout zu
`display: contents`; seine Kinder besitzen explizite `order`-Werte. Die neue
Sitzungsinfo hatte zunächst keinen Wert und sprang deshalb vor die H1. Beim
200-%-Reflow überschritt außerdem die lange Primäraktion den Viewport um 3 px.

**Änderung und Regression:** Sitzungsinfo, Reiseverlauf, Nebenaktionen und
Szene erhielten eine lückenlose Reihenfolge. Die Primäraktion besitzt im
schmalen Profil eine begrenzte Breite, umbruchfähigen Text und ein nicht
schrumpfendes Icon. Sichtbare 390-×844-QA sowie 360×800 bei 200 % sind danach
ohne horizontalen Überlauf grün.

**Übertragbarkeit:** `display: contents` plus `order` macht die mobile
Informationshierarchie flexibel, aber neue Geschwister dürfen nicht auf dem
Defaultwert bleiben. Reflowtests müssen reale Langtexte und zusammengesetzte
Icon/Text-Aktionen einschließen.

## 2026-08-03 – Datenschutzinventar trennt Persistenz von flüchtigem Zustand

**Beobachtung und Evidenz:** Die Sprache, der Offline-Cache, die aktuelle Reise
und der optionale Klang haben unterschiedliche Lebenszyklen. Die pauschale
Aussage „lokale Einstellungen“ hätte diese Grenzen verschleiert und einen
Schein-Einwilligungsbanner begünstigt.

**Änderung und Regression:** Das zweckweise Inventar dokumentiert Schlüssel,
Inhalt, Laufzeit und Erforderlichkeit. Nur die Sprachwahl und eigene statische
Offline-Artefakte sind persistent; Reise und Klang bleiben im Arbeitsspeicher.
Es gibt keinen Banner, aber eine dauerhafte Datenschutzverknüpfung.

**Übertragbarkeit:** Apps sollten Cookies, Web Storage, Cache Storage und
flüchtigen Arbeitsspeicher getrennt inventarisieren. Ob eine Information oder
Einwilligung nötig ist, folgt aus dem tatsächlichen Zugriff und Zweck, nicht
aus einem portfolioeinheitlichen Bannerdesign.

## 2026-08-03 – LF-Policies müssen jeden bytegelockten Vendorordner abdecken

**Beobachtung und Evidenz:** Der Essentials-v1.1.2-Vendor blieb im frischen
Windows-Checkout mit `core.autocrlf=true` bytegleich, während der ältere
Shell-v2-Vendor ohne eigene `.gitattributes` umgeschrieben wurde. Sein
portabler Verifier brach deshalb korrekt mit einem JavaScript-Hashfehler ab.

**Änderung und Regression:** Auch der Shell-v2-Vendorordner besitzt nun die
enge Regel `* text eol=lf`. Ein erneuter frischer Windows-Checkout muss beide
portablen Verifier sowie die CRLF-Prüfung aller gelockten Vendorartefakte
bestehen.

**Übertragbarkeit:** Eine LF-Regel in einem neuen Vertrag schützt keine
benachbarten, ebenfalls bytegelockten Vendorordner. Jeder unabhängig gelockte
Vertrag braucht seine eigene enge Policy; gewöhnlicher App-Quelltext bleibt
davon unberührt.

## 2026-08-03 – Unterpfad-DEV braucht zwei Builds und frische Healthdaten

**Beobachtung und Evidenz:** Eine PWA kann lokal an `/` fehlerfrei sein und
unter GitHub Pages dennoch an Manifest-, Share-, Vendor- oder Service-Worker-
Pfaden scheitern. Zusätzlich würde ein precachter Healthcheck nach einem
Rollout möglicherweise den SHA der vorherigen Revision als gesund ausweisen.

**Änderung und Regression:** Ein eigener Pages-Modus mit festem Repository-
Basispfad prüft den Unterpfad, während relative `vite-ignore`-Ressourcen Root
und Pages gemeinsam tragen. App-Shell und gelockte Runtimeassets bleiben
offlinefähig; Health, App-Metadaten und Deploymentidentität werden
network-only beantwortet. Nach dem Artefaktstempel prüft ein zweites Gate den
vollständigen Source-SHA in allen vier Release-Metadaten.

**Übertragbarkeit:** Source-CI, Unterpfad-Build und deploytes Artefakt sind drei
eigene Nachweise. Readiness darf nicht aus demselben langlebigen Offline-Cache
kommen wie die App-Shell, wenn sie eine aktuelle Deployrevision belegen soll.

## 2026-08-03 – Bildstarke Apps brauchen ein eigenes Dichtebudget

**Beobachtung und Evidenz:** Der Momenttitel durfte auf Desktop bis 6,8 rem und
mobil 15 vw wachsen. Dadurch beanspruchte ein kurzer poetischer Satz mehr
visuelles Gewicht als Hauptaktion und prozedurale Szene; Beschreibung und
Bedienung rutschten unnötig nach unten.

**Änderung und Regression:** Titel, Introabstände, Aktionsleiste, Szenenhöhe
und Faktenkarte wurden als zusammenhängende Einstiegshierarchie verdichtet.
Der Momenttitel ist auf Desktop auf höchstens 3,2 rem und mobil auf 8,5 vw
begrenzt. Bedienziele bleiben mindestens 44 px hoch. Ein neues Browsergate
prüft Titelbudgets, Hauptaktion im initialen Viewport und horizontalen Reflow;
die fokussierte Desktop-/Tablet-/Smartphone-Matrix bestand 15 von 15 Fällen.

**Übertragbarkeit:** Große expressive Typografie darf die eigentliche
Produktaktion nicht verdrängen. Ein responsives Dichtebudget sollte Titel,
Erklärung, Hauptaktion und erste Arbeits- oder Erlebnisfläche gemeinsam
betrachten, statt nur einzelne Schriftgrößen zu verkleinern.

## 2026-08-03 – Eine Live-Metapher braucht echte Steuerung und ehrliche Herkunft

**Beobachtung und Evidenz:** Die schmale prozedurale Szene und eine separat
darübergelegte Faktenkarte wirkten statisch, obwohl Zeit, Licht und Wetter
tatsächlich live berechnet werden. Gleichzeitig blieb die Reise trotz gutem
Ranking eine einzige Zufallsaktion; Nutzer konnten ihr Interesse nicht
ausdrücken.

**Änderung und Regression:** Die Szene und ihre Fakten wurden zu einem breiten
Live-Fenster mit sichtbarer Ortszeit, Viewfinder und integrierter Datenleiste
verbunden. Eine zugängliche Auswahl steuert das Ranking jetzt gezielt auf
Überraschung, Morgenlicht, Abendlicht oder Nachtseite. Die Oberfläche sagt
ausdrücklich „keine Kamera“, weil ausschließlich eigene prozedurale Grafik und
erlaubte Daten verwendet werden. Ein Browsergate hält die Hauptaktion bei
kurzen und langen Texten pixelstabil.

**Übertragbarkeit:** Eine Kamera- oder Live-Metapher darf keine fremden Medien
vortäuschen. Sie wird glaubwürdig, wenn Datenherkunft sichtbar ist und der
Nutzer eine fachlich wirksame Auswahl erhält. Bei stabilen Service-Worker-URLs
muss eine solche JS-/CSS-Revision außerdem einen neuen Cache-Namen erhalten.
