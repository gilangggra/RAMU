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
import { BriefManageMenu } from "@/components/projects/BriefManageMenu";
import { AppShell } from "@/components/layout/AppShell";
import { Navbar } from "@/components/landing/Navbar";
import { ShareProjectButton } from "@/components/projects/ShareProjectButton";
import { ActorAvatar } from "@/components/ui/ActorAvatar";
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

  const { id } = await params;

  let actor = null;
  if (user) {
    actor = await prisma.actor.findFirst({
      where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
      orderBy: { createdAt: "asc" },
    });
    if (!actor) redirect("/onboarding");
  }

  const isGuest = !actor;
  const brief = await getProjectBriefById(id);

  if (!brief) {
    notFound();
  }

  const isInitiator = actor ? brief.creatorActorId === actor.id : false;

  // Stage 2: Fetch crew recommendations and actor assets
  const [crewRecommendations, actorAssets] = await Promise.all([
    isInitiator ? getCrewRecommendationsForBrief(id, brief) : Promise.resolve([]),
    actor
      ? prisma.asset.findMany({
          where: { actorId: actor.id, status: "ACTIVE" },
          select: { id: true, name: true, category: true, subtype: true },
        })
      : Promise.resolve([]),
  ]);

  const totalRoles = brief.neededRoles.length;
  const filledRoles = brief.neededRoles.filter((r) => r.isFilled).length;
  const acceptedCount = brief.neededRoles.reduce(
    (acc, r) => acc + r.interests.filter((i) => i.status === "ACCEPTED").length,
    0
  );
  const allFilled = totalRoles > 0 && filledRoles === totalRoles;

  const timeline = (brief.timeline as { estimatedDuration?: string; targetLaunch?: string }) || {};
  const budget = (brief.budget as { estimatedTotal?: string; notes?: string; roleFees?: Record<string, string> }) || {};
  const roleFees = budget.roleFees || {};

  const getRoleFee = (role: { roleLabel: string; description?: string | null }) => {
    if (roleFees[role.roleLabel]) return roleFees[role.roleLabel];
    if (role.description?.includes("[Estimasi Fee:")) {
      const match = role.description.match(/\[Estimasi Fee:\s*([^\]]+)\]/);
      if (match?.[1]) return match[1].trim();
    }
    return null;
  };

  const statusBadges: Record<string, { label: string; badge: string; dot: string }> = {
    OPEN: {
      label: "Terbuka untuk Kolaborasi",
      badge: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
      dot: "bg-emerald-500",
    },
    FILLED: {
      label: "Semua Peran Terisi",
      badge: "bg-[#4CC9FE]/15 text-[#0284c7] border-[#4CC9FE]/30",
      dot: "bg-[#4CC9FE]",
    },
    IN_REVIEW: {
      label: "Dalam Tahap Review",
      badge: "bg-amber-50 text-amber-800 border-amber-200/80",
      dot: "bg-amber-500",
    },
    CLOSED: {
      label: "Ditutup / Selesai",
      badge: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
    },
    CANCELLED: {
      label: "Dibatalkan",
      badge: "bg-rose-50 text-rose-800 border-rose-200",
      dot: "bg-rose-500",
    },
  };

  const currentBadge = statusBadges[brief.status] || statusBadges.OPEN;
  const pendingInterestsCount = brief.interests.filter((i) => i.status === "PENDING").length;

  let matchContext: { roleLabel: string; roleId: string; reasons: string[]; score: number } | null = null;

  if (actor && !isInitiator && brief.status === "OPEN") {
    let bestScore = 0;
    for (const role of brief.neededRoles) {
      if (role.isFilled) continue;

      let score = 0;
      const reasons: string[] = [];
      const actorCategories = actorAssets.map((a) => a.category);

      if (actorCategories.includes(role.assetCategory)) {
        score += 50;
        reasons.push("Kategori Aset Cocok");
      }

      if (score >= 50) {

        if (brief.aestheticStyle && actor.aestheticStyles.includes(brief.aestheticStyle)) {
          score += 20;
          reasons.push("Gaya Visual Sesuai");
        }

        if (brief.location && actor.location) {
          const bLoc = brief.location.toLowerCase();
          const aLoc = actor.location.toLowerCase();
          if (aLoc.includes(bLoc) || bLoc.includes(aLoc) || bLoc.includes("remote")) {
            score += 15;
            reasons.push("Lokasi Relevan");
          }
        }

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

  const pageContent = (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-16">
      {isGuest && (
        <div className="glass-card p-5 rounded-[22px] bg-amber-500/10 border-amber-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Mode Penampil Tamu
              </p>
            </div>
            <p className="text-xs text-slate-600 font-normal leading-relaxed">
              Anda sedang melihat brief proyek kreatif resmi di RAMU. Masuk atau daftar akun untuk mengajukan minat kolaborasi peran.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href={`/login?redirectTo=/projects/${brief.id}`}
              className="px-4.5 py-2 text-xs font-semibold text-slate-700 bg-white/80 hover:bg-white border border-slate-200/80 rounded-full shadow-2xs transition-all"
            >
              Masuk
            </Link>
            <Link
              href={`/register?redirectTo=/projects/${brief.id}`}
              className="px-5 py-2 text-xs font-semibold bg-[#4CC9FE] hover:bg-[#38b6eb] text-white rounded-full shadow-md shadow-[#4CC9FE]/20 transition-all"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200/80 shadow-2xs transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Papan Proyek</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <ShareProjectButton projectId={brief.id} projectTitle={brief.title} />

          {isInitiator && (
            <>
              <Link
                href={`/projects/${brief.id}/interests`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hover:bg-white border border-slate-200/80 text-slate-800 text-xs font-semibold transition-all shadow-2xs"
              >
                <span>Review Peminat</span>
                {pendingInterestsCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#4CC9FE] text-white">
                    {pendingInterestsCount} baru
                  </span>
                )}
              </Link>
              <BriefManageMenu
                briefId={brief.id}
                briefStatus={brief.status}
                initialTitle={brief.title}
                initialDescription={brief.description}
                initialProjectType={brief.projectType}
                initialTargetOutput={brief.targetOutput}
                initialLocation={brief.location || ""}
                initialEstimatedDuration={timeline.estimatedDuration || ""}
                initialTargetLaunch={timeline.targetLaunch || ""}
                initialCompensationModel={brief.compensationModel || "PAID"}
                initialEstimatedTotal={budget.estimatedTotal || ""}
                initialBudgetNotes={budget.notes || ""}
                initialAestheticStyle={brief.aestheticStyle || ""}
              />
            </>
          )}
        </div>
      </div>

      {brief.collaborationId && (
        <div className="glass-card p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-850 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border-white/15 rounded-[22px] shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 rounded-2xl">
              <Handshake className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                  Ruang Proyek Aktif
                </span>
                <span className="text-[10px] font-medium px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sedang Berjalan
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Ruang Kolaborasi Telah Resmi Dibentuk
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl font-normal">
                Pantau pembagian peran, roadmap tugas bersama tim, milestone produksi, dan SPK perikatan resmi multi-pihak.
              </p>
            </div>
          </div>
          <div className="shrink-0 self-end sm:self-center">
            <Link
              href={`/collaborations/${brief.collaborationId}`}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#4CC9FE] hover:bg-[#38b6eb] text-white text-xs font-semibold shadow-md shadow-[#4CC9FE]/20 cursor-pointer transition-all"
            >
              <span>Buka Ruang Kerja</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {matchContext && (
        <div className="glass-card p-6 bg-gradient-to-r from-[#4CC9FE]/15 via-white/85 to-white/95 text-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border-[#4CC9FE]/40 rounded-[22px] shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-[#4CC9FE]/20 text-[#0284c7] border border-[#4CC9FE]/30 flex items-center justify-center shrink-0 rounded-2xl">
              <Target className="w-5 h-5 text-[#0284c7]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284c7]">
                  Sinyal Komplementer
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 bg-[#4CC9FE]/20 text-[#0284c7] border border-[#4CC9FE]/30 rounded-full">
                  {matchContext.score}% Cocok
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                Anda direkomendasikan untuk peran <span className="font-bold text-[#0284c7]">{matchContext.roleLabel}</span>
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {matchContext.reasons.map((reason, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold bg-white/90 text-slate-700 border border-slate-200/80 rounded-full shadow-2xs">
                    <Check className="w-3 h-3 text-emerald-600" />
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="shrink-0">
            <a
              href={`#role-${matchContext.roleId}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4CC9FE] hover:bg-[#38b6eb] text-white text-xs font-semibold shadow-md shadow-[#4CC9FE]/20 cursor-pointer transition-all"
            >
              <span>Lamar Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* PRODUKSI TAHAPAN PROYEK */}
      <div className="glass-card p-5 sm:p-6 rounded-[22px] border-white/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4CC9FE]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Fase Produksi Proyek
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-800">
            {brief.status === "CLOSED"
              ? "Proyek Selesai"
              : brief.status === "IN_REVIEW"
              ? "Kolaborasi Sedang Berjalan"
              : brief.status === "FILLED"
              ? "Tim Lengkap — Menuju Workspace"
              : "Tahap 02: Kurasi Kru & Peminat"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-100 text-xs">
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
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? "border-[#4CC9FE] bg-[#4CC9FE]/10 shadow-xs ring-1 ring-[#4CC9FE]/30"
                      : isPassed
                      ? "border-emerald-200/80 bg-emerald-50/50"
                      : "border-slate-100 bg-white/40 opacity-55"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className={isCurrent ? "text-[#0284c7]" : isPassed ? "text-emerald-700" : "text-slate-400"}>
                      {s.num}
                    </span>
                    {isPassed && <Check className="w-3 h-3 text-emerald-600" />}
                    {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#4CC9FE] animate-pulse" />}
                  </div>
                  <div className={`mt-1 font-medium ${isCurrent ? "text-slate-900 font-bold" : "text-slate-600"}`}>
                    {s.title}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* BRIEF INFO HERO */}
      <div className="glass-card p-6 sm:p-7 rounded-[22px] border-white/80 space-y-6 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-3.5 py-1 bg-white/80 text-slate-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-white/80 shadow-2xs">
            {brief.projectType}
          </span>
          <span className="text-slate-300">•</span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full border ${currentBadge.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${currentBadge.dot} ${brief.status === "OPEN" ? "animate-pulse" : ""}`} />
            {currentBadge.label}
          </span>
          {brief.location && (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-600 flex items-center gap-1.5 font-medium bg-white/60 px-3 py-1 rounded-full border border-white/80 shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-[#0284c7]" />
                <span>{brief.location}</span>
              </span>
            </>
          )}
          <span className="text-xs text-slate-400 ml-auto font-normal">
            Dibuat {new Date(brief.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {brief.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-slate-600">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Luaran:</span>
            <span className="font-semibold text-[#0284c7] bg-[#4CC9FE]/10 px-3 py-1 rounded-full border border-[#4CC9FE]/30">
              {brief.targetOutput}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">Karya Bersama (Co-Branding)</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100/90">
          <div className="flex items-center gap-3.5">
            <ActorAvatar
              name={brief.creatorActor.name}
              avatarUrl={brief.creatorActor.owner?.avatarUrl}
              className="w-11 h-11 rounded-2xl ring-2 ring-white/80 shadow-2xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-900">{brief.creatorActor.name}</p>
                {isInitiator && (
                  <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#4CC9FE]/15 text-[#0284c7] rounded-full border border-[#4CC9FE]/30">
                    Inisiator Anda
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-normal">
                {brief.creatorActor.sector} {brief.creatorActor.location ? `• ${brief.creatorActor.location}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-white/60 backdrop-blur-xs px-4.5 py-2.5 rounded-2xl border border-white/80 shadow-2xs">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900">
                {filledRoles} dari {totalRoles} peran terisi
              </p>
              <p className="text-[10px] text-slate-400 font-normal">
                {allFilled ? "Tim lengkap — siap menuju workspace" : "Sedang mengkurasi kolaborator"}
              </p>
            </div>
            <div className="w-24 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <div
                className="h-full bg-[#4CC9FE] rounded-full transition-all duration-500"
                style={{ width: `${totalRoles > 0 ? (filledRoles / totalRoles) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {isInitiator && (
        <div className="glass-card p-5 sm:p-6 rounded-[22px] border-white/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#4CC9FE]/15 border border-[#4CC9FE]/30 flex items-center justify-center shrink-0">
                <Settings className="w-4 h-4 text-[#0284c7]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Panel Kendali Inisiator Proyek
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-normal max-w-xl">
              {allFilled
                ? "Semua peran telah diterima! Aktifkan ruang kolaborasi resmi untuk memulai eksekusi bersama tim."
                : `Tersisa ${totalRoles - filledRoles} peran lagi. Tinjau minat masuk dan pilih kolaborator yang memiliki kapabilitas aset terbaik.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Link
              href={`/projects/${brief.id}/interests`}
              className="px-4.5 py-2.5 rounded-full bg-white/80 hover:bg-white text-slate-800 text-xs font-semibold transition-all border border-white/80 flex items-center gap-2 shadow-2xs hover:shadow-xs cursor-pointer"
            >
              <span>Kelola Peminat</span>
              {pendingInterestsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#4CC9FE] text-white font-bold">
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

            <BriefManageMenu
              briefId={brief.id}
              briefStatus={brief.status}
              initialTitle={brief.title}
              initialDescription={brief.description}
              initialProjectType={brief.projectType}
              initialTargetOutput={brief.targetOutput}
              initialLocation={brief.location || ""}
              initialEstimatedDuration={timeline.estimatedDuration || ""}
              initialTargetLaunch={timeline.targetLaunch || ""}
              initialCompensationModel={brief.compensationModel || "PAID"}
              initialEstimatedTotal={budget.estimatedTotal || ""}
              initialBudgetNotes={budget.notes || ""}
              initialAestheticStyle={brief.aestheticStyle || ""}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-card p-6 sm:p-7 rounded-[22px] border-white/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#4CC9FE]/15 border border-[#4CC9FE]/30 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-[#0284c7]" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Latar Belakang & Konsep Proyek
              </h2>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal pt-1">
              {brief.description}
            </p>
          </section>

          <section id="roles-section" className="space-y-4 scroll-mt-24">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#4CC9FE]/15 border border-[#4CC9FE]/30 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-[#0284c7]" />
                  </div>
                  <span>Panggung Kolaborasi — Peran Dibutuhkan</span>
                </h2>
                <p className="text-xs text-slate-500 font-normal mt-1">
                  Bukan transaksi sewa jasa. Kolaborator menyumbang aset & kapabilitas untuk hasil karya bersama.
                </p>
              </div>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/80 text-slate-800 border border-white/80 shadow-2xs">
                {brief.neededRoles.length} Peran
              </span>
            </div>

            <div className="space-y-3">
              {brief.neededRoles.map((role) => {
                const userInterest = actor ? role.interests.find((i) => i.actorId === actor.id) : null;
                const status = userInterest ? userInterest.status : null;
                const isMatched = matchContext?.roleId === role.id;

                const fee = getRoleFee(role);

                return (
                  <RoleSlot
                    key={role.id}
                    briefId={brief.id}
                    roleId={role.id}
                    roleLabel={role.roleLabel}
                    assetCategory={role.assetCategory}
                    description={role.description}
                    fee={fee}
                    maxCollaborators={role.maxCollaborators}
                    isFilled={role.isFilled}
                    interestCount={role.interests.length}
                    isInitiator={isInitiator}
                    currentActorInterestStatus={status}
                    userInterestId={userInterest?.id}
                    isInvited={Boolean(userInterest?.isInvited)}
                    actorAssets={actorAssets}
                    initialOpen={isMatched}
                    isMatched={isMatched}
                    isGuest={isGuest}
                  />
                );
              })}
            </div>
          </section>

          {isInitiator && brief.interests.length > 0 && (
            <section className="glass-card p-6 sm:p-7 rounded-[22px] border-white/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#4CC9FE]/15 border border-[#4CC9FE]/30 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#0284c7]" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Minat Masuk Terbaru ({brief.interests.length})
                  </h3>
                </div>
                <Link
                  href={`/projects/${brief.id}/interests`}
                  className="text-xs font-semibold text-[#0284c7] hover:underline transition-colors inline-flex items-center gap-1.5"
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
                    isInvited={Boolean(item.isInvited)}
                    actor={{
                      id: item.actor.id,
                      name: item.actor.name,
                      sector: item.actor.sector,
                      location: item.actor.location,
                      avatarUrl: item.actor.owner?.avatarUrl || null,
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
          <div className="glass-card rounded-[22px] border-white/80 shadow-xs divide-y divide-slate-100/80 text-xs overflow-hidden">
            <div className="p-5.5 bg-gradient-to-r from-sky-50/60 to-white/80 border-b border-slate-100/80 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#4CC9FE]" />
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Lembar Spesifikasi Produksi
              </h3>
            </div>

            <div className="p-5.5 space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0284c7]" />
                <span>Jadwal & Linimasa</span>
              </h4>
              <div className="space-y-2.5 pt-1 font-normal">
                <div className="p-3.5 rounded-2xl bg-white/60 border border-white/80 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">Estimasi Durasi</span>
                  <span className="font-semibold text-slate-900 text-xs">{timeline.estimatedDuration || "Fleksibel / Sesuai Kesepakatan"}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/60 border border-white/80 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">Target Peluncuran</span>
                  <span className="font-semibold text-slate-900 text-xs">{timeline.targetLaunch || "Disesuaikan bersama tim"}</span>
                </div>
              </div>
            </div>

            <div className="p-5.5 space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CircleDollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Skema Honorarium &amp; Anggaran SPK</span>
              </h4>
              <div className="space-y-2.5 pt-1 font-normal">
                <div className="p-3.5 rounded-2xl bg-white/60 border border-white/80 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">Estimasi Total Anggaran</span>
                  <span className="font-semibold text-slate-900 text-xs">
                    {budget.estimatedTotal || "Honorarium Flat per Peran"}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">Ketentuan Termin SPK</span>
                  <p className="text-xs text-emerald-950 font-medium">
                    Termin I DP 50% di muka &bull; Termin II Pelunasan 50% setelah deliverable disetujui
                  </p>
                </div>

                {brief.neededRoles.some((r) => Boolean(getRoleFee(r))) && (
                  <div className="p-3.5 rounded-2xl bg-white/60 border border-white/80 shadow-2xs space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Rincian Hak per Peran</span>
                    <div className="divide-y divide-slate-100 text-xs">
                      {brief.neededRoles.map((r) => {
                        const fee = getRoleFee(r);
                        return (
                          <div key={r.id} className="py-1.5 flex items-center justify-between gap-2">
                            <span className="text-slate-700 font-medium truncate">{r.roleLabel}</span>
                            <span className="font-bold text-slate-900 shrink-0">{fee || "Sesuai Negosiasi"}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {budget.notes && (
                  <div className="p-3.5 rounded-2xl bg-white/60 border border-white/80 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">Catatan Tambahan Biaya</span>
                    <span className="font-medium text-slate-700 leading-relaxed block text-xs">{budget.notes}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5.5 space-y-2.5 font-normal">
              <div className="flex items-center gap-2">
                <Handshake className="w-3.5 h-3.5 text-[#0284c7]" />
                <p className="text-[11px] font-bold text-slate-900">Perlindungan Kontrak SPK Digital</p>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Seluruh kesepakatan honor dan hak guna karya (usage rights) dilindungi secara otomatis melalui draf SPK digital resmi RAMU dengan audit trail terverifikasi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isGuest || !actor) {
    return (
      <div className="min-h-screen app-background text-slate-900 font-sans selection:bg-[#4CC9FE]/25 selection:text-[#0284c7]">
        <Navbar />
        <main className="pt-28 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto pb-24">
          {pageContent}
        </main>
      </div>
    );
  }

  return (
    <AppShell actor={actor} activeRoute="/projects">
      {pageContent}
    </AppShell>
  );
}
