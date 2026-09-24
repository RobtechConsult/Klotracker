# 📱 Klopatra im App Store & Play Store veröffentlichen

Die App ist eine React/Vite-App, die mit **Capacitor 8** in native iOS-/Android-Apps
verpackt wird – aus **einer** Codebasis. **Es gibt keine öffentliche Web-Version**;
unter https://klopatra.robtech-consult.de/ liegt nur die Landingpage (`site/`).

> Käufe (Pro / Trinkgeld) laufen über RevenueCat + Store-In-App-Käufe. Im
> Browser (`npm run dev`, nur Entwicklung) schaltet die App lokal frei.

**Entscheidungen (2026-09-24):** Apple als **Individual / Sole Proprietor**
(Robert Krawczyk), Google als **Organisation** über das angemeldete Gewerbe
(D-U-N-S), iOS-Build **in der Cloud (Codemagic)**, weil kein Mac vorhanden ist.
Provision: Apple **Small Business Program** + Google **15 %-Stufe** → 15 % statt 30 %.

---

## 1. Voraussetzungen

- **Node 22+**, **JDK 21**
- **Android:** Android Studio + SDK (lokal unter Windows vorhanden), **Google Play
  Developer Account** (einmalig 25 $)
  - Wir registrieren als **Organisation** (Gewerbe + D-U-N-S). Grund: **Neue
    Privatkonten** müssten vor dem Livegang einen **geschlossenen Test mit mind.
    12 Testern über 14 Tage** fahren – das entfällt für Organisationen.
- **iOS:** **Apple Developer Account** (99 $/Jahr) + **Codemagic**-Konto (kostenlos,
  500 Mac-Minuten/Monat). Kein Mac nötig.
- **EU-Händlerstatus (DSA):** Weil die App In-App-Käufe verkauft, bist du in beiden
  Stores „Händler“ → Adresse, Telefon und E-Mail werden im EU-Store öffentlich
  angezeigt.

## 2. Native Projekte

`ios/` und `android/` sind **eingecheckt** (mit Icons, Splash, Info.plist-Anpassungen:
Sprache `de`, nur iPhone, nur Hochformat, `ITSAppUsesNonExemptEncryption = NO`).

```bash
npm run app:sync         # vite build + cap sync (nach jeder Code-Änderung)
npm run app:android      # … + Android Studio öffnen

# Android-Test-APK ohne Android Studio (JAVA_HOME = JDK 21):
cd android && ./gradlew assembleDebug   # → app/build/outputs/apk/debug/app-debug.apk
```

`capacitor.config.json`: `appId = com.robtechconsult.klopatra`, `appName = Klopatra`,
`webDir = dist`.

### iOS-Build in der Cloud (Codemagic)

`codemagic.yaml` enthält den Workflow **„iOS → TestFlight“** (manuell starten).
Einmalig einrichten:
1. App Store Connect → Benutzer und Zugriff → Integrationen → **API-Key** (Rolle
   „App Manager“) erstellen, `.p8` herunterladen.
2. Codemagic → Teams → Integrations → **App Store Connect** → Key hochladen,
   Name **`klopatra_asc`**.
3. Codemagic → App → Environment variables → Gruppe **`revenuecat`** mit
   `VITE_RC_IOS_KEY`.
4. Nach Anlage der App in App Store Connect die numerische **Apple-ID** in
   `codemagic.yaml` (`APP_STORE_APPLE_ID`) eintragen.

## 3. App-Icon & Splash

Quellen liegen in `assets/` (Icon aus `store/klopatra-icon-1024.png`, Splash hell/
dunkel). Neu erzeugen:

```bash
npx capacitor-assets generate --ios --android --iconBackgroundColor '#fdf6ec' --iconBackgroundColorDark '#1a1613' --splashBackgroundColor '#fdf6ec' --splashBackgroundColorDark '#1a1613'
```

## 4. In-App-Käufe (empfohlen: RevenueCat)

RevenueCat vereinfacht Kauf, Wiederherstellung & Beleg-Prüfung für iOS+Android
und hat einen kostenlosen Tarif. Die App-Seite ist bereits vorbereitet – es muss
nur **eine Datei** (`src/lib/purchases.js`) mit echten Aufrufen gefüllt werden.

