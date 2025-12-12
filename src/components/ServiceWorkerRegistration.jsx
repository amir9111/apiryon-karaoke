import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(() => {
        // Success
      })
      .catch(() => {
        // Silent fail
      });
  }, []);

  return null;
}