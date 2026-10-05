import React from "react";
import { Sparkles } from "lucide-react";

export function Differentiator() {
  const dimensions = [
    {
      name: "Resource Fit (Bobot 40%)",
      desc: "Memeriksa kecocokan aset fisik, perlengkapan kamera/lighting, ruang studio, atau sampel busana yang dimiliki terhadap kebutuhan proyek.",
    },
    {
      name: "Need Coverage (Bobot 25%)",
      desc: "Menghitung berapa banyak kebutuhan proyek yang berhasil dipenuhi oleh mitra kolaborator (misalnya 3 dari 3 kebutuhan tertutupi = 100%).",
    },
    {
      name: "Feasibility Check (Bobot 20%)",
      desc: "Memvalidasi batasan operasional objektif: ketersediaan tanggal kerja sama, keselarasan domisili lokasi, dan batas anggaran.",
    },
    {
      name: "Readiness Score (Bobot 15%)",
      desc: "Memastikan kelengkapan profil, kejelasan spesifikasi teknis, transparansi paket tarif, dan kesiapan kontak untuk berkolaborasi.",
    },
  ];

  return (
    <section id="differentiator" className="py-24 md:py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-20 border-b border-stone-200 pb-20">
          <div className="max-w-2xl">
             <div className="inline-flex items-center gap-3 mb-6">
               <span className="w-8 h-px bg-stone-300"></span>
               <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
                 4 Pilar • Deterministic Resource Compatibility Engine
               </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light text-[#1E1B2E] tracking-tight leading-[1.1] mb-6">
              Bukan ramalan peluang, <br />
              <span className="font-serif italic text-stone-500">tetapi kecocokan resource riil.</span>
            </h2>
            <p className="text-lg text-stone-500 font-light leading-relaxed">
              RAMU membuang spekulasi kecerdasan buatan yang tidak berdasar. Sistem mengevaluasi kompatibilitas antar pelaku kreatif berdasarkan aturan deterministik yang transparan dan dapat ditelusuri datanya.
            </p>
          </div>
          
          <div className="lg:w-1/3 flex flex-col justify-end lg:pt-20">
            <div className="text-6xl font-light text-[#1E1B2E] tracking-tighter mb-2">4</div>
            <div className="text-xs uppercase tracking-[0.2em] font-semibold text-stone-400">Pilar Evaluasi Deterministik</div>
            <p className="text-sm text-stone-500 mt-4 font-light">Setiap kecocokan kolaborasi dihitung dari data konkret tanpa bias atau halusinasi.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {dimensions.map((dim, idx) => (
            <div key={dim.name} className="p-6 rounded-2xl bg-stone-50 border border-stone-200 group relative flex flex-col justify-between">
              <div>
                <div className="text-3xl font-light text-stone-300 mb-4 font-serif group-hover:text-amber-600 transition-colors duration-500">
                  0{idx + 1}
                </div>
                <h3 className="text-base font-bold text-[#1E1B2E] mb-2 tracking-tight">
                  {dim.name}
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed font-light">
                  {dim.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
