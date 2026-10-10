"use server";

import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { clearRecommendationsCache } from "@/application/projectBriefService";

const AVATAR_MAX_BYTES = 4 * 1024 * 1024;
const AVATAR_ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const AVATAR_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function deleteLocalAvatarFile(avatarUrl: string) {
  if (!avatarUrl.startsWith("/uploads/avatars/")) return;
  const filename = path.basename(avatarUrl);
  const filepath = path.join(process.cwd(), "public", "uploads", "avatars", filename);
  await unlink(filepath).catch(() => {});
}

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

    const existingProfile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { avatarUrl: true },
    });
    const previousAvatarUrl = existingProfile?.avatarUrl || null;

    if (avatarFile && avatarFile.size > 0 && typeof avatarFile.arrayBuffer === "function") {
      if (!AVATAR_ALLOWED_TYPES.includes(avatarFile.type)) {
        throw new Error("Format foto profil harus JPG, PNG, atau WebP.");
      }
      if (avatarFile.size > AVATAR_MAX_BYTES) {
        throw new Error("Ukuran foto profil maksimal 4 MB.");
      }
      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = AVATAR_EXTENSIONS[avatarFile.type] || "jpg";
      const filename = `${user.id}-${Date.now()}.${ext}`;

      let uploadedToCloud = false;
      try {
        const { data: storageData, error: storageError } = await supabase.storage
          .from("avatars")
          .upload(filename, buffer, {
            contentType: avatarFile.type,
            upsert: true,
          });

        if (!storageError && storageData) {
          const { data: publicUrlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(storageData.path);
          if (publicUrlData?.publicUrl) {
            newAvatarUrl = publicUrlData.publicUrl;
            uploadedToCloud = true;
          }
        }
      } catch (cloudErr) {
        console.warn("Supabase storage avatar upload failed, falling back:", cloudErr);
      }

      if (!uploadedToCloud) {
        try {
          const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
          await mkdir(uploadDir, { recursive: true });
          await writeFile(path.join(uploadDir, filename), buffer);
          newAvatarUrl = `/uploads/avatars/${filename}`;
        } catch (fsErr) {
          console.warn("Local filesystem write failed (serverless environment):", fsErr);
        }
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
    });

    // Bersihkan file avatar lama (hanya file lokal milik RAMU) setelah DB berhasil diperbarui
    if (newAvatarUrl !== undefined && previousAvatarUrl && previousAvatarUrl !== newAvatarUrl) {
      await deleteLocalAvatarFile(previousAvatarUrl);
    }

    const authUpdateMetadata: { display_name: string; avatar_url?: string | null; picture?: string | null } = {
      display_name: name,
    };
    if (newAvatarUrl !== undefined) {
      authUpdateMetadata.avatar_url = newAvatarUrl || null;
      // Timpa foto OAuth (Google) agar tidak muncul kembali setelah avatar dihapus/diganti
      authUpdateMetadata.picture = newAvatarUrl || null;
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

    let canonicalSector = sector;
    let newActorType = actor.actorType;
    const sLower = (sector || "").toLowerCase();
    const isActorAlreadyAdmin = (actor.sector || "").toLowerCase().includes("administrator");
    const requestedAdmin = sLower.includes("admin") || sLower.includes("administrator");

    if (requestedAdmin && !isActorAlreadyAdmin) {
      // User biasa tidak diizinkan mengubah sektor menjadi Administrator
      canonicalSector = "Photographer";
      newActorType = "INDIVIDUAL";
    } else if (!requestedAdmin) {
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
        newActorType = "BRAND";
      } else if (sLower.includes("studio") || sLower.includes("ruang") || sLower.includes("cyclorama")) {
        canonicalSector = "Studio";
        newActorType = "STUDIO";
      } else if (sLower.includes("model") || sLower.includes("talent") || sLower.includes("peraga") || sLower.includes("muse")) {
        canonicalSector = "Model";
        newActorType = "INDIVIDUAL";
      } else if (sLower.includes("mua") || sLower.includes("makeup") || sLower.includes("hair") || sLower.includes("stylist") || sLower.includes("wardrobe")) {
        canonicalSector = "MUA/Stylist";
        newActorType = "INDIVIDUAL";
      } else if (sLower.includes("foto") || sLower.includes("photo") || sLower.includes("kamera")) {
        canonicalSector = "Photographer";
        newActorType = "INDIVIDUAL";
      }
    }

    await prisma.actor.update({
      where: { id: actor.id },
      data: {
        name,
        sector: canonicalSector,
        actorType: newActorType,
        description: description || null,
        location: location || null,
        websiteUrl: finalWebsiteUrl,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
      },
    });

    clearRecommendationsCache();
    revalidatePath("/settings");
    revalidatePath("/settings/profile");
    revalidatePath("/directory");
    revalidatePath(`/directory/${actor.id}`);
    revalidatePath("/showcase");
    revalidatePath("/dashboard");
    revalidatePath("/", "layout");

    return { success: true, message: "Profil dasar berhasil diperbarui.", avatarUrl: newAvatarUrl };
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

    clearRecommendationsCache();
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

      }
    }

    const actor = await prisma.actor.findFirst({
      where: { ownerUserId: user.id },
    });

    if (!actor) {
      throw new Error("Profil kreator tidak ditemukan.");
    }

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
    // Profile.avatarUrl adalah sumber kebenaran tunggal. Metadata auth hanya fallback jika profil belum ada.
    if (profile) return profile.avatarUrl || null;
    return (user.user_metadata?.avatar_url as string) || (user.user_metadata?.picture as string) || null;
  } catch {
    return null;
  }
}

