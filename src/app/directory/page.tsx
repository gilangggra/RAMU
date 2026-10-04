import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getDirectoryActors } from "@/application/directoryService";
import { AppShell } from "@/components/layout/AppShell";
import { DirectoryFilterBar } from "@/components/directory/DirectoryFilterBar";
import { ActorCard } from "@/components/directory/ActorCard";
import { Inbox, Zap } from "lucide-react";

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
    redirect(`/login?redirectTo=/directory&message=${encodeURIComponent("Silakan masuk atau daftar akun untuk mengakses direktori lengkap pelaku kreatif dan studio.")}`);
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
    ...actorBriefs.flatMap((b) =>
      b.neededRoles.map((r) => r.assetCategory as string)
    ),
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
  const totalBrands = allActors.filter((a) => a.actorType === "BRAND" || (a.actorType as string) === "MSME").length;

  return (
    <AppShell actor={actor} activeRoute="/directory">
      <div className="space-y-12 pb-24">

        <section className="pt-12 pb-8 border-b border-stone-200">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-3 mb-6">
                 <span className="w-8 h-px bg-stone-300"></span>
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
                   Direktori Talenta & Studio Profesional
                 </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-[#1E1B2E] tracking-tight leading-[1.1] mb-6">
                Temukan talenta kreatif & <br className="hidden sm:block" />
                <span className="font-serif italic text-stone-500">studio foto</span> untuk proyek Anda.
              </h1>
              <p className="text-base text-stone-500 font-light leading-relaxed max-w-lg">
                Katalog kurasi fotografer, videografer, model, desainer, dan studio visual terverifikasi di Indonesia.
                Siap disewa langsung untuk kampanye komersial, lookbook, dan produksi kreatif Anda.
              </p>
              <div className="mt-5 p-3.5 bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-stone-600 max-w-xl">
                <span>
                  <strong className="text-[#1E1B2E]">Butuh Kru Lengkap?</strong> Lebih efisien buat 1 brief proyek untuk mengumpulkan Model, MUA, dan Studio sekaligus.
                </span>
                <Link
                  href="/projects/new"
                  className="shrink-0 font-bold text-[#E66A48] hover:text-[#d85c3b] hover:underline"
                >
                  Buka Brief Proyek &rarr;
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 lg:gap-10 pb-2">
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-light text-[#1E1B2E]">{totalActors}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Entitas Terdaftar</div>
              </div>
              <div className="w-px h-10 bg-stone-200 hidden sm:block"></div>
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-light text-[#1E1B2E]">{totalStudios}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Studio Foto</div>
              </div>
              <div className="w-px h-10 bg-stone-200 hidden sm:block"></div>
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-light text-[#1E1B2E]">{totalIndividuals}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Talenta Kreatif</div>
              </div>
              <div className="w-px h-10 bg-stone-200 hidden sm:block"></div>
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-light text-[#1E1B2E]">{totalBrands}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Brand &amp; Label</div>
              </div>
            </div>
          </div>
        </section>

        <DirectoryFilterBar
          currentSearch={search}
          currentType={actorType}
          currentSector={sector}
          currentLocation={location}
          currentStyle={style}
          currentCompensation={compensation}
          currentSort={sortBy}
        />

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
            <div className="text-[11px] uppercase tracking-widest text-stone-400 font-semibold">
              Menampilkan <span className="text-[#1E1B2E] font-bold">{sortedActors.length}</span> Portofolio
              {search && <span className="lowercase"> untuk <span className="text-[#1E1B2E] font-bold">&ldquo;{search}&rdquo;</span></span>}
            </div>

            {matchedCount > 0 && sortBy === "recommended" && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs font-semibold self-start sm:self-auto">
                <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  <strong className="font-bold">{matchedCount} entitas</strong> cocok dengan brief &amp; kebutuhan aktif Anda
                </span>
              </div>
            )}
          </div>

          {sortedActors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {sortedActors.map((item) => (
                <ActorCard
                  key={item.id}
                  actor={item}
                  complementarityScore={scoreMap.get(item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 px-6 border-y border-stone-200 space-y-4">
              <div className="w-16 h-16 bg-stone-50 flex items-center justify-center mx-auto rounded-full text-stone-300">
                <Inbox className="w-6 h-6" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-lg font-medium text-[#1E1B2E]">
                  Tidak Ada Hasil Ditemukan
                </h3>
                <p className="text-sm text-stone-500 font-light">
                  Coba sesuaikan kata kunci pencarian atau ubah kriteria filter untuk melihat portofolio lainnya.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
