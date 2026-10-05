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
  Shield,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowLeftRight,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

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
    <ul className="space-y-1">
      {groupItems.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(href, exact);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              title={isCollapsed ? label : undefined}
              className={`flex items-center rounded-xl text-xs font-medium transition-colors ${
                isCollapsed
                  ? "justify-center p-3"
                  : "justify-between px-3.5 py-2.5"
              } ${
                active
                  ? "bg-[#1E1B2E] text-white font-bold shadow-xs"
                  : "text-stone-500 hover:text-[#1E1B2E] hover:bg-stone-100/70 border border-transparent"
              }`}
            >
              <div className={`flex items-center min-w-0 ${isCollapsed ? "justify-center" : "gap-3"}`}>
                <span
                  className={`text-base shrink-0 transition-transform ${
                    active ? "scale-110 text-white" : "group-hover:scale-110 text-stone-400 group-hover:text-[#1E1B2E]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                {!isCollapsed && <span className="truncate">{label}</span>}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#27213D] font-sans selection:bg-[#FFB800]/40 selection:text-[#27213D] relative overflow-x-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-[#FFE4D6] rounded-full blur-[140px] opacity-60" />
        <div className="absolute top-1/4 -right-32 w-[550px] h-[550px] bg-[#EDE8FF] rounded-full blur-[140px] opacity-70" />
        <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-[#E0F7F0] rounded-full blur-[130px] opacity-60" />
      </div>

      {/* DESKTOP SIDEBAR WITH SMOOTH COLLAPSIBLE FUNCTIONALITY */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-0 bottom-0 bg-white/85 border-r border-stone-200/80 z-40 backdrop-blur-xl shadow-[4px_0_24px_rgba(39,33,61,0.02)] transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* HEADER / LOGO & COLLAPSE TOGGLE */}
        <div className={`border-b border-stone-200/80 transition-all duration-300 ${isCollapsed ? "p-3" : "p-4"}`}>
          {!isCollapsed ? (
            <div className="flex items-center justify-between">
              <Link href="/admin" className="flex items-center gap-3 group min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-[#1E1B2E] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(30,27,46,0.3)] group-hover:scale-105 transition-transform shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base tracking-tight text-[#1E1B2E] group-hover:text-[#3B345C] transition-colors">
                      RAMU
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-md bg-stone-100 text-stone-600 border border-stone-200 shrink-0">
                      Admin
                    </span>
                  </div>
                  <p className="text-[10px] text-[#716B7E] font-medium hidden lg:block truncate">
                    Control Panel
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer shrink-0 ml-1"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <Link href="/admin" className="group">
                <div className="w-10 h-10 rounded-2xl bg-[#1E1B2E] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(30,27,46,0.3)] group-hover:scale-105 transition-transform">
                  <Shield className="w-5 h-5" />
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* NAVIGATION LINKS */}
        <div className={`flex-1 overflow-y-auto py-4 space-y-6 no-scrollbar transition-all duration-300 ${isCollapsed ? "px-2" : "px-3.5"}`}>
          {navItems.map((group, index) => (
            <div key={group.section} className={index !== 0 && !isCollapsed ? "pt-2 border-t border-stone-200/60" : ""}>
              {!isCollapsed ? (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#9E98A8] mb-2 truncate">
                  {group.section}
                </p>
              ) : index !== 0 ? (
                <div className="my-2 border-t border-stone-200/60" />
              ) : null}
              {renderNavLinks(group.items)}
            </div>
          ))}
        </div>

        {/* ADMIN PROFILE & FOOTER */}
        <div className={`border-t border-stone-200/80 bg-stone-50/50 transition-all duration-300 ${isCollapsed ? "p-2" : "p-3.5"}`}>
          {!isCollapsed ? (
            <div className="p-3 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-br from-[#E2E8F0] to-[#F1F5F9] border border-stone-200 flex items-center justify-center font-bold text-xs text-[#27213D] shrink-0">
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
                    <p className="text-xs font-bold text-[#27213D] truncate">
                      {adminName}
                    </p>
                    <span className="text-[9px] font-bold text-stone-600 bg-stone-100 px-1.5 py-0.2 rounded border border-stone-200 inline-block">
                      System Admin
                    </span>
                  </div>
                </div>
                <form action={logout}>
                  <button
                    type="submit"
                    title="Keluar dari akun"
                    className="p-1.5 rounded-lg text-[#716B7E] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
              {isDoubleRole && (
                <Link
                  href="/dashboard"
                  className="w-full py-1.5 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  Switch Role
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-[#E2E8F0] to-[#F1F5F9] border border-stone-200 flex items-center justify-center font-bold text-xs text-[#27213D] shadow-xs">
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
              <div className="flex items-center gap-1 pt-1 border-t border-stone-200/80 w-full justify-center">
                <form action={logout}>
                  <button
                    type="submit"
                    title="Keluar dari akun"
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
              {isDoubleRole && (
                <Link
                  href="/dashboard"
                  title="Switch ke App User"
                  className="p-1.5 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden sticky top-0 bg-white/90 backdrop-blur-md border-b border-stone-200/80 px-4 py-3 flex items-center justify-between z-30 shadow-xs">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#1E1B2E] flex items-center justify-center font-black text-white text-xs shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-[#27213D]">RAMU Admin</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200 text-[#27213D]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE SLIDE-OVER DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#27213D]/40 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white border-t border-stone-200 p-5 rounded-t-3xl max-h-[85vh] overflow-y-auto space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-br from-[#E2E8F0] to-[#F1F5F9] border border-stone-200 flex items-center justify-center font-bold text-xs text-[#27213D] shrink-0 shadow-xs">
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
                  <p className="text-xs font-bold text-[#27213D] truncate">{adminName}</p>
                  <p className="text-[10px] text-[#716B7E] truncate">System Admin</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#716B7E] hover:text-[#27213D] p-1.5 rounded-xl hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {navItems.map((group, index) => (
                <div key={group.section} className={index !== 0 ? "pt-2 border-t border-stone-100" : ""}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E98A8] mb-2">{group.section}</p>
                  {renderNavLinks(group.items)}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-200 space-y-2">
              {isDoubleRole && (
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold text-center flex items-center justify-center gap-2"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Switch Role ke App</span>
                </Link>
              )}
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

      {/* DYNAMIC CONTENT WRAPPER */}
      <div
        className={`flex flex-col min-h-screen relative z-10 transition-all duration-300 ease-in-out ${
          isCollapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 w-full mx-auto space-y-8 animate-fade-in transition-all duration-300 ease-in-out ${
            isCollapsed ? "max-w-7xl xl:max-w-[1440px]" : "max-w-6xl"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