function parseListInput(val: FormDataEntryValue | null): string[] {
  if (!val) return [];
  const str = val.toString().trim();
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean);
  } catch {
    // split by comma fallback
  }
  return str.split(",").map((s) => s.trim()).filter(Boolean);
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
    const isModel = sectorLower.includes("model") || sectorLower.includes("talent");
    const isPhotographer = sectorLower.includes("photographer") || sectorLower.includes("fotografi");
    const isVideographer = sectorLower.includes("video") || sectorLower.includes("film") || sectorLower.includes("cinema");
    const isMUA = sectorLower.includes("mua") || sectorLower.includes("makeup") || sectorLower.includes("hair");
    const isStylist = sectorLower.includes("stylist") || sectorLower.includes("wardrobe");
    const isDesigner = sectorLower.includes("designer") || sectorLower.includes("desain");
    const isIndividualSector = isModel || isPhotographer || isVideographer || isMUA || isStylist || isDesigner;

    const hasStudioSpaceAsset = actor.assets.some(
      (a) => a.category === "STUDIO_SPACE" || a.subtype?.toLowerCase().includes("studio")
    );
    const isStudio = !isIndividualSector && (actor.actorType === "STUDIO" || sectorLower.includes("studio") || hasStudioSpaceAsset);
    const isBrand =
      actor.actorType === "BRAND" ||
      (actor.actorType as string) === "MSME" ||
      actor.actorType === "COLLECTIVE" ||
      sectorLower.includes("brand") ||
      sectorLower.includes("label") ||
      sectorLower.includes("agency");

    const existingAsset = actor.assets.find(
      (a) =>
        (isModel && (a.subtype.toLowerCase().includes("model") || (a.attributes && typeof a.attributes === "object" && "comp_card" in (a.attributes as any)))) ||
        (isStudio && (a.subtype.toLowerCase().includes("studio") || (a.attributes && typeof a.attributes === "object" && ("cyclorama_type" in (a.attributes as any) || "area_sqm" in (a.attributes as any))))) ||
        (isPhotographer && a.attributes && typeof a.attributes === "object" && ("primary_camera" in (a.attributes as any) || "lenses" in (a.attributes as any))) ||
        (isVideographer && a.attributes && typeof a.attributes === "object" && ("primary_cinema_camera" in (a.attributes as any) || "stabilizer_gimbal" in (a.attributes as any))) ||
        (isMUA && a.attributes && typeof a.attributes === "object" && ("makeup_styles" in (a.attributes as any) || "primary_kit_brands" in (a.attributes as any))) ||
        (isStylist && a.attributes && typeof a.attributes === "object" && ("styling_specialties" in (a.attributes as any) || "onset_equipment" in (a.attributes as any))) ||
        (isDesigner && a.attributes && typeof a.attributes === "object" && ("design_disciplines" in (a.attributes as any) || "primary_software" in (a.attributes as any) || "sample_turnaround_days" in (a.attributes as any))) ||
        (isBrand && a.attributes && typeof a.attributes === "object" && ("sample_sizes_ready" in (a.attributes as any) || "fabric_materials" in (a.attributes as any) || "design_dna" in (a.attributes as any) || "brand_category" in (a.attributes as any) || "collab_types" in (a.attributes as any)))
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
      const specialties = parseListInput(formData.get("specialties"));
      const capabilities = parseListInput(formData.get("capabilities"));
      const wardrobe_restrictions = formData.get("wardrobe_restrictions")?.toString().trim();
      const chaperone_allowed = formData.get("chaperone_allowed") === "true";
      const travel_radius = formData.get("travel_radius")?.toString().trim();

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
      if (capabilities.length > 0) newAttributes.capabilities = capabilities;
      if (wardrobe_restrictions) newAttributes.wardrobe_restrictions = wardrobe_restrictions;
      newAttributes.chaperone_allowed = chaperone_allowed;
      if (travel_radius) newAttributes.travel_radius = travel_radius;
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
            const filename = `compcard-${actor.id}-${i}-${Date.now()}-${safeName}`;
            let uploadedToCloud = false;

            try {
              const { data: storageData, error: storageError } = await supabase.storage
                .from("portfolios")
                .upload(`compcards/${filename}`, buffer, {
                  contentType: file.type || "image/jpeg",
                  upsert: true,
                });

              if (!storageError && storageData) {
                const { data: publicUrlData } = supabase.storage
                  .from("portfolios")
                  .getPublicUrl(storageData.path);
                if (publicUrlData?.publicUrl) {
                  photoUrl = publicUrlData.publicUrl;
                  uploadedToCloud = true;
                }
              }
            } catch (cloudErr) {
              console.warn("Cloud compcard upload failed, falling back:", cloudErr);
            }

            if (!uploadedToCloud) {
              try {
                const uploadDir = path.join(process.cwd(), "public", "uploads", "compcards");
                await mkdir(uploadDir, { recursive: true });
                const filepath = path.join(uploadDir, filename);
                await writeFile(filepath, buffer);
                photoUrl = `/uploads/compcards/${filename}`;
              } catch (fsErr) {
                console.warn("Local filesystem write failed (serverless environment):", fsErr);
              }
            }
          } catch (uploadErr) {
            console.error(`Gagal memproses file polaroid ${i}:`, uploadErr);
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
    } else if (isPhotographer) {
      const specialties = parseListInput(formData.get("specialties"));
      const capabilities = parseListInput(formData.get("capabilities"));
      const primary_camera = formData.get("primary_camera")?.toString().trim();
      const secondary_camera = formData.get("secondary_camera")?.toString().trim();
      const lenses = parseListInput(formData.get("lenses"));
      const lighting_gear = parseListInput(formData.get("lighting_gear"));
      const drone_aerial = formData.get("drone_aerial") === "true";
      const backdrop_types = parseListInput(formData.get("backdrop_types"));
      const tethering_available = formData.get("tethering_available") === "true";
      const shooting_duration_shift = formData.get("shooting_duration_shift")?.toString().trim();
      const max_people_onset = formData.get("max_people_onset") ? Number(formData.get("max_people_onset")) : undefined;
      const max_locations_per_day = formData.get("max_locations_per_day") ? Number(formData.get("max_locations_per_day")) : undefined;
      const deliverables = parseListInput(formData.get("deliverables"));
      const delivery_time_days = formData.get("delivery_time_days") ? Number(formData.get("delivery_time_days")) : undefined;

      if (specialties.length > 0) newAttributes.specialties = specialties;
      if (capabilities.length > 0) newAttributes.capabilities = capabilities;
      if (primary_camera) newAttributes.primary_camera = primary_camera;
      if (secondary_camera) newAttributes.secondary_camera = secondary_camera;
      if (lenses.length > 0) newAttributes.lenses = lenses;
      if (lighting_gear.length > 0) newAttributes.lighting_gear = lighting_gear;
      newAttributes.drone_aerial = drone_aerial;
      if (backdrop_types.length > 0) newAttributes.backdrop_types = backdrop_types;
      newAttributes.tethering_available = tethering_available;
      if (shooting_duration_shift) newAttributes.shooting_duration_shift = shooting_duration_shift;
      if (max_people_onset) newAttributes.max_people_onset = max_people_onset;
      if (max_locations_per_day) newAttributes.max_locations_per_day = max_locations_per_day;
      if (deliverables.length > 0) newAttributes.deliverables = deliverables;
      if (delivery_time_days) newAttributes.delivery_time_days = delivery_time_days;
    } else if (isVideographer) {
      const primary_cinema_camera =
        formData.get("primary_cinema_camera")?.toString().trim() ||
        formData.get("primary_camera")?.toString().trim();
      const rawLenses = formData.get("cine_lenses")?.toString().trim() || formData.get("lenses")?.toString().trim();
      const secondary_camera = formData.get("secondary_camera")?.toString().trim();
      const stabilizer_gimbal = formData.get("stabilizer_gimbal")?.toString().trim() || formData.get("stabilization_rigs")?.toString().trim();
      const audio_rig = formData.get("audio_rig")?.toString().trim() || formData.get("audio_gear")?.toString().trim();
      const max_resolution = formData.get("max_resolution")?.toString().trim() || "4K 60fps / 10-Bit 4:2:2";
      const drone_aerial = formData.get("drone_aerial") === "true";
      const specialties = parseListInput(formData.get("specialties"));
      const capabilities = parseListInput(formData.get("capabilities"));
      const deliverables = parseListInput(formData.get("deliverables"));
      const delivery_time_days = formData.get("delivery_time_days") ? Number(formData.get("delivery_time_days")) : undefined;

      if (primary_cinema_camera) {
        newAttributes.primary_cinema_camera = primary_cinema_camera;
        newAttributes.primary_camera = primary_cinema_camera;
      }
      if (secondary_camera) {
        newAttributes.secondary_camera = secondary_camera;
      }
      if (rawLenses) {
        const parsedLenses = parseListInput(rawLenses);
        newAttributes.lenses = parsedLenses;
        newAttributes.cine_lenses = parsedLenses;
      }
      if (stabilizer_gimbal) {
        newAttributes.stabilizer_gimbal = stabilizer_gimbal;
        newAttributes.stabilization_rigs = stabilizer_gimbal.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (audio_rig) {
        newAttributes.audio_rig = audio_rig;
        newAttributes.audio_gear = audio_rig.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (max_resolution) newAttributes.max_resolution = max_resolution;
      newAttributes.drone_aerial = drone_aerial;
      if (specialties.length > 0) newAttributes.specialties = specialties;
      if (capabilities.length > 0) newAttributes.capabilities = capabilities;
      if (deliverables.length > 0) newAttributes.deliverables = deliverables;
      if (delivery_time_days) newAttributes.delivery_time_days = delivery_time_days;
    } else if (isMUA) {
      const specialties = parseListInput(formData.get("specialties"));
      const services = parseListInput(formData.get("services"));
      const primary_kit_brands = parseListInput(formData.get("primary_kit_brands"));
      const hair_tools = parseListInput(formData.get("hair_tools"));
      const hair_specialties = parseListInput(formData.get("hair_specialties"));
      const onset_equipment = parseListInput(formData.get("onset_equipment"));
      const sanitation_standards = parseListInput(formData.get("sanitation_standards"));
      const max_heads_per_session = formData.get("max_heads_per_session") ? Number(formData.get("max_heads_per_session")) : undefined;
      const prep_time_minutes = formData.get("prep_time_minutes") ? Number(formData.get("prep_time_minutes")) : undefined;
      const touchup_standby_hours = formData.get("touchup_standby_hours") ? Number(formData.get("touchup_standby_hours")) : undefined;
      const experience_years = formData.get("experience_years") ? Number(formData.get("experience_years")) : undefined;

      if (specialties.length > 0) {
        newAttributes.specialties = specialties;
        newAttributes.makeup_styles = specialties;
      }
      if (services.length > 0) newAttributes.services = services;
      if (primary_kit_brands.length > 0) newAttributes.primary_kit_brands = primary_kit_brands;
      if (hair_tools.length > 0) newAttributes.hair_tools = hair_tools;
      if (hair_specialties.length > 0) newAttributes.hair_specialties = hair_specialties;
      if (onset_equipment.length > 0) newAttributes.onset_equipment = onset_equipment;
      if (sanitation_standards.length > 0) newAttributes.sanitation_standards = sanitation_standards;
      if (max_heads_per_session) newAttributes.max_heads_per_session = max_heads_per_session;
      if (prep_time_minutes) newAttributes.prep_time_minutes = prep_time_minutes;
      if (touchup_standby_hours) newAttributes.touchup_standby_hours = touchup_standby_hours;
      if (experience_years) newAttributes.experience_years = experience_years;
    } else if (isStylist) {
      const specialties = parseListInput(formData.get("styling_specialties") || formData.get("specialties"));
      const services = parseListInput(formData.get("services"));
      const onset_equipment = parseListInput(formData.get("onset_equipment"));
      const wardrobe_archive_count = formData.get("wardrobe_archive_count") ? Number(formData.get("wardrobe_archive_count")) : undefined;
      const showroom_partners = parseListInput(formData.get("showroom_partners"));
      const aesthetic_dna = formData.get("aesthetic_dna")?.toString().trim();
      const max_heads_per_session = formData.get("max_heads_per_session") ? Number(formData.get("max_heads_per_session")) : undefined;
      const prep_time_minutes = formData.get("prep_time_minutes") ? Number(formData.get("prep_time_minutes")) : undefined;
      const touchup_standby_hours = formData.get("touchup_standby_hours") ? Number(formData.get("touchup_standby_hours")) : undefined;

      if (specialties.length > 0) {
        newAttributes.styling_specialties = specialties;
        newAttributes.specialties = specialties;
      }
      if (services.length > 0) newAttributes.services = services;
      if (onset_equipment.length > 0) newAttributes.onset_equipment = onset_equipment;
      if (wardrobe_archive_count) newAttributes.wardrobe_archive_count = wardrobe_archive_count;
      if (showroom_partners.length > 0) newAttributes.showroom_partners = showroom_partners;
      if (aesthetic_dna) newAttributes.aesthetic_dna = aesthetic_dna;
      if (max_heads_per_session) newAttributes.max_heads_per_session = max_heads_per_session;
      if (prep_time_minutes) newAttributes.prep_time_minutes = prep_time_minutes;
      if (touchup_standby_hours) newAttributes.touchup_standby_hours = touchup_standby_hours;
    } else if (isDesigner) {
      const specialties = parseListInput(formData.get("specialties") || formData.get("design_disciplines"));
      const capabilities = parseListInput(formData.get("capabilities"));
      const sample_collection_ready = formData.get("sample_collection_ready") === "true";
      const materials_swatches = parseListInput(formData.get("materials_swatches"));
      const sewing_equipment = parseListInput(formData.get("sewing_equipment"));
      const sample_portfolio_count = formData.get("sample_portfolio_count") ? Number(formData.get("sample_portfolio_count")) : undefined;
      const sample_turnaround_days = formData.get("sample_turnaround_days")?.toString().trim();
      const batch_production_capacity = formData.get("batch_production_capacity")?.toString().trim();
      const collab_types = parseListInput(formData.get("collab_types"));
      const style_dna = formData.get("style_dna")?.toString().trim();
      const primary_software = parseListInput(formData.get("primary_software"));
      const deliverables = parseListInput(formData.get("deliverables"));

      if (specialties.length > 0) {
        newAttributes.specialties = specialties;
        newAttributes.design_disciplines = specialties;
      }
      if (capabilities.length > 0) newAttributes.capabilities = capabilities;
      newAttributes.sample_collection_ready = sample_collection_ready;
      if (materials_swatches.length > 0) newAttributes.materials_swatches = materials_swatches;
      if (sewing_equipment.length > 0) newAttributes.sewing_equipment = sewing_equipment;
      if (sample_portfolio_count) newAttributes.sample_portfolio_count = sample_portfolio_count;
      if (sample_turnaround_days) newAttributes.sample_turnaround_days = sample_turnaround_days;
      if (batch_production_capacity) newAttributes.batch_production_capacity = batch_production_capacity;
      if (collab_types.length > 0) newAttributes.collab_types = collab_types;
      if (style_dna) newAttributes.style_dna = style_dna;
      if (primary_software.length > 0) newAttributes.primary_software = primary_software;
      if (deliverables.length > 0) newAttributes.deliverables = deliverables;
    } else if (isBrand) {
      // Brand Identity & DNA
      const brand_category = parseListInput(formData.get("brand_category"));
      const product_types = parseListInput(formData.get("product_types"));
      const target_market = parseListInput(formData.get("target_market"));
      const design_dna = formData.get("design_dna")?.toString().trim();

      // Physical Resources & Samples
      const sample_sizes_ready = formData.get("sample_sizes_ready")?.toString().trim();
      const sample_skus_count = formData.get("sample_skus_count") ? Number(formData.get("sample_skus_count")) : undefined;
      const fabric_materials = parseListInput(formData.get("fabric_materials"));
      const capacity_monthly = formData.get("capacity_monthly")?.toString().trim();

      // Collaboration Needs & Projects
      const collaboration_needs = parseListInput(formData.get("collaboration_needs"));
      const campaign_types = parseListInput(formData.get("campaign_types"));
      const budget_range = formData.get("budget_range")?.toString().trim();
      const collab_timeline = formData.get("collab_timeline")?.toString().trim();
      const creator_requirements = formData.get("creator_requirements")?.toString().trim();
      const collab_types = parseListInput(formData.get("collab_types"));
      const collab_notes = formData.get("collab_notes")?.toString().trim();

      if (brand_category.length > 0) newAttributes.brand_category = brand_category;
      if (product_types.length > 0) newAttributes.product_types = product_types;
      if (target_market.length > 0) newAttributes.target_market = target_market;
      if (design_dna) newAttributes.design_dna = design_dna;
      if (sample_sizes_ready) newAttributes.sample_sizes_ready = sample_sizes_ready;
      if (sample_skus_count) newAttributes.sample_skus_count = sample_skus_count;
      if (fabric_materials.length > 0) newAttributes.fabric_materials = fabric_materials;
      if (capacity_monthly) newAttributes.capacity_monthly = capacity_monthly;
      if (collaboration_needs.length > 0) newAttributes.collaboration_needs = collaboration_needs;
      if (campaign_types.length > 0) newAttributes.campaign_types = campaign_types;
      if (budget_range) newAttributes.budget_range = budget_range;
      if (collab_timeline) newAttributes.collab_timeline = collab_timeline;
      if (creator_requirements) newAttributes.creator_requirements = creator_requirements;
      if (collab_types.length > 0) newAttributes.collab_types = collab_types;
      if (collab_notes !== undefined) newAttributes.collab_notes = collab_notes;
    } else if (isStudio) {
      const area_sqm = formData.get("area_sqm") ? Number(formData.get("area_sqm")) : undefined;
      const ceiling_height_m = formData.get("ceiling_height_m") ? Number(formData.get("ceiling_height_m")) : undefined;
      const space_type = parseListInput(formData.get("space_type"));
      const cyclorama_type = formData.get("cyclorama_type")?.toString().trim();
      const electrical_capacity = formData.get("electrical_capacity")?.toString().trim();
      const lighting_gear = parseListInput(formData.get("lighting_gear"));
      const available_setups = parseListInput(formData.get("available_setups"));
      const props_available = formData.get("props_available") === "true";
      const facilities = parseListInput(formData.get("facilities"));
      const max_people_capacity = formData.get("max_people_capacity") ? Number(formData.get("max_people_capacity")) : undefined;
      const max_crew_capacity = formData.get("max_crew_capacity") ? Number(formData.get("max_crew_capacity")) : undefined;
      const operating_hours = formData.get("operating_hours")?.toString().trim();
      const overtime_policy = formData.get("overtime_policy")?.toString().trim();

      if (area_sqm) newAttributes.area_sqm = area_sqm;
      if (ceiling_height_m) newAttributes.ceiling_height_m = ceiling_height_m;
      if (space_type.length > 0) newAttributes.space_type = space_type;
      if (cyclorama_type) newAttributes.cyclorama_type = cyclorama_type;
      if (electrical_capacity) newAttributes.electrical_capacity = electrical_capacity;
      if (lighting_gear.length > 0) newAttributes.lighting_gear = lighting_gear;
      if (available_setups.length > 0) newAttributes.available_setups = available_setups;
      newAttributes.props_available = props_available;
      if (facilities.length > 0) newAttributes.facilities = facilities;
      if (max_people_capacity) newAttributes.max_people_capacity = max_people_capacity;
      if (max_crew_capacity) newAttributes.max_crew_capacity = max_crew_capacity;
      if (operating_hours) newAttributes.operating_hours = operating_hours;
      if (overtime_policy) newAttributes.overtime_policy = overtime_policy;
    } else {
      const specialties = parseListInput(formData.get("specialties"));
      const capabilities = parseListInput(formData.get("capabilities"));
      if (specialties.length > 0) newAttributes.specialties = specialties;
      if (capabilities.length > 0) newAttributes.capabilities = capabilities;
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
        : isBrand
        ? "WARDROBE_PROP"
        : isPhotographer || isVideographer
        ? "EQUIPMENT"
        : "SKILL_TALENT";

      const subtype = isModel
        ? "Model Lookbook & Commercial"
        : isPhotographer
        ? "Fotografi & Kamera Komersial"
        : isVideographer
        ? "Videografi & Cinema Gear"
        : isStudio
        ? "Studio Space & Facilities"
        : isMUA
        ? "Tata Rias & Hair Styling"
        : isStylist
        ? "Styling & Wardrobe"
        : isDesigner
        ? "Desain Busana & Atelier"
        : isBrand
        ? "Koleksi & Spesifikasi Brand"
        : "Spesifikasi Profesi";

      const assetName = isModel
        ? `Karakteristik Fisik & Comp Card ${actor.name}`
        : isStudio
        ? `Fasilitas & Ruang Studio ${actor.name}`
        : isBrand
        ? `Karakteristik Koleksi & Produksi ${actor.name}`
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

async function getOrCreateServiceAsset(actorId: string, actorName: string) {
  let asset = await prisma.asset.findFirst({
    where: {
      actorId,
      subtype: "OPERATIONAL_SETTINGS",
    },
    orderBy: { createdAt: "desc" },
  });

  if (!asset) {
    asset = await prisma.asset.create({
      data: {
        actorId,
        category: "SKILL_TALENT",
        subtype: "OPERATIONAL_SETTINGS",
        name: `Layanan & Rekening ${actorName}`,
        description: `Pengaturan rekening pencairan dan ketersediaan ${actorName}`,
        roles: ["CAPABILITY"],
        attributes: {},
        sourceType: "SELF_REPORTED",
        confidenceLevel: "HIGH",
        status: "ACTIVE",
      },
    });
  }

  return asset;
}

export async function updatePayoutSettingsAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: Silakan login terlebih dahulu.");

    const actor = await prisma.actor.findFirst({
      where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    });
    if (!actor) throw new Error("Profil aktor tidak ditemukan.");

    const bankName = formData.get("bankName")?.toString().trim();
    const accountNumber = formData.get("accountNumber")?.toString().trim();
    const accountHolder = formData.get("accountHolder")?.toString().trim();
    const defaultDpPercentageRaw = formData.get("defaultDpPercentage")?.toString().trim();
    const paymentInstructions = formData.get("paymentInstructions")?.toString().trim();
    const npwpOrNik = formData.get("npwpOrNik")?.toString().trim() || "";
    const taxScheme = formData.get("taxScheme")?.toString().trim() || "NETT";
    const taxClassification = formData.get("taxClassification")?.toString().trim() || "INDIVIDUAL_FREELANCE";

    if (!bankName || !accountNumber || !accountHolder) {
      throw new Error("Nama Bank, Nomor Rekening, dan Nama Pemilik Rekening wajib diisi.");
    }

    const defaultDpPercentage = defaultDpPercentageRaw ? parseInt(defaultDpPercentageRaw, 10) : 50;

    const asset = await getOrCreateServiceAsset(actor.id, actor.name);
    const attrs = (asset.attributes && typeof asset.attributes === "object")
      ? (asset.attributes as Record<string, any>)
      : {};

    const updatedAttrs = {
      ...attrs,
      payoutAccount: {
        bankName,
        accountNumber,
        accountHolder,
        defaultDpPercentage,
        paymentInstructions: paymentInstructions || "",
        npwpOrNik,
        taxScheme,
        taxClassification,
        updatedAt: new Date().toISOString(),
      },
    };

    await prisma.asset.update({
      where: { id: asset.id },
      data: { attributes: updatedAttrs },
    });

    revalidatePath("/settings");
    revalidatePath("/settings/payout");
    revalidatePath("/dashboard/bookings");
    revalidatePath("/dashboard");

    return { success: true, message: "Rekening pencairan dana berhasil disimpan." };
  } catch (error: any) {
    console.error("Error updating payout settings:", error);
    return { success: false, error: error.message || "Gagal menyimpan rekening pencairan." };
  }
}

export async function updateAvailabilitySettingsAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: Silakan login terlebih dahulu.");

    const actor = await prisma.actor.findFirst({
      where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    });
    if (!actor) throw new Error("Profil aktor tidak ditemukan.");

    const isAvailable = formData.get("isAvailable") === "true";
    const statusNote = formData.get("statusNote")?.toString().trim() || "";
    const timezone = formData.get("timezone")?.toString().trim() || "WIB";
    const operationalHours = formData.get("operationalHours")?.toString().trim() || "08:00 - 18:00";
    const defaultStorageUrl = formData.get("defaultStorageUrl")?.toString().trim() || "";

    const asset = await getOrCreateServiceAsset(actor.id, actor.name);
    const attrs = (asset.attributes && typeof asset.attributes === "object")
      ? (asset.attributes as Record<string, any>)
      : {};

    const updatedAttrs = {
      ...attrs,
      availability: {
        isAvailable,
        statusNote,
        timezone,
        operationalHours,
        defaultStorageUrl,
        updatedAt: new Date().toISOString(),
      },
    };

    await prisma.asset.update({
      where: { id: asset.id },
      data: { attributes: updatedAttrs },
    });

    revalidatePath("/settings");
    revalidatePath("/settings/availability");
    revalidatePath("/directory");
    revalidatePath(`/directory/${actor.id}`);

    return { success: true, message: "Status ketersediaan dan jam operasional berhasil diperbarui." };
  } catch (error: any) {
    console.error("Error updating availability settings:", error);
    return { success: false, error: error.message || "Gagal memperbarui status ketersediaan." };
  }
}

