import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getCollaborationWorkspace } from "@/application/collaborationService";
import { CollaborationWorkspaceClient } from "./CollaborationWorkspaceClient";
import { AppShell } from "@/components/layout/AppShell";
import { AdminShell } from "@/components/admin/AdminShell";
import { isUserAdmin } from "@/lib/admin";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { ViewSpkButton } from "@/app/dashboard/bookings/BookingStatusManager";

export default async function CollaborationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
    orderBy: { createdAt: "asc" },
  });

  const adminActor = await prisma.actor.findFirst({
    where: {
      ownerUserId: user.id,
      status: { not: "ARCHIVED" },
      OR: [
        { sector: "Platform Administrator" },
        { sector: { contains: "Administrator", mode: "insensitive" } },
        { sector: { contains: "Admin", mode: "insensitive" } },
      ],
    },
  });

  const isAdmin =
    isUserAdmin(user) ||
    profile?.role === "SUPERADMIN" ||
    Boolean(adminActor) ||
    actor?.sector === "Platform Administrator" ||
    actor?.sector?.toLowerCase().includes("administrator");

  if (!actor && !isAdmin) redirect("/onboarding");

  if (!actor && isAdmin) {
    actor = await prisma.actor.findFirst({
      where: { status: { not: "ARCHIVED" } },
      orderBy: { createdAt: "asc" },
    });
  }

  const { id } = await params;
  const collaboration = await getCollaborationWorkspace(id);

  if (!collaboration) {
    notFound();
  }

  const isParticipant =
    isAdmin ||
    (actor && (
      collaboration.participants.some((p) => p.actorId === actor.id) ||
      collaboration.plan?.createdByActorId === actor.id
    ));

  if (!isParticipant) {
    redirect(
      `/collaborations?error=${encodeURIComponent(
        "Akses ditolak: Anda belum terdaftar sebagai anggota atau inisiator di ruang kerja kolaborasi tersebut."
      )}`
    );
  }

  const linkedBooking = actor
    ? await prisma.bookingRequest.findFirst({
        where: {
          status: { in: ["ACCEPTED", "COMPLETED"] },
          OR: [{ requesterId: actor.id }, { targetId: actor.id }],
          details: {
            path: ["collaborationId"],
            equals: id,
          },
        },
        include: { requester: true, target: true },
      })
    : null;

  const pageContent = (
    <div className="space-y-3.5 w-full max-w-7xl mx-auto pb-6">
      {isAdmin && (
        <div className="mb-2">
          <Link
            href="/engine-insights"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#111827] bg-white/80 hover:bg-white border border-slate-200/80 px-3.5 py-1.5 rounded-full transition-all shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Audit Kompatibilitas</span>
          </Link>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href={isAdmin ? "/engine-insights" : "/collaborations"}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200/80 shadow-2xs transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isAdmin ? "Kembali ke Audit Kompatibilitas" : "Kembali ke Workspace & Kontrak"}</span>
        </Link>

        <div className="flex items-center gap-2.5">
          {linkedBooking && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden md:inline">
                Dasar Perikatan:
              </span>
              <ViewSpkButton booking={linkedBooking as any} />
            </div>
          )}

          {!isAdmin && collaboration.plan?.opportunityId && (
            <Link
              href={`/opportunities/${collaboration.plan.opportunityId}`}
              className="text-xs font-semibold text-slate-700 hover:text-[#0284c7] bg-white/80 hover:bg-white border border-white/80 shadow-2xs rounded-full px-3.5 py-1.5 inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Lihat Peluang Asal</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          )}
        </div>
      </div>

      <CollaborationWorkspaceClient
        collaboration={collaboration}
        currentActorId={actor ? actor.id : ""}
        isAdmin={isAdmin}
      />
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
