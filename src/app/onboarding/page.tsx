import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { createActorProfile } from "@/app/onboarding/actions";
import { Navbar } from "@/components/landing/Navbar";
import { AlertCircle, MapPin, ChevronDown, Sparkles, Building, Globe, Phone, ArrowRight, ArrowLeft } from "lucide-react";

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
  const userInitialRole = user.user_metadata?.role || "Kriya & Kerajinan";
  const userInitialLocation = user.user_metadata?.location || "Jakarta, Indonesia";

  const sectors = [
    "Kriya & Kerajinan",
    "Fashion & Tekstil",
    "Produksi Visual",
    "Desain Komunikasi Visual",
    "Desain Produk",
    "Kriya Logam & Perhiasan",
    "Kuliner Kreatif",
    "Musik & Pertunjukan",
    "Lainnya",
  ];

  const popularLocations = [
    "Jakarta, Indonesia",
    "DI Yogyakarta, Indonesia",
    "Bandung, Jawa Barat",
    "Pekalongan, Jawa Tengah",
    "Surakarta (Solo), Jawa Tengah",
    "Denpasar, Bali",
    "Surabaya, Jawa Timur",
    "Jepara, Jawa Tengah",
    "Semarang, Jawa Tengah",
    "Medan, Sumatera Utara",
    "Padang, Sumatera Barat",
    "Makassar, Sulawesi Selatan",
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
            style={{
              background: "radial-gradient(circle at 35% 30%, #FFF2EB 0%, #FFAF94 60%, #E66A48 100%)",
            }}
          />
        </div>

        <div className="absolute top-36 right-20 z-10 animate-float-delayed">
          <div
            className="w-14 h-14 rounded-full shadow-[0_14px_28px_rgba(167,139,250,0.35)]"
            style={{
              background: "radial-gradient(circle at 32% 28%, #FFFFFF 0%, #C4B5FD 55%, #7C3AED 100%)",
            }}
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
            Lengkapi Profil Kreatif Anda
          </h1>
          <p className="text-xs sm:text-sm text-[#716B7E] mb-6 leading-relaxed">
            Identitas brand kreatif, keahlian, dan workshop Anda digunakan oleh Engine RAMU untuk merumuskan sinergi kolaborasi bisnis bilateral.
          </p>

          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{error}</p>
            </div>
          )}

          <form action={createActorProfile} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
              >
                Nama Studio / Profil *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={userInitialName}
                placeholder="misal: Studio Kriya Nusantara / Budi Santoso"
                className="w-full px-4 py-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] placeholder-[#716B7E]/60 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all font-medium"
              />
            </div>

            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#27213D]">
                Subsektor Kreatif Utama *
              </label>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {sectors.map((sec) => (
                  <label
                    key={sec}
                    className="cursor-pointer select-none"
                  >
                    <input
                      type="radio"
                      name="sector"
                      value={sec}
                      defaultChecked={sec === userInitialRole}
                      className="sr-only peer"
                    />
                    <span className="inline-block px-4 py-2 rounded-full text-xs font-medium bg-[#FAF8F5] text-[#27213D] border border-stone-200/80 hover:bg-[#FFF7ED] hover:border-[#F9D8C4] peer-checked:bg-[#27213D] peer-checked:text-[#FFFDFC] peer-checked:border-2 peer-checked:border-[#27213D] peer-checked:font-bold shadow-xs transition-all">
                      {sec}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="bio"
                className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
              >
                Bio / Fokus Karya Studio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                placeholder="Ceritakan tentang karya, material yang biasa Anda olah, atau fokus kolaborasi yang Anda cari..."
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] placeholder-[#716B7E]/60 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all font-medium resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="location"
                  className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
                >
                  Kota / Sentra Kriya *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#716B7E]">
                    <MapPin className="w-4 h-4 text-[#27213D]" />
                  </div>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    required
                    defaultValue={userInitialLocation}
                    placeholder="misal: Jakarta, Indonesia atau DI Yogyakarta"
                    list="locations-list"
                    className="w-full pl-10 pr-10 py-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] placeholder-[#716B7E]/60 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all font-medium"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#716B7E]">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                  <datalist id="locations-list">
                    {popularLocations.map((loc) => (
                      <option key={loc} value={loc} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="address"
                  className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
                >
                  Alamat Workshop / Studio
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#716B7E]">
                    <Building className="w-4 h-4 text-[#27213D]" />
                  </div>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Nama jalan / kompleks studio..."
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] placeholder-[#716B7E]/60 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="websiteUrl"
                  className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
                >
                  Website / Portofolio (opsional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#716B7E]">
                    <Globe className="w-4 h-4 text-[#27213D]" />
                  </div>
                  <input
                    id="websiteUrl"
                    name="websiteUrl"
                    type="url"
                    placeholder="https://instagram.com/studioanda"
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] placeholder-[#716B7E]/60 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="contactPhone"
                  className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
                >
                  WhatsApp / Telepon (opsional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#716B7E]">
                    <Phone className="w-4 h-4 text-[#27213D]" />
                  </div>
                  <input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    placeholder="+62 812-3456-7890"
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] placeholder-[#716B7E]/60 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="actorType"
                className="block text-xs font-bold uppercase tracking-wider text-[#27213D]"
              >
                Bentuk Entitas *
              </label>
              <select
                id="actorType"
                name="actorType"
                defaultValue="STUDIO"
                className="w-full px-4 py-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-sm text-[#27213D] focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 focus:bg-white transition-all font-medium cursor-pointer"
              >
                <option value="INDIVIDUAL">Individu / Freelancer / Kreator Mandiri</option>
                <option value="STUDIO">Studio Kreatif / Workshop Mandiri</option>
                <option value="MSME">UMKM / Bisnis Berbadan Hukum</option>
                <option value="COLLECTIVE">Komunitas / Kolektif Seni</option>
              </select>
            </div>

            <div className="pt-4">
              <div className="h-1.5 bg-stone-200/60 rounded-full w-full overflow-hidden mb-6">
                <div className="h-full bg-[#FFB800] rounded-full w-full" />
              </div>

              <div className="flex items-center justify-between">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-[#27213D] text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Lewati</span>
                </Link>

                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-full bg-[#FFB800] hover:bg-[#FFA800] active:scale-[0.98] text-[#1E1B2E] text-xs sm:text-sm font-extrabold shadow-[0_8px_24px_rgba(255,184,0,0.35)] transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
                >
                  <span>Selesaikan & Buka Workspace</span>
                  <ArrowRight className="w-4 h-4 text-[#1E1B2E]" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <footer className="relative z-10 border-t border-stone-200/60 py-6 text-center text-xs text-[#716B7E] bg-white/40 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} RAMU — Creative Opportunity Engine. Hak cipta dilindungi.</span>
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
