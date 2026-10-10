"use client";

import React from "react";
import { 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  FileWarning, 
  XCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Coins
} from "lucide-react";
import Link from "next/link";

export function ProblemSection() {
  const painPoints = [
    {
      icon: Coins,
      tag: "Hambatan Finansial",
      metric: "Rp 15Jt – 35Jt",
      title: "Biaya Produksi Visual Terlalu Mahal",
      desc: "UMKM fashion dan brand independen sering terhambat memproduksi lookbook berkualitas karena biaya sewa studio daylight, tarif fotografer, dan sewa gear kamera yang membebani kas.",
      impact: "Lookbook tertunda, katalog seadanya, potensi penjualan terbuang.",
    },
    {
      icon: Clock,
      tag: "Inefisiensi Aset",
      metric: "65% Waktu Idle",
      title: "Studio & Peralatan Menganggur di Hari Kerja",
      desc: "Pemilik daylight studio dan fotografer profesional memiliki gear sinema berharga puluhan juta yang hanya tersimpan di lemari saat hari kerja tanpa utilisasi aktif.",
      impact: "Depresiasi aset tanpa pendapatan, biaya operasional tetap berjalan.",
    },
    {
      icon: FileWarning,
      tag: "Kerentanan Hukum",
      metric: "Tanpa SPK",
      title: "Kolaborasi Informal Rawan Sengketa & Ghosting",
      desc: "Kesepakatan kolaborasi informal via chat sosial media kerap berakhir dengan pembatalan sepihak, sengketa kepemilikan hak cipta karya komersial, atau kredit publikasi yang diabaikan.",
      impact: "Karya disalahgunakan, waktu terbuang, tidak ada perlindungan hukum.",
    },
    {
      icon: TrendingDown,
      tag: "Pencocokan Spekulatif",
      metric: "Berminggu-minggu",
      title: "Pencarian Mitra Sangat Lama & Tidak Presisi",
      desc: "Menghubungi satu per satu fotografer, model, dan stylist secara acak menghabiskan waktu tanpa jaminan keselarasan visi artistik, jadwal, dan kapasitas resource.",
      impact: "Proses pra-produksi berlarut-larut dan hasil produksi tidak maksimal.",
    },
  ];

  return (
    <section id="problem" className="py-20 sm:py-28 bg-[#FAF8F5] relative border-y border-stone-200/60 overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[450px] h-[450px] bg-red-100/30 rounded-full blur-[130px]" />
        <div className="absolute -bottom-20 right-10 w-[400px] h-[400px] bg-[#4CC9FE]/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-10 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 mb-4 shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Tantangan Nyata Industri Kreatif
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#27213D] tracking-tight leading-[1.12]">
            Banyak karya hebat gagal terwujud <br className="hidden sm:block" />
            bukan karena kekurangan talenta, <br className="hidden sm:block" />
            tetapi <span className="text-rose-600">sumber daya yang terfragmentasi.</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#716B7E] font-normal leading-relaxed">
            Industri fashion dan visual Indonesia terjebak dalam paradoks: di satu sisi biaya produksi melangit, sementara di sisi lain ratusan studio foto dan gear kamera menganggur tanpa sinergi.
          </p>
        </div>

        {/* 4 Pain Points Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {painPoints.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-[24px] border border-stone-200/80 p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-stone-900/5 hover:-translate-y-1 transition-all duration-300 relative group"
              >
                <div>
                  {/* Card Header & Metric Tag */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 bg-rose-50/80 px-2.5 py-1 rounded-full border border-rose-100">
                      {item.metric}
                    </span>
                  </div>

                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                    {item.tag}
                  </div>

                  <h3 className="text-base font-bold text-[#27213D] tracking-tight leading-snug mb-3">
                    {item.title}
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed font-normal mb-4">
                    {item.desc}
                  </p>
                </div>

                {/* Impact footer callout */}
                <div className="pt-3 border-t border-stone-100 text-[11px] text-rose-800 bg-rose-50/50 p-2.5 rounded-xl font-medium leading-tight">
                  <span className="font-bold">Dampak:</span> {item.impact}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contrast Comparison Banner: Sebelum vs Bersama RAMU */}
        <div className="mt-12 sm:mt-16 bg-white rounded-[28px] border border-stone-200/90 p-6 sm:p-8 shadow-xl shadow-stone-900/5">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4CC9FE]">
              Transformasi Ekosistem
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#27213D] tracking-tight mt-1">
              Perbedaan Nyata Sebelum &amp; Sesudah RAMU
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Sebelum RAMU */}
            <div className="p-5 sm:p-6 rounded-2xl bg-rose-50/40 border border-rose-200/60 space-y-3.5">
              <div className="flex items-center gap-2 text-rose-700 font-extrabold text-sm uppercase tracking-wider">
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Tanpa RAMU (Cara Lama)</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Bayar tarif penuh sewa studio Rp 1.500.000/jam dari kantong sendiri.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Gear kamera &amp; studio menganggur berhari-hari tanpa menghasilkan apapun.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Hanya mengandalkan chat DM tanpa kontrak SPK legal yang mengikat.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Risiko pembatalan sepihak dan sengketa hak pakai komersial.</span>
                </li>
              </ul>
            </div>

            {/* Bersama RAMU */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#4CC9FE]/10 border border-[#4CC9FE]/30 space-y-3.5">
              <div className="flex items-center gap-2 text-[#0284c7] font-extrabold text-sm uppercase tracking-wider">
                <CheckCircle2 className="w-5 h-5 text-[#4CC9FE] shrink-0" />
                <span>Bersama RAMU (Solusi Cerdas)</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[#27213D]">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span><strong>Efisiensi 50% - 65% modal</strong> dengan kolaborasi kapasitas terukur.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span><strong>Aktivasi aset idle 100%</strong> menjadi portofolio dan kredit karya bernilai tinggi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span><strong>Generator SPK Digital otomatis</strong> melindungi hak cipta dan komitmen jadwal.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span><strong>Pencocokan 4 Pilar Deterministik</strong> menjamin mitra yang saling melengkapi.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
