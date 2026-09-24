# 📱 Klopatra im App Store & Play Store veröffentlichen

Die App ist eine React/Vite-App, die mit **Capacitor 8** in native iOS-/Android-Apps
verpackt wird – aus **einer** Codebasis. **Es gibt keine öffentliche Web-Version**;
unter https://klopatra.robtech-consult.de/ liegt nur die Landingpage (`site/`).

> Käufe (Pro / Trinkgeld) laufen über RevenueCat + Store-In-App-Käufe. Im
> Browser (`npm run dev`, nur Entwicklung) schaltet die App lokal frei.

**Entscheidungen (2026-09-24):** Auftritt als **Privatperson** (Robert Krawczyk),
iOS-Build **in der Cloud (Codemagic)**, weil kein Mac vorhanden ist.

---

## 1. Voraussetzungen

- **Node 22+**, **JDK 21**
- **Android:** Android Studio + SDK (lokal unter Windows vorhanden), **Google Play
  Developer Account** (einmalig 25 $)
  - ⚠️ **Neue Privatkonten** müssen vor dem Livegang einen **geschlossenen Test mit
    mind. 12 Testern über 14 Tage** fahren. Tester früh organisieren!
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
- [x] Datenschutzerklärung als Seite vorhanden & in der App verlinkt
- [x] „kein Arztersatz"-Hinweis vorhanden (App, Report, Datenschutz)
- [x] Testphase (4 Tage) & Pro-Gating implementiert
- [x] Kauf-Abstraktion + Capacitor-Config bereit

**Von dir außerhalb des Codes zu erledigen (⬜):**
- [ ] Apple Developer- (99 $/J) & Google-Play-Konto (25 $ einmalig) anlegen
- [ ] Master-Icon 1024×1024 + Splash bereitstellen, Assets generieren (Abschnitt 3)
- [ ] Produkte in beiden Stores + RevenueCat angelegt, Preise gesetzt (Abschnitt 4)
- [ ] `purchases.js` mit RevenueCat aktivieren, echter Kauf **auf Gerät** getestet
- [ ] Platzhalter in `datenschutz.html` ausfüllen + URL als Datenschutz-Link eintragen
- [ ] App-Privacy-Labels ausfüllen („Keine Daten erfasst")
- [ ] Screenshots & Beschreibungstext
- [ ] Version/Build-Nummern setzen, einreichen (TestFlight bzw. Play Testing)