export async function updateLegalDefaultsAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: Silakan login terlebih dahulu.");

    const actor = await prisma.actor.findFirst({
      where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    });
    if (!actor) throw new Error("Profil aktor tidak ditemukan.");

    const customClauses = formData.get("customClauses")?.toString().trim() || "";
    const defaultLicensing = formData.get("defaultLicensing")?.toString().trim() || "COMMERCIAL_LIMITED";
    const autoNda = formData.get("autoNda") === "true";
    const requireSampleCare = formData.get("requireSampleCare") === "true";
    const coCreditRule = formData.get("coCreditRule")?.toString().trim() || "";

    const asset = await getOrCreateServiceAsset(actor.id, actor.name);
    const attrs = (asset.attributes && typeof asset.attributes === "object")
      ? (asset.attributes as Record<string, any>)
      : {};

    const updatedAttrs = {
      ...attrs,
      legalDefaults: {
        customClauses,
        defaultLicensing,
        autoNda,
        requireSampleCare,
        coCreditRule,
        updatedAt: new Date().toISOString(),
      },
    };

    await prisma.asset.update({
      where: { id: asset.id },
      data: { attributes: updatedAttrs },
    });

    revalidatePath("/settings");
    revalidatePath("/settings/legal");
    revalidatePath("/dashboard/bookings");

    return { success: true, message: "Template klausul SPK dan hak cipta bawaan berhasil diperbarui." };
  } catch (error: any) {
    console.error("Error updating legal defaults:", error);
    return { success: false, error: error.message || "Gagal menyimpan template SPK." };
  }
}

