// Kauf-Abstraktion. Im Browser (nur Entwicklung) gibt es keine In-App-Käufe –
// dort schaltet die App lokal frei. Auf nativen Geräten (Capacitor iOS/Android)
// laufen die echten Store-Käufe über RevenueCat (@revenuecat/purchases-capacitor).
// Siehe STORE.md → "In-App-Käufe". Die UI kennt nur purchase()/restore().

import { Capacitor } from '@capacitor/core'
import { Purchases, PRODUCT_CATEGORY } from '@revenuecat/purchases-capacitor'

export const platform = () => Capacitor.getPlatform() // 'web' | 'ios' | 'android'
export const isNative = () => Capacitor.isNativePlatform()

// Öffentliche RevenueCat-SDK-Keys (dürfen im App-Bundle stehen). Kommen aus
// .env.local bzw. den Build-Umgebungsvariablen, siehe .env.example.
const RC_KEYS = {
  ios: import.meta.env.VITE_RC_IOS_KEY,
  android: import.meta.env.VITE_RC_ANDROID_KEY
}

// Produkt-IDs – exakt so in App Store Connect / Google Play Console anlegen.
// Pro: 3 Preis-Stufen (non-consumable), alle geben dasselbe Entitlement "pro".
// Trinkgeld: consumables (wiederholbar kaufbar).
export const PRODUCTS = {
  pro_roll: 'klopatra.pro.roll',
  pro_pack: 'klopatra.pro.pack',
  pro_bulk: 'klopatra.pro.bulk',
  tip_roll: 'klopatra.tip.roll',
  tip_pack: 'klopatra.tip.pack',
  tip_bulk: 'klopatra.tip.bulk'
}
export const PRO_ENTITLEMENT = 'pro'

export const proProductForTier = (tierKey) => PRODUCTS[`pro_${tierKey}`]
export const tipProductForTier = (tierKey) => PRODUCTS[`tip_${tierKey}`]

let configured = null // Promise, damit configure() nur einmal läuft

function ensureConfigured() {
  if (!configured) {
    const apiKey = RC_KEYS[platform()]
    if (!apiKey) return Promise.reject(new Error(`RevenueCat-Key für ${platform()} fehlt`))
    configured = Purchases.configure({ apiKey }).catch((e) => { configured = null; throw e })
  }
  return configured
}

const hasPro = (customerInfo) => !!customerInfo?.entitlements?.active?.[PRO_ENTITLEMENT]

/**
 * Einmalig beim App-Start (nur nativ). Liefert, ob der Store ein aktives
 * Pro-Entitlement kennt (z. B. nach Neuinstallation) – dann schaltet die App frei.
 * @returns {Promise<{pro:boolean}>}
 */
export async function initPurchases() {
  if (!isNative()) return { pro: false }
  await ensureConfigured()
  const { customerInfo } = await Purchases.getCustomerInfo()
  return { pro: hasPro(customerInfo) }
}

/**
 * Führt einen Kauf aus.
 * @returns {Promise<{ok:boolean, platform:string, reason?:string}>}
 * Auf Web: {ok:false, platform:'web'} → die App schaltet dort lokal frei.
 */
export async function purchase(productId) {
  if (!isNative()) return { ok: false, platform: 'web' }
  await ensureConfigured()
  const { products } = await Purchases.getProducts({
    productIdentifiers: [productId],
    type: PRODUCT_CATEGORY.NON_SUBSCRIPTION
  })
  const product = products.find((p) => p.identifier === productId)
  if (!product) throw new Error(`Produkt ${productId} nicht im Store gefunden`)
  try {
    const { customerInfo } = await Purchases.purchaseStoreProduct({ product })
    const isTip = productId.startsWith('klopatra.tip.')
    return { ok: isTip || hasPro(customerInfo), platform: platform() }
  } catch (e) {
    if (e?.userCancelled) return { ok: false, platform: platform(), reason: 'cancelled' }
    throw e
  }
}

/** Käufe wiederherstellen (Pflicht für App-Store-Freigabe). */
export async function restore() {
  if (!isNative()) return { ok: false, platform: 'web' }
  await ensureConfigured()
  const { customerInfo } = await Purchases.restorePurchases()
  return { ok: hasPro(customerInfo), platform: platform() }
}
