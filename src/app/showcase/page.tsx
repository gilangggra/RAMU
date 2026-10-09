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
        {/* 1. HEADER BANNER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                RAMU ECOSYSTEM • KURASI KARYA &amp; TEAR-SHEET
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Karya &amp; Inspirasi Ekosistem
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Eksplorasi portofolio kreatif dan mahakarya visual berbasis komplementaritas resource.
              Dilengkapi Interactive Hotspot Tear-Sheet untuk verifikasi tim dan aset kolaborasi.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <Link
              href="/directory"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 text-xs font-bold shadow-2xs transition-all active:scale-95"
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Direktori Talenta</span>
            </Link>
            <ShowcaseUploadTrigger
              registeredActors={registeredActors}
              className="btn-primary-pill !text-xs !py-2 !px-4 text-white font-bold inline-flex items-center gap-1.5 shadow-md shadow-[#4CC9FE]/25 cursor-pointer active:scale-95 transition-all"
            />
          </div>
        </header>

        {/* 2. 4-TILE ANALYTIC METRIC RIBBON */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Tile 1: Total Mahakarya */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5 group hover:border-slate-300 hover:shadow-xs transition-all">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <span className="truncate">Total Mahakarya</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-[#0284c7]/10 group-hover:text-[#0284c7] transition-colors shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-mono">
                {totalEcosystemWorks || showcaseItems.length}
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Kurasi Publik
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Arsip visual &amp; video terverifikasi
            </p>
          </div>

          {/* Tile 2: Portofolio Anda */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5 group hover:border-slate-300 hover:shadow-xs transition-all">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <span className="truncate">Portofolio &amp; Karya Anda</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-[#0284c7]/10 group-hover:text-[#0284c7] transition-colors shrink-0">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-mono">
                {myTotalCount}
              </span>
              <span className="text-[10px] font-bold text-[#0284c7] bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                Aset Aktif
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Karya terunggah &amp; kredit resmi
            </p>
          </div>

          {/* Tile 3: Interactive Tear-Sheet */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5 group hover:border-slate-300 hover:shadow-xs transition-all">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <span className="truncate">Hotspot Tear-Sheet</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-[#0284c7]/10 group-hover:text-[#0284c7] transition-colors shrink-0">
                <Camera className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-mono">
                {tearSheetCount || 2}
              </span>
              <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                Interaktif
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Bedah wardrobe, gear &amp; lighting
            </p>
          </div>

          {/* Tile 4: Talenta Terlibat */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5 group hover:border-slate-300 hover:shadow-xs transition-all">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <span className="truncate">Kreator &amp; Brand</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-[#0284c7]/10 group-hover:text-[#0284c7] transition-colors shrink-0">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-mono">
                {registeredActors.length}
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Siap Kolaborasi
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              6 peran resmi ekosistem RAMU
            </p>
          </div>
        </section>

        {/* 3. CONTROLS: SEGMENTED TABS & SEARCH */}
        <ShowcaseFilterBar myCount={myTotalCount} />

        {/* 4. GALLERY OR EMPTY STATES */}
        {showcaseItems.length > 0 ? (
          <ShowcaseGalleryClient items={showcaseItems} currentActorId={actor.id} />
        ) : currentScope === "mine" ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600">
              <Layers className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-base font-extrabold text-slate-900">
                {searchQuery
                  ? `Tidak ada karya di portofolio Anda untuk "${searchQuery}"`
                  : "Belum Ada Karya di Portofolio Anda"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {searchQuery
                  ? "Coba gunakan kata kunci lain untuk mencari dalam karya Anda."
                  : "Unggah karya visual atau video pertama Anda, atau berkolaborasilah dengan kreator lain untuk ditandai sebagai tim resmi."}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 flex-wrap justify-center">
              <ShowcaseUploadTrigger
                registeredActors={registeredActors}
                className="btn-primary-pill !text-xs !py-2.5 !px-5 text-white font-bold inline-flex items-center gap-1.5 shadow-md shadow-[#4CC9FE]/25 cursor-pointer active:scale-95 transition-all"
                label="Unggah Portofolio Pertama"
              />
              {searchQuery && (
                <Link
                  href="/showcase?scope=mine"
                  className="px-4 py-2.5 rounded-full bg-white border border-slate-200/80 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-2xs transition-all"
                >
                  Bersihkan Pencarian
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-base font-extrabold text-slate-900">
                {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : "Karya Belum Tersedia"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {searchQuery
                  ? "Coba kata kunci lain atau bersihkan filter pencarian."
                  : "Kategori kurasi ini sedang disiapkan oleh para kreator RAMU."}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 flex-wrap justify-center">
              <Link
                href="/showcase"
                className="btn-primary-pill !text-xs !py-2.5 !px-5 text-white font-bold shadow-md shadow-[#4CC9FE]/25 transition-all active:scale-95"
              >
                Tampilkan Semua
              </Link>
              <Link
                href="/directory"
                className="px-4 py-2.5 rounded-full bg-white border border-slate-200/80 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-2xs transition-all inline-flex items-center gap-1.5"
              >
                <span>Jelajahi Profil Pelaku</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
