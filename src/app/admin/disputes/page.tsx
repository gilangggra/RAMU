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
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Scale className="w-4 h-4 text-rose-600" />
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
            Dispute Center &amp; Mediasi
          </span>
        </div>
        <h1 className="text-2xl font-black text-[#27213D]">Pusat Resolusi Sengketa Aktif</h1>
        <p className="text-sm text-stone-500 mt-1">
          Mediasi konflik kontrak antara klien dan kreator berdasarkan bukti workspace, deliverables, dan catatan komunikasi.
        </p>
      </div>

      {/* KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <div className="text-2xl font-black text-[#27213D]">{disputes.length}</div>
          <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-1">Total Laporan</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <div className="text-2xl font-black text-rose-600">{openCount}</div>
          <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-1">Perlu Tindakan</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <div className="text-2xl font-black text-amber-600">{inMediationCount}</div>
          <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-1">Dalam Mediasi</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <div className="text-2xl font-black text-emerald-600">{resolvedCount}</div>
          <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-1">Selesai Terpecahkan</div>
        </div>
      </div>

      {/* Interactive Client Component */}
      <DisputeCenterClient initialDisputes={disputes as any} />
    </div>
  );
}

