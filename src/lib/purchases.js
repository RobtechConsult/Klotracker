// Kauf-Abstraktion. Auf Web/PWA gibt es keine In-App-Käufe – dort schaltet die
// App lokal frei (Testbetrieb). Auf nativen Geräten (Capacitor iOS/Android)
// werden hier die echten Store-Käufe abgewickelt.
//
// Empfohlener Weg fürs native Einbinden: RevenueCat
// (@revenuecat/purchases-capacitor). Siehe STORE.md → "In-App-Käufe".
// Der Code unten ist bewusst plugin-agnostisch: nur diese Datei muss angefasst
// werden, um den echten Kauf zu aktivieren – die UI bleibt unverändert.

import { Capacitor } from '@capacitor/core'

export const platform = () => Capacitor.getPlatform() // 'web' | 'ios' | 'android'
export const isNative = () => Capacitor.isNativePlatform()

// Produkt-IDs – exakt so in App Store Connect / Google Play Console anlegen.
// Pro: 3 Preis-Stufen (non-consumable), alle geben dasselbe Entitlement "pro".
// Trinkgeld: consumables (wiederholbar kaufbar).
export const PRODUCTS = {
  pro_roll: 'klotracker.pro.roll',
  pro_pack: 'klotracker.pro.pack',
  pro_bulk: 'klotracker.pro.bulk',
  tip_roll: 'klotracker.tip.roll',
  tip_pack: 'klotracker.tip.pack',
  tip_bulk: 'klotracker.tip.bulk'
}
export const PRO_ENTITLEMENT = 'pro'

export const proProductForTier = (tierKey) => PRODUCTS[`pro_${tierKey}`]
export const tipProductForTier = (tierKey) => PRODUCTS[`tip_${tierKey}`]

/** Einmalig beim App-Start (nur nativ). No-op auf Web. */
export async function initPurchases() {
  if (!isNative()) return
  // NATIV (RevenueCat):
  //   import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor'
  //   await Purchases.configure({ apiKey: platform()==='ios' ? RC_IOS_KEY : RC_ANDROID_KEY })
  // Siehe STORE.md.
}

/**
 * Führt einen Kauf aus.
 * @returns {Promise<{ok:boolean, platform:string, reason?:string}>}
 * Auf Web: {ok:false, platform:'web'} → die App schaltet dort lokal frei.
 */
export async function purchase(productId) {
  if (!isNative()) return { ok: false, platform: 'web' }
  // NATIV (RevenueCat):
  //   const offerings = await Purchases.getOfferings()
  //   const pkg = findPackageByProductId(offerings, productId)
  //   const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg })
  //   return { ok: !!customerInfo.entitlements.active[PRO_ENTITLEMENT] || isConsumable(productId), platform: platform() }
  throw new Error('IAP-Plugin noch nicht eingebunden (siehe STORE.md)')
}

/** Käufe wiederherstellen (Pflicht für App-Store-Freigabe). */
export async function restore() {
  if (!isNative()) return { ok: false, platform: 'web' }
  // NATIV (RevenueCat):
  //   const info = await Purchases.restorePurchases()
  //   return { ok: !!info.customerInfo.entitlements.active[PRO_ENTITLEMENT], platform: platform() }
  throw new Error('IAP-Plugin noch nicht eingebunden (siehe STORE.md)')
}
