import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative pt-32 pb-20 md:pt-44 md:pb-32 bg-[#FFFDFC] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-6 flex flex-col space-y-8 z-10 relative">
            <div className="inline-flex items-center gap-3">
               <span className="w-8 h-px bg-stone-300"></span>
               <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
                 Ekosistem Kreatif Eksklusif
               </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-[#1E1B2E] tracking-tight leading-[1.05]">
              Produksi <br />
              <span className="font-serif italic text-stone-500">visual</span> kelas dunia.
            </h1>

            <p className="text-base sm:text-lg text-stone-500 font-light leading-relaxed max-w-md">
              Temukan dan kolaborasi dengan desainer busana, fotografer editorial, model, dan studio visual terverifikasi. RAMU merangkai produksi tingkat tinggi dengan transparansi mutlak.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-5">
              <Link
                href="/register"
                className="px-8 py-4 rounded-full bg-[#1E1B2E] hover:bg-black text-white font-semibold text-xs tracking-widest uppercase transition-all flex items-center gap-3 group shadow-xl shadow-black/10"
              >
                <span>Mulai Sekarang</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/directory"
                className="px-8 py-4 rounded-full bg-transparent hover:bg-stone-50 border border-stone-200 text-[#1E1B2E] font-semibold text-xs tracking-widest uppercase transition-all"
              >
                Jelajahi Direktori
              </Link>
            </div>
          </div>

          {/* Right Visual Content (High-End Photographic Grid) */}
          <div className="lg:col-span-6 relative mt-10 lg:mt-0">
            <div className="absolute inset-0 bg-stone-100 rounded-[40px] rotate-3 scale-105 -z-10 transition-transform duration-700 hover:rotate-6"></div>
            <div className="grid grid-cols-2 gap-4 h-[400px] md:h-[550px] p-4 bg-white rounded-[40px] shadow-2xl border border-stone-100">
              
              {/* Image 1: Fashion / Model */}
              <div className="col-span-1 rounded-[28px] overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop" 
                  alt="Fashion Model Editorial" 
                  className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  loading="eager"
                />
              </div>

              {/* Image 2 & 3 Column */}
              <div className="col-span-1 grid grid-rows-2 gap-4">
                <div className="row-span-1 rounded-[28px] overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1600508774634-4e11d34730e2?q=80&w=800&auto=format&fit=crop" 
                    alt="Photography Studio" 
                    className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    loading="lazy"
                  />
                </div>
                <div className="row-span-1 rounded-[28px] overflow-hidden relative bg-[#1E1B2E] flex flex-col items-center justify-center p-6 text-center shadow-inner">
                  <div className="space-y-1">
                    <div className="text-4xl sm:text-5xl font-light text-white">96%</div>
                    <div className="text-[9px] uppercase tracking-[0.2em] text-stone-400 font-semibold">Tingkat Keselarasan</div>
                  </div>
                  <div className="absolute bottom-4 w-12 h-1 bg-stone-800 rounded-full" />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
