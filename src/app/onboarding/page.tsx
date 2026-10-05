import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { Navbar } from "@/components/landing/Navbar";
import { Sparkles } from "lucide-react";
import { OnboardingClientForm } from "@/components/onboarding/OnboardingClientForm";

interface OnboardingPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const existingActor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id },
  });

  if (existingActor) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const error = params.error;

  const userInitialName = user.user_metadata?.display_name || "";
  const userInitialRole = user.user_metadata?.role || "Fashion Designer / Label";
  const userInitialLocation = user.user_metadata?.location || "Jakarta Selatan, Indonesia";

  const popularLocations = [
    "Jakarta Selatan, Indonesia",
    "Jakarta Pusat, Indonesia",
    "Bandung, Jawa Barat",
    "DI Yogyakarta, Indonesia",
    "Denpasar & Canggu, Bali",
    "Surabaya, Jawa Timur",
    "Surakarta (Solo), Jawa Tengah",
    "Semarang, Jawa Tengah",
    "Medan, Sumatera Utara",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFE9DE] via-[#F3EDFF] via-60% to-[#E2F4FD] text-[#27213D] relative overflow-hidden selection:bg-[#FFB800]/40 selection:text-[#27213D] flex flex-col justify-between">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#FFE4D6] rounded-full blur-[130px] opacity-70" />
        <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-[#EDE8FF] rounded-full blur-[140px] opacity-80" />
        <div className="absolute -bottom-32 left-1/3 w-[550px] h-[550px] bg-[#E0F7F0] rounded-full blur-[130px] opacity-70" />
        <div className="absolute top-24 left-16 z-10 animate-float">
          <div
            className="w-12 h-12 rounded-full shadow-[0_12px_24px_rgba(249,150,120,0.35)]"
            style={{ background: "radial-gradient(circle at 35% 30%, #FFF2EB 0%, #FFAF94 60%, #E66A48 100%)" }}
          />
        </div>
        <div className="absolute top-36 right-20 z-10 animate-float-delayed">
          <div
            className="w-14 h-14 rounded-full shadow-[0_14px_28px_rgba(167,139,250,0.35)]"
            style={{ background: "radial-gradient(circle at 32% 28%, #FFFFFF 0%, #C4B5FD 55%, #7C3AED 100%)" }}
          />
        </div>
      </div>

      <Navbar />

      <div className="relative z-10 w-full max-w-2xl mx-auto pt-32 pb-16 md:pt-40 md:pb-24 px-4 sm:px-6 my-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-[36px] p-8 sm:p-11 shadow-[0_24px_64px_rgba(39,33,61,0.08)] border border-white/80 relative overflow-hidden">
          <div className="absolute top-4 left-4 text-[10px] font-mono font-bold text-[#27213D]/20 select-none">┌</div>
          <div className="absolute top-4 right-4 text-[10px] font-mono font-bold text-[#27213D]/20 select-none">┐</div>
          <div className="absolute bottom-4 left-4 text-[10px] font-mono font-bold text-[#27213D]/20 select-none">└</div>
          <div className="absolute bottom-4 right-4 text-[10px] font-mono font-bold text-[#27213D]/20 select-none">┘</div>

          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF7ED] border border-[#F9D8C4] text-xs font-bold uppercase tracking-wider text-[#27213D] shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#E59F00]" />
              <span>Profil Kreator & Aset</span>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#FAF8F5] border border-stone-200 text-[#27213D]">
              Tahap 2 / 2
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#27213D] tracking-tight mb-1.5">
            Lengkapi Profil Kreatif Fashion & Visual
          </h1>
          <p className="text-xs sm:text-sm text-[#716B7E] mb-6 leading-relaxed">
            Identitas brand, keahlian, dan kapasitas studio Anda diselaraskan oleh Engine RAMU untuk meramu tim kolaborasi editorial dan lookbook.
          </p>

          <OnboardingClientForm
            userInitialName={userInitialName}
            userInitialRole={userInitialRole}
            userInitialLocation={userInitialLocation}
            popularLocations={popularLocations}
            error={error}
          />
        </div>
      </div>

      <footer className="relative z-10 border-t border-stone-200/60 py-6 text-center text-xs text-[#716B7E] bg-white/40 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} RAMU — Platform Kolaborasi Berbasis Komplementaritas Resource. Hak cipta dilindungi.</span>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/" className="hover:text-[#27213D]">Beranda</Link>
            <span>•</span>
            <Link href="/#how-it-works" className="hover:text-[#27213D]">Cara Kerja</Link>
            <span>•</span>
            <Link href="/dashboard" className="hover:text-[#27213D]">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
