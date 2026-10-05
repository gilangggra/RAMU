import { prisma } from "@/infrastructure/database/prisma";
import { VerificationQueueClient } from "./VerificationQueueClient";
import { ShieldCheck } from "lucide-react";

export default async function AdminVerificationPage() {
  const requests = await prisma.verificationRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          sector: true,
          location: true,
          contactEmail: true,
          actorType: true,
          isVerified: true,
        },
      },
    },
  });

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const revisionCount = requests.filter((r) => r.status === "REVISION_REQUESTED").length;
  const rejectedCount = requests.filter((r) => r.status === "REJECTED").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-stone-200/70 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/70">
            Trust &amp; Safety • Verification Queue
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight mt-1">
          Antrean Verifikasi Profil &amp; Bukti Gear
        </h1>
        <p className="text-xs text-stone-500 leading-relaxed font-normal mt-0.5">
          Tinjau dokumen identitas, portofolio eksternal, dan bukti kepemilikan alat kerja sebelum menyematkan Verified Badge.
        </p>
      </div>

      {/* Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs">
          <div className="text-xl font-bold text-amber-700">{pendingCount}</div>
          <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">
            Menunggu Review
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs">
          <div className="text-xl font-bold text-emerald-700">{approvedCount}</div>
          <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">
            Disetujui
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs">
          <div className="text-xl font-bold text-sky-700">{revisionCount}</div>
          <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">
            Perlu Revisi
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs">
          <div className="text-xl font-bold text-rose-700">{rejectedCount}</div>
          <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">
            Ditolak
          </div>
        </div>
      </div>

      {/* Interactive Queue Component */}
      <VerificationQueueClient initialRequests={requests as any} />
    </div>
  );
}
