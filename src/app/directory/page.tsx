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

  if (!user) redirect("/login");

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
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

  const totalActors = allActors.length;
  const totalStudios = allActors.filter((a) => a.actorType === "STUDIO").length;
  const totalIndividuals = allActors.filter((a) => a.actorType === "INDIVIDUAL").length;
  const totalBrands = allActors.filter((a) => a.actorType === "MSME").length;

  return (
    <AppShell actor={actor} activeRoute="/directory">
      <div className="space-y-12 pb-24">
        
        {/* Editorial Hero Section */}
        <section className="pt-12 pb-8 border-b border-stone-200">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-3 mb-6">
                 <span className="w-8 h-px bg-stone-300"></span>
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
                   Eksplorasi Ekosistem
                 </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-[#1E1B2E] tracking-tight leading-[1.1] mb-6">
                Temukan rekan <br className="hidden sm:block" />
                <span className="font-serif italic text-stone-500">kolaborasi ideal</span> Anda.
              </h1>
              <p className="text-base text-stone-500 font-light leading-relaxed max-w-lg">
                Jelajahi kurasi portofolio dari studio foto, talenta kreatif, dan desainer terverifikasi. 
                Temukan kecocokan gaya visual dan inisiasi kolaborasi produksi bernilai tinggi.
              </p>
            </div>
            
            {/* Minimalist Metrics */}
            <div className="flex flex-wrap items-center gap-8 lg:gap-12 pb-2">
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-light text-[#1E1B2E]">{totalActors}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Total Entitas</div>
              </div>
              <div className="w-px h-10 bg-stone-200 hidden sm:block"></div>
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-light text-[#1E1B2E]">{totalStudios}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Studio Visual</div>
              </div>
              <div className="w-px h-10 bg-stone-200 hidden sm:block"></div>
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-light text-[#1E1B2E]">{totalIndividuals}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Kreator</div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <DirectoryFilterBar
          currentSearch={search}
          currentType={actorType}
          currentSector={sector}
          currentLocation={location}
        />

        {/* Actors Grid */}
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
                <ActorCard key={item.id} actor={item} />
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
