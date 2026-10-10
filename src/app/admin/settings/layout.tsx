import { AdminSettingsNav } from "@/components/admin/settings/AdminSettingsNav";

export const metadata = {
  title: "Pengaturan Akun Admin | RAMU",
  description: "Kelola profil, preferensi notifikasi, dan keamanan akun administrator RAMU.",
};

// Akses admin sudah dijaga oleh src/proxy.ts dan src/app/admin/layout.tsx.
export default function AdminSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-[#0284c7] border border-sky-200/60 text-[10px] font-bold uppercase tracking-wider w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4CC9FE] animate-pulse" />
          <span>Admin Account Settings</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#27213D] tracking-tight">
          Pengaturan Akun Admin
        </h1>
        <p className="text-xs sm:text-sm text-[#716B7E]">
          Pusat konfigurasi profil, notifikasi moderasi, dan keamanan akun administrator Anda.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start pt-2">
        <AdminSettingsNav />

        <div className="flex-1 min-w-0 w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
