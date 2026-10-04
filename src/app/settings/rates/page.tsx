import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { RatesForm, ServicePackage } from "@/components/settings/RatesForm";
import { BrandCollabForm } from "@/components/settings/BrandCollabForm";

export const metadata = {
  title: "Kelola Paket & Kerjasama | RAMU",
  description: "Atur paket layanan komersial & tarif, atau preferensi kerjasama brand Anda.",
};

export default async function SettingsRatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id },
    include: { assets: true },
  });

  if (!actor) redirect("/onboarding");

  const sectorLower = actor.sector?.toLowerCase() || "";
  const isBrand =
    actor.actorType === "BRAND" ||
    (actor.actorType as string) === "MSME" ||
    actor.actorType === "COLLECTIVE" ||
    sectorLower.includes("brand") ||
    sectorLower.includes("label") ||
    sectorLower.includes("umkm");

  if (isBrand) {
    const collabAsset = actor.assets.find(
      (a) =>
        a.attributes &&
        typeof a.attributes === "object" &&
        ("collab_types" in (a.attributes as any) ||
          "budget_range" in (a.attributes as any) ||
          "creator_requirements" in (a.attributes as any))
    );

    const collabAttrs = (collabAsset?.attributes as any) || {};

    const initialCollabTypes: string[] = Array.isArray(collabAttrs.collab_types)
      ? collabAttrs.collab_types
      : ["Paid Campaign", "Product Seeding / Gifting"];

    return (
      <div className="space-y-6">
        <BrandCollabForm
          initialCollabTypes={initialCollabTypes}
          initialBudgetRange={collabAttrs.budget_range || "Sesuai brief & scope proyek"}
          initialTimeline={collabAttrs.collab_timeline || "2 - 4 Minggu per Kampanye"}
          initialCreatorRequirements={collabAttrs.creator_requirements || "Fotografer & Model Fashion dengan portofolio editorial"}
          initialCollabNotes={collabAttrs.collab_notes || ""}
        />
      </div>
    );
  }

  const serviceAsset = actor.assets.find(
    (a) =>
      a.subtype === "COMMERCIAL_SERVICE_PACKAGES" ||
      (a.attributes && typeof a.attributes === "object" && "service_packages" in (a.attributes as any))
  );

  const attrs = (serviceAsset?.attributes as any) || {};
  const customPackages: ServicePackage[] = Array.isArray(attrs.service_packages) ? attrs.service_packages : [];

  let defaultStartingRate = "Mulai Rp 1,5 Jt / sesi";
  let defaultTurnaround = "3 - 5 Hari Kerja";

  if (actor.actorType === "STUDIO" || sectorLower.includes("studio")) {
    defaultStartingRate = "Mulai Rp 200rb / jam (Shift Rp 750rb)";
    defaultTurnaround = "Instan / Slot Booking";
  } else if (sectorLower.includes("model") || sectorLower.includes("talent")) {
    defaultStartingRate = "Mulai Rp 1,0 Jt / sesi";
    defaultTurnaround = "Selesai Sesi Pemotretan";
  } else if (sectorLower.includes("mua") || sectorLower.includes("makeup") || sectorLower.includes("hair")) {
    defaultStartingRate = "Mulai Rp 800rb / sesi";
    defaultTurnaround = "Selesai On-Set Hari-H";
  } else if (sectorLower.includes("stylist") || sectorLower.includes("wardrobe")) {
    defaultStartingRate = "Mulai Rp 1,2 Jt / sesi";
    defaultTurnaround = "Selesai On-Set Hari-H";
  } else if (sectorLower.includes("video") || sectorLower.includes("film") || sectorLower.includes("cinema")) {
    defaultStartingRate = "Mulai Rp 1,8 Jt / video";
    defaultTurnaround = "4 - 6 Hari Kerja";
  } else if (sectorLower.includes("designer") || sectorLower.includes("desain")) {
    defaultStartingRate = "Mulai Rp 2,5 Jt / koleksi";
    defaultTurnaround = "7 - 14 Hari Kerja";
  }

  return (
    <div className="space-y-6">
      <RatesForm
        initialStartingRate={attrs.starting_rate || defaultStartingRate}
        initialTurnaroundTime={attrs.turnaround_time || defaultTurnaround}
        initialPackages={customPackages}
        initialTerms={attrs.terms_and_conditions || null}
        actorSector={actor.sector}
        actorType={actor.actorType}
      />
    </div>
  );
}
