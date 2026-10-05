import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getCollaborationsForActor } from "@/application/collaborationService";
import { AppShell } from "@/components/layout/AppShell";
import {
  CollaborationCatalogView,
  CollaborationItem,
} from "@/components/collaborations/CollaborationCatalogView";
import {
  FolderKanban,
  Activity,
  CheckCircle2,
  Users,
  Briefcase,
  Sparkles,
  Layers,
  AlertCircle,
  Plus,
} from "lucide-react";

export const metadata = {
  title: "Ruang Proyek & Kolaborasi Aktif | RAMU",
  description:
    "Ruang kerja kolaboratif terintegrasi untuk mengelola pembagian peran, negosiasi SPK multi-pihak, milestone kerja, dan penugasan operasional proyek kreatif.",
};

interface CollaborationsPageProps {
  searchParams: Promise<{
    tab?: string;
    search?: string;
    view?: string;
    error?: string;
    success?: string;
  }>;
}

export default async function CollaborationsPage({ searchParams }: CollaborationsPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    include: {
      owner: {
        select: {
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!actor) redirect("/onboarding");

  const params = await searchParams;
  const errorMessage = params?.error;
  const initialTab = params?.tab || "all";
  const initialSearch = params?.search || "";
  const initialView = (params?.view === "list" ? "list" : "grid") as "grid" | "list";

  // Fetch collaborations for this actor
  const rawCollaborations = await getCollaborationsForActor(actor.id);

  // Check if any collaboration is tied to an accepted booking request with SPK
  const acceptedBookings = await prisma.bookingRequest.findMany({
    where: { status: "ACCEPTED" },
    select: { id: true, details: true },
  });
  const bookingCollabIds = new Set(
    acceptedBookings
      .map((b) => (b.details as any)?.collaborationId)
      .filter(Boolean)
  );

  const collaborations: CollaborationItem[] = rawCollaborations.map((collab) => ({
    id: collab.id,
    title: collab.title,
    description: collab.description,
    status: collab.status,
    startedAt: collab.startedAt,
    targetEndAt: collab.targetEndAt,
    completedAt: collab.completedAt,
    createdAt: collab.createdAt,
    updatedAt: collab.updatedAt,
    plan: collab.plan
      ? {
          id: collab.plan.id,
          title: collab.plan.title,
          objective: collab.plan.objective,
          opportunityId: collab.plan.opportunityId,
          opportunity: collab.plan.opportunity
            ? {
                id: collab.plan.opportunity.id,
                pattern: collab.plan.opportunity.pattern
                  ? {
                      name: collab.plan.opportunity.pattern.name,
                      code: collab.plan.opportunity.pattern.code,
                      category: collab.plan.opportunity.pattern.category,
                    }
                  : null,
              }
            : null,
        }
      : null,
    participants: collab.participants.map((p) => ({
      id: p.id,
      actorId: p.actorId,
      roleCode: p.roleCode,
      status: p.status,
      signedAt: p.signedAt,
      actor: {
        id: p.actor.id,
        name: p.actor.name,
        sector: p.actor.sector,
        location: p.actor.location,
        actorType: p.actor.actorType,
        owner: p.actor.owner
          ? {
              avatarUrl: p.actor.owner.avatarUrl,
            }
          : null,
      },
    })),
    tasks: collab.tasks.map((t) => ({
      id: t.id,
      status: t.status,
      title: t.title,
      priority: t.priority,
      dueDate: t.dueDate,
    })),
    milestones: collab.milestones.map((m) => ({
      id: m.id,
      status: m.status,
      title: m.title,
      targetDate: m.targetDate,
    })),
    hasLinkedSpk: bookingCollabIds.has(collab.id),
  }));

  // Analytics Ribbon Calculations
  const activeCount = collaborations.filter((c) => c.status === "ACTIVE").length;
  const completedCount = collaborations.filter((c) => c.status === "COMPLETED").length;

  const totalTasks = collaborations.reduce((acc, c) => acc + c.tasks.length, 0);
  const doneTasks = collaborations.reduce(
    (acc, c) => acc + c.tasks.filter((t) => t.status === "DONE").length,
    0
  );

  const totalMilestones = collaborations.reduce((acc, c) => acc + c.milestones.length, 0);
  const achievedMilestones = collaborations.reduce(
    (acc, c) => acc + c.milestones.filter((m) => m.status === "ACHIEVED").length,
    0
  );

  const partnerActorIds = new Set<string>();
  collaborations.forEach((c) => {
    c.participants.forEach((p) => {
      if (p.actorId !== actor.id) {
        partnerActorIds.add(p.actorId);
      }
    });
  });
  const uniquePartnersCount = partnerActorIds.size;

  return (
    <AppShell actor={actor} activeRoute="/collaborations">
      <div className="space-y-6 w-full max-w-7xl mx-auto">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs font-medium flex items-center justify-between gap-3 animate-fade-in shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <Link
              href="/collaborations"
              className="text-stone-500 hover:text-stone-800 text-[11px] underline shrink-0 font-medium"
            >
              Tutup
            </Link>
          </div>
        )}

        {/* 1. ATTIO HEADER BANNER */}
        <section className="pb-6 border-b border-stone-200/80">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200/70 text-[11px] font-semibold text-stone-600">
                <FolderKanban className="w-3.5 h-3.5 text-stone-500" />
                <span>Ruang Kerja &amp; Eksekusi Kolaborasi</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
                Ruang Proyek &amp; Kolaborasi Aktif
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed font-normal">
                Kelola pembagian peran kerja, pantau progres milestone &amp; tugas operasional harian, serta akses kesepakatan SPK multi-pihak resmi bersama mitra kolaborator Anda.
              </p>
            </div>

            {/* Action buttons (Attio minimalist buttons) */}
            <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg shadow-2xs transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5 text-stone-500" />
                <span>Papan Proyek</span>
              </Link>
              <Link
                href="/collaborate"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-black border border-stone-900 rounded-lg shadow-2xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Kompatibilitas 4 Pilar</span>
              </Link>
            </div>
          </div>

          {/* 4-Tile Analytics Ribbon (Attio Metric Cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {/* Tile 1: Kolaborasi Aktif */}
            <div className="p-3.5 bg-white rounded-xl border border-stone-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-stone-400 mb-1.5">
                <span className="text-[11px] font-medium text-stone-500">Kolaborasi Aktif</span>
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight">
                {activeCount}
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5">
                Sedang tahap produksi
              </div>
            </div>

            {/* Tile 2: Proyek Selesai */}
            <div className="p-3.5 bg-white rounded-xl border border-stone-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-stone-400 mb-1.5">
                <span className="text-[11px] font-medium text-stone-500">Proyek Tuntas</span>
                <CheckCircle2 className="w-4 h-4 text-stone-400" />
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight">
                {completedCount}
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5">
                Karya &amp; arsip tersimpan
              </div>
            </div>

            {/* Tile 3: Progres Milestone & Tugas */}
            <div className="p-3.5 bg-white rounded-xl border border-stone-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-stone-400 mb-1.5">
                <span className="text-[11px] font-medium text-stone-500">Tugas &amp; Milestone</span>
                <Layers className="w-4 h-4 text-stone-400" />
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight">
                {doneTasks} <span className="text-xs font-normal text-stone-400">/{totalTasks} Tugas</span>
              </div>
              <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                {achievedMilestones}/{totalMilestones} Milestone tercapai
              </div>
            </div>

            {/* Tile 4: Total Mitra Kolaborator */}
            <div className="p-3.5 bg-white rounded-xl border border-stone-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-stone-400 mb-1.5">
                <span className="text-[11px] font-medium text-stone-500">Mitra Terhubung</span>
                <Users className="w-4 h-4 text-stone-400" />
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight">
                {uniquePartnersCount} <span className="text-xs font-normal text-stone-400">Talenta</span>
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5">
                Kolektif lintas bidang
              </div>
            </div>
          </div>
        </section>

        {/* 2. ATTIO CATALOG VIEW (TABS + FILTER + GRID/LIST CARDS) */}
        <CollaborationCatalogView
          collaborations={collaborations}
          currentActorId={actor.id}
          initialTab={initialTab}
          initialSearch={initialSearch}
          initialView={initialView}
        />
      </div>
    </AppShell>
  );
}
