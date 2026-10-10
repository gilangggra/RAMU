"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Apakah mendaftar dan memetakan aset di RAMU dikenakan biaya?",
      a: "Sama sekali tidak. Pendaftaran akun, pemetaan aset idle (ruang studio, peralatan kamera, sampel busana), serta penelusuran direktori talenta 100% gratis. RAMU berkomitmen memberdayakan UMKM kreatif Indonesia untuk saling mengaktivasi kapasitas sumber daya tanpa hambatan finansial.",
    },
    {
      q: "Bagaimana perlindungan hak cipta dan kepemilikan karya foto/video?",
      a: "Setiap kolaborasi di RAMU dilengkapi dengan generator SPK (Surat Perjanjian Kerja) dan Kesepakatan Hak Pakai Digital otomatis. Sebelum pemotretan dimulai, seluruh pihak menyepakati klausul hak cipta, hak komersial publikasi, kredit nama pada media sosial/media cetak, dan batas penggunaan secara legal dan mengikat.",
    },
    {
      q: "Apa perbedaan mendasar RAMU dengan platform freelance biasa (seperti Upwork/Fiverr)?",
      a: "Platform freelance umum hanya memfasilitasi transaksi moneter jual-beli jasa standar. RAMU dirancang khusus untuk ekonomi kolaboratif komplementer industri kreatif: memungkinkan utilisasi dan sharing aset terukur (misal: utilisasi slot studio kosong untuk pemotretan lookbook bersama), pencocokan deterministik berbasis 4 pilar objektif tanpa bias, serta ruang kerja terpadu dari pra-produksi hingga rilis.",
    },
    {
      q: "Bagaimana jika salah satu mitra membatalkan jadwal pemotretan secara sepihak?",
      a: "Di dalam SPK digital RAMU terdapat klausul perlindungan rescheduling dan pinalti komitmen. Sistem juga mencatat riwayat pemenuhan komitmen setiap kreator pada Profil Terverifikasi untuk menjaga integritas ekosistem secara berkelanjutan dan meminimalisir risiko ghosting.",
    },
    {
      q: "Siapa saja yang dapat bergabung ke dalam ekosistem RAMU?",
      a: "RAMU terbuka untuk seluruh rantai nilai industri kreatif: Fashion Brand & UMKM Pakaian, Fotografer Komersial/Editorial, Studio Foto & Daylight Venue, Model Profesional, Fashion Stylist & MUA, serta Videografer & Content Creator visual.",
    },
    {
      q: "Bagaimana cara kerja pencocokan 4 pilar di RAMU?",
      a: "Algoritma deterministik RAMU menghitung skor kompatibilitas (0-100%) berdasarkan 4 parameter riil: Resource Fit (40%), Need Coverage (25%), Feasibility Jadwal & Lokasi (20%), serta Readiness Profil (15%). Rekomendasi dihitung murni secara matematis sehingga Anda hanya dipasangkan dengan mitra yang saling melengkapi.",
    },
  ];

  return (
    <section id="faq" className="py-20 sm:py-28 bg-white relative border-b border-stone-200/60 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#4CC9FE]/08 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-10 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4CC9FE]/15 border border-[#4CC9FE]/30 text-[#0284c7] mb-4 shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-[#4CC9FE] shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#27213D]">
              Pertanyaan yang Sering Diajukan (FAQ)
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#27213D] tracking-tight leading-[1.12]">
            Segala hal yang perlu <br />
            <span className="text-[#4CC9FE]">Anda ketahui tentang RAMU.</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#716B7E] font-normal leading-relaxed">
            Jawaban transparan atas pertanyaan seputar operasional, hak cipta, dan keamanan kolaborasi di platform kami.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-stone-200/80 rounded-[22px] overflow-hidden transition-all bg-[#FAF8F5] hover:border-stone-300"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-[#27213D] tracking-tight">
                    {faq.q}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                    isOpen 
                      ? "rotate-180 bg-[#4CC9FE] text-white" 
                      : "bg-white border border-stone-200 text-stone-600"
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 pt-1 text-xs sm:text-sm text-stone-600 font-normal leading-relaxed border-t border-stone-200/60 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
