import React from "react";
import { ArrowRight } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Daftarkan Resource",
      subtitle: "Petakan Yang Dimiliki",
      desc: "Daftarkan aset, peralatan, ruang studio, sampel busana, atau kapasitas waktu idle Anda yang siap dikontribusikan.",
    },
    {
      num: "02",
      title: "Tentukan Kebutuhan",
      subtitle: "Kebutuhan Proyek Jelas",
      desc: "Nyatakan secara terstruktur apa yang Anda butuhkan (fotografer, model, studio, atau MUA) beserta jadwal dan anggaran.",
    },
    {
      num: "03",
      title: "Matching Kompatibel",
      subtitle: "Why This Match?",
      desc: "Sistem deterministik RAMU mencocokkan aset dan kebutuhan secara objektif berdasarkan Resource Fit, Need Coverage, dan Feasibility.",
    },
    {
      num: "04",
      title: "Sepakati Draf Proyek",
      subtitle: "Workspace & Kesepakatan",
      desc: "Bentuk tim di ruang kerja kolaborasi, sepakati draf pembagian peran & hak pakai karya (Agreement Generator).",
    },
    {
      num: "05",
      title: "Catat Dampak Ekonomi",
      subtitle: "Economic Outcome",
      desc: "Eksekusi proyek bersama dan ukur perputaran nilai ekonomi riil serta aktivasi aset yang sebelumnya menganggur.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-6 md:px-10">

        <div className="mb-20">
          <div className="inline-flex items-center gap-3 mb-6">
             <span className="w-8 h-px bg-stone-300"></span>
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
               Alur Kerja Ekonomi Kolaboratif
             </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <h2 className="text-4xl md:text-5xl font-light text-[#1E1B2E] tracking-tight max-w-2xl leading-[1.1]">
              Dari aset menganggur <br/> menjadi <span className="font-serif italic text-stone-500">aktivitas bisnis nyata.</span>
            </h2>
            <p className="text-sm text-stone-500 font-light max-w-sm">
              Lima langkah terstruktur untuk menggabungkan resource yang saling melengkapi antar pelaku kreatif tanpa harus memiliki segalanya sendiri.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 border-t border-stone-200 pt-16">
          {steps.map((step) => (
            <div key={step.num} className="group relative">
              <div className="text-5xl font-light text-stone-200 mb-5 font-serif tracking-tighter group-hover:text-[#1E1B2E] transition-colors duration-500">
                {step.num}
              </div>

              <h3 className="text-base font-bold text-[#1E1B2E] mb-2 tracking-tight">
                {step.title}
              </h3>

              <div className="text-[10px] uppercase tracking-[0.15em] font-semibold text-stone-400 mb-3 pb-3 border-b border-stone-100">
                {step.subtitle}
              </div>

              <p className="text-xs text-stone-500 leading-relaxed font-light">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
