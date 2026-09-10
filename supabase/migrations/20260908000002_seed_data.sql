-- ==============================================================================
-- MIGRATION: 20260908000002_seed_data.sql
-- DESCRIPTION: Seed 8 divisions, active weekly plan, tasks, and initial settings
-- ==============================================================================

DO $$
DECLARE
  v_plan_id UUID;
  v_div_sdma UUID;
  v_div_tk UUID;
  v_div_sdm UUID;
  v_div_quran UUID;
  v_div_sarpras UUID;
  v_div_bilingual UUID;
  v_div_media UUID;
  v_div_it UUID;
BEGIN
  -- 1. INSERT INITIAL APP SETTINGS
  INSERT INTO public.app_settings (key, value)
  VALUES
    ('presentation_interval', '10'),
    ('organization_name', 'Weekly Work Plan')
  ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = NOW();

  -- 2. INSERT 8 DIVISIONS
  INSERT INTO public.divisions (name, slug, description, icon, display_order, is_active)
  VALUES
    (
      'Pengawas SD–MA',
      'pengawas-sd-ma',
      'Pengawasan mutu akademik, supervisi klinis guru, dan evaluasi kurikulum unit SD, SMP, hingga MA.',
      'GraduationCap',
      1,
      TRUE
    )
  ON CONFLICT (slug) DO UPDATE
    SET name = EXCLUDED.name, description = EXCLUDED.description, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_div_sdma;

  INSERT INTO public.divisions (name, slug, description, icon, display_order, is_active)
  VALUES
    (
      'Pengawas TK',
      'pengawas-tk',
      'Pemantauan perkembangan sensori-motorik, sentra belajar tematik, dan implementasi parenting edukatif.',
      'Sparkles',
      2,
      TRUE
    )
  ON CONFLICT (slug) DO UPDATE
    SET name = EXCLUDED.name, description = EXCLUDED.description, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_div_tk;

  INSERT INTO public.divisions (name, slug, description, icon, display_order, is_active)
  VALUES
    (
      'Manager SDM & Penjamin Mutu',
      'sdm-penjamin-mutu',
      'Pengembangan kapasitas sumber daya insani, kedisiplinan, penegakan standar mutu ISO, dan audit SOP.',
      'Users',
      3,
      TRUE
    )
  ON CONFLICT (slug) DO UPDATE
    SET name = EXCLUDED.name, description = EXCLUDED.description, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_div_sdm;

  INSERT INTO public.divisions (name, slug, description, icon, display_order, is_active)
  VALUES
    (
      'Manager Qur''an',
      'manager-quran',
      'Pengawalan standarisasi tahsin, tahfidz mutqin, tasmi'' berkala, dan pembinaan ruhiyah seluruh sivitas.',
      'BookOpen',
      4,
      TRUE
    )
  ON CONFLICT (slug) DO UPDATE
    SET name = EXCLUDED.name, description = EXCLUDED.description, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_div_quran;

  INSERT INTO public.divisions (name, slug, description, icon, display_order, is_active)
  VALUES
    (
      'Manager Sarana Prasarana',
      'sarana-prasarana',
      'Pemeliharaan aset fisik, sanitasi gedung, kesiapan utilitas listrik/air, dan pemenuhan sarana belajar.',
      'Building2',
      5,
      TRUE
    )
  ON CONFLICT (slug) DO UPDATE
    SET name = EXCLUDED.name, description = EXCLUDED.description, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_div_sarpras;

  INSERT INTO public.divisions (name, slug, description, icon, display_order, is_active)
  VALUES
    (
      'Tim Bilingual',
      'tim-bilingual',
      'Peningkatan kapabilitas komunikasi dwibahasa santri, English-Arabic day, immersion class, dan uji TOEFL/TOAFL.',
      'Languages',
      6,
      TRUE
    )
  ON CONFLICT (slug) DO UPDATE
    SET name = EXCLUDED.name, description = EXCLUDED.description, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_div_bilingual;

  INSERT INTO public.divisions (name, slug, description, icon, display_order, is_active)
  VALUES
    (
      'Tim Media',
      'tim-media',
      'Strategi visual branding yayasan, produksi video edukasi, live streaming acara, dan pengelolaan sosial media.',
      'Camera',
      7,
      TRUE
    )
  ON CONFLICT (slug) DO UPDATE
    SET name = EXCLUDED.name, description = EXCLUDED.description, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_div_media;

  INSERT INTO public.divisions (name, slug, description, icon, display_order, is_active)
  VALUES
    (
      'Tim IT',
      'tim-it',
      'Infrastruktur cloud server, keamanan cyber, jaringan WiFi kampus, dan pemeliharaan aplikasi e-School.',
      'MonitorCog',
      8,
      TRUE
    )
  ON CONFLICT (slug) DO UPDATE
    SET name = EXCLUDED.name, description = EXCLUDED.description, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_div_it;

  -- 3. INSERT ACTIVE WEEKLY PLAN (PEKAN 37, 2026)
  INSERT INTO public.weekly_plans (week_number, year, week_start, week_end, title, is_active)
  VALUES (37, 2026, '2026-09-07', '2026-09-12', 'Rencana Kerja Pekan Ini', TRUE)
  ON CONFLICT (year, week_number) DO UPDATE
    SET title = EXCLUDED.title, week_start = EXCLUDED.week_start, week_end = EXCLUDED.week_end, is_active = EXCLUDED.is_active
  RETURNING id INTO v_plan_id;

  -- 4. INSERT REALISTIC TASKS FOR ALL 8 DIVISIONS (PEKAN 37)

  -- ============================================================================
  -- 1. Pengawas SD–MA (5 Tasks)
  -- ============================================================================
  INSERT INTO public.tasks (weekly_plan_id, division_id, title, description, date, start_time, end_time, pic, location, priority, status, progress, notes)
  VALUES
    (
      v_plan_id, v_div_sdma,
      'Supervisi Pembelajaran Kelas & Asesmen Formatif Guru Kelas 8',
      'Observasi langsung metode pembelajaran diferensiasi dan penerapan asesmen formatif di kelas.',
      '2026-09-07', '10:00:00', '11:45:00',
      'Ust. Ahmad Fauzi, M.Pd', 'Kelas 8 SMP', 'HIGH', 'COMPLETED', 100,
      'Catatan hasil supervisi telah didistribusikan ke kepala kurikulum'
    ),
    (
      v_plan_id, v_div_sdma,
      'Monitoring Kelengkapan Administrasi & Modul Ajar MA',
      'Verifikasi kesesuaian capaian pembelajaran, alur tujuan pembelajaran (ATP), dan modul ajar guru MA.',
      '2026-09-08', '13:00:00', '15:00:00',
      'Dra. Hj. Nurul Hidayah', 'Ruang Guru MA', 'HIGH', 'COMPLETED', 100,
      'Semua modul ajar semester ganjil telah divalidasi'
    ),
    (
      v_plan_id, v_div_sdma,
      'Evaluasi Program Lembaga & Ketercapaian Target Kurikulum SD',
      'Analisis capaian ketuntasan belajar siswa kelas 1-6 dan persiapan mid-term assessment.',
      '2026-09-09', '09:00:00', '11:30:00',
      'Ust. Ahmad Fauzi, M.Pd', 'Ruang Kepala SD', 'MEDIUM', 'IN_PROGRESS', 50,
      'Tahap rekap data capaian literasi dan numerasi siswa'
    ),
    (
      v_plan_id, v_div_sdma,
      'Klinik Pembelajaran & Bimbingan Teknis Pedagogik Guru Muda',
      'Bimbingan teknis interaktif mengenai manajemen kelas dan komunikasi edukatif.',
      '2026-09-10', '13:30:00', '15:30:00',
      'Dra. Hj. Nurul Hidayah', 'Lab Microteaching', 'MEDIUM', 'NOT_STARTED', 0,
      'Modul bimbingan dan studi kasus telah disiapkan'
    ),
    (
      v_plan_id, v_div_sdma,
      'Penyusunan Laporan Pengawasan Pekanan & Rekomendasi Yayasan',
      'Kompilasi temuan lapangan dan penyusunan rekomendasi perbaikan untuk pimpinan yayasan.',
      '2026-09-12', '09:00:00', '11:00:00',
      'Tim Pengawas SD-MA', 'Ruang Pengawas', 'LOW', 'DELAYED', 30,
      'Menunggu rekap instrumen dari pengawas pendamping unit SMP'
    );

  -- ============================================================================
  -- 2. Pengawas TK (5 Tasks)
  -- ============================================================================
  INSERT INTO public.tasks (weekly_plan_id, division_id, title, description, date, start_time, end_time, pic, location, priority, status, progress, notes)
  VALUES
    (
      v_plan_id, v_div_tk,
      'Monitoring Kegiatan Pembelajaran TK & Sentra Bermain Peran',
      'Observasi interaksi sosial, kemandirian, dan motorik halus anak usia dini di sentra peran.',
      '2026-09-07', '08:00:00', '10:00:00',
      'Usth. Siti Rahmawati, S.Pd', 'Gedung TK Islam', 'HIGH', 'COMPLETED', 100,
      'Kegiatan sentra berjalan sangat interaktif dan kondusif'
    ),
    (
      v_plan_id, v_div_tk,
      'Supervisi Administrasi & Asesmen Tumbuh Kembang Kelompok B',
      'Pemeriksaan buku rekap capaian motorik kasar, bahasa, dan pembiasaan adab harian anak.',
      '2026-09-08', '08:30:00', '10:30:00',
      'Usth. Siti Rahmawati, S.Pd', 'Sentra Persiapan', 'HIGH', 'IN_PROGRESS', 60,
      'Sebagian portofolio anak masih dalam proses penilaian'
    ),
    (
      v_plan_id, v_div_tk,
      'Evaluasi Program Parenting Kolaboratif Wali Murid',
      'Koordinasi dan review persiapan seminar parenting tentang stimulasi kognitif anak usia dini.',
      '2026-09-09', '10:00:00', '12:00:00',
      'Usth. Laila Fitri, S.Pd', 'Aula Mini TK', 'MEDIUM', 'IN_PROGRESS', 40,
      'Konfirmasi narasumber ahli gizi anak sudah selesai'
    ),
    (
      v_plan_id, v_div_tk,
      'Pemeriksaan Media Ajar Berbasis Bahan Alam (Loose Parts)',
      'Standarisasi keamanan alat peraga edukatif dan kelayakan loose parts di area bermain luar.',
      '2026-09-10', '13:00:00', '14:30:00',
      'Usth. Siti Rahmawati, S.Pd', 'Ruang Guru TK', 'MEDIUM', 'NOT_STARTED', 0,
      'Pemeriksaan bersama tim pengadaan sarana TK'
    ),
    (
      v_plan_id, v_div_tk,
      'Workshop Peningkatan Keterampilan Storytelling Guru TK',
      'Pelatihan teknik ekspresi vokal dan penggunaan boneka tangan dalam bercerita kisah nabi.',
      '2026-09-11', '08:30:00', '11:00:00',
      'Usth. Laila Fitri, S.Pd', 'Ruang Audio Visual', 'MEDIUM', 'DELAYED', 20,
      'Jadwal narasumber tamu diundur ke pekan depan'
    );

  -- ============================================================================
  -- 3. Manager SDM & Penjamin Mutu (5 Tasks)
  -- ============================================================================
  INSERT INTO public.tasks (weekly_plan_id, division_id, title, description, date, start_time, end_time, pic, location, priority, status, progress, notes)
  VALUES
    (
      v_plan_id, v_div_sdm,
      'Audit Dokumen Mutu Standar Pelayanan & Administrasi Lembaga',
      'Audit sampling dokumen administrasi sekolah sesuai standar ISO 9001:2015.',
      '2026-09-07', '08:00:00', '11:00:00',
      'Drs. H. Mulyadi, M.Pd', 'Tata Usaha Pusat', 'HIGH', 'COMPLETED', 100,
      'Laporan audit tahap 1 telah ditandatangani kepala unit'
    ),
    (
      v_plan_id, v_div_sdm,
      'Monitoring Kehadiran & Rekap Kedisiplinan Pendidik/Tenaga Kependidikan',
      'Analisis rekap absensi biometrik, ketepatan kehadiran jam mengajar, dan rekap perizinan.',
      '2026-09-08', '13:00:00', '15:00:00',
      'Bambang Irawan, S.E', 'Ruang SDM Lt. 1', 'HIGH', 'COMPLETED', 100,
      'Tingkat kehadiran pekan berjalan mencapai 96.8%'
    ),
    (
      v_plan_id, v_div_sdm,
      'Evaluasi SOP Layanan Sarpras, Keuangan, & Infrastruktur IT',
      'Penyelarasan standar waktu respon penanganan keluhan dan perbaikan sarana sekolah.',
      '2026-09-09', '09:00:00', '11:30:00',
      'Drs. H. Mulyadi, M.Pd', 'Ruang Mutu', 'HIGH', 'IN_PROGRESS', 75,
      'Draft SOP revisi siap diajukan ke dewan pembina'
    ),
    (
      v_plan_id, v_div_sdm,
      'Pelatihan Service Excellence Petugas Front Office & Resepsionis',
      'Standardisasi komunikasi greeting, alur penanganan tamu yayasan, dan tata kelola informasi.',
      '2026-09-11', '13:30:00', '15:30:00',
      'Bambang Irawan, S.E', 'Aula Gedung C', 'MEDIUM', 'NOT_STARTED', 0,
      'Materi pelatihan dan handbook pelayanan telah siap cetak'
    ),
    (
      v_plan_id, v_div_sdm,
      'Pemberkasan Usulan Kenaikan Jenjang Karier Guru Tetap Yayasan',
      'Verifikasi berkas sertifikasi, angka kredit pengajaran, dan rekomendasi kepala sekolah.',
      '2026-09-12', '10:00:00', '12:00:00',
      'Tim SDM', 'Ruang SDM', 'LOW', 'NOT_STARTED', 0,
      'Menunggu kelengkapan SK dari yayasan'
    );

  -- ============================================================================
  -- 4. Manager Qur'an (5 Tasks)
  -- ============================================================================
  INSERT INTO public.tasks (weekly_plan_id, division_id, title, description, date, start_time, end_time, pic, location, priority, status, progress, notes)
  VALUES
    (
      v_plan_id, v_div_quran,
      'Monitoring Tahfidz Pagi Siswa SD & SMP',
      'Observasi halaqah tahfidz shubuh/pagi, konsistensi setoran juz 29 dan 30 santri binaan.',
      '2026-09-07', '07:00:00', '08:30:00',
      'Ust. Muhammad Wildan, Lc', 'Masjid Jami Yayasan', 'HIGH', 'COMPLETED', 100,
      'Target ziyadah hafalan baru tercapai 92%'
    ),
    (
      v_plan_id, v_div_quran,
      'Koordinasi Guru Qur''an & Penyelarasan Standar Tajwid',
      'Pertemuan pekanan mualim Qur''an membahas tajwid riwayat Hafsh ''an ''Ashim dan mutaba''ah santri.',
      '2026-09-08', '13:00:00', '14:30:00',
      'Ust. Muhammad Wildan, Lc', 'Qur''an Centre', 'HIGH', 'COMPLETED', 100,
      'Standar penilaian fashahah dan ghunnah telah disepakati'
    ),
    (
      v_plan_id, v_div_quran,
      'Evaluasi Capaian Hafalan & Supervisi Ujian Kenaikan Juz',
      'Pengujian kenaikan tingkat hafalan bagi 24 santri yang menyelesaikan juz 30 dan 29.',
      '2026-09-09', '08:00:00', '11:30:00',
      'Ust. Farhan Asyraf, S.Q', 'Aula Qur''an Centre', 'HIGH', 'IN_PROGRESS', 70,
      '18 santri telah lulus dengan predikat mumtaz'
    ),
    (
      v_plan_id, v_div_quran,
      'Persiapan Teknis Tasmi'' Akbar 5 Juz Sekali Duduk',
      'Briefing penguji musyrif penyimak dan penyiapan syahadah penghargaan bagi santri pilihan.',
      '2026-09-10', '09:00:00', '11:00:00',
      'Ust. Muhammad Wildan, Lc', 'Masjid Utama', 'HIGH', 'IN_PROGRESS', 50,
      '12 peserta terpilih telah menyelesaikan gladi bersih'
    ),
    (
      v_plan_id, v_div_quran,
      'Kajian Tadabbur Ayat & Halaqah Ruhiyah Asatidzah',
      'Kajian rutin tematik tafsir surat Al-Furqan untuk meningkatkan integritas pengajar Qur''an.',
      '2026-09-11', '16:00:00', '17:30:00',
      'Ust. Muhammad Wildan, Lc', 'Perpustakaan Islam', 'MEDIUM', 'NOT_STARTED', 0,
      'Jadwal ba''da ashar di perpustakaan lantai 2'
    );

  -- ============================================================================
  -- 5. Manager Sarana Prasarana (5 Tasks)
  -- ============================================================================
  INSERT INTO public.tasks (weekly_plan_id, division_id, title, description, date, start_time, end_time, pic, location, priority, status, progress, notes)
  VALUES
    (
      v_plan_id, v_div_sarpras,
      'Maintenance Fasilitas AC & Sirkulasi Udara Gedung A',
      'Pembersihan filter udara, pengecekan freon, dan perbaikan pendingin ruangan di 16 ruang kelas.',
      '2026-09-07', '08:00:00', '12:00:00',
      'Joko Susilo & Teknisi', 'Gedung A (Kelas 7-9)', 'MEDIUM', 'COMPLETED', 100,
      'Seluruh unit AC ruang kelas beroperasi normal'
    ),
    (
      v_plan_id, v_div_sarpras,
      'Pengecekan Fasilitas Kelistrikan, Panel ATS, & Genset Cadangan',
      'Uji beban sistem pemindahan otomatis daya listrik dan pembersihan tangki solar generator.',
      '2026-09-08', '09:00:00', '11:00:00',
      'Ir. Hendra Gunawan', 'Ruang Powerhouse', 'HIGH', 'IN_PROGRESS', 60,
      'Simulasi pemadaman PLN dan genset switch-over berjalan baik'
    ),
    (
      v_plan_id, v_div_sarpras,
      'Monitoring Inventaris & Sensus Meubelair Ruang Belajar Baru',
      'Pemberian barcode aset tetap pada 80 set meja kursi siswa di gedung sayap timur.',
      '2026-09-09', '13:00:00', '15:30:00',
      'Agus Purnomo', 'Gedung Sayap Timur', 'MEDIUM', 'IN_PROGRESS', 45,
      '50 set meja kursi telah selesai dilabeli'
    ),
    (
      v_plan_id, v_div_sarpras,
      'Perbaikan Sistem Sanitasi & Pompa Air Bersih Asrama Santri',
      'Penggantian katup pipa booster distribusi dan pengurasan toren air penampung utama.',
      '2026-09-10', '08:30:00', '14:00:00',
      'Tim Plumbing', 'Asrama Santri Lt. 1 & 2', 'HIGH', 'NOT_STARTED', 0,
      'Peralatan pengganti pipa telah tersedia di gudang logistik'
    ),
    (
      v_plan_id, v_div_sarpras,
      'Revitalisasi Area Taman Terbuka Hijau & Jalur Pedestrian Kampus',
      'Penanaman rumput gajah mini dan perapihan paving block akses siswa.',
      '2026-09-11', '08:00:00', '11:30:00',
      'Agus Purnomo', 'Halaman Tengah', 'LOW', 'DELAYED', 15,
      'Pengiriman paving pengganti tertunda dari supplier'
    );

  -- ============================================================================
  -- 6. Tim Bilingual (5 Tasks)
  -- ============================================================================
  INSERT INTO public.tasks (weekly_plan_id, division_id, title, description, date, start_time, end_time, pic, location, priority, status, progress, notes)
  VALUES
    (
      v_plan_id, v_div_bilingual,
      'English Morning Program & Daily Vocabulary Booster',
      'Penyampaian idiom bahasa Inggris harian dan pembiasaan percakapan dua arah di apel pagi.',
      '2026-09-07', '07:15:00', '07:45:00',
      'Sarah Amanda, M.A', 'Lapangan Utama', 'HIGH', 'COMPLETED', 100,
      'Diikuti oleh seluruh santri dan asatidzah dengan antusias'
    ),
    (
      v_plan_id, v_div_bilingual,
      'Monitoring Penegakan "English & Arabic Zone" Asrama Santri',
      'Pengecekan disiplin berbahasa asing santri di area asrama binaan pada jam bebas.',
      '2026-09-08', '19:30:00', '21:00:00',
      'Ust. Dimas Wahyu, B.Ed', 'Kompleks Asrama', 'MEDIUM', 'IN_PROGRESS', 50,
      'Catatan mutaba''ah bahasa santri telah dihimpun pengurus asrama'
    ),
    (
      v_plan_id, v_div_bilingual,
      'Workshop Pengayaan Modul TOEFL ITP Siswa MA Kelas 12',
      'Bedah strategi listening comprehension dan structure grammar persiapan seleksi perguruan tinggi.',
      '2026-09-09', '13:30:00', '15:30:00',
      'Sarah Amanda, M.A', 'Lab Bahasa 1', 'HIGH', 'IN_PROGRESS', 65,
      'Siswa aktif mengerjakan paket soal simulasi TOEFL'
    ),
    (
      v_plan_id, v_div_bilingual,
      'Simulasi Arabic Speech & Debate Contest Santri Unggulan',
      'Latihan intonasi khitobah dan penguasaan argumen ilmiah berbahasa Arab tingkat madya.',
      '2026-09-10', '10:00:00', '12:00:00',
      'Ust. Dimas Wahyu, B.Ed', 'Mini Hall Bilingual', 'MEDIUM', 'NOT_STARTED', 0,
      'Materi debat seputar pendidikan Islam modern'
    ),
    (
      v_plan_id, v_div_bilingual,
      'Evaluasi Program Bilingual & Penerbitan Mading Edisi Spesial',
      'Review redaksional artikel dwibahasa karya santri untuk publikasi majalah dinding berkala.',
      '2026-09-11', '14:00:00', '16:00:00',
      'Sarah Amanda, M.A', 'Ruang Bilingual', 'LOW', 'NOT_STARTED', 0,
      'Proofreading naskah bahasa Inggris dan Arab'
    );

  -- ============================================================================
  -- 7. Tim Media (5 Tasks)
  -- ============================================================================
  INSERT INTO public.tasks (weekly_plan_id, division_id, title, description, date, start_time, end_time, pic, location, priority, status, progress, notes)
  VALUES
    (
      v_plan_id, v_div_media,
      'Dokumentasi Kegiatan Belajar Pekanan & Arsip Micro-Moments',
      'Liputan fotografi resolusi tinggi kegiatan laboratorium sain dan aktivitas kelas tahfidz.',
      '2026-09-07', '09:00:00', '11:30:00',
      'Rian Pratama, S.I.Kom', 'Kompleks SD & MA', 'MEDIUM', 'COMPLETED', 100,
      '300+ foto terpilih telah diunggah ke cloud drive dokumentasi'
    ),
    (
      v_plan_id, v_div_media,
      'Editing Video Profil Prestasi Siswa & Serial Teaser Milad',
      'Produksi video sinematik santri peraih medali olimpiade sains nasional dan persiapan milad.',
      '2026-09-08', '13:00:00', '16:00:00',
      'Ilham Kurnia (Videografer)', 'Studio Multimedia', 'HIGH', 'IN_PROGRESS', 80,
      'Proses color grading dan penambahan subtitle bilingual'
    ),
    (
      v_plan_id, v_div_media,
      'Publikasi Media Sosial & Konten Reels Edukasi Parenting',
      'Desain feed infografis dan penayangan reels tips membimbing anak usia sekolah di Instagram/TikTok.',
      '2026-09-09', '10:00:00', '14:00:00',
      'Dinda Ayu (Editor)', 'Editing Suite Lt. 2', 'MEDIUM', 'IN_PROGRESS', 60,
      'Jadwal penayangan postingan: pukul 17:00 WIB'
    ),
    (
      v_plan_id, v_div_media,
      'Finalisasi Desain Tata Letak Buletin Warta Yayasan Edisi September',
      'Penataan layout artikel wawancara pimpinan dan kolom opini guru untuk edisi bulanan.',
      '2026-09-10', '09:00:00', '12:00:00',
      'Rian Pratama, S.I.Kom', 'Ruang Media', 'HIGH', 'NOT_STARTED', 0,
      'Menunggu persetujuan redaksi akhir dari sekretariat yayasan'
    ),
    (
      v_plan_id, v_div_media,
      'Setup Teknis Live Streaming Broadcast Kajian Akbar Jum''at',
      'Konfigurasi multi-kamera switcher, mixer audio wireless, dan encoder streaming YouTube.',
      '2026-09-11', '10:30:00', '13:00:00',
      'Tim Broadcast Media', 'Masjid Jami', 'HIGH', 'NOT_STARTED', 0,
      'Uji coba bitrate internet 50 Mbps untuk streaming stabil'
    );

  -- ============================================================================
  -- 8. Tim IT (5 Tasks)
  -- ============================================================================
  INSERT INTO public.tasks (weekly_plan_id, division_id, title, description, date, start_time, end_time, pic, location, priority, status, progress, notes)
  VALUES
    (
      v_plan_id, v_div_it,
      'Maintenance Jaringan Router Core & Bandwidth Management',
      'Optimasi routing BGP multi-WAN, pembagian bandwidth per gedung, dan monitoring kestabilan koneksi.',
      '2026-09-07', '08:30:00', '11:30:00',
      'Fajar Nugraha, S.Kom', 'Server Room Lt. 2', 'HIGH', 'COMPLETED', 100,
      'Latensi jaringan antar gedung turun stabil di bawah 2 ms'
    ),
    (
      v_plan_id, v_div_it,
      'IT Support & Penanganan Tiket Gangguan Fasilitas Sekolah',
      'Troubleshooting printer kantor tata usaha, perbaikan proyektor ruang kelas, dan instalasi software.',
      '2026-09-08', '08:00:00', '16:00:00',
      'Bayu Wicaksono', 'Unit Belajar Seluruh Gedung', 'MEDIUM', 'IN_PROGRESS', 75,
      '14 tiket keluhan berhasil diselesaikan tepat waktu'
    ),
    (
      v_plan_id, v_div_it,
      'Update Sistem Portal Akademik & Penambalan Keamanan',
      'Pembaruan modul input nilai rapor santri dan pembaruan sertifikat SSL portal sekolah.',
      '2026-09-09', '13:00:00', '17:00:00',
      'Fajar Nugraha, S.Kom', 'NOC / Lab IT', 'HIGH', 'IN_PROGRESS', 55,
      'Testing modul rapor di environment staging berhasil tanpa kendala'
    ),
    (
      v_plan_id, v_div_it,
      'Backup Data Rutin Mingguan & Verifikasi Cold Storage',
      'Pencadangan database e-learning, berkas administrasi sekolah, dan sinkronisasi snapshot offsite.',
      '2026-09-10', '15:00:00', '17:30:00',
      'Fajar Nugraha, S.Kom', 'Data Center', 'HIGH', 'NOT_STARTED', 0,
      'Checksum backup otomatis diverifikasi dengan enkripsi AES-256'
    ),
    (
      v_plan_id, v_div_it,
      'Audit Keamanan Access Point WiFi Asrama Santri',
      'Pemeriksaan coverage sinyal WiFi, pembatasan akses situs terlarang, dan audit firewall asrama.',
      '2026-09-11', '09:00:00', '11:30:00',
      'Bayu Wicaksono', 'Asrama Santri Putra/Putri', 'LOW', 'NOT_STARTED', 0,
      'Pemeriksaan firmware access point Ubiquiti'
    );

END $$;
