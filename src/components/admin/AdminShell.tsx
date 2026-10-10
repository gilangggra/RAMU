"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(auth)/actions";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  ShoppingBag,
  Scale,
  BookOpen,
  ScrollText,
  Settings2,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  BarChart3,
  Settings,
} from "lucide-react";
import { RamuLogo } from "@/components/brand/RamuLogo";

interface AdminShellProps {
  adminName: string;
  adminAvatar?: string | null;
  children: React.ReactNode;
}

const navItems = [
  {
    section: "Ikhtisar",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    section: "Trust & Safety",
    items: [
      { href: "/admin/users", label: "Manajemen Talenta & Studio", icon: Users },
      { href: "/admin/verification", label: "Antrean Verifikasi Profil", icon: ShieldCheck },
    ],
  },
  {
    section: "Moderasi Platform",
    items: [
      { href: "/admin/projects", label: "Moderasi Proyek & Brief", icon: FolderKanban },
      { href: "/admin/commerce", label: "Transaksi & Booking", icon: ShoppingBag },
      { href: "/admin/disputes", label: "Pusat Sengketa", icon: Scale },
    ],
  },
  {
    section: "Konfigurasi Engine",
    items: [
      { href: "/engine-insights", label: "Audit Kompatibilitas", icon: BarChart3 },
      { href: "/admin/taxonomy", label: "Taksonomi & Estetika", icon: BookOpen },
      { href: "/admin/roles", label: "Blueprint Peran Kru", icon: Settings2 },
    ],
  },
  {
    section: "Tata Kelola & Keamanan",
    items: [
      { href: "/admin/audit-logs", label: "Audit Trail", icon: ScrollText },
    ],
  },
];

