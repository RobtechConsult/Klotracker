# 🌐 Domain-Setup & Go-Live-Plan – Klopatra

Gemeinsamer Fahrplan. **Du** machst alles im eigenen Browser/IONOS/GitHub (Logins,
Käufe, Klicks). **Claude** macht die Repo-/Technik-Seite (Dateien, Config, URLs).

---

## 0. Ziel & Architektur

Eine Domain als **Dach für alle deine Projekte**: `robtech-consult.de` (besitzt du
vermutlich schon – deine E-Mail läuft darüber).

- **Pro App eine Subdomain** → Klopatra: **`klopatra.robtech-consult.de`**
- `robtech-consult.de` / `www.robtech-consult.de` bleibt frei für eine spätere
  zentrale Landingpage + **ein gemeinsames Impressum** für alle Apps.
- Vorteil Subdomain: einfachste DNS (nur ein CNAME), saubere Trennung, pro App
  eigene Datenschutz-URL (von den Stores gefordert).

✅ **Erledigt 2026-09-24:** Live unter `https://klopatra.robtech-consult.de/`.
Die alte URL `https://robtechconsult.github.io/Klotracker/` leitet automatisch dorthin um.

---

## 1. Domain prüfen/besorgen (DU, in IONOS)

1. IONOS → **„Domains & SSL"**: Ist `robtech-consult.de` gelistet?
   - **Ja** → weiter zu Schritt 2.
   - **Nein** → Domain buchen (oder wir nehmen eine andere, die du hast). Sag Bescheid.

---

## 2. DNS-Eintrag setzen (DU, in IONOS)

Bei der Domain `robtech-consult.de` → **DNS** → neuen Eintrag anlegen:

| Feld | Wert |
|---|---|
| Typ | `CNAME` |
| Hostname / Name | `klopatra` |
| Ziel / Zeigt auf | `robtechconsult.github.io` (ggf. mit Punkt: `robtechconsult.github.io.`) |
| TTL | Standard |

> ⚠️ **Nur diesen einen Eintrag hinzufügen.** Bestehende Einträge (z. B. für die
> E-Mail) **nicht** anfassen. Ziel ist NUR `robtechconsult.github.io` – **ohne**
> `/Klotracker`.

Danach 10–60 Min. warten (DNS-Verbreitung). Prüfen kannst du unter
`whatsmydns.net` → `klopatra.robtech-consult.de`, Typ CNAME.

---

## 3. Repo vorbereiten (CLAUDE)

Sobald DNS gesetzt ist, mache ich:
- `public/CNAME` mit Inhalt `klopatra.robtech-consult.de` anlegen (bleibt bei jedem
  Actions-Deploy erhalten).
- **Kein** Base-Pfad-Code nötig: `configure-pages` liefert bei Custom-Domain
  automatisch `/`. Ich prüfe den Build trotzdem.
- Merge auf `main` → Deploy.

---

## 4. Custom-Domain in GitHub aktivieren (DU, in GitHub)

Repo **RobtechConsult/Klotracker** → **Settings → Pages**:
1. **Custom domain**: `klopatra.robtech-consult.de` eintragen → **Save**.
   (GitHub prüft die DNS – grüner Haken erscheint, wenn Schritt 2 durch ist.)
2. Warten, bis das TLS-Zertifikat bereitsteht (bis ~1 h), dann
   **„Enforce HTTPS"** anhaken.

---

## 5. URLs überall nachziehen (CLAUDE)

Nach erfolgreicher Umstellung ändere ich alle Verweise auf die neue Domain:
- `store/STORE_LISTING.md` (Datenschutz-/Support-/Marketing-URL)
- `store/SUBMISSION.md` (Privacy-Label-URLs)
- `README.md`, `docs/PROJEKT_WISSEN.md` (Live-URL)
- (Datenschutz ↔ Impressum sind relativ verlinkt – bleiben automatisch korrekt.)

Neue URLs dann:
- App: `https://klopatra.robtech-consult.de/`
- Datenschutz: `https://klopatra.robtech-consult.de/datenschutz.html`
- Impressum: `https://klopatra.robtech-consult.de/impressum.html`

> Hinweis: Die App speichert alles lokal pro Domain. Wer die alte
> `github.io`-Version „zum Homescreen" hinzugefügt hatte, startet auf der neuen
> Domain frisch (andere Origin). Bei einer quasi neuen App vernachlässigbar.

---

## 6. Optional: zentrales Impressum + Landingpage für alle Projekte (später)

Wenn du willst, richten wir `robtech-consult.de` als Dach ein:
- kleine Start-/Landingpage unter der Hauptdomain
- **ein** zentrales Impressum, auf das alle Apps verlinken
- je App eine Subdomain (`klopatra.…`, `app2.…`, …)

Das ist ein eigener kleiner Schritt – machen wir, wenn Klopatra steht.

---

## 7. Der große Go-Live-Überblick (wo die Domain reinpasst)

**✅ Fertig (Code & Recht):** App live als PWA, Rebranding Klopatra, Icon,
Datenschutz + Impressum, Käufe-wiederherstellen, Store-Texte, Screenshots.

**🔜 Jetzt (dieser Plan):** eigene Domain anbinden.

**⬜ Danach für die App-Stores (DU, extern):**
1. Apple Developer- (99 $/J) + Google-Play-Konto (25 $) anlegen.
2. RevenueCat + 6 IAP-Produkte anlegen, `src/lib/purchases.js` aktivieren,
   Kauf auf echtem Gerät testen.
3. `npx cap add ios/android` → Build in Xcode/Android Studio →
   `npx capacitor-assets generate` (Master: `store/klopatra-icon-1024.png`) →
   TestFlight / Play Internal Testing → Review → Release.

Details: `STORE.md` + `store/SUBMISSION.md`.

---

## Rollen-Kurzfassung

| Schritt | Wer |
|---|---|
| Domain prüfen/kaufen | DU |
| DNS-CNAME setzen | DU |
| `public/CNAME` + Deploy | CLAUDE |
| Custom-Domain + HTTPS in GitHub | DU |
| Alle URLs nachziehen | CLAUDE |
| Stores (Konten, IAP, Builds) | DU (Claude unterstützt) |
