import { Navbar } from "@/components/landing/Navbar";
import { LoginClientForm } from "@/components/auth/LoginClientForm";
import Link from "next/link";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; message?: string; redirectTo?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = params.error;
  const message = params.message;
  const redirectTo = params.redirectTo || "/dashboard";

  return (
    <div className="min-h-screen bg-[#0E0C15] text-stone-100 relative overflow-hidden selection:bg-amber-400/30 selection:text-amber-200 flex flex-col justify-between">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[160px]" />
        <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[180px]" />
        <div className="absolute -bottom-32 left-1/3 w-[550px] h-[550px] bg-stone-700/15 rounded-full blur-[160px]" />
      </div>

      <Navbar />

      <main className="relative z-10 max-w-lg mx-auto px-6 pt-32 pb-16 md:pt-40 md:pb-24 w-full my-auto">
        <LoginClientForm error={error} message={message} redirectTo={redirectTo} />
      </main>

      <footer className="relative z-10 border-t border-stone-800/80 py-6 text-center text-xs text-stone-500 bg-[#0E0C15]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} RAMU — Creative Visual Opportunity Engine. Hak cipta dilindungi.</span>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/" className="hover:text-stone-300 transition-colors">Beranda</Link>
            <span>•</span>
            <Link href="/#how-it-works" className="hover:text-stone-300 transition-colors">Cara Kerja</Link>
            <span>•</span>
            <Link href="/register" className="hover:text-stone-300 transition-colors">Daftar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
