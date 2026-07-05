"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { addResourceAction } from "@/lib/actions/resources";

export function PWARegister() {
  useEffect(() => {
    // 1. Service Worker Registration
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      (window.location.protocol === "https:" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
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

    // 2. Offline Sync Listener
    const syncOfflineResources = async () => {
      const stored = localStorage.getItem("volt_offline_resources");
      if (!stored) return;

      try {
        const queue = JSON.parse(stored);
        if (queue.length === 0) return;

        toast.info(`Syncing ${queue.length} offline saved resource(s)...`);

        const remainingQueue = [];
        let successCount = 0;

        for (const resource of queue) {
          try {
            // Call the standard server action to insert into MongoDB
            const res = await addResourceAction(resource);
            if (res.success) {
              successCount++;
            } else {
              remainingQueue.push(resource);
            }
          } catch {
            remainingQueue.push(resource);
          }
        }

        if (successCount > 0) {
          toast.success(`Successfully synced ${successCount} resource(s) from your offline queue!`);
        }

        if (remainingQueue.length > 0) {
          localStorage.setItem("volt_offline_resources", JSON.stringify(remainingQueue));
        } else {
          localStorage.removeItem("volt_offline_resources");
        }
      } catch (err) {
        console.error("Error parsing offline sync queue:", err);
      }
    };

    // Run sync on boot if we are online
    if (typeof window !== "undefined" && navigator.onLine) {
      syncOfflineResources();
    }

    const handleOnline = () => {
      syncOfflineResources();
    };

    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return null;
}
