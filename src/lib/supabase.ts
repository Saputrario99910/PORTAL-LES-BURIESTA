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
export const googleSheetsWebhookSecret =
  import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_SECRET || 'rbe_sec_2026_wbk99';

/**
 * Sanitasi ringkasan payload untuk dicatat ke sync_error_logs
 * Menghindari pencatatan data rahasia/bukti transfer berukuran besar
 */
export function sanitizePayloadSummary(payload: any): string {
  if (!payload) return 'empty_payload';
  try {
    const summary: Record<string, any> = {};
    if (payload.student_name) summary.student_name = payload.student_name;
    if (payload.class_name || payload.class_level) {
      summary.class = payload.class_name || payload.class_level;
    }
    if (payload.period) summary.period = payload.period;
    if (payload.amount !== undefined) summary.amount = payload.amount;
    if (payload.total_amount !== undefined) summary.total_amount = payload.total_amount;
    if (payload.payment_method) summary.payment_method = payload.payment_method;
    if (payload.meeting_number !== undefined) summary.meeting_number = payload.meeting_number;
    if (payload.records && Array.isArray(payload.records)) {
      summary.records_count = payload.records.length;
    }
    return JSON.stringify(summary);
  } catch {
    return 'unparseable_payload';
  }
}

/**
 * Catat Log Error Sinkronisasi ke Supabase
 */
export async function logSyncError(
  actionType: string,
  payloadSummary: string,
  errorMessage: string
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('sync_error_logs').insert({
        action_type: actionType,
        payload_summary: payloadSummary,
        error_message: errorMessage,
        retry_status: 'failed',
      });
    } catch (e) {
      console.warn('Gagal mencatat sync error log ke Supabase:', e);
    }
  }
}

/**
 * Sinkronisasi data ke Google Sheets Webhook (Satu Arah: Outbound Mirror)
 * Dilengkapi Shared Secret Authentication, Idempotency Key, & Error Logging
 */
export async function syncToGoogleSheets(
  actionType: 'pembayaran_lunas' | 'catat_pembayaran' | 'absensi_baru' | 'catat_penilaian',
  payload: any
) {
  if (!googleSheetsWebhookUrl) {
    return { success: false, reason: 'no_webhook_url' };
  }

  // Buat kunci idempotensi unik untuk mencegah baris ganda jika terjadi retry
  const idempotencyKey =
    payload.idempotency_key ||
    `${actionType}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  try {
    const response = await fetch(googleSheetsWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: actionType,
        secret: googleSheetsWebhookSecret,
        idempotency_key: idempotencyKey,
        timestamp: new Date().toISOString(),
        data: payload,
      }),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || (result && (result.status === 'unauthorized' || result.status === 'error'))) {
      const errMsg = result?.message || `HTTP error ${response.status}`;
      await logSyncError(actionType, sanitizePayloadSummary(payload), errMsg);
      return { success: false, error: errMsg, data: result };
    }

    return { success: true, data: result };
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    console.error('Koneksi Google Sheets webhook gagal:', errMsg);
    await logSyncError(actionType, sanitizePayloadSummary(payload), errMsg);
    return { success: false, error: errMsg };
  }
}
