import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { NotificationsForm } from "@/components/settings/NotificationsForm";

export const metadata = {
  title: "Preferensi Notifikasi | Pengaturan RAMU",
  description: "Kelola push notification peramban dan pemberitahuan email mengenai pesanan dan pesan.",
};

export default async function NotificationsSettingsPage() {
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

  const notificationData = attrs.notificationPreferences || null;

  return <NotificationsForm initialData={notificationData} />;
}
