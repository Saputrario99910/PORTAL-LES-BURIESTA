/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: SINKRONISASI SUPABASE KE GOOGLE SHEETS
 * =========================================================================
 * 
 * CARA MEMASANG:
 * 1. Buka Google Sheets Anda (https://sheets.new).
 * 2. Beri nama sheet (tab di bagian bawah) dengan: "Pembayaran SPP" dan "Absensi Siswa".
 * 3. Di Google Sheets, klik menu: "Extensions" (Ekstensi) -> "Apps Script".
 * 4. Hapus semua kode default di dalam editor Apps Script, lalu COPY dan PASTE seluruh isi file ini.
 * 5. Klik "Save" (ikon disket).
 * 6. Klik tombol "Deploy" (Terapkan) di pojok kanan atas -> pilih "New deployment" (Penerapan baru).
 * 7. Pilih tipe: "Web app" (Aplikasi web).
 *    - Description: "Webhook Sync Portal Wali Murid"
 *    - Execute as: "Me" (Saya)
 *    - Who has access: "Anyone" (Siapa saja)  <-- PENTING agar web bisa mengirim data!
 * 8. Klik "Deploy". Salin "Web app URL" yang muncul (berawalan https://script.google.com/macros/s/...).
 * 9. Tempelkan URL tersebut ke file .env Anda di VITE_GOOGLE_SHEETS_WEBHOOK_URL.
 */

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var request = JSON.parse(rawData);
    var action = request.action;
    var data = request.data || {};
    var timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. SINKRONISASI PEMBAYARAN SPP LUNAS
    if (action === "pembayaran_lunas") {
      var sheet = ss.getSheetByName("Pembayaran SPP");
      if (!sheet) {
        sheet = ss.insertSheet("Pembayaran SPP");
        sheet.appendRow([
          "Waktu Catat",
          "Nama Siswa",
          "Kelas",
          "Bulan Tagihan",
          "Nominal",
          "Metode Pembayaran",
          "Status",
          "Tanggal Bayar"
        ]);
        sheet.getRange("A1:H1").setFontWeight("bold").setBackground("#dbeafe");
      }

      sheet.appendRow([
        timestamp,
        data.student_name || "-",
        data.class_level || "-",
        data.period || "-",
        data.amount || 0,
        data.payment_method || "Transfer Bank / Cash",
        "LUNAS",
        data.payment_date || timestamp
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Data pembayaran berhasil masuk ke Google Sheets"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. SINKRONISASI ABSENSI KELAS
    if (action === "absensi_baru") {
      var attSheet = ss.getSheetByName("Absensi Siswa");
      if (!attSheet) {
        attSheet = ss.insertSheet("Absensi Siswa");
        attSheet.appendRow([
          "Waktu Catat",
          "Tanggal Kelas",
          "Nama Siswa",
          "Kelas",
          "Status Kehadiran",
          "Catatan Guru"
        ]);
        attSheet.getRange("A1:F1").setFontWeight("bold").setBackground("#dcfce7");
      }

      attSheet.appendRow([
        timestamp,
        data.date || timestamp,
        data.student_name || "-",
        data.class_name || "-",
        data.status || "hadir",
        data.teacher_note || "-"
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Data absensi berhasil masuk ke Google Sheets"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "ignored",
      message: "Action tidak dikenali"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Webhook Portal Wali Murid Rumah Belajar English Aktif!");
}
