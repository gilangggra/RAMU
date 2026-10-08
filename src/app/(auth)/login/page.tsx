import { LoginClientForm } from "@/components/auth/LoginClientForm";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; message?: string; redirectTo?: string; redirect?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = params.error;
  const message = params.message;
  const redirectTo = params.redirectTo || params.redirect || "/dashboard";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E2EFFF] via-[#F1ECF7] to-[#F8FAFD] text-slate-900 relative overflow-hidden flex flex-col justify-center items-center p-3 sm:p-6 selection:bg-blue-500/20 selection:text-blue-900">

      {/* Atmospheric Aurora / Sky mesh glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 left-1/4 w-[700px] h-[700px] bg-sky-300/35 rounded-full blur-[140px]" />
        <div className="absolute top-1/4 -right-40 w-[650px] h-[650px] bg-purple-200/30 rounded-full blur-[160px]" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-blue-200/25 rounded-full blur-[160px]" />
      </div>

      {/* Main Form Canvas (No top header, centered cleanly) */}
      <main className="relative z-10 w-full max-w-lg mx-auto my-auto">
        <LoginClientForm error={error} message={message} redirectTo={redirectTo} />
      </main>

      {/* Footer minimalis */}
      <footer className="relative z-10 pt-2 text-center text-[11px] text-slate-400">
        &copy; {new Date().getFullYear()} RAMU — Platform Kolaborasi Industri Kreatif Mode &amp; Studio.
      </footer>
    </div>
  );
}
