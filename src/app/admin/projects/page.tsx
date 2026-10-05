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
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FolderKanban className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">
            Moderasi Platform
          </span>
        </div>
        <h1 className="text-2xl font-black text-[#27213D]">
          Pengawasan & Moderasi Project Brief
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Audit kualitas brief komersial, setujui publikasi, intervensi timeout inaktivitas, dan turunkan proyek yang melanggar pedoman.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <div className="text-2xl font-black text-[#27213D]">{briefs.length}</div>
          <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-1">Total Brief</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <div className="text-2xl font-black text-purple-600">{inReviewCount}</div>
          <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-1">Menunggu Review</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <div className="text-2xl font-black text-emerald-600">{openCount}</div>
          <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-1">Brief Terbuka</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <div className="text-2xl font-black text-rose-600">{takenDownCount}</div>
          <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-1">Diturunkan</div>
        </div>
      </div>

      {/* Interactive Moderation Table */}
      <ProjectModerationClient initialBriefs={briefs as any} />
    </div>
  );
}

