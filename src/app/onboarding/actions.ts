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
    ActorType.MSME,
  ];

  const actorType = validTypes.includes(actorTypeStr as ActorType)
    ? (actorTypeStr as ActorType)
    : ActorType.STUDIO;

  const fullLocation = address ? `${address}, ${location}` : location;

  // Pastikan profile user ada dan sinkron
  try {
    await syncUserProfile(
      user.id,
      user.email || "user@ramu.id",
      user.user_metadata?.display_name || name
    );

    if (bio) {
      await prisma.profile.update({
        where: { id: user.id },
        data: { bio },
      }).catch(() => {});
    }

    // Simpan profil aktor pertama
    const newActor = await prisma.actor.create({
      data: {
        ownerUserId: user.id,
        name,
        actorType,
        sector,
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

    // Daftarkan keahlian sebagai initial Asset CAPABILITY
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
