import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { PayoutForm } from "@/components/settings/PayoutForm";

export const metadata = {
  title: "Rekening Pencairan Dana | Pengaturan RAMU",
  description: "Atur rekening bank resmi penerimaan pembayaran SPK langsung dari klien.",
};

export default async function PayoutSettingsPage() {
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

  const payoutData = attrs.payoutAccount || null;

  return <PayoutForm initialData={payoutData} />;
}
