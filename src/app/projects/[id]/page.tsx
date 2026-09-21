import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getProjectBriefById } from "@/application/projectBriefService";
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

  const actorAssets = await prisma.asset.findMany({
    where: { actorId: actor.id, status: "ACTIVE" },
    select: { id: true, name: true, category: true, subtype: true },
  });

  const totalRoles = brief.neededRoles.length;
  const filledRoles = brief.neededRoles.filter((r) => r.isFilled).length;
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
      badge: "bg-amber-50 text-amber-800 border-amber-200",
      dot: "bg-amber-500",
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

  return (
    <AppShell actor={actor} activeRoute="/projects">
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#716B7E]">
            <Link href="/projects" className="hover:text-[#27213D] font-bold transition-colors inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Galeri Proyek</span>
            </Link>
            <span>/</span>
            <span className="text-[#27213D] truncate max-w-sm font-semibold">{brief.title}</span>
          </div>

          {isInitiator && (
            <Link
              href={`/projects/${brief.id}/interests`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition-all"
            >
              <span>Review Peminat</span>
              {pendingInterestsCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-[#E66A48] text-white">
                  {pendingInterestsCount} baru
                </span>
              )}
            </Link>
          )}
        </div>

        {/* Project Lifecycle Indicator */}
        <div className="p-5 rounded-2xl bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.02)]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#716B7E] mb-3">
            Siklus Proyek Kolaboratif RAMU
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <span>01 • Selesai</span>
                <Check className="w-3 h-3 text-emerald-600" />
              </span>
              <span className="font-bold text-[#27213D] mt-0.5 block">Inisiasi Brief</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 shadow-2xs">
              <span className="text-[10px] text-amber-800 font-bold block">02 • Berjalan</span>
              <span className="font-black text-amber-950 mt-0.5 block">Kurasi Tim</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50/50 border border-stone-200/40 opacity-70">
              <span className="text-[10px] text-stone-400 font-bold block">03 • Berikutnya</span>
              <span className="font-medium text-[#716B7E] mt-0.5 block">Aktivasi Workspace</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50/50 border border-stone-200/40 opacity-70">
              <span className="text-[10px] text-stone-400 font-bold block">04 • Rencana</span>
              <span className="font-medium text-[#716B7E] mt-0.5 block">Eksekusi Karya</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50/50 border border-stone-200/40 opacity-70">
              <span className="text-[10px] text-stone-400 font-bold block">05 • Luaran</span>
              <span className="font-medium text-[#716B7E] mt-0.5 block">Rilis & Bagi Hasil</span>
            </div>
          </div>
        </div>

        {/* Hero Card */}
        <div className="p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.04)] space-y-6 relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentBadge.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentBadge.dot} ${brief.status === "OPEN" ? "animate-pulse" : ""}`} />
              {currentBadge.label}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-[#27213D] border border-stone-200">
              {brief.projectType}
            </span>
            {brief.location && (
              <span className="px-3 py-1 rounded-full text-xs text-[#716B7E] bg-stone-50 border border-stone-200/70 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>{brief.location}</span>
              </span>
            )}
            <span className="text-xs text-[#716B7E] ml-auto">
              Dibuat {new Date(brief.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-black text-[#27213D] tracking-tight leading-tight">
              {brief.title}
            </h1>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#E66A48] shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#716B7E] font-bold">
                    Target Luaran Bersama
                  </p>
                  <p className="text-sm sm:text-base font-bold text-[#27213D]">
                    {brief.targetOutput}
                  </p>
                </div>
              </div>

              <span className="text-xs px-3 py-1 rounded-lg bg-white text-[#716B7E] border border-stone-200/80 font-medium self-start sm:self-auto">
                Karya Bersama (Co-Branding)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center font-black text-amber-800 text-base shadow-xs shrink-0">
                {brief.creatorActor.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[#27213D]">{brief.creatorActor.name}</p>
                  {isInitiator && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF7ED] text-[#E66A48] border border-[#F9D8C4]">
                      Inisiator Proyek
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#716B7E]">
                  {brief.creatorActor.sector} {brief.creatorActor.location ? `• ${brief.creatorActor.location}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-[#27213D]">
                  {filledRoles} dari {totalRoles} peran terisi
                </p>
                <p className="text-[10px] text-[#716B7E]">
                  {allFilled ? "Tim lengkap — siap bentuk workspace" : "Sedang kurasi kolaborator"}
                </p>
              </div>
              <div className="w-24 h-2 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-[#E66A48] transition-all duration-500 rounded-full"
                  style={{ width: `${totalRoles > 0 ? (filledRoles / totalRoles) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Initiator Panel */}
        {isInitiator && (
          <div className="p-6 sm:p-8 rounded-[28px] bg-amber-50/50 border border-amber-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#E66A48]" />
                <h3 className="text-sm font-bold text-[#27213D]">
                  Panel Kendali Inisiator Proyek
                </h3>
              </div>
              <p className="text-xs text-[#716B7E]">
                {allFilled
                  ? "Semua peran telah diterima! Aktifkan ruang kolaborasi resmi untuk memulai eksekusi."
                  : `Tersisa ${totalRoles - filledRoles} peran lagi. Tinjau minat masuk dan pilih kolaborator yang memiliki kapabilitas aset terbaik.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <Link
                href={`/projects/${brief.id}/interests`}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-[#27213D] text-xs font-bold transition-all border border-stone-200/80 flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Kelola Peminat</span>
                {pendingInterestsCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#E66A48] text-white font-bold">
                    {pendingInterestsCount} baru
                  </span>
                )}
              </Link>

              <FormCollaborationButton
                briefId={brief.id}
                isFilled={allFilled}
                collaborationId={brief.collaboration?.id}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="p-6 sm:p-8 rounded-[28px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#716B7E] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#E66A48]" />
                <span>Latar Belakang & Konsep Proyek</span>
              </h2>
              <p className="text-sm text-[#27213D] leading-relaxed whitespace-pre-line max-w-prose">
                {brief.description}
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#27213D] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#E66A48]" />
                    <span>Panggung Kolaborasi — Peran Dibutuhkan</span>
                  </h2>
                  <p className="text-xs text-[#716B7E]">
                    Bukan transaksi sewa jasa. Kolaborator menyumbang aset & kapabilitas untuk hasil karya bersama.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-[#27213D] border border-stone-200">
                  {brief.neededRoles.length} Peran
                </span>
              </div>

              <div className="space-y-3">
                {brief.neededRoles.map((role) => {
                  const userInterest = role.interests.find((i) => i.actorId === actor.id);
                  const status = userInterest ? userInterest.status : null;

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
                    />
                  );
                })}
              </div>
            </section>

            {isInitiator && brief.interests.length > 0 && (
              <section className="p-6 sm:p-8 rounded-[28px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#716B7E] flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#E66A48]" />
                    <span>Minat Masuk Terbaru ({brief.interests.length})</span>
                  </h3>
                  <Link
                    href={`/projects/${brief.id}/interests`}
                    className="text-xs font-bold text-[#E66A48] hover:underline transition-colors inline-flex items-center gap-1"
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
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-[28px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#716B7E] flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#E66A48]" />
                <span>Jadwal & Linimasa</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-[#716B7E]">Estimasi Durasi</p>
                  <p className="font-bold text-[#27213D] mt-0.5">
                    {timeline.estimatedDuration || "Fleksibel / Sesuai Kesepakatan"}
                  </p>
                </div>
                <div>
                  <p className="text-[#716B7E]">Target Peluncuran</p>
                  <p className="font-bold text-[#27213D] mt-0.5">
                    {timeline.targetLaunch || "Disesuaikan bersama tim"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-[28px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#716B7E] flex items-center gap-2">
                <CircleDollarSign className="w-3.5 h-3.5 text-[#E66A48]" />
                <span>Skema Nilai & Gotong Royong</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-[#716B7E]">Estimasi Nilai Proyek</p>
                  <p className="font-bold text-[#27213D] mt-0.5">
                    {budget.estimatedTotal || "Model Gotong Royong / Revenue Share"}
                  </p>
                </div>
                {budget.notes && (
                  <div>
                    <p className="text-[#716B7E]">Catatan Pembagian</p>
                    <p className="font-medium text-[#27213D] leading-relaxed mt-0.5">{budget.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 rounded-[28px] bg-[#FFF7ED] border border-[#F9D8C4] space-y-2.5">
              <div className="flex items-center gap-2">
                <Handshake className="w-4 h-4 text-[#E66A48]" />
                <p className="text-xs font-bold text-[#E66A48]">Prinsip Hak Cipta & Kepemilikan (IP)</p>
              </div>
              <p className="text-xs text-[#716B7E] leading-relaxed">
                Hak cipta orisinal aset tetap dimiliki masing-masing pencipta. Karya hasil kolaborasi dilindungi hak pakai bersama dan membagi dampak ekonomi luaran secara adil.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
