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
  ArrowLeftRight,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { RamuLogo } from "@/components/brand/RamuLogo";

interface AdminShellProps {
  adminName: string;
  adminAvatar?: string | null;
  isDoubleRole?: boolean;
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
      { href: "/admin/taxonomy", label: "Taksonomi & Estetika", icon: BookOpen },
      { href: "/admin/roles", label: "Blueprint Peran Kru", icon: Settings2 },
    ],
  },
  {
    section: "Tata Kelola & Keamanan",
    items: [
      { href: "/admin/audit-logs", label: "Audit Trail", icon: ScrollText },
      { href: "/admin/team", label: "Manajemen Akses Admin", icon: UserCheck },
    ],
  },
];

export function AdminShell({ adminName, adminAvatar, isDoubleRole = false, children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const renderNavLinks = (groupItems: any[]) => (
    <ul className="space-y-0.5">
      {groupItems.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(href, exact);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              title={isCollapsed ? label : undefined}
              className={`group flex items-center rounded-lg text-[13px] transition-all duration-150 relative ${
                isCollapsed
                  ? "justify-center p-2.5"
                  : "justify-between px-2.5 py-1.5"
              } ${
                active
                  ? "bg-white text-stone-900 font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.03)] border border-stone-200/90"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 font-medium border border-transparent"
              }`}
            >
              <div className={`flex items-center min-w-0 ${isCollapsed ? "justify-center" : "gap-2.5"}`}>
                <span
                  className={`shrink-0 transition-colors ${
                    active ? "text-stone-900" : "text-stone-400 group-hover:text-stone-800"
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
    <div className="min-h-screen bg-[#FDFDFC] text-stone-900 font-sans selection:bg-stone-200 selection:text-stone-900 relative overflow-x-hidden">
      {/* DESKTOP SIDEBAR */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-0 bottom-0 bg-[#FBFBFA] border-r border-stone-200/75 z-40 transition-all duration-200 ease-in-out ${
          isCollapsed ? "w-[60px]" : "w-64"
        }`}
      >
        {/* HEADER / LOGO & COLLAPSE TOGGLE */}
        <div className={`border-b border-stone-200/75 ${isCollapsed ? "p-2.5" : "px-3 py-3"}`}>
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2">
              <Link href="/admin" className="flex items-center gap-2.5 group min-w-0 flex-1 hover:opacity-90 transition-opacity">
                <RamuLogo size={24} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[13px] text-stone-900 tracking-tight leading-none">
                      RAMU
                    </span>
                    <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-purple-50 text-purple-700 rounded border border-purple-200/70 leading-tight">
                      Admin
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400 font-medium truncate mt-0.5 leading-none">
                    Control Panel
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 transition-colors cursor-pointer shrink-0 ml-1"
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
                className="p-1 rounded-md text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 transition-colors cursor-pointer"
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
                <div className="px-2.5 pt-2.5 pb-1 flex items-center justify-between text-[11px] font-semibold tracking-wider text-stone-400 uppercase select-none">
                  <span>{group.section}</span>
                </div>
              ) : index !== 0 ? (
                <div className="my-1.5 border-t border-stone-200/50" />
              ) : null}
              {renderNavLinks(group.items)}
            </div>
          ))}
        </div>

        {/* ADMIN PROFILE & FOOTER */}
        <div className={`border-t border-stone-200/75 bg-[#FBFBFA] ${isCollapsed ? "p-2" : "p-2.5"}`}>
          {!isCollapsed ? (
            <div className="p-1.5 rounded-lg border border-stone-200/80 bg-white shadow-2xs space-y-2">
              <div className="flex items-center justify-between gap-2 p-1">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-md overflow-hidden bg-stone-900 text-stone-200 border border-stone-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                    {adminAvatar ? (
                      <img
                        src={adminAvatar}
                        alt={adminName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{adminName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-stone-900 truncate leading-tight">
                      {adminName}
                    </p>
                    <p className="text-[10px] text-stone-400 font-medium truncate leading-tight mt-0.5">
                      System Admin
                    </p>
                  </div>
                </div>
                <form action={logout}>
                  <button
                    type="submit"
                    title="Keluar dari akun"
                    className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
              {isDoubleRole && (
                <Link
                  href="/dashboard"
                  className="w-full py-1.5 px-2.5 rounded-md bg-stone-100 hover:bg-stone-200/70 text-stone-700 border border-stone-200 text-[11px] font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Switch ke App User</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-0.5">
              <div className="w-7 h-7 rounded-md overflow-hidden bg-stone-900 text-stone-200 border border-stone-700 flex items-center justify-center font-bold text-[11px]">
                {adminAvatar ? (
                  <img
                    src={adminAvatar}
                    alt={adminName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{adminName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex flex-col items-center gap-1 border-t border-stone-200/70 pt-1.5 w-full">
                <form action={logout}>
                  <button
                    type="submit"
                    title="Keluar dari akun"
                    className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </form>
                {isDoubleRole && (
                  <Link
                    href="/dashboard"
                    title="Switch ke App User"
                    className="p-1 rounded text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 transition-colors"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden sticky top-0 bg-[#FBFBFA]/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-2.5 flex items-center justify-between z-30">
        <Link href="/admin" className="flex items-center gap-2">
          <RamuLogo size={22} className="shrink-0" />
          <span className="font-bold text-sm tracking-tight text-stone-900">RAMU Admin</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200/80 border border-stone-200 text-stone-800"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MOBILE SLIDE-OVER DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-[#FBFBFA] border-t border-stone-200 p-5 rounded-t-2xl max-h-[85vh] overflow-y-auto space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-stone-900 text-stone-200 border border-stone-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {adminAvatar ? (
                    <img
                      src={adminAvatar}
                      alt={adminName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{adminName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-900 truncate">{adminName}</p>
                  <p className="text-[10px] text-stone-500 truncate">System Admin</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-stone-400 hover:text-stone-800 p-1.5 rounded-lg hover:bg-stone-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {navItems.map((group, index) => (
                <div key={group.section} className={index !== 0 ? "pt-2 border-t border-stone-200/70" : ""}>
                  <p className="text-[11px] font-semibold tracking-wider text-stone-400 uppercase mb-1">{group.section}</p>
                  {renderNavLinks(group.items)}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-200 space-y-2">
              {isDoubleRole && (
                <Link
                  href="/dashboard"
                  className="w-full py-2 rounded-lg bg-stone-100 text-stone-700 border border-stone-200 text-xs font-semibold text-center flex items-center justify-center gap-2"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Switch ke App User</span>
                </Link>
              )}
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-200/80 flex items-center justify-center gap-2"
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
        <main
          className={`flex-1 px-4 py-6 sm:px-6 sm:py-6 lg:px-8 lg:py-6 w-full max-w-7xl xl:max-w-[1400px] mx-auto space-y-6 animate-fade-in transition-all duration-200 ease-in-out`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
