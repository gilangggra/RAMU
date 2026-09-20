import React from "react";
import {
  Sparkles,
  Layers,
  Briefcase,
  Gem,
  Camera,
  Zap,
  ArrowRight,
  ArrowDown,
  Check,
} from "lucide-react";

function IsolatedSilosVectorDiagram() {
  return (
    <div className="w-full bg-[#FAF8F5] rounded-xl p-3 border border-stone-200/60 my-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-mono font-bold tracking-wider text-[#716B7E] uppercase">
          Topologi Terpisah
        </span>
        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200/60">
          Terisolasi (0% Sinergi)
        </span>
      </div>
      <svg
        viewBox="0 0 280 70"
        className="w-full h-16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="45" y1="35" x2="95" y2="35" stroke="#27213D" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.2" />
        <path d="M68 31L72 39M72 31L68 39" stroke="#E11D48" strokeWidth="1.2" strokeLinecap="round" />

        <line x1="125" y1="35" x2="175" y2="35" stroke="#27213D" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.2" />
        <path d="M148 31L152 39M152 31L148 39" stroke="#E11D48" strokeWidth="1.2" strokeLinecap="round" />

        <line x1="205" y1="35" x2="255" y2="35" stroke="#27213D" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.2" />
        <path d="M228 31L232 39M232 31L228 39" stroke="#E11D48" strokeWidth="1.2" strokeLinecap="round" />

        <g>
          <circle cx="35" cy="35" r="14" fill="#F4F0FF" stroke="#27213D" strokeWidth="1.2" />
          <path d="M29 35H41M35 29V41" stroke="#27213D" strokeWidth="1" strokeOpacity="0.4" />
          <text x="35" y="58" fontSize="6.5" fontWeight="bold" fill="#716B7E" textAnchor="middle">WASTRA</text>
        </g>

        <g>
          <circle cx="115" cy="35" r="14" fill="#FFF3EB" stroke="#27213D" strokeWidth="1.2" />
          <rect x="110" y="30" width="10" height="10" rx="2" fill="#F9D8C4" />
          <text x="115" y="58" fontSize="6.5" fontWeight="bold" fill="#716B7E" textAnchor="middle">KULIT</text>
        </g>

        <g>
          <circle cx="195" cy="35" r="14" fill="#EDFAF5" stroke="#27213D" strokeWidth="1.2" />
          <polygon points="195,29 201,39 189,39" fill="#BFE9DD" />
          <text x="195" y="58" fontSize="6.5" fontWeight="bold" fill="#716B7E" textAnchor="middle">KUNINGAN</text>
        </g>

        <g>
          <circle cx="265" cy="35" r="14" fill="#EEF5FD" stroke="#27213D" strokeWidth="1.2" />
          <circle cx="265" cy="35" r="5" fill="#C9DDF8" />
          <text x="265" y="58" fontSize="6.5" fontWeight="bold" fill="#716B7E" textAnchor="middle">STUDIO</text>
        </g>
      </svg>
    </div>
  );
}

function RamuEngineVectorCore() {
  return (
    <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
      <svg
        viewBox="0 0 120 120"
        className="w-28 h-28 absolute inset-0 animate-spin-slow pointer-events-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="60"
          cy="60"
          r="54"
          stroke="#27213D"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          strokeOpacity="0.4"
        />
        <circle cx="60" cy="6" r="3" fill="#FFD45A" stroke="#27213D" strokeWidth="1" />
        <circle cx="114" cy="60" r="3" fill="#BFE9DD" stroke="#27213D" strokeWidth="1" />
        <circle cx="60" cy="114" r="3" fill="#D9D2FF" stroke="#27213D" strokeWidth="1" />
        <circle cx="6" cy="60" r="3" fill="#F9D8C4" stroke="#27213D" strokeWidth="1" />
      </svg>

      <svg
        viewBox="0 0 120 120"
        className="w-20 h-20 absolute inset-4 animate-spin-slow [animation-direction:reverse] pointer-events-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="60"
          cy="60"
          r="42"
          stroke="#27213D"
          strokeWidth="1.2"
          strokeDasharray="2 3"
          strokeOpacity="0.3"
        />
      </svg>

      <div className="w-16 h-16 rounded-2xl bg-[#FFD45A] border-2 border-[#27213D] flex flex-col items-center justify-center shadow-[0_8px_20px_rgba(255,212,90,0.4)] z-10">
        <Zap className="w-7 h-7 text-[#27213D] fill-[#27213D]" />
        <span className="text-[8px] font-mono font-black text-[#27213D] tracking-tighter">
          RAMU
        </span>
      </div>
    </div>
  );
}

