import { createClient } from '@supabase/supabase-js';

// Ambil URL dan Public Anon Key dari environment (.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Cek apakah kredensial Supabase sudah terkonfigurasi dengan valid
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('...')
);

// Inisialisasi client Supabase
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// URL Webhook Google Apps Script untuk sinkronisasi Google Sheets
export const googleSheetsWebhookUrl = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL || '';

/**
 * Helper untuk mengirim data pembayaran / absensi langsung ke Google Sheets
 */
export async function syncToGoogleSheets(actionType: 'pembayaran_lunas' | 'absensi_baru', payload: any) {
  if (!googleSheetsWebhookUrl) {
    console.info('Google Sheets Webhook URL belum diisi di .env, proses sinkronisasi dilewati.');
    return { success: false, reason: 'no_webhook_url' };
  }

  try {
    const response = await fetch(googleSheetsWebhookUrl, {
      method: 'POST',
      mode: 'no-cors', // Apps script redirect compatibility
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: actionType,
        timestamp: new Date().toISOString(),
        data: payload,
      }),
    });

    return { success: true };
  } catch (err) {
    console.error('Gagal mengirim ke Google Sheets:', err);
    return { success: false, error: err };
  }
}
