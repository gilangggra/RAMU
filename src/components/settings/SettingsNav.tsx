"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCircle, Camera, CreditCard, Sliders } from "lucide-react";

export function SettingsNav() {
  const pathname = usePathname();

  const links = [
    { href: "/settings/profile", label: "Profil Dasar", icon: UserCircle },
    { href: "/settings/specs", label: "Spesifikasi & Comp Card", icon: Camera },
    { href: "/settings/rates", label: "Paket Layanan & Tarif", icon: CreditCard },
    { href: "/settings/preferences", label: "Preferensi Kolaborasi", icon: Sliders },
  ];

  return (
    <nav className="w-full lg:w-64 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none shrink-0 border-b lg:border-b-0 lg:border-r border-stone-200 lg:pr-6">
      {links.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all whitespace-nowrap lg:whitespace-normal ${
              isActive
                ? "bg-[#1E1B2E] text-white shadow-sm font-bold"
                : "text-stone-600 hover:text-[#1E1B2E] hover:bg-stone-100/80 font-medium"
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-amber-400" : "text-stone-400"}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
