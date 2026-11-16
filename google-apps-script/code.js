/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: SINKRONISASI DATABASE PORTAL WALI MURID
 * Rumah Belajar English
 * Satu Arah (One-Way Outbound Mirror): Supabase -> Google Sheets
 * =========================================================================
 */

// Shared secret key untuk mengotentikasi webhook request dari Portal RBE
var EXPECTED_WEBHOOK_SECRET = "rbe_sec_2026_wbk99";

/**
 * FUNGSI SETUP UTAMA: setupDatabaseMaster()
 * Menyiapkan semua tab:
 * 1. Data Akun Siswa
 * 2. Pembayaran SPP (dengan cicilan)
 * 3. Absensi Siswa (lengkap dengan nomor pertemuan 1, 2, 3, 4, 5, 6, dst)
 * 4. Nilai & Evaluasi Siswa (tugas, kuis, unit test)
 */
function setupDatabaseMaster() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. SETUP SHEET: Data Akun Siswa
  var studentSheet = ss.getSheetByName("Data Akun Siswa");
  if (!studentSheet) {
    studentSheet = ss.insertSheet("Data Akun Siswa");
  }
  studentSheet.clear();
  studentSheet.appendRow([
    "ID Siswa",
    "Token Link",
    "Nama Lengkap Siswa",
    "Panggilan",
    "Tingkat Kelas",
    "PIN (6 Digit)",
    "No. WhatsApp Guru/Wali",
    "Jadwal Les",
    "Nama Tutor"
  ]);
  studentSheet.getRange("A1:I1")
    .setFontWeight("bold")
    .setBackground("#fed7aa")
    .setFontColor("#7c2d12")
    .setHorizontalAlignment("center");
  studentSheet.setFrozenRows(1);

  studentSheet.appendRow([
    "st_1",
    "kenzo-404",
    "Kenzo Alfarizi Pratama",
    "Kenzo",
    "Kids A (Kelas 3-4 SD)",
    "123456",
    "6281234567890",
    "Selasa & Kamis · 15.30 - 17.00 WIB",
    "Miss Sarah Amalia, S.Pd."
  ]);
  studentSheet.appendRow([
    "st_2",
    "nadira-202",
    "Nadira Alya Putri",
    "Alya",
    "Kids A (Kelas 3-4 SD)",
    "654321",
    "6281234567890",
    "Selasa & Kamis · 15.30 - 17.00 WIB",
    "Miss Sarah Amalia, S.Pd."
  ]);

  // 2. SETUP SHEET: Pembayaran SPP
  var paySheet = ss.getSheetByName("Pembayaran SPP");
  if (!paySheet) {
    paySheet = ss.insertSheet("Pembayaran SPP");
  }
  paySheet.clear();
  paySheet.appendRow([
    "Waktu Catat",
    "Nama Siswa",
    "Kelas",
    "Jenis Tagihan",
    "Periode / Bulan",
    "Total Tagihan (Rp)",
    "Nominal Bayar (Rp)",
    "Total Terbayar (Rp)",
    "Sisa Kekurangan (Rp)",
    "Status Tagihan",
    "Metode Pembayaran",
    "Tanggal Bayar"
  ]);
  paySheet.getRange("A1:L1")
    .setFontWeight("bold")
    .setBackground("#dbeafe")
    .setFontColor("#1e3a8a")
    .setHorizontalAlignment("center");
  paySheet.setFrozenRows(1);

  // 3. SETUP SHEET: Absensi Siswa (Rekap per Pertemuan)
  var attSheet = ss.getSheetByName("Absensi Siswa");
  if (!attSheet) {
    attSheet = ss.insertSheet("Absensi Siswa");
  }
  attSheet.clear();
  attSheet.appendRow([
    "Waktu Catat",
    "Kelas",
    "Pertemuan Ke-",
    "Tanggal Kelas",
    "Topik Pembelajaran",
    "Nama Siswa",
    "Status Kehadiran",
    "Catatan Guru"
  ]);
  attSheet.getRange("A1:H1")
    .setFontWeight("bold")
    .setBackground("#dcfce7")
    .setFontColor("#14532d")
    .setHorizontalAlignment("center");
  attSheet.setFrozenRows(1);

  // 4. SETUP SHEET: Nilai & Evaluasi Siswa
  var gradeSheet = ss.getSheetByName("Nilai & Evaluasi Siswa");
  if (!gradeSheet) {
    gradeSheet = ss.insertSheet("Nilai & Evaluasi Siswa");
  }
  gradeSheet.clear();
  gradeSheet.appendRow([
    "Waktu Catat",
    "Kelas",
    "Pertemuan Ke-",
    "Tanggal",
    "Nama Siswa",
    "Jenis Penilaian",
    "Judul / Topik Materi",
    "Nilai Angka",
    "Skor Maksimal",
    "Catatan / Evaluasi Guru"
  ]);
  gradeSheet.getRange("A1:J1")
    .setFontWeight("bold")
    .setBackground("#fef08a")
    .setFontColor("#713f12")
    .setHorizontalAlignment("center");
  gradeSheet.setFrozenRows(1);

  return "Setup Database Master Lengkap Berhasil!";
}

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var request = JSON.parse(rawData);
    var secret = request.secret;
    var action = request.action;
    var idempotencyKey = request.idempotency_key;
    var data = request.data || {};
    var timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    // 1. AUTENTIKASI WEBHOOK DENGAN SHARED SECRET
    if (!secret || secret !== EXPECTED_WEBHOOK_SECRET) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "unauthorized",
        message: "Akses ditolak: Invalid or missing webhook secret."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. CEK IDEMPOTENSI (Mencegah Baris Duplikat jika di-retry atau diklik ganda)
    if (idempotencyKey) {
      var cache = CacheService.getScriptCache();
      var cached = cache.get("idem_" + idempotencyKey);
      if (cached) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "duplicate_ignored",
          message: "Transaksi duplikat diabaikan (idempotency key matched)."
        })).setMimeType(ContentService.MimeType.JSON);
      }
      // Simpan kunci idempotensi selama 6 jam (21600 detik)
      cache.put("idem_" + idempotencyKey, "processed", 21600);
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 3. TOLAK INBOUND AUTHENTICATION DARI GOOGLE SHEETS
    // Supabase adalah satu-satunya Source of Truth untuk data akun dan autentikasi
    if (action === "verify_pin") {
      return ContentService.createTextOutput(JSON.stringify({
        status: "deprecated",
        message: "Akses ditolak: Verifikasi PIN telah dipindahkan ke Supabase RPC server-side."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 1. SINKRONISASI PEMBAYARAN SPP & CICILAN
    if (action === "pembayaran_lunas" || action === "catat_pembayaran") {
      var sheet = ss.getSheetByName("Pembayaran SPP");
      if (!sheet) {
        setupDatabaseMaster();
        sheet = ss.getSheetByName("Pembayaran SPP");
      }

      var totalAmount = Number(data.total_amount || data.amount || 0);
      var paidThisTime = Number(data.amount || 0);
      var totalPaidSoFar = Number(data.paid_amount !== undefined ? data.paid_amount : totalAmount);
      var remaining = Number(data.remaining_amount !== undefined ? data.remaining_amount : (totalAmount - totalPaidSoFar));
      var statusTagihan = String(data.status || (remaining <= 0 ? "LUNAS" : "CICILAN")).toUpperCase();

      sheet.appendRow([
        timestamp,
        data.student_name || "-",
        data.class_level || "-",
        data.title || "SPP Reguler",
        data.period || "-",
        totalAmount,
        paidThisTime,
        totalPaidSoFar,
        remaining,
        statusTagihan,
        data.payment_method || "Transfer Bank / Cash",
        data.payment_date || timestamp
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Data pembayaran & cicilan berhasil dicatat ke Google Sheets"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. SINKRONISASI ABSENSI KELAS (Support Batch Multi-Siswa & Nomor Pertemuan)
    if (action === "absensi_baru") {
      var attSheet = ss.getSheetByName("Absensi Siswa");
      if (!attSheet) {
        setupDatabaseMaster();
        attSheet = ss.getSheetByName("Absensi Siswa");
      }

      // Jika data dikirim berupa array records
      if (data.records && Array.isArray(data.records)) {
        for (var r = 0; r < data.records.length; r++) {
          var rec = data.records[r];
          attSheet.appendRow([
            timestamp,
            rec.class_name || data.class_name || "-",
            rec.meeting_number || data.meeting_number || 1,
            rec.date || timestamp,
            rec.topic || "-",
            rec.student_name || "-",
            rec.status || "Hadir",
            rec.teacher_note || "-"
          ]);
        }
      } else {
        attSheet.appendRow([
          timestamp,
          data.class_name || "-",
          data.meeting_number || 1,
          data.date || timestamp,
          data.topic || "-",
          data.student_name || "-",
          data.status || "Hadir",
          data.teacher_note || "-"
        ]);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Data absensi berhasil masuk ke Google Sheets"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. SINKRONISASI PENILAIAN SISWA (Tugas, Kuis, Unit Test)
    if (action === "catat_penilaian") {
      var gradeSheet = ss.getSheetByName("Nilai & Evaluasi Siswa");
      if (!gradeSheet) {
        setupDatabaseMaster();
        gradeSheet = ss.getSheetByName("Nilai & Evaluasi Siswa");
      }

      if (data.records && Array.isArray(data.records)) {
        for (var g = 0; g < data.records.length; g++) {
          var gRec = data.records[g];
          gradeSheet.appendRow([
            timestamp,
            gRec.class_name || data.class_name || "-",
            gRec.meeting_number || data.meeting_number || 1,
            gRec.date || timestamp,
            gRec.student_name || "-",
            gRec.assessment_type || "Tugas",
            gRec.assessment_title || "-",
            gRec.score || 0,
            gRec.max_score || 100,
            gRec.teacher_feedback || "-"
          ]);
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Data nilai siswa berhasil masuk ke Google Sheets"
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
