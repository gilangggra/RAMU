import { prisma } from "@/infrastructure/database/prisma";
import { FolderKanban } from "lucide-react";
import { ProjectModerationClient } from "./ProjectModerationClient";

export default async function AdminProjectsPage() {
  const briefs = await prisma.projectBrief.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      creatorActor: { select: { id: true, name: true, sector: true } },
      _count: { select: { interests: true, neededRoles: true } },
    },
  });

  const inReviewCount = briefs.filter((b) => b.status === "IN_REVIEW").length;
  const openCount = briefs.filter((b) => b.status === "OPEN").length;
  const takenDownCount = briefs.filter((b) => b.status === "TAKEN_DOWN").length;

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-stone-200/70 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/70">
            Moderasi Platform • Project Briefs
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight mt-1">
          Pengawasan &amp; Moderasi Project Brief
        </h1>
        <p className="text-xs text-stone-500 leading-relaxed font-normal mt-0.5">
          Audit kualitas brief komersial, setujui publikasi, intervensi timeout inaktivitas, dan turunkan proyek yang melanggar pedoman.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs">
          <div className="text-xl font-bold text-stone-900">{briefs.length}</div>
          <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">Total Brief</div>
        </div>
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs">
          <div className="text-xl font-bold text-purple-700">{inReviewCount}</div>
          <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">Menunggu Review</div>
        </div>
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs">
          <div className="text-xl font-bold text-emerald-700">{openCount}</div>
          <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">Brief Terbuka</div>
        </div>
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs">
          <div className="text-xl font-bold text-rose-700">{takenDownCount}</div>
          <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">Diturunkan</div>
        </div>
      </div>

      {/* Interactive Moderation Table */}
      <ProjectModerationClient initialBriefs={briefs as any} />
    </div>
  );
}

