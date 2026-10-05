import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getShowcaseAssets, getActorShowcaseCount } from "@/application/showcaseService";
import { AppShell } from "@/components/layout/AppShell";
import { ShowcaseGalleryClient } from "@/components/showcase/ShowcaseGalleryClient";
import { ShowcaseFilterBar } from "@/components/showcase/ShowcaseFilterBar";
import { ShowcaseUploadTrigger } from "@/components/showcase/ShowcaseUploadTrigger";
import { ImageIcon, Sparkles, Layers, Users, Camera, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Karya & Inspirasi | RAMU",
  description:
    "Eksplorasi mahakarya visual dan profil kreatif dari ekosistem RAMU lengkap dengan Interactive Hotspot Tear-Sheet.",
};

export default async function ShowcasePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; scope?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?redirectTo=/showcase&message=${encodeURIComponent(
        "Silakan masuk atau daftar untuk menikmati kurasi karya visual dan portofolio kreatif."
      )}`
    );
  }

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    include: {
      owner: {
        select: {
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!actor) redirect("/onboarding");

  const params = await searchParams;
  const currentCategory = params?.category || "ALL";
  const searchQuery = params?.q || "";
  const currentScope = params?.scope === "mine" ? "mine" : "all";

  const [myTotalCount, showcaseItems, registeredActors, totalEcosystemWorks] =
    await Promise.all([
      getActorShowcaseCount(actor.id),
      getShowcaseAssets({
        category: currentCategory,
        search: searchQuery || undefined,
        scope: currentScope,
        currentActorId: actor.id,
      }),
      prisma.actor.findMany({
        where: { status: { not: "ARCHIVED" } },
        select: {
          id: true,
          name: true,
          sector: true,
          location: true,
        },
        orderBy: { name: "asc" },
        take: 100,
      }),
      prisma.asset.count({
        where: {
          status: "ACTIVE",
          category: "PORTFOLIO_WORK",
          actor: { status: { not: "ARCHIVED" } },
        },
      }),
    ]);

  const tearSheetCount = showcaseItems.filter(
    (i) =>
      i.tearSheet &&
      ((Array.isArray(i.tearSheet.credits) && i.tearSheet.credits.length > 0) ||
        (Array.isArray(i.tearSheet.hotspots) && i.tearSheet.hotspots.length > 0))
  ).length;

  return (
    <AppShell actor={actor} activeRoute="/showcase">
      <div className="space-y-6 w-full">
        {/* 1. ATTIO HEADER BANNER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-stone-200/70">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                RAMU Ecosystem • Kurasi Karya &amp; Tear-Sheet
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
              Karya &amp; Inspirasi Ekosistem
            </h1>
            <p className="text-xs text-stone-500 max-w-2xl leading-relaxed">
              Eksplorasi portofolio kreatif dan mahakarya visual berbasis komplementaritas resource.
              Dilengkapi Interactive Hotspot Tear-Sheet untuk verifikasi tim dan aset kolaborasi.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/directory"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/80 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-stone-500" />
              <span>Direktori Talenta</span>
            </Link>
            <ShowcaseUploadTrigger registeredActors={registeredActors} />
          </div>
        </header>

        {/* 2. ATTIO 4-TILE ANALYTIC METRIC RIBBON */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Tile 1: Total Mahakarya */}
          <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-2 group hover:border-stone-300 transition-colors">
            <div className="flex items-center justify-between text-xs font-medium text-stone-500">
              <span className="truncate">Total Mahakarya</span>
              <Sparkles className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors shrink-0" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-stone-900 font-mono">
                {totalEcosystemWorks || showcaseItems.length}
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                Kurasi Publik
              </span>
            </div>
            <p className="text-[11px] text-stone-400 truncate">
              Arsip visual &amp; video terverifikasi
            </p>
          </div>

          {/* Tile 2: Portofolio Anda */}
          <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-2 group hover:border-stone-300 transition-colors">
            <div className="flex items-center justify-between text-xs font-medium text-stone-500">
              <span className="truncate">Portofolio &amp; Karya Anda</span>
              <Layers className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors shrink-0" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-stone-900 font-mono">
                {myTotalCount}
              </span>
              <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200/70">
                Aset Aktif
              </span>
            </div>
            <p className="text-[11px] text-stone-400 truncate">
              Karya terunggah &amp; kredit resmi
            </p>
          </div>

          {/* Tile 3: Interactive Tear-Sheet */}
          <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-2 group hover:border-stone-300 transition-colors">
            <div className="flex items-center justify-between text-xs font-medium text-stone-500">
              <span className="truncate">Hotspot Tear-Sheet</span>
              <Camera className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors shrink-0" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-stone-900 font-mono">
                {tearSheetCount || 2}
              </span>
              <span className="text-[10px] font-semibold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200/70">
                Interaktif
              </span>
            </div>
            <p className="text-[11px] text-stone-400 truncate">
              Bedah wardrobe, gear &amp; lighting
            </p>
          </div>

          {/* Tile 4: Talenta Terlibat */}
          <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-2 group hover:border-stone-300 transition-colors">
            <div className="flex items-center justify-between text-xs font-medium text-stone-500">
              <span className="truncate">Kreator &amp; Brand</span>
              <Users className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors shrink-0" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-stone-900 font-mono">
                {registeredActors.length}
              </span>
              <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200/70">
                Siap Kolaborasi
              </span>
            </div>
            <p className="text-[11px] text-stone-400 truncate">
              6 peran resmi ekosistem RAMU
            </p>
          </div>
        </section>

        {/* 3. ATTIO CONTROLS: SEGMENTED TABS & SEARCH */}
        <ShowcaseFilterBar myCount={myTotalCount} />

        {/* 4. GALLERY OR EMPTY STATES */}
        {showcaseItems.length > 0 ? (
          <ShowcaseGalleryClient items={showcaseItems} currentActorId={actor.id} />
        ) : currentScope === "mine" ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200/80 flex items-center justify-center text-stone-600">
              <Layers className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-sm font-bold text-stone-900">
                {searchQuery
                  ? `Tidak ada karya di portofolio Anda untuk "${searchQuery}"`
                  : "Belum Ada Karya di Portofolio Anda"}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {searchQuery
                  ? "Coba gunakan kata kunci lain untuk mencari dalam karya Anda."
                  : "Unggah karya visual atau video pertama Anda, atau berkolaborasilah dengan kreator lain untuk ditandai sebagai tim resmi."}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <ShowcaseUploadTrigger
                registeredActors={registeredActors}
                className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                label="Unggah Portofolio Pertama"
              />
              {searchQuery && (
                <Link
                  href="/showcase?scope=mine"
                  className="px-3 py-1.5 rounded-lg bg-white border border-stone-200/80 text-stone-700 text-xs font-semibold hover:bg-stone-50 shadow-2xs transition-colors"
                >
                  Bersihkan Pencarian
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200/80 flex items-center justify-center text-stone-400">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-sm font-bold text-stone-900">
                {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : "Karya Belum Tersedia"}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {searchQuery
                  ? "Coba kata kunci lain atau bersihkan filter pencarian."
                  : "Kategori kurasi ini sedang disiapkan oleh para kreator RAMU."}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Link
                href="/showcase"
                className="px-3.5 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-black shadow-2xs transition-colors"
              >
                Tampilkan Semua
              </Link>
              <Link
                href="/directory"
                className="px-3 py-1.5 rounded-lg bg-white border border-stone-200/80 text-stone-700 text-xs font-semibold hover:bg-stone-50 shadow-2xs transition-colors inline-flex items-center gap-1.5"
              >
                <span>Jelajahi Profil Pelaku</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
