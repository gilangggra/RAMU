import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { NotificationsForm } from "@/components/settings/NotificationsForm";
import { updateAdminNotificationSettingsAction } from "../actions";
import { ADMIN_NOTIFICATION_ALERTS } from "../config";

export const metadata = {
  title: "Preferensi Notifikasi | Pengaturan Admin RAMU",
  description: "Kelola push notification peramban dan email alert moderasi untuk administrator.",
};

export default async function AdminNotificationsSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  let notificationData: Record<string, boolean | string | undefined> | null = null;

  if (actor) {
    const serviceAsset = await prisma.asset.findFirst({
      where: { actorId: actor.id, subtype: "OPERATIONAL_SETTINGS" },
      orderBy: { createdAt: "desc" },
    });
    const attrs = (serviceAsset?.attributes && typeof serviceAsset.attributes === "object")
      ? (serviceAsset.attributes as Record<string, unknown>)
      : {};
    notificationData = (attrs.notificationPreferences as Record<string, boolean | string | undefined>) || null;
  } else {
    notificationData = (user.user_metadata?.admin_notification_preferences as Record<string, boolean | string | undefined>) || null;
  }

  return (
    <NotificationsForm
      initialData={notificationData}
      alerts={ADMIN_NOTIFICATION_ALERTS}
      submitAction={updateAdminNotificationSettingsAction}
      description="Atur bagaimana dan kapan RAMU menghubungi Anda mengenai antrean verifikasi, sengketa, transaksi, dan moderasi proyek."
      pushDescription="Terima notifikasi instan langsung di layar perangkat Anda saat ada sengketa baru, pengajuan verifikasi, atau konten yang perlu dimoderasi."
      pushTestMessage="Anda akan menerima pemberitahuan instan saat ada antrean moderasi baru."
      pushTestLink="/admin"
    />
  );
}
