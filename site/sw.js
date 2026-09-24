// Aufräum-Service-Worker: Früher lief hier die Klopatra-Web-App (PWA) mit
// eigenem Service Worker. Jetzt ist die Domain eine Landingpage – dieser
// Worker ersetzt den alten, löscht dessen Caches und meldet sich ab, damit
// niemand in einer veralteten App-Version hängen bleibt.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.map((k) => caches.delete(k)))
    await self.registration.unregister()
    const clients = await self.clients.matchAll({ type: 'window' })
    clients.forEach((c) => c.navigate(c.url))
  })())
})
