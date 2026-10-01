"use client";

import React, { useState } from "react";
import {
  FileText,
  Printer,
  Share2,
  Copy,
  Check,
  X,
  ShieldCheck,
  Calendar,
  Building2,
  User,
  ExternalLink,
  Award,
} from "lucide-react";
import {
  TermsAndConditionsConfig,
  getDefaultTerms,
  getUsageScopeLabel,
  getUsageDurationLabel,
  getMilestoneSchemeLabel,
} from "@/components/settings/RatesForm";

export interface BookingSpkData {
  id: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  budget?: string | null;
  status: string;
  createdAt: string | Date;
  requester: {
    id: string;
    name: string;
    sector: string;
    location?: string | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
  };
  target: {
    id: string;
    name: string;
    sector: string;
    actorType: string;
    location?: string | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
  };
  details?: Record<string, any> | null;
}

interface SpkAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingSpkData;
}

function toRomanMonth(month: number): string {
  const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  return roman[month] || "I";
}

export function SpkAgreementModal({ isOpen, onClose, booking }: SpkAgreementModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const agreedTermsRaw = booking.details?.agreedTerms;
  const defaultFallback = getDefaultTerms(booking.target.sector, booking.target.actorType);
  const terms: TermsAndConditionsConfig = agreedTermsRaw
    ? {
        dpPercentage: agreedTermsRaw.dpPercentage ?? defaultFallback.dpPercentage,
        maxRevisions: agreedTermsRaw.maxRevisions ?? defaultFallback.maxRevisions,
        shiftHours: agreedTermsRaw.shiftHours ?? defaultFallback.shiftHours,
        overtimeRate: agreedTermsRaw.overtimeRate ?? defaultFallback.overtimeRate,
        gracePeriodMinutes: agreedTermsRaw.gracePeriodMinutes ?? defaultFallback.gracePeriodMinutes,
        safeSetCompliant: agreedTermsRaw.safeSetCompliant ?? defaultFallback.safeSetCompliant,
        usageRightsScope: agreedTermsRaw.usageRightsScope ?? defaultFallback.usageRightsScope,
        usageRightsDuration: agreedTermsRaw.usageRightsDuration ?? defaultFallback.usageRightsDuration,
        extraRevisionFee: agreedTermsRaw.extraRevisionFee ?? defaultFallback.extraRevisionFee,
        paymentMilestoneScheme: agreedTermsRaw.paymentMilestoneScheme ?? defaultFallback.paymentMilestoneScheme,
        roleSpecifics: agreedTermsRaw.roleSpecifics ?? defaultFallback.roleSpecifics ?? {},
      }
    : defaultFallback;

  const milestoneInfo = getMilestoneSchemeLabel(terms.paymentMilestoneScheme, terms.dpPercentage);

  const dateObj = new Date(booking.createdAt);
  const romanMonth = toRomanMonth(dateObj.getMonth());
  const year = dateObj.getFullYear();
  const shortId = booking.id.slice(0, 8).toUpperCase();
  const spkNomorResmi = `SPK/RAMU/${year}/${romanMonth}/${shortId}`;

  const formattedDate = new Date(booking.startDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const createdFullDate = dateObj.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const targetSectorLower = booking.target.sector.toLowerCase();
  const isStudio = booking.target.actorType === "STUDIO" || targetSectorLower.includes("studio");
  const isModel = !isStudio && (targetSectorLower.includes("model") || targetSectorLower.includes("talent"));
  const isMua = !isStudio && !isModel && (targetSectorLower.includes("mua") || targetSectorLower.includes("makeup"));
  const isStylist = !isStudio && !isModel && !isMua && (targetSectorLower.includes("stylist") || targetSectorLower.includes("wardrobe"));
  const isVideographer = !isStudio && !isModel && !isMua && !isStylist && (targetSectorLower.includes("video") || targetSectorLower.includes("film"));
  const isDesigner = !isStudio && !isModel && !isMua && !isStylist && !isVideographer && (targetSectorLower.includes("design") || targetSectorLower.includes("fashion") || targetSectorLower.includes("busana"));
  const isPhotographer = !isStudio && !isModel && !isMua && !isStylist && !isVideographer && !isDesigner;

  function handlePrint() {
    window.print();
  }

  function handleCopySummary() {
    const text = `*SURAT PERJANJIAN KERJA SAMA JASA (SPK)*
Nomor: ${spkNomorResmi}
Platform: RAMU Creative Ecosystem (PSE Terdaftar)

*PARA PIHAK:*
1. Pihak Pertama (Pemberi Kerja): ${booking.requester.name}
2. Pihak Kedua (Pelaksana Jasa): ${booking.target.name} (${booking.target.sector})

*RINGKASAN PASAL KESEPAKATAN:*
- Pasal 1 (Jadwal): ${formattedDate} (Shift: ${terms.shiftHours} Jam)
- Pasal 2 (Biaya & Termin): ${booking.budget || "Sesuai kesepakatan"} | ${milestoneInfo.title}
- Pasal 3 (Lembur): Rp ${terms.overtimeRate}/jam (Toleransi ${terms.gracePeriodMinutes} mnt)
- Pasal 4 (Revisi): Maksimal ${terms.maxRevisions}x revisi minor (Biaya revisi ekstra: ${terms.extraRevisionFee || "Rp 100.000 / foto"})
- Pasal 5 (Hak Cipta & Lisensi): ${getUsageScopeLabel(terms.usageRightsScope).split(" (")[0]} selama ${getUsageDurationLabel(terms.usageRightsDuration).split(" —")[0]}. Watermark protection berlaku sebelum pelunasan.
- Pasal 6 (Proteksi): Garansi 100% refund jika Pihak II No-Show; DP hangus jika Pihak I batal <48 jam.

Dokumen sah digital: https://ramu.id/dashboard/bookings`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `*SURAT PERJANJIAN KERJA SAMA JASA (SPK)*\n` +
      `No: ${spkNomorResmi}\n\n` +
      `Klien: ${booking.requester.name}\n` +
      `Talenta: ${booking.target.name}\n` +
      `Jadwal: ${formattedDate} (Shift ${terms.shiftHours} Jam)\n` +
      `Honorarium: ${booking.budget || "Sesuai kesepakatan"}\n` +
      `Skema: ${milestoneInfo.title}\n` +
      `Lisensi Hak Pakai: ${getUsageScopeLabel(terms.usageRightsScope).split(" (")[0]} (${getUsageDurationLabel(terms.usageRightsDuration).split(" —")[0]})\n` +
      `Batas Revisi: Maksimal ${terms.maxRevisions}x putaran minor\n\n` +
      `Dokumen perikatan sah sesuai KUHPerdata Pasal 1320 & UU ITE tercatat di RAMU.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">

      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-300 overflow-hidden my-auto max-h-[94vh] flex flex-col font-sans">

        <div className="print:hidden flex items-center justify-between px-6 py-3.5 border-b border-stone-200 bg-stone-100/80">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-stone-900 text-amber-400">
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-stone-900">
                Surat Perjanjian Kerja Sama Jasa (Format Standar Indonesia)
              </h2>
              <p className="text-[11px] text-stone-500 font-mono">{spkNomorResmi}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer shadow-xs"
              title="Cetak Dokumen Resmi A4"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak / PDF A4</span>
            </button>
            <a
              href={waShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
              title="Bagikan Teks SPK ke WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
              title="Salin Rangkuman Teks"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? "Tersalin!" : "Salin Ringkasan"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div id="spk-printable-area" className="p-8 sm:p-12 overflow-y-auto space-y-6 text-stone-900 bg-white">

          <div className="flex items-center justify-between border-b-2 border-stone-900 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-black text-2xl tracking-tighter shadow-xs">
                R
              </div>
              <div>
                <div className="text-xl font-black tracking-tight text-stone-950 flex items-center gap-2">
                  <span>RAMU INDONESIA</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 uppercase tracking-widest border border-amber-300">
                    Protokol Sah
                  </span>
                </div>
                <div className="text-[11px] text-stone-600 font-medium">
                  Ekosistem Kolaborasi & Pelindung Transaksi Kreatif Nasional
                </div>
                <div className="text-[10px] text-stone-400">
                  Layanan Penyelenggara Sistem Elektronik (PSE) &bull; www.ramu.id
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-stone-950">{spkNomorResmi}</div>
              <div className="text-[11px] text-stone-500">Klasifikasi: SPK-JASA-KREATIF</div>
              <div className="text-[10px] text-emerald-700 font-semibold flex items-center justify-end gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Tervalidasi Sistem RAMU</span>
              </div>
            </div>
          </div>

          <div className="text-center pt-2 pb-1">
            <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-stone-950 border-b border-stone-200 pb-2 inline-block">
              SURAT PERJANJIAN KERJA SAMA PELAKSANAAN JASA
            </h1>
            <p className="text-xs font-mono text-stone-600 mt-1 font-semibold">
              Nomor: {spkNomorResmi}
            </p>
          </div>

          <div className="text-xs text-stone-700 space-y-3 leading-relaxed">
            <p>
              Pada hari ini, <strong>{createdFullDate}</strong>, telah dibuat dan disepakati perjanjian kerja sama pelaksanaan jasa secara elektronik melalui platform RAMU oleh dan antara pihak-pihak di bawah ini:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">

              <div className="p-4 rounded-xl border border-stone-300 bg-stone-50/70 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5 border-b border-stone-200 pb-1">
                  <Building2 className="w-3 h-3 text-stone-500" />
                  <span>PIHAK PERTAMA (Pemberi Kerja / Klien)</span>
                </div>
                <div className="text-sm font-bold text-stone-950">{booking.requester.name}</div>
                <div className="text-[11px] text-stone-600">Sektor / Bidang: {booking.requester.sector}</div>
                {booking.requester.location && (
                  <div className="text-[11px] text-stone-600">Domisili / Lokasi: {booking.requester.location}</div>
                )}
                {booking.requester.contactPhone && (
                  <div className="text-[11px] text-stone-600">No. Kontak: {booking.requester.contactPhone}</div>
                )}
                {booking.requester.contactEmail && (
                  <div className="text-[11px] text-stone-600">Email: {booking.requester.contactEmail}</div>
                )}
              </div>

              <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/40 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 border-b border-amber-200 pb-1">
                  <User className="w-3 h-3 text-amber-700" />
                  <span>PIHAK KEDUA (Penyedia Jasa / Talenta Kreatif)</span>
                </div>
                <div className="text-sm font-bold text-stone-950">{booking.target.name}</div>
                <div className="text-[11px] text-stone-600">
                  Profesi: {booking.target.sector} ({booking.target.actorType})
                </div>
                {booking.target.location && (
                  <div className="text-[11px] text-stone-600">Domisili / Lokasi: {booking.target.location}</div>
                )}
                {booking.target.contactPhone && (
                  <div className="text-[11px] text-stone-600">No. Kontak: {booking.target.contactPhone}</div>
                )}
                {booking.target.contactEmail && (
                  <div className="text-[11px] text-stone-600">Email: {booking.target.contactEmail}</div>
                )}
              </div>
            </div>

            <p className="text-[11px] text-stone-600 italic">
              PIHAK PERTAMA dan PIHAK KEDUA secara bersama-sama selanjutnya disebut sebagai <strong>&ldquo;PARA PIHAK&rdquo;</strong>. PARA PIHAK sepakat untuk mengikatkan diri dalam Surat Perjanjian Kerja ini dengan ketentuan dan pasal-pasal sebagai berikut:
            </p>
          </div>

          <div className="space-y-5 text-xs text-stone-800 leading-relaxed border-t border-stone-200 pt-4">

            <div className="space-y-1.5">
              <h3 className="font-bold text-stone-950 text-xs uppercase tracking-wide">
                PASAL 1: RUANG LINGKUP PEKERJAAN &amp; JADWAL PELAKSANAAN
              </h3>
              <ol className="list-decimal pl-5 space-y-1 text-stone-700 text-[11px]">
                <li>
                  PIHAK PERTAMA menunjuk PIHAK KEDUA dan PIHAK KEDUA bersedia melaksanakan jasa profesional dalam bidang <strong>{booking.target.sector}</strong>.
                </li>
                <li>
                  Pekerjaan akan dilaksanakan pada tanggal <strong>{formattedDate}</strong>
                  {booking.endDate ? ` sampai dengan ${new Date(booking.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}` : ""}.
                </li>
                <li>
                  Durasi kerja standar yang disepakati adalah <strong>{terms.shiftHours} jam</strong> per shift/sesi kerja.
                </li>
                {booking.details && (
                  <li>
                    Spesifikasi pesanan dan rincian kebutuhan meliputi:{" "}
                    <strong>
                      {Object.entries(booking.details)
                        .filter(([k, v]) => k !== "collaborationId" && k !== "agreedTerms" && Boolean(v))
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ") || "Sesuai kesepakatan brief awal"}
                    </strong>.
                  </li>
                )}
              </ol>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-stone-950 text-xs uppercase tracking-wide">
                PASAL 2: BIAYA JASA &amp; TATA CARA PEMBAYARAN BERTAHAP
              </h3>
              <ol className="list-decimal pl-5 space-y-1 text-stone-700 text-[11px]">
                <li>
                  Total nilai honorarium/jasa yang disepakati untuk pelaksanaan pekerjaan ini adalah sebesar{" "}
                  <strong className="text-stone-950">{booking.budget || "Sesuai tarif paket resmi"}</strong>.
                </li>
                <li>
                  Mekanisme pembayaran mengacu pada skema: <strong className="text-stone-950">{milestoneInfo.title}</strong>.
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>
                      <strong>Tahap I (Uang Muka / DP {terms.dpPercentage}%)</strong>: Wajib disetorkan oleh PIHAK PERTAMA guna mengunci (*lock slot*) jadwal kerja, persiapan kru, dan penahanan tanggal dari tawaran pihak lain.
                    </li>
                    <li>
                      <strong>Tahap II (Pelunasan Sisa {100 - terms.dpPercentage}%)</strong>: Wajib dilunasi oleh PIHAK PERTAMA setelah penyerahan draf pratinjau (*contact sheet / watermarked preview*) disetujui, sebelum master file resolusi penuh (High-Res / Clean Output) diserahkan.
                    </li>
                    <li>
                      <strong>Proteksi Pratinjau (Watermark Protection)</strong>: Sebelum pelunasan Tahap II diterima penuh oleh PIHAK KEDUA, seluruh aset hasil kerja yang diserahkan berstatus <em>&ldquo;Pratinjau Bertanda-Air&rdquo;</em> dan <strong>DILARANG KERAS</strong> untuk diunggah, dipublikasikan, atau dikomersialisasikan oleh PIHAK PERTAMA di media manapun.
                    </li>
                  </ul>
                </li>
              </ol>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-stone-950 text-xs uppercase tracking-wide">
                PASAL 3: WAKTU KERJA, TOLERANSI, DAN KETENTUAN LEMBUR (OVERTIME)
              </h3>
              <ol className="list-decimal pl-5 space-y-1 text-stone-700 text-[11px]">
                <li>
                  Waktu kerja dihitung sejak kehadiran PIHAK KEDUA di lokasi kerja atau waktu panggilan (*call time*) yang disepakati.
                </li>
                <li>
                  Diberikan batas toleransi (*grace period*) keterlambatan teknis maksimal <strong>{terms.gracePeriodMinutes} menit</strong> tanpa pembebanan biaya tambahan.
                </li>
                <li>
                  Apabila durasi produksi melampaui batas {terms.shiftHours} jam atas permintaan atau kendala di pihak PIHAK PERTAMA, maka diberlakukan biaya lembur (*overtime fee*) sebesar <strong>Rp {terms.overtimeRate} per jam</strong> yang wajib ditambahkan pada tagihan pelunasan.
                </li>
              </ol>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-stone-950 text-xs uppercase tracking-wide">
                PASAL 4: HASIL KARYA, BATAS REVISI, DAN KETENTUAN KHUSUS PROFESI
              </h3>
              <ol className="list-decimal pl-5 space-y-1 text-stone-700 text-[11px]">
                <li>
                  Pekerjaan mencakup maksimal <strong>{terms.maxRevisions} (dua) kali putaran revisi minor</strong> yang mencakup penyesuaian wajar (*exposure*, *color tone balancing*, perapian noda minor, atau *trim cut*) yang relevan dengan brief awal.
                </li>
                <li>
                  Permintaan revisi tambahan di luar kuota maksimal dikenakan biaya revisi ekstra sebesar <strong>{terms.extraRevisionFee || "Rp 100.000 / foto"}</strong>.
                </li>
                <li>
                  Perubahan konsep visual, penggantian talenta/lokasi pasca-produksi, atau permintaan pengambilan gambar ulang (*reshoot*) bukan merupakan bagian dari revisi dan wajib disepakati sebagai adendum/kontrak kerja baru.
                </li>

                {isModel && (
                  <li>
                    <strong>Ketentuan Khusus Talenta/Model</strong>: Konsep busana wajib mematuhi kesepakatan awal ({terms.roleSpecifics.wardrobeRestrictions || "Konsep sopan terverifikasi"}). Talenta {terms.roleSpecifics.chaperoneAllowed ? "berhak didampingi 1 orang pendamping di lokasi" : "bekerja bersama kru resmi"}. Hak tayang citra diri terbatas pada media dan durasi yang diatur dalam Pasal 5 Perjanjian ini.
                  </li>
                )}
                {isMua && (
                  <li>
                    <strong>Ketentuan Khusus MUA</strong>: Beban rias dibatasi maksimal {terms.roleSpecifics.maxHeadsIncluded || 1} orang talent. Penambahan orang dikenakan biaya Rp {terms.roleSpecifics.extraHeadFee || "250.000"}/orang. Wajib tersedia alokasi waktu persiapan {terms.roleSpecifics.prepTimeRequired || "90-120 menit"} sebelum pengambilan gambar.
                  </li>
                )}
                {isStylist && (
                  <li>
                    <strong>Ketentuan Khusus Stylist</strong>: Biaya deposit peminjaman busana butik ditalangi oleh PIHAK PERTAMA. Kerusakan/noda busana akibat sesi menjadi tanggung jawab PIHAK PERTAMA selaku penyelenggara produksi.
                  </li>
                )}
                {isStudio && (
                  <li>
                    <strong>Ketentuan Khusus Studio</strong>: Kapasitas kru maksimal {terms.roleSpecifics.maxCrewCapacity || 15} orang. {terms.roleSpecifics.cycloramaShoeTapeRequired ? "Kru dan talent wajib melapisi sol sepatu luar dengan lakban kertas atau memakai alas kaki khusus studio demi menjaga kebersihan cyclorama." : "Menjaga kebersihan area studio."}
                  </li>
                )}
                {isVideographer && (
                  <li>
                    <strong>Ketentuan Khusus Videografi</strong>: Luaran video sesuai rasio ({terms.roleSpecifics.aspectRatiosIncluded || "16:9 Landscape & 9:16 Vertikal"}). {terms.roleSpecifics.musicLicenseIncluded ? "Sudah termasuk royalti musik komersial standar." : "Lisensi musik komersial khusus disediakan oleh PIHAK PERTAMA."}
                  </li>
                )}
                {isDesigner && (
                  <li>
                    <strong>Ketentuan Khusus Desainer Busana (Fashion Designer)</strong>: {terms.roleSpecifics.fittingPolicy || "Fitting busana dilakukan H-1 atau di lokasi sebelum sesi dimulai"}. {terms.roleSpecifics.dryCleaningResponsibility || "Biaya laundry/dry cleaning busana pasca-sesi ditanggung oleh PIHAK PERTAMA selaku peminjam/penyelenggara"}. {terms.roleSpecifics.noAlteringPolicy || "Dilarang memotong, mengubah jahitan, atau merusak siluet busana tanpa izin tertulis desainer"}. Hak cipta desain dan pola tetap melekat pada desainer, dan PIHAK PERTAMA wajib mencantumkan tag/kredit nama desainer pada seluruh materi publikasi.
                  </li>
                )}
                {isPhotographer && (
                  <li>
                    <strong>Ketentuan Khusus Fotografi</strong>: {terms.roleSpecifics.rawFilePolicy || "PIHAK KEDUA menyerahkan hasil kurasi akhir beresolusi tinggi (JPEG/TIFF). Penyerahan file master mentah (RAW) memerlukan adendum kesepakatan terpisah."}
                  </li>
                )}
              </ol>
            </div>

            <div className="space-y-1.5 border border-amber-300 p-3.5 bg-amber-50/50">
              <h3 className="font-bold text-amber-950 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-700" />
                <span>PASAL 5: HAK CIPTA, LISENSI PENGGUNAAN (USAGE RIGHTS), DAN HAK CITRA DIRI</span>
              </h3>
              <ol className="list-decimal pl-5 space-y-1 text-stone-800 text-[11px]">
                <li>
                  <strong>Kepemilikan Hak Cipta</strong>: Hak Cipta (Hak Moral dan Hak Ekonomi Dasar) atas seluruh karya asli foto, rekaman video, rancangan busana, dan hasil kreatif tetap merupakan milik sah dan melekat pada PIHAK KEDUA sebagai Pencipta berdasarkan Undang-Undang No. 28 Tahun 2014 tentang Hak Cipta.
                </li>
                <li>
                  <strong>Ruang Lingkup Lisensi Penggunaan</strong>: PIHAK KEDUA memberikan hak pakai/lisensi non-eksklusif kepada PIHAK PERTAMA khusus untuk media: <strong className="text-stone-950">{getUsageScopeLabel(terms.usageRightsScope)}</strong>.
                </li>
                <li>
                  <strong>Jangka Waktu Lisensi</strong>: Lisensi penayangan berlaku selama <strong className="text-stone-950">{getUsageDurationLabel(terms.usageRightsDuration)}</strong> terhitung sejak tanggal pelunasan biaya jasa diselesaikan penuh.
                </li>
                <li>
                  <strong>Hak Citra Diri (Likeness Rights)</strong>: Khusus talenta model, penayangan wajah, postur tubuh, dan citra diri dibatasi hanya pada ruang lingkup media dan durasi yang disepakati di atas. Penggunaan untuk keperluan di luar cakupan ini wajib memperoleh persetujuan tertulis terpisah.
                </li>
                <li>
                  <strong>Sanksi Pelanggaran Lisensi Komersial</strong>: Apabila PIHAK PERTAMA menayangkan, mendistribusikan, atau mengalihkan karya melampaui ruang lingkup media atau masa berlaku tanpa persetujuan tertulis dari PIHAK KEDUA (seperti menayangkan di iklan berbayar/billboard luar ruang tanpa lisensi komersial), maka PIHAK PERTAMA wajib membayar biaya lisensi komersial tambahan (*Extended Commercial License Fee*) sebesar <strong>200% dari total nilai jasa</strong>.
                </li>
              </ol>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-stone-950 text-xs uppercase tracking-wide">
                PASAL 6: PEMBATALAN, KETIDAKHADIRAN, DAN JAMINAN REFUND DUA ARAH
              </h3>
              <ol className="list-decimal pl-5 space-y-1 text-stone-700 text-[11px]">
                <li>
                  <strong>Jaminan untuk PIHAK PERTAMA (Garansi Anti No-Show)</strong>: Apabila PIHAK KEDUA berhalangan hadir pada tanggal pelaksanaan tanpa menyediakan pengganti dengan kualifikasi setara yang disetujui PIHAK PERTAMA, maka seluruh Uang Muka (DP) yang telah dibayarkan wajib dikembalikan <strong>100% penuh</strong> kepada PIHAK PERTAMA paling lambat 1x24 jam.
                </li>
                <li>
                  <strong>Jaminan untuk PIHAK KEDUA (Perlindungan Slot Jadwal)</strong>: Apabila pembatalan sepihak dilakukan oleh PIHAK PERTAMA dalam waktu kurang dari 48 (empat puluh delapan) jam sebelum jadwal pelaksanaan, maka Uang Muka (DP) dinyatakan <strong>hangus</strong> sebagai kompensasi atas hari kerja yang telah dialokasikan dan hilangnya kesempatan menerima pekerjaan lain.
                </li>
              </ol>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-stone-950 text-xs uppercase tracking-wide">
                PASAL 7: KEADAAN MEMAKSA (FORCE MAJEURE)
              </h3>
              <p className="text-[11px] text-stone-700">
                Dalam hal terjadi peristiwa di luar kendali PARA PIHAK seperti bencana alam, kebakaran, kerusuhan massal, kecelakaan fatal, atau sakit mendadak yang dibuktikan dengan surat keterangan resmi rumah sakit, PARA PIHAK sepakat untuk menjadwalkan ulang (*reschedule*) pelaksanaan pekerjaan tanpa dikenakan penalti.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-stone-950 text-xs uppercase tracking-wide">
                PASAL 8: PENYELESAIAN PERSELISIHAN &amp; KETENTUAN HUKUM
              </h3>
              <ol className="list-decimal pl-5 space-y-1 text-stone-700 text-[11px]">
                <li>
                  Segala perselisihan yang timbul dari pelaksanaan Perjanjian ini akan diselesaikan terlebih dahulu melalui musyawarah mufakat secara kekeluargaan, dengan difasilitasi oleh platform RAMU sebagai penyedia catatan jejak digital (*audit trail*).
                </li>
                <li>
                  Perjanjian ini tunduk pada hukum positif Negara Republik Indonesia, khususnya Kitab Undang-Undang Hukum Perdata (KUHPerdata) Pasal 1320 dan Pasal 1338, Undang-Undang No. 28 Tahun 2014 tentang Hak Cipta, serta Undang-Undang No. 11 Tahun 2008 jo. UU No. 1 Tahun 2024 tentang Informasi dan Transaksi Elektronik (UU ITE).
                </li>
              </ol>
            </div>
          </div>

          <div className="pt-6 border-t-2 border-stone-900 space-y-4">
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Demikian Surat Perjanjian Kerja Sama Jasa ini dibuat dan disetujui secara sadar, sukarela, dan tanpa paksaan oleh PARA PIHAK melalui persetujuan digital di platform RAMU. Dokumen elektronik ini memiliki kekuatan hukum yang sah dan mengikat kedua belah pihak sejak tanggal diterbitkan.
            </p>

            <div className="grid grid-cols-2 gap-8 pt-4">

              <div className="text-center space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  PIHAK PERTAMA (Pemberi Kerja)
                </div>
                <div className="h-16 flex flex-col items-center justify-center border border-dashed border-stone-300 rounded-xl bg-stone-50 p-2">
                  <span className="text-[9px] font-mono text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
                    DISETUJUI DIGITAL VIA RAMU
                  </span>
                  <span className="text-[9px] text-stone-400 font-mono mt-1">
                    Timestamp: {dateObj.toISOString().slice(0, 19).replace("T", " ")} WIB
                  </span>
                </div>
                <div className="font-bold text-stone-950 text-xs border-t border-stone-400 pt-1 mt-1">
                  {booking.requester.name}
                </div>
                <div className="text-[10px] text-stone-500">Pemberi Kerja / Klien</div>
              </div>

              <div className="text-center space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  PIHAK KEDUA (Pelaksana Jasa)
                </div>
                <div className="h-16 flex flex-col items-center justify-center border border-dashed border-stone-300 rounded-xl bg-stone-50 p-2">
                  <span className="text-[9px] font-mono text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
                    TERVERIFIKASI PROTOKOL RAMU
                  </span>
                  <span className="text-[9px] text-stone-400 font-mono mt-1">
                    Ref ID: {booking.id.slice(0, 12)}
                  </span>
                </div>
                <div className="font-bold text-stone-950 text-xs border-t border-stone-400 pt-1 mt-1">
                  {booking.target.name}
                </div>
                <div className="text-[10px] text-stone-500">{booking.target.sector} / Penyedia Jasa</div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-stone-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                <span>Dokumen sah digital &bull; Dicetak secara otomatis dari sistem database RAMU</span>
              </div>
              <div className="font-mono mt-1 sm:mt-0">Kode Hash Validasi: {shortId}-VERIFIED-ID</div>
            </div>
          </div>
        </div>

        <div className="print:hidden px-6 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Dokumen tersimpan aman &amp; mengikat kedua belah pihak di RAMU</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-black text-white rounded-xl font-bold transition-colors cursor-pointer text-xs shadow-xs"
          >
            Tutup Dokumen
          </button>
        </div>
      </div>
    </div>
  );
}
