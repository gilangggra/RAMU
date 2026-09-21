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
  LogOut,
  Users,
  Sparkles,
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
  { href: "/directory", label: "Profil Pelaku", icon: <Users className="w-4 h-4" /> },
  { href: "/showcase", label: "Karya & Inspirasi", icon: <Sparkles className="w-4 h-4" /> },
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
                  ? "bg-[#FFF4ED] text-[#E66A48] border border-[#FCD9C8] font-bold shadow-xs"
                  : "text-[#716B7E] hover:text-[#27213D] hover:bg-stone-100/70 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`text-base shrink-0 transition-transform ${
                    active ? "scale-110 text-[#E66A48]" : "group-hover:scale-110 text-[#9E98A8] group-hover:text-[#27213D]"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-[#FFF7ED] text-[#E66A48] border border-[#F9D8C4] shrink-0">
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
    <div className="min-h-screen bg-[#FAF8F5] text-[#27213D] font-sans selection:bg-[#FFB800]/40 selection:text-[#27213D] relative overflow-x-hidden">
      {/* Ambient background blur glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-[#FFE4D6] rounded-full blur-[140px] opacity-60" />
        <div className="absolute top-1/4 -right-32 w-[550px] h-[550px] bg-[#EDE8FF] rounded-full blur-[140px] opacity-70" />
        <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-[#E0F7F0] rounded-full blur-[130px] opacity-60" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white/85 border-r border-stone-200/80 z-40 backdrop-blur-xl shadow-[4px_0_24px_rgba(39,33,61,0.02)]">
        <div className="p-5 border-b border-stone-200/80">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FFD45A] via-[#FFAF94] to-[#E66A48] flex items-center justify-center font-black text-[#27213D] text-base shadow-sm group-hover:scale-105 transition-transform">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-[#27213D] group-hover:text-[#E66A48] transition-colors">
                  RAMU
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-md bg-[#FFF7ED] text-[#E66A48] border border-[#F9D8C4]">
                  Engine
                </span>
              </div>
              <p className="text-[10px] text-[#716B7E] font-medium">Creative Opportunity Engine</p>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#9E98A8] mb-2">
              Utama
            </p>
            {renderNavLinks(PRIMARY_NAV)}
          </div>

          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#9E98A8] mb-2">
              Input Layer
            </p>
            {renderNavLinks(INPUT_LAYER_NAV)}
          </div>

          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#9E98A8] mb-2">
              Sistem Analisis
            </p>
            {renderNavLinks(SYSTEM_NAV)}
          </div>
        </div>

        <div className="p-3.5 border-t border-stone-200/80 bg-stone-50/50">
          <div className="p-3 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFE9DE] to-[#F3EDFF] border border-[#F9D8C4] flex items-center justify-center font-bold text-xs text-[#27213D] shrink-0">
                {actor.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#27213D] truncate">{actor.name}</p>
                <p className="text-[10px] text-[#716B7E] truncate">{actor.sector}</p>
              </div>
            </div>

            <form action={logout}>
              <button
                type="submit"
                title="Keluar dari akun"
                className="p-1.5 rounded-lg text-[#716B7E] hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 bg-white/90 backdrop-blur-md border-b border-stone-200/80 px-4 py-3 flex items-center justify-between z-30 shadow-xs">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFD45A] via-[#FFAF94] to-[#E66A48] flex items-center justify-center font-bold text-[#27213D] text-xs shadow-xs">
            R
          </div>
          <span className="font-extrabold text-sm tracking-tight text-[#27213D]">RAMU</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#27213D] font-semibold truncate max-w-[120px]">
            {actor.name}
          </span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200 text-[#27213D]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#27213D]/40 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white border-t border-stone-200 p-5 rounded-t-3xl max-h-[85vh] overflow-y-auto space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9E98A8]">Menu Navigasi</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#716B7E] hover:text-[#27213D] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-[#9E98A8] mb-2">Utama</p>
              {renderNavLinks(PRIMARY_NAV)}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-[#9E98A8] mb-2">Input Layer</p>
              {renderNavLinks(INPUT_LAYER_NAV)}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-[#9E98A8] mb-2">Sistem</p>
              {renderNavLinks(SYSTEM_NAV)}
            </div>
            <div className="pt-3 border-t border-stone-200">
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200 text-center flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar dari Akun</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="md:pl-64 flex flex-col min-h-screen relative z-10">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto pb-24 md:pb-12 space-y-8 animate-fade-in">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200/90 px-3 py-2 flex items-center justify-around z-40 shadow-lg">
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
                active ? "text-[#E66A48] font-bold" : "text-[#716B7E] hover:text-[#27213D]"
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
