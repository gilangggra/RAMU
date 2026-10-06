import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { LegalDefaultsForm } from "@/components/settings/LegalDefaultsForm";

export const metadata = {
  title: "Template SPK & Hak Cipta | Pengaturan RAMU",
  description: "Kelola klausul kontrak standar, model lisensi karya, dan proteksi hukum bawaan pada setiap SPK.",
};

export default async function LegalSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
  });

  if (!actor) redirect("/onboarding");

  const serviceAsset = await prisma.asset.findFirst({
    where: { actorId: actor.id, subtype: "OPERATIONAL_SETTINGS" },
    orderBy: { createdAt: "desc" },
  });

  const attrs = (serviceAsset?.attributes && typeof serviceAsset.attributes === "object")
    ? (serviceAsset.attributes as Record<string, any>)
    : {};

  const legalData = attrs.legalDefaults || null;

  return <LegalDefaultsForm initialData={legalData} />;
}
