"use client";

import React, { useState } from "react";
import {
  Wind,
  Droplets,
  Volume2,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Check,
  Camera,
  Layers,
  Wrench,
} from "lucide-react";

export interface ServiceOptionItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  estimatedPrice: string;
  category: string;
}

const DEFAULT_OPTIONS: ServiceOptionItem[] = [
  {
    id: "ac-not-cooling",
    title: "AC is not cooling",
    description: "Unit menyala normal namun hanya menghembuskan angin tanpa rasa dingin.",
    icon: Wind,
    estimatedPrice: "Rp 125.000",
    category: "Cooling Issue",
  },
  {
    id: "water-leakage",
    title: "Water leakage from unit",
    description: "Tetesan air keluar dari indoor unit dan membasahi dinding atau lantai.",
    icon: Droplets,
    estimatedPrice: "Rp 150.000",
    category: "Drainage Issue",
  },
  {
    id: "unusual-noise",
    title: "Unusual noise or vibration",
    description: "Terdengar suara berderit kasar atau getaran blower yang mengganggu.",
    icon: Volume2,
    estimatedPrice: "Rp 140.000",
    category: "Mechanical Issue",
  },
  {
    id: "routine-maintenance",
    title: "Routine maintenance & cleaning",
    description: "Pembersihan evaporator, filter debu, dan pengecekan tekanan freon berkala.",
    icon: Sparkles,
    estimatedPrice: "Rp 95.000",
    category: "General Care",
  },
];

export function GlassServiceBookingFlow() {
  const [selectedId, setSelectedId] = useState<string>("ac-not-cooling");
  const [scheduledDate, setScheduledDate] = useState<string>("Besok, 09:00 WIB");
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  const activeOption = DEFAULT_OPTIONS.find((opt) => opt.id === selectedId) || DEFAULT_OPTIONS[0];

  return (
    <div className="w-full max-w-4xl mx-auto py-6 space-y-6">
      {/* Header Banner */}
      <div className="text-center space-y-2 max-w-lg mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#4CC9FE]/15 text-[#0284c7] border border-[#4CC9FE]/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Glassmorphism Design System</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
          Pilih Masalah &amp; Jadwalkan Layanan
        </h1>
        <p className="text-sm text-[#4B5563] leading-relaxed">
          Pilih kendala yang Anda alami di bawah ini. Kartu transparan dengan efek aurora mesh gradient akan merespon interaksi Anda.
        </p>
      </div>

      {/* Main Grid: Options on Left/Top, Summary on Right/Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Service Options Grid (8 Cols) */}
        <div className="lg:col-span-8 space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
              Opsi Masalah (Klik untuk Memilih)
            </span>
            <span className="text-xs text-[#4B5563]">
              {DEFAULT_OPTIONS.length} Pilihan Layanan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {DEFAULT_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedId === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(option.id);
                    setIsConfirmed(false);
                  }}
                  className={`text-left rounded-[22px] p-5 transition-all cursor-pointer flex flex-col justify-between gap-4 relative overflow-hidden group ${
                    isSelected
                      ? "glass-card active ring-2 ring-[#4CC9FE]/40"
                      : "glass-card hover:bg-white/70"
                  }`}
                >
                  {/* Top Bar with Icon Wrapper & Selection Radio */}
                  <div className="flex items-start justify-between w-full">
                    {/* Icon Wrapper: Solid / High-Opacity White Circle */}
                    <div className="glass-icon-wrapper w-11 h-11 shrink-0">
                      <Icon className={`w-5 h-5 transition-colors duration-200 ${isSelected ? "text-[#0284c7]" : "text-[#4B5563]"}`} />
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-200 ${
                        isSelected
                          ? "bg-[#4CC9FE] border-[#4CC9FE] text-white shadow-xs scale-105"
                          : "border-white/80 bg-white/60 text-transparent group-hover:border-[#4CC9FE]/50"
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${isSelected ? "animate-check-pop" : ""}`} strokeWidth={3} />
                    </div>
                  </div>

                  {/* Text Content with High-Contrast Typography (No Information Truncation) */}
                  <div className="space-y-1.5 w-full">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284c7]">
                      {option.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-[#111827] leading-snug">
                      {option.title}
                    </h3>
                    <p className="text-xs text-[#4B5563] leading-relaxed">
                      {option.description}
                    </p>
                  </div>

                  {/* Price Tag Footer */}
                  <div className="pt-2.5 border-t border-white/60 flex items-center justify-between text-xs w-full">
                    <span className="text-[#4B5563] font-medium">Mulai dari</span>
                    <span className="font-bold text-[#111827] tabular-nums text-sm">
                      {option.estimatedPrice}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Booking Summary Panel (4 Cols) */}
        <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-4">
          <div className="glass-card space-y-4">
            <div className="border-b border-white/70 pb-3">
              <h2 className="text-sm font-bold text-[#111827] tracking-tight">
                Ringkasan Pemesanan
              </h2>
              <p className="text-xs text-[#4B5563] mt-0.5">
                Estimasi penanganan teknisi terstandarisasi
              </p>
            </div>

            {/* Selected Service Breakdown (No truncation, neat natural wrap) */}
            <div className="p-3.5 rounded-[18px] bg-white/70 border border-white/90 space-y-2.5">
              <div className="flex items-start justify-between gap-2 text-xs">
                <span className="text-[#4B5563] shrink-0 font-medium">Layanan Dipilih:</span>
                <span className="font-bold text-[#111827] text-right leading-snug">
                  {activeOption.title}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#4B5563] font-medium">Kategori:</span>
                <span className="font-semibold text-[#0284c7]">{activeOption.category}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#4B5563] font-medium">Jadwal Kunjungan:</span>
                <span className="font-semibold text-[#111827] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {scheduledDate}
                </span>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between text-[#4B5563]">
                <span>Biaya Jasa Dasar</span>
                <span className="font-semibold text-[#111827]">{activeOption.estimatedPrice}</span>
              </div>
              <div className="flex items-center justify-between text-[#4B5563]">
                <span>Biaya Platform &amp; Garansi</span>
                <span className="font-semibold text-emerald-600">Gratis (SPK Terlindungi)</span>
              </div>
              <div className="border-t border-white/70 pt-2 flex items-center justify-between text-sm">
                <span className="font-bold text-[#111827]">Total Estimasi</span>
                <span className="font-extrabold text-base text-[#111827] tabular-nums">
                  {activeOption.estimatedPrice}
                </span>
              </div>
            </div>

            {/* Guarantees */}
            <div className="p-3 rounded-[16px] bg-[#4CC9FE]/10 border border-[#4CC9FE]/30 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-[#0284c7] font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Jaminan Garansi 30 Hari</span>
              </div>
              <p className="text-[11px] text-[#4B5563] leading-relaxed">
                Pekerjaan dilindungi Surat Perjanjian Kerja (SPK) digital dan garansi perbaikan ulang tanpa biaya tambahan.
              </p>
            </div>

            {/* Confirm Action Button: Pill Shape, Solid Blue, White Text */}
            <button
              type="button"
              onClick={() => setIsConfirmed(true)}
              className="btn-primary-pill w-full py-3.5 px-6 text-sm font-bold flex items-center justify-center gap-2"
            >
              <span>{isConfirmed ? "Pesanan Dikonfirmasi!" : "Confirm Booking"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {isConfirmed && (
              <div className="p-3 rounded-[16px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-xs text-center font-medium animate-fade-in">
                Teknisi telah dialokasikan untuk jadwal <strong>{scheduledDate}</strong>.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
