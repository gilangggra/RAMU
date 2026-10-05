import { prisma } from "@/infrastructure/database/prisma";
import { Scale } from "lucide-react";
import { DisputeCenterClient } from "./DisputeCenterClient";

export default async function AdminDisputesPage() {
  const disputes = await prisma.dispute.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: {
        select: { id: true, name: true, sector: true },
      },
      booking: {
        select: {
          id: true,
          budget: true,
          startDate: true,
          status: true,
          requester: { select: { id: true, name: true } },
          target: { select: { id: true, name: true } },
        },
      },
    },
  });

  const openCount = disputes.filter((d) => d.status === "OPEN").length;
  const inMediationCount = disputes.filter((d) => d.status === "IN_MEDIATION").length;
  const resolvedCount = disputes.filter((d) => d.status === "RESOLVED").length;

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-stone-200/70 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/70">
            Dispute Center • Conflict Resolution
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight mt-1">Pusat Resolusi Sengketa Aktif</h1>
        <p className="text-xs text-stone-500 leading-relaxed font-normal mt-0.5">
          Mediasi konflik kontrak antara klien dan kreator berdasarkan bukti workspace, deliverables, dan catatan komunikasi.
        </p>
      </div>

      {/* KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs">
          <div className="text-xl font-bold text-stone-900">{disputes.length}</div>
          <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">Total Laporan</div>
        </div>
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs">
          <div className="text-xl font-bold text-rose-700">{openCount}</div>
          <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">Perlu Tindakan</div>
        </div>
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs">
          <div className="text-xl font-bold text-amber-700">{inMediationCount}</div>
          <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">Dalam Mediasi</div>
        </div>
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs">
          <div className="text-xl font-bold text-emerald-700">{resolvedCount}</div>
          <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">Selesai Terpecahkan</div>
        </div>
      </div>

      {/* Interactive Client Component */}
      <DisputeCenterClient initialDisputes={disputes as any} />
    </div>
  );
}

