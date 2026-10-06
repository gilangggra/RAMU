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
  Inbox,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Handshake,
  Target,
  BarChart3,
  ShieldCheck,
  MessageSquare,
  Search,
  Command,
  ArrowRight,
  PlusCircle,
  Compass,
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

  // Synchronous initialization from in-memory cache or localStorage
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (cachedSidebarCollapsed !== null) return cachedSidebarCollapsed;
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("ramu_sidebar_collapsed");
        if (saved !== null) {
          const val = saved === "true";
          cachedSidebarCollapsed = val;
          return val;
        }
      } catch {
        // ignore
      }
    }
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

  const isAdmin =
    actor.sector === "Platform Administrator" ||
    actor.sector?.toLowerCase().includes("administrator");

  // Attio-inspired relational sections aligned with RAMU Collaborative Economy Core Flow
  const navSections: NavSection[] = [
    {
      title: "Kolaborasi Utama",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: <LayoutGrid className="w-4 h-4" /> },
        { href: "/collaborate", label: "Rekomendasi Mitra", icon: <Sparkles className="w-4 h-4" /> },
        { href: "/projects", label: "Eksplorasi Proyek", icon: <Megaphone className="w-4 h-4" /> },
        { href: "/collaborations", label: "Workspace Aktif", icon: <Handshake className="w-4 h-4" /> },
        { href: "/readiness", label: "Inventaris & Kesiapan", icon: <Target className="w-4 h-4" /> },
        { href: "/messages", label: "Pesan & Diskusi", icon: <MessageSquare className="w-4 h-4" /> },
      ],
    },
    {
      title: "Ekosistem & Profil",
      items: [
        { href: "/directory", label: "Direktori Talenta", icon: <Users className="w-4 h-4" /> },
        { href: "/showcase", label: "Karya & Portofolio", icon: <Compass className="w-4 h-4" /> },
        { href: "/dashboard/bookings", label: "Pesanan Masuk", icon: <Inbox className="w-4 h-4" /> },
        { href: `/directory/${actor.id}`, label: "Profil Publik Saya", icon: <User className="w-4 h-4" /> },
      ],
    },
    ...(isAdmin
      ? [
          {
            title: "Administrator",
            items: [
              { href: "/engine-insights", label: "Audit Kompatibilitas", icon: <BarChart3 className="w-4 h-4" />, badge: "Admin" },
            ],
          },
        ]
      : []),
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

    // Profile.avatarUrl di DB adalah sumber kebenaran tunggal (server action sudah fallback ke metadata bila profil belum ada)
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
    if (href === `/directory/${actor.id}`) return current === `/directory/${actor.id}` || current.startsWith("/dashboard/showcase");
    if (href === "/directory") return current === "/directory" || (current.startsWith("/directory") && current !== `/directory/${actor.id}`);
    if (href === "/settings") return current.startsWith("/settings");
    if (href === "/readiness" || href === "/resources") return current.startsWith("/readiness") || current.startsWith("/resources");
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
        <div className="px-2.5 pt-2.5 pb-1 flex items-center justify-between text-[11px] font-semibold tracking-wider text-stone-400 uppercase select-none">
          <span>{section.title}</span>
        </div>
      )}
      {isCollapsed && <div className="my-1.5 border-t border-stone-200/50" />}

      <ul className="space-y-0.5">
        {section.items.map((item) => {
          const active = isItemActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                title={isCollapsed ? item.label : undefined}
                className={`group flex items-center rounded-lg text-[13px] transition-all duration-150 relative ${
                  isCollapsed ? "justify-center p-2.5" : "justify-between px-2.5 py-1.5"
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
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="truncate leading-none">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider shrink-0 leading-none ${
                      item.badge === "Admin"
                        ? "bg-purple-50 text-purple-700 border border-purple-200/70"
                        : "bg-stone-100 text-stone-600 border border-stone-200/80"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-stone-900 font-sans selection:bg-stone-200 selection:text-stone-900 relative overflow-x-hidden">
      {/* ATTIO-GRADE DESKTOP SIDEBAR */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-0 bottom-0 bg-[#FBFBFA] border-r border-stone-200/75 z-40 ${
          hasInteracted ? "transition-all duration-200 ease-in-out" : ""
        } ${isCollapsed ? "w-[60px]" : "w-64"}`}
      >
        {/* 1. CONTROL PANEL / WORKSPACE HEADER (ATTIO STYLE) */}
        <div className={`border-b border-stone-200/75 ${isCollapsed ? "p-2.5" : "px-3 py-3"}`}>
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 group min-w-0 flex-1 hover:opacity-90 transition-opacity"
              >
                <RamuLogo size={24} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[13px] text-stone-900 tracking-tight leading-none">
                      RAMU
                    </span>
                    <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-stone-100 text-stone-600 rounded border border-stone-200/60 leading-tight">
                      Workspace
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400 font-medium truncate mt-0.5 leading-none">
                    {actor.name}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-0.5 shrink-0">
                <NotificationBell isCollapsed={false} />
                <button
                  type="button"
                  onClick={toggleSidebar}
                  title="Perkecil sidebar"
                  className="p-1 rounded-md text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 transition-colors cursor-pointer"
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
                className="group p-1 flex items-center justify-center"
                title="RAMU — Workspace"
              >
                <RamuLogo size={24} className="group-hover:scale-105 transition-transform" />
              </Link>
              <NotificationBell isCollapsed={true} />
              <button
                type="button"
                onClick={toggleSidebar}
                title="Perluas sidebar"
                className="p-1 rounded-md text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 transition-colors cursor-pointer"
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
            isCollapsed ? "px-2" : "px-2.5"
          }`}
        >
          {navSections.map(renderNavSection)}
        </div>

        {/* 4. PINNED BOTTOM USER PROFILE (ATTIO CARD) */}
        <div className={`border-t border-stone-200/75 bg-[#FBFBFA] ${isCollapsed ? "p-2" : "p-2.5"}`}>
          {!isCollapsed ? (
            <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-stone-200/50 transition-colors group">
              <Link
                href={isAdmin ? "/settings" : `/directory/${actor.id}`}
                className="flex items-center gap-2.5 min-w-0 flex-1"
                title={isAdmin ? "Pengaturan Akun Administrator" : "Lihat Profil Publik Saya"}
              >
                <div className="relative shrink-0">
                  <div
                    className={`w-7 h-7 rounded-md overflow-hidden flex items-center justify-center font-bold text-[11px] border ${
                      isAdmin
                        ? "bg-stone-900 text-stone-200 border-stone-700"
                        : "bg-stone-100 border-stone-300 text-stone-800"
                    }`}
                  >
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
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>

                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-stone-900 truncate leading-tight group-hover:text-stone-700">
                    {actor.name}
                  </p>
                  <p className="text-[10px] text-stone-400 font-medium truncate leading-tight mt-0.5">
                    {isAdmin ? "Platform Admin" : actor.sector}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-0.5 shrink-0 ml-1">
                <Link
                  href="/settings"
                  title="Pengaturan Akun"
                  className="p-1 rounded text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                </Link>
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
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-0.5">
              <Link
                href={isAdmin ? "/settings" : `/directory/${actor.id}`}
                className="relative group p-0.5"
                title={`${actor.name} (${actor.sector})`}
              >
                <div
                  className={`w-7 h-7 rounded-md overflow-hidden flex items-center justify-center font-bold text-[11px] border ${
                    isAdmin
                      ? "bg-stone-900 text-stone-200 border-stone-700"
                      : "bg-stone-100 border-stone-300 text-stone-800"
                  }`}
                >
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
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </Link>

              <div className="flex flex-col items-center gap-1 border-t border-stone-200/70 pt-1.5 w-full">
                <Link
                  href="/settings"
                  title="Pengaturan Akun"
                  className="p-1 rounded text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                </Link>
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
            </div>
          )}
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden sticky top-0 bg-[#FBFBFA]/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-2.5 flex items-center justify-between z-30">
        <Link href="/dashboard" className="flex items-center gap-2">
          <RamuLogo size={22} className="shrink-0" />
          <span className="font-bold text-sm tracking-tight text-stone-900">RAMU</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <NotificationBell />
          <button
            onClick={() => setSearchOpen(true)}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100"
            title="Cari"
          >
            <Search className="w-4 h-4" />
          </button>
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
              <Link
                href={isAdmin ? "/settings" : `/directory/${actor.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 min-w-0"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center font-bold text-xs bg-stone-100 border border-stone-300 text-stone-800 shrink-0">
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
                  <p className="text-xs font-bold text-stone-900 truncate">{actor.name}</p>
                  <p className="text-[10px] text-stone-500 truncate">
                    {isAdmin ? "Platform Admin" : actor.sector}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-stone-400 hover:text-stone-800 p-1.5 rounded-lg hover:bg-stone-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {navSections.map(renderNavSection)}
            </div>

            <div className="pt-3 border-t border-stone-200 space-y-2">
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-200/80 flex items-center justify-center gap-2 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-stone-600" />
                <span>Pengaturan Akun &amp; Rekening</span>
              </Link>
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
        className={`flex flex-col min-h-screen relative z-10 ${
          hasInteracted ? "transition-all duration-200 ease-in-out" : ""
        } ${isCollapsed ? "md:pl-[60px]" : "md:pl-64"}`}
      >
        <main
          className={`flex-1 px-4 py-6 sm:px-6 sm:py-6 lg:px-8 lg:py-6 w-full max-w-7xl xl:max-w-[1400px] mx-auto pb-24 md:pb-12 animate-fade-in ${
            hasInteracted ? "transition-all duration-200 ease-in-out" : ""
          }`}
        >
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FBFBFA]/95 backdrop-blur-md border-t border-stone-200 px-3 py-1.5 flex items-center justify-around z-40 shadow-md">
        {[
          { href: "/dashboard", label: "Dashboard", icon: <LayoutGrid className="w-4 h-4" /> },
          { href: "/collaborate", label: "Matching", icon: <Sparkles className="w-4 h-4" /> },
          { href: "/projects", label: "Proyek", icon: <Megaphone className="w-4 h-4" /> },
          { href: "/directory", label: "Direktori", icon: <Users className="w-4 h-4" /> },
          { href: "/dashboard/bookings", label: "Pesanan", icon: <Inbox className="w-4 h-4" /> },
        ].map((item) => {
          const active = isItemActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition-colors ${
                active ? "text-stone-900 font-bold" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <span>{item.icon}</span>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 5. ATTIO-STYLE COMMAND PALETTE (CMD+K) MODAL */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-24 px-4 animate-fade-in">
          <div
            className="w-full max-w-xl bg-white border border-stone-200/90 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-200/80 bg-stone-50/50">
              <Search className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari halaman, brief, direktori, atau navigasi..."
                className="w-full bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden"
              />
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-stone-400 bg-white border border-stone-200 rounded shadow-2xs shrink-0">
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
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-stone-100 text-stone-800 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-stone-400 group-hover:text-stone-800 transition-colors">
                        {item.icon}
                      </span>
                      <span className="text-xs font-semibold">{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-stone-100 text-stone-600 border border-stone-200/70">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-700 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-stone-400">
                  Tidak ditemukan hasil untuk &quot;{searchQuery}&quot;
                </div>
              )}
            </div>

            {/* Quick Actions Footer in Command Palette */}
            <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-200/70 flex items-center justify-between text-[11px] text-stone-400">
              <div className="flex items-center gap-2">
                <Command className="w-3 h-3 text-stone-400" />
                <span>Tekan <kbd className="font-mono font-medium text-stone-600">Enter</kbd> untuk memilih</span>
              </div>
              <span className="text-[10px]">RAMU Workspace Search</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
