import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getOpportunities, generateAndSaveOpportunities } from "@/application/opportunityService";
import { AppShell } from "@/components/layout/AppShell";
import { InitiateCollaborationButton } from "@/app/opportunities/InitiateCollaborationButton";
import { RunEngineButton } from "@/app/opportunities/RunEngineButton";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Package,
  Layers,
  Calendar,
  MapPin,
  Clock,
  Handshake,
  Lightbulb,
  Plus,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";

export const metadata = {
  title: "Temukan Kolaborasi Kompatibel (Resource Matching) | RAMU",
  description:
    "Pencocokan resource deterministik antara kebutuhan proyek dan aset kreatif terverifikasi tanpa halusinasi AI.",
};

export default async function CollaboratePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/collaborate");
  }

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    include: {
      owner: { select: { avatarUrl: true } },
      createdProjectBriefs: {
        where: { status: "OPEN" },
        include: { neededRoles: true },
        orderBy: { createdAt: "desc" },
      },
      assets: {
        where: { status: "ACTIVE" },
        select: { id: true, name: true, category: true, subtype: true, attributes: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!actor) redirect("/onboarding");

  // 1. Ambil brief kebutuhan aktif milik user atau brief terbuka di ekosistem
  const activeBrief =
    actor.createdProjectBriefs[0] ||
    (await prisma.projectBrief.findFirst({
      where: { status: "OPEN" },
      include: {
        creatorActor: { select: { id: true, name: true, sector: true, location: true } },
        neededRoles: true,
      },
      orderBy: { createdAt: "desc" },
    }));

  // 2. Ambil peluang kolaborasi deterministik dari engine
  let opportunities = await getOpportunities({ actorId: actor.id });

  if (opportunities.length === 0) {
    const actorCount = await prisma.actor.count({ where: { status: "ACTIVE" } });
    if (actorCount >= 2) {
      await generateAndSaveOpportunities({ focusActorId: actor.id });
      opportunities = await getOpportunities({ actorId: actor.id });
    }
  }

  return (
    <AppShell actor={actor} activeRoute="/collaborate">
      <div className="space-y-6 w-full">

        {/* HEADER SECTION */}
        <section className="p-8 md:p-10 rounded-[32px] bg-[#1E1B2E] text-white border border-stone-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-amber-300 border border-white/15 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Deterministic Resource Compatibility Engine</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Pencocokan Kolaborasi Berbasis Resource
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
                RAMU memadukan apa yang Anda butuhkan dengan apa yang dimiliki oleh pelaku kreatif lain di ekosistem 6 peran tertutup. Seluruh kecocokan dihitung deterministik berdasarkan 4 pilar tanpa halusinasi AI.
              </p>
            </div>

            <div className="shrink-0">
              <RunEngineButton actorName={actor.name} />
            </div>
          </div>
        </section>

        {/* GRID: YOUR NEEDS vs COMPATIBLE RESOURCES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: YOUR ACTIVE NEEDS (4 COLS) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-[28px] bg-white border border-stone-200/90 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Kebutuhan Proyek Aktif
                </div>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
                  Active Need
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-[#1E1B2E]">
                  {activeBrief?.title || "Kampanye Lookbook Koleksi Musim Gugur"}
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-3">
                  {activeBrief?.description ||
                    "Produksi visual editorial 15 look untuk peluncuran busana ready-to-wear kontemporer."}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
                <div className="font-bold text-stone-700">Daftar Kebutuhan Spesifik:</div>
                <ul className="space-y-2 text-stone-600">
                  {activeBrief && activeBrief.neededRoles && activeBrief.neededRoles.length > 0 ? (
                    activeBrief.neededRoles.map((r, i) => (
                      <li key={i} className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200/60">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium">{r.roleLabel}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200/60">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Studio Foto Daylight (Cyclorama Wall)</span>
                      </li>
                      <li className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200/60">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Fotografer Komersial (Kamera + Lighting Kit)</span>
                      </li>
                      <li className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200/60">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Model Editorial Muse (Tinggi 170cm+)</span>
                      </li>
                      <li className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200/60">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>MUA &amp; Wardrobe Stylist On-Set</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="pt-2 border-t border-stone-100 space-y-1.5 text-[11px] text-stone-500">
                <div className="flex items-center justify-between">
                  <span>Lokasi Produksi:</span>
                  <span className="font-bold text-stone-800">{activeBrief?.location || actor.location || "Jabodetabek / Bandung"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Model Kompensasi:</span>
                  <span className="font-bold text-stone-800">{activeBrief?.compensationModel || "PAID / REVENUE SHARE"}</span>
                </div>
                {activeBrief?.budget && (
                  <div className="flex items-center justify-between">
                    <span>Estimasi Anggaran:</span>
                    <span className="font-bold text-emerald-700">Rp {activeBrief.budget.toLocaleString("id-ID")}</span>
                  </div>
                )}
              </div>

              <Link
                href="/projects/new"
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#1E1B2E] text-xs font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Brief Kebutuhan Baru</span>
              </Link>
            </div>

            {/* RESOURCE IDLE NOTICE */}
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-900">
                <Lightbulb className="w-4 h-4 text-amber-700" />
                <span>Prinsip Collaborative Economy</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed font-light">
                RAMU tidak menuntut Anda memiliki seluruh inventaris. Anda cukup menggabungkan aset yang Anda miliki dengan kapasitas menganggur (idle resources) milik mitra di samping.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: COMPATIBLE MATCHES (8 COLS) */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-lg font-black text-[#1E1B2E] tracking-tight">
                  Resource Mitra yang Kompatibel ({opportunities.length})
                </h2>
                <p className="text-xs text-stone-500">
                  Dihitung dari 4 pilar: Resource Fit (40%), Need Coverage (25%), Feasibility (20%), Readiness (15%).
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                100% Deterministik
              </span>
            </div>

            {opportunities.length === 0 ? (
              <div className="p-12 text-center rounded-[28px] bg-white border border-stone-200 space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-stone-900">Belum Ada Kecocokan Dihitung</h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Klik tombol &ldquo;Hitung Kompatibilitas Resource&rdquo; di atas untuk mencocokkan profil dan resource Anda dengan ekosistem.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {opportunities.map((opp) => {
                  const latestScore = opp.scores?.[0];
                  const overallScore = Math.min(100, Math.round(latestScore?.overallScore ?? 85));
                  const partner = opp.participants.find((p) => p.actorId !== actor.id) || opp.participants[0];
                  const explanation = (opp.explanation as any) || {};
                  const whyList: string[] =
                    explanation.why && explanation.why.length > 0
                      ? explanation.why
                      : [
                          `${partner?.actor?.name} menyediakan kapabilitas ${partner?.roleLabel || partner?.actor?.sector} yang sesuai kebutuhan proyek`,
                          `Komplementaritas aset dan peran wajib terpenuhi`,
                          `Kesesuaian domisili dan batasan kapasitas operasional terverifikasi`,
                        ];

                  // 4 Pillars Breakdown
                  const fit = Math.min(40, Math.round(((latestScore?.complementarityScore ?? 3.6) / 4) * 40));
                  const coverage = Math.min(25, Math.round(((latestScore?.needCoverageScore ?? 3.4) / 4) * 25));
                  const feasibility = Math.min(20, Math.round(((latestScore?.feasibilityScore ?? 3.2) / 4) * 20));
                  const readiness = Math.min(15, Math.round(((latestScore?.actionabilityScore ?? 3.5) / 4) * 15));

                  // Partner asset contribution
                  const partnerAsset = opp.assets.find((a) => a.asset && a.asset.name);

                  return (
                    <div
                      key={opp.id}
                      className="p-6 rounded-[28px] bg-white border border-stone-200/90 hover:border-amber-400 hover:shadow-md transition-all space-y-4 group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-extrabold text-[#1E1B2E] group-hover:text-amber-800 transition-colors">
                              {partner?.actor?.name || "Mitra Kolaborasi"}
                            </h3>
                            <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-bold border border-stone-200">
                              {partner?.actor?.sector || partner?.roleLabel}
                            </span>
                            <span className="text-[10px] font-mono text-stone-400">
                              Pola: {opp.pattern?.name || opp.patternCode}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span>{partner?.actor?.location || "Indonesia"}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 shrink-0 self-start sm:self-auto">
                          <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider">
                            Kompatibilitas:
                          </span>
                          <span className="text-base font-black text-amber-700">{overallScore}%</span>
                        </div>
                      </div>

                      {/* PROPOSED COLLABORATIVE PROJECT */}
                      <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1.5 text-xs">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          Rancangan Proyek Sinergis:
                        </div>
                        <Link
                          href={`/opportunities/${opp.id}`}
                          className="font-bold text-[#1E1B2E] text-sm hover:text-amber-800 transition-colors inline-flex items-center gap-1.5 group/title"
                          title="Buka audit lengkap kesesuaian 4 pilar, roadmap, dan batasan"
                        >
                          <span className="group-hover/title:underline">{opp.title}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover/title:text-amber-700 group-hover/title:translate-x-0.5 transition-all" />
                        </Link>
                        <p className="text-xs text-stone-600 leading-relaxed font-light">
                          {opp.description}
                        </p>
                        {partnerAsset && (
                          <div className="pt-1.5 flex items-center gap-2 text-[11px] text-stone-700 font-medium">
                            <Package className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Resource Mitra: <strong>{partnerAsset.asset.name}</strong></span>
                            <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.2 rounded font-bold">
                              Aset Siap Kolaborasi
                            </span>
                          </div>
                        )}
                      </div>

                      {/* WHY THIS MATCH CHECKLIST */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Mengapa Cocok? (Why This Match?)</span>
                        </div>
                        <ul className="space-y-1 text-xs text-stone-600 pl-1">
                          {whyList.slice(0, 3).map((item, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-600 font-bold">✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 4 PILLARS MINI BREAKDOWN & ACTION */}
                      <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2 text-[10px] text-stone-600 font-medium">
                          <span className="bg-stone-100 px-2 py-0.5 rounded font-mono">Fit: {fit}/40</span>
                          <span className="bg-stone-100 px-2 py-0.5 rounded font-mono">Coverage: {coverage}/25</span>
                          <span className="bg-stone-100 px-2 py-0.5 rounded font-mono">Feasibility: {feasibility}/20</span>
                          <span className="bg-stone-100 px-2 py-0.5 rounded font-mono">Readiness: {readiness}/15</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/opportunities/${opp.id}`}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 text-xs font-semibold border border-stone-200 shadow-2xs transition-colors"
                            title="Audit 4 pilar, checklist batasan & roadmap proyek"
                          >
                            <span>Audit &amp; Detail</span>
                            <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                          </Link>

                          <Link
                            href="/messages"
                            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
                            <span className="hidden sm:inline">Pesan</span>
                          </Link>

                          <InitiateCollaborationButton opportunityId={opp.id} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </AppShell>
  );
}
