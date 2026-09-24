# ✅ Einreichung – Spickzettel (Privacy-Labels & Checkliste)

Klopatra erfasst **keine** Nutzerdaten auf Servern – alles bleibt lokal. Das macht
die Datenschutz-Angaben in beiden Stores angenehm einfach.

---

## 🍎 Apple – App Privacy (App Store Connect → App-Datenschutz)

Frage „Erfasst diese App Daten?" → **Ja** – aber nur eine Kategorie, wegen RevenueCat:

| Datentyp | Zweck | Mit Identität verknüpft? | Tracking? |
|---|---|---|---|
| **Käufe → Kaufverlauf** | App-Funktionalität | Nein | Nein |

Alles andere (Gesundheits-/Tracking-Einträge) bleibt **ausschließlich lokal** auf dem
Gerät, kein Server, kein Konto, keine Analyse- oder Werbe-SDKs. RevenueCat arbeitet mit
einer anonymen, zufälligen App-User-ID; wir setzen keine Nutzer-Attribute.
(So empfiehlt es auch die RevenueCat-Doku „Apple App Privacy“.)

Weitere Apple-Felder:
- **Datenschutzrichtlinie-URL:** https://klopatra.robtech-consult.de/datenschutz.html
- **Altersfreigabe:** 4+ (keine anstößigen Inhalte; humorvoll, keine Medizinberatung)
- **Verschlüsselung (ITSAppUsesNonExemptEncryption):** `NO` in Info.plist setzen
  (App nutzt keine eigene Verschlüsselung → keine Exportfreigabe nötig).

---

## 🤖 Google Play – Data safety (Play Console → Datensicherheit)

- **Werden Nutzerdaten erhoben oder geteilt?** → **Ja, erhoben** (nicht geteilt):
  nur **Finanzdaten → Kaufverlauf** (RevenueCat), Zweck „App-Funktionen“, nicht
  optional. Gesundheitsdaten bleiben lokal und werden **nicht** erhoben.
- **Werden Daten verschlüsselt übertragen?** → Ja (RevenueCat nutzt HTTPS).
- **Können Nutzer Löschung anfordern?** → Ja – lokal über „Alle Daten löschen"
  bzw. App-Deinstallation.
- **Datenschutzerklärung-URL:** https://klopatra.robtech-consult.de/datenschutz.html
- **Inhaltseinstufung (Fragebogen):** keine Gewalt/Sexualität/Drogen; Humor.
  Ergebnis voraussichtlich USK 0 / PEGI 3.
- **App-Zugriff:** keine Anmeldung nötig (keine Testzugangsdaten erforderlich).
- **Regierungs-App / Finanz-App:** Nein.

---

## 📋 Assets in diesem Ordner

| Datei | Zweck |
|---|---|
| `klopatra-icon-1024.png` | **Store-Icon-Master** (1024×1024, quadratisch, ohne runde Ecken). Für `npx capacitor-assets generate` bzw. direkten Upload. |
| `klopatra-icon-rounded-preview.png` | Nur Vorschau/Marketing (mit runden Ecken) – **nicht** in den Store hochladen. |
| `shot-01-home.png` … `shot-04-history.png` | Screenshots in 1290×2796 (iPhone 6,7″). Für Google Play direkt nutzbar (≥1080 px). Für weitere Apple-Größen bei Bedarf skalieren. |
| `STORE_LISTING.md` | Alle Listing-Texte (DE/EN), Keywords, Kategorien, IAP-Namen. |

> **Screenshot-Größen:** Apple verlangt mindestens den 6,7″-Satz (haben wir).
> Optional zusätzlich 6,5″ (1242×2688) und 5,5″ (1242×2208) – kann ich bei Bedarf
> mitgenerieren. Google Play: 2–8 Screenshots, min. 320 px, unsere passen.

---

## 🚦 Finale Checkliste vor „Submit"

**Vorbereitet (in diesem Repo):**
- [x] Datenschutzerklärung ausgefüllt & live verlinkt
- [x] Icon-Master 1024×1024
- [x] Store-Texte (DE/EN) + Keywords + Kategorien
- [x] Screenshots (6,7″)
- [x] „kein Arztersatz"-Hinweis in App, Report & Datenschutz
- [x] Käufe wiederherstellen vorhanden

**Von dir zu erledigen:**
- [ ] Apple- & Google-Entwicklerkonto aktiv
- [ ] IAP-Produkte + RevenueCat angelegt, `purchases.js` aktiviert, Kauf auf Gerät getestet
- [ ] `npx cap add ios/android`, Build in Xcode/Android Studio
- [ ] Icons/Splash via `npx capacitor-assets generate` (Master: `store/klopatra-icon-1024.png`)
- [ ] Info.plist: `ITSAppUsesNonExemptEncryption = NO`
- [ ] Privacy-Labels wie oben ausgefüllt
- [ ] Listing-Texte & Screenshots hochgeladen
- [ ] TestFlight / Play Internal Testing → Review → Release