function SynthesizedCapsuleVectorBadge() {
  return (
    <div className="w-full bg-white rounded-xl p-3 border border-[#FFD45A]/70 my-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-mono font-bold tracking-wider text-[#27213D] uppercase">
          Sintesis Kolaboratif
        </span>
        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#EDFAF5] text-[#134e40] border border-[#BFE9DD]">
          96% Keselarasan Bilateral
        </span>
      </div>
      <div className="flex items-center gap-3">
        <svg
          viewBox="0 0 64 64"
          className="w-14 h-14 shrink-0"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="14" y="22" width="36" height="34" rx="4" fill="#FFF7ED" stroke="#27213D" strokeWidth="1.5" />
          <path d="M24 22V14C24 10.7 26.7 8 30 8H34C37.3 8 40 10.7 40 14V22" stroke="#27213D" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M14 34H50V52C50 54.2 48.2 56 46 56H18C15.8 56 14 54.2 14 52V34Z" fill="#D9D2FF" stroke="#27213D" strokeWidth="1.2" />
          <path d="M22 34L32 44L42 34M22 44L32 54L42 44" stroke="#27213D" strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round" />
          <circle cx="32" cy="28" r="3" fill="#FFD45A" stroke="#27213D" strokeWidth="1" />
          <rect x="42" y="24" width="8" height="12" rx="1.5" fill="#FFFFFF" stroke="#27213D" strokeWidth="1" transform="rotate(15 42 24)" />
        </svg>

        <div className="space-y-1 min-w-0">
          <div className="text-xs font-bold text-[#27213D] truncate">
            Modern Heritage Capsule
          </div>
          <div className="text-[10px] text-[#716B7E]">
            3 Kreator • 1 Skema Bagi Hasil Adil
          </div>
          <div className="flex h-2 rounded-full overflow-hidden border border-[#27213D]/20 w-36">
            <div className="bg-[#FFD45A] w-[35%]" title="Atelier Batik (35%)" />
            <div className="bg-[#D9D2FF] w-[35%]" title="Pengrajin Kulit (35%)" />
            <div className="bg-[#BFE9DD] w-[30%]" title="Studio Visual (30%)" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Differentiator() {
  const dimensions = [
    {
      name: "Komplementaritas",
      weight: "25%",
      desc: "Sinergi aset lintas sektor tanpa duplikasi",
      color: "bg-[#D9D2FF]",
      glyph: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#27213D]" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="9" cy="12" r="6" strokeDasharray="2 2" />
          <circle cx="15" cy="12" r="6" />
        </svg>
      ),
    },
    {
      name: "Kelayakan Operasional",
      weight: "20%",
      desc: "Kesesuaian lokasi, kapasitas waktu & jadwal kerja",
      color: "bg-[#BFE9DD]",
      glyph: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#134e40]" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4V8M12 16V20M4 12H8M16 12H20" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      name: "Keselarasan Tujuan",
      weight: "15%",
      desc: "Arah komersial & target pasar yang sejalan",
      color: "bg-[#FFD45A]",
      glyph: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#27213D]" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M5 12H19M19 12L13 6M19 12L13 18" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      name: "Pemenuhan Kebutuhan",
      weight: "15%",
      desc: "Menuntaskan kekurangan sumber daya via barter timbal balik",
      color: "bg-[#F9D8C4]",
      glyph: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#27213D]" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="4" y="4" width="7" height="7" rx="1.5" />
          <rect x="13" y="4" width="7" height="7" rx="1.5" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" />
          <rect x="13" y="13" width="7" height="7" rx="1.5" fill="#F9D8C4" />
        </svg>
      ),
    },
    {
      name: "Aksi & Kesiapan",
      weight: "15%",
      desc: "Kejelasan milestone target & pembagian peran tanggung jawab",
      color: "bg-[#F7C8D0]",
      glyph: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#27213D]" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 11L12 14L20 6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 12V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V6C4 4.9 4.9 4 6 4H15" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      name: "Utilisasi Aset",
      weight: "10%",
      desc: "Mengaktifkan stok pasif, peralatan & kapasitas kreatif",
      color: "bg-[#C9DDF8]",
      glyph: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#27213D]" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <section id="differentiator" className="py-24 md:py-32 relative bg-[#FFFDFC]">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF7ED] border border-[#F9D8C4] text-xs font-bold uppercase tracking-wider text-[#27213D]">
            <Sparkles className="w-3.5 h-3.5 text-[#27213D]" />
            <span>Pergeseran Paradigma</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#27213D] tracking-tight leading-tight uppercase">
            Bukan sekadar mencari orang. <br className="hidden sm:inline" />
            <span className="text-[#27213D] underline decoration-[#FFD45A] decoration-wavy decoration-2">
              Temukan apa yang bisa diciptakan bersama.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-[#716B7E] leading-relaxed">
            Jejaring konvensional hanya memberi daftar kontak tanpa ujung dan obrolan canggung.
            RAMU mengevaluasi kecocokan komplementer dan menyintesis cetak biru bisnis nyata.
          </p>
        </div>

        <div className="relative rounded-[32px] bg-gradient-to-br from-[#FFF7ED] via-white to-[#F4F0FF] border border-stone-200/80 p-8 md:p-12 shadow-[0_12px_40px_rgba(39,33,61,0.05)] mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center">
            <div className="lg:col-span-4 rounded-2xl bg-white p-6 border border-stone-200/70 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#716B7E]">
                  Titik Awal
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-[#27213D]">
                  Aset Terisolasi
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#27213D]">Apa yang Anda Miliki</h3>
              <p className="text-xs text-[#716B7E]">
                Kapasitas dan sumber daya laten yang menunggu mitra kreatif yang tepat:
              </p>

              <IsolatedSilosVectorDiagram />

              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F4F0FF] text-xs font-semibold text-[#27213D]">
                  <div className="w-7 h-7 rounded-lg bg-[#D9D2FF] flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4 text-[#27213D]" />
                  </div>
                  <div>
                    <div className="font-bold">Batik Pekalongan</div>
                    <div className="text-[10px] text-[#716B7E]">Motif wastra warisan nusantara</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FFF3EB] text-xs font-semibold text-[#27213D]">
                  <div className="w-7 h-7 rounded-lg bg-[#F9D8C4] flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-[#27213D]" />
                  </div>
                  <div>
                    <div className="font-bold">Kulit Samak Nabati</div>
                    <div className="text-[10px] text-[#716B7E]">Pemotongan & jahitan kriya artisan</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#EDFAF5] text-xs font-semibold text-[#27213D]">
                  <div className="w-7 h-7 rounded-lg bg-[#BFE9DD] flex items-center justify-center shrink-0">
                    <Gem className="w-4 h-4 text-[#134e40]" />
                  </div>
                  <div>
                    <div className="font-bold">Perhiasan Perak & Kuningan</div>
                    <div className="text-[10px] text-[#716B7E]">Finishing logam cor artisan</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#EEF5FD] text-xs font-semibold text-[#27213D]">
                  <div className="w-7 h-7 rounded-lg bg-[#C9DDF8] flex items-center justify-center shrink-0">
                    <Camera className="w-4 h-4 text-[#27213D]" />
                  </div>
                  <div>
                    <div className="font-bold">Penceritaan Visual</div>
                    <div className="text-[10px] text-[#716B7E]">Lookbook editorial berkualitas komersial</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 flex flex-col items-center justify-center text-center px-4 py-6 space-y-4">
              <RamuEngineVectorCore />

              <div>
                <div className="text-sm font-black text-[#27213D] tracking-wide uppercase">
                  Mesin RAMU
                </div>
                <div className="text-xs font-semibold text-[#716B7E] mt-0.5">
                  Analisis Komplementaritas
                </div>
              </div>

              <div className="space-y-1.5 w-full max-w-[210px]">
                <div className="text-[10px] font-bold py-1 px-2.5 rounded-full bg-white shadow-xs border border-stone-200 text-[#27213D]">
                  12 Tahap Pencocokan Deterministik
                </div>
                <div className="text-[10px] font-bold py-1 px-2.5 rounded-full bg-white shadow-xs border border-stone-200 text-[#27213D]">
                  Bebas Halusinasi AI
                </div>
                <div className="text-[10px] font-bold py-1 px-2.5 rounded-full bg-white shadow-xs border border-stone-200 text-[#27213D]">
                  Batasan Kelayakan Terverifikasi
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono font-bold text-[#716B7E]">
                <span>MENYINTESIS</span>
                <ArrowRight className="w-4 h-4 text-[#27213D]" />
              </div>
              <div className="lg:hidden flex items-center gap-1.5 text-xs font-mono font-bold text-[#716B7E]">
                <span>MENYINTESIS</span>
                <ArrowDown className="w-4 h-4 text-[#27213D]" />
              </div>
            </div>

            <div className="lg:col-span-4 rounded-2xl bg-white p-6 border border-stone-200/70 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#134e40]">
                  Hasil Sintesis
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#EDFAF5] text-[#134e40] border border-[#BFE9DD]">
                  Siap Rilis
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#27213D]">Apa yang Bisa Diciptakan</h3>
              <p className="text-xs text-[#716B7E]">
                Rilis komersial bernilai tinggi dengan struktur sinergi siap negosiasi:
              </p>

              <SynthesizedCapsuleVectorBadge />

              <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-[#FFD45A]/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#27213D]">
                    Kolaborasi Terpadu
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFD45A] text-[#27213D]">
                    Bernilai Tinggi
                  </span>
                </div>
                <div className="text-base font-bold text-[#27213D]">
                  Modern Heritage Capsule Collection
                </div>
                <ul className="text-xs text-[#716B7E] space-y-1.5">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#134e40]" />
                    <span>3 pelaku kreatif komplementer selaras</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#134e40]" />
                    <span>Model pembagian hasil yang adil terpetakan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#134e40]" />
                    <span>Paket lookbook promosi bersama disertakan</span>
                  </li>
                </ul>
              </div>

              <div className="text-[11px] text-[#716B7E] italic text-center">
                &ldquo;Dari bahan kriya menganggur menjadi rilis kreatif skala nasional.&rdquo;
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-[#27213D]">
              Kerangka Penilaian Objektif 6 Dimensi
            </h3>
            <p className="text-xs text-[#716B7E] mt-1">
              Setiap potensi sinergi dinilai secara sistematis untuk memastikan kelayakan kedua belah pihak.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {dimensions.map((dim) => (
              <div
                key={dim.name}
                className="p-4 rounded-2xl bg-white border border-stone-200/70 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-8 h-8 rounded-xl ${dim.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      {dim.glyph}
                    </div>
                    <span className="text-xs font-black text-[#27213D] font-mono">
                      {dim.weight}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#27213D]">
                    {dim.name}
                  </div>
                </div>
                <p className="text-[10px] text-[#716B7E] mt-2 leading-relaxed">
                  {dim.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
