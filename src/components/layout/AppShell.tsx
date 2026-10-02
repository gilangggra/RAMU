"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(auth)/actions";
import { getCurrentUserAvatar } from "@/app/settings/actions";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
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
} from "lucide-react";

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

// In-memory cache across client-side router page navigations
let cachedSidebarCollapsed: boolean | null = null;

export function AppShell({ actor, activeRoute, children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Track if user explicitly clicked the toggle button.
  // We only animate with transition-all when the user clicks the toggle,
  // NOT on page transitions / tab switches to eliminate flickering.
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

  const personalNav: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: `/directory/${actor.id}`, label: "Profil Publik Saya", icon: <User className="w-4 h-4" /> },
    { href: "/dashboard/bookings", label: "Pesanan Masuk", icon: <Inbox className="w-4 h-4" /> },
    { href: "/collaborations", label: "Ruang Kolaborasi & SPK", icon: <Handshake className="w-4 h-4" /> },
  ];

  const ecosystemNav: NavItem[] = [
    { href: "/directory", label: "Direktori Talenta & Studio", icon: <Users className="w-4 h-4" /> },
    { href: "/showcase", label: "Karya & Inspirasi", icon: <Sparkles className="w-4 h-4" /> },
    { href: "/projects", label: "Proyek & Peluang AI", icon: <Megaphone className="w-4 h-4" />, badge: "AI Match" },
    { href: "/settings", label: "Pengaturan Akun", icon: <Settings className="w-4 h-4" /> },
  ];

  useEffect(() => {
    if (initialAvatar) {
      setAvatar(initialAvatar);
      setAvatarError(false);
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      const metaAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
      if (metaAvatar) {
        setAvatar(metaAvatar);
      } else {
        getCurrentUserAvatar().then((url) => {
          if (url) setAvatar(url);
        });
      }
    });
  }, [initialAvatar]);

  function isItemActive(href: string) {
    const current = pathname || activeRoute;
    if (href === "/dashboard") return current === "/dashboard";
    if (href === `/directory/${actor.id}`) return current === `/directory/${actor.id}` || current.startsWith("/dashboard/showcase");
    if (href === "/directory") return current === "/directory" || (current.startsWith("/directory") && current !== `/directory/${actor.id}`);
    if (href === "/settings") return current.startsWith("/settings");
    return current.startsWith(href);
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
              title={isCollapsed ? item.label : undefined}
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
                  {item.icon}
                </span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>
              {!isCollapsed && item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-stone-100 text-[#1E1B2E] border border-stone-200 shrink-0">
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
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-[#FFE4D6] rounded-full blur-[140px] opacity-60" />
        <div className="absolute top-1/4 -right-32 w-[550px] h-[550px] bg-[#EDE8FF] rounded-full blur-[140px] opacity-70" />
        <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-[#E0F7F0] rounded-full blur-[130px] opacity-60" />
      </div>

      {/* DESKTOP SIDEBAR WITH SMOOTH COLLAPSIBLE FUNCTIONALITY */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-0 bottom-0 bg-white/85 border-r border-stone-200/80 z-40 backdrop-blur-xl shadow-[4px_0_24px_rgba(39,33,61,0.02)] ${
          hasInteracted ? "transition-all duration-300 ease-in-out" : ""
        } ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* HEADER / LOGO & COLLAPSE TOGGLE */}
        <div className={`border-b border-stone-200/80 ${hasInteracted ? "transition-all duration-300" : ""} ${isCollapsed ? "p-3" : "p-4"}`}>
          {!isCollapsed ? (
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-3 group min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center font-black text-stone-950 text-base shadow-[0_4px_16px_rgba(251,191,36,0.3)] group-hover:scale-105 transition-transform shrink-0">
                  R
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base tracking-tight text-[#1E1B2E] group-hover:text-amber-600 transition-colors">
                      RAMU
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-md bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                      Engine
                    </span>
                  </div>
                  <p className="text-[10px] text-[#716B7E] font-medium hidden lg:block truncate">
                    Creative Opportunity
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={toggleSidebar}
                title="Perkecil menu sidebar"
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer shrink-0 ml-1"
                aria-label="Perkecil menu sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <Link href="/dashboard" className="group" title="RAMU Engine">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center font-black text-stone-950 text-base shadow-[0_4px_16px_rgba(251,191,36,0.3)] group-hover:scale-105 transition-transform">
                  R
                </div>
              </Link>
              <button
                type="button"
                onClick={toggleSidebar}
                title="Perluas menu sidebar"
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
                aria-label="Perluas menu sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* NAVIGATION LINKS */}
        <div className={`flex-1 overflow-y-auto py-4 space-y-6 no-scrollbar ${hasInteracted ? "transition-all duration-300" : ""} ${isCollapsed ? "px-2" : "px-3.5"}`}>
          <div>
            {!isCollapsed ? (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#9E98A8] mb-2 truncate">
                Profil &amp; Bisnis Saya
              </p>
            ) : (
              <div className="my-2 border-t border-stone-200/60" />
            )}
            {renderNavLinks(personalNav)}
          </div>

          <div className={!isCollapsed ? "pt-2 border-t border-stone-200/60" : ""}>
            {!isCollapsed ? (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#9E98A8] mb-2 truncate">
                Eksplorasi Ekosistem
              </p>
            ) : (
              <div className="my-2 border-t border-stone-200/60" />
            )}
            {renderNavLinks(ecosystemNav)}
          </div>
        </div>

        {/* USER PROFILE & FOOTER */}
        <div className={`border-t border-stone-200/80 bg-stone-50/50 ${hasInteracted ? "transition-all duration-300" : ""} ${isCollapsed ? "p-2" : "p-3.5"}`}>
          {!isCollapsed ? (
            <div className="p-3 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center justify-between gap-3">
              <Link
                href={`/directory/${actor.id}`}
                className="flex items-center gap-2.5 min-w-0 group hover:opacity-90 transition-opacity"
                title="Lihat Profil Publik Saya"
              >
                <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-br from-[#FFE9DE] to-[#F3EDFF] border border-[#F9D8C4] flex items-center justify-center font-bold text-xs text-[#27213D] shrink-0 shadow-xs group-hover:scale-105 transition-transform">
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
                  <p className="text-xs font-bold text-[#27213D] truncate group-hover:text-amber-600 transition-colors">
                    {actor.name}
                  </p>
                  <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 inline-block">
                    Lihat Profil
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-1">
                <Link
                  href="/settings"
                  title="Pengaturan Akun"
                  className="p-1.5 rounded-lg text-[#716B7E] hover:text-[#1E1B2E] hover:bg-stone-100 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                </Link>
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
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <Link
                href={`/directory/${actor.id}`}
                className="p-1"
                title={`Profil Publik: ${actor.name}`}
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-[#FFE9DE] to-[#F3EDFF] border border-[#F9D8C4] flex items-center justify-center font-bold text-xs text-[#27213D] shadow-xs hover:scale-105 transition-transform">
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
              </Link>

              <div className="flex items-center gap-1 pt-1 border-t border-stone-200/80 w-full justify-center">
                <Link
                  href="/settings"
                  title="Pengaturan Akun"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                </Link>
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
            </div>
          )}
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden sticky top-0 bg-white/90 backdrop-blur-md border-b border-stone-200/80 px-4 py-3 flex items-center justify-between z-30 shadow-xs">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center font-black text-stone-950 text-xs shadow-xs">
            R
          </div>
          <span className="font-extrabold text-sm tracking-tight text-[#27213D]">RAMU</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/directory/${actor.id}`}
            className="flex items-center gap-2 max-w-[150px] group"
            title="Lihat Profil Publik Saya"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-gradient-to-br from-[#FFE9DE] to-[#F3EDFF] border border-[#F9D8C4] flex items-center justify-center font-bold text-[11px] text-[#27213D] shrink-0">
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
            <span className="text-xs text-[#27213D] font-bold truncate group-hover:text-amber-600 transition-colors">
              {actor.name}
            </span>
          </Link>
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
              <Link
                href={`/directory/${actor.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 min-w-0"
              >
                <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-br from-[#FFE9DE] to-[#F3EDFF] border border-[#F9D8C4] flex items-center justify-center font-bold text-xs text-[#27213D] shrink-0 shadow-xs">
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
                  <p className="text-xs font-bold text-[#27213D] truncate">{actor.name}</p>
                  <p className="text-[10px] text-[#716B7E] truncate">{actor.sector}</p>
                </div>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#716B7E] hover:text-[#27213D] p-1.5 rounded-xl hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E98A8] mb-2">Profil &amp; Bisnis Saya</p>
                {renderNavLinks(personalNav)}
              </div>
              <div className="pt-2 border-t border-stone-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E98A8] mb-2">Eksplorasi Ekosistem</p>
                {renderNavLinks(ecosystemNav)}
              </div>
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

      {/* DYNAMIC CONTENT WRAPPER: ADAPTS PADDING & MAX-WIDTH WHEN SIDEBAR COLLAPSES */}
      <div
        className={`flex flex-col min-h-screen relative z-10 ${
          hasInteracted ? "transition-all duration-300 ease-in-out" : ""
        } ${
          isCollapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 w-full mx-auto pb-24 md:pb-12 space-y-8 animate-fade-in ${
            hasInteracted ? "transition-all duration-300 ease-in-out" : ""
          } ${
            isCollapsed ? "max-w-7xl xl:max-w-[1440px]" : "max-w-6xl"
          }`}
        >
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200/90 px-3 py-2 flex items-center justify-around z-40 shadow-lg">
        {[
          { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
          { href: `/directory/${actor.id}`, label: "Profil Saya", icon: <User className="w-5 h-5" /> },
          { href: "/directory", label: "Direktori", icon: <Users className="w-5 h-5" /> },
          { href: "/projects", label: "Proyek", icon: <Megaphone className="w-5 h-5" /> },
          { href: "/dashboard/bookings", label: "Pesanan", icon: <Inbox className="w-5 h-5" /> },
        ].map((item) => {
          const active = isItemActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
                active ? "text-amber-600 font-bold" : "text-stone-500 hover:text-stone-900"
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
