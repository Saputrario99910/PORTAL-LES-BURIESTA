/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: SINKRONISASI DATABASE PORTAL WALI MURID
 * Rumah Belajar English
 * =========================================================================
 */

/**
 * FUNGSI SETUP UTAMA: setupDatabaseMaster()
 * Jalankan fungsi ini sekali langsung dari tombol 'Run' di editor Google Apps Script!
 * Fungsi ini akan otomatis membuat dan merapikan SEMUA tabel (Data Akun Siswa, Pembayaran SPP, Absensi Siswa)
 * dengan kolom lengkap terbaru (termasuk Cicilan & Sisa Kekurangan).
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
    "std_01",
    "kenzo-404",
    "Kenzo Alfarizi Pratama",
    "Kenzo",
    "Primary English Explorer (Kelas 3 SD)",
    "123456",
    "6281234567890",
    "Selasa & Kamis · 15.30 - 17.00 WIB",
    "Miss Sarah Amalia, S.Pd."
  ]);
  studentSheet.appendRow([
    "std_02",
    "nadira-202",
    "Nadira Alya Putri",
    "Alya",
    "Beginner Kids Phonics (Kelas 1 SD)",
    "654321",
    "6281234567890",
    "Senin & Rabu · 14.00 - 15.30 WIB",
    "Miss Sarah Amalia, S.Pd."
  ]);

  // 2. SETUP SHEET: Pembayaran SPP (Dengan Kolom Lengkap Cicilan & Sisa)
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

  // Contoh Data Awal Cicilan Kenzo
  paySheet.appendRow([
    new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
    "Kenzo Alfarizi Pratama",
    "Primary English Explorer (Kelas 3 SD)",
    "SPP Reguler Bulanan",
    "November 2024",
    250000,
    150000,
    150000,
    100000,
    "CICILAN",
    "Transfer Bank BCA",
    "08 Nov 2024, 09.15 WIB"
  ]);

  // 3. SETUP SHEET: Absensi Siswa
  var attSheet = ss.getSheetByName("Absensi Siswa");
  if (!attSheet) {
    attSheet = ss.insertSheet("Absensi Siswa");
  }
  attSheet.clear();
  attSheet.appendRow([
    "Waktu Catat",
    "Tanggal Kelas",
    "Nama Siswa",
    "Kelas",
    "Status Kehadiran",
    "Catatan Guru"
  ]);
  attSheet.getRange("A1:F1")
    .setFontWeight("bold")
    .setBackground("#dcfce7")
    .setFontColor("#14532d")
    .setHorizontalAlignment("center");
  attSheet.setFrozenRows(1);

  attSheet.appendRow([
    new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
    "Selasa, 5 November 2024",
    "Kenzo Alfarizi Pratama",
    "Primary English Explorer (Kelas 3 SD)",
    "Hadir",
    "Sangat aktif bertanya kosakata baru"
  ]);

  // Format Auto Resize Kolom agar tampilan rapi & proporsional
  for (var col = 1; col <= 9; col++) studentSheet.autoResizeColumn(col);
  for (var col = 1; col <= 12; col++) paySheet.autoResizeColumn(col);
  for (var col = 1; col <= 6; col++) attSheet.autoResizeColumn(col);

  Logger.log("✅ setupDatabaseMaster BERHASIL: Semua Sheet dan Header Kolom telah diperbarui!");
  return "Setup Database Master Berhasil Dijalankan!";
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

    // 2. SINKRONISASI ABSENSI KELAS
    if (action === "absensi_baru") {
      var attSheet = ss.getSheetByName("Absensi Siswa");
      if (!attSheet) {
        setupDatabaseMaster();
        attSheet = ss.getSheetByName("Absensi Siswa");
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
