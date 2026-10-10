"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  Clock,
  ShieldCheck,
  Bell,
  Lock,
  UserCircle,
  Image as ImageIcon,
  ArrowUpRight,
} from "lucide-react";

export interface SettingsNavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SettingsNavProps {
  isBrand?: boolean;
  actorId?: string;
  /** Override daftar menu akun (default: menu role umum). */
  accountLinks?: SettingsNavLink[];
  /** Label grup menu akun (default: "Akun & Operasional"). */
  sectionLabel?: string;
  /** Tampilkan grup "Tampilan Publik" (default: true). */
  showPublicLinks?: boolean;
}

const DEFAULT_ACCOUNT_LINKS: SettingsNavLink[] = [
  { href: "/settings/profile", label: "Profil & Identitas", icon: UserCircle },
  { href: "/settings/payout", label: "Rekening & Pencairan", icon: CreditCard },
  { href: "/settings/availability", label: "Ketersediaan & Jam Kerja", icon: Clock },
  { href: "/settings/legal", label: "Template SPK & Hak Cipta", icon: ShieldCheck },
  { href: "/settings/notifications", label: "Notifikasi", icon: Bell },
  { href: "/settings/security", label: "Keamanan Akun", icon: Lock },
];

export function SettingsNav({
  isBrand: _isBrand,
  actorId,
  accountLinks = DEFAULT_ACCOUNT_LINKS,
  sectionLabel = "Akun & Operasional",
  showPublicLinks = true,
}: SettingsNavProps = {}) {
  const pathname = usePathname();

  const publicLinks = [
    ...(actorId ? [{ href: `/directory/${actorId}`, label: "Profil & Comp Card", icon: UserCircle, external: true }] : []),
    { href: "/dashboard/showcase", label: "Portofolio Karya", icon: ImageIcon, external: true },
  ];

  return (
    <nav className="w-full lg:w-64 flex flex-col gap-6 shrink-0 border-b lg:border-b-0 lg:border-r border-stone-200/80 lg:pr-6 pb-6 lg:pb-0">
      {/* Group 1: Private Account Settings */}
      <div className="space-y-1.5">
        <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 select-none">
          {sectionLabel}
        </div>
        <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0 scrollbar-none">
          {accountLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/settings");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs transition-all whitespace-nowrap lg:whitespace-normal font-medium ${
                  isActive
                    ? "bg-[#4CC9FE] text-white font-bold shadow-sm shadow-[#4CC9FE]/25"
                    : "text-[#716B7E] hover:text-[#27213D] hover:bg-stone-100/80"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-stone-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Group 2: Public Creative Showcase (Distinct) */}
      {showPublicLinks && (
      <div className="space-y-1.5 pt-2 border-t border-stone-200/60">
        <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 select-none">
          Tampilan Publik
        </div>
        <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0 scrollbar-none">
          {publicLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-xs text-[#716B7E] hover:text-[#27213D] hover:bg-stone-100/80 transition-all font-medium group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0 text-stone-400 group-hover:text-[#4CC9FE]" />
                  <span className="truncate">{item.label}</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#27213D] shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
      )}
    </nav>
  );
}
