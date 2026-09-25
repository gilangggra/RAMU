import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getCollaborationWorkspace } from "@/application/collaborationService";
import { CollaborationWorkspaceClient } from "./CollaborationWorkspaceClient";
import { AppShell } from "@/components/layout/AppShell";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
    redirect("/collaborations");
  }

  return (
    <AppShell actor={actor} activeRoute="/collaborations">
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <Link
            href="/collaborations"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#716B7E] hover:text-[#27213D] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar Kolaborasi</span>
          </Link>

          {collaboration.plan?.opportunityId && (
            <Link
              href={`/opportunities/${collaboration.plan.opportunityId}`}
              className="text-xs font-bold text-[#E66A48] hover:underline inline-flex items-center gap-1.5"
            >
              <span>Lihat Peluang Asal (Opportunity)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        <CollaborationWorkspaceClient
          collaboration={collaboration}
          currentActorId={actor.id}
        />
      </div>
    </AppShell>
  );
}
