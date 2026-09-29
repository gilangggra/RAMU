import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getShowcaseAssets, getActorShowcaseCount } from "@/application/showcaseService";
import { AppShell } from "@/components/layout/AppShell";
import { ShowcaseGalleryClient } from "@/components/showcase/ShowcaseGalleryClient";
import { ShowcaseFilterBar } from "@/components/showcase/ShowcaseFilterBar";
import { ShowcaseUploadTrigger } from "@/components/showcase/ShowcaseUploadTrigger";
import { ImageIcon, Sparkles, Plus, Layers, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Karya & Inspirasi | RAMU",
  description: "Eksplorasi mahakarya visual dan profil kreatif dari ekosistem RAMU lengkap dengan Interactive Hotspot Tear-Sheet.",
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
    redirect(`/login?redirectTo=/showcase&message=${encodeURIComponent("Silakan masuk atau daftar untuk menikmati kurasi karya visual dan portofolio kreatif.")}`);
  }

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "asc" },
  });

  if (!actor) redirect("/onboarding");

  const params = await searchParams;
  const currentCategory = params?.category || "ALL";
  const searchQuery = params?.q || "";
  const currentScope = params?.scope === "mine" ? "mine" : "all";

  const [myTotalCount, showcaseItems, registeredActors] = await Promise.all([
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
  ]);

  return (
    <AppShell actor={actor} activeRoute="/showcase">
      <div className="space-y-6">

        <div className="flex items-center justify-between gap-4 pt-1">
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B2E] tracking-tight">
            Karya &amp; Inspirasi
          </h1>

          <ShowcaseUploadTrigger registeredActors={registeredActors} />
        </div>

        <ShowcaseFilterBar myCount={myTotalCount} />

        {showcaseItems.length > 0 ? (
          <ShowcaseGalleryClient items={showcaseItems} currentActorId={actor.id} />
        ) : currentScope === "mine" ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 rounded-[32px] bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(39,33,61,0.04)] space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/90 shadow-sm flex items-center justify-center text-amber-600">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-base font-extrabold text-[#1E1B2E]">
                {searchQuery ? `Tidak ada karya di portofolio Anda untuk "${searchQuery}"` : "Belum Ada Karya di Portofolio Anda"}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {searchQuery
                  ? "Coba gunakan kata kunci lain untuk mencari dalam karya Anda."
                  : "Unggah karya visual atau video pertama Anda, atau berkolaborasilah dengan kreator lain untuk ditandai sebagai tim resmi."}
              </p>
            </div>
            <div className="flex items-center gap-2.5 pt-2">
              <ShowcaseUploadTrigger
                registeredActors={registeredActors}
                className="px-5 py-2.5 rounded-xl bg-[#1E1B2E] text-white text-xs font-bold hover:bg-black transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
                label="Unggah Portofolio Pertama"
              />
              {searchQuery && (
                <Link
                  href="/showcase?scope=mine"
                  className="px-4 py-2.5 rounded-xl bg-white/80 border border-stone-200 text-stone-700 text-xs font-bold hover:bg-white transition-all shadow-xs"
                >
                  Bersihkan Pencarian
                </Link>
              )}
            </div>
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

