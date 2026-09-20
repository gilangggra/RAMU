"use client";

import { useState } from "react";
import Link from "next/link";
import { logout } from "@/app/(auth)/actions";
import {
  LayoutDashboard,
  Lightbulb,
  Megaphone,
  Handshake,
  Package,
  Target,
  Search,
  ShieldAlert,
  Zap,
  Menu,
  X,
} from "lucide-react";

interface ActorInfo {
  id: string;
  name: string;
  sector: string;
  location?: string | null;
  actorType?: string;
}

interface AppShellProps {
  actor: ActorInfo;
  activeRoute: string;
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/opportunities", label: "Peluang Kolaborasi", icon: <Lightbulb className="w-4 h-4" /> },
  { href: "/projects", label: "Project Briefs", icon: <Megaphone className="w-4 h-4" />, badge: "Baru" },
  { href: "/collaborations", label: "Ruang Kolaborasi", icon: <Handshake className="w-4 h-4" /> },
];

const INPUT_LAYER_NAV: NavItem[] = [
  { href: "/assets", label: "Aset Saya", icon: <Package className="w-4 h-4" /> },
  { href: "/goals", label: "Goal (Tujuan)", icon: <Target className="w-4 h-4" /> },
  { href: "/needs", label: "Kebutuhan", icon: <Search className="w-4 h-4" /> },
  { href: "/constraints", label: "Batasan Operasional", icon: <ShieldAlert className="w-4 h-4" /> },
];

const SYSTEM_NAV: NavItem[] = [
  { href: "/engine-insights", label: "Engine Insights", icon: <Zap className="w-4 h-4" /> },
];

export function AppShell({ actor, activeRoute, children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function isItemActive(href: string) {
    if (href === "/dashboard") return activeRoute === "/dashboard";
    return activeRoute.startsWith(href);
  }

  const renderNavLinks = (items: NavItem[]) => (
    <ul className="space-y-1">
      {items.map((item) => {
        const active = isItemActive(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                active
                  ? "bg-primary-900/60 text-primary-200 border border-primary-700/60 shadow-sm shadow-primary-950 font-semibold"
                  : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`text-base shrink-0 transition-transform ${active ? "scale-110" : "group-hover:scale-110"}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                  {item.badge}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-primary-600/30 selection:text-primary-200">
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-neutral-950/95 border-r border-neutral-800/80 z-40 backdrop-blur-md">
        <div className="p-5 border-b border-neutral-800/80">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 border border-primary-500/30 flex items-center justify-center font-black text-white text-base shadow-md shadow-primary-950 group-hover:scale-105 transition-transform">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-primary-300 transition-colors">
                  RAMU
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-primary-800/50 text-primary-300 border border-primary-600/30">
                  Engine
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-medium">Creative Opportunity Engine</p>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
              Utama
            </p>
            {renderNavLinks(PRIMARY_NAV)}
          </div>

          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
              Input Layer
            </p>
            {renderNavLinks(INPUT_LAYER_NAV)}
          </div>

          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
              Sistem Analisis
            </p>
            {renderNavLinks(SYSTEM_NAV)}
          </div>
        </div>

        <div className="p-3.5 border-t border-neutral-800/80 bg-neutral-900/40">
          <div className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-700 to-neutral-800 border border-primary-600/30 flex items-center justify-center font-bold text-xs text-primary-200 shrink-0">
                {actor.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-200 truncate">{actor.name}</p>
                <p className="text-[10px] text-neutral-400 truncate">{actor.sector}</p>
              </div>
            </div>

            <form action={logout}>
              <button
                type="submit"
                title="Keluar dari akun"
                className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </aside>

      <header className="md:hidden sticky top-0 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex items-center justify-between z-30">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-900 border border-primary-500/30 flex items-center justify-center font-bold text-white text-xs">
            R
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white">RAMU</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-300 font-semibold truncate max-w-[120px]">
            {actor.name}
          </span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-neutral-950 border-t border-neutral-800 p-5 rounded-t-3xl max-h-[80vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Menu Navigasi</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-neutral-400 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-neutral-500 mb-2">Utama</p>
              {renderNavLinks(PRIMARY_NAV)}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-neutral-500 mb-2">Input Layer</p>
              {renderNavLinks(INPUT_LAYER_NAV)}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-neutral-500 mb-2">Sistem</p>
              {renderNavLinks(SYSTEM_NAV)}
            </div>
            <div className="pt-3 border-t border-neutral-800">
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20 text-center"
                >
                  Keluar dari Akun
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="md:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto pb-24 md:pb-12 space-y-8 animate-fade-in">
          {children}
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800/90 px-3 py-2 flex items-center justify-around z-40">
        {[
          { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
          { href: "/opportunities", label: "Peluang", icon: <Lightbulb className="w-5 h-5" /> },
          { href: "/projects", label: "Proyek", icon: <Megaphone className="w-5 h-5" /> },
          { href: "/collaborations", label: "Kolaborasi", icon: <Handshake className="w-5 h-5" /> },
          { href: "/assets", label: "Aset", icon: <Package className="w-5 h-5" /> },
        ].map((item) => {
          const active = isItemActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
                active ? "text-primary-300 font-bold" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <span>{item.icon}</span>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
