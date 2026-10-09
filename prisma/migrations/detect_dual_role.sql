-- =============================================================================
-- detect_dual_role.sql
-- Jalankan di Supabase SQL Editor untuk mendeteksi akun yang memiliki
-- is_admin = true DAN juga memiliki profil actor di tabel public.actors
-- (dual role: admin + kreator).
--
-- PENTING: File ini hanya untuk inspeksi manual. JANGAN hapus data otomatis.
-- Tindak lanjut harus dilakukan secara manual setelah dikonfirmasi.
-- =============================================================================

SELECT
  au.id                                              AS user_id,
  au.email,
  (au.raw_user_meta_data ->> 'is_admin')             AS is_admin_flag,
  a.id                                               AS actor_id,
  a.actor_type,
  a.sector,
  a.status                                           AS actor_status,
  a.created_at                                       AS actor_created_at
FROM auth.users au
INNER JOIN public.actors a ON a.owner_user_id = au.id
WHERE (au.raw_user_meta_data ->> 'is_admin')::boolean = true
ORDER BY au.email;

-- =============================================================================
-- Untuk melihat semua akun dengan is_admin = true (termasuk yang tidak punya actor):
-- =============================================================================

SELECT
  id        AS user_id,
  email,
  raw_user_meta_data ->> 'is_admin' AS is_admin_flag,
  created_at
FROM auth.users
WHERE (raw_user_meta_data ->> 'is_admin')::boolean = true
ORDER BY created_at;
