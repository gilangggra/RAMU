"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Calendar, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { createBookingRequest } from "@/app/api/bookings/actions";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetName: string;
  targetSector: string;
  targetType: string;
}

export function BookingModal({
  isOpen,
  onClose,
  targetId,
  targetName,
  targetSector,
  targetType,
}: BookingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Common Fields
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");

  // Dynamic Fields
  const [details, setDetails] = useState<Record<string, string>>({});

  const todayStr = new Date().toISOString().split("T")[0];

  function handleClose() {
    setIsSuccess(false);
    setIsLoading(false);
    setStartDate("");
    setEndDate("");
    setBudget("");
    setDetails({});
    setErrorMessage(null);
    onClose();
  }

  if (!isOpen) return null;

  function handleDetailChange(key: string, value: string) {
    setDetails((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const result = await createBookingRequest({
      targetId,
      startDate,
      endDate: endDate || undefined,
      budget,
      details,
    });

    setIsLoading(false);
    if (result.success) {
      setIsSuccess(true);
    } else {
      setErrorMessage(result.error || "Gagal mengirim permintaan.");
    }
  }

  // Polymorphic rendering based on type/sector
  const renderDynamicFields = () => {
    // 1. Studio / Space Rental
    if (targetType === "STUDIO") {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Tipe Ruangan/Studio</label>
            <input
              type="text"
              placeholder="Misal: Studio A, Podcast Room"
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.roomType || ""}
              onChange={(e) => handleDetailChange("roomType", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Kebutuhan Tambahan (Add-ons)</label>
            <input
              type="text"
              placeholder="Misal: Tambahan Lighting, Stylist, dll"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.addons || ""}
              onChange={(e) => handleDetailChange("addons", e.target.value)}
            />
          </div>
        </div>
      );
    }

    // 2. Talent / Model
    if (targetSector.toLowerCase().includes("model") || targetSector.toLowerCase().includes("talent")) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Peran / Karakter</label>
            <input
              type="text"
              placeholder="Misal: Model Casual, Pemeran Utama"
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.role || ""}
              onChange={(e) => handleDetailChange("role", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Hak Penggunaan (Usage Rights)</label>
            <input
              type="text"
              placeholder="Misal: Social Media Selamanya, TVC 1 Tahun"
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              value={details.usageRights || ""}
              onChange={(e) => handleDetailChange("usageRights", e.target.value)}
            />
          </div>
        </div>
      );
    }

    // 3. Jasa Produksi (Fotografer, Videografer, MUA, dll) -> Default Fallback
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Lokasi Pelaksanaan</label>
          <input
            type="text"
            placeholder="Misal: Studio Indoor, Jakarta Selatan"
            required
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            value={details.location || ""}
            onChange={(e) => handleDetailChange("location", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Output yang Diharapkan</label>
          <textarea
            placeholder="Misal: 50 Foto Edit, 1 Video Reels"
            required
            rows={2}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
            value={details.deliverables || ""}
            onChange={(e) => handleDetailChange("deliverables", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Link Referensi Visual (Opsional)</label>
          <input
            type="url"
            placeholder="Link Pinterest / Google Drive"
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            value={details.referenceUrl || ""}
            onChange={(e) => handleDetailChange("referenceUrl", e.target.value)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#27213D]/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200/60 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-black tracking-tight text-[#1E1B2E]">
              {targetType === "STUDIO" ? "Sewa Ruang Studio" : "Sewa Jasa Profesional (Direct Hire)"}
            </h2>
            <p className="text-xs text-stone-500 mt-1">Penugasan komersial langsung untuk {targetName}</p>
          </div>
          <button onClick={handleClose} className="p-2 text-stone-400 hover:text-[#1E1B2E] hover:bg-stone-100 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Distinction Notice Banner */}
        <div className="bg-amber-50/70 border-b border-amber-200/60 px-6 py-2.5 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-[11px] text-amber-900">
            Form ini untuk <strong>penugasan berbayar langsung</strong>. Jika ingin kolaborasi karya / TFP / bagi hasil:
          </span>
          <Link
            href={`/projects/new?partnerId=${targetId}&partnerName=${encodeURIComponent(targetName)}`}
            onClick={handleClose}
            className="text-[11px] font-bold text-[#E66A48] hover:underline whitespace-nowrap shrink-0"
          >
            Ajak ke Project Brief &rarr;
          </Link>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-fade-in">
              {errorMessage}
            </div>
          )}

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1E1B2E] mb-2">Permintaan Terkirim!</h3>
                <p className="text-sm text-stone-500 max-w-xs mx-auto">
                  {targetName} akan menerima notifikasi booking Anda. Anda dapat memantau statusnya di Dashboard.
                </p>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/dashboard/bookings"
                  onClick={handleClose}
                  className="w-full sm:w-auto px-6 py-3 bg-[#1E1B2E] text-white rounded-xl text-sm font-bold hover:bg-black transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Pantau Status di Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleClose}
                  className="w-full sm:w-auto px-6 py-3 bg-stone-100 text-stone-700 rounded-xl text-sm font-bold hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          ) : (
            <form id="booking-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Common Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Mulai *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="date"
                      required
                      min={todayStr}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Selesai (Opsional)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="date"
                      min={startDate || todayStr}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Penawaran Budget (Opsional)</label>
                <input
                  type="text"
                  placeholder="Misal: Rp 5.000.000 atau Rate Standar"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-[#1E1B2E] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>

              <hr className="border-stone-100" />
              
              {/* Dynamic Polymorphic Fields */}
              {renderDynamicFields()}

            </form>
          )}
        </div>

        {/* Footer */}
        {!isSuccess && (
          <div className="px-6 py-4 border-t border-stone-200/60 bg-stone-50/50 flex justify-end shrink-0 gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-3 rounded-xl text-sm font-bold text-stone-600 hover:text-[#1E1B2E] hover:bg-stone-200/50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              form="booking-form"
              disabled={isLoading}
              className="px-8 py-3 bg-[#1E1B2E] hover:bg-black text-white rounded-xl text-sm font-bold tracking-wide transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                "Kirim Permintaan"
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
