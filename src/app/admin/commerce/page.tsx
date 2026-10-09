import { prisma } from "@/infrastructure/database/prisma";
import { ShoppingBag } from "lucide-react";
import { CommerceManagementClient } from "./CommerceManagementClient";

export default async function AdminCommercePage() {
  const bookings = await prisma.bookingRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      requester: { select: { id: true, name: true, sector: true, location: true } },
      target: { select: { id: true, name: true, sector: true, location: true } },
    },
  });

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const acceptedCount = bookings.filter((b) => b.status === "ACCEPTED").length;
  const declinedCount = bookings.filter((b) => b.status === "DECLINED").length;

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-stone-200/70 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/70">
            Commerce &amp; Kontrak • SPK Operations
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight mt-1">
          Transaksi &amp; Manajemen Surat Perintah Kerja (SPK)
        </h1>
        <p className="text-xs text-stone-500 leading-relaxed font-normal mt-0.5">
          Arsip seluruh pemesanan jasa kreatif komersial, penerbitan dokumen legal SPK, dan pengawasan status pembayaran.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs">
          <div className="text-xl font-bold text-stone-900">{bookings.length}</div>
          <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">Total Booking</div>
        </div>
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs">
          <div className="text-xl font-bold text-amber-700">{pendingCount}</div>
          <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">Menunggu Respons</div>
        </div>
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs">
          <div className="text-xl font-bold text-emerald-700">{acceptedCount}</div>
          <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">Kontrak Berjalan</div>
        </div>
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs">
          <div className="text-xl font-bold text-rose-700">{declinedCount}</div>
          <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">Ditolak</div>
        </div>
      </div>

      {/* Interactive Client Component */}
      <CommerceManagementClient initialBookings={bookings as any} />
    </div>
  );
}

