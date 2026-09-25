import React from "react";
import { ArrowRight } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Curation & Setup",
      subtitle: "Petakan Yang Dimiliki",
      desc: "Daftarkan portofolio, koleksi busana, atau fasilitas studio Anda. Kurasi aset visual Anda untuk menunjukkan standar estetika dan kapasitas profesional yang nyata.",
    },
    {
      num: "02",
      title: "Algorithmic Synergy",
      subtitle: "Matriks Deterministik",
      desc: "Sistem RAMU secara deterministik mencocokkan gaya visual, ketersediaan jadwal, dan kapasitas teknis untuk merangkai tim kolaborasi yang sempurna tanpa bias.",
    },
    {
      num: "03",
      title: "Production Blueprint",
      subtitle: "Cetak Biru Siap Eksekusi",
      desc: "Terima blueprint produksi lengkap: mulai dari moodboard selaras, pembagian kredit (HKI) yang adil, hingga rincian teknis untuk eksekusi yang mulus.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Header Section */}
        <div className="mb-20">
          <div className="inline-flex items-center gap-3 mb-6">
             <span className="w-8 h-px bg-stone-300"></span>
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
               Metodologi Produksi
             </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <h2 className="text-4xl md:text-5xl font-light text-[#1E1B2E] tracking-tight max-w-2xl leading-[1.1]">
              Merangkai talenta terkurasi <br/> menjadi <span className="font-serif italic text-stone-500">kampanye nyata.</span>
            </h2>
            <p className="text-sm text-stone-500 font-light max-w-sm">
              Kami membuang proses pencarian acak dan komunikasi tak berujung, menggantinya dengan alur kerja terstruktur yang presisi.
            </p>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 border-t border-stone-200 pt-16">
          {steps.map((step) => (
            <div key={step.num} className="group relative">
              <div className="text-6xl md:text-7xl font-light text-stone-200 mb-6 font-serif tracking-tighter group-hover:text-[#1E1B2E] transition-colors duration-500">
                {step.num}
              </div>
              
              <h3 className="text-xl font-medium text-[#1E1B2E] mb-3 tracking-tight">
                {step.title}
              </h3>
              
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-400 mb-4 pb-4 border-b border-stone-100">
                {step.subtitle}
              </div>

              <p className="text-sm text-stone-500 leading-relaxed font-light">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
