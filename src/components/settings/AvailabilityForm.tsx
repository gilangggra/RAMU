"use client";

import React, { useState } from "react";
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  Cloud,
  ExternalLink,
  ShieldCheck,
  Save,
} from "lucide-react";
import { updateAvailabilitySettingsAction } from "@/app/settings/actions";

export interface AvailabilityData {
  isAvailable?: boolean;
  statusNote?: string;
  timezone?: string;
  operationalHours?: string;
  defaultStorageUrl?: string;
}

interface AvailabilityFormProps {
  initialData?: AvailabilityData | null;
}

export function AvailabilityForm({ initialData }: AvailabilityFormProps) {
  const [isAvailable, setIsAvailable] = useState<boolean>(
    initialData?.isAvailable !== undefined ? initialData.isAvailable : true
  );
  const [statusNote, setStatusNote] = useState(initialData?.statusNote || "");
  const [timezone, setTimezone] = useState(initialData?.timezone || "WIB");
  const [operationalHours, setOperationalHours] = useState(initialData?.operationalHours || "08:00 - 18:00");
  const [defaultStorageUrl, setDefaultStorageUrl] = useState(initialData?.defaultStorageUrl || "");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("isAvailable", String(isAvailable));
    formData.append("statusNote", statusNote);
    formData.append("timezone", timezone);
    formData.append("operationalHours", operationalHours);
    formData.append("defaultStorageUrl", defaultStorageUrl);

    const res = await updateAvailabilitySettingsAction(formData);
    setIsLoading(false);

    if (res.success) {
      setMessage({ type: "success", text: res.message || "Pengaturan ketersediaan berhasil diperbarui." });
    } else {
      setMessage({ type: "error", text: res.error || "Gagal memperbarui ketersediaan." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Header Info */}
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-700" />
          <span>Ketersediaan &amp; Jam Operasional</span>
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Atur status ketersediaan kerja, jadwal respons harian, dan folder penyimpanan cloud default untuk serah terima file proyek.
        </p>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium animate-fade-in ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Availability Status Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-2">
            Status Menerima Tawaran Pekerjaan (Booking Availability)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsAvailable(true)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                isAvailable
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 shrink-0 animate-pulse" />
              <div>
                <div className="font-bold text-xs">Tersedia untuk Job Baru</div>
                <div className={`text-[10px] mt-0.5 leading-relaxed ${isAvailable ? "text-slate-300" : "text-slate-400"}`}>
                  Profil aktif di direktori dan klien dapat mengajukan pesanan SPK.
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsAvailable(false)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                !isAvailable
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 mt-1 shrink-0" />
              <div>
                <div className="font-bold text-xs">Sedang Penuh / Cuti</div>
                <div className={`text-[10px] mt-0.5 leading-relaxed ${!isAvailable ? "text-slate-300" : "text-slate-400"}`}>
                  Tombol booking dinonaktifkan sementara agar jadwal Anda tidak terganggu.
                </div>
              </div>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Catatan Ketersediaan Khusus (Tampil di Profil)</span>
          </label>
          <input
            type="text"
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            placeholder="Contoh: Buka slot mulai 12 Oktober, domisili on-set di Jakarta &amp; Bandung..."
            className="w-full px-3 py-2 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden transition-all"
          />
        </div>
      </div>

      {/* Operational Hours & Timezone */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Zona Waktu Operasional</span>
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden transition-all"
            >
              <option value="WIB">WIB (UTC+7 — Jakarta, Bandung, Surabaya)</option>
              <option value="WITA">WITA (UTC+8 — Bali, Lombok, Makassar)</option>
              <option value="WIT">WIT (UTC+9 — Maluku, Papua)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Jam Koordinasi Kerja (Call Sheet / Messenger)</span>
            </label>
            <input
              type="text"
              value={operationalHours}
              onChange={(e) => setOperationalHours(e.target.value)}
              placeholder="Contoh: 08:00 - 18:00"
              className="w-full px-3 py-2 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-slate-400" />
            <span>Folder Google Drive / Dropbox Bawaan untuk Serah Terima</span>
          </label>
          <input
            type="url"
            value={defaultStorageUrl}
            onChange={(e) => setDefaultStorageUrl(e.target.value)}
            placeholder="https://drive.google.com/drive/folders/..."
            className="w-full px-3 py-2 rounded-xl bg-slate-50/60 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden transition-all"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            Tautan ini otomatis disediakan saat tugas &ldquo;Penyerahan File Master&rdquo; diselesaikan di ruang kolaborasi.
          </p>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 text-slate-300" />
              <span>Simpan Ketersediaan</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
