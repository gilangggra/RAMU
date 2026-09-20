import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { logout } from "@/app/(auth)/actions";
import { getCollaborationsForActor } from "@/application/collaborationService";
import { AppShell } from "@/components/layout/AppShell";
import { Handshake, ArrowRight } from "lucide-react";

export default async function CollaborationsPage() {
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

  const collaborations = await getCollaborationsForActor(actor.id);

  const activeCount = collaborations.filter((c) => c.status === "ACTIVE").length;
  const completedCount = collaborations.filter((c) => c.status === "COMPLETED").length;

  return (
    <AppShell actor={actor} activeRoute="/collaborations">
      <section className="p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800 relative overflow-hidden space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                Phase 4: Collaboration Space & Negotiation
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Ruang Proyek Kolaborasi Aktif
              </h1>
              <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                Kelola pembagian peran, negosiasikan kesepakatan pembagian hasil & aturan hak cipta, pantau penugasan tugas operasional, dan catat keputusan bersama mitra kriya Anda.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center min-w-[100px]">
                <div className="text-[11px] text-slate-400 font-semibold uppercase">Aktif</div>
                <div className="text-2xl font-black text-amber-400">{activeCount}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center min-w-[100px]">
                <div className="text-[11px] text-slate-400 font-semibold uppercase">Selesai</div>
                <div className="text-2xl font-black text-emerald-400">{completedCount}</div>
              </div>
            </div>
          </div>
        </section>

        {collaborations.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-5">
            <div className="flex justify-center">
              <Handshake className="w-12 h-12 text-primary-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Belum Ada Proyek Kolaborasi yang Berjalan</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Pilih salah satu peluang yang direkomendasikan oleh Opportunity Engine, lalu klik &quot;Inisiasi Rencana Kolaborasi&quot; untuk membuka ruang kerja proyek bersama mitra.
              </p>
            </div>
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <span>Jelajahi Katalog Peluang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {collaborations.map((collab) => {
              const totalTasks = collab.tasks.length;
              const doneTasks = collab.tasks.filter((t) => t.status === "DONE").length;
              const taskProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

              const totalMilestones = collab.milestones.length;
              const doneMilestones = collab.milestones.filter((m) => m.status === "ACHIEVED").length;

              const oppPatternName = collab.plan?.opportunity?.pattern?.name;

              return (
                <div
                  key={collab.id}
                  className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 transition-all duration-300 backdrop-blur-md space-y-6 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {oppPatternName || "Proyek Kolaboratif"}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {collab.status}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-amber-300 transition-colors">
                        {collab.title}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {collab.description || collab.plan?.objective}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Mitra Partisipan ({collab.participants.length})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {collab.participants.map((p) => (
                          <div
                            key={p.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200"
                          >
                            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-amber-400">
                              {p.actor.name.charAt(0)}
                            </span>
                            <span className="font-medium truncate max-w-[140px]">{p.actor.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Tugas Kerja</span>
                          <span className="text-amber-400 font-bold">{doneTasks}/{totalTasks}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${taskProgress}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Milestone</span>
                          <span className="text-emerald-400 font-bold">{doneMilestones}/{totalMilestones}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{
                              width: `${totalMilestones > 0 ? (doneMilestones / totalMilestones) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80">
                    <Link
                      href={`/collaborations/${collab.id}`}
                      className="inline-flex items-center justify-center w-full gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-amber-500 text-white hover:text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <span>Buka Ruang Kerja Proyek</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </AppShell>
  );
}
