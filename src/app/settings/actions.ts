"use server";

import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
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
    const instagram = formData.get("instagram")?.toString().trim();
    const contactEmail = formData.get("contactEmail")?.toString().trim();
    const contactPhone = formData.get("contactPhone")?.toString().trim();

    if (!name || !sector) {
      throw new Error("Nama dan Sektor wajib diisi.");
    }

    const avatarFile = formData.get("avatarFile") as File | null;
    const removeAvatar = formData.get("removeAvatar") === "true";
    let newAvatarUrl: string | null | undefined = undefined;

    if (avatarFile && avatarFile.size > 0 && typeof avatarFile.arrayBuffer === "function") {
      try {
        const bytes = await avatarFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const safeName = avatarFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${Date.now()}-${safeName}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
        await mkdir(uploadDir, { recursive: true });
        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);
        newAvatarUrl = `/uploads/avatars/${filename}`;
      } catch (uploadErr) {
        console.error("Gagal menyimpan file avatar di settings:", uploadErr);
      }
    } else if (removeAvatar) {
      newAvatarUrl = null;
    }

    const profileUpdateData: { displayName: string; bio: string | null; avatarUrl?: string | null } = {
      displayName: name,
      bio: description || null,
    };
    if (newAvatarUrl !== undefined) {
      profileUpdateData.avatarUrl = newAvatarUrl;
    }

    await prisma.profile.upsert({
      where: { id: user.id },
      update: profileUpdateData,
      create: {
        id: user.id,
        email: user.email || `${user.id}@ramu.id`,
        displayName: name,
        bio: description || null,
        avatarUrl: newAvatarUrl !== undefined ? newAvatarUrl : (user.user_metadata?.avatar_url || null),
      },
    }).catch((err) => console.error("Gagal update profile basic info:", err));

    const authUpdateMetadata: { display_name: string; avatar_url?: string | null } = {
      display_name: name,
    };
    if (newAvatarUrl !== undefined) {
      authUpdateMetadata.avatar_url = newAvatarUrl || null;
    }

    await supabase.auth.updateUser({
      data: authUpdateMetadata,
    }).catch(() => {});

    const actor = await prisma.actor.findFirst({
      where: { ownerUserId: user.id },
    });

    if (!actor) {
      throw new Error("Profil kreator tidak ditemukan.");
    }

    let finalWebsiteUrl: string | null = null;
    if (websiteUrl && instagram) {
      finalWebsiteUrl = JSON.stringify({ website: websiteUrl, instagram });
    } else if (instagram) {
      finalWebsiteUrl = instagram.startsWith("http") ? instagram : `https://instagram.com/${instagram.replace(/^@/, "")}`;
    } else if (websiteUrl) {
      finalWebsiteUrl = websiteUrl;
    }

    await prisma.actor.update({
      where: { id: actor.id },
      data: {
        name,
        sector,
        description: description || null,
        location: location || null,
        websiteUrl: finalWebsiteUrl,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/settings/profile");
    revalidatePath("/directory");
    revalidatePath(`/directory/${actor.id}`);
    revalidatePath("/showcase");
    revalidatePath("/dashboard");
    revalidatePath("/", "layout");

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

export async function updateServicePackagesAndRates(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized: Silakan login terlebih dahulu.");
    }

    const startingRate = formData.get("startingRate")?.toString().trim();
    const turnaroundTime = formData.get("turnaroundTime")?.toString().trim();
    const packagesJson = formData.get("packagesJson")?.toString().trim();

    if (!startingRate) {
      throw new Error("Estimasi tarif awal wajib diisi.");
    }

    let parsedPackages = [];
    if (packagesJson) {
      try {
        parsedPackages = JSON.parse(packagesJson);
      } catch (e) {
        throw new Error("Format paket layanan tidak valid.");
      }
    }

    const termsAndConditionsJson = formData.get("termsAndConditionsJson")?.toString().trim();
    let parsedTerms = null;
    if (termsAndConditionsJson) {
      try {
        parsedTerms = JSON.parse(termsAndConditionsJson);
      } catch (e) {
        // ignore format error
      }
    }

    const actor = await prisma.actor.findFirst({
      where: { ownerUserId: user.id },
    });

    if (!actor) {
      throw new Error("Profil kreator tidak ditemukan.");
    }

    // Check if commercial service packages asset exists
    const existingAsset = await prisma.asset.findFirst({
      where: {
        actorId: actor.id,
        subtype: "COMMERCIAL_SERVICE_PACKAGES",
      },
    });

    const attributesData = {
      starting_rate: startingRate,
      turnaround_time: turnaroundTime || "3 – 5 Hari Kerja",
      service_packages: parsedPackages,
      terms_and_conditions: parsedTerms,
    };

    if (existingAsset) {
      const existingAttrs = (typeof existingAsset.attributes === "object" && existingAsset.attributes !== null)
        ? (existingAsset.attributes as Record<string, unknown>)
        : {};

      await prisma.asset.update({
        where: { id: existingAsset.id },
        data: {
          attributes: {
            ...existingAttrs,
            ...attributesData,
          },
        },
      });
    } else {
      await prisma.asset.create({
        data: {
          actorId: actor.id,
          category: "SKILL_TALENT",
          subtype: "COMMERCIAL_SERVICE_PACKAGES",
          name: "Paket Layanan & Tarif Mandiri",
          description: "Daftar paket komersial dan estimasi tarif resmi yang diatur mandiri oleh kreator.",
          roles: ["CAPABILITY"],
          attributes: attributesData,
          sourceType: "SELF_REPORTED",
          confidenceLevel: "HIGH",
          status: "ACTIVE",
        },
      });
    }

    revalidatePath("/settings/rates");
    revalidatePath("/settings");
    revalidatePath("/directory");
    revalidatePath(`/directory/${actor.id}`);

    return { success: true, message: "Paket layanan dan tarif mandiri Anda berhasil disimpan!" };
  } catch (error: any) {
    console.error("Error updating service packages:", error);
    return { success: false, error: error.message || "Terjadi kesalahan saat menyimpan paket tarif." };
  }
}

export async function getCurrentUserAvatar(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { avatarUrl: true },
    });
    return profile?.avatarUrl || (user.user_metadata?.avatar_url as string) || (user.user_metadata?.picture as string) || null;
  } catch {
    return null;
  }
}

