export interface ClassStudentInfo {
  id: string;
  token?: string;
  name: string;
  nickname: string;
  class_id: string;
  class_name?: string;
  pin?: string;
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
      { id: 'std_01', token: 'kenzo-404', name: 'Kenzo Alfarizi Pratama', nickname: 'Kenzo', class_id: 'cls_kids_a', class_name: 'Kids A', pin: '123456' },
      { id: 'std_02', token: 'nadira-202', name: 'Nadira Alya Putri', nickname: 'Alya', class_id: 'cls_kids_a', class_name: 'Kids A', pin: '654321' },
      { id: 'std_03', token: 'dimas-303', name: 'Dimas Prasetyo Nugroho', nickname: 'Dimas', class_id: 'cls_kids_a', class_name: 'Kids A', pin: '112233' },
      { id: 'std_04', token: 'raisa-404', name: 'Raisa Zahra Salsabila', nickname: 'Raisa', class_id: 'cls_kids_a', class_name: 'Kids A', pin: '223344' },
      { id: 'std_05', token: 'fadhil-505', name: 'Fadhil Ramadhan Hidayat', nickname: 'Fadhil', class_id: 'cls_kids_a', class_name: 'Kids A', pin: '334455' },
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
      { id: 'std_06', token: 'arka-606', name: 'Arka Danendra', nickname: 'Arka', class_id: 'cls_kids_b', class_name: 'Kids B', pin: '445566' },
      { id: 'std_07', token: 'bella-707', name: 'Bella Safira', nickname: 'Bella', class_id: 'cls_kids_b', class_name: 'Kids B', pin: '556677' },
      { id: 'std_08', token: 'cahya-808', name: 'Cahya Kamila', nickname: 'Cahya', class_id: 'cls_kids_b', class_name: 'Kids B', pin: '667788' },
      { id: 'std_09', token: 'davin-909', name: 'Davin Narendra', nickname: 'Davin', class_id: 'cls_kids_b', class_name: 'Kids B', pin: '778899' },
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
      { id: 'std_10', token: 'farez-101', name: 'Farezka Putra Pratama', nickname: 'Farez', class_id: 'cls_teens_1', class_name: 'Teens 1', pin: '121212' },
      { id: 'std_11', token: 'gisel-202', name: 'Gisella Amanda', nickname: 'Gisel', class_id: 'cls_teens_1', class_name: 'Teens 1', pin: '232323' },
      { id: 'std_12', token: 'hanif-303', name: 'Hanif Wicaksono', nickname: 'Hanif', class_id: 'cls_teens_1', class_name: 'Teens 1', pin: '343434' },
      { id: 'std_13', token: 'indira-404', name: 'Indira Callista', nickname: 'Indira', class_id: 'cls_teens_1', class_name: 'Teens 1', pin: '454545' },
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
      { id: 'std_14', token: 'kevin-505', name: 'Kevin Jonathan', nickname: 'Kevin', class_id: 'cls_teens_2', class_name: 'Teens 2', pin: '565656' },
      { id: 'std_15', token: 'laras-606', name: 'Larasati Putri', nickname: 'Laras', class_id: 'cls_teens_2', class_name: 'Teens 2', pin: '676767' },
      { id: 'std_16', token: 'mahendra-707', name: 'Mahendra Putra', nickname: 'Ender', class_id: 'cls_teens_2', class_name: 'Teens 2', pin: '787878' },
      { id: 'std_17', token: 'nabila-808', name: 'Nabila Syakieb', nickname: 'Nabila', class_id: 'cls_teens_2', class_name: 'Teens 2', pin: '898989' },
    ],
  },
];
