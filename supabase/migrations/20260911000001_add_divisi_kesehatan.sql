-- Migration: Add Divisi Kesehatan
INSERT INTO public.divisions (
    name,
    slug,
    description,
    icon,
    display_order,
    is_active,
    role_title,
    lead_name
) VALUES (
    'Divisi Kesehatan',
    'kesehatan',
    'Pelayanan kesehatan siswa, pemeriksaan berkala UKS, penanganan gawat darurat ringan, dan standarisasi higienitas lingkungan.',
    'HeartPulse',
    9,
    true,
    'Koordinator Layanan Kesehatan, UKS & Sanitasi Lingkungan',
    'dr. H. Rahmat Hidayat / Tim Medis'
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    role_title = EXCLUDED.role_title,
    lead_name = EXCLUDED.lead_name;
