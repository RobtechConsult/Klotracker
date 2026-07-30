# 🧠 Klotracker – Projektwissen & Backlog

> Lebendes Dokument der Projektleitung. Hält Entscheidungen, Learnings, Konventionen
> und den priorisierten Backlog fest. Wird bei jeder größeren Änderung aktualisiert.
>
> Zuletzt aktualisiert: 2026-07-29

---

## 1. Produkt in einem Satz

Eine mobile-first **PWA** zum humorvollen Tracken von Toilettengängen (Stuhlgang &
Wasserlassen) – mit Gewohnheits-Prognose, Regelmäßigkeits-Check und Timer. Alles
**offline & lokal** (localStorage), kein Backend, Datenschutz als Kernwert.

## 2. Architektur & Konventionen

- **Stack:** React 18 + Vite 5, PWA via `vite-plugin-pwa`. Keine externen Chart-Libs
  (Diagramme = handgemachtes SVG/CSS → klein, schnell, offline).
- **Trennung:** Reine, getestete Logik unter `src/lib/` (deterministisch, `now`
  wird reingereicht). UI unter `src/components/`. `App.jsx` = State + Layout.
- **Persistenz:** `localStorage`. Keys versioniert (`klotracker.entries.v1`,
  `…settings.v1`, `…session.v1`). Laufende Timer separat, damit sie App-Neustart
  überstehen (Dauer wird aus `startedAt` berechnet, **nicht** hochgezählt).
- **Datenmodell Entry:** `{ id, ts, type:'stool'|'urine', bristol?, note?, durationSec? }`.
- **Tests:** `node --test` in `src/lib/logic.test.js`. **Vor jedem Commit grün halten.**
- **Ton:** Humor mit Augenzwinkern – aber **Gesundheits-Hinweise bleiben sachlich**
  und tragen immer den Disclaimer „kein Arztersatz".
- **Sprache:** UI & Code-Kommentare auf Deutsch.

## 3. Deployment (wichtig!)

- **Live-URL:** https://robtechconsult.github.io/Klotracker/
- **Weg:** GitHub Actions (`.github/workflows/deploy.yml`) → `actions/deploy-pages`.
  **Source in den Repo-Settings = „GitHub Actions".**
- **Regel: Was auf `main` landet, geht live.** Entwickelt wird auf dem Feature-Branch,
  veröffentlicht per Merge nach `main`.
- **Learnings aus der Einrichtung (damit wir nicht nochmal reinlaufen):**
  - Die `github-pages`-Environment lässt Deployments nur von **`main`** zu – ein
    Feature-Branch wird sofort abgewiesen (Job bekommt keinen Runner). → Immer von
    `main` deployen.
  - Der Workflow-Token (`GITHUB_TOKEN`) darf die **Pages-Quelle NICHT umstellen**
    (`403 Resource not accessible by integration`). Das ist eine einmalige
    Admin-Einstellung im UI.
  - `BASE_PATH` muss der Projekt-Pfad sein (`/Klotracker/`); kommt von
    `actions/configure-pages` (`steps.pages.outputs.base_path`).
  - Aus der Sandbox ist `*.github.io` netzwerkseitig geblockt – Live-Status prüfen
    wir über die **GitHub-API** (Workflow-/Deploy-Status), nicht per Browser.

---

## 4. Umgesetzt

