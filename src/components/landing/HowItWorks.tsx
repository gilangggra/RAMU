import React from "react";
import { 
  Boxes, 
  Target, 
  Cpu, 
  FileText, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2 
} from "lucide-react";
import Link from "next/link";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: Boxes,
      badge: "Inventarisasi Aset",
      title: "Petakan Resource Anda",
      desc: "Daftarkan aset fisik (kamera, lighting, ruang studio, sampel busana) atau kapasitas waktu idle yang siap Anda kolaborasikan.",
      example: "Contoh: Studio Daylight 120m² menganggur setiap Selasa & Kamis.",
    },
    {
      num: "02",
      icon: Target,
      badge: "Spesifikasi Kebutuhan",
      title: "Tentukan Kebutuhan Proyek",
      desc: "Nyatakan secara terstruktur peran yang Anda cari (fotografer editorial, model, stylist) lengkap dengan tanggal, moodboard, dan target.",
      example: "Contoh: Butuh fotografer analog untuk lookbook 10 looks musim semi.",
    },
    {
      num: "03",
      icon: Cpu,
      badge: "Mesin Deterministik",
      title: "Algoritma Pencocokan 4 Pilar",
      desc: "Sistem objektif RAMU menghitung kompatibilitas berdasarkan Resource Fit, Need Coverage, Feasibility, dan Readiness Score.",
      example: "Skor dihitung matematis tanpa halusinasi AI atau subjektivitas.",
    },
    {
      num: "04",
      icon: FileText,
      badge: "Proteksi Legalitas",
      title: "Generate SPK & Hak Cipta",
      desc: "Sepakati pembagian peran, hak pakai karya komersial, kredit publikasi, dan royalti secara otomatis dengan generator SPK digital.",
      example: "Karya aman, hak cipta jelas bagi brand maupun para kreator.",
    },
    {
      num: "05",
      icon: TrendingUp,
      badge: "Dampak Riil",
      title: "Eksekusi & Catat Hasil Bisnis",
      desc: "Jalankan produksi di ruang kolaborasi terpadu, unggah karya ke Showcase, dan catat efisiensi nilai ekonomi yang berhasil diaktivasi.",
      example: "Hemat hingga 60% biaya produksi dengan hasil karya kelas atas.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-stone-50/70 border-b border-stone-200/60 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Section Header */}
        <div className="max-w-3xl mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-600 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-600">
              Alur Kerja Terstruktur
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-[#1E1B2E] tracking-tight leading-[1.15]">
            Dari aset menganggur menjadi <br className="hidden sm:block" />
            <span className="font-serif italic font-normal text-amber-700/90">aktivitas bisnis yang menguntungkan.</span>
          </h2>

          <p className="mt-4 text-base text-stone-600 font-normal leading-relaxed">
            Lima tahapan teruji untuk menggabungkan sumber daya kreatif yang saling melengkapi tanpa harus memikul seluruh modal produksi sendiri.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="group bg-white rounded-[24px] border border-stone-200/80 p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-stone-900/5 hover:-translate-y-1 transition-all duration-300 relative"
              >
                {/* Step Header */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-light font-serif text-stone-400 group-hover:text-amber-600 transition-colors">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-[#1E1B2E] group-hover:bg-[#1E1B2E] group-hover:text-amber-300 transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded-md w-fit mb-3">
                    {step.badge}
                  </div>

                  <h3 className="text-base font-bold text-[#1E1B2E] tracking-tight mb-2.5">
                    {step.title}
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed font-normal mb-4">
                    {step.desc}
                  </p>
                </div>

                {/* Example Callout */}
                <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-600 bg-stone-50/60 p-2.5 rounded-xl font-normal leading-snug">
                  {step.example}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-[#1E1B2E] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-stone-900/10">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-lg font-bold tracking-tight text-white">
              Siap memetakan aset atau mencari mitra pelengkap?
            </div>
            <div className="text-xs text-stone-300 font-normal">
              Daftar dalam 2 menit dan sistem akan langsung menganalisis potensi kompatibilitas Anda.
            </div>
          </div>
          <Link
            href="/register"
            className="px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold tracking-wider uppercase transition-all shadow-md shrink-0 flex items-center gap-2"
          >
            <span>Daftar Profil Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
