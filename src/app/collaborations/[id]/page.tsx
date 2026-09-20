import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { logout } from "@/app/(auth)/actions";
import { getCollaborationWorkspace } from "@/application/collaborationService";
import { CollaborationWorkspaceClient } from "./CollaborationWorkspaceClient";
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

  const isParticipant = collaboration.participants.some(
    (p) => p.actorId === actor!.id
  );
  if (!isParticipant) {
    redirect("/collaborations");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 shadow-md shadow-amber-500/20">
                R
              </div>
              <span className="font-bold text-lg tracking-tight text-white">RAMU</span>
            </Link>
            <div className="hidden md:flex items-center gap-1 text-xs">
              <Link href="/dashboard" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/opportunities" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">
                Peluang
              </Link>
              <Link href="/projects" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">
                Proyek (Briefs)
              </Link>
              <Link href="/collaborations" className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
                Kolaborasi (Phase 4)
              </Link>
              <Link href="/engine-insights" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">
                Engine Insights (Phase 5)
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white">{actor.name}</div>
              <div className="text-[11px] text-slate-400">{actor.sector}</div>
            </div>

            <form action={logout}>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/collaborations"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar Kolaborasi</span>
          </Link>

          {collaboration.plan?.opportunityId && (
            <Link
              href={`/opportunities/${collaboration.plan.opportunityId}`}
              className="text-xs text-amber-400/90 hover:underline inline-flex items-center gap-1.5"
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
      </main>
    </div>
  );
}
