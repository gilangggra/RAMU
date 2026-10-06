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
  ExternalLink,
} from "lucide-react";
import {
  BookingStatusManager,
  BookingRequesterActions,
  ConvertBookingButton,
  BookingContactActions,
  ViewSpkButton,
  BookingMilestoneTracker,
} from "@/app/dashboard/bookings/BookingStatusManager";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Detail Pesanan SPK-RAMU-${id.slice(0, 8).toUpperCase()} | RAMU`,
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
  const collaborationId = (details?.collaborationId as string | undefined) || null;
  const hasCollaboration = Boolean(collaborationId);

  const statusConfig = {
    PENDING: {
      label: "Menunggu Respons",
      badge: "bg-amber-50 text-amber-700 border-amber-200/60",
      dot: "bg-amber-500 animate-pulse",
      icon: Clock,
    },
    NEGOTIATING: {
      label: "Reschedule Diajukan",
      badge: "bg-blue-50 text-blue-700 border-blue-200/60",
      dot: "bg-blue-500 animate-pulse",
      icon: Calendar,
    },
    CANCELLED: {
      label: "Dibatalkan",
      badge: "bg-stone-100 text-stone-600 border-stone-200/70",
      dot: "bg-stone-400",
      icon: XCircle,
    },
    ACCEPTED: hasCollaboration
      ? {
          label: "Workspace Kolaborasi Aktif",
          badge: "bg-stone-900 text-white border-stone-900 shadow-2xs",
          dot: "bg-emerald-400 animate-pulse",
          icon: Handshake,
        }
      : {
          label: "Disetujui",
          badge: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
          dot: "bg-emerald-500",
          icon: CheckCircle2,
        },
    DECLINED: {
      label: "Ditolak",
      badge: "bg-rose-50 text-rose-700 border-rose-200/60",
      dot: "bg-rose-500",
      icon: XCircle,
    },
  };

  const sc = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.PENDING;
  const StatusIcon = sc.icon;

  const isBrandCollaboration =
    Boolean(details.collaborationType) ||
    Boolean(details.initiatorRole) ||
    booking.target.actorType === "BRAND" ||
    (booking.target.actorType as string) === "MSME" ||
    (booking.target.sector?.toLowerCase() || "").includes("brand") ||
    (booking.target.sector?.toLowerCase() || "").includes("label");

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
    initiatorRole: "Peran / Tim Pengaju",
    collaborationType: "Model Kerjasama",
    conceptSummary: "Ringkasan Konsep & Sinergi",
    deckUrl: "Tautan Pitch Deck / Moodboard",
    initiatorType: "Tipe Pemrakarsa",
    projectTitle: "Judul Proyek",
    outputDetails: "Rincian Luaran",
    sessionDate: "Estimasi Tanggal",
  };

  const collabTypeLabels: Record<string, string> = {
    CAMPAIGN_PRODUCTION: "Produksi Kampanye Lookbook Koleksi Baru",
    BARTER_SEEDING: "Barter / Product Seeding & Endorsement",
    CO_BRANDING: "Kolaborasi Koleksi Kapsul (Co-Branding)",
    SPONSORSHIP: "Sponsorship Event / Fashion Show / Editorial",
    CUSTOM_BRIEF: "Brief Kemitraan Khusus",
  };

  const detailEntries = Object.entries(details).filter(
    ([key, val]) =>
      key !== "collaborationId" &&
      key !== "agreedTerms" &&
      key !== "initiatorType" &&
      key !== "offerMessageId" &&
      key !== "source" &&
      val &&
      String(val).trim() !== ""
  );

  const agreedTerms =
    details.agreedTerms && typeof details.agreedTerms === "object"
      ? (details.agreedTerms as Record<string, any>)
      : null;

  return (
    <AppShell actor={{ ...primaryActor, avatarUrl: profile.avatarUrl }} activeRoute="/dashboard/bookings">
      <div className="max-w-5xl mx-auto space-y-6 pb-12 w-full">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Link
            href="/dashboard/bookings"
            className="inline-flex items-center gap-1.5 font-medium hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Manajemen Pesanan</span>
          </Link>
          <span className="text-stone-300">/</span>
          <span className="font-mono text-stone-900 font-semibold">{refCode}</span>
        </div>

        {/* HEADER CARD */}
        <div className="bg-white border border-stone-200/80 rounded-2xl shadow-2xs overflow-hidden">
          <div className="p-6 sm:p-7 border-b border-stone-100">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                    {isBrandCollaboration ? "Proposal Kemitraan & Kolaborasi" : "Surat Perjanjian Kerja (SPK)"}
                  </span>
                  <span className="px-2 py-0.5 bg-stone-100 border border-stone-200/70 rounded-md font-mono text-[11px] font-medium text-stone-600">
                    {refCode}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${sc.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    <span>{sc.label}</span>
                  </span>
                  <span className="text-xs text-stone-400">
                    Dibuat {new Date(booking.createdAt).toLocaleDateString("id-ID", { dateStyle: "long" })}
                  </span>
                  {hasCollaboration && (
                    <Link
                      href={`/collaborations/${collaborationId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-900 hover:bg-black text-white transition-colors shadow-2xs"
                    >
                      <Handshake className="w-3.5 h-3.5 text-stone-300" />
                      <span>Buka Workspace</span>
                      <ArrowUpRight className="w-3 h-3 opacity-70" />
                    </Link>
                  )}
                </div>

                {isTarget && booking.status === "PENDING" && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200/60 rounded-lg text-xs font-medium text-amber-800">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      {isBrandCollaboration
                        ? "Proposal kemitraan ini menunggu tinjauan Anda — mohon beri keputusan."
                        : "Pesanan ini menunggu respons Anda — mohon segera tinjau dan beri keputusan."}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-stone-100 bg-[#FAFAFA]/50">
            {/* Requester */}
            <div className="p-5 sm:p-6 space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span>{isBrandCollaboration ? "Pemrakarsa / Inisiator" : "Pemesan / Klien"}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200/80 flex items-center justify-center shrink-0 font-bold text-stone-700 text-xs shadow-2xs">
                  {booking.requester.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <Link
                    href={`/directory/${booking.requesterId}`}
                    className="font-semibold text-stone-900 text-sm hover:underline inline-flex items-center gap-1 group"
                  >
                    <span>{booking.requester.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 transition-colors" />
                  </Link>
                  <p className="text-xs text-stone-500">{booking.requester.sector}</p>
                  {booking.requester.location && (
                    <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {booking.requester.location}
                    </p>
                  )}
                </div>
                {isRequester && (
                  <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200/60">
                    Akun Anda
                  </span>
                )}
              </div>
            </div>

            {/* Target */}
            <div className="p-5 sm:p-6 space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-stone-400" />
                <span>{isBrandCollaboration ? "Mitra Kolaborasi / Brand" : "Penyedia Jasa / Pelaksana"}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs">
                  {booking.target.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <Link
                    href={`/directory/${booking.targetId}`}
                    className="font-semibold text-stone-900 text-sm hover:underline inline-flex items-center gap-1 group"
                  >
                    <span>{booking.target.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 transition-colors" />
                  </Link>
                  <p className="text-xs text-stone-500">{booking.target.sector}</p>
                  {booking.target.location && (
                    <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {booking.target.location}
                    </p>
                  )}
                </div>
                {isTarget && (
                  <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-900 text-white shadow-2xs">
                    Akun Anda
                  </span>
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
            <div className="bg-white border border-stone-200/80 rounded-2xl shadow-2xs overflow-hidden">
              <div className="px-5 py-3.5 bg-stone-50/70 border-b border-stone-200/70">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  Rincian Jadwal &amp; Komitmen Finansial
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
                <div className="p-5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>Tanggal Pelaksanaan</span>
                  </div>
                  <p className="text-sm font-semibold text-stone-900">
                    {new Date(booking.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  {booking.endDate && (
                    <p className="text-xs text-stone-500">
                      s/d {new Date(booking.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                </div>

                <div className="p-5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                    <CircleDollarSign className="w-3.5 h-3.5 text-stone-400" />
                    <span>Nilai Kesepakatan (Anggaran)</span>
                  </div>
                  <p className="text-sm font-bold text-stone-900">
                    {booking.budget || "Sesuai kesepakatan"}
                  </p>
                  <p className="text-[10px] text-stone-400">
                    Skema pembayaran DP {dpPercentage}% + Pelunasan {100 - dpPercentage}%
                  </p>
                </div>
              </div>
            </div>

            {/* SPESIFIKASI / PROPOSAL DETAIL */}
            {detailEntries.length > 0 && (
              <div className="bg-white border border-stone-200/80 rounded-2xl shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 bg-stone-50/70 border-b border-stone-200/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-stone-500" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                      {isBrandCollaboration ? "Rincian Proposal Kemitraan" : "Spesifikasi & Kebutuhan Proyek"}
                    </span>
                  </div>
                  {isBrandCollaboration && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200/60">
                      Brand Pitch
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {detailEntries.map(([key, val]) => {
                      const valStr = String(val);
                      const isUrl = valStr.startsWith("http://") || valStr.startsWith("https://") || key === "deckUrl";
                      const isFullWidth = key === "conceptSummary" || key === "concept" || key === "notes" || key === "outputDetails";
                      const displayVal = key === "collaborationType" ? (collabTypeLabels[valStr] || valStr) : valStr;

                      return (
                        <div key={key} className={`space-y-1.5 ${isFullWidth ? "sm:col-span-2" : ""}`}>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
                            {labelMap[key] || key}
                          </span>
                          {isUrl ? (
                            <a
                              href={valStr}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200/80 rounded-lg px-3.5 py-2 inline-flex items-center gap-2 transition-colors shadow-2xs"
                            >
                              <span>{key === "deckUrl" ? "Buka Pitch Deck / Moodboard" : "Buka Tautan Referensi"}</span>
                              <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                            </a>
                          ) : (
                            <p className="text-xs font-medium text-stone-800 leading-relaxed whitespace-pre-line bg-stone-50/70 p-3 rounded-lg border border-stone-200/60">
                              {displayVal}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {agreedTerms && (agreedTerms.ndaAgreed || agreedTerms.coCreditsAgreed || agreedTerms.sampleCareAgreed) && (
                    <div className="pt-4 border-t border-stone-100 space-y-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
                        Kepatuhan Legalitas &amp; Perlindungan RAMU
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {agreedTerms.ndaAgreed && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200/60">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Persetujuan Kerahasiaan (NDA) Aktif</span>
                          </span>
                        )}
                        {agreedTerms.coCreditsAgreed && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200/60">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Hak Co-Credits &amp; Atribusi Karya</span>
                          </span>
                        )}
                        {agreedTerms.sampleCareAgreed && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200/60">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Garansi Keamanan Sampel Busana</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MILESTONE PIPELINE */}
            <div className="bg-white border border-stone-200/80 rounded-2xl shadow-2xs overflow-hidden">
              <div className="px-5 py-3.5 bg-stone-50/70 border-b border-stone-200/70 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  Tahapan Pengerjaan &amp; Penyerahan Luaran
                </span>
              </div>
              <div className="p-5">
                <BookingMilestoneTracker status={booking.status} dpPercentage={dpPercentage} collaborationId={collaborationId} />
              </div>
            </div>
          </div>

          {/* RIGHT: ACTION PANEL */}
          <div className="space-y-4">
            {/* STATUS ACTION */}
            <div className="bg-white border border-stone-200/80 rounded-2xl shadow-2xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-stone-100 bg-stone-50/70">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  {isTarget ? "Tindakan Penyedia Jasa" : isRequester ? "Tindakan Pemesan" : "Status Pesanan"}
                </span>
              </div>
              <div className="p-5 space-y-4">
                <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold ${sc.badge}`}>
                  <StatusIcon className="w-4 h-4 shrink-0" />
                  <span>{sc.label}</span>
                </div>

                {/* Cancelled Notice */}
                {booking.status === "CANCELLED" && details.cancellation && (
                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                      <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>Pesanan Telah Dibatalkan</span>
                    </div>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      Dibatalkan oleh <strong className="text-stone-800">{details.cancellation.cancelledByName || "pihak pemesan"}</strong> pada{" "}
                      {new Date(details.cancellation.cancelledAt).toLocaleDateString("id-ID", { dateStyle: "long" })}.
                    </p>
                    {details.cancellation.reason && (
                      <p className="text-[11px] text-stone-600 bg-white p-2.5 rounded-lg border border-stone-200/70 italic">
                        &ldquo;{details.cancellation.reason}&rdquo;
                      </p>
                    )}
                  </div>
                )}

                {/* Actions for Target (Penyedia Jasa) */}
                {isTarget && (booking.status === "PENDING" || booking.status === "NEGOTIATING") && (
                  <BookingStatusManager
                    bookingId={booking.id}
                    partnerName={booking.requester.name}
                    refCode={refCode}
                    currentStartDate={booking.startDate}
                    currentEndDate={booking.endDate}
                    currentBudget={booking.budget}
                  />
                )}

                {/* Actions for Requester (Pemesan) */}
                {isRequester && (booking.status === "PENDING" || booking.status === "NEGOTIATING") && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      Pesanan Anda sedang menunggu tinjauan dari <strong className="text-stone-800">{booking.target.name}</strong>. Anda dapat mengusulkan perubahan jadwal atau membatalkan pesanan.
                    </p>
                    <BookingRequesterActions
                      bookingId={booking.id}
                      partnerName={booking.target.name}
                      refCode={refCode}
                      currentStartDate={booking.startDate}
                      currentEndDate={booking.endDate}
                      currentBudget={booking.budget}
                    />
                  </div>
                )}

                {booking.status === "ACCEPTED" && (
                  <div className="space-y-3">
                    {hasCollaboration && (
                      <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-xl space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900">
                          <Handshake className="w-3.5 h-3.5 text-stone-600" />
                          <span>Ruang Kerja Terhubung</span>
                        </div>
                        <p className="text-[11px] text-stone-500 leading-relaxed">
                          Pesanan ini telah dibuka menjadi ruang kolaborasi resmi. Task board, milestone, dan catatan kerja dapat diakses bersama mitra.
                        </p>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                        Koordinasi Langsung
                      </p>
                      <BookingContactActions
                        phone={isTarget ? booking.requester.contactPhone : booking.target.contactPhone}
                        email={isTarget ? booking.requester.contactEmail : booking.target.contactEmail}
                        contactName={isTarget ? booking.requester.name : booking.target.name}
                        myRole={isTarget ? "target" : "requester"}
                        partnerActorId={isTarget ? booking.requesterId : booking.targetId}
                      />
                    </div>

                    <div className="pt-2">
                      <ConvertBookingButton
                        bookingId={booking.id}
                        collaborationId={collaborationId}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* IP & CATATAN HUKUM */}
            <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-stone-600" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  Kepastian Hukum &amp; Hak Cipta
                </span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Seluruh transaksi diikat oleh SPK digital resmi RAMU. Hak cipta master aset orisinal tetap terlindungi, dan izin komersial berlaku sah setelah seluruh luaran diterima.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-stone-400 pt-1 border-t border-stone-200/60">
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