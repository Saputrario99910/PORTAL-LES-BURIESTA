/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: SINKRONISASI DATABASE PORTAL WALI MURID
 * Rumah Belajar English
 * =========================================================================
 */

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
    var action = request.action;
    var data = request.data || {};
    var timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 0. VERIFIKASI LOGIN PIN WALI MURID
    if (action === "verify_pin") {
      var studentSheet = ss.getSheetByName("Data Akun Siswa");
      if (!studentSheet) {
        setupDatabaseMaster();
        studentSheet = ss.getSheetByName("Data Akun Siswa");
      }

      var rows = studentSheet.getDataRange().getValues();
      var targetToken = (data.token || "").toLowerCase().trim();
      var inputPin = String(data.pin || "").trim();

      var foundStudent = null;
      for (var i = 1; i < rows.length; i++) {
        var rowToken = String(rows[i][1] || "").toLowerCase().trim();
        var rowPin = String(rows[i][5] || "").trim();

        if (rowToken === targetToken || (!targetToken && i === 1)) {
          if (rowPin === inputPin) {
            foundStudent = {
              id: String(rows[i][0] || "std_01"),
              token: String(rows[i][1] || "kenzo-404"),
              name: String(rows[i][2] || "Kenzo Alfarizi Pratama"),
              nickname: String(rows[i][3] || "Kenzo"),
              class_level: String(rows[i][4] || "Primary English Explorer (Kelas 3 SD)"),
              pin: rowPin,
              teacher_whatsapp: String(rows[i][6] || "6281234567890"),
              schedule: String(rows[i][7] || "Selasa & Kamis · 15.30 - 17.00 WIB"),
              teacher_name: String(rows[i][8] || "Miss Sarah Amalia, S.Pd.")
            };
            break;
          } else {
            return ContentService.createTextOutput(JSON.stringify({
              status: "invalid_pin",
              message: "PIN 6-digit salah. Silakan coba lagi."
            })).setMimeType(ContentService.MimeType.JSON);
          }
        }
      }

      if (foundStudent) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          message: "Login berhasil",
          student: foundStudent
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({
          status: "not_found",
          message: "Akun siswa dengan token ini tidak ditemukan di database."
        })).setMimeType(ContentService.MimeType.JSON);
      }
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
