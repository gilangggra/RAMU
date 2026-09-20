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
      <section className="p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800 relative overflow-hidden space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-950 border border-primary-700/50 text-xs font-semibold text-primary-300">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
              Collaborative Project Formation — Mode 2
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-100 tracking-tight">
              Proyek Kolaboratif Terbuka
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
              Inisiasi proyek kreatif baru dan undang rekan kolaborator yang memiliki aset komplementer, atau bergabunglah ke proyek terbuka dengan menawarkan aset dan kapabilitas Anda.
            </p>
          </div>

          <Link
            href="/projects/new"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <span>+ Inisiasi Project Brief</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-neutral-800">
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80">
            <div className="text-[11px] font-medium text-neutral-400">Proyek Terbuka</div>
            <div className="text-2xl font-black text-neutral-100 mt-1">{allBriefs.length}</div>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80">
            <div className="text-[11px] font-medium text-neutral-400">Brief Anda</div>
            <div className="text-2xl font-black text-primary-300 mt-1">
              {myBriefs.length || "0"}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80">
            <div className="text-[11px] font-medium text-neutral-400">Minat Menunggu Review</div>
            <div className="text-2xl font-black text-amber-300 mt-1">{pendingInterestCount}</div>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Link
              key={tab.key}
              href={`/projects?tab=${tab.key}`}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                isActive
                  ? "bg-primary-900/60 text-primary-200 border border-primary-700/60 font-bold"
                  : "bg-neutral-900 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 border border-neutral-800/60"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-primary-800 text-primary-100" : "bg-neutral-800 text-neutral-400"
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
            <div className="p-12 text-center rounded-3xl bg-neutral-900/40 border border-dashed border-neutral-800 space-y-4">
              <div className="flex justify-center">
                <Palette className="w-10 h-10 text-neutral-500" />
              </div>
              <h3 className="text-base font-bold text-neutral-200">
                {activeTab === "mine"
                  ? "Belum Ada Project Brief yang Anda Buat"
                  : "Belum Ada Proyek Terbuka"}
              </h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                {activeTab === "mine"
                  ? "Klik tombol \"Inisiasi Project Brief\" untuk membuat proyek kolaborasi pertama Anda."
                  : "Jadilah yang pertama menginisiasi project brief dan undang kolaborator dari ekosistem kreatif."}
              </p>
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md transition-all"
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
            <div className="p-12 text-center rounded-3xl bg-neutral-900/40 border border-dashed border-neutral-800 space-y-4">
              <div className="flex justify-center">
                <Inbox className="w-10 h-10 text-neutral-500" />
              </div>
              <h3 className="text-base font-bold text-neutral-200">
                Belum Ada Minat yang Dinyatakan
              </h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                Jelajahi proyek terbuka dan ajukan aset Anda untuk bergabung sebagai rekan kolaborator setara.
              </p>
              <Link
                href="/projects?tab=browse"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md transition-all"
              >
                <span>Jelajahi Proyek Terbuka</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myInterests.map((interest) => {
                const statusConfig: Record<string, { label: string; color: string }> = {
                  PENDING: { label: "Menunggu Review", color: "text-amber-300 bg-amber-950/60 border-amber-600/30" },
                  ACCEPTED: { label: "Diterima", color: "text-primary-300 bg-primary-950 border-primary-700/50" },
                  DECLINED: { label: "Ditolak", color: "text-rose-400 bg-rose-950/60 border-rose-600/30" },
                  WITHDRAWN: { label: "Ditarik", color: "text-neutral-400 bg-neutral-900 border-neutral-800" },
                };
                const cfg = statusConfig[interest.status] || statusConfig.PENDING;

                return (
                  <Link
                    key={interest.id}
                    href={`/projects/${interest.briefId}`}
                    className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-primary-700/60 transition-all group"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="font-bold text-neutral-100 text-sm group-hover:text-primary-300 transition-colors truncate">
                        {interest.brief.title}
                      </div>
                      <div className="text-xs text-neutral-400">
                        Peran: <span className="text-neutral-200 font-medium">{interest.role.roleLabel}</span>
                        {" · "}
                        Inisiator: {interest.brief.creatorActor.name}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}
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
    </AppShell>
  );
}
