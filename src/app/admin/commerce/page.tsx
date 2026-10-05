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
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShoppingBag className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            Commerce &amp; Kontrak
          </span>
        </div>
        <h1 className="text-2xl font-black text-[#27213D]">
          Transaksi &amp; Manajemen Surat Perintah Kerja (SPK)
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Arsip seluruh pemesanan jasa kreatif komersial, penerbitan dokumen legal SPK, dan pengawasan status pembayaran.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <div className="text-2xl font-black text-[#27213D]">{bookings.length}</div>
          <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-1">Total Booking</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <div className="text-2xl font-black text-amber-600">{pendingCount}</div>
          <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-1">Menunggu Respons</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <div className="text-2xl font-black text-emerald-600">{acceptedCount}</div>
          <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-1">Kontrak Berjalan</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <div className="text-2xl font-black text-rose-600">{declinedCount}</div>
          <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-1">Ditolak</div>
        </div>
      </div>

      {/* Interactive Client Component */}
      <CommerceManagementClient initialBookings={bookings as any} />
    </div>
  );
}

