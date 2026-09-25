import React from "react";
import { Sparkles } from "lucide-react";

export function Differentiator() {
  const dimensions = [
    {
      name: "Sinergi Aset",
      desc: "Menghubungkan aset lintas sektor tanpa duplikasi fungsional.",
    },
    {
      name: "Kelayakan Operasional",
      desc: "Sinkronisasi kapasitas, skala waktu, dan jadwal produksi nyata.",
    },
    {
      name: "Visi Komersial",
      desc: "Arah kreatif dan target penetrasi pasar yang beresonansi.",
    },
    {
      name: "Pemenuhan Kebutuhan",
      desc: "Barter kapasitas produksi secara transparan dan proporsional.",
    },
    {
      name: "Akurasi Eksekusi",
      desc: "Pembagian beban kerja dan milestone rilis yang terstruktur.",
    },
    {
      name: "Optimalisasi Utilisasi",
      desc: "Mengaktifkan stok pasif dan kapasitas kreatif laten menjadi valuasi.",
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
                 Pergeseran Paradigma
               </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light text-[#1E1B2E] tracking-tight leading-[1.1] mb-6">
              Bukan tentang <span className="font-serif italic text-stone-500">siapa</span> yang Anda kenal.
            </h2>
            <p className="text-lg text-stone-500 font-light leading-relaxed">
              Jejaring sosial hanya memberi Anda daftar kontak. RAMU adalah mesin sintesis—menganalisis kapasitas Anda dan merangkai tim kolaborator ideal berdasarkan metrik kecocokan 6-dimensi.
            </p>
          </div>
          
          <div className="lg:w-1/3 flex flex-col justify-end lg:pt-20">
            <div className="text-6xl font-light text-[#1E1B2E] tracking-tighter mb-2">6</div>
            <div className="text-xs uppercase tracking-[0.2em] font-semibold text-stone-400">Dimensi Evaluasi</div>
            <p className="text-sm text-stone-500 mt-4 font-light">Setiap potensi kolaborasi dievaluasi secara presisi sebelum direkomendasikan.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-12">
          {dimensions.map((dim, idx) => (
            <div key={dim.name} className="group relative">
              <div className="text-3xl font-light text-stone-200 mb-4 font-serif group-hover:text-stone-800 transition-colors duration-500">
                0{idx + 1}
              </div>
              <h3 className="text-lg font-medium text-[#1E1B2E] mb-2 tracking-tight">
                {dim.name}
              </h3>
              <p className="text-sm text-stone-500 leading-relaxed font-light">
                {dim.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
