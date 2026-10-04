import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { SettingsNav } from "@/components/settings/SettingsNav";

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
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B2E] tracking-tight">
            Pengaturan Akun
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Kelola identitas publik dan preferensi kolaborasi Anda di ekosistem RAMU.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <SettingsNav isBrand={isBrand} />

          <div className="flex-1 min-w-0 w-full">
            {children}
          </div>

        </div>
      </div>
    </AppShell>
  );
}
