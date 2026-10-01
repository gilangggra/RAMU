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

  if (!user) {
    redirect(`/login?redirectTo=/projects&message=${encodeURIComponent("Silakan masuk atau daftar untuk meninjau dan melamar ke project briefs.")}`);
  }

  const actor = await prisma.actor.findFirst({
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

  if (!actor) redirect("/onboarding");

  const params = await searchParams;
  const activeTab = params?.tab || "browse";

  const [openBriefsCount, myBriefsCount, pendingInterestCount] = await Promise.all([
    prisma.projectBrief.count({ where: { status: "OPEN" } }),
    prisma.projectBrief.count({ where: { creatorActorId: actor.id } }),
    prisma.collaborationInterest.count({
      where: { actorId: actor.id, status: "PENDING" },
    }),
  ]);

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

  const tabs = [
    { key: "browse", label: "Jelajahi Proyek", count: openBriefsCount },
    { key: "mine", label: "Brief Saya", count: myBriefsCount },
    { key: "interests", label: "Minat Saya", count: pendingInterestCount },
  ];

  return (
    <AppShell actor={actor} activeRoute="/projects">
      <div className="space-y-8">

        <section className="pt-10 pb-8 border-b border-stone-200">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-stone-300"></span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
                  Papan Produksi & Brief Terbuka
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-light text-[#1E1B2E] tracking-tight leading-[1.15] mb-5">
                Inisiasi ide & rekrut kru <br className="hidden sm:block" />
                <span className="font-serif italic text-stone-500">produksi kolaboratif</span> Anda.
              </h1>
              <p className="text-sm text-stone-500 font-light leading-relaxed max-w-xl">
                Temukan rekan kolaborator dengan aset komplementer untuk kampanye lookbook, editorial, dan proyek kreatif bersama tanpa transaksi sewa konvensional.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:gap-8 pb-2">

              <div className="flex items-center gap-6 sm:gap-8">
                <div className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-light text-[#1E1B2E]">{openBriefsCount}</div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">Proyek Terbuka</div>
                </div>
                <div className="w-px h-8 bg-stone-200"></div>
                <div className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-light text-[#1E1B2E]">{myBriefsCount}</div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">Brief Anda</div>
                </div>
                {pendingInterestCount > 0 && (
                  <>
                    <div className="w-px h-8 bg-stone-200"></div>
                    <div className="space-y-1">
                      <div className="text-3xl sm:text-4xl font-light text-amber-700">{pendingInterestCount}</div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700/80">Minat Masuk</div>
                    </div>
                  </>
                )}
              </div>

              <Link
                href="/projects/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1E1B2E] hover:bg-black text-white font-bold text-[10px] uppercase tracking-[0.15em] transition-all shadow-sm shrink-0"
              >
                <span>+ Inisiasi Project Brief</span>
              </Link>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-8 border-b border-stone-200 text-xs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Link
                key={tab.key}
                href={`/projects?tab=${tab.key}`}
                className={`pb-3 font-semibold transition-all relative flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "text-[#1E1B2E] font-bold"
                    : "text-stone-400 hover:text-stone-700"
                }`}
              >
                <span className="tracking-wide">{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E1B2E]" />
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
