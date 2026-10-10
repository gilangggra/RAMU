"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/app/(auth)/actions";
import { getCurrentUserAvatar } from "@/app/settings/actions";
import {
  LayoutGrid,
  Megaphone,
  Menu,
  X,
  LogOut,
  Users,
  Sparkles,
  Settings,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Handshake,
  Target,
  MessageSquare,
  Search,
  Command,
  ArrowRight,
  PlusCircle,
  Compass,
  FileText,
} from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { RamuLogo } from "@/components/brand/RamuLogo";

interface ActorInfo {
  id: string;
  name: string;
  sector: string;
  location?: string | null;
  actorType?: string;
  avatarUrl?: string | null;
  contactEmail?: string | null;
  owner?: {
    avatarUrl?: string | null;
  } | null;
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

interface NavSection {
  title: string;
  items: NavItem[];
}

// In-memory cache across client-side router page navigations
let cachedSidebarCollapsed: boolean | null = null;

export function AppShell({ actor, activeRoute, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initial state matches SSR (false) unless already cached in SPA memory to prevent hydration mismatch
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (cachedSidebarCollapsed !== null) return cachedSidebarCollapsed;
    return false;
  });

  const [hasInteracted, setHasInteracted] = useState(false);


  const initialAvatar = actor.avatarUrl || actor.owner?.avatarUrl || null;
  const [avatar, setAvatar] = useState<string | null>(initialAvatar);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ramu_sidebar_collapsed");
      if (saved !== null) {
        const val = saved === "true";
        cachedSidebarCollapsed = val;
        setIsCollapsed(val);
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleSidebar = () => {
    setHasInteracted(true);
    setIsCollapsed((prev) => {
      const next = !prev;
      cachedSidebarCollapsed = next;
      try {
        localStorage.setItem("ramu_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Navigasi Terstruktur & Bersih: Menghilangkan tab redundan (profil publik sudah ada di footer)
  const navSections: NavSection[] = [
    {
      title: "Workspace & Kolaborasi",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: <LayoutGrid className="w-4 h-4" /> },
        { href: "/projects", label: "Eksplorasi Proyek", icon: <Megaphone className="w-4 h-4" /> },
        { href: "/collaborations", label: "Workspace & Kontrak", icon: <Handshake className="w-4 h-4" /> },
        { href: "/messages", label: "Pesan & Diskusi", icon: <MessageSquare className="w-4 h-4" /> },
      ],
    },
    {
      title: "Jejaring & Portofolio",
      items: [
        { href: "/directory", label: "Direktori & Rekomendasi", icon: <Users className="w-4 h-4" /> },
        { href: "/showcase", label: "Karya & Inspirasi", icon: <Compass className="w-4 h-4" /> },
      ],
    },
  ];

  // Global Command Palette Shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  }, [searchOpen]);

  useEffect(() => {
    if (initialAvatar) {
      setAvatar(initialAvatar);
      setAvatarError(false);
      return;
    }

    let cancelled = false;
    getCurrentUserAvatar().then((url) => {
      if (!cancelled) {
        setAvatar(url);
        setAvatarError(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [initialAvatar]);

  // Sinkronisasi instan saat user mengunggah / menghapus foto profil di drawer atau halaman pengaturan
  useEffect(() => {
    const handleAvatarUpdated = (e: Event) => {
      const detail = (e as CustomEvent<{ avatarUrl: string | null }>).detail;
      setAvatar(detail?.avatarUrl ?? null);
      setAvatarError(false);
    };
    window.addEventListener("ramu:avatar-updated", handleAvatarUpdated);
    return () => window.removeEventListener("ramu:avatar-updated", handleAvatarUpdated);
  }, []);

  function isItemActive(href: string) {
    const current = pathname || activeRoute;
    if (href === "/dashboard") return current === "/dashboard";
    if (href === "/collaborations") return current.startsWith("/collaborations") || current.startsWith("/dashboard/bookings");
    if (href === "/directory") return current === "/directory" || (current.startsWith("/directory") && current !== `/directory/${actor.id}`);
    if (href === "/settings") return current.startsWith("/settings");
    return current.startsWith(href);
  }

  // Filter items for Attio-style Command Palette
  const allNavItems = navSections.flatMap((s) => s.items);
  const filteredNavItems = searchQuery.trim()
    ? allNavItems.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allNavItems;

  const renderNavSection = (section: NavSection) => (
    <div key={section.title} className="space-y-0.5">
      {!isCollapsed && (
        <div className="px-2.5 pt-3 pb-1 flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-400 uppercase select-none">
          <span>{section.title}</span>
        </div>
      )}
      {isCollapsed && <div className="my-2 border-t border-slate-200/50 w-7 mx-auto" />}

      <ul className="space-y-0.5">
        {section.items.map((item) => {
          const active = isItemActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                title={isCollapsed ? item.label : undefined}
                className={`group flex items-center rounded-xl text-[13px] transition-all relative ${
                  isCollapsed
                    ? "w-9 h-9 mx-auto justify-center p-0"
                    : "w-full justify-between px-3 py-2"
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
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="truncate leading-none">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider shrink-0 leading-none ${
                      item.badge === "Admin"
                        ? "bg-purple-50 text-purple-700 border border-purple-200/70"
                        : "bg-[#4CC9FE]/15 text-[#0284c7] border border-[#4CC9FE]/30"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isCollapsed && item.badge && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#0284c7]" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen app-background text-slate-900 font-sans selection:bg-[#4CC9FE]/25 selection:text-[#0284c7] relative">
      {/* DESKTOP SIDEBAR */}
      <aside
        suppressHydrationWarning
        className={`hidden md:flex flex-col fixed left-0 top-0 bottom-0 bg-white/95 border-r border-stone-200/80 shadow-xs z-40 ${
          hasInteracted ? "transition-all duration-200 ease-in-out" : ""
        } ${isCollapsed ? "w-[60px]" : "w-64"}`}
      >
        {/* 1. CONTROL PANEL / WORKSPACE HEADER */}
        <div className={`border-b border-white/80 ${isCollapsed ? "px-2.5 py-3" : "px-3 py-3"}`}>
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 group min-w-0 flex-1 hover:opacity-90 transition-opacity"
              >
                <RamuLogo size={24} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-[13px] text-[#111827] tracking-tight leading-none">
                      RAMU
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-[#4CC9FE]/15 text-[#0284c7] rounded-full border border-[#4CC9FE]/30 leading-tight">
                      Workspace
                    </span>
                  </div>
                  <p className="text-[10px] text-[#4B5563] font-medium truncate mt-1 leading-none">
                    {actor.name}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-1 shrink-0">
                <NotificationBell isCollapsed={false} />
                <button
                  type="button"
                  onClick={toggleSidebar}
                  title="Perkecil sidebar"
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-white/80 transition-colors cursor-pointer"
                  aria-label="Perkecil sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <Link
                href="/dashboard"
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/80 transition-colors group"
                title="RAMU — Workspace"
              >
                <RamuLogo size={24} className="group-hover:scale-105 transition-transform" />
              </Link>
              <NotificationBell isCollapsed={true} />
              <button
                type="button"
                onClick={toggleSidebar}
                title="Perluas sidebar"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-white/80 transition-colors cursor-pointer"
                aria-label="Perluas sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* 2. NAVIGATION SECTIONS */}
        <div
          className={`flex-1 overflow-y-auto py-2.5 space-y-3 no-scrollbar ${
            isCollapsed ? "px-2.5" : "px-2.5"
          }`}
        >
          {navSections.map(renderNavSection)}
        </div>

        {/* 4. PINNED BOTTOM USER PROFILE CARD */}
        <div className={`border-t border-white/80 bg-white/40 backdrop-blur-md ${isCollapsed ? "px-2.5 py-2.5" : "p-2.5"}`}>
          {!isCollapsed ? (
            <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/80 transition-all group">
              <Link
                href={`/directory/${actor.id}`}
                className="flex items-center gap-2.5 min-w-0 flex-1"
                title="Lihat Profil Publik Saya"
              >
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-2xs border bg-slate-100 border-slate-300 text-slate-800">
                    {avatar && !avatarError ? (
                      <img
                        src={avatar}
                        alt={actor.name}
                        onError={() => setAvatarError(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{actor.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  {/* Presence indicator dot */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>

                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-[#111827] truncate leading-tight group-hover:text-[#0284c7] transition-colors">
                    {actor.name}
                  </p>
                  <p className="text-[10px] text-[#4B5563] font-medium truncate leading-tight mt-0.5">
                    {actor.sector}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-1 shrink-0 ml-1">
                <Link
                  href="/settings"
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
              <Link
                href={`/directory/${actor.id}`}
                className="w-9 h-9 rounded-xl flex items-center justify-center relative group hover:opacity-90 transition-opacity"
                title={`${actor.name} (${actor.sector})`}
              >
                <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-2xs border bg-slate-100 border-slate-300 text-slate-800">
                  {avatar && !avatarError ? (
                    <img
                      src={avatar}
                      alt={actor.name}
                      onError={() => setAvatarError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{actor.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </Link>

              <div className="flex flex-col items-center gap-1.5 border-t border-slate-200/70 pt-2 w-full">
                <Link
                  href="/settings"
                  title="Pengaturan Akun"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-white/80 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    title="Keluar dari akun"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden sticky top-0 bg-white/95 border-b border-stone-200/80 px-4 py-2.5 flex items-center justify-between z-30 shadow-2xs">
        <Link href="/dashboard" className="flex items-center gap-2">
          <RamuLogo size={22} className="shrink-0" theme="dark" />
          <span className="font-extrabold text-sm tracking-tight text-slate-900">RAMU</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <NotificationBell />
          <button
            onClick={() => setSearchOpen(true)}
            className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100"
            title="Cari"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MOBILE SLIDE-OVER DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white border-t border-stone-200 p-5 rounded-t-[24px] max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
              <Link
                href={`/directory/${actor.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 min-w-0"
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center font-bold text-xs bg-slate-100 border border-slate-300 text-slate-800 shrink-0">
                  {avatar && !avatarError ? (
                    <img
                      src={avatar}
                      alt={actor.name}
                      onError={() => setAvatarError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{actor.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{actor.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {actor.sector}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-slate-800 p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {navSections.map(renderNavSection)}
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-2">
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200/80 flex items-center justify-center gap-2 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-600" />
                <span>Pengaturan Akun &amp; Rekening</span>
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
        className={`flex flex-col min-h-screen relative z-10 ${
          hasInteracted ? "transition-all duration-200 ease-in-out" : ""
        } ${isCollapsed ? "md:pl-[60px]" : "md:pl-64"}`}
      >
        <main
          className={`flex-1 px-4 py-6 sm:px-6 sm:py-6 lg:px-8 lg:py-6 w-full mx-auto pb-24 md:pb-12 animate-fade-in ${
            hasInteracted ? "transition-all duration-200 ease-in-out" : ""
          } ${
            isCollapsed
              ? "sidebar-collapsed-content max-w-none"
              : "max-w-7xl"
          }`}
        >
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 border-t border-stone-200/80 px-3 py-1.5 flex items-center justify-around z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {[
          { href: "/dashboard", label: "Dashboard", icon: <LayoutGrid className="w-4 h-4" /> },
          { href: "/projects", label: "Proyek", icon: <Megaphone className="w-4 h-4" /> },
          { href: "/collaborations", label: "Workspace & SPK", icon: <Handshake className="w-4 h-4" /> },
          { href: "/directory", label: "Direktori", icon: <Users className="w-4 h-4" /> },
          { href: "/messages", label: "Pesan", icon: <MessageSquare className="w-4 h-4" /> },
        ].map((item) => {
          const active = isItemActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors ${
                active ? "text-[#0284c7] font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className={active ? "text-[#0284c7]" : ""}>{item.icon}</span>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 5. COMMAND PALETTE (CMD+K) MODAL */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-24 px-4 animate-fade-in">
          <div
            className="w-full max-w-xl bg-white border border-slate-200/90 rounded-[24px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200/80 bg-slate-50/50">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari halaman, brief, direktori, atau navigasi..."
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
              />
              <kbd className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded-full shadow-2xs shrink-0">
                ESC
              </kbd>
            </div>

            {/* Search Results */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredNavItems.length > 0 ? (
                filteredNavItems.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      router.push(item.href);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-100 text-slate-800 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 group-hover:text-slate-800 transition-colors">
                        {item.icon}
                      </span>
                      <span className="text-xs font-semibold">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200/70">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Tidak ditemukan hasil untuk &quot;{searchQuery}&quot;
                </div>
              )}
            </div>

            {/* Quick Actions Footer in Command Palette */}
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <Command className="w-3 h-3 text-slate-400" />
                <span>Tekan <kbd className="font-mono font-medium text-slate-600">Enter</kbd> untuk memilih</span>
              </div>
              <span className="text-[10px]">RAMU Workspace Search</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
