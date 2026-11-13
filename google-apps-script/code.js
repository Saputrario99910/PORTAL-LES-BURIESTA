/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: SINKRONISASI DATABASE PORTAL WALI MURID
 * =========================================================================
 */

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var request = JSON.parse(rawData);
    var action = request.action;
    var data = request.data || {};
    var timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 0. VERIFIKASI LOGIN PIN WALI MURID (Berdasarkan Token Siswa & 6-Digit PIN)
    if (action === "verify_pin") {
      var studentSheet = ss.getSheetByName("Data Akun Siswa");
      if (!studentSheet) {
        studentSheet = initStudentAccountsSheet(ss);
      }

      var rows = studentSheet.getDataRange().getValues();
      var targetToken = (data.token || "").toLowerCase().trim();
      var inputPin = String(data.pin || "").trim();

      // Cari baris siswa yang cocok dengan token
      var foundStudent = null;
      for (var i = 1; i < rows.length; i++) {
        var rowToken = String(rows[i][1] || "").toLowerCase().trim(); // Kolom B: Token
        var rowPin = String(rows[i][5] || "").trim(); // Kolom F: 6 Digit PIN

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

// Helper untuk membuat sheet "Data Akun Siswa" jika belum ada
function initStudentAccountsSheet(ss) {
  var sheet = ss.insertSheet("Data Akun Siswa");
  sheet.appendRow([
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
  sheet.getRange("A1:I1").setFontWeight("bold").setBackground("#fed7aa");

  // Tambahkan baris awal untuk Kenzo
  sheet.appendRow([
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

  return sheet;
}

function doGet(e) {
  return ContentService.createTextOutput("Webhook Portal Wali Murid Rumah Belajar English Aktif!");
}
