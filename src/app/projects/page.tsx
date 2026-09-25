import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { getProjectBriefs } from "@/application/projectBriefService";
import { ProjectBriefCard } from "@/components/projects/ProjectBriefCard";
import { AppShell } from "@/components/layout/AppShell";
import { Palette, Inbox, ArrowRight } from "lucide-react";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
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

  const params = await searchParams;
  const activeTab = params?.tab || "browse";

  const [allBriefs, myBriefs, myInterests] = await Promise.all([
    activeTab === "browse" || activeTab === "all"
      ? getProjectBriefs({ status: "OPEN" })
      : Promise.resolve([]),
    activeTab === "mine"
      ? getProjectBriefs({ creatorActorId: actor.id })
      : Promise.resolve([]),
    activeTab === "interests"
      ? prisma.collaborationInterest.findMany({
          where: { actorId: actor.id },
          include: {
            brief: {
              include: {
                creatorActor: { select: { name: true, sector: true } },
                neededRoles: {
                  include: {
                    interests: { where: { actorId: actor.id }, select: { status: true } },
                  },
                },
              },
            },
            role: true,
          },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  const briefsToShow = activeTab === "mine" ? myBriefs : allBriefs;

  const pendingInterestCount = await prisma.collaborationInterest.count({
    where: { actorId: actor.id, status: "PENDING" },
  });

  const tabs = [
    { key: "browse", label: "Jelajahi Proyek", count: allBriefs.length },
    { key: "mine", label: "Brief Saya", count: myBriefs.length },
    { key: "interests", label: "Minat Saya", count: pendingInterestCount },
  ];

  return (
    <AppShell actor={actor} activeRoute="/projects">
      <div className="space-y-8">
        <section className="p-8 sm:p-10 rounded-[28px] bg-white border border-stone-200 shadow-xs relative overflow-hidden space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-xs font-bold text-[#1E1B2E] shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E1B2E] animate-pulse" />
                Open Collaboration Hub
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B2E] tracking-tight">
                Project Briefs Terbuka
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 max-w-2xl leading-relaxed">
                Inisiasi proyek kreatif baru dan undang rekan kolaborator yang memiliki aset komplementer, atau bergabunglah ke proyek terbuka dengan menawarkan aset dan kapabilitas Anda.
              </p>
            </div>

            <Link
              href="/projects/new"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#1E1B2E] hover:bg-black text-white font-bold text-[11px] uppercase tracking-widest transition-colors cursor-pointer"
            >
              <span>+ Inisiasi Project Brief</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-stone-100">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Proyek Terbuka</div>
              <div className="text-2xl font-black text-[#1E1B2E] mt-1">{allBriefs.length}</div>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Brief Anda</div>
              <div className="text-2xl font-black text-[#1E1B2E] mt-1">
                {myBriefs.length || "0"}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Minat Pending</div>
              <div className="text-2xl font-black text-[#1E1B2E] mt-1">{pendingInterestCount}</div>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-2 border-b border-stone-200/80 pb-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Link
                key={tab.key}
                href={`/projects?tab=${tab.key}`}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-[#1E1B2E] text-white shadow-sm"
                    : "bg-white text-stone-500 hover:text-[#1E1B2E] hover:bg-stone-50 border border-stone-200/80"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {(activeTab === "browse" || activeTab === "mine") && (
          <>
            {briefsToShow.length === 0 ? (
              <div className="p-12 text-center rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-4">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center">
                    <Palette className="w-7 h-7 text-[#1E1B2E]" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-[#1E1B2E]">
                  {activeTab === "mine"
                    ? "Belum Ada Project Brief yang Anda Buat"
                    : "Belum Ada Proyek Terbuka"}
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                  {activeTab === "mine"
                    ? "Klik tombol \"Inisiasi Project Brief\" untuk membuat proyek kolaborasi pertama Anda."
                    : "Jadilah yang pertama menginisiasi project brief dan undang kolaborator dari ekosistem kreatif."}
                </p>
                <Link
                  href="/projects/new"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1E1B2E] hover:bg-black text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  + Buat Project Brief Baru
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {briefsToShow.map((brief) => (
                  <ProjectBriefCard
                    key={brief.id}
                    id={brief.id}
                    title={brief.title}
                    description={brief.description}
                    projectType={brief.projectType}
                    targetOutput={brief.targetOutput}
                    location={brief.location}
                    status={brief.status}
                    neededRoles={brief.neededRoles}
                    creatorActor={brief.creatorActor}
                    createdAt={brief.createdAt}
                    isOwnBrief={brief.creatorActorId === actor.id}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "interests" && (
          <>
            {myInterests.length === 0 ? (
              <div className="p-12 text-center rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-4">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center">
                    <Inbox className="w-7 h-7 text-[#1E1B2E]" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-[#1E1B2E]">
                  Belum Ada Minat yang Dinyatakan
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                  Jelajahi proyek terbuka dan ajukan aset Anda untuk bergabung sebagai rekan kolaborator setara.
                </p>
                <Link
                  href="/projects?tab=browse"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1E1B2E] hover:bg-black text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <span>Jelajahi Proyek Terbuka</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myInterests.map((interest) => {
                  const statusConfig: Record<string, { label: string; color: string }> = {
                    PENDING: { label: "Menunggu Review", color: "text-amber-800 bg-amber-50 border-amber-200 font-bold" },
                    ACCEPTED: { label: "Diterima", color: "text-emerald-800 bg-emerald-50 border-emerald-200 font-bold" },
                    DECLINED: { label: "Ditolak", color: "text-rose-800 bg-rose-50 border-rose-200 font-bold" },
                    WITHDRAWN: { label: "Ditarik", color: "text-stone-700 bg-stone-100 border-stone-200 font-bold" },
                  };
                  const cfg = statusConfig[interest.status] || statusConfig.PENDING;

                  return (
                    <Link
                      key={interest.id}
                      href={`/projects/${interest.briefId}`}
                      className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-white/95 border border-stone-200/80 hover:border-amber-300 shadow-2xs transition-all group"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="font-bold text-[#1E1B2E] text-sm group-hover:text-[#1E1B2E] transition-colors truncate">
                          {interest.brief.title}
                        </div>
                        <div className="text-xs text-stone-500">
                          Peran: <span className="text-[#1E1B2E] font-semibold">{interest.role.roleLabel}</span>
                          {" · "}
                          Inisiator: {interest.brief.creatorActor.name}
                        </div>
                      </div>
                      <span
                        className={`shrink-0 px-3 py-1 rounded-full text-xs border ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
