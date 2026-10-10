import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getCollaborationsForActor } from "@/application/collaborationService";
import { AppShell } from "@/components/layout/AppShell";
import { AdminShell } from "@/components/admin/AdminShell";
import { isUserAdmin } from "@/lib/admin";
import { CollaborationItem } from "@/components/collaborations/CollaborationCatalogView";
import { WorkspaceUnifiedView } from "@/components/collaborations/WorkspaceUnifiedView";
import { AlertCircle, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Workspace & Kontrak | RAMU",
  description:
    "Pusat kolaborasi terintegrasi untuk mengelola ruang kerja tim kreatif, milestone proyek, dan kepastian kontrak kerja resmi (SPK) platform RAMU.",
};

interface CollaborationsPageProps {
  searchParams: Promise<{
    section?: string;
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

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  let actor = await prisma.actor.findFirst({
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

  const isAdmin =
    isUserAdmin(user) ||
    profile?.role === "SUPERADMIN" ||
    actor?.sector === "Platform Administrator" ||
    actor?.sector?.toLowerCase().includes("administrator");

  if (!actor && !isAdmin) redirect("/onboarding");

  if (!actor && isAdmin) {
    actor = await prisma.actor.findFirst({
      where: { status: { not: "ARCHIVED" } },
      include: {
        owner: {
          select: {
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  const params = await searchParams;
  const errorMessage = params?.error;
  const initialSection =
    !isAdmin && (params?.section === "contracts" || params?.tab === "contracts")
      ? "contracts"
      : "workspaces";
  const initialTab = params?.tab && params.tab !== "contracts" ? params.tab : "all";
  const initialSearch = params?.search || "";
  const initialView = (params?.view === "list" ? "list" : "grid") as "grid" | "list";

  // Concurrent data fetching for collaborations and contract bookings
  const [rawCollaborations, acceptedBookings, incomingBookings, outgoingBookings] =
    await Promise.all([
      isAdmin
        ? prisma.collaboration.findMany({
            include: {
              plan: {
                include: {
                  opportunity: {
                    include: { pattern: true },
                  },
                },
              },
              participants: {
                include: {
                  actor: {
                    include: {
                      owner: {
                        select: { avatarUrl: true },
                      },
                    },
                  },
                },
              },
              tasks: true,
              milestones: true,
            },
            orderBy: { updatedAt: "desc" },
          })
        : actor
        ? getCollaborationsForActor(actor.id)
        : Promise.resolve([]),
      prisma.bookingRequest.findMany({
        where: { status: { in: ["ACCEPTED", "COMPLETED"] } },
        select: { id: true, details: true },
      }),
      !isAdmin && actor
        ? prisma.bookingRequest.findMany({
            where: { targetId: actor.id },
            include: { requester: true, target: true },
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),
      !isAdmin && actor
        ? prisma.bookingRequest.findMany({
            where: { requesterId: actor.id },
            include: { requester: true, target: true },
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),
    ]);

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

  // Analytics Ribbon Calculations for Workspaces
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
      if (!actor || p.actorId !== actor.id) {
        partnerActorIds.add(p.actorId);
      }
    });
  });
  const uniquePartnersCount = partnerActorIds.size;

  const pageContent = (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {isAdmin && (
        <div className="mb-4">
          <Link
            href="/engine-insights"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#111827] bg-white/80 hover:bg-white border border-slate-200/80 px-3.5 py-1.5 rounded-full transition-all shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Audit Kompatibilitas</span>
          </Link>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between gap-3 animate-fade-in shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Link
            href="/collaborations"
            className="text-slate-500 hover:text-slate-800 text-xs underline shrink-0 font-medium"
          >
            Tutup
          </Link>
        </div>
      )}

      {actor && (
        <WorkspaceUnifiedView
          actor={actor}
          isAdmin={isAdmin}
          collaborations={collaborations}
          incomingBookings={incomingBookings as any}
          outgoingBookings={outgoingBookings as any}
          initialSection={initialSection}
          initialCollabTab={initialTab}
          initialCollabSearch={initialSearch}
          initialCollabView={initialView}
          activeCount={activeCount}
          completedCount={completedCount}
          doneTasks={doneTasks}
          totalTasks={totalTasks}
          achievedMilestones={achievedMilestones}
          totalMilestones={totalMilestones}
          uniquePartnersCount={uniquePartnersCount}
        />
      )}
    </div>
  );

  if (isAdmin) {
    const adminName =
      user?.user_metadata?.display_name ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "Admin";

    const adminAvatar =
      user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

    return (
      <AdminShell adminName={adminName} adminAvatar={adminAvatar}>
        {pageContent}
      </AdminShell>
    );
  }

  return (
    <AppShell actor={actor!} activeRoute="/collaborations">
      {pageContent}
    </AppShell>
  );
}
