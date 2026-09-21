import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getShowcaseAssets } from "@/application/showcaseService";
import { AppShell } from "@/components/layout/AppShell";
import { ShowcaseCard } from "@/components/showcase/ShowcaseCard";
import { Sparkles, Image as ImageIcon } from "lucide-react";

export const metadata = {
  title: "Karya & Inspirasi | RAMU",
  description: "Eksplorasi mahakarya visual dari ekosistem kreatif RAMU.",
};

export default async function ShowcasePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
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

  const showcaseItems = await getShowcaseAssets({ category: currentCategory });

  const categories = [
    { id: "ALL", label: "Semua Karya" },
    { id: "Fotografi & Video", label: "Fotografi & Video" },
    { id: "Desain Visual", label: "Desain Visual" },
    { id: "Fashion Styling", label: "Fashion Styling" },
    { id: "Studio & Ruang", label: "Studio & Ruang" },
  ];

  return (
    <AppShell actor={actor} activeRoute="/showcase">
      <div className="space-y-8">
        
        {/* Hero Section */}
        <section className="relative px-8 pt-12 pb-8 rounded-[32px] bg-[#27213D] overflow-hidden text-center space-y-6 shadow-[0_20px_40px_rgba(39,33,61,0.15)]">
          {/* Aesthetic Background Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-purple-600/30 rounded-full blur-[100px] mix-blend-screen" />
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-amber-500/20 rounded-full blur-[100px] mix-blend-screen" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Inspirasi Tanpa Batas</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Eksplorasi Karya <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                Ekosistem Kreatif
              </span>
            </h1>
            <p className="text-sm text-stone-300 leading-relaxed max-w-lg mx-auto">
              Telusuri mahakarya visual terbaik dari para pelaku kreatif di RAMU. Biarkan visual berbicara, temukan gaya yang sesuai, dan inisiasi kolaborasi impian Anda.
            </p>
          </div>
        </section>

        {/* Filter Categories */}
        <div className="flex flex-wrap items-center justify-center gap-2 sticky top-[72px] z-20 py-2 bg-[#FAF8F5]/80 backdrop-blur-xl rounded-full px-4 border border-stone-200/50 shadow-sm mx-auto w-fit">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/showcase${cat.id === "ALL" ? "" : `?category=${encodeURIComponent(cat.id)}`}`}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                currentCategory === cat.id
                  ? "bg-[#27213D] text-white shadow-md"
                  : "bg-transparent text-stone-500 hover:text-[#27213D] hover:bg-stone-200/50"
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Masonry Grid */}
        {showcaseItems.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 pt-4">
            {showcaseItems.map((item) => (
              <ShowcaseCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 px-6 rounded-3xl bg-white/50 border border-stone-200/50 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
              <ImageIcon className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-lg font-extrabold text-[#27213D]">
                Belum Ada Karya Ditemukan
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Kategori ini belum memiliki portofolio publik. Coba ubah kategori di atas untuk melihat karya dari industri kreatif lainnya.
              </p>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
