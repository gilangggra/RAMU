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
      badge: "bg-primary-950 text-primary-300 border-primary-700/50",
      dot: "bg-primary-400",
    },
    FILLED: {
      label: "Semua Peran Terisi",
      badge: "bg-blue-950/60 text-blue-300 border-blue-600/40",
      dot: "bg-blue-400",
    },
    IN_REVIEW: {
      label: "Dalam Tahap Review",
      badge: "bg-amber-950/60 text-amber-300 border-amber-600/40",
      dot: "bg-amber-400",
    },
    CLOSED: {
      label: "Ditutup / Selesai",
      badge: "bg-neutral-800 text-neutral-400 border-neutral-700",
      dot: "bg-neutral-500",
    },
    CANCELLED: {
      label: "Dibatalkan",
      badge: "bg-rose-950/60 text-rose-400 border-rose-600/40",
      dot: "bg-rose-400",
    },
  };

  const currentBadge = statusBadges[brief.status] || statusBadges.OPEN;
  const pendingInterestsCount = brief.interests.filter((i) => i.status === "PENDING").length;

  return (
    <AppShell actor={actor} activeRoute="/projects">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Link href="/projects" className="hover:text-neutral-200 transition-colors">
            ← Galeri Proyek
          </Link>
          <span>/</span>
          <span className="text-neutral-200 truncate max-w-sm font-medium">{brief.title}</span>
        </div>

        {isInitiator && (
          <Link
            href={`/projects/${brief.id}/interests`}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-primary-950 hover:bg-primary-900 border border-primary-700/60 text-primary-300 text-xs font-semibold transition-all"
          >
            <span>Review Peminat</span>
            {pendingInterestsCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-neutral-950">
                {pendingInterestsCount} baru
              </span>
            )}
          </Link>
        )}
      </div>

      <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800">
        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-3">
          Siklus Proyek Kolaboratif RAMU
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-[10px] text-primary-400 font-bold flex items-center gap-1">
              <span>01 • Selesai</span>
              <Check className="w-3 h-3 text-primary-400" />
            </span>
            <span className="font-semibold text-neutral-300">Inisiasi Brief</span>
          </div>

          <div className="p-2.5 rounded-xl bg-primary-950/80 border border-primary-700/60 shadow-sm">
            <span className="text-[10px] text-primary-300 font-bold block">02 • Sedang Berjalan</span>
            <span className="font-bold text-neutral-100">Kurasi Kolaborator</span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 opacity-70">
            <span className="text-[10px] text-neutral-500 font-bold block">03 • Berikutnya</span>
            <span className="font-medium text-neutral-400">Aktivasi Workspace</span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 opacity-70">
            <span className="text-[10px] text-neutral-500 font-bold block">04 • Rencana</span>
            <span className="font-medium text-neutral-400">Eksekusi Karya</span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 opacity-70">
            <span className="text-[10px] text-neutral-500 font-bold block">05 • Luaran</span>
            <span className="font-medium text-neutral-400">Rilis & Bagi Hasil</span>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${currentBadge.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentBadge.dot} ${brief.status === "OPEN" ? "animate-pulse" : ""}`} />
            {currentBadge.label}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
            {brief.projectType}
          </span>
          {brief.location && (
            <span className="px-3 py-1 rounded-full text-xs text-neutral-400 bg-neutral-950 border border-neutral-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              <span>{brief.location}</span>
            </span>
          )}
          <span className="text-xs text-neutral-500 ml-auto">
            Dibuat {new Date(brief.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}
          </span>
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-100 tracking-tight leading-tight">
            {brief.title}
          </h1>

          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-950 border border-primary-700/50 flex items-center justify-center text-primary-300 shrink-0">
                <Target className="w-5 h-5 text-primary-300" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
                  Target Luaran Bersama
                </p>
                <p className="text-sm sm:text-base font-bold text-neutral-100">
                  {brief.targetOutput}
                </p>
              </div>
            </div>

            <span className="text-xs px-3 py-1 rounded-lg bg-neutral-900 text-neutral-400 border border-neutral-800 self-start sm:self-auto">
              Karya Bersama (Co-Branding)
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-700 to-neutral-800 border border-primary-600/40 flex items-center justify-center font-black text-primary-100 text-base shadow-md shrink-0">
              {brief.creatorActor.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-neutral-200">{brief.creatorActor.name}</p>
                {isInitiator && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-950 text-primary-300 border border-primary-700/50">
                    Inisiator Proyek
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400">
                {brief.creatorActor.sector} {brief.creatorActor.location ? `• ${brief.creatorActor.location}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-neutral-200">
                {filledRoles} dari {totalRoles} peran terisi
              </p>
              <p className="text-[10px] text-neutral-500">
                {allFilled ? "Tim lengkap — siap bentuk workspace" : "Sedang kurasi kolaborator"}
              </p>
            </div>
            <div className="w-20 h-2.5 rounded-full bg-neutral-950 border border-neutral-800 overflow-hidden">
              <div
                className="h-full bg-primary-500 transition-all duration-500"
                style={{ width: `${totalRoles > 0 ? (filledRoles / totalRoles) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {isInitiator && (
        <div className="p-6 rounded-2xl bg-neutral-900/90 border border-primary-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary-400" />
              <h3 className="text-sm font-bold text-neutral-100">
                Panel Kendali Inisiator Proyek
              </h3>
            </div>
            <p className="text-xs text-neutral-400">
              {allFilled
                ? "Semua peran telah diterima! Aktifkan ruang kolaborasi resmi untuk memulai eksekusi."
                : `Tersisa ${totalRoles - filledRoles} peran lagi. Tinjau minat masuk dan pilih kolaborator yang memiliki kapabilitas aset terbaik.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Link
              href={`/projects/${brief.id}/interests`}
              className="px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-200 text-xs font-bold transition-all border border-neutral-800 flex items-center gap-2"
            >
              <span>Kelola Peminat</span>
              {pendingInterestsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-neutral-950 font-bold">
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
          <section className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-neutral-400" />
              <span>Latar Belakang & Konsep Proyek</span>
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line max-w-prose">
              {brief.description}
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-neutral-400" />
                  <span>Panggung Kolaborasi — Peran Dibutuhkan</span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Bukan transaksi sewa jasa. Kolaborator menyumbang aset & kapabilitas untuk hasil karya bersama.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
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
            <section className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-neutral-400" />
                  <span>Minat Masuk Terbaru ({brief.interests.length})</span>
                </h3>
                <Link
                  href={`/projects/${brief.id}/interests`}
                  className="text-xs font-semibold text-primary-300 hover:text-primary-200 transition-colors inline-flex items-center gap-1"
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
          <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-primary-400" />
              <span>Jadwal & Linimasa</span>
            </h3>
            <div className="space-y-2.5 text-xs">
              <div>
                <p className="text-neutral-500">Estimasi Durasi</p>
                <p className="font-semibold text-neutral-200">
                  {timeline.estimatedDuration || "Fleksibel / Sesuai Kesepakatan"}
                </p>
              </div>
              <div>
                <p className="text-neutral-500">Target Peluncuran</p>
                <p className="font-semibold text-neutral-200">
                  {timeline.targetLaunch || "Disesuaikan bersama tim"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <CircleDollarSign className="w-3.5 h-3.5 text-primary-400" />
              <span>Skema Nilai & Gotong Royong</span>
            </h3>
            <div className="space-y-2.5 text-xs">
              <div>
                <p className="text-neutral-500">Estimasi Nilai Proyek</p>
                <p className="font-semibold text-neutral-200">
                  {budget.estimatedTotal || "Model Gotong Royong / Revenue Share"}
                </p>
              </div>
              {budget.notes && (
                <div>
                  <p className="text-neutral-500">Catatan Pembagian</p>
                  <p className="font-medium text-neutral-300 leading-relaxed">{budget.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-primary-950/30 border border-primary-800/40 space-y-2.5">
            <div className="flex items-center gap-2">
              <Handshake className="w-4 h-4 text-primary-400" />
              <p className="text-xs font-bold text-primary-300">Prinsip Hak Cipta & Kepemilikan (IP)</p>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Hak cipta orisinal aset tetap dimiliki masing-masing pencipta. Karya hasil kolaborasi dilindungi hak pakai bersama dan membagi dampak ekonomi luaran secara adil.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
