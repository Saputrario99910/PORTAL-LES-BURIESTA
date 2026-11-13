export interface AdminPaymentVerification {
  id: string;
  student_id: string;
  student_name: string;
  nickname: string;
  student_class: string;
  billing_month: string;
  amount: number;
  upload_date: string;
  proof_image_url: string;
  sender_bank: string;
  sender_account_name: string;
  status: 'menunggu' | 'lunas';
  verified_at?: string;
}

export interface AdminStudentOption {
  id: string;
  name: string;
  class_level: string;
}

// 10 Siswa Indonesia dengan Status Pembayaran Menunggu Verifikasi
export const initialAdminPayments: AdminPaymentVerification[] = [
  {
    id: 'pay_01',
    student_id: 'std_01',
    student_name: 'Kenzo Alfarizi Pratama',
    nickname: 'Kenzo',
    student_class: 'Primary English Explorer (Kelas 3 SD)',
    billing_month: 'November 2024',
    amount: 250000,
    upload_date: '08 Nov 2024, 09.15 WIB',
    proof_image_url: 'https://picsum.photos/seed/struk1/400/600',
    sender_bank: 'BCA (Bank Central Asia)',
    sender_account_name: 'BAMBANG PRATAMA',
    status: 'menunggu',
  },
  {
    id: 'pay_02',
    student_id: 'std_02',
    student_name: 'Nadira Alya Putri',
    nickname: 'Alya',
    student_class: 'Beginner Kids Phonics (Kelas 1 SD)',
    billing_month: 'November 2024',
    amount: 250000,
    upload_date: '08 Nov 2024, 10.30 WIB',
    proof_image_url: 'https://picsum.photos/seed/struk2/400/600',
    sender_bank: 'Bank Mandiri',
    sender_account_name: 'SITI NURHALIZA',
    status: 'menunggu',
  },
  {
    id: 'pay_03',
    student_id: 'std_03',
    student_name: 'Dimas Prasetyo Nugroho',
    nickname: 'Dimas',
    student_class: 'Primary English Explorer (Kelas 4 SD)',
    billing_month: 'November 2024',
    amount: 250000,
    upload_date: '08 Nov 2024, 11.45 WIB',
    proof_image_url: 'https://picsum.photos/seed/struk3/400/600',
    sender_bank: 'BRI (Bank Rakyat Indonesia)',
    sender_account_name: 'AGUS NUGROHO',
    status: 'menunggu',
  },
  {
    id: 'pay_04',
    student_id: 'std_04',
    student_name: 'Raisa Zahra Salsabila',
    nickname: 'Raisa',
    student_class: 'Intermediate Young Storytellers (Kelas 5 SD)',
    billing_month: 'November 2024',
    amount: 275000,
    upload_date: '08 Nov 2024, 13.10 WIB',
    proof_image_url: 'https://picsum.photos/seed/struk4/400/600',
    sender_bank: 'BCA (Bank Central Asia)',
    sender_account_name: 'DEWI SALSABILA',
    status: 'menunggu',
  },
  {
    id: 'pay_05',
    student_id: 'std_05',
    student_name: 'Fadhil Ramadhan Hidayat',
    nickname: 'Fadhil',
    student_class: 'Beginner Kids Phonics (Kelas 2 SD)',
    billing_month: 'November 2024',
    amount: 250000,
    upload_date: '08 Nov 2024, 14.20 WIB',
    proof_image_url: 'https://picsum.photos/seed/struk5/400/600',
    sender_bank: 'BSI (Bank Syariah Indonesia)',
    sender_account_name: 'RAHMAT HIDAYAT',
    status: 'menunggu',
  },
  {
    id: 'pay_06',
    student_id: 'std_06',
    student_name: 'Annisa Maharani Kusuma',
    nickname: 'Annisa',
    student_class: 'Primary English Explorer (Kelas 3 SD)',
    billing_month: 'November 2024',
    amount: 250000,
    upload_date: '08 Nov 2024, 15.05 WIB',
    proof_image_url: 'https://picsum.photos/seed/struk6/400/600',
    sender_bank: 'Bank Mandiri',
    sender_account_name: 'KUSUMA WARDHANA',
    status: 'menunggu',
  },
  {
    id: 'pay_07',
    student_id: 'std_07',
    student_name: 'Bagas Wicaksono Putro',
    nickname: 'Bagas',
    student_class: 'Intermediate Young Storytellers (Kelas 6 SD)',
    billing_month: 'November 2024',
    amount: 275000,
    upload_date: '08 Nov 2024, 16.40 WIB',
    proof_image_url: 'https://picsum.photos/seed/struk7/400/600',
    sender_bank: 'BCA (Bank Central Asia)',
    sender_account_name: 'HENDRO WICAKSONO',
    status: 'menunggu',
  },
  {
    id: 'pay_08',
    student_id: 'std_08',
    student_name: 'Tiara Andini Lestari',
    nickname: 'Tiara',
    student_class: 'Beginner Kids Phonics (Kelas 1 SD)',
    billing_month: 'November 2024',
    amount: 250000,
    upload_date: '08 Nov 2024, 17.15 WIB',
    proof_image_url: 'https://picsum.photos/seed/struk8/400/600',
    sender_bank: 'BNI (Bank Negara Indonesia)',
    sender_account_name: 'LESTARI WIDODO',
    status: 'menunggu',
  },
  {
    id: 'pay_09',
    student_id: 'std_09',
    student_name: 'Rian Saputra Siregar',
    nickname: 'Rian',
    student_class: 'Primary English Explorer (Kelas 4 SD)',
    billing_month: 'November 2024',
    amount: 250000,
    upload_date: '08 Nov 2024, 18.25 WIB',
    proof_image_url: 'https://picsum.photos/seed/struk9/400/600',
    sender_bank: 'BCA (Bank Central Asia)',
    sender_account_name: 'HASAN SIREGAR',
    status: 'menunggu',
  },
  {
    id: 'pay_10',
    student_id: 'std_10',
    student_name: 'Clarissa Aurelia Gunawan',
    nickname: 'Clarissa',
    student_class: 'Intermediate Young Storytellers (Kelas 5 SD)',
    billing_month: 'November 2024',
    amount: 275000,
    upload_date: '08 Nov 2024, 19.00 WIB',
    proof_image_url: 'https://picsum.photos/seed/struk10/400/600',
    sender_bank: 'QRIS BCA',
    sender_account_name: 'CLARISSA AURELIA G',
    status: 'menunggu',
  },
];

