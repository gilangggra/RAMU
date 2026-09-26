import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { ArrowLeft, Clock, CheckCircle2, XCircle, ChevronRight, Inbox, Send, ArrowUpRight, ExternalLink } from "lucide-react";
import { BookingStatusManager, ConvertBookingButton, BookingContactActions } from "./BookingStatusManager";

export default async function BookingManagementPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    include: {
      actors: {
        where: { status: { not: "ARCHIVED" } },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });

  const primaryActor = profile?.actors?.[0];

  if (!primaryActor) {
    redirect("/onboarding");
  }

  const incomingBookings = await prisma.bookingRequest.findMany({
    where: { targetId: primaryActor.id },
    include: { requester: true },
    orderBy: { createdAt: "desc" },
  });

  const outgoingBookings = await prisma.bookingRequest.findMany({
    where: { requesterId: primaryActor.id },
    include: { target: true },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = incomingBookings.filter(b => b.status === "PENDING").length;

  return (
    <AppShell actor={primaryActor} activeRoute="/dashboard/bookings">
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[28px] border border-stone-200 shadow-xs">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-[#1E1B2E] transition-colors mb-3">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B2E] tracking-tight">
              Manajemen Booking
            </h1>
            <p className="text-sm text-stone-500 mt-1 max-w-xl">
              Kelola pesanan masuk dan pantau status permintaan sewa yang Anda ajukan.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-2xl p-4 shrink-0">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-500 uppercase tracking-widest">Menunggu Respons</div>
              <div className="text-2xl font-black text-[#1E1B2E]">{pendingCount} Pesanan</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Incoming Bookings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <Inbox className="w-5 h-5 text-[#1E1B2E]" />
              <h2 className="text-lg font-bold text-[#1E1B2E]">Pesanan Masuk</h2>
            </div>
            
            {incomingBookings.length === 0 ? (
              <div className="p-8 bg-white border border-stone-200 rounded-[24px] text-center shadow-xs">
                <p className="text-sm text-stone-500">Belum ada pesanan masuk.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {incomingBookings.map((booking) => (
                  <div key={booking.id} className="p-5 bg-white border border-stone-200 rounded-[24px] shadow-xs hover:border-amber-200 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center overflow-hidden">
                          <span className="text-stone-400 font-bold text-lg">{booking.requester.name.charAt(0)}</span>
                        </div>
                        <div>
                          <Link
                            href={`/directory/${booking.requesterId}`}
                            className="font-bold text-[#1E1B2E] hover:text-amber-800 hover:underline inline-flex items-center gap-1 group text-sm"
                            title="Lihat profil requester"
                          >
                            <span>{booking.requester.name}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-800 transition-colors" />
                          </Link>
                          <div className="text-xs text-stone-500">{booking.requester.sector}</div>
                        </div>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 bg-stone-50 p-4 rounded-xl border border-stone-100">
                      <div>
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Tanggal Pelaksanaan</div>
                        <div className="text-xs font-semibold text-[#1E1B2E]">
                          {booking.startDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          {booking.endDate && ` – ${booking.endDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Anggaran (Budget)</div>
                        <div className="text-xs font-semibold text-[#1E1B2E]">
                          {booking.budget || "Sesuai kesepakatan"}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Spesifikasi & Kebutuhan</div>
                        <BookingDetailsBadgeList details={booking.details} />
                      </div>
                    </div>

                    {booking.status === "PENDING" && (
                      <BookingStatusManager bookingId={booking.id} />
                    )}

                    {booking.status === "ACCEPTED" && (
                      <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Koordinasi Langsung</div>
                          <BookingContactActions
                            phone={booking.requester.contactPhone}
                            email={booking.requester.contactEmail}
                            contactName={booking.requester.name}
                            myRole="target"
                          />
                        </div>
                        <div className="shrink-0 pt-2 sm:pt-0">
                          <ConvertBookingButton
                            bookingId={booking.id}
                            collaborationId={(booking.details as any)?.collaborationId}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Bookings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <Send className="w-5 h-5 text-stone-400" />
              <h2 className="text-lg font-bold text-stone-600">Permintaan Saya</h2>
            </div>
            
            {outgoingBookings.length === 0 ? (
              <div className="p-8 bg-white border border-stone-200 rounded-[24px] text-center shadow-xs">
                <p className="text-sm text-stone-500">Anda belum mengajukan sewa / booking.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {outgoingBookings.map((booking) => (
                  <div key={booking.id} className="p-5 bg-white border border-stone-200 rounded-[24px] shadow-xs">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center overflow-hidden">
                          <span className="text-stone-400 font-bold text-lg">{booking.target.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="text-xs text-stone-500">Penyedia Jasa:</div>
                          <Link
                            href={`/directory/${booking.targetId}`}
                            className="font-bold text-[#1E1B2E] hover:text-amber-800 hover:underline inline-flex items-center gap-1 group text-sm"
                            title="Lihat profil penyedia jasa"
                          >
                            <span>{booking.target.name}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-800 transition-colors" />
                          </Link>
                          <div className="text-[11px] text-stone-400">{booking.target.sector}</div>
                        </div>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 bg-stone-50 p-4 rounded-xl border border-stone-100">
                      <div>
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Tanggal Pengajuan</div>
                        <div className="text-xs font-semibold text-[#1E1B2E]">
                          {booking.startDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Anggaran Diajukan</div>
                        <div className="text-xs font-semibold text-[#1E1B2E]">
                          {booking.budget || "Sesuai kesepakatan"}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Rincian Permintaan</div>
                        <BookingDetailsBadgeList details={booking.details} />
                      </div>
                    </div>

                    {booking.status === "ACCEPTED" && (
                      <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-0.5">Pesanan Diterima!</div>
                          <p className="text-[11px] text-stone-500 mb-1.5">Silakan hubungi penyedia jasa untuk konfirmasi pembayaran DP & lokasi.</p>
                          <BookingContactActions
                            phone={booking.target.contactPhone}
                            email={booking.target.contactEmail}
                            contactName={booking.target.name}
                            myRole="requester"
                          />
                        </div>
                        {(booking.details as any)?.collaborationId && (
                          <div className="shrink-0 pt-2 sm:pt-0">
                            <ConvertBookingButton
                              bookingId={booking.id}
                              collaborationId={(booking.details as any)?.collaborationId}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function BookingDetailsBadgeList({ details }: { details: any }) {
  if (!details || typeof details !== "object") {
    return <span className="text-stone-400 italic text-xs">Tidak ada rincian khusus</span>;
  }

  const entries = Object.entries(details).filter(
    ([key, val]) => key !== "collaborationId" && val && String(val).trim() !== ""
  );

  if (entries.length === 0) {
    return <span className="text-stone-400 italic text-xs">Spesifikasi standar</span>;
  }

  const labelMap: Record<string, string> = {
    roomType: "Tipe Ruangan",
    addons: "Add-ons",
    role: "Peran/Karakter",
    usageRights: "Hak Penggunaan",
    location: "Lokasi Pelaksanaan",
    deliverables: "Target Luaran",
    referenceUrl: "Referensi Visual",
    wardrobe: "Busana",
    hours: "Durasi Sesi",
    crew: "Jumlah Kru",
    concept: "Konsep Proyek",
    notes: "Catatan",
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {entries.map(([k, v]) => {
        const valStr = String(v);
        const isUrl = valStr.startsWith("http://") || valStr.startsWith("https://");

        return (
          <span
            key={k}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-stone-200/90 text-[11px] font-medium text-stone-700 shadow-2xs"
          >
            <span className="font-bold text-[#1E1B2E]">{labelMap[k] || k}:</span>
            {isUrl ? (
              <a
                href={valStr}
                target="_blank"
                rel="noreferrer"
                className="text-amber-800 hover:text-amber-950 font-bold hover:underline inline-flex items-center gap-0.5"
              >
                <span>Buka Link</span>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </a>
            ) : (
              <span>{valStr}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}


function StatusBadge({ status }: { status: string }) {
  if (status === "ACCEPTED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" />
        Diterima
      </span>
    );
  }
  if (status === "DECLINED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider border border-red-200">
        <XCircle className="w-3 h-3" />
        Ditolak
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
      <Clock className="w-3 h-3" />
      Menunggu
    </span>
  );
}
