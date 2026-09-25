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
    <div className="min-h-screen bg-[#FAFAF9] relative overflow-hidden flex flex-col">
      {/* Background ambient decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] bg-amber-400/6 rounded-full blur-[160px]" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[180px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-px h-[40vh] bg-gradient-to-b from-stone-200 to-transparent" />
      </div>

      <Navbar />

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 pt-28 pb-16">
        <div className="w-full">
          {/* Branding Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 shadow-sm text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              RAMU — Creative Opportunity Engine
            </div>
            <p className="text-stone-400 text-sm max-w-sm mx-auto leading-relaxed">
              Bergabung dalam ekosistem kolaborasi fashion & visual terkurasi.
            </p>
          </div>
          <RegisterClientForm initialError={error} />
        </div>
      </main>

      <footer className="relative z-10 border-t border-stone-200 py-5 text-center text-xs text-stone-400 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} RAMU — Hak cipta dilindungi.</span>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/" className="hover:text-stone-600 transition-colors">Beranda</Link>
            <span>·</span>
            <Link href="/login" className="hover:text-stone-600 transition-colors">Masuk</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
