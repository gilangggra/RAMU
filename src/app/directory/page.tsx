import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getDirectoryActors } from "@/application/directoryService";
import { AppShell } from "@/components/layout/AppShell";
import { DirectoryFilterBar } from "@/components/directory/DirectoryFilterBar";
import { ActorCard } from "@/components/directory/ActorCard";
import { Users, Building2, UserCheck, Sparkles, Inbox } from "lucide-react";

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
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.04)] relative overflow-hidden space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF7ED] border border-[#F9D8C4] text-xs font-bold text-[#E66A48]">
                <Users className="w-3.5 h-3.5 text-[#E66A48]" />
                <span>Direktori Ekosistem Kreatif RAMU</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#27213D] tracking-tight">
                Direktori Talenta & Studio Fashion
              </h1>
              <p className="text-xs sm:text-sm text-[#716B7E] leading-relaxed">
                Temukan studio foto cyclorama, fotografer komersial, model lookbook, desainer busana, dan pengrajin wastra terdaftar. Lihat aset nyata yang mereka miliki dan inisiasi peluang kolaborasi berbasis komplementaritas.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-stone-100">
            <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Ekosistem</span>
                <Users className="w-4 h-4 text-[#27213D]" />
              </div>
              <div className="text-2xl font-black text-[#27213D] mt-1">{totalActors}</div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Studio Foto & Visual</span>
                <Building2 className="w-4 h-4 text-[#E66A48]" />
              </div>
              <div className="text-2xl font-black text-[#E66A48] mt-1">{totalStudios}</div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Talenta Individual</span>
                <UserCheck className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-700 mt-1">{totalIndividuals}</div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Brand & Kriya Fesyen</span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-800 mt-1">{totalBrands}</div>
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
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold px-1">
            <span>
              Menampilkan <span className="text-[#27213D] font-bold">{actors.length}</span> pelaku kreatif
              {search && <span> untuk kata kunci &ldquo;{search}&rdquo;</span>}
            </span>
          </div>

          {actors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {actors.map((item) => (
                <ActorCard key={item.id} actor={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-6 rounded-3xl bg-white/80 border border-stone-200/80 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Inbox className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-extrabold text-[#27213D]">
                  Tidak Ada Talenta atau Studio Ditemukan
                </h3>
                <p className="text-xs text-stone-500">
                  Coba sesuaikan kata kunci pencarian atau ubah filter tipe aktor dan domisili Anda.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
