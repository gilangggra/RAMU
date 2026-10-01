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

  const isParticipant =
    collaboration.participants.some((p) => p.actorId === actor.id) ||
    collaboration.plan?.createdByActorId === actor.id;
  if (!isParticipant) {
    redirect(
      `/collaborations?error=${encodeURIComponent(
        "Akses ditolak: Anda belum terdaftar sebagai anggota atau inisiator di ruang kerja kolaborasi tersebut."
      )}`
    );
  }

  const allAcceptedBookings = await prisma.bookingRequest.findMany({
    where: { status: "ACCEPTED" },
    include: { requester: true, target: true },
    orderBy: { createdAt: "desc" },
  });
  const linkedBooking = allAcceptedBookings.find(
    (b) => (b.details as any)?.collaborationId === id
  );

  return (
    <AppShell actor={actor} activeRoute="/collaborations">
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            href="/collaborations"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#716B7E] hover:text-[#27213D] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar Kolaborasi</span>
          </Link>

          <div className="flex items-center gap-3">
            {linkedBooking && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 hidden md:inline">
                  Dasar Perikatan:
                </span>
                <ViewSpkButton booking={linkedBooking as any} />
              </div>
            )}

            {collaboration.plan?.opportunityId && (
              <Link
                href={`/opportunities/${collaboration.plan.opportunityId}`}
                className="text-xs font-bold text-[#E66A48] hover:underline inline-flex items-center gap-1.5"
              >
                <span>Lihat Peluang Asal</span>
                <ArrowRight className="w-3.5 h-3.5" />
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
