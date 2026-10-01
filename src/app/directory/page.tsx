import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getDirectoryActors } from "@/application/directoryService";
import { AppShell } from "@/components/layout/AppShell";
import { DirectoryFilterBar } from "@/components/directory/DirectoryFilterBar";
import { ActorCard } from "@/components/directory/ActorCard";
import { Inbox } from "lucide-react";

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

  const [actors, allActors] = await Promise.all([
    getDirectoryActors({ search, actorType, sector, location }),
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
            </div>

            <div className="flex flex-wrap items-center gap-8 lg:gap-12 pb-2">
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-light text-[#1E1B2E]">{totalActors}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Entitas Terdaftar</div>
              </div>
              <div className="w-px h-10 bg-stone-200 hidden sm:block"></div>
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-light text-[#1E1B2E]">{totalStudios}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Studio Siap Booking</div>
              </div>
              <div className="w-px h-10 bg-stone-200 hidden sm:block"></div>
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-light text-[#1E1B2E]">{totalIndividuals}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Talenta Siap Rekrut</div>
              </div>
            </div>
          </div>
        </section>

        <DirectoryFilterBar
          currentSearch={search}
          currentType={actorType}
          currentSector={sector}
          currentLocation={location}
        />

        <div className="space-y-6">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-stone-400 font-semibold px-2">
            <span>
              Menampilkan <span className="text-[#1E1B2E]">{actors.length}</span> Portofolio
              {search && <span className="lowercase"> untuk <span className="text-[#1E1B2E] font-medium">&ldquo;{search}&rdquo;</span></span>}
            </span>
          </div>

          {actors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {actors.map((item) => (
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
