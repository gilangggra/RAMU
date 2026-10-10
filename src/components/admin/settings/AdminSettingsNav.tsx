"use client";

import { Bell, Lock, UserCircle } from "lucide-react";
import { SettingsNav, type SettingsNavLink } from "@/components/settings/SettingsNav";

const ADMIN_SETTINGS_LINKS: SettingsNavLink[] = [
  { href: "/admin/settings/profile", label: "Profil & Identitas", icon: UserCircle },
  { href: "/admin/settings/notifications", label: "Notifikasi", icon: Bell },
  { href: "/admin/settings/security", label: "Keamanan Akun", icon: Lock },
];

/** Menu samping pengaturan admin — memakai ulang SettingsNav role umum. */
export function AdminSettingsNav() {
  return (
    <SettingsNav
      accountLinks={ADMIN_SETTINGS_LINKS}
      sectionLabel="Akun Admin"
      showPublicLinks={false}
    />
  );
}