export async function updatePasswordAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: Silakan login terlebih dahulu.");

    const newPassword = formData.get("newPassword")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    if (!newPassword || newPassword.length < 6) {
      throw new Error("Kata sandi baru minimal harus terdiri dari 6 karakter.");
    }

    if (newPassword !== confirmPassword) {
      throw new Error("Konfirmasi kata sandi tidak cocok.");
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message || "Gagal memperbarui kata sandi.");
    }

    return { success: true, message: "Kata sandi Anda berhasil diperbarui." };
  } catch (error: any) {
    console.error("Error updating password:", error);
    return { success: false, error: error.message || "Gagal memperbarui kata sandi." };
  }
}

export async function updateNotificationSettingsAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: Silakan login terlebih dahulu.");

    const actor = await prisma.actor.findFirst({
      where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    });
    if (!actor) throw new Error("Profil aktor tidak ditemukan.");

    const notifyBooking = formData.get("notifyBooking") === "true";
    const notifyMessage = formData.get("notifyMessage") === "true";
    const notifyBriefDigest = formData.get("notifyBriefDigest") === "true";

    const asset = await getOrCreateServiceAsset(actor.id, actor.name);
    const attrs = (asset.attributes && typeof asset.attributes === "object")
      ? (asset.attributes as Record<string, any>)
      : {};

    const updatedAttrs = {
      ...attrs,
      notificationPreferences: {
        notifyBooking,
        notifyMessage,
        notifyBriefDigest,
        updatedAt: new Date().toISOString(),
      },
    };

    await prisma.asset.update({
      where: { id: asset.id },
      data: { attributes: updatedAttrs },
    });

    revalidatePath("/settings");
    revalidatePath("/settings/notifications");

    return { success: true, message: "Preferensi notifikasi berhasil disimpan." };
  } catch (error: any) {
    console.error("Error updating notification settings:", error);
    return { success: false, error: error.message || "Gagal menyimpan preferensi notifikasi." };
  }
}

