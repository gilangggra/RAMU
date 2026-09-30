import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { SpecsForm } from "@/components/settings/SpecsForm";

export default async function SettingsSpecsPage() {
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

  const sectorLower = actor.sector.toLowerCase();
  const isStudio = actor.actorType === "STUDIO" || sectorLower.includes("studio");
  const isModel = sectorLower.includes("model") || sectorLower.includes("talent");
  const isPhotographer = sectorLower.includes("photographer") || sectorLower.includes("fotografi");
  const isVideographer = sectorLower.includes("video") || sectorLower.includes("film") || sectorLower.includes("cinema");
  const isMUA = sectorLower.includes("mua") || sectorLower.includes("makeup") || sectorLower.includes("hair");
  const isStylist = sectorLower.includes("stylist") || sectorLower.includes("wardrobe");
  const isDesigner = sectorLower.includes("designer") || sectorLower.includes("desain");

  const existingAsset = actor.assets.find(
    (a) =>
      (isModel && (a.subtype.toLowerCase().includes("model") || (a.attributes && typeof a.attributes === "object" && "comp_card" in (a.attributes as any)))) ||
      (isStudio && (a.subtype.toLowerCase().includes("studio") || (a.attributes && typeof a.attributes === "object" && "cyclorama_type" in (a.attributes as any)))) ||
      (isPhotographer && a.attributes && typeof a.attributes === "object" && "primary_camera" in (a.attributes as any)) ||
      (isVideographer && a.attributes && typeof a.attributes === "object" && "primary_cinema_camera" in (a.attributes as any)) ||
      (isMUA && a.attributes && typeof a.attributes === "object" && "makeup_styles" in (a.attributes as any)) ||
      (isStylist && a.attributes && typeof a.attributes === "object" && "styling_specialties" in (a.attributes as any)) ||
      (isDesigner && a.attributes && typeof a.attributes === "object" && "design_disciplines" in (a.attributes as any))
  );

  const initialAttributes = (existingAsset?.attributes && typeof existingAsset.attributes === "object")
    ? (existingAsset.attributes as Record<string, any>)
    : null;

  return (
    <div className="space-y-6">
      <SpecsForm
        actorSector={actor.sector}
        actorType={actor.actorType}
        actorName={actor.name}
        initialAttributes={initialAttributes}
      />
    </div>
  );
}
