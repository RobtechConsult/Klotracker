// Teilen & Dateien – nativ über Capacitor (Share-Sheet), im Browser (Entwicklung)
// über die Web-APIs. In der nativen WebView funktionieren weder <a download>
// noch window.print() noch zuverlässig navigator.share.

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { isNative } from './purchases.js'

/**
 * Stellt eine Textdatei (JSON, HTML) zum Speichern/Weitergeben bereit.
 * Nativ: in den Cache schreiben und das System-Teilen-Menü öffnen
 * (Dateien sichern, Mail, Drucken …). Web: normaler Download.
 */
export async function shareFile(filename, content, mimeType) {
  if (isNative()) {
    const { uri } = await Filesystem.writeFile({
      path: filename,
      data: content,
      directory: Directory.Cache,
      encoding: Encoding.UTF8
    })
    await Share.share({ title: filename, files: [uri] })
    return
  }
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Teilt Text + Link. Gibt 'shared' oder 'copied' zurück.
 * Abbruch durch den Nutzer wirft einen Fehler – den fängt der Aufrufer.
 */
export async function shareLink({ title, text, url }) {
  if (isNative()) {
    await Share.share({ title, text, url, dialogTitle: title })
    return 'shared'
  }
  if (navigator.share) {
    await navigator.share({ title, text, url })
    return 'shared'
  }
  await navigator.clipboard.writeText(url)
  return 'copied'
}