export async function updatePrivacySettingsAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: Silakan login terlebih dahulu.");

    const actor = await prisma.actor.findFirst({
      where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    });
    if (!actor) throw new Error("Profil aktor tidak ditemukan.");

    const hideContactPhone = formData.get("hideContactPhone") === "true";
    const hideContactEmail = formData.get("hideContactEmail") === "true";
    const verifiedOnlyInquiry = formData.get("verifiedOnlyInquiry") === "true";

    const asset = await getOrCreateServiceAsset(actor.id, actor.name);
    const attrs = (asset.attributes && typeof asset.attributes === "object")
      ? (asset.attributes as Record<string, any>)
      : {};

    const updatedAttrs = {
      ...attrs,
      privacySettings: {
        hideContactPhone,
        hideContactEmail,
        verifiedOnlyInquiry,
        updatedAt: new Date().toISOString(),
      },
    };

    await prisma.asset.update({
      where: { id: asset.id },
      data: { attributes: updatedAttrs },
    });

    revalidatePath("/settings");
    revalidatePath("/settings/security");
    revalidatePath("/directory");
    revalidatePath(`/directory/${actor.id}`);

    return { success: true, message: "Preferensi privasi dan visibilitas kontak berhasil disimpan." };
  } catch (error: any) {
    console.error("Error updating privacy settings:", error);
    return { success: false, error: error.message || "Gagal menyimpan preferensi privasi." };
  }
}

