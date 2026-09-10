-- ==============================================================================
-- MIGRATION: 20260908000004_add_division_role_title_and_lead_name.sql
-- DESCRIPTION: Add role_title (subtitle) and lead_name (penanggung jawab) columns
--              to divisions table so Superadmin can customize them dynamically.
-- ==============================================================================

ALTER TABLE public.divisions
ADD COLUMN IF NOT EXISTS role_title TEXT,
ADD COLUMN IF NOT EXISTS lead_name TEXT;

-- Initial seed values for existing divisions
UPDATE public.divisions SET
  role_title = 'Koordinator Pengawas Pendidikan Dasar & Menengah',
  lead_name = 'Ust. Ahmad Fauzi, M.Pd'
WHERE slug = 'pengawas-sd-ma';

UPDATE public.divisions SET
  role_title = 'Pengawas Pendidikan Anak Usia Dini & TK Islam',
  lead_name = 'Usth. Siti Rahmawati, S.Pd'
WHERE slug = 'pengawas-tk';

UPDATE public.divisions SET
  role_title = 'Manager HRD & Penjaminan Mutu Internal',
  lead_name = 'Drs. H. Mulyadi, M.Pd'
WHERE slug = 'sdm-penjamin-mutu';

UPDATE public.divisions SET
  role_title = 'Manager Program Tahfidz & Pembelajaran Al-Qur''an',
  lead_name = 'Ust. Muhammad Zaki, Al-Hafidz'
WHERE slug = 'manager-quran';

UPDATE public.divisions SET
  role_title = 'Manager Pengelolaan Aset, Gedung & Logistik',
  lead_name = 'Ir. Bambang Sukoco'
WHERE slug = 'sarana-prasarana';

UPDATE public.divisions SET
  role_title = 'Koordinator Program Penguatan Bahasa Arab & Inggris',
  lead_name = 'Usth. Nurul Hidayah, M.Pd'
WHERE slug = 'tim-bilingual';

UPDATE public.divisions SET
  role_title = 'Koordinator Publikasi, Dokumentasi & Media Sosial',
  lead_name = 'Rizky Pratama, S.I.Kom'
WHERE slug = 'tim-media';

UPDATE public.divisions SET
  role_title = 'Kepala Divisi Teknologi Informasi & Infrastruktur Jaringan',
  lead_name = 'Fajar Nugraha, S.Kom'
WHERE slug = 'tim-it';
