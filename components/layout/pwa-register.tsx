"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Disable and clean up service worker in development to prevent caching issues/hydration mismatches
    if (process.env.NODE_ENV === "development") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((success) => {
            if (success) {
              console.log("Dev Mode: Active service worker unregistered successfully");
            }
          });
        }
      });
      return;
    }

    if (
      window.location.protocol === "https:" || 
      window.location.hostname === "localhost" || 
      window.location.hostname === "127.0.0.1"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("PWA Service Worker registered successfully with scope:", registration.scope);
        })
        .catch((error) => {
          console.error("PWA Service Worker registration failed:", error);
        });
    }
  }, []);

  return null;
}
