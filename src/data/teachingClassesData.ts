export interface ClassStudentInfo {
  id: string;
  name: string;
  nickname: string;
  class_id: string;
}

export interface TeachingClass {
  id: string;
  name: string;
  level: string;
  schedule: string;
  room: string;
  total_meetings: number;
  students_count: number;
  students: ClassStudentInfo[];
  colorBadge: string;
}

export const teachingClassesData: TeachingClass[] = [
  {
    id: 'cls_kids_a',
    name: 'Kids A',
    level: 'Primary English Explorer (Kelas 3-4 SD)',
    schedule: 'Selasa & Kamis · 15:30 - 17:00 WIB',
    room: 'Ruang Belajar 1',
    total_meetings: 12,
    students_count: 5,
    colorBadge: 'bg-amber-100 text-amber-900 border-amber-300',
    students: [
      { id: 'st_1', name: 'Kenzo Alfarizi Pratama', nickname: 'Kenzo', class_id: 'cls_kids_a' },
      { id: 'st_2', name: 'Nadira Alya Putri', nickname: 'Alya', class_id: 'cls_kids_a' },
      { id: 'st_3', name: 'Dimas Prasetyo Nugroho', nickname: 'Dimas', class_id: 'cls_kids_a' },
      { id: 'st_4', name: 'Raisa Zahra Salsabila', nickname: 'Raisa', class_id: 'cls_kids_a' },
      { id: 'st_5', name: 'Fadhil Ramadhan Hidayat', nickname: 'Fadhil', class_id: 'cls_kids_a' },
    ],
  },
  {
    id: 'cls_kids_b',
    name: 'Kids B',
    level: 'Beginner Phonics & Vocabulary (Kelas 1-2 SD)',
    schedule: 'Senin & Rabu · 14:00 - 15:30 WIB',
    room: 'Ruang Belajar 2',
    total_meetings: 12,
    students_count: 4,
    colorBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    students: [
      { id: 'st_6', name: 'Arka Danendra', nickname: 'Arka', class_id: 'cls_kids_b' },
      { id: 'st_7', name: 'Bella Safira', nickname: 'Bella', class_id: 'cls_kids_b' },
      { id: 'st_8', name: 'Cahya Kamila', nickname: 'Cahya', class_id: 'cls_kids_b' },
      { id: 'st_9', name: 'Davin Narendra', nickname: 'Davin', class_id: 'cls_kids_b' },
    ],
  },
  {
    id: 'cls_teens_1',
    name: 'Teens 1',
    level: 'Intermediate Young Storytellers (Kelas 5-6 SD)',
    schedule: 'Selasa & Kamis · 17:00 - 18:30 WIB',
    room: 'Ruang Belajar Utama',
    total_meetings: 12,
    students_count: 4,
    colorBadge: 'bg-blue-100 text-blue-900 border-blue-300',
    students: [
      { id: 'st_10', name: 'Farezka Putra Pratama', nickname: 'Farez', class_id: 'cls_teens_1' },
      { id: 'st_11', name: 'Gisella Amanda', nickname: 'Gisel', class_id: 'cls_teens_1' },
      { id: 'st_12', name: 'Hanif Wicaksono', nickname: 'Hanif', class_id: 'cls_teens_1' },
      { id: 'st_13', name: 'Indira Callista', nickname: 'Indira', class_id: 'cls_teens_1' },
    ],
  },
  {
    id: 'cls_teens_2',
    name: 'Teens 2',
    level: 'Advanced Conversation & Grammar (SMP)',
    schedule: 'Jumat & Sabtu · 16:00 - 17:30 WIB',
    room: 'Ruang Diskusi',
    total_meetings: 12,
    students_count: 4,
    colorBadge: 'bg-purple-100 text-purple-900 border-purple-300',
    students: [
      { id: 'st_14', name: 'Kevin Jonathan', nickname: 'Kevin', class_id: 'cls_teens_2' },
      { id: 'st_15', name: 'Larasati Putri', nickname: 'Laras', class_id: 'cls_teens_2' },
      { id: 'st_16', name: 'Mahendra Putra', nickname: 'Ender', class_id: 'cls_teens_2' },
      { id: 'st_17', name: 'Nabila Syakieb', nickname: 'Nabila', class_id: 'cls_teens_2' },
    ],
  },
];
