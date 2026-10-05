import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getDirectoryActors } from "@/application/directoryService";
import { AppShell } from "@/components/layout/AppShell";
import { DirectoryFilterBar } from "@/components/directory/DirectoryFilterBar";
import { ActorCard } from "@/components/directory/ActorCard";
import {
  Users,
  Sparkles,
  Building2,
  ShoppingBag,
  Plus,
  Compass,
  Zap,
  Inbox,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "Direktori Talenta & Studio Fashion | RAMU",
  description:
    "Eksplorasi studio foto, talenta kreatif, stylist, model, dan desainer fashion yang siap berkolaborasi dalam ekosistem RAMU.",
};

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    actorType?: string;
    sector?: string;
    location?: string;
    style?: string;
    compensation?: string;
    sortBy?: string;
  }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?redirectTo=/directory&message=${encodeURIComponent(
        "Silakan masuk atau daftar akun untuk mengakses direktori lengkap pelaku kreatif dan studio."
      )}`
    );
  }

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    include: {
      owner: { select: { avatarUrl: true } },
      needs: {
        where: { status: "ACTIVE" },
        select: { category: true },
      },
      createdProjectBriefs: {
        where: { status: "OPEN" },
        select: {
          neededRoles: {
            where: { isFilled: false },
            select: { assetCategory: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!actor) redirect("/onboarding");

  const params = await searchParams;
  const search = params?.search || "";
  const actorType = params?.actorType || "ALL";
  const sector = params?.sector || "ALL";
  const location = params?.location || "ALL";
  const style = params?.style || "ALL";
  const compensation = params?.compensation || "ALL";
  const sortBy = params?.sortBy || "recommended";

  const [actors, allActors] = await Promise.all([
    getDirectoryActors({ search, actorType, sector, location, style, compensation, sortBy }),
    prisma.actor.findMany({
      where: { status: { not: "ARCHIVED" } },
      select: { actorType: true },
    }),
  ]);

  const actorNeeds = actor!.needs ?? [];
  const actorBriefs = actor!.createdProjectBriefs ?? [];
  const wantedCategories = new Set<string>([
    ...actorNeeds.map((n) => n.category as string),
    ...actorBriefs.flatMap((b) => b.neededRoles.map((r) => r.assetCategory as string)),
  ]);

  const scoreMap = new Map<string, number>();
  if (wantedCategories.size > 0) {
    for (const a of actors) {
      if (a.id === actor!.id) continue;
      const actorCats = new Set<string>(a.assets.map((asset) => asset.category as string));
      let matches = 0;
      for (const cat of wantedCategories) {
        if (actorCats.has(cat)) matches++;
      }
      if (matches > 0) {
        scoreMap.set(a.id, Math.min(100, Math.round((matches / wantedCategories.size) * 100)));
      }
    }
  }

  // Sort actors smartly
  const sortedActors = [...actors].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "portfolio") {
      return (b._count?.assets || b.assets.length) - (a._count?.assets || a.assets.length);
    }
    if (sortBy === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // "recommended" (AI Complementarity Score first, then portfolio richness)
    const scoreA = scoreMap.get(a.id) || 0;
    const scoreB = scoreMap.get(b.id) || 0;
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    return (b._count?.assets || b.assets.length) - (a._count?.assets || a.assets.length);
  });

  const matchedCount = Array.from(scoreMap.values()).filter((s) => s > 0).length;

  const totalActors = allActors.length;
  const totalStudios = allActors.filter((a) => a.actorType === "STUDIO").length;
  const totalIndividuals = allActors.filter((a) => a.actorType === "INDIVIDUAL").length;
  const totalBrands = allActors.filter(
    (a) => a.actorType === "BRAND" || (a.actorType as string) === "MSME"
  ).length;

  return (
    <AppShell actor={actor} activeRoute="/directory">
      <div className="space-y-6 w-full">
        {/* 1. ATTIO HEADER BANNER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-stone-200/70">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                RAMU Ecosystem • Direktori Talenta &amp; Studio Kreatif
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
              Direktori Talenta &amp; Ekosistem Kreatif
            </h1>
            <p className="text-xs text-stone-500 max-w-2xl leading-relaxed">
              Katalog kurasi fotografer, videografer, model, desainer, dan studio terverifikasi
              se-Indonesia. Siap kolaborasi langsung berdasarkan komplementaritas resource.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/showcase"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/80 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-stone-500" />
              <span>Karya &amp; Inspirasi</span>
            </Link>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-2xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-stone-300" />
              <span>Inisiasi Brief Baru</span>
            </Link>
          </div>
        </header>

        {/* 2. ATTIO 4-TILE ANALYTIC METRIC RIBBON */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Tile 1: Total Entitas */}
          <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-2 group hover:border-stone-300 transition-colors">
            <div className="flex items-center justify-between text-xs font-medium text-stone-500">
              <span className="truncate">Total Entitas Terdaftar</span>
              <Users className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors shrink-0" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-stone-900 font-mono">
                {totalActors}
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                Terverifikasi
              </span>
            </div>
            <p className="text-[11px] text-stone-400 truncate">
              Kreator, studio &amp; brand aktif
            </p>
          </div>

          {/* Tile 2: Talenta Kreatif */}
          <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-2 group hover:border-stone-300 transition-colors">
            <div className="flex items-center justify-between text-xs font-medium text-stone-500">
              <span className="truncate">Talenta Kreatif</span>
              <Sparkles className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors shrink-0" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-stone-900 font-mono">
                {totalIndividuals}
              </span>
              <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200/70">
                Siap Kolaborasi
              </span>
            </div>
            <p className="text-[11px] text-stone-400 truncate">
              Fotografer, desainer, model, MUA
            </p>
          </div>

          {/* Tile 3: Studio & Ruang */}
          <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-2 group hover:border-stone-300 transition-colors">
            <div className="flex items-center justify-between text-xs font-medium text-stone-500">
              <span className="truncate">Studio &amp; Ruang Visual</span>
              <Building2 className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors shrink-0" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-stone-900 font-mono">
                {totalStudios}
              </span>
              <span className="text-[10px] font-semibold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200/70">
                Resource Aktif
              </span>
            </div>
            <p className="text-[11px] text-stone-400 truncate">
              Studio foto &amp; peralatan aktif
            </p>
          </div>

          {/* Tile 4: Brand & UMKM Mode */}
          <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-2 group hover:border-stone-300 transition-colors">
            <div className="flex items-center justify-between text-xs font-medium text-stone-500">
              <span className="truncate">Brand &amp; UMKM Mode</span>
              <ShoppingBag className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors shrink-0" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-stone-900 font-mono">
                {totalBrands}
              </span>
              <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200/70">
                Mencari Mitra
              </span>
            </div>
            <p className="text-[11px] text-stone-400 truncate">
              Inisiasi produksi &amp; kampanye
            </p>
          </div>
        </section>

        {/* Quick Notice Callout */}
        <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
            <span>
              <strong className="text-stone-900 font-semibold">Butuh Kru Lengkap?</strong> Lebih
              efisien buat 1 brief proyek untuk mengumpulkan Model, MUA, dan Studio sekaligus.
            </span>
          </div>
          <Link
            href="/projects/new"
            className="shrink-0 font-semibold text-stone-900 hover:text-black flex items-center gap-1 group transition-colors"
          >
            <span>Buka Brief Proyek</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 3. ATTIO CONTROLS: SEGMENTED TABS, SEARCH & FILTER SELECTS */}
        <DirectoryFilterBar
          currentSearch={search}
          currentType={actorType}
          currentSector={sector}
          currentLocation={location}
          currentStyle={style}
          currentCompensation={compensation}
          currentSort={sortBy}
        />

        {/* 4. RESULTS RIBBON */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-stone-500 font-medium">
              Menampilkan <span className="text-stone-900 font-bold">{sortedActors.length}</span>{" "}
              portofolio talenta
              {search && (
                <span>
                  {" "}
                  untuk pencarian <strong className="text-stone-900">&ldquo;{search}&rdquo;</strong>
                </span>
              )}
            </div>

            {matchedCount > 0 && sortBy === "recommended" && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/70 text-emerald-800 rounded-lg text-xs font-semibold self-start sm:self-auto shadow-2xs">
                <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  <strong className="font-bold">{matchedCount} entitas</strong> memiliki sinergi
                  komplementer dengan kebutuhan Anda
                </span>
              </div>
            )}
          </div>

          {/* 5. CARDS GRID */}
          {sortedActors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedActors.map((item) => (
                <ActorCard
                  key={item.id}
                  actor={item}
                  complementarityScore={scoreMap.get(item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-4 text-center">
              <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200/80 flex items-center justify-center text-stone-400">
                <Inbox className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-sm font-bold text-stone-900">Tidak Ada Hasil Ditemukan</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Coba sesuaikan kata kunci pencarian atau ubah kriteria filter untuk melihat
                  portofolio pelaku kreatif lainnya.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/directory"
                  className="px-3.5 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-black shadow-2xs transition-colors inline-block"
                >
                  Tampilkan Semua Talenta
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
