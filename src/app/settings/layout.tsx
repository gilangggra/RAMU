import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { UserCircle, Sliders, Image as ImageIcon } from "lucide-react";

export const metadata = {
  title: "Pengaturan | RAMU",
  description: "Kelola profil, preferensi, dan portofolio kolaborasi Anda.",
};

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    select: {
      id: true,
      name: true,
      sector: true,
      location: true,
      actorType: true,
    },
    orderBy: { createdAt: "asc" },
  });

  if (!actor) {
    redirect("/onboarding");
  }

  // Active path detection cannot be done directly in Server Components cleanly for nested layouts without usePathname (Client Component), 
  // so we'll pass active state logic to a small client component or just render the menu as links.
  // Actually, we can use a client component for the sidebar navigation. Let's create an inline client component or just simple links.

  return (
    <AppShell actor={actor} activeRoute="/settings">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B2E] tracking-tight">
            Pengaturan Akun
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Kelola identitas publik dan preferensi kolaborasi Anda di ekosistem RAMU.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Settings Sidebar */}
          <nav className="w-full lg:w-64 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none shrink-0 border-b lg:border-b-0 lg:border-r border-stone-200 lg:pr-6">
            <Link
              href="/settings/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-stone-600 hover:text-[#1E1B2E] hover:bg-stone-100 whitespace-nowrap lg:whitespace-normal"
            >
              <UserCircle className="w-4 h-4 shrink-0" />
              <span>Profil Dasar</span>
            </Link>
            
            <Link
              href="/settings/preferences"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-stone-600 hover:text-[#1E1B2E] hover:bg-stone-100 whitespace-nowrap lg:whitespace-normal"
            >
              <Sliders className="w-4 h-4 shrink-0" />
              <span>Preferensi Kolaborasi</span>
            </Link>

            <span
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-stone-600 whitespace-nowrap lg:whitespace-normal opacity-50 cursor-not-allowed"
              title="Segera Hadir"
            >
              <ImageIcon className="w-4 h-4 shrink-0" />
              <span>Portofolio (Segera Hadir)</span>
            </span>
          </nav>

          {/* Settings Content Area */}
          <div className="flex-1 min-w-0 w-full">
            {children}
          </div>

        </div>
      </div>
    </AppShell>
  );
}
