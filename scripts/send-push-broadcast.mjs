import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@rumahbelajarenglish.com';

if (!supabaseUrl || !supabaseKey || !vapidPublicKey || !vapidPrivateKey) {
  console.error('Error: Konfigurasi environment belum lengkap.');
  process.exit(1);
}

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function sendBroadcastNotification(title, message, url = '/') {
  console.log(`Mengambil daftar subscription dari Supabase...`);
  const { data: subs, error } = await supabase.from('push_subscriptions').select('*');

  if (error) {
    console.error('Gagal mengambil subscription:', error.message);
    return;
  }

  if (!subs || subs.length === 0) {
    console.log('Belum ada perangkat HP yang terdaftar untuk menerima notifikasi.');
    return;
  }

  console.log(`Ditemukan ${subs.length} perangkat terdaftar. Mengirim notifikasi...`);

  const payload = JSON.stringify({
    title,
    body: message,
    icon: '/pwa-192x192.png',
    url,
  });

  for (const item of subs) {
    const pushSubscription = {
      endpoint: item.endpoint,
      keys: {
        p256dh: item.p256dh,
        auth: item.auth,
      },
    };

    try {
      await webpush.sendNotification(pushSubscription, payload);
      console.log(`✓ Berhasil terkirim ke perangkat: ${item.endpoint.substring(0, 45)}...`);
    } catch (err) {
      console.error(`✗ Gagal mengirim ke ${item.endpoint.substring(0, 45)}:`, err.statusCode || err.message);
      // Bersihkan subscription yang sudah kedaluwarsa (410 Gone atau 404)
      if (err.statusCode === 410 || err.statusCode === 404) {
        console.log(`Menghapus subscription mati dari DB: ${item.id}`);
        await supabase.from('push_subscriptions').delete().eq('id', item.id);
      }
    }
  }

  console.log('Selesai broadcast notifikasi.');
}

// Jalankan uji coba jika dipanggil langsung
const testTitle = process.argv[2] || 'Rumah Belajar English';
const testBody = process.argv[3] || 'Dokumentasi kelas & materi baru telah diperbarui oleh Miss Sarah!';
sendBroadcastNotification(testTitle, testBody);
