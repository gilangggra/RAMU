import Link from "next/link";
import { RegisterClientForm } from "@/components/auth/RegisterClientForm";
import { Navbar } from "@/components/landing/Navbar";

interface RegisterPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const error = params.error;

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

        <div className="absolute bottom-28 right-24 z-10 animate-float">
          <div
            className="w-10 h-10 rounded-full shadow-[0_10px_20px_rgba(255,184,0,0.35)]"
            style={{
              background: "radial-gradient(circle at 35% 30%, #FFFDE6 0%, #FFD45A 60%, #E59F00 100%)",
            }}
          />
        </div>

        <div className="absolute bottom-32 left-20 z-10 animate-float-delayed">
          <div
            className="w-9 h-9 rounded-full shadow-[0_8px_18px_rgba(45,212,191,0.3)]"
            style={{
              background: "radial-gradient(circle at 35% 30%, #F0FDF9 0%, #99F6E4 60%, #0D9488 100%)",
            }}
          />
        </div>
      </div>

      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-16 md:pt-40 md:pb-24 w-full my-auto">
        <RegisterClientForm initialError={error} />
      </main>

      <footer className="relative z-10 border-t border-stone-200/60 py-6 text-center text-xs text-[#716B7E] bg-white/40 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} RAMU — Creative Opportunity Engine. Hak cipta dilindungi.</span>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/" className="hover:text-[#27213D]">Beranda</Link>
            <span>•</span>
            <Link href="/#how-it-works" className="hover:text-[#27213D]">Cara Kerja</Link>
            <span>•</span>
            <Link href="/login" className="hover:text-[#27213D]">Masuk</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
