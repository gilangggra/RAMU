"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";

export async function updateProfileBasicInfo(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized: Please log in.");
    }

    const name = formData.get("name")?.toString().trim();
    const sector = formData.get("sector")?.toString().trim();
    const description = formData.get("description")?.toString().trim();
    const location = formData.get("location")?.toString().trim();
    const websiteUrl = formData.get("websiteUrl")?.toString().trim();
    const contactEmail = formData.get("contactEmail")?.toString().trim();
    const contactPhone = formData.get("contactPhone")?.toString().trim();

    if (!name || !sector) {
      throw new Error("Nama dan Sektor wajib diisi.");
    }

    // Find the actor ID owned by the user
    const actor = await prisma.actor.findFirst({
      where: { ownerUserId: user.id },
    });

    if (!actor) {
      throw new Error("Profil kreator tidak ditemukan.");
    }

    // Update the actor
    await prisma.actor.update({
      where: { id: actor.id },
      data: {
        name,
        sector,
        description: description || null,
        location: location || null,
        websiteUrl: websiteUrl || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/directory");
    revalidatePath("/showcase");

    return { success: true, message: "Profil dasar berhasil diperbarui." };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return { success: false, error: error.message || "Terjadi kesalahan saat menyimpan profil." };
  }
}

export async function updatePreferences(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized: Please log in.");
    }

    const experienceLevel = formData.get("experienceLevel")?.toString().trim();
    const stylesString = formData.get("aestheticStyles")?.toString().trim();
    const compModelsString = formData.get("compensationModels")?.toString().trim();

    const aestheticStyles = stylesString ? stylesString.split(",").map(s => s.trim()).filter(Boolean) : [];
    const compensationModels = compModelsString ? compModelsString.split(",").map(s => s.trim()).filter(Boolean) : [];

    const actor = await prisma.actor.findFirst({
      where: { ownerUserId: user.id },
    });

    if (!actor) {
      throw new Error("Profil kreator tidak ditemukan.");
    }

    await prisma.actor.update({
      where: { id: actor.id },
      data: {
        experienceLevel: experienceLevel || null,
        aestheticStyles,
        compensationModels,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/directory");

    return { success: true, message: "Preferensi kolaborasi berhasil diperbarui." };
  } catch (error: any) {
    console.error("Error updating preferences:", error);
    return { success: false, error: error.message || "Terjadi kesalahan saat menyimpan preferensi." };
  }
}
