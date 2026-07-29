# 🚽 Klotracker

**Die Toiletten-Tracking-App mit Augenzwinkern.**
Trag deine Toilettengänge ein, sieh dein Muster bildlich, lass dir die nächste
wahrscheinliche Sitzung vorhersagen – und bekomm dabei Tipps mit einer
ordentlichen Portion Humor. 💩💧

> ⚕️ **Kein Arztersatz.** Klotracker gibt Orientierung, keine Diagnose. Bei
> anhaltenden Beschwerden, Blut im Stuhl oder starken Schmerzen: bitte ärztlich
> abklären lassen.

---

## Das Konzept

Eine **mobile-first Progressive Web App (PWA)** – installierbar auf dem
Startbildschirm, offline nutzbar, und komplett **ohne Server**: alle Daten
bleiben per `localStorage` auf dem Gerät. Was aufs Klo geht, bleibt auf dem Klo.

### Was die App kann

| Feature | Beschreibung |
|---|---|
| **Schnell-Tracking** | Zwei große Buttons: *Stuhlgang* 💩 und *Wasserlassen* 💧. Ein Tipp, fertig. |
| **Details (optional)** | Uhrzeit anpassen, **Bristol-Konsistenz** (Typ 1–7) und Notiz. |
| **Timer „Zeit auf dem Thron"** ⏱️ | Sitzung starten & stoppen; am Ende die Wochen-Gesamtzeit auf dem Klo – inkl. Ø-Dauer, Rekord und lustiger Umrechnung. Überlebt App-Neustarts. |
| **Trink-Tracking** 💧 | Wasser/Kaffee/Tee mit einem Tipp erfassen, Tagesziel-Fortschritt sehen – fließt in den Gesundheits-Check ein (belegt die „mehr trinken"-Hinweise). |
| **Export & Backup-Import** | Daten als JSON exportieren und wieder importieren (Dedup) – für Gerätewechsel & Sicherung. |
| **Bildliche Visualisierung** | Radiale **24-Stunden-Uhr** (wann ist bei dir was los?), Wochen-Balkendiagramm, Bristol-Verteilung. |
| **Gewohnheits-Algorithmus** | *„Nächster wahrscheinlicher Stuhlgang **XX:XX Uhr**"* inkl. Zeitfenster und Sicherheits-Score. |
| **Regelmäßigkeits-Check** | Erkennt *zu oft* / *zu selten* und flüssige/harte Konsistenz – mit ehrlichem Kern, humorvoll verpackt. |
| **Humor** | Zufällige Sprüche und kontextabhängige Tipps mit Augenzwinkern. |
| **Privat** | Kein Login, kein Server, kein Tracking. Export als JSON möglich. |

---

## Der Gewohnheits-Algorithmus 🔮

Die Kernfrage: *„Wann muss ich als Nächstes wahrscheinlich?"*

Menschen (und Därme) sind Gewohnheitstiere. Der Algorithmus (`src/lib/prediction.js`)
funktioniert so:

1. **Der Tag ist ein Kreis.** 23:59 liegt direkt neben 00:00 – deshalb rechnen
   wir auf einem 1440-Minuten-Ring, nicht auf einer geraden Linie.
2. **Kernel Density Estimation.** Über jede vergangene Stuhlgang-Uhrzeit legen
   wir einen weichen Gauß-„Hügel" (σ ≈ 50 Min). Wo sich viele Hügel überlagern,
   entsteht ein **Gipfel** = eine typische Klo-Zeit.
3. **Cluster-Erkennung.** Lokale Maxima auf dem Ring werden zu Zeit-Clustern.
   Jeder Cluster kennt seine Stärke, Streuung und seinen Anteil an allen Gängen.
4. **Nächster Termin.** Der erste bedeutende Cluster *nach dem aktuellen
   Zeitpunkt* (ggf. morgen) ist die Vorhersage.
5. **Sicherheits-Score.** Aus Cluster-Stärke, Streubreite, Anteil und
   Datenmenge – ehrlich niedrig, solange wenig Daten da sind.

Erst ab **4 Stuhlgängen** startet die Prognose („die Kristallkugel braucht
Futter"). Ist kein Muster erkennbar, sagt die App das ehrlich: *„Dein Darm ist
ein Freigeist." 🎲*

---

## Der Regelmäßigkeits-Check 🩺

`src/lib/tips.js` bewertet Muster gegen bewusst konservative Richtwerte:

- **Stuhlgang:** normal zwischen **3×/Woche und 3×/Tag**.
  Darüber → *„ganz schön häufig unterwegs"* (Alert). Darunter → Verstopfungs-Hinweis.
- **Bristol-Konsistenz:** überwiegend Typ 1–2 (hart) → mehr trinken;
  Typ 6–7 (flüssig) → beobachten; Typ 3–5 → Lehrbuch. ✨
- **Wasserlassen:** grob **4–9×/Tag** üblich – Wüstenmodus oder Dauer-Drang
  werden erkannt.

Ampel-Logik: `good` / `watch` / `alert`. Immer mit Humor, immer mit dem Hinweis,
dass die App keine Ärztin ersetzt.

---

## Technik & Architektur

- **React 18 + Vite** · **vite-plugin-pwa** (Service Worker, Offline, Installierbarkeit)
- **Keine Backend-Abhängigkeit**, keine externen Chart-Libs – Diagramme sind
  handgemachtes SVG/CSS (klein & schnell).
- Reine, testbare Logik-Module unter `src/lib/`.

```
src/
├─ App.jsx                # Layout, Tabs (Start/Statistik/Verlauf), State
├─ lib/
│  ├─ storage.js          # localStorage-Persistenz + Export
│  ├─ stats.js            # Statistik (rein, deterministisch)
│  ├─ prediction.js       # Gewohnheits-Algorithmus (KDE auf Tages-Ring)
│  ├─ tips.js             # Gesundheits-Check + Sprüche + Bristol-Skala
│  ├─ demo.js             # Beispieldaten mit erkennbarer Gewohnheit
│  └─ logic.test.js       # Unit-Tests (node:test)
└─ components/            # PredictionCard, HourClock, DayChart,
                          # BristolChart, HealthCheck, History, AddModal
```

---

## Loslegen

```bash
npm install
npm run dev        # Entwicklungsserver (http://localhost:5173)
npm test           # Logik-Tests (node:test)
npm run build      # Produktions-Build inkl. PWA-Service-Worker
npm run preview    # Build lokal ansehen
```

**Als App aufs Handy:** Seite im mobilen Browser öffnen → *„Zum Startbildschirm
hinzufügen"*. Läuft dann wie eine native App, auch offline.

**Zum Ausprobieren:** In den Einstellungen (⚙️) *„Beispieldaten laden"* – dann
sind Diagramme und Prognose sofort mit einem realistischen 3-Wochen-Muster
gefüllt.

---

## Als Website veröffentlichen (GitHub Pages)

Der Workflow `.github/workflows/deploy.yml` baut, testet und deployt die App bei
jedem Push auf **`main`** über **GitHub Actions** (`actions/deploy-pages`).

**Einmalige Einstellung:** Settings → Pages → **Source: „GitHub Actions"**.

Danach gilt: **Was auf `main` landet, geht live.** Die App ist erreichbar unter:

**https://robtechconsult.github.io/Klotracker/**

Entwickelt wird auf dem Feature-Branch; zum Veröffentlichen wird nach `main`
gemergt.

---

_Made mit 💛 und einer Rolle Klopapier. Klotracker ist keine medizinische App._
