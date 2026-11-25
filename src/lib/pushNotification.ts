import { supabase } from './supabase.ts';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

/**
 * Konversi base64 VAPID key ke Uint8Array yang dibutuhkan PushManager
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Cek apakah browser mendukung Web Push & Notifikasi
 */
export function isPushNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Cek status izin notifikasi saat ini
 */
export function getNotificationPermissionState(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Minta izin notifikasi dan simpan subscription ke Supabase
 */
export async function subscribeUserToPush(studentId?: string): Promise<{ success: boolean; message: string }> {
  if (!isPushNotificationSupported()) {
    return { success: false, message: 'Browser ini tidak mendukung Web Push Notification.' };
  }

  if (!VAPID_PUBLIC_KEY) {
    return { success: false, message: 'VAPID Public Key belum dikonfigurasi di environment.' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, message: 'Izin notifikasi tidak diberikan oleh pengguna.' };
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });
    }

    const subJson = subscription.toJSON();
    const endpoint = subJson.endpoint;
    const p256dh = subJson.keys?.p256dh;
    const auth = subJson.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      return { success: false, message: 'Gagal mengekstrak kredensial subscription push.' };
    }

    // Simpan ke Supabase jika client aktif
    if (supabase) {
      const { error } = await supabase.from('push_subscriptions').upsert(
        {
          student_id: studentId || null,
          endpoint,
          p256dh,
          auth,
          user_agent: navigator.userAgent,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      );

      if (error) {
        console.warn('Gagal menyimpan subscription ke Supabase:', error.message);
      }
    }

    localStorage.setItem('rbe_push_subscribed', 'true');
    return { success: true, message: 'Notifikasi berhasil diaktifkan di perangkat ini!' };
  } catch (err: any) {
    console.error('Error saat subscribe push notification:', err);
    return { success: false, message: err?.message || 'Terjadi kesalahan saat mengaktifkan notifikasi.' };
  }
}

/**
 * Berhenti berlangganan push notification
 */
export async function unsubscribeUserFromPush(): Promise<{ success: boolean; message: string }> {
  if (!isPushNotificationSupported()) {
    return { success: false, message: 'Browser tidak mendukung push notification.' };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      if (supabase) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
      }
    }

    localStorage.removeItem('rbe_push_subscribed');
    return { success: true, message: 'Notifikasi berhasil dinonaktifkan di perangkat ini.' };
  } catch (err: any) {
    console.error('Error saat unsubscribe:', err);
    return { success: false, message: err?.message || 'Gagal menonaktifkan notifikasi.' };
  }
}
