# 📱 Klotracker im App Store & Play Store veröffentlichen

Die App ist eine React/Vite-PWA. Für die Stores wird sie mit **Capacitor** in
native iOS-/Android-Hüllen verpackt – aus **einer** Codebasis. Die Web-Version
(GitHub Pages) läuft unverändert weiter.

> Web bleibt gratis & werbefrei. Käufe (Pro / Trinkgeld) laufen **nur nativ**
> über die Store-In-App-Käufe. Im Web schaltet die App lokal frei (Testbetrieb).

---

## 1. Voraussetzungen (lokal, nicht im Web-Sandbox)

- **Node 20+**
- **iOS:** macOS + **Xcode**, **CocoaPods** (`sudo gem install cocoapods`), ein
  **Apple Developer Account** (99 $/Jahr)
- **Android:** **Android Studio** (+ JDK 17), ein **Google Play Developer
  Account** (einmalig 25 $)

## 2. Native Projekte erzeugen & starten

Die Ordner `ios/` und `android/` sind **nicht eingecheckt** – einmalig anlegen:

```bash
npm install
npm run build            # erzeugt dist/ mit relativem Basispfad (für App korrekt)
npx cap add ios          # legt ios/ an  (danach: cd ios/App && pod install)
npx cap add android      # legt android/ an

# Danach im Alltag: bauen, syncen, in der IDE öffnen
npm run app:ios          # vite build + cap sync ios + Xcode öffnen
npm run app:android      # vite build + cap sync android + Android Studio öffnen
```

`capacitor.config.json` ist gesetzt: `appId = com.robtechconsult.klotracker`,
`appName = Klotracker`, `webDir = dist`.

## 3. App-Icon & Splash

Ein Master-Icon (1024×1024 PNG) + Splash bereitstellen und generieren lassen:

```bash
npm i -D @capacitor/assets
npx capacitor-assets generate --iconBackgroundColor '#fdf6ec' --splashBackgroundColor '#fdf6ec'
```

(Vorlage: unser Mascot aus `public/icon.svg` als PNG rendern.)

## 4. In-App-Käufe (empfohlen: RevenueCat)

RevenueCat vereinfacht Kauf, Wiederherstellung & Beleg-Prüfung für iOS+Android
und hat einen kostenlosen Tarif. Die App-Seite ist bereits vorbereitet – es muss
nur **eine Datei** (`src/lib/purchases.js`) mit echten Aufrufen gefüllt werden.

**4.1 Produkte in den Stores anlegen** (IDs exakt wie in `src/lib/purchases.js`):

| Produkt-ID | Typ | Zweck | Beispiel-Preis |
|---|---|---|---|
| `klotracker.pro.roll` | non-consumable | Pro-Unlock (Stufe „Eine Rolle") | 2,99 € |
| `klotracker.pro.pack` | non-consumable | Pro-Unlock (Stufe „6er-Pack") | 4,99 € |
| `klotracker.pro.bulk` | non-consumable | Pro-Unlock (Stufe „Großpackung") | 9,99 € |
| `klotracker.tip.roll` | consumable | Trinkgeld (wiederholbar) | 1,99 € |
| `klotracker.tip.pack` | consumable | Trinkgeld (wiederholbar) | 4,99 € |
| `klotracker.tip.bulk` | consumable | Trinkgeld (wiederholbar) | 9,99 € |

- **App Store Connect:** Features → In-App-Käufe → je Produkt anlegen.
- **Play Console:** Monetarisierung → Produkte (In-App-Produkte für consumables,
  „Nicht-verbrauchbar" gibt es bei Google nicht → non-consumables als verwaltete
  Produkte, die App merkt sich den Besitz über RevenueCat/Entitlement).

**4.2 RevenueCat konfigurieren**
- Projekt anlegen, iOS- & Android-App verknüpfen (Bundle-IDs, Play-Service-Account,
  App-Store-Shared-Secret).
- **Entitlement `pro`** anlegen und die drei `klotracker.pro.*`-Produkte damit
  verknüpfen (alle drei schalten dasselbe Pro frei).
- Ein **Offering** mit allen sechs Produkten anlegen.
- iOS- & Android-**API-Keys** kopieren.

**4.3 Plugin einbinden & `purchases.js` aktivieren**
```bash
npm i @revenuecat/purchases-capacitor
npx cap sync
```
Dann in `src/lib/purchases.js` die drei markierten Stellen aktivieren
(`initPurchases`, `purchase`, `restore`) – der Code steht bereits als Kommentar
dort. Kurz:
```js
import { Purchases } from '@revenuecat/purchases-capacitor'
// initPurchases(): await Purchases.configure({ apiKey: platform()==='ios' ? RC_IOS : RC_ANDROID })
// purchase(id):   Offering-Package finden -> Purchases.purchasePackage(...) -> Entitlement prüfen
// restore():      Purchases.restorePurchases() -> Entitlement 'pro' prüfen
```
Bei erfolgreichem Kauf setzt die App-Logik `settings.proUnlocked` (schon
verdrahtet in `App.jsx` → `buyPro`/`giveTip`).

**4.4 „Käufe wiederherstellen"** ist Pflicht für die App-Store-Freigabe – einen
Button ergänzen, der `restore()` aufruft (Platz: Pro-Dialog).

## 5. Datenschutz (unser USP – ernst nehmen)

- **App-Privacy-Labels:** „Keine Daten erfasst" – die Tracking-Daten bleiben
  lokal auf dem Gerät, kein Server, kein Werbe-SDK.
- **Datenschutzerklärung** (Pflicht in beiden Stores): kurze Seite hosten
  (z. B. auf GitHub Pages) – Kernaussage: lokale Speicherung, keine Weitergabe;
  Käufe werden von Apple/Google bzw. RevenueCat abgewickelt.
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

- [ ] Produkte in beiden Stores + RevenueCat angelegt, Preise gesetzt
- [ ] `purchases.js` aktiviert, echter Kauf **auf Gerät** getestet (Sandbox/Test-Track)
- [ ] „Käufe wiederherstellen" vorhanden
- [ ] Icon & Splash generiert
- [ ] Datenschutzerklärung verlinkt, Privacy-Labels ausgefüllt
- [ ] Screenshots & Beschreibung
- [ ] „kein Arztersatz"-Hinweis vorhanden
- [ ] Testphase (4 Tage) & Pro-Gating auf Gerät verifiziert