| Datum | Feature | Notiz |
|-------|---------|-------|
| 2026-07-29 | Grundgerüst | Tracking, 24h-Uhr, Wochen-Balken, Bristol, Prognose (KDE), Health-Check, Verlauf, Export, Demo |
| 2026-07-29 | **Timer „Zeit auf dem Thron"** | Start/Stopp, live tickend, überlebt Neustart, Wochen-/Ø-/Rekord-Auswertung, lustige Umrechnungen, Sanity-Guard bei >45 Min |
| 2026-07-29 | A11y-Quick-Wins | Zoom wieder erlaubt, `:focus-visible`, `prefers-reduced-motion`, Badge-Kontrast, Aktiv-Tab-Indikator |
| 2026-07-29 | **Trink-Tracking** (Backlog #2) | Neuer `type:'drink'` (Wasser/Kaffee/Tee/Sonstiges, ml), Tagesziel-Fortschritt, Schnell-Buttons ohne Modal; Hydration fließt in den Health-Check ein (belegt die „mehr trinken"-Hinweise) |
| 2026-07-29 | **Import/Backup** (Backlog #4) | JSON-Import mit Dedup per id (`mergeEntries`/`parseImport`); ergänzt den vorhandenen Export |
| 2026-07-29 | **Startseiten-Hierarchie & Spacing-System** | Timer entschlackt (schlanke Sekundär-Aktion statt Hero), Prognose nach oben; einheitlicher Rhythmus über `.stack` + `--gap` statt gestreuter margins/inline-styles |
| 2026-07-29 | **Eigenes Icon-Set** (`Icon.jsx`) | SVG im Mascot-Stil, `currentColor` → Light/Dark & plattformkonsistent. Ersetzt Emojis in Tabbar (Start/Statistik/Verlauf) und Bristol-Skala 1–7 (Picker, Chart, Verlauf). 💩/💧 bewusst behalten. |
| 2026-07-29 | **Bristol-Auswahl user-freundlich** | Icons größer, dazu **Klartext-Wörter** (hart/klumpig/rissig/ideal/weich/breiig/flüssig) + **Farb-Zonen** (fest/ideal/flüssig) mit Legende → wählbar nach Alltagssprache statt Icon-Deuten. |
| 2026-07-29 | **Eigene Getränke-Icons** | Glas/Tasse/Teetasse/Flasche (blau) statt Emoji (🚰 etc.) in Trink-Karte & Verlauf. |
| 2026-07-29 | **Symptom-Tracking** (Backlog #3) | Optionale Chips (Blut/Schmerzen/Schleim/Blähungen/Drang) im AddModal; sachlicher Warn-Banner bei Blut/Schmerz; fließt in Health-Check (Blut→Alert) & Verlauf ein |
| 2026-07-29 | **Trends & Muster** (Backlog #5) | „Diese Woche vs. letzte" (Stuhlgang/Trinken/Thron-Zeit mit ▲▼%), Ø-Abstand (`averageIntervalHours` jetzt genutzt), aktivster Wochentag |
| 2026-07-29 | **Onboarding** (Backlog #6) | 3-Slide-Einstieg beim ersten Start (Was/Mehrwert/Datenschutz) + „mit Beispieldaten starten"; `settings.onboarded`; in Einstellungen wieder aufrufbar |
| 2026-07-29 | **Gamification/Achievements** (Backlog #8) | 13 Abzeichen aus `achievements.js` (rein/testbar), Raster mit freigeschaltet/gesperrt + Fortschritt, auf dem Statistik-Tab |
| 2026-07-29 | **Individualisierungs-Einstellungen** | Name (Header-Begrüßung), Tagesziel Trinken (Stepper), Design **Auto/Hell/Dunkel** (manuell via `data-theme`, gewinnt über System), Humor an/aus (blendet Sprüche/Quips aus). Settings in „Individualisierung" + „Daten & mehr" gegliedert. |
| 2026-07-29 | **Einstellbare Portionsgrößen** | Pro Getränk (Wasser/Kaffee/Tee/Sonstiges) eigene ml per Stepper (50–1000). Nur Overrides in `settings.drinkSizes`, Defaults zentral in `DRINKS`; wirken sofort auf die Trink-Buttons. |
| 2026-07-29 | **Freundes-Vergleich (Social, serverlos)** | `social.js`: Wochen-Bilanz (nur Aggregate) → URL-sicherer Code/Link (Web Share/Clipboard). Freund-Code einfügen → „Klo-Duell" (Kopf-an-Kopf, Sieger je Metrik). Inbound `#vergleich=`-Link öffnet Vergleich automatisch. Kein Server, keine Rohdaten geteilt. |
| 2026-07-29 | **Arzt-Report als PDF** (Pro) | `report.js`: sachlicher Verlaufsbericht (30 Tage) als druckbares HTML → Browser „Als PDF speichern". KPI-Zusammenfassung, Bristol-Tabelle, Symptom-Warnzeichen (Blut/Schmerz rot markiert), Tagesübersicht, Disclaimer. `reportData` rein/testbar, `renderReportHtml` erzeugt Dokument (Name escaped). Öffnet in neuem Tab. |
| 2026-07-29 | **Store-Packaging vorbereitet (Capacitor)** | `@capacitor/*` (core/cli/ios/android) + `capacitor.config.json` (appId `com.robtechconsult.klotracker`, webDir `dist`). npm-Scripts `app:ios`/`app:android`/`app:sync`. Kauf-Abstraktion `purchases.js` (Produkt-IDs + Web-Fallback, native IAP via RevenueCat vorbereitet), verdrahtet in `buyPro`/`giveTip`. Native Projekte `ios/`/`android/` gitignored (lokal via `cap add`). Vollständige Anleitung: **STORE.md**. Web-Deploy unverändert. |
| 2026-07-29 | **Supporter-Stufen + Trinkgeld** | Kauf-Dialog mit 3 Stufen (🧻/📦/🚛), höhere = extra Trinkgeld; alle schalten Pro frei. Nach dem Kauf dauerhafter Trinkgeld-Bereich (wiederholbar), `settings.tipCount`. Preise Beispiel, real via IAP. |
| 2026-07-29 | **Monetarisierung: Pro + 4-Tage-Trial** | `pro.js`: 4-Tage-Testphase (Start beim ersten Öffnen), danach gesperrt bis Kauf (`settings.proUnlocked`). Pro-Features: **Prognose, Tagesrhythmus, Trends**. Frei bleiben Tracking, Gesundheits-Check, Wochenübersicht, Thron-Zeit, Bristol, Erfolge, Social. Werbefrei-Modell (keine Ad-SDKs). `ProLock`-Teaser + `ProDialog`. Echter Kauf später via native IAP (StoreKit/Play). Bugfix: Modals scrollbar (`max-height/overflow`). |

---

## 5. Backlog (aus Design- & Feature-Reviews)

Zwei Fachreviews wurden eingeholt (App-Designer + Feature-Designer). Kernpunkte,
priorisiert nach Impact/Aufwand.

### 5a. Features (Feature-Designer)

| Prio | Feature | Aufwand | Impact | Kern-Idee |
|------|---------|---------|--------|-----------|
| ★ 1 | **Lokale Erinnerungen/Notifications** | M | Hoch | Zur prognostizierten Cluster-Zeit erinnern (Daten sind da!). Verstärkt den USP. **← nächster logischer Schritt** |
| ✅ 2 | ~~**Trink-Tracking (Wasser/Kaffee)**~~ | M | Hoch | **Erledigt.** Speist jetzt den Health-Check. Nächster Ausbau: Kaffee↔Gang-Korrelation (#5). |
| ✅ 3 | ~~**Symptom-Tracking (Blut/Schmerz/Blähung)**~~ | M | Hoch | **Erledigt.** Chips + Warn-Banner + Health-Check-Integration. |
| ✅ 4 | ~~**Import/Backup** (JSON)~~ | S | Hoch | **Erledigt** (Dedup per id). Optionaler Ausbau: CSV-Export. |
| ✅ 5 | ~~**Insights: Trends**~~ | L | Hoch | **Erledigt** (Basis): Woche-über-Woche, Ø-Abstand, aktivster Tag. Ausbau möglich: Kaffee↔Gang-Korrelation. |
| ✅ 6 | ~~Onboarding (3 Slides)~~ | S | Mittel | **Erledigt.** Settings-Ausbau (Humor-Flag-UI) noch offen. |
| 7 | Arzt-Report als PDF (`window.print()`) | M | Mittel | App wird „sprechstundentauglich". Ton hier sachlich. |
| ✅ 8 | ~~Gamification: Achievements~~ | M | Mittel | **Erledigt.** 13 Abzeichen, rein lokal. |
| 9 | Prognose verbessern | M | Mittel | Intervall-Modell (Zeit seit letztem Gang) + Wochentag; „überfällig"-Status; auch für Urin (Code kann's schon). |
| 10 | Barrierefreiheit vertiefen | S | Mittel | Bristol-Picker `role=radiogroup`, SVG-Charts `aria-label`. |
| — | Später: Profile (Familie/Baby), i18n, Widgets | L | — | Bewusst nach den obigen. |

### 5b. Design (App-Designer)

**Erledigte Quick-Wins** ✅: Zoom erlaubt, Fokus-Ringe, `prefers-reduced-motion`,
Badge-Kontrast (`--*-ink`-Tokens), Aktiv-Tab-Indikator, Tab-Font auf 11px.

**Offen – Hoch (A11y):**
- Dekorative Emojis konsequent `aria-hidden` (teilweise erledigt bei Quick-Buttons).
- Tabs mit `role="tab"`/`aria-selected` auszeichnen.

**Offen – Mittel (Hierarchie/Konsistenz):**
- Einheitliche **Typo-Ramp** in `rem` statt vieler krummer px-Werte (9.5/10.5/12.5).
- **Empty-State für den Statistik-Tab** (aktuell wirken leere Charts „kaputt").
- Persistenter **FAB** zum Eintragen auf allen Tabs (nicht nur Start).
- **Löschen** absichern: Target ≥44px + Undo-Toast statt sofortigem Löschen.
- Inline-Styles → Utility-Klassen/Tokens.
- Prognose-Sternchen `*` erklären (Fußnote „voraussichtlich morgen").
- `.pred`-Overlay im Dark-Mode tokenisieren (aktuell matschig).

**Offen – Niedrig (Feinschliff):**
- 24h-Uhr: feine Stundenticks + Tap-Tooltip.
- DayChart: Werte/Achse zeigen.
- **Mascot** (der Wink-Haufen aus `icon.svg`) in Empty-/Learning-States einsetzen –
  trägt den Humor **visuell**.
- Micro-Feedback (`:active`) auch auf Tiles/Tabs; optional `navigator.vibrate`.

---

## 6. Nächste empfohlene Schritte (PM-Sicht)

1. **Trink-Tracking (#2)** – macht bestehende Health-Check-Aussagen wahr und ist
   Voraussetzung für Insights. Mittlerer Aufwand, breite Wirkung.
2. **Lokale Erinnerungen (#1)** – größter Retention-Hebel, nutzt den vorhandenen
   Prognose-Algorithmus.
3. **Import/Backup (#4)** – kleiner Aufwand, entschärft echtes Datenverlust-Risiko.
4. Parallel die **A11y-/Empty-State-Quick-Wins** aus 5b abarbeiten.

---

## 7. Definition of Done (pro Feature)

- [ ] Logik in `src/lib/` mit Tests (`node --test` grün).
- [ ] UI mobil geprüft (Screenshot), keine Konsolen-Fehler.
- [ ] Ton stimmt (Humor ja, Gesundheit sachlich + Disclaimer).
- [ ] Offline/lokal bleibt gewahrt (kein Netzwerk-Call).
- [ ] README/dieses Dokument aktualisiert.
- [ ] Auf Feature-Branch committen → nach `main` mergen (= live).
