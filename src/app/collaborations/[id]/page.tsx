import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getCollaborationWorkspace } from "@/application/collaborationService";
import { CollaborationWorkspaceClient } from "./CollaborationWorkspaceClient";
import { AppShell } from "@/components/layout/AppShell";
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

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "asc" },
  });

  if (!actor) redirect("/onboarding");

  const { id } = await params;
  const collaboration = await getCollaborationWorkspace(id);

  if (!collaboration) {
    notFound();
  }

  const isAdmin =
    actor.sector === "Platform Administrator" ||
    actor.sector?.toLowerCase().includes("administrator");

  const isParticipant =
    isAdmin ||
    collaboration.participants.some((p) => p.actorId === actor.id) ||
    collaboration.plan?.createdByActorId === actor.id;
  if (!isParticipant) {
    redirect(
      `/collaborations?error=${encodeURIComponent(
        "Akses ditolak: Anda belum terdaftar sebagai anggota atau inisiator di ruang kerja kolaborasi tersebut."
      )}`
    );
  }

  const linkedBooking = await prisma.bookingRequest.findFirst({
    where: {
      status: { in: ["ACCEPTED", "COMPLETED"] },
      OR: [{ requesterId: actor.id }, { targetId: actor.id }],
      details: {
        path: ["collaborationId"],
        equals: id,
      },
    },
    include: { requester: true, target: true },
  });

  return (
    <AppShell actor={actor} activeRoute="/collaborations">
      <div className="space-y-3.5 w-full max-w-7xl mx-auto pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            href="/collaborations"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200/80 shadow-2xs transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Workspace &amp; Kontrak</span>
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

            {collaboration.plan?.opportunityId && (
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
          currentActorId={actor.id}
        />
      </div>
    </AppShell>
  );
}
