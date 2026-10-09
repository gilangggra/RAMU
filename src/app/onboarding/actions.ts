"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { ActorType, ActorStatus } from "@prisma/client";
import { syncUserProfile } from "@/lib/profileSync";

export async function createActorProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = (formData.get("name") as string)?.trim();
  const sector = (formData.get("sector") as string)?.trim();
  const actorTypeStr = (formData.get("actorType") as string)?.trim();
  const location = (formData.get("location") as string)?.trim();
  const address = (formData.get("address") as string)?.trim();
  const bio = ((formData.get("bio") as string) || (formData.get("description") as string))?.trim();
  const skillsRaw = formData.get("skills") as string;
  const contactEmail = (formData.get("contactEmail") as string)?.trim() || user.email;
  const websiteUrl = (formData.get("websiteUrl") as string)?.trim();
  const contactPhone = (formData.get("contactPhone") as string)?.trim();

  const aestheticStyles = formData.getAll("aestheticStyles") as string[];
  const compensationModels = formData.getAll("compensationModels") as string[];
  const experienceLevel = formData.get("experienceLevel") as string;

  let parsedSkills: string[] = [];
  try {
    if (skillsRaw) {
      parsedSkills = JSON.parse(skillsRaw);
    }
  } catch {
    parsedSkills = skillsRaw ? skillsRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];
  }

  if (!name || !sector || !location) {
    redirect(
      `/onboarding?error=${encodeURIComponent(
        "Nama Pelaku, Subsektor, dan Lokasi wajib diisi untuk verifikasi peluang."
      )}`
    );
  }

  const validTypes: ActorType[] = [
    ActorType.INDIVIDUAL,
    ActorType.STUDIO,
    ActorType.COLLECTIVE,
    ActorType.BRAND,
  ];

  let actorType = validTypes.includes(actorTypeStr as ActorType)
    ? (actorTypeStr as ActorType)
    : ActorType.INDIVIDUAL;

  const ALLOWED_ACTOR_ROLES = [
    "Fashion Brand/UMKM",
    "Photographer",
    "Model",
    "MUA/Stylist",
    "Studio",
  ];

  let canonicalSector = sector;
  const sLower = (sector || "").toLowerCase();

  if (
    sLower.includes("brand") ||
    sLower.includes("label") ||
    sLower.includes("umkm") ||
    sLower.includes("designer") ||
    sLower.includes("desain") ||
    sLower.includes("perancang") ||
    sLower.includes("pola")
  ) {
    canonicalSector = "Fashion Brand/UMKM";
    actorType = ActorType.BRAND;
  } else if (sLower.includes("studio") || sLower.includes("ruang") || sLower.includes("cyclorama")) {
    canonicalSector = "Studio";
    actorType = ActorType.STUDIO;
  } else if (sLower.includes("model") || sLower.includes("talent") || sLower.includes("peraga") || sLower.includes("muse")) {
    canonicalSector = "Model";
    actorType = ActorType.INDIVIDUAL;
  } else if (sLower.includes("mua") || sLower.includes("makeup") || sLower.includes("hair") || sLower.includes("stylist") || sLower.includes("wardrobe")) {
    canonicalSector = "MUA/Stylist";
    actorType = ActorType.INDIVIDUAL;
  } else if (sLower.includes("foto") || sLower.includes("photo") || sLower.includes("kamera")) {
    canonicalSector = "Photographer";
    actorType = ActorType.INDIVIDUAL;
  } else if (!ALLOWED_ACTOR_ROLES.includes(canonicalSector)) {
    canonicalSector = "Photographer";
    actorType = ActorType.INDIVIDUAL;
  }

  const fullLocation = address ? `${address}, ${location}` : location;

  try {
    const oauthAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    await syncUserProfile(
      user.id,
      user.email || "user@ramu.id",
      user.user_metadata?.display_name || name,
      oauthAvatar
    );

    if (bio) {
      await prisma.profile.update({
        where: { id: user.id },
        data: { bio },
      }).catch(() => {});
    }

    const newActor = await prisma.actor.create({
      data: {
        ownerUserId: user.id,
        name,
        actorType,
        sector: canonicalSector,
        location: fullLocation,
        description: bio || null,
        contactEmail,
        contactPhone: contactPhone || null,
        websiteUrl: websiteUrl || null,
        status: ActorStatus.ACTIVE,
        aestheticStyles,
        experienceLevel,
        compensationModels,
      },
    });

    if (parsedSkills.length > 0) {
      for (const skill of parsedSkills) {
        await prisma.asset.create({
          data: {
            actorId: newActor.id,
            category: "SKILL_TALENT",
            subtype: "Keahlian Spesifik",
            name: skill,
            roles: ["CAPABILITY"],
            sourceType: "SELF_REPORTED",
            confidenceLevel: "HIGH",
            status: "ACTIVE",
            attributes: {
              tags: ["Onboarding", "Skill"],
              selfReported: true,
            },
          },
        }).catch(() => {});
      }
    }
  } catch (error: any) {
    console.error("Gagal menyimpan profil aktor di database:", error);
    redirect(
      `/onboarding?error=${encodeURIComponent(
        "Gagal menyimpan ke database: " +
          (error?.message?.split("\n")[0] || "Koneksi database terputus.")
      )}`
    );
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
