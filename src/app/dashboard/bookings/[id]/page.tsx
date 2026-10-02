import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { AppShell } from "@/components/layout/AppShell";
import {
  ArrowLeft,
  Calendar,
  CircleDollarSign,
  FileText,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Handshake,
  User,
  Building2,
  Hash,
  ShieldCheck,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import {
  BookingStatusManager,
  ConvertBookingButton,
  BookingContactActions,
  ViewSpkButton,
  BookingMilestoneTracker,
} from "@/app/dashboard/bookings/BookingStatusManager";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Detail Booking SPK-RAMU-${id.slice(0, 8).toUpperCase()} | RAMU`,
  };
}

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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
  if (!primaryActor) redirect("/onboarding");

  const booking = await prisma.bookingRequest.findUnique({
    where: { id },
    include: {
      requester: true,
      target: true,
    },
  });

  if (!booking) notFound();

  const isTarget = booking.targetId === primaryActor.id;
  const isRequester = booking.requesterId === primaryActor.id;

  // Only involved parties can see this page
  if (!isTarget && !isRequester) redirect("/dashboard/bookings");

  const details = (typeof booking.details === "object" && booking.details !== null)
    ? (booking.details as Record<string, any>)
    : {};

  const dpPercentage = details?.agreedTerms?.dpPercentage || 50;
  const refCode = `SPK-RAMU-${booking.id.slice(0, 8).toUpperCase()}`;

  const statusConfig = {
    PENDING: {
      label: "Menunggu Respons",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500 animate-pulse",
      icon: Clock,
    },
    ACCEPTED: {
      label: "Diterima",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      icon: CheckCircle2,
    },
    DECLINED: {
      label: "Ditolak",
      badge: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500",
      icon: XCircle,
    },
  };

  const sc = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.PENDING;
  const StatusIcon = sc.icon;

  const labelMap: Record<string, string> = {
    roomType: "Tipe Ruangan",
    addons: "Add-ons",
    role: "Peran / Karakter",
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

  const detailEntries = Object.entries(details).filter(
    ([key, val]) => key !== "collaborationId" && key !== "agreedTerms" && val && String(val).trim() !== ""
  );

  return (
    <AppShell actor={{ ...primaryActor, avatarUrl: profile.avatarUrl }} activeRoute="/dashboard/bookings">
      <div className="max-w-4xl mx-auto space-y-6 pb-12">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Link
            href="/dashboard/bookings"
            className="inline-flex items-center gap-1.5 font-bold hover:text-[#1E1B2E] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Manajemen Booking
          </Link>
          <span>/</span>
          <span className="font-mono text-[#1E1B2E] font-semibold">{refCode}</span>
        </div>

        {/* HEADER CARD */}
        <div className="bg-white border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-stone-100">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Surat Perjanjian Kerja</span>
                  <span className="px-2 py-0.5 bg-stone-100 border border-stone-200 font-mono text-[11px] font-semibold text-stone-600">
                    {refCode}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${sc.badge}`}>
                    <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                    {sc.label}
                  </span>
                  <span className="text-xs text-stone-400">
                    Dibuat {new Date(booking.createdAt).toLocaleDateString("id-ID", { dateStyle: "long" })}
                  </span>
                </div>

                {isTarget && booking.status === "PENDING" && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="text-xs font-semibold text-amber-800">
                      Pesanan ini menunggu respons Anda — mohon segera tinjau dan beri keputusan.
                    </span>
                  </div>
                )}
              </div>

              {/* View SPK */}
              <div className="shrink-0">
                <ViewSpkButton booking={booking as any} />
              </div>
            </div>
          </div>

          {/* PARTIES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
            <div className="p-5 sm:p-6 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Pemesan / Requester
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0 font-bold text-stone-700">
                  {booking.requester.name.charAt(0)}
                </div>
                <div>
                  <Link
                    href={`/directory/${booking.requesterId}`}
                    className="font-bold text-[#1E1B2E] text-sm hover:underline inline-flex items-center gap-1"
                  >
                    {booking.requester.name}
                    <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
                  </Link>
                  <p className="text-xs text-stone-500">{booking.requester.sector}</p>
                  {booking.requester.location && (
                    <p className="text-xs text-stone-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {booking.requester.location}
                    </p>
                  )}
                </div>
                {isRequester && (
                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-600">ANDA</span>
                )}
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Penyedia Jasa / Target
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1E1B2E] flex items-center justify-center shrink-0 font-bold text-white">
                  {booking.target.name.charAt(0)}
                </div>
                <div>
                  <Link
                    href={`/directory/${booking.targetId}`}
                    className="font-bold text-[#1E1B2E] text-sm hover:underline inline-flex items-center gap-1"
                  >
                    {booking.target.name}
                    <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
                  </Link>
                  <p className="text-xs text-stone-500">{booking.target.sector}</p>
                  {booking.target.location && (
                    <p className="text-xs text-stone-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {booking.target.location}
                    </p>
                  )}
                </div>
                {isTarget && (
                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 bg-[#1E1B2E] text-white">ANDA</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: DETAIL INFO */}
          <div className="lg:col-span-2 space-y-5">

            {/* TANGGAL & BUDGET */}
            <div className="bg-white border border-stone-200 shadow-xs divide-y divide-stone-100">
              <div className="px-5 py-4 bg-stone-50 border-b border-stone-200">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
                  Rincian Pesanan
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
                <div className="p-5 space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    <Calendar className="w-3.5 h-3.5" />
                    Tanggal Pelaksanaan
                  </div>
                  <p className="text-sm font-bold text-[#1E1B2E]">
                    {booking.startDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  {booking.endDate && (
                    <p className="text-xs text-stone-500">
                      s/d {booking.endDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                </div>
                <div className="p-5 space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    <CircleDollarSign className="w-3.5 h-3.5" />
                    Anggaran / Budget
                  </div>
                  <p className="text-sm font-bold text-[#1E1B2E]">
                    {booking.budget || "Sesuai kesepakatan"}
                  </p>
                  <p className="text-[10px] text-stone-400">
                    Skema DP {dpPercentage}% + Pelunasan {100 - dpPercentage}%
                  </p>
                </div>
              </div>
            </div>

            {/* SPESIFIKASI */}
            {detailEntries.length > 0 && (
              <div className="bg-white border border-stone-200 shadow-xs divide-y divide-stone-100">
                <div className="px-5 py-4 bg-stone-50 border-b border-stone-200 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-stone-500" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
                    Spesifikasi & Kebutuhan
                  </span>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {detailEntries.map(([key, val]) => {
                      const valStr = String(val);
                      const isUrl = valStr.startsWith("http://") || valStr.startsWith("https://");
                      return (
                        <div key={key} className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                            {labelMap[key] || key}
                          </span>
                          {isUrl ? (
                            <a
                              href={valStr}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-semibold text-amber-700 hover:underline inline-flex items-center gap-1"
                            >
                              Buka Referensi <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <p className="text-sm font-semibold text-[#1E1B2E] leading-relaxed">{valStr}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* MILESTONE TRACKER */}
            <div className="bg-white border border-stone-200 shadow-xs divide-y divide-stone-100">
              <div className="px-5 py-4 bg-stone-50 border-b border-stone-200 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
                  Alur Proteksi Pembayaran RAMU
                </span>
              </div>
              <div className="p-5">
                <BookingMilestoneTracker status={booking.status} dpPercentage={dpPercentage} />
              </div>
            </div>

          </div>

          {/* RIGHT: ACTION PANEL */}
          <div className="space-y-4">

            {/* STATUS ACTION */}
            <div className="bg-white border border-stone-200 shadow-xs">
              <div className="px-5 py-4 border-b border-stone-100 bg-stone-50">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
                  {isTarget ? "Tindakan Anda" : "Status Pesanan"}
                </span>
              </div>
              <div className="p-5 space-y-4">
                <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold ${sc.badge}`}>
                  <StatusIcon className="w-4 h-4" />
                  <span>{sc.label}</span>
                </div>

                {isTarget && booking.status === "PENDING" && (
                  <BookingStatusManager bookingId={booking.id} />
                )}

                {booking.status === "ACCEPTED" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Koordinasi Langsung</p>
                      <BookingContactActions
                        phone={isTarget ? booking.requester.contactPhone : booking.target.contactPhone}
                        email={isTarget ? booking.requester.contactEmail : booking.target.contactEmail}
                        contactName={isTarget ? booking.requester.name : booking.target.name}
                        myRole={isTarget ? "target" : "requester"}
                      />
                    </div>

                    <ConvertBookingButton
                      bookingId={booking.id}
                      collaborationId={details?.collaborationId}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* IP & CATATAN HUKUM */}
            <div className="bg-stone-50 border border-stone-200 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-stone-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Catatan Hukum & Hak Cipta
                </span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Pesanan ini dilindungi oleh SPK RAMU. Hak cipta aset orisinal tetap menjadi milik pencipta. Penggunaan komersial hanya berlaku sesuai lingkup yang disepakati.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-stone-400">
                <Hash className="w-3 h-3" />
                <span className="font-mono">{booking.id}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppShell>
  );
}