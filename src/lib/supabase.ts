import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('...')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const googleSheetsWebhookUrl = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL || '';

/**
 * Sinkronisasi data ke Google Sheets Webhook
 */
export async function syncToGoogleSheets(
  actionType: 'pembayaran_lunas' | 'absensi_baru' | 'verify_pin',
  payload: any
) {
  if (!googleSheetsWebhookUrl) {
    return { success: false, reason: 'no_webhook_url' };
  }

  try {
    const response = await fetch(googleSheetsWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Hindari preflight CORS Google Apps Script
      },
      body: JSON.stringify({
        action: actionType,
        timestamp: new Date().toISOString(),
        data: payload,
      }),
    });

    const result = await response.json().catch(() => null);
    return { success: true, data: result };
  } catch (err) {
    console.error('Koneksi Google Sheets:', err);
    return { success: false, error: err };
  }
}
