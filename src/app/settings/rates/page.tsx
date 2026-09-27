import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { RatesForm, ServicePackage } from "@/components/settings/RatesForm";

export const metadata = {
  title: "Kelola Paket Layanan & Tarif | RAMU",
  description: "Atur paket layanan komersial, harga, dan ketentuan pengerjaan mandiri Anda.",
};

export default async function SettingsRatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id },
    include: {
      assets: true,
    },
  });

  if (!actor) {
    redirect("/onboarding");
  }

  // Look for custom commercial packages asset
  const serviceAsset = actor.assets.find(
    (a) =>
      a.subtype === "COMMERCIAL_SERVICE_PACKAGES" ||
      (a.attributes && typeof a.attributes === "object" && "service_packages" in (a.attributes as any))
  );

  const attrs = (serviceAsset?.attributes as any) || {};
  const customStartingRate = attrs.starting_rate || "";
  const customTurnaround = attrs.turnaround_time || "";
  const customPackages: ServicePackage[] = Array.isArray(attrs.service_packages) ? attrs.service_packages : [];

  // Default baseline fallback if user hasn't set anything yet
  const sectorLower = actor.sector.toLowerCase();
  let defaultStartingRate = "Mulai Rp 1,5 Jt / sesi";
  let defaultTurnaround = "3 – 5 Hari Kerja";

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
    defaultTurnaround = "4 – 6 Hari Kerja";
  } else if (sectorLower.includes("designer") || sectorLower.includes("desain")) {
    defaultStartingRate = "Mulai Rp 2,5 Jt / koleksi";
    defaultTurnaround = "7 – 14 Hari Kerja";
  }

  return (
    <div className="space-y-6">
      <RatesForm
        initialStartingRate={customStartingRate || defaultStartingRate}
        initialTurnaroundTime={customTurnaround || defaultTurnaround}
        initialPackages={customPackages}
        actorSector={actor.sector}
        actorType={actor.actorType}
      />
    </div>
  );
}
