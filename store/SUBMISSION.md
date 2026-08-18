# ✅ Einreichung – Spickzettel (Privacy-Labels & Checkliste)

Klopatra erfasst **keine** Nutzerdaten auf Servern – alles bleibt lokal. Das macht
die Datenschutz-Angaben in beiden Stores angenehm einfach.

---

## 🍎 Apple – App Privacy (App Store Connect → App-Datenschutz)

Frage „Erfasst diese App Daten?" → **Nein, wir erfassen keine Daten.**

Begründung, falls nachgefragt: Alle Einträge werden ausschließlich lokal auf dem
Gerät gespeichert (localStorage), es gibt keinen Server, kein Konto, kein Tracking,
keine Analyse- oder Werbe-SDKs. In-App-Käufe laufen über Apple/RevenueCat; dabei
erhält der Entwickler keine personenbezogenen Zahlungsdaten.

> Hinweis: Sobald du RevenueCat einbindest, prüft Apple, dass RevenueCat selbst
> keine mit dem Nutzer verknüpften Daten sammelt. RevenueCat kann anonyme
> Kauf-/Diagnosedaten verarbeiten – wenn du dort „Nutzer-Attribute" NICHT setzt,
> bleibt es bei „keine mit der Identität verknüpften Daten". Für die Standard-
> Integration ist „Keine Daten erfasst" korrekt.

Weitere Apple-Felder:
- **Datenschutzrichtlinie-URL:** https://robtechconsult.github.io/Klotracker/datenschutz.html
- **Altersfreigabe:** 4+ (keine anstößigen Inhalte; humorvoll, keine Medizinberatung)
- **Verschlüsselung (ITSAppUsesNonExemptEncryption):** `NO` in Info.plist setzen
  (App nutzt keine eigene Verschlüsselung → keine Exportfreigabe nötig).

---

## 🤖 Google Play – Data safety (Play Console → Datensicherheit)

- **Werden Nutzerdaten erhoben oder geteilt?** → **Nein.**
- **Werden Daten verschlüsselt übertragen?** → n/a (keine Übertragung).
- **Können Nutzer Löschung anfordern?** → Ja – lokal über „Alle Daten löschen"
  bzw. App-Deinstallation.
- **Datenschutzerklärung-URL:** https://robtechconsult.github.io/Klotracker/datenschutz.html
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
