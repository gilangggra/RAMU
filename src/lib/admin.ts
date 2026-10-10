import type { User } from "@supabase/supabase-js";

/**
 * Mendeteksi apakah user adalah admin.
 * Keamanan: Hanya membaca app_metadata (tamper-proof dari server)
 * dan daftar email admin resmi terverifikasi (via env ADMIN_EMAILS).
 * user_metadata sengaja TIDAK dipercaya karena dapat dimodifikasi oleh client-side SDK.
 */
export function isUserAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  const email = (user.email || "").toLowerCase().trim();
  const appRole = (user.app_metadata?.role || "").toLowerCase().trim();
  const isAppAdmin = user.app_metadata?.is_admin === true;

  // Daftar email admin dari environment variable atau fallback bawaan
  const envAdminEmails = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)
    : ["bernadya@gmail.com", "admin@ramu.id"];

  const isAdminEmail = envAdminEmails.includes(email);

  const isServerRoleAdmin =
    appRole === "platform administrator" ||
    appRole === "administrator" ||
    appRole === "admin" ||
    appRole === "superadmin";

  return isAppAdmin || isServerRoleAdmin || isAdminEmail;
}

