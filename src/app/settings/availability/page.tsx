import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { AvailabilityForm } from "@/components/settings/AvailabilityForm";

export const metadata = {
  title: "Ketersediaan & Jam Operasional | Pengaturan RAMU",
  description: "Atur status ketersediaan kerja, jam koordinasi on-set, dan folder penyimpanan proyek.",
};

export default async function AvailabilitySettingsPage() {
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

  const availabilityData = attrs.availability || null;

  return <AvailabilityForm initialData={availabilityData} />;
}