export function AdminShell({ adminName, adminAvatar, children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  interface AdminNavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    exact?: boolean;
  }

  const renderNavLinks = (groupItems: AdminNavItem[]) => (
    <ul className="space-y-0.5">
      {groupItems.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(href, exact);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              title={isCollapsed ? label : undefined}
              className={`group flex items-center rounded-xl text-[13px] transition-all relative ${
                isCollapsed
                  ? "justify-center p-2.5"
                  : "justify-between px-3 py-2"
              } ${
                active
                  ? "bg-[#4CC9FE]/15 text-[#0284c7] font-bold border border-[#4CC9FE]/30 shadow-2xs"
                  : "text-slate-600 hover:text-[#111827] hover:bg-white/80 font-medium border border-transparent"
              }`}
            >
              <div className={`flex items-center min-w-0 ${isCollapsed ? "justify-center" : "gap-2.5"}`}>
                <span
                  className={`shrink-0 transition-colors ${
                    active ? "text-[#0284c7]" : "text-slate-400 group-hover:text-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                {!isCollapsed && <span className="truncate leading-none">{label}</span>}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="min-h-screen app-background text-slate-900 font-sans selection:bg-[#4CC9FE]/25 selection:text-[#0284c7] relative overflow-x-hidden">
      {/* DESKTOP SIDEBAR */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-0 bottom-0 bg-white/70 backdrop-blur-2xl border-r border-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] z-40 transition-all duration-200 ease-in-out ${
          isCollapsed ? "w-[60px]" : "w-64"
        }`}
      >
        {/* HEADER / LOGO & COLLAPSE TOGGLE */}
        <div className={`border-b border-white/80 ${isCollapsed ? "p-2.5" : "px-3 py-3"}`}>
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2">
              <Link href="/admin" className="flex items-center gap-2.5 group min-w-0 flex-1 hover:opacity-90 transition-opacity">
                <RamuLogo size={24} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-[13px] text-[#111827] tracking-tight leading-none">
                      RAMU
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-purple-50 text-purple-700 rounded-full border border-purple-200/70 leading-tight">
                      Admin
                    </span>
                  </div>
                  <p className="text-[10px] text-[#4B5563] font-medium truncate mt-1 leading-none">
                    Control Panel
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                title="Perkecil sidebar"
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-white/80 transition-colors cursor-pointer shrink-0"
                aria-label="Perkecil sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <Link href="/admin" className="group p-1 flex items-center justify-center" title="RAMU — Admin">
                <RamuLogo size={24} className="group-hover:scale-105 transition-transform" />
              </Link>
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                title="Perluas sidebar"
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-white/80 transition-colors cursor-pointer"
                aria-label="Perluas sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* NAVIGATION LINKS */}
        <div className={`flex-1 overflow-y-auto py-2.5 space-y-3 no-scrollbar ${isCollapsed ? "px-2" : "px-2.5"}`}>
          {navItems.map((group, index) => (
            <div key={group.section} className="space-y-0.5">
              {!isCollapsed ? (
                <div className="px-2.5 pt-3 pb-1 flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-400 uppercase select-none">
                  <span>{group.section}</span>
                </div>
              ) : index !== 0 ? (
                <div className="my-1.5 border-t border-slate-200/50" />
              ) : null}
              {renderNavLinks(group.items)}
            </div>
          ))}
        </div>

        {/* ADMIN PROFILE & FOOTER */}
        <div className={`border-t border-white/80 bg-white/40 backdrop-blur-md ${isCollapsed ? "p-2" : "p-2.5"}`}>
          {!isCollapsed ? (
            <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/80 transition-all group">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-900 text-slate-200 border border-slate-700 flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-2xs">
                    {adminAvatar ? (
                      <img src={adminAvatar} alt={adminName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{adminName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  {/* Presence indicator dot */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-[#111827] truncate leading-tight">
                    {adminName}
                  </p>
                  <p className="text-[10px] text-[#4B5563] font-medium truncate leading-tight mt-0.5">
                    System Admin
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-1">
                <Link
                  href="/admin/settings"
                  title="Pengaturan Akun"
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-white transition-colors shadow-2xs"
                >
                  <Settings className="w-3.5 h-3.5" />
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    title="Keluar dari akun"
                    className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shadow-2xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-0.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-900 text-slate-200 border border-slate-700 flex items-center justify-center font-bold text-xs">
                  {adminAvatar ? (
                    <img src={adminAvatar} alt={adminName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{adminName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>

              <div className="flex flex-col items-center gap-1 border-t border-slate-200/70 pt-1.5 w-full">
                <Link
                  href="/admin/settings"
                  title="Pengaturan Akun"
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-white/80 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    title="Keluar dari akun"
                    className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between z-30">
        <Link href="/admin" className="flex items-center gap-2">
          <RamuLogo size={22} className="shrink-0" theme="dark" />
          <span className="font-extrabold text-sm tracking-tight text-slate-900">RAMU</span>
          <span className="px-2 py-0.5 text-[9px] font-bold bg-purple-50 text-purple-700 rounded-full border border-purple-200/70">Admin</span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      {/* MOBILE SLIDE-OVER DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white/95 backdrop-blur-2xl border-t border-slate-200 p-5 rounded-t-[24px] max-h-[85vh] overflow-y-auto space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-900 text-slate-200 border border-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {adminAvatar ? (
                    <img src={adminAvatar} alt={adminName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{adminName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{adminName}</p>
                  <p className="text-[10px] text-slate-500 truncate">System Admin</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-slate-800 p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {navItems.map((group, index) => (
                <div key={group.section} className={index !== 0 ? "pt-2 border-t border-slate-200/70" : ""}>
                  <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1 px-1">{group.section}</p>
                  {renderNavLinks(group.items)}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-2">
              <Link
                href="/admin/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200/80 flex items-center justify-center gap-2 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-600" />
                <span>Pengaturan Akun</span>
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-200/80 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar dari Akun</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC CONTENT WRAPPER */}
      <div
        className={`flex flex-col min-h-screen relative z-10 transition-all duration-200 ease-in-out ${
          isCollapsed ? "md:pl-[60px]" : "md:pl-64"
        }`}
      >
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-6 lg:px-8 lg:py-6 w-full max-w-7xl xl:max-w-[1400px] mx-auto pb-24 md:pb-12 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
