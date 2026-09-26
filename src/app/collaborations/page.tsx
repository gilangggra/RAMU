import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getCollaborationsForActor } from "@/application/collaborationService";
import { AppShell } from "@/components/layout/AppShell";
import { Handshake, ArrowRight, AlertCircle } from "lucide-react";

interface CollaborationsPageProps {
  searchParams: Promise<{ error?: string; success?: string }>;
}

export default async function CollaborationsPage({ searchParams }: CollaborationsPageProps) {
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

  const params = await searchParams;
  const errorMessage = params?.error;

  const collaborations = await getCollaborationsForActor(actor.id);

  const activeCount = collaborations.filter((c) => c.status === "ACTIVE").length;
  const completedCount = collaborations.filter((c) => c.status === "COMPLETED").length;

  return (
    <AppShell actor={actor} activeRoute="/collaborations">
      <div className="space-y-8 max-w-6xl mx-auto">
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between gap-3 animate-fade-in shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <Link href="/collaborations" className="text-stone-500 hover:text-stone-800 text-[11px] underline shrink-0">
              Tutup
            </Link>
          </div>
        )}

        <section className="p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.04)] relative overflow-hidden space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF7ED] border border-[#F9D8C4] text-xs font-bold text-[#E66A48]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E66A48] animate-pulse" />
                Workspace Kolaborasi • Eksekusi Karya & Negosiasi
              </div>
              <h1 className="text-3xl font-extrabold text-[#27213D] tracking-tight">
                Ruang Proyek Kolaborasi Aktif
              </h1>
              <p className="text-sm text-[#716B7E] max-w-2xl leading-relaxed">
                Kelola pembagian peran, negosiasikan kesepakatan pembagian hasil & aturan hak cipta (IP), pantau penugasan tugas operasional, dan catat keputusan bersama mitra kolaborator kreatif Anda.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70 text-center min-w-[100px]">
                <div className="text-[11px] text-[#716B7E] font-bold uppercase tracking-wider">Aktif</div>
                <div className="text-2xl font-black text-amber-800 mt-0.5">{activeCount}</div>
              </div>
              <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70 text-center min-w-[100px]">
                <div className="text-[11px] text-[#716B7E] font-bold uppercase tracking-wider">Selesai</div>
                <div className="text-2xl font-black text-emerald-800 mt-0.5">{completedCount}</div>
              </div>
            </div>
          </div>
        </section>

        {collaborations.length === 0 ? (
          <div className="p-12 text-center rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-5">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center">
                <Handshake className="w-7 h-7 text-amber-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-[#27213D]">Belum Ada Proyek Kolaborasi yang Berjalan</h3>
              <p className="text-sm text-[#716B7E] max-w-md mx-auto">
                Pilih salah satu peluang yang direkomendasikan oleh Opportunity Engine, lalu klik &quot;Inisiasi Rencana Kolaborasi&quot; untuk membuka ruang kerja proyek bersama mitra.
              </p>
            </div>
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-[#E66A48] hover:from-amber-600 hover:to-[#d85c3b] text-white font-bold text-sm shadow-md shadow-[#E66A48]/20 transition-all cursor-pointer"
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
                  className="p-6 sm:p-8 rounded-[28px] bg-white/95 border border-stone-200/80 hover:border-amber-300 shadow-[0_10px_30px_rgba(39,33,61,0.03)] hover:shadow-[0_15px_35px_rgba(39,33,61,0.07)] transition-all duration-300 space-y-6 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#FFF7ED] text-[#E66A48] border border-[#F9D8C4]">
                        {oppPatternName || "Proyek Kolaboratif"}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {collab.status}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-xl font-bold text-[#27213D] tracking-tight group-hover:text-[#E66A48] transition-colors">
                        {collab.title}
                      </h3>
                      <p className="text-xs text-[#716B7E] line-clamp-2 leading-relaxed">
                        {collab.description || collab.plan?.objective}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-stone-100">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#716B7E]">
                        Mitra Partisipan ({collab.participants.length})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {collab.participants.map((p) => (
                          <div
                            key={p.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#27213D]"
                          >
                            <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center font-bold text-[10px] text-amber-800">
                              {p.actor.name.charAt(0)}
                            </span>
                            <span className="font-semibold truncate max-w-[140px]">{p.actor.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-[#716B7E]">
                          <span className="font-bold">Tugas Kerja</span>
                          <span className="text-amber-800 font-black">{doneTasks}/{totalTasks}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-[#E66A48] rounded-full"
                            style={{ width: `${taskProgress}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-[#716B7E]">
                          <span className="font-bold">Milestone</span>
                          <span className="text-emerald-800 font-black">{doneMilestones}/{totalMilestones}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{
                              width: `${totalMilestones > 0 ? (doneMilestones / totalMilestones) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100">
                    <Link
                      href={`/collaborations/${collab.id}`}
                      className="inline-flex items-center justify-center w-full gap-2 px-5 py-3 rounded-xl bg-stone-100 hover:bg-[#27213D] text-[#27213D] hover:text-white font-bold text-xs transition-colors cursor-pointer"
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
      </div>
    </AppShell>
  );
}
