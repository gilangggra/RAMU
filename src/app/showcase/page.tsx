import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getShowcaseAssets } from "@/application/showcaseService";
import { AppShell } from "@/components/layout/AppShell";
import { ShowcaseCard } from "@/components/showcase/ShowcaseCard";
import { ShowcaseFilterBar } from "@/components/showcase/ShowcaseFilterBar";
import { ImageIcon, Sparkles } from "lucide-react";

export const metadata = {
  title: "Karya & Inspirasi | RAMU",
  description: "Eksplorasi mahakarya visual dan profil kreatif dari ekosistem RAMU bergaya Apple Liquid Glass.",
};

export default async function ShowcasePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "asc" },
  });

  if (!actor) redirect("/onboarding");

  const params = await searchParams;
  const currentCategory = params?.category || "ALL";
  const searchQuery = params?.q || "";

  const showcaseItems = await getShowcaseAssets({
    category: currentCategory,
    search: searchQuery || undefined,
  });



  return (
    <AppShell actor={actor} activeRoute="/showcase">
      <div className="space-y-6">

        {/* ── IPHONE GLASS HEADER & SPOTLIGHT CONTROL ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_2px_12px_rgba(39,33,61,0.04)] text-[11px] font-bold text-stone-700 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Kurasi Visual Eksklusif • RAMU Spotlight</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B2E] tracking-tight">
                Karya &amp; Inspirasi
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-[11px] font-extrabold text-stone-700 shadow-xs">
                {showcaseItems.length} Karya
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl leading-relaxed">
              Jelajahi karya visual pilihan dari kreator, fotografer, stylist, dan desainer terverifikasi.
            </p>
          </div>

          {/* Quick Stats or Live Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 text-xs text-stone-600 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-stone-700">Ekosistem Terhubung</span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-500">Klik karya untuk quick inspect</span>
          </div>
        </div>

        {/* ── SHOWCASE FILTER BAR ── */}
        <ShowcaseFilterBar />

        {/* ── MASONRY GRID — IPHONE GLASS CARDS ── */}
        {showcaseItems.length > 0 ? (
          <div className="columns-2 sm:columns-2 md:columns-3 xl:columns-4 gap-4">
            {showcaseItems.map((item) => (
              <ShowcaseCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 rounded-[32px] bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(39,33,61,0.04)] space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/80 border border-white/90 shadow-sm flex items-center justify-center text-stone-400">
              <ImageIcon className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-base font-extrabold text-[#1E1B2E]">
                {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : "Karya Belum Tersedia"}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {searchQuery
                  ? "Coba kata kunci lain atau bersihkan filter pencarian."
                  : "Kategori kurasi ini sedang disiapkan oleh para kreator RAMU."}
              </p>
            </div>
            <div className="flex items-center gap-2.5 pt-2">
              <Link
                href="/showcase"
                className="px-4 py-2 rounded-xl bg-[#1E1B2E] text-white text-xs font-bold hover:bg-black transition-all shadow-sm active:scale-95"
              >
                Tampilkan Semua
              </Link>
              <Link
                href="/directory"
                className="px-4 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-[#1E1B2E] text-xs font-bold hover:bg-white transition-all shadow-xs active:scale-95"
              >
                Jelajahi Profil Pelaku
              </Link>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
