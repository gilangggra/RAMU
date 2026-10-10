import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { SecurityForm } from "@/components/settings/SecurityForm";

export const metadata = {
  title: "Keamanan & Privasi Akun | Pengaturan RAMU",
  description: "Kelola email akun, kata sandi, preferensi privasi kontak, dan kepatuhan UU PDP di RAMU.",
};

export default async function SecuritySettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
  });

  let privacySettings = {
    hideContactPhone: false,
    hideContactEmail: false,
    verifiedOnlyInquiry: false,
  };

  if (actor) {
    const serviceAsset = await prisma.asset.findFirst({
      where: { actorId: actor.id, subtype: "OPERATIONAL_SETTINGS" },
      orderBy: { createdAt: "desc" },
    });

    const attrs = (serviceAsset?.attributes && typeof serviceAsset.attributes === "object")
      ? (serviceAsset.attributes as Record<string, any>)
      : {};

    if (attrs.privacySettings) {
      privacySettings = {
        ...privacySettings,
        ...attrs.privacySettings,
      };
    }
  }

  return (
    <SecurityForm
      email={user.email || ""}
      initialPrivacy={privacySettings}
      hasActorProfile={Boolean(actor)}
    />
  );
}