export async function updateActorSpecs(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized: Silakan masuk terlebih dahulu.");
    }

    const actor = await prisma.actor.findFirst({
      where: { ownerUserId: user.id },
      include: { assets: true },
    });

    if (!actor) {
      throw new Error("Profil kreator tidak ditemukan.");
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

    const existingAttrs = (existingAsset?.attributes && typeof existingAsset.attributes === "object")
      ? (existingAsset.attributes as Record<string, unknown>)
      : {};

    const newAttributes: Record<string, any> = { ...existingAttrs };

    if (isModel) {
      const height_cm = formData.get("height_cm") ? Number(formData.get("height_cm")) : undefined;
      const weight_kg = formData.get("weight_kg") ? Number(formData.get("weight_kg")) : undefined;
      const bust_waist_hips = formData.get("bust_waist_hips")?.toString().trim() || undefined;
      const clothing_size = formData.get("clothing_size")?.toString().trim() || undefined;
      const shoe_size = formData.get("shoe_size")?.toString().trim() || undefined;
      const hair_color = formData.get("hair_color")?.toString().trim() || undefined;
      const eye_color = formData.get("eye_color")?.toString().trim() || undefined;
      const skin_undertone = formData.get("skin_undertone")?.toString().trim() || undefined;
      const experience_years = formData.get("experience_years") ? Number(formData.get("experience_years")) : undefined;
      const video_reel_title = formData.get("video_reel_title")?.toString().trim() || undefined;

      const rawSpecialties = formData.get("specialties")?.toString().trim();
      let specialties: string[] = [];
      if (rawSpecialties) {
        try {
          specialties = JSON.parse(rawSpecialties);
        } catch {
          specialties = rawSpecialties.split(",").map((s) => s.trim()).filter(Boolean);
        }
      }

      if (height_cm) newAttributes.height_cm = height_cm;
      if (weight_kg) newAttributes.weight_kg = weight_kg;
      if (bust_waist_hips) newAttributes.bust_waist_hips = bust_waist_hips;
      if (clothing_size) newAttributes.clothing_size = clothing_size;
      if (shoe_size) newAttributes.shoe_size = shoe_size;
      if (hair_color) newAttributes.hair_color = hair_color;
      if (eye_color) newAttributes.eye_color = eye_color;
      if (skin_undertone) newAttributes.skin_undertone = skin_undertone;
      if (experience_years) newAttributes.experience_years = experience_years;
      if (specialties.length > 0) newAttributes.specialties = specialties;
      if (video_reel_title) newAttributes.video_reel_title = video_reel_title;

      const compCardList: Array<{ type: string; url: string; caption: string }> = [];
      const defaultAngleTypes = ["Headshot / Close-up", "Profile Side Angle", "Full Body Polaroid"];

      for (let i = 0; i < 3; i++) {
        const file = formData.get(`polaroid_file_${i}`) as File | null;
        let photoUrl = formData.get(`polaroid_url_${i}`)?.toString().trim() || "";
        const photoType = formData.get(`polaroid_type_${i}`)?.toString().trim() || defaultAngleTypes[i];
        const photoCaption = formData.get(`polaroid_caption_${i}`)?.toString().trim() || `Tampilan ${photoType}`;

        if (file && file.size > 0 && typeof file.arrayBuffer === "function") {
          try {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
            const filename = `${Date.now()}-compcard-${i}-${safeName}`;
            const uploadDir = path.join(process.cwd(), "public", "uploads", "compcards");
            await mkdir(uploadDir, { recursive: true });
            const filepath = path.join(uploadDir, filename);
            await writeFile(filepath, buffer);
            photoUrl = `/uploads/compcards/${filename}`;
          } catch (uploadErr) {
            console.error(`Gagal menyimpan file polaroid ${i}:`, uploadErr);
          }
        }

        if (photoUrl) {
          compCardList.push({
            type: photoType,
            url: photoUrl,
            caption: photoCaption,
          });
        }
      }

      if (compCardList.length > 0) {
        newAttributes.comp_card = compCardList;
      }
    } else if (isPhotographer || isVideographer) {
      const primary_camera = formData.get("primary_camera")?.toString().trim();
      const secondary_camera = formData.get("secondary_camera")?.toString().trim();
      const rawLenses = formData.get("lenses")?.toString().trim();
      const rawLighting = formData.get("lighting_gear")?.toString().trim();
      const drone_aerial = formData.get("drone_aerial") === "true";

      if (primary_camera) newAttributes.primary_camera = primary_camera;
      if (secondary_camera) newAttributes.secondary_camera = secondary_camera;
      if (rawLenses) {
        newAttributes.lenses = rawLenses.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (rawLighting) {
        newAttributes.lighting_gear = rawLighting.split(",").map((s) => s.trim()).filter(Boolean);
      }
      newAttributes.drone_aerial = drone_aerial;
    } else if (isStudio) {
      const area_sqm = formData.get("area_sqm") ? Number(formData.get("area_sqm")) : undefined;
      const ceiling_height_m = formData.get("ceiling_height_m") ? Number(formData.get("ceiling_height_m")) : undefined;
      const cyclorama_type = formData.get("cyclorama_type")?.toString().trim();
      const electrical_capacity = formData.get("electrical_capacity")?.toString().trim();
      const rawFacilities = formData.get("facilities")?.toString().trim();

      if (area_sqm) newAttributes.area_sqm = area_sqm;
      if (ceiling_height_m) newAttributes.ceiling_height_m = ceiling_height_m;
      if (cyclorama_type) newAttributes.cyclorama_type = cyclorama_type;
      if (electrical_capacity) newAttributes.electrical_capacity = electrical_capacity;
      if (rawFacilities) {
        newAttributes.facilities = rawFacilities.split(",").map((s) => s.trim()).filter(Boolean);
      }
    } else {
      const specialties = formData.get("specialties")?.toString().trim();
      if (specialties) {
        newAttributes.specialties = specialties.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    if (existingAsset) {
      await prisma.asset.update({
        where: { id: existingAsset.id },
        data: {
          attributes: newAttributes,
        },
      });
    } else {
      const category = isStudio
        ? "STUDIO_SPACE"
        : isPhotographer || isVideographer
        ? "EQUIPMENT"
        : "SKILL_TALENT";

      const subtype = isModel
        ? "Model Lookbook & Commercial"
        : isPhotographer
        ? "Fotografi & Kamera Komersial"
        : isStudio
        ? "Studio Space & Facilities"
        : "Spesifikasi Profesi";

      const assetName = isModel
        ? `Karakteristik Fisik & Comp Card ${actor.name}`
        : `Spesifikasi Teknis & Alat ${actor.name}`;

      await prisma.asset.create({
        data: {
          actorId: actor.id,
          category,
          subtype,
          name: assetName,
          description: `Spesifikasi teknis resmi ${actor.name}`,
          roles: ["CAPABILITY", "CREATIVE_ELEMENT"],
          attributes: newAttributes,
          sourceType: "SELF_REPORTED",
          confidenceLevel: "HIGH",
          status: "ACTIVE",
        },
      });
    }

    revalidatePath("/settings");
    revalidatePath("/settings/specs");
    revalidatePath("/directory");
    revalidatePath(`/directory/${actor.id}`);
    revalidatePath("/showcase");

    return { success: true, message: "Spesifikasi dan Comp Card Anda berhasil diperbarui!" };
  } catch (error: any) {
    console.error("Error updating specs:", error);
    return { success: false, error: error.message || "Gagal menyimpan spesifikasi." };
  }
}

