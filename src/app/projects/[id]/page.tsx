import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import {
  getProjectBriefById,
  getCrewRecommendationsForBrief,
  type CrewRecommendation,
} from "@/application/projectBriefService";
import { SmartCrewPanel } from "@/components/projects/SmartCrewPanel";
import { RoleSlot } from "@/components/projects/RoleSlot";
import { InterestCard } from "@/components/projects/InterestCard";
import { FormCollaborationButton } from "@/components/projects/FormCollaborationButton";
import { AppShell } from "@/components/layout/AppShell";
import {
  Target,
  Settings,
  Calendar,
  CircleDollarSign,
  Handshake,
  MapPin,
  FileText,
  Users,
  Mail,
  Check,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

export default async function ProjectBriefDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
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

  const { id } = await params;
  const brief = await getProjectBriefById(id);

  if (!brief) {
    notFound();
  }

  const isInitiator = brief.creatorActorId === actor.id;

  let crewRecommendations: CrewRecommendation[] = [];
  if (isInitiator) {
    crewRecommendations = await getCrewRecommendationsForBrief(id);
  }

  const actorAssets = await prisma.asset.findMany({
    where: { actorId: actor.id, status: "ACTIVE" },
    select: { id: true, name: true, category: true, subtype: true },
  });

  const totalRoles = brief.neededRoles.length;
  const filledRoles = brief.neededRoles.filter((r) => r.isFilled).length;
  const acceptedCount = brief.neededRoles.reduce(
    (acc, r) => acc + r.interests.filter((i) => i.status === "ACCEPTED").length,
    0
  );
  const allFilled = totalRoles > 0 && filledRoles === totalRoles;

  const timeline = (brief.timeline as { estimatedDuration?: string; targetLaunch?: string }) || {};
  const budget = (brief.budget as { estimatedTotal?: string; notes?: string }) || {};

  const statusBadges: Record<string, { label: string; badge: string; dot: string }> = {
    OPEN: {
      label: "Terbuka untuk Kolaborasi",
      badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
      dot: "bg-emerald-500",
    },
    FILLED: {
      label: "Semua Peran Terisi",
      badge: "bg-blue-50 text-blue-800 border-blue-200",
      dot: "bg-blue-500",
    },
    IN_REVIEW: {
      label: "Dalam Tahap Review",
      badge: "bg-stone-50 text-amber-800 border-stone-200",
      dot: "bg-[#1E1B2E]",
    },
    CLOSED: {
      label: "Ditutup / Selesai",
      badge: "bg-stone-100 text-stone-600 border-stone-200",
      dot: "bg-stone-400",
    },
    CANCELLED: {
      label: "Dibatalkan",
      badge: "bg-rose-50 text-rose-800 border-rose-200",
      dot: "bg-rose-500",
    },
  };

  const currentBadge = statusBadges[brief.status] || statusBadges.OPEN;
  const pendingInterestsCount = brief.interests.filter((i) => i.status === "PENDING").length;

  // ── MATCH CONTEXT ENGINE (For Non-Initiators) ──────────────────────────────────
  let matchContext: { roleLabel: string; roleId: string; reasons: string[]; score: number } | null = null;
  
  if (!isInitiator && brief.status === "OPEN") {
    let bestScore = 0;
    for (const role of brief.neededRoles) {
      if (role.isFilled) continue;
      
      let score = 0;
      const reasons: string[] = [];
      const actorCategories = actorAssets.map((a) => a.category);

      // 1. Mandatory Gate: Asset Category Match (50 pts)
      if (actorCategories.includes(role.assetCategory)) {
        score += 50;
        reasons.push("Kategori Aset Cocok");
      }

      if (score >= 50) {
        // 2. Aesthetic Match (20 pts)
        if (brief.aestheticStyle && actor.aestheticStyles.includes(brief.aestheticStyle)) {
          score += 20;
          reasons.push("Gaya Visual Sesuai");
        }
        
        // 3. Location Match (15 pts)
        if (brief.location && actor.location) {
          const bLoc = brief.location.toLowerCase();
          const aLoc = actor.location.toLowerCase();
          if (aLoc.includes(bLoc) || bLoc.includes(aLoc) || bLoc.includes("remote")) {
            score += 15;
            reasons.push("Lokasi Relevan");
          }
        }
        
        // 4. Compensation Match (15 pts)
        if (brief.compensationModel && actor.compensationModels.includes(brief.compensationModel)) {
          score += 15;
          reasons.push("Model Kompensasi Sesuai");
        }
        
        if (score > bestScore) {
          bestScore = score;
          matchContext = { roleLabel: role.roleLabel, roleId: role.id, reasons, score };
        }
      }
    }
  }

  return (
    <AppShell actor={actor} activeRoute="/projects">
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Link href="/projects" className="hover:text-[#1E1B2E] font-bold transition-colors inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Galeri Proyek</span>
            </Link>
            <span>/</span>
            <span className="text-[#1E1B2E] truncate max-w-sm font-semibold">{brief.title}</span>
          </div>

          {isInitiator && (
            <Link
              href={`/projects/${brief.id}/interests`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-50 hover:bg-amber-100 border border-stone-200 text-amber-900 text-xs font-bold transition-all"
            >
              <span>Review Peminat</span>
              {pendingInterestsCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-[#1E1B2E] text-white">
                  {pendingInterestsCount} baru
                </span>
              )}
            </Link>
          )}
        </div>

        {/* PERSONALIZED MATCH CONTEXT BANNER */}
        {matchContext && (
          <div className="p-6 bg-stone-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border border-stone-800">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                    Sinyal Komplementer
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {matchContext.score}% Cocok
                  </span>
                </div>
                <h3 className="text-base font-medium text-white tracking-tight">
                  Anda direkomendasikan untuk peran <span className="font-bold text-emerald-300">{matchContext.roleLabel}</span>
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {matchContext.reasons.map((reason, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-white/10 text-stone-200 border border-white/15">
                      <Check className="w-3 h-3 text-emerald-400" />
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <a
                href={`#role-${matchContext.roleId}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                <span>Lamar Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Project Lifecycle Bar */}
        <div className="p-6 bg-white border border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-stone-900" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
                Fase Produksi Proyek
              </span>
            </div>
            <span className="text-xs font-semibold text-stone-800">
              {brief.status === "CLOSED"
                ? "✓ Proyek Selesai"
                : brief.status === "IN_REVIEW"
                ? "⚡ Kolaborasi Sedang Berjalan"
                : brief.status === "FILLED"
                ? "🎯 Tim Lengkap — Menuju Workspace"
                : "Tahap 02: Kurasi Kru & Peminat"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-stone-100 text-xs">
            {(() => {
              const activeStep =
                brief.status === "CLOSED"
                  ? 5
                  : brief.status === "IN_REVIEW"
                  ? 4
                  : brief.status === "FILLED"
                  ? 3
                  : 2;

              const steps = [
                { num: "01", title: "Inisiasi Brief" },
                { num: "02", title: "Kurasi Tim" },
                { num: "03", title: "Aktivasi Workspace" },
                { num: "04", title: "Eksekusi Karya" },
                { num: "05", title: "Rilis & Dampak" },
              ];

              return steps.map((s, idx) => {
                const stepNum = idx + 1;
                const isPassed = stepNum < activeStep;
                const isCurrent = stepNum === activeStep;

                return (
                  <div
                    key={s.num}
                    className={`p-3 border transition-all ${
                      isCurrent
                        ? "border-stone-900 bg-stone-50"
                        : isPassed
                        ? "border-stone-200 bg-stone-50/50"
                        : "border-stone-100 bg-transparent opacity-40"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className={isCurrent ? "text-stone-900" : isPassed ? "text-emerald-700" : "text-stone-400"}>
                        {s.num}
                      </span>
                      {isPassed && <Check className="w-3 h-3 text-emerald-600" />}
                      {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                    </div>
                    <div className={`mt-1 font-medium truncate ${isCurrent ? "text-stone-900 font-bold" : "text-stone-600"}`}>
                      {s.title}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Editorial Spec Header */}
        <div className="p-8 sm:p-10 bg-white border border-stone-200 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
              {brief.projectType}
            </span>
            <span className="text-stone-300">•</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold border ${currentBadge.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${currentBadge.dot} ${brief.status === "OPEN" ? "animate-pulse" : ""}`} />
              {currentBadge.label}
            </span>
            {brief.location && (
              <>
                <span className="text-stone-300">•</span>
                <span className="text-xs text-stone-500 flex items-center gap-1 font-light">
                  <MapPin className="w-3 h-3 text-stone-400" />
                  <span>{brief.location}</span>
                </span>
              </>
            )}
            <span className="text-xs text-stone-400 ml-auto font-light">
              Dibuat {new Date(brief.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-[#1E1B2E] tracking-tight leading-tight">
              {brief.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-stone-600 font-light">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">Target Luaran:</span>
              <span className="font-medium text-stone-800">{brief.targetOutput}</span>
              <span className="text-stone-300">|</span>
              <span className="text-stone-500">Karya Bersama (Co-Branding)</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-900 text-sm shrink-0">
                {brief.creatorActor.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#1E1B2E]">{brief.creatorActor.name}</p>
                  {isInitiator && (
                    <span className="px-2 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
                      Inisiator Anda
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-400 font-light">
                  {brief.creatorActor.sector} {brief.creatorActor.location ? `• ${brief.creatorActor.location}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-semibold text-[#1E1B2E]">
                  {filledRoles} dari {totalRoles} peran terisi
                </p>
                <p className="text-[10px] text-stone-400 font-light">
                  {allFilled ? "Tim lengkap — siap menuju workspace" : "Sedang mengkurasi kolaborator"}
                </p>
              </div>
              <div className="w-24 h-1.5 bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-stone-900 transition-all duration-500"
                  style={{ width: `${totalRoles > 0 ? (filledRoles / totalRoles) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Initiator Panel */}
        {isInitiator && (
          <div className="p-6 sm:p-8 rounded-[28px] bg-stone-50/50 border border-stone-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#1E1B2E]" />
                <h3 className="text-sm font-bold text-[#1E1B2E]">
                  Panel Kendali Inisiator Proyek
                </h3>
              </div>
              <p className="text-xs text-stone-500">
                {allFilled
                  ? "Semua peran telah diterima! Aktifkan ruang kolaborasi resmi untuk memulai eksekusi."
                  : `Tersisa ${totalRoles - filledRoles} peran lagi. Tinjau minat masuk dan pilih kolaborator yang memiliki kapabilitas aset terbaik.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <Link
                href={`/projects/${brief.id}/interests`}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-[#1E1B2E] text-xs font-bold transition-all border border-stone-200/80 flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Kelola Peminat</span>
                {pendingInterestsCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#1E1B2E] text-white font-bold">
                    {pendingInterestsCount} baru
                  </span>
                )}
              </Link>

              <FormCollaborationButton
                briefId={brief.id}
                isFilled={allFilled}
                acceptedCount={acceptedCount}
                collaborationId={brief.collaboration?.id}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="p-6 sm:p-8 rounded-[28px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1E1B2E]" />
                <span>Latar Belakang & Konsep Proyek</span>
              </h2>
              <p className="text-sm text-[#1E1B2E] leading-relaxed whitespace-pre-line max-w-prose">
                {brief.description}
              </p>
            </section>

            <section id="roles-section" className="space-y-4 scroll-mt-24">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#1E1B2E] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#1E1B2E]" />
                    <span>Panggung Kolaborasi — Peran Dibutuhkan</span>
                  </h2>
                  <p className="text-xs text-stone-500">
                    Bukan transaksi sewa jasa. Kolaborator menyumbang aset & kapabilitas untuk hasil karya bersama.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-[#1E1B2E] border border-stone-200">
                  {brief.neededRoles.length} Peran
                </span>
              </div>

              <div className="space-y-3">
                {brief.neededRoles.map((role) => {
                  const userInterest = role.interests.find((i) => i.actorId === actor.id);
                  const status = userInterest ? userInterest.status : null;
                  const isMatched = matchContext?.roleId === role.id;

                  return (
                    <RoleSlot
                      key={role.id}
                      briefId={brief.id}
                      roleId={role.id}
                      roleLabel={role.roleLabel}
                      assetCategory={role.assetCategory}
                      description={role.description}
                      maxCollaborators={role.maxCollaborators}
                      isFilled={role.isFilled}
                      interestCount={role.interests.length}
                      isInitiator={isInitiator}
                      currentActorInterestStatus={status}
                      actorAssets={actorAssets}
                      initialOpen={isMatched}
                      isMatched={isMatched}
                    />
                  );
                })}
              </div>
            </section>

            {isInitiator && brief.interests.length > 0 && (
              <section className="p-6 sm:p-8 rounded-[28px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#1E1B2E]" />
                    <span>Minat Masuk Terbaru ({brief.interests.length})</span>
                  </h3>
                  <Link
                    href={`/projects/${brief.id}/interests`}
                    className="text-xs font-bold text-[#1E1B2E] hover:underline transition-colors inline-flex items-center gap-1"
                  >
                    <span>Buka Halaman Review Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {brief.interests.slice(0, 2).map((item) => (
                    <InterestCard
                      key={item.id}
                      interestId={item.id}
                      briefId={brief.id}
                      roleLabel={item.role.roleLabel}
                      status={item.status}
                      message={item.message}
                      actor={{
                        id: item.actor.id,
                        name: item.actor.name,
                        sector: item.actor.sector,
                        location: item.actor.location,
                        description: item.actor.description,
                        assets: [],
                      }}
                      proposedAssets={(item.proposedAssets as string[]) || []}
                      isInitiator={isInitiator}
                    />
                  ))}
                </div>
              </section>
            )}

            {isInitiator && crewRecommendations.length > 0 && (
              <SmartCrewPanel recommendations={crewRecommendations} briefId={brief.id} />
            )}
          </div>

          <div className="space-y-6">
            {/* Editorial Production Specs Card */}
            <div className="bg-white border border-stone-200 divide-y divide-stone-100 text-xs">
              <div className="p-5 bg-stone-50/70 border-b border-stone-100 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-stone-900" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-600">
                  Lembar Spesifikasi Produksi
                </h3>
              </div>

              {/* Linimasa */}
              <div className="p-5 space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-600" />
                  <span>Jadwal & Linimasa</span>
                </h4>
                <div className="space-y-2 pt-1 font-light">
                  <div>
                    <span className="text-[11px] text-stone-400 block">Estimasi Durasi</span>
                    <span className="font-medium text-stone-900">{timeline.estimatedDuration || "Fleksibel / Sesuai Kesepakatan"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-400 block">Target Peluncuran</span>
                    <span className="font-medium text-stone-900">{timeline.targetLaunch || "Disesuaikan bersama tim"}</span>
                  </div>
                </div>
              </div>

              {/* Skema Nilai */}
              <div className="p-5 space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400 flex items-center gap-1.5">
                  <CircleDollarSign className="w-3.5 h-3.5 text-stone-600" />
                  <span>Skema Nilai & Gotong Royong</span>
                </h4>
                <div className="space-y-2 pt-1 font-light">
                  <div>
                    <span className="text-[11px] text-stone-400 block">Estimasi Nilai Proyek</span>
                    <span className="font-medium text-stone-900">{budget.estimatedTotal || "Model Gotong Royong / Revenue Share"}</span>
                  </div>
                  {budget.notes && (
                    <div>
                      <span className="text-[11px] text-stone-400 block">Catatan Pembagian</span>
                      <span className="font-medium text-stone-900 leading-relaxed block">{budget.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hak Cipta */}
              <div className="p-5 space-y-2 font-light">
                <div className="flex items-center gap-2">
                  <Handshake className="w-3.5 h-3.5 text-stone-600" />
                  <p className="text-[11px] font-semibold text-stone-900">Prinsip Hak Cipta & Kepemilikan (IP)</p>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Hak cipta orisinal aset tetap dimiliki masing-masing pencipta. Karya hasil kolaborasi dilindungi hak pakai bersama dan membagi dampak ekonomi luaran secara adil.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