// Opsi Siswa untuk Form Dropdown Galeri
export const adminStudentOptions: AdminStudentOption[] = [
  { id: 'std_01', name: 'Kenzo Alfarizi Pratama', class_level: 'Kelas 3 SD' },
  { id: 'std_02', name: 'Nadira Alya Putri', class_level: 'Kelas 1 SD' },
  { id: 'std_03', name: 'Dimas Prasetyo Nugroho', class_level: 'Kelas 4 SD' },
  { id: 'std_04', name: 'Raisa Zahra Salsabila', class_level: 'Kelas 5 SD' },
  { id: 'std_05', name: 'Fadhil Ramadhan Hidayat', class_level: 'Kelas 2 SD' },
  { id: 'std_06', name: 'Annisa Maharani Kusuma', class_level: 'Kelas 3 SD' },
  { id: 'std_07', name: 'Bagas Wicaksono Putro', class_level: 'Kelas 6 SD' },
  { id: 'std_08', name: 'Tiara Andini Lestari', class_level: 'Kelas 1 SD' },
  { id: 'std_09', name: 'Rian Saputra Siregar', class_level: 'Kelas 4 SD' },
  { id: 'std_10', name: 'Clarissa Aurelia Gunawan', class_level: 'Kelas 5 SD' },
];
