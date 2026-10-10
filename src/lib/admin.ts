import type { User } from "@supabase/supabase-js";

/**
 * Mendeteksi apakah user adalah admin (baik admin murni maupun double role).
 * Akun dianggap admin jika ada flag is_admin: true di user_metadata.
 */
export function isUserAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  const email = (user.email || "").toLowerCase().trim();
  const metaRole = (user.user_metadata?.role || "").toLowerCase().trim();
  const appRole = (user.app_metadata?.role || "").toLowerCase().trim();
  const isAdminFlag =
    user.user_metadata?.is_admin === true ||
    user.app_metadata?.is_admin === true;

  return (
    isAdminFlag ||
    metaRole === "platform administrator" ||
    metaRole === "administrator" ||
    metaRole === "admin" ||
    metaRole === "superadmin" ||
    appRole === "platform administrator" ||
    appRole === "administrator" ||
    appRole === "admin" ||
    appRole === "superadmin" ||
    email === "bernadya@gmail.com" ||
    email === "admin@ramu.id"
  );
}

