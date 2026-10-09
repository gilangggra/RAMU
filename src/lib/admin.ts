import type { User } from "@supabase/supabase-js";

/**
 * Mendeteksi apakah user adalah admin (baik admin murni maupun double role).
 * Akun dianggap admin jika ada flag is_admin: true di user_metadata.
 */
export function isUserAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.user_metadata?.is_admin === true;
}
