import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { PublicProfileBanner } from "@/components/settings/PublicProfileBanner";

export const metadata = {
  title: "Pengaturan Akun & Operasional | RAMU",
  description: "Kelola rekening pencairan SPK, ketersediaan jadwal, notifikasi, dan keamanan akun Anda.",
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
      owner: {
        select: {
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!actor) {
    redirect("/onboarding");
  }

  const sectorLower = actor.sector?.toLowerCase() || "";
  const isBrand =
    actor.actorType === "BRAND" ||
    (actor.actorType as string) === "MSME" ||
    actor.actorType === "COLLECTIVE" ||
    sectorLower.includes("brand") ||
    sectorLower.includes("label") ||
    sectorLower.includes("umkm");

  return (
    <AppShell actor={actor} activeRoute="/settings">
      <div className="w-full max-w-7xl mx-auto space-y-6 pb-16">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-[#0284c7] border border-sky-200/60 text-[10px] font-bold uppercase tracking-wider w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4CC9FE] animate-pulse" />
            <span>Workspace &amp; Account Settings</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#27213D] tracking-tight">
            Pengaturan Akun &amp; Operasional
          </h1>
          <p className="text-xs sm:text-sm text-[#716B7E]">
            Pusat konfigurasi rekening pencairan dana SPK, status ketersediaan, notifikasi, dan keamanan akun Anda.
          </p>
        </div>

        {/* Public vs Private Cross-Link Banner */}
        <PublicProfileBanner actorId={actor.id} />

        <div className="flex flex-col lg:flex-row gap-8 items-start pt-2">
          <SettingsNav isBrand={isBrand} actorId={actor.id} />

          <div className="flex-1 min-w-0 w-full">
            {children}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

