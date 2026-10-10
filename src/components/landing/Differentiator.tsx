import React from "react";
import { Check, X, ShieldCheck, Cpu, Sliders, Scale } from "lucide-react";

export function Differentiator() {
  const dimensions = [
    {
      num: "01",
      weight: "Bobot 40%",
      name: "Resource Fit",
      desc: "Mengevaluasi keselarasan teknis aset fisik: spesifikasi kamera, tata lampu lighting, luasan studio, atau karakter sampel busana terhadap kebutuhan riil proyek.",
      badge: "Kesesuaian Aset",
    },
    {
      num: "02",
      weight: "Bobot 25%",
      name: "Need Coverage",
      desc: "Menghitung rasio pemenuhan kebutuhan kolaborasi (misal 3 dari 3 peran kunci terpenuhi oleh mitra pelengkap = 100% need coverage).",
      badge: "Cakupan Kebutuhan",
    },
    {
      num: "03",
      weight: "Bobot 20%",
      name: "Feasibility Check",
      desc: "Validasi parameter operasional objektif: ketersediaan jadwal, keselarasan domisili/kota pemotretan, dan ambang batas anggaran yang realistis.",
      badge: "Kelayakan Jadwal & Lokasi",
    },
    {
      num: "04",
      weight: "Bobot 15%",
      name: "Readiness Score",
      desc: "Memastikan kelengkapan portofolio terverifikasi, transparansi paket tarif/rate card, dan kesiapan kontak untuk langsung merespons kerja sama.",
      badge: "Kesiapan Kolaborasi",
    },
  ];

  const comparison = [
    {
      feature: "Dasar Pencocokan Mitra",
      traditional: "Pencarian manual & algoritma rekomendasi bias",
      ramu: "Deterministic Engine objektif (4 pilar matematika)",
    },
    {
      feature: "Pemanfaatan Kapasitas Idle",
      traditional: "Tidak terakomodasi (hanya model sewa tarif penuh)",
      ramu: "Mekanisme komplementaritas & bagi hasil aset menganggur",
    },
    {
      feature: "Kesepakatan Hak Cipta & SPK",
      traditional: "Tidak ada standar, rawan sengketa & klaim sepihak",
      ramu: "Generator SPK & Perjanjian Hak Pakai Digital otomatis",
    },
    {
      feature: "Efisiensi Biaya Produksi",
      traditional: "UMKM harus menanggung 100% modal sendiri",
      ramu: "Pangkas hingga 60% biaya dengan sistem komplementer",
    },
    {
      feature: "Biaya Platform & Pendaftaran",
      traditional: "Potongan komisi tinggi per transaksi (15-20%)",
      ramu: "Transparan & bebas biaya pendaftaran awal",
    },
  ];

  return (
    <section id="differentiator" className="py-24 md:py-32 bg-[#FAF8F5] relative">
      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Section Header */}
        <div className="max-w-3xl mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-600 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-600">
              Keunggulan Kompetitif
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-[#1E1B2E] tracking-tight leading-[1.15]">
            Bukan ramalan instan, <br />
            <span className="font-serif italic font-normal text-amber-700/90">
              tetapi kecocokan resource yang terukur.
            </span>
          </h2>

          <p className="mt-4 text-base text-stone-600 font-normal leading-relaxed">
            RAMU meninggalkan spekulasi rekomendasi yang membingungkan. Sistem mengevaluasi kompatibilitas kolaborasi berdasarkan formula deterministik yang transparan, adil, dan dapat diaudit secara objektif.
          </p>
        </div>

        {/* 4 Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {dimensions.map((dim) => (
            <div
              key={dim.name}
              className="bg-white rounded-3xl border border-stone-200/80 p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-stone-900/5 transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-serif font-light text-stone-300 group-hover:text-amber-600 transition-colors">
                    {dim.num}
                  </span>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                    {dim.weight}
                  </span>
                </div>

                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  {dim.badge}
                </div>

                <h3 className="text-lg font-bold text-[#1E1B2E] tracking-tight mb-3">
                  {dim.name}
                </h3>

                <p className="text-xs text-stone-600 leading-relaxed font-normal">
                  {dim.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-semibold text-stone-700">Formula Deterministik</span>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table: Marketplace Biasa vs RAMU */}
        <div className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xl shadow-stone-900/5">
          <div className="p-6 sm:p-8 border-b border-stone-100 bg-stone-50/50">
            <h3 className="text-xl sm:text-2xl font-bold text-[#1E1B2E] tracking-tight">
              Mengapa Berkolaborasi Lewat RAMU?
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 font-light mt-1">
              Perbandingan mendasar pendekatan RAMU dengan cara konvensional di industri kreatif.
            </p>
          </div>

          <div className="divide-y divide-stone-100 overflow-x-auto">
            <div className="grid grid-cols-12 p-4 text-[11px] font-bold uppercase tracking-wider text-stone-400 bg-stone-50 min-w-[600px]">
              <div className="col-span-4">Dimensi Evaluasi</div>
              <div className="col-span-4 text-stone-500">Platform Konvensional</div>
              <div className="col-span-4 text-emerald-700 font-extrabold">RAMU Ecosystem</div>
            </div>

            {comparison.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 p-4 sm:p-5 text-xs items-center hover:bg-stone-50/60 transition-colors min-w-[600px]"
              >
                <div className="col-span-4 font-bold text-[#1E1B2E]">
                  {row.feature}
                </div>
                <div className="col-span-4 text-stone-500 font-light flex items-center gap-2 pr-4">
                  <X className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{row.traditional}</span>
                </div>
                <div className="col-span-4 text-stone-800 font-medium flex items-center gap-2 pr-4 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/60">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{row.ramu}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