export async function exportUserDataAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: Silakan login terlebih dahulu.");

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
    });

    if (!profile) throw new Error("Data pengguna tidak ditemukan.");

    const actors = await prisma.actor.findMany({
      where: { ownerUserId: user.id },
      include: {
        assets: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            name: true,
            category: true,
            subtype: true,
            roles: true,
            description: true,
            attributes: true,
            createdAt: true,
          },
        },
        goals: true,
        needs: true,
        constraints: true,
        bookingRequestsSent: {
          take: 50,
          select: {
            id: true,
            targetId: true,
            status: true,
            startDate: true,
            endDate: true,
            budget: true,
            createdAt: true,
          },
        },
        bookingRequestsReceived: {
          take: 50,
          select: {
            id: true,
            requesterId: true,
            status: true,
            startDate: true,
            endDate: true,
            budget: true,
            createdAt: true,
          },
        },
      },
    });

    const exportData = {
      exportedAt: new Date().toISOString(),
      compliance: "UU PDP No. 27 Tahun 2022 (Hak Akses dan Portabilitas Data Pribadi)",
      platform: "RAMU - Ekosistem Kolaborasi Kreatif & Komersial",
      account: {
        id: profile.id,
        email: profile.email,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
        role: profile.role,
        registeredAt: profile.createdAt,
      },
      actors: actors.map((act) => ({
        id: act.id,
        name: act.name,
        actorType: act.actorType,
        sector: act.sector,
        location: act.location,
        contactEmail: act.contactEmail,
        contactPhone: act.contactPhone,
        websiteUrl: act.websiteUrl,
        isVerified: act.isVerified,
        registeredAt: act.createdAt,
        assets: act.assets,
        goals: act.goals,
        needs: act.needs,
        bookingsSent: act.bookingRequestsSent,
        bookingsReceived: act.bookingRequestsReceived,
      })),
    };

    return { success: true, data: exportData };
  } catch (error: any) {
    console.error("Error exporting user data:", error);
    return { success: false, error: error.message || "Gagal mengunduh salinan data pribadi." };
  }
}

export async function requestAccountDeletionAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: Silakan login terlebih dahulu.");

    const actor = await prisma.actor.findFirst({
      where: { ownerUserId: user.id },
    });

    if (actor) {
      await prisma.actor.update({
        where: { id: actor.id },
        data: {
          status: "ARCHIVED",
          archivedAt: new Date(),
        },
      });

      // Clear operational sensitive assets (payout, NIK, NPWP) in compliance with PDP erasure
      await prisma.asset.deleteMany({
        where: {
          actorId: actor.id,
          subtype: "OPERATIONAL_SETTINGS",
        },
      });
    }

    revalidatePath("/directory");
    revalidatePath("/settings");

    return {
      success: true,
      message: "Profil publik Anda telah dinonaktifkan dari direktori RAMU dan data sensitif rekening telah dihapus.",
    };
  } catch (error: any) {
    console.error("Error requesting account deletion:", error);
    return { success: false, error: error.message || "Gagal memproses permohonan penghapusan." };
  }
}

