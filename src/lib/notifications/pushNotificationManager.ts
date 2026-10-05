/**
 * Manager untuk Notifikasi Browser (Web Notifications API & Service Worker)
 * Memungkinkan notifikasi push desktop langsung saat ada peminat baru pada brief proyek.
 */

export interface PushNotificationPayload {
  title: string;
  message: string;
  link?: string | null;
  tag?: string;
  icon?: string;
}

export function isBrowserNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getBrowserNotificationPermission(): "granted" | "denied" | "default" | "unsupported" {
  if (!isBrowserNotificationSupported()) {
    return "unsupported";
  }
  return Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (!isBrowserNotificationSupported()) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      await registerServiceWorker();
      return true;
    }
    return false;
  } catch (err) {
    console.warn("Gagal meminta izin notifikasi browser:", err);
    return false;
  }
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    return registration;
  } catch (err) {
    console.warn("Service worker register info:", err);
    return null;
  }
}

export async function showBrowserPushNotification({
  title,
  message,
  link = "/projects",
  tag,
  icon = "/ramu-mark.svg",
}: PushNotificationPayload): Promise<boolean> {
  if (!isBrowserNotificationSupported()) {
    return false;
  }

  if (Notification.permission !== "granted") {
    return false;
  }

  const notificationOptions: NotificationOptions = {
    body: message,
    icon: icon || "/ramu-mark.svg",
    badge: "/ramu-mark.svg",
    tag: tag || `ramu-notif-${Date.now()}`,
    data: {
      url: link || "/projects",
    },
    requireInteraction: true, // Tetap tampil di desktop sampai ditutup / diklik pengguna
  };

  try {
    // 1. Coba lewat ServiceWorkerRegistration untuk background support
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && "showNotification" in reg) {
        await reg.showNotification(title, notificationOptions);
        return true;
      }
    }

    // 2. Fallback ke constructor Notification standar
    const notif = new Notification(title, notificationOptions);
    notif.onclick = (event) => {
      event.preventDefault();
      window.focus();
      if (link) {
        window.location.href = link;
      }
      notif.close();
    };
    return true;
  } catch (err) {
    console.error("Gagal memunculkan notifikasi browser:", err);
    return false;
  }
}