**4.1 Produkte in den Stores anlegen** (IDs exakt wie in `src/lib/purchases.js`):

| Produkt-ID | Typ | Zweck | Beispiel-Preis |
|---|---|---|---|
| `klopatra.pro.roll` | non-consumable | Pro-Unlock (Stufe „Eine Rolle") | 2,99 € |
| `klopatra.pro.pack` | non-consumable | Pro-Unlock (Stufe „6er-Pack") | 4,99 € |
| `klopatra.pro.bulk` | non-consumable | Pro-Unlock (Stufe „Großpackung") | 9,99 € |
| `klopatra.tip.roll` | consumable | Trinkgeld (wiederholbar) | 1,99 € |
| `klopatra.tip.pack` | consumable | Trinkgeld (wiederholbar) | 4,99 € |
| `klopatra.tip.bulk` | consumable | Trinkgeld (wiederholbar) | 9,99 € |

- **App Store Connect:** Features → In-App-Käufe → je Produkt anlegen.
- **Play Console:** Monetarisierung → Produkte (In-App-Produkte für consumables,
  „Nicht-verbrauchbar" gibt es bei Google nicht → non-consumables als verwaltete
  Produkte, die App merkt sich den Besitz über RevenueCat/Entitlement).

**4.2 RevenueCat konfigurieren**
- Projekt anlegen, iOS- & Android-App verknüpfen (Bundle-IDs, Play-Service-Account,
  App-Store-Shared-Secret).
- **Entitlement `pro`** anlegen und die drei `klopatra.pro.*`-Produkte damit
  verknüpfen (alle drei schalten dasselbe Pro frei).
- Ein **Offering** mit allen sechs Produkten anlegen.
- iOS- & Android-**API-Keys** kopieren.

**4.3 Plugin & Keys** ✅ **Code fertig** – `@revenuecat/purchases-capacitor` ist
eingebunden, `src/lib/purchases.js` kauft direkt per Produkt-ID
(`getProducts` → `purchaseStoreProduct`, kein Offering nötig), prüft das
Entitlement `pro` und gleicht es beim App-Start ab (Neuinstallation → Pro wieder da).
Fehlt nur noch: die **öffentlichen SDK-Keys** aus RevenueCat in `.env.local`
(Vorlage `.env.example`) bzw. als Codemagic-Variable eintragen.

**4.4 „Käufe wiederherstellen"** ✅ **erledigt** – Button ist im Pro-Dialog und
unter Einstellungen → Rechtliches vorhanden und ruft `restore()` auf. Sobald
RevenueCat aktiv ist (4.3), funktioniert er nativ automatisch.

## 5. Datenschutz (unser USP – ernst nehmen)

- **App-Privacy-Labels:** „Keine Daten erfasst" – die Tracking-Daten bleiben
  lokal auf dem Gerät, kein Server, kein Werbe-SDK.
- **Datenschutzerklärung** (Pflicht in beiden Stores): ✅ Seite vorhanden unter
  `public/datenschutz.html` (in der App verlinkt: Einstellungen → Rechtliches).
  Wird via GitHub Pages automatisch mitveröffentlicht, öffentliche URL lautet
  dann `https://klopatra.robtech-consult.de/datenschutz.html`. **Noch zu tun:**
  die Platzhalter `[DEIN NAME/FIRMA]`, Anschrift, `[DEINE-KONTAKT-EMAIL]` und
  `[DATUM]` in der Datei ausfüllen (rechtlich verpflichtend) und diese URL in
  App Store Connect / Play Console als Datenschutz-Link eintragen.
- **Keine** ATT/Tracking-Dialoge nötig, da kein Tracking.

## 6. Store-Listing

- Screenshots (Start, Prognose, Statistik, Report), kurzer Beschreibungstext,
  Keywords. Ton „mit Augenzwinkern", aber **keine medizinischen Heilaussagen**.
- Kategorie: Gesundheit & Fitness (oder Lifestyle).
- Hinweis „kein Arztersatz" in der Beschreibung (steht auch in der App).

## 7. Versionierung & Release

- Version in `package.json` pflegen; iOS `CFBundleShortVersionString` /
  Android `versionName` in den nativen Projekten anheben (oder via Script).
- iOS: Archive → App Store Connect → **TestFlight** → Review → Release.
- Android: **Internal Testing** → Closed/Open Testing → Production.

## 8. Checkliste vor Einreichung

**Im Code erledigt (✅):**
- [x] „Käufe wiederherstellen" vorhanden (Pro-Dialog + Einstellungen)
- [x] Datenschutzerklärung ausgefüllt, live unter der Domain, in der App verlinkt
- [x] „kein Arztersatz"-Hinweis vorhanden (App, Report, Datenschutz, Landingpage)
- [x] Testphase (4 Tage) & Pro-Gating implementiert
- [x] Capacitor 8, ios/ + android/ mit Icons & Splash, Android-Build lokal getestet
- [x] RevenueCat in `purchases.js` verdrahtet (fehlen nur die SDK-Keys)
- [x] Codemagic-Workflow für iOS → TestFlight (`codemagic.yaml`)

**Konten (DU):**
- [ ] **Apple Developer Program** als *Individual / Sole Proprietor* (99 $/Jahr).
      Anbietername im Store = bürgerlicher Name. Apple akzeptiert als „Organisation“
      nur juristische Personen (GmbH/UG), nicht das Einzelgewerbe.
- [ ] **D-U-N-S-Nummer** für das Gewerbe beantragen (kostenlos, 1–2+ Wochen) über
      https://developer.apple.com/enroll/duns-lookup/ – Name/Adresse exakt wie in der
      Gewerbeanmeldung.
- [ ] **Google Play Console als Organisation** anlegen, *sobald die D-U-N-S da ist*
      (25 $). Vorher **kein** Privatkonto anlegen – der Kontotyp lässt sich nicht
      wechseln. Vorteil: kein Pflicht-Test mit 12 Testern × 14 Tage.
      Vorher: 2-Faktor-Authentifizierung für das Google-Konto aktivieren.

**Provision sparen (DU, direkt nach Freischaltung der Konten):**
- [ ] 💰 **Apple: App Store Small Business Program** beantragen
      (https://developer.apple.com/app-store/small-business-program/) →
      **15 % statt 30 %** Provision (bis 1 Mio. $ Umsatz/Jahr). Gilt erst ab Aufnahme,
      nicht rückwirkend → **vor dem ersten Verkauf** beantragen!
- [ ] 💰 **Google: 15 %-Stufe** für die ersten 1 Mio. $ Umsatz/Jahr – in der Play
      Console prüfen, ob sie aktiv ist bzw. aktiviert werden muss (Kontogruppe).
- [ ] Apple **Paid Apps Agreement** (Schedule 2) akzeptieren + Bank- & Steuerdaten
      in App Store Connect hinterlegen – ohne das funktionieren keine In-App-Käufe
      (auch nicht in TestFlight).
- [ ] Google **Zahlungsprofil** (Bank, Steuer) in der Play Console einrichten.
- [ ] **EU-Händlerstatus (DSA)** in beiden Stores als „Händler“ angeben (Adresse,
      Telefon, E-Mail werden öffentlich angezeigt).

**Store-Setup (gemeinsam):**
- [ ] App in App Store Connect + Play Console anlegen (Bundle-ID `com.robtechconsult.klopatra`)
- [ ] Die 6 In-App-Produkte in beiden Stores anlegen, Preise setzen (Abschnitt 4.1)
- [ ] RevenueCat: Projekt, Apps, Entitlement `pro`, SDK-Keys → `.env.local` + Codemagic
- [ ] Echter (Test-)Kauf **auf Gerät** geprüft (iOS Sandbox / Play Lizenztester)
- [ ] Privacy-Labels / Datensicherheit laut `store/SUBMISSION.md` („Kaufverlauf“)
- [ ] Screenshots & Texte aus `store/STORE_LISTING.md` hochladen
- [ ] Signierter Android-Build (Upload-Key sicher aufbewahren!) → interner Test
- [ ] iOS-Build per Codemagic → TestFlight
- [ ] Einreichen → Review → Release
