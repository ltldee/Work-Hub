"use strict";
var CACHE = "hub-v13";
var CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./supabase.js",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png",
  "./favicon-32.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE).map(n => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (req.mode === "navigate" || req.url.endsWith("/index.html")) {
    event.respondWith(
      fetch(req).then(res => {
        caches.open(CACHE).then(cache => cache.put(req, res.clone()));
        return res;
      }).catch(() => caches.match(req).then(res => res || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        caches.open(CACHE).then(cache => cache.put(req, res.clone()));
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
