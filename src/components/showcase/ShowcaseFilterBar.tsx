"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { Search } from "lucide-react";

const SHOWCASE_CATEGORIES = [
  { id: "ALL", label: "Semua Koleksi" },
  { id: "Fotografi", label: "Fotografi" },
  { id: "Video Komersial", label: "Video Komersial" },
  { id: "Fashion Styling", label: "Fashion Styling" },
  { id: "Desain Grafis", label: "Desain Grafis" },
  { id: "3D & Animasi", label: "3D & Animasi" },
  { id: "Lainnya", label: "Lainnya" },
];

export function ShowcaseFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get("category") || "ALL";
  const initialSearch = searchParams.get("q") || "";

  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const updateQuery = (updates: { category?: string; q?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (updates.category !== undefined) {
      if (updates.category === "ALL") params.delete("category");
      else params.set("category", updates.category);
    }
    
    if (updates.q !== undefined) {
      if (!updates.q) params.delete("q");
      else params.set("q", updates.q);
    }

    startTransition(() => {
      router.push(`/showcase?${params.toString()}`);
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (searchParams.get("q") || "")) {
        updateQuery({ q: searchTerm });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchParams]);

  return (
    <div className="relative mb-8 z-20">
      {/* Top Search Bar Row */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className={`w-5 h-5 transition-colors ${isPending ? 'text-amber-500 animate-pulse' : 'text-[#1E1B2E]'}`} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari gaya visual, nama karya, atau nama kreator..."
          className="w-full pl-12 pr-4 py-4 sm:py-5 bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl sm:rounded-[32px] text-sm sm:text-base text-[#1E1B2E] placeholder-stone-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-amber-400/20 shadow-[0_8px_30px_rgba(39,33,61,0.04)] font-medium transition-all"
        />
      </div>

      {/* Categories Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {SHOWCASE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => updateQuery({ category: category.id })}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                currentCategory === category.id
                  ? "bg-[#1E1B2E] text-white"
                  : "bg-transparent text-stone-500 hover:bg-stone-100"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
