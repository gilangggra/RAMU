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
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
            Trust & Safety
          </span>
        </div>
        <h1 className="text-2xl font-black text-[#27213D]">
          Antrean Verifikasi Profil & Bukti Gear
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Tinjau dokumen identitas, portofolio eksternal, dan bukti kepemilikan alat kerja sebelum menyematkan Verified Badge.
        </p>
      </div>

      {/* Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-stone-200">
          <div className="text-2xl font-black text-amber-600">{pendingCount}</div>
          <div className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider mt-1">
            Menunggu Review
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-stone-200">
          <div className="text-2xl font-black text-emerald-600">{approvedCount}</div>
          <div className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider mt-1">
            Disetujui
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-stone-200">
          <div className="text-2xl font-black text-sky-600">{revisionCount}</div>
          <div className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider mt-1">
            Perlu Revisi
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-stone-200">
          <div className="text-2xl font-black text-rose-600">{rejectedCount}</div>
          <div className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider mt-1">
            Ditolak
          </div>
        </div>
      </div>

      {/* Interactive Queue Component */}
      <VerificationQueueClient initialRequests={requests as any} />
    </div>
  );
}
