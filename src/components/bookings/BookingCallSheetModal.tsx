"use client";

import React, { useState, useRef } from "react";
import {
  Clock,
  MapPin,
  Calendar,
  Users,
  Phone,
  FileText,
  Download,
  Copy,
  Check,
  X,
  Share2,
  Sparkles,
  AlertCircle,
  Building2,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
} from "lucide-react";
import { exportElementToPdf } from "@/lib/export/pdfExporter";
import { BookingSpkData } from "@/components/bookings/SpkAgreementModal";
import { toast } from "@/components/ui/Toast";

export interface RundownItem {
  id: string;
  time: string;
  activity: string;
  parties: string;
  notes?: string;
}

export interface PicContact {
  id: string;
  role: string;
  name: string;
  phone: string;
}

export interface BookingCallSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingSpkData;
}

export function BookingCallSheetModal({
  isOpen,
  onClose,
  booking,
}: BookingCallSheetModalProps) {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const details = (typeof booking.details === "object" && booking.details !== null)
    ? (booking.details as Record<string, any>)
    : {};

  const projectTitle = details?.projectTitle || details?.conceptSummary || `Sesi Produksi ${booking.target.name}`;
  const locationName = details?.location || booking.target.location || "Studio Produksi";
  const mapUrl = details?.mapUrl || "";
  const shiftHours = details?.agreedTerms?.shiftHours || details?.hours || 8;

  const dateObj = new Date(booking.startDate);
  const formattedDate = dateObj.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const spkNomorResmi = `SPK-RAMU-${booking.id.slice(0, 8).toUpperCase()}`;

  // Default PIC Contacts
  const [picContacts, setPicContacts] = useState<PicContact[]>([
    {
      id: "1",
      role: "Pemberi Kerja / Klien PIC",
      name: booking.requester.name,
      phone: booking.requester.contactPhone || "-",
    },
    {
      id: "2",
      role: `Penyedia Jasa (${booking.target.sector})`,
      name: booking.target.name,
      phone: booking.target.contactPhone || "-",
    },
    {
      id: "3",
      role: "Studio / Wardrobe On-Set Handler",
      name: details?.wardrobePic || "PIC Studio & Wardrobe",
      phone: details?.wardrobePhone || "-",
    },
  ]);

  // Default Rundown Timetable
  const [rundownList, setRundownList] = useState<RundownItem[]>([
    {
      id: "1",
      time: "07:00 - 07:30",
      activity: "Loading Alat & Wardrobe Setup",
      parties: "Tim Stylist & Asisten Fotografer",
      notes: "Unpacking sampel busana brand & penataan hanger",
    },
    {
      id: "2",
      time: "07:30 - 09:00",
      activity: "MUA & Hair Styling (Model Call Time)",
      parties: "Model & Makeup Artist (MUA)",
      notes: "Persiapan rias wajah & tatanan rambut sesuai moodboard",
    },
    {
      id: "3",
      time: "08:30 - 09:15",
      activity: "Lighting Setup & Test Shot Framing",
      parties: "Fotografer / Videografer & Studio Crew",
      notes: "Kalibrasi warna lighting, test metering & isolasi sol sepatu",
    },
    {
      id: "4",
      time: "09:15 - 12:30",
      activity: "Session 1: First & Second Looks",
      parties: "Seluruh Tim On-Set",
      notes: "Pengambilan gambar busana utama dengan live tethering preview",
    },
    {
      id: "5",
      time: "12:30 - 13:30",
      activity: "Lunch Break & Touch-Up MUA",
      parties: "All Crew",
      notes: "Istirahat makan siang & pengecekan kondisi busana sampel",
    },
    {
      id: "6",
      time: "13:30 - 16:30",
      activity: "Session 2: Third Look & Campaign Videos",
      parties: "Seluruh Tim On-Set",
      notes: "Look penutup, cut-scenes reels media sosial vertikal 9:16",
    },
    {
      id: "7",
      time: "16:30 - 17:30",
      activity: "Wrap Call, Asset Backup & Return Packing",
      parties: "All Crew & Stylist",
      notes: "Verifikasi kelengkapan busana sampel brand & backup kartu memori ganda",
    },
  ]);

  // Outfits / Looks
  const [looksList, setLooksList] = useState<string[]>([
    "Look 1: Signature Capsule Casual (Primary)",
    "Look 2: Evening Monochromatic Statement",
    "Look 3: Detail Close-up Accessories & Footwear",
  ]);

  if (!isOpen) return null;

  function handleAddRundown() {
    const newItem: RundownItem = {
      id: String(Date.now()),
      time: "17:30 - 18:00",
      activity: "Aktivitas Tambahan",
      parties: "Kru Terkait",
      notes: "Catatan teknis",
    };
    setRundownList([...rundownList, newItem]);
  }

  function handleRemoveRundown(id: string) {
    setRundownList(rundownList.filter((r) => r.id !== id));
  }

  function handleUpdateRundown(id: string, field: keyof RundownItem, val: string) {
    setRundownList(
      rundownList.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  }

  // Generate WhatsApp Broadcast Text
  function generateWaBroadcastText(): string {
    const lines = [
      `*OFFICIAL ON-SET CALL SHEET & RUNDOWN*`,
      `*RAMU CREATIVE ECOSYSTEM PROTOCOL*`,
      `---------------------------------------`,
      `*Proyek*: ${projectTitle}`,
      `*Ref SPK*: ${spkNomorResmi}`,
      `*Hari / Tanggal*: ${formattedDate}`,
      `*Lokasi*: ${locationName}`,
      mapUrl ? `*Google Maps*: ${mapUrl}` : "",
      `*Durasi Sesi*: ${shiftHours} Jam`,
      `---------------------------------------`,
      `*EMERGENCY CONTACTS / PIC ON-SET*:`,
      ...picContacts.map((p) => `• ${p.role}: *${p.name}* (${p.phone})`),
      `---------------------------------------`,
      `*RUNDOWN JADWAL KEHADIRAN (CALL TIMES)*:`,
      ...rundownList.map((r) => `*${r.time}* | ${r.activity}\n   _${r.parties}_${r.notes ? `\n   Catatan: ${r.notes}` : ""}`),
      `---------------------------------------`,
      `*DAFTAR LOOKS / OUTFITS*:`,
      ...looksList.map((l, i) => `${i + 1}. ${l}`),
      `---------------------------------------`,
      `*CATATAN PENTING KEPATUHAN ON-SET*:`,
      `1. Hadir tepat waktu sesuai call time masing-masing divisi (Toleransi 15 menit).`,
      `2. Sol sepatu outdoor wajib dilapisi masking tape sebelum menginjak cyclorama studio.`,
      `3. Seluruh sampel busana dijaga dari noda makanan/makeup saat berganti pakaian.`,
      `4. Foto/video BTS dilarang diunggah ke publik sebelum tanggal rilis resmi (Embargo Protocol).`,
      `---------------------------------------`,
      `_Dokumen ini diterbitkan otomatis via RAMU Platform demi kelancaran produksi terkoordinasi._`,
    ];
    return lines.filter(Boolean).join("\n");
  }

  async function handleCopyWa() {
    const text = generateWaBroadcastText();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedWa(true);
      toast.success("Format siaran WhatsApp berhasil disalin ke clipboard!");
      setTimeout(() => setCopiedWa(false), 3000);
    } catch {
      toast.error("Gagal menyalin teks.");
    }
  }

  async function handleExportPdf() {
    if (!printRef.current) return;
    setIsExportingPdf(true);
    try {
      await exportElementToPdf(printRef.current, {
        filename: `CALL-SHEET-${booking.id.slice(0, 8).toUpperCase()}.pdf`,
      });
      toast.success("Lembar Call Sheet berhasil diunduh dalam format PDF!");
    } catch (e) {
      console.error("Gagal ekspor PDF:", e);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-[22px] shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Top Action Toolbar */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                Lembar Panggilan Kerja On-Set (Call Sheet &amp; Rundown)
              </h2>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                {spkNomorResmi} &bull; Standar Produksi Fashion RAMU
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              {isEditing ? "Selesai Mengedit" : "Kustomisasi Rundown"}
            </button>

            <button
              onClick={handleCopyWa}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Salin teks lengkap siap kirim ke WhatsApp Group kru"
            >
              {copiedWa ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedWa ? "Tersalin!" : "Salin ke WhatsApp"}</span>
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span>{isExportingPdf ? "Mencetak..." : "Unduh PDF A4"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60">
          <div
            ref={printRef}
            className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs max-w-3xl mx-auto space-y-6 text-slate-900 text-xs"
          >
            {/* Header Document */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center">
                    R
                  </span>
                  <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                    RAMU CREATIVE ECOSYSTEM
                  </span>
                </div>
                <h1 className="text-lg font-black tracking-tight text-slate-950 uppercase pt-1">
                  OFFICIAL ON-SET PRODUCTION CALL SHEET
                </h1>
                <p className="text-xs text-slate-600 font-medium">{projectTitle}</p>
              </div>

              <div className="text-right space-y-0.5">
                <div className="font-mono font-bold text-xs text-slate-900">{spkNomorResmi}</div>
                <div className="text-[11px] text-slate-500 font-medium">{formattedDate}</div>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[9px] uppercase tracking-wider">
                  SPK Terverifikasi
                </span>
              </div>
            </div>

            {/* Grid Informasi Inti: Lokasi, Jadwal, Durasi */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Lokasi Studio / Venue</span>
                </div>
                <div className="font-bold text-slate-900 text-xs">{locationName}</div>
                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-emerald-700 font-semibold underline inline-flex items-center gap-0.5"
                  >
                    <span>Buka Google Maps</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tanggal &amp; Hari</span>
                </div>
                <div className="font-bold text-slate-900 text-xs">{formattedDate}</div>
                <div className="text-[10px] text-slate-500">Mulai Call: 07:00 WIB</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Alokasi Shift Kerja</span>
                </div>
                <div className="font-bold text-slate-900 text-xs">{shiftHours} Jam Kerja Resmi</div>
                <div className="text-[10px] text-slate-500">Overtime sesuai Pasal 3 SPK</div>
              </div>
            </div>

            {/* PIC Emergency Contacts */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Kontak Darurat &amp; PIC On-Set</span>
                </span>
                <span className="text-[10px] text-slate-400">Harap hubungi PIC jika terjadi keterlambatan</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {picContacts.map((pic, idx) => (
                  <div key={pic.id || idx} className="p-3 bg-white rounded-lg border border-slate-200/90 space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                      {pic.role}
                    </span>
                    <div className="font-bold text-slate-900 text-xs truncate">{pic.name}</div>
                    <div className="font-mono text-[11px] text-emerald-800 font-semibold">{pic.phone}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rundown Tabel */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Rundown Jadwal Harian &amp; Jam Panggilan (Call-Times)</span>
                </span>
                {isEditing && (
                  <button
                    onClick={handleAddRundown}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-900 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Baris</span>
                  </button>
                )}
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="py-2.5 px-3 w-28">Waktu (WIB)</th>
                      <th className="py-2.5 px-3">Agenda / Aktivitas</th>
                      <th className="py-2.5 px-3">Kru / Pihak Terlibat</th>
                      <th className="py-2.5 px-3 hidden sm:table-cell">Catatan Teknis</th>
                      {isEditing && <th className="py-2.5 px-3 w-10 text-center">Hapus</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[11px]">
                    {rundownList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {isEditing ? (
                            <input
                              type="text"
                              value={item.time}
                              onChange={(e) => handleUpdateRundown(item.id, "time", e.target.value)}
                              className="w-full px-1.5 py-1 border border-slate-300 rounded text-xs"
                            />
                          ) : (
                            item.time
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {isEditing ? (
                            <input
                              type="text"
                              value={item.activity}
                              onChange={(e) => handleUpdateRundown(item.id, "activity", e.target.value)}
                              className="w-full px-1.5 py-1 border border-slate-300 rounded text-xs"
                            />
                          ) : (
                            item.activity
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {isEditing ? (
                            <input
                              type="text"
                              value={item.parties}
                              onChange={(e) => handleUpdateRundown(item.id, "parties", e.target.value)}
                              className="w-full px-1.5 py-1 border border-slate-300 rounded text-xs"
                            />
                          ) : (
                            item.parties
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 hidden sm:table-cell">
                          {isEditing ? (
                            <input
                              type="text"
                              value={item.notes || ""}
                              onChange={(e) => handleUpdateRundown(item.id, "notes", e.target.value)}
                              className="w-full px-1.5 py-1 border border-slate-300 rounded text-xs"
                            />
                          ) : (
                            item.notes || "-"
                          )}
                        </td>
                        {isEditing && (
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => handleRemoveRundown(item.id)}
                              className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Outfits / Looks Overview */}
            <div className="space-y-2">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-800 block pb-1 border-b border-slate-200">
                Daftar Busana &amp; Urutan Look (Wardrobe Order)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {looksList.map((look, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] text-slate-800 font-medium">
                    <span className="font-bold text-slate-900 block mb-0.5">Look 0{i + 1}</span>
                    <span>{look}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ketentuan Disiplin On-Set & Embargo */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-[10px] text-amber-950 space-y-1.5">
              <div className="font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>Protokol Keamanan Sampel, Embargo &amp; Fasilitas Studio</span>
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-amber-900">
                <li>
                  <strong>Perlindungan Sampel Busana:</strong> Model &amp; MUA wajib mengenakan robe pelindung selama rias wajah untuk mencegah noda foundation pada gaun/busana sampel brand.
                </li>
                <li>
                  <strong>Kebersihan Cyclorama:</strong> Seluruh kru dan talenta wajib melapisi sol sepatu luar dengan lakban kertas sebelum melangkah ke area latar putih.
                </li>
                <li>
                  <strong>Embargo Rilis:</strong> Dokumentasi di balik layar (BTS) dilarang keras diunggah ke publik sebelum tanggal rilis resmi kampanye.
                </li>
              </ul>
            </div>

            {/* Signatures Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
              <div>
                <span>Diterbitkan resmi oleh <strong>RAMU Production Dispatcher</strong></span>
                <span className="block font-mono text-[9px] text-slate-400">Timestamp: {new Date().toISOString()}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800">Dokumen Acuan Lapangan</span>
                <span className="block text-[9px] text-slate-400">Wajib dipatuhi oleh seluruh kru on-set</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between text-xs shrink-0">
          <p className="text-[11px] text-slate-500">
            Gunakan tombol <strong>Salin ke WhatsApp</strong> untuk siaran cepat ke grup tim produksi.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
