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

interface SettingsNavProps {
  isBrand?: boolean;
  actorId?: string;
}

export function SettingsNav({ isBrand, actorId }: SettingsNavProps = {}) {
  const pathname = usePathname();

  const accountLinks = [
    { href: "/settings/payout", label: "Rekening & Pencairan", icon: CreditCard },
    { href: "/settings/availability", label: "Ketersediaan & Jam Kerja", icon: Clock },
    { href: "/settings/legal", label: "Template SPK & Hak Cipta", icon: ShieldCheck },
    { href: "/settings/notifications", label: "Notifikasi", icon: Bell },
    { href: "/settings/security", label: "Keamanan Akun", icon: Lock },
  ];

  const publicLinks = [
    ...(actorId ? [{ href: `/directory/${actorId}`, label: "Profil & Comp Card", icon: UserCircle, external: true }] : []),
    { href: "/dashboard/showcase", label: "Portofolio Karya", icon: ImageIcon, external: true },
  ];

  return (
    <nav className="w-full lg:w-64 flex flex-col gap-6 shrink-0 border-b lg:border-b-0 lg:border-r border-stone-200 lg:pr-6 pb-6 lg:pb-0">
      {/* Group 1: Private Account Settings */}
      <div className="space-y-1.5">
        <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 select-none">
          Akun &amp; Operasional
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
                    ? "bg-stone-900 text-white font-semibold shadow-2xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/80"
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
      <div className="space-y-1.5 pt-2 border-t border-stone-100">
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
                className="flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100/80 transition-all font-medium group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0 text-stone-400 group-hover:text-stone-600" />
                  <span className="truncate">{item.label}</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-800 shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
