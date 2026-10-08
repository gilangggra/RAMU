"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { revalidatePath } from "next/cache";
import { AssetCategory, SourceType, ConfidenceLevel, AssetStatus } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { createNotification } from "@/application/notificationService";

export async function createShowcaseAsset(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const targetActorId = formData.get("actorId") as string | null;
    let actor = null;
    if (targetActorId) {
      actor = await prisma.actor.findFirst({
        where: { id: targetActorId, ownerUserId: user.id },
      });
    }
    if (!actor) {
      actor = await prisma.actor.findFirst({
        where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
        orderBy: { createdAt: "asc" },
      });
    }

    if (!actor) throw new Error("Actor profile not found");

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const subtype = formData.get("subtype") as string;
    let imageUrl = formData.get("imageUrl") as string;
    const projectUrl = formData.get("projectUrl") as string;
    const imageFile = formData.get("imageFile") as File | null;

    const mediaType = (formData.get("mediaType") as string) || "IMAGE";
    let videoSource = (formData.get("videoSource") as string) || null;
    let videoUrl = (formData.get("videoUrl") as string) || "";
    const aspectRatio = (formData.get("aspectRatio") as string) || "16:9";
    const videoFile = formData.get("videoFile") as File | null;

    if (videoFile && videoFile.size > 0 && typeof videoFile.arrayBuffer === "function") {
      const videoBytes = await videoFile.arrayBuffer();
      const videoBuffer = Buffer.from(videoBytes);
      const safeVideoName = videoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const cleanVideoName = `${Date.now()}-${safeVideoName}`;
      let uploadedToCloud = false;

      // Coba unggah langsung ke Supabase Storage bucket 'portfolios'
      try {
        const { data: storageData, error: storageError } = await supabase.storage
          .from("portfolios")
          .upload(`videos/${cleanVideoName}`, videoBuffer, {
            contentType: videoFile.type || "video/mp4",
            upsert: true,
          });

        if (!storageError && storageData) {
          const { data: publicUrlData } = supabase.storage
            .from("portfolios")
            .getPublicUrl(storageData.path);
          if (publicUrlData?.publicUrl) {
            videoUrl = publicUrlData.publicUrl;
            videoSource = "DIRECT_UPLOAD";
            uploadedToCloud = true;
          }
        }
      } catch (cloudErr) {
        console.warn("Supabase storage upload failed, falling back to local filesystem:", cloudErr);
      }

      if (!uploadedToCloud) {
        const videoUploadDir = path.join(process.cwd(), 'public', 'uploads', 'portfolios', 'videos');
        try {
          await mkdir(videoUploadDir, { recursive: true });
        } catch (e) {}
        const videoFilePath = path.join(videoUploadDir, cleanVideoName);
        await writeFile(videoFilePath, videoBuffer);
        videoUrl = `/uploads/portfolios/videos/${cleanVideoName}`;
        videoSource = "DIRECT_UPLOAD";
      }
    }

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`;
      let uploadedToCloud = false;

      // Coba unggah langsung ke Supabase Storage bucket 'portfolios'
      try {
        const { data: imgStorageData, error: imgStorageError } = await supabase.storage
          .from("portfolios")
          .upload(`images/${filename}`, buffer, {
            contentType: imageFile.type || "image/jpeg",
            upsert: true,
          });

        if (!imgStorageError && imgStorageData) {
          const { data: publicImgUrl } = supabase.storage
            .from("portfolios")
            .getPublicUrl(imgStorageData.path);
          if (publicImgUrl?.publicUrl) {
            imageUrl = publicImgUrl.publicUrl;
            uploadedToCloud = true;
          }
        }
      } catch (cloudErr) {
        console.warn("Supabase storage image upload failed, falling back to local filesystem:", cloudErr);
      }

      if (!uploadedToCloud) {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'portfolios');
        try {
          await mkdir(uploadDir, { recursive: true });
        } catch (e) {}
        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);
        imageUrl = `/uploads/portfolios/${filename}`;
      }
    }

    if (mediaType === "VIDEO" && !imageUrl && videoUrl) {
      const ytMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/);
      if (ytMatch && ytMatch[1]) {
        imageUrl = `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
        if (!videoSource) videoSource = "YOUTUBE";
      } else if (videoUrl.includes("vimeo.com")) {
        if (!videoSource) videoSource = "VIMEO";
        imageUrl = "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=800&auto=format&fit=crop";
      }
    }

    if (!name || !subtype) {
      throw new Error("Missing required fields: Judul dan Kategori wajib diisi");
    }

    if (mediaType === "VIDEO" && !videoUrl && !videoFile) {
      throw new Error("Mohon sediakan tautan video atau unggah file video portofolio Anda.");
    }

    if (!imageUrl) {

      imageUrl = "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800&auto=format&fit=crop";
    }

    const tearSheetRaw = formData.get("tearSheet") as string | null;
    let tearSheetData = null;
    if (tearSheetRaw) {
      try {
        tearSheetData = JSON.parse(tearSheetRaw);
      } catch (e) {
        console.error("Failed to parse tearSheet JSON:", e);
      }
    }

    const newAsset = await prisma.asset.create({
      data: {
        actorId: actor.id,
        category: AssetCategory.PORTFOLIO_WORK,
        subtype,
        name,
        description,
        roles: ["OUTPUT"],
        attributes: {
          image_url: imageUrl,
          media_type: mediaType,
          video_url: videoUrl || null,
          video_source: videoSource || null,
          aspect_ratio: aspectRatio,
          project_url: projectUrl || null,
          ...(tearSheetData ? { tear_sheet: tearSheetData } : {}),
        },
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.HIGH,
        status: AssetStatus.ACTIVE,
      },
    });

    if (tearSheetData?.credits && Array.isArray(tearSheetData.credits)) {
      for (const c of tearSheetData.credits) {
        if (c.actorId && c.actorId !== actor.id) {
          await createNotification({
            actorId: c.actorId,
            title: "Penyematan Kredit Kru Baru",
            message: `${actor.name} menyematkan Anda sebagai ${c.role || "Kru"} pada karya "${name}". Tinjau dan konfirmasi keterlibatan Anda.`,
            type: "INFO",
            link: "/dashboard",
            metadata: { assetId: newAsset.id, role: c.role },
          }).catch((err) => console.error("Error creating tag notification:", err));
        }
      }
    }

    revalidatePath("/dashboard/showcase");
    revalidatePath("/showcase");
    revalidatePath(`/directory/${actor.id}`);

    return { success: true, asset: newAsset };
  } catch (error: any) {
    console.error("Error creating showcase asset:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteShowcaseAsset(assetId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const userActors = await prisma.actor.findMany({
      where: { ownerUserId: user.id },
      select: { id: true },
    });
    const userActorIds = userActors.map((a) => a.id);

    if (userActorIds.length === 0) throw new Error("Actor profile not found");

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset || !userActorIds.includes(asset.actorId)) {
      throw new Error("Asset not found or unauthorized");
    }

    await prisma.asset.delete({
      where: { id: assetId },
    });

    revalidatePath("/dashboard/showcase");
    revalidatePath("/showcase");
    revalidatePath(`/directory/${asset.actorId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting showcase asset:", error);
    return { success: false, error: error.message };
  }
}

export async function claimCoCreditAction(params: {
  assetId: string;
  role: string;
  details?: string;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Silakan masuk (login) terlebih dahulu untuk mengajukan klaim.");

    const actor = await prisma.actor.findFirst({
      where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    });

    if (!actor) throw new Error("Profil kreator tidak ditemukan.");

    const asset = await prisma.asset.findUnique({
      where: { id: params.assetId },
      include: { actor: true },
    });

    if (!asset) throw new Error("Karya tidak ditemukan.");

    if (asset.actorId === actor.id) {
      throw new Error("Anda adalah pemilik dan pengunggah portofolio ini.");
    }

    const attrs = (asset.attributes as any) || {};
    const tearSheet = attrs.tear_sheet || {
      verified: false,
      verificationRate: "50%",
      spkNumber: `RAMU-TS-${Date.now().toString().slice(-6)}`,
      credits: [],
    };

    const credits = Array.isArray(tearSheet.credits) ? [...tearSheet.credits] : [];

    const existingIndex = credits.findIndex((c: any) => c.actorId === actor.id);
    if (existingIndex >= 0) {
      const existing = credits[existingIndex];
      if (existing.verified || existing.status === "VERIFIED") {
        throw new Error("Anda sudah terdaftar sebagai kru terverifikasi pada karya ini.");
      }
      if (existing.status === "PENDING") {
        throw new Error("Pengajuan klaim kredit Anda sedang menunggu persetujuan pemilik karya.");
      }
      credits[existingIndex] = {
        ...existing,
        role: params.role,
        details: params.details || `Mengajukan klaim kontribusi peran sebagai ${params.role}`,
        status: "PENDING",
        verified: false,
        claimedByActorId: actor.id,
        claimedAt: new Date().toISOString(),
      };
    } else {
      credits.push({
        actorId: actor.id,
        name: actor.name,
        role: params.role,
        details: params.details || `Mengajukan klaim kontribusi peran sebagai ${params.role}`,
        handle: `@${actor.name.toLowerCase().replace(/[\s&.]+/g, "_")}`,
        verified: false,
        status: "PENDING",
        isUploader: false,
        claimedByActorId: actor.id,
        claimedAt: new Date().toISOString(),
      });
    }

    await prisma.asset.update({
      where: { id: params.assetId },
      data: {
        attributes: {
          ...attrs,
          tear_sheet: {
            ...tearSheet,
            credits,
          },
        },
      },
    });

    await createNotification({
      actorId: asset.actorId,
      title: "Pengajuan Klaim Co-Credit",
      message: `${actor.name} mengajukan klaim kontribusi peran sebagai ${params.role} pada karya "${asset.name}".`,
      type: "INFO",
      link: "/dashboard",
      metadata: { assetId: asset.id, claimantId: actor.id, role: params.role },
    }).catch((err) => console.error("Error sending claim notification:", err));

    revalidatePath("/dashboard");
    revalidatePath("/showcase");
    revalidatePath(`/directory/${actor.id}`);
    revalidatePath(`/directory/${asset.actorId}`);
    revalidatePath("/dashboard/showcase");

    return { success: true, assetName: asset.name };
  } catch (error: any) {
    console.error("Error claiming co-credit:", error);
    return { success: false, error: error.message };
  }
}

export async function confirmCoCredit(assetId: string, targetActorId?: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const actor = await prisma.actor.findFirst({
      where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    });

    if (!actor) throw new Error("Actor profile not found");

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: { actor: true },
    });

    if (!asset) throw new Error("Asset not found");

    const attrs = (asset.attributes as any) || {};
    const tearSheet = attrs.tear_sheet || {
      verified: true,
      verifiedBy: "RAMU Protocol",
      verificationRate: "100%",
      spkNumber: `RAMU-TS-${Date.now().toString().slice(-6)}`,
      credits: [],
    };

    const existingCredits = Array.isArray(tearSheet.credits) ? [...tearSheet.credits] : [];

    const isOwner = asset.actorId === actor.id;
    const effectiveTargetId = isOwner
      ? (targetActorId || existingCredits.find((c: any) => c.status === "PENDING")?.actorId)
      : actor.id;

    let updated = false;
    const newCredits = existingCredits.map((c: any) => {
      if (c.actorId === effectiveTargetId) {
        updated = true;
        return {
          ...c,
          verified: true,
          status: "VERIFIED",
          verificationTimestamp: new Date().toISOString(),
          verifiedBy: isOwner
            ? `Disetujui langsung oleh pemilik karya (@${actor.name.toLowerCase().replace(/[\s&.]+/g, "_")})`
            : `Dikonfirmasi langsung oleh @${actor.name.toLowerCase().replace(/[\s&.]+/g, "_")}`,
          verificationMethod: isOwner ? "OWNER_APPROVED" : "PEER_CONFIRMED",
        };
      }
      return c;
    });

    if (!updated && effectiveTargetId === actor.id) {
      newCredits.push({
        actorId: actor.id,
        name: actor.name,
        role: actor.sector.toLowerCase().includes("foto")
          ? "Director of Photography"
          : "Lead Creative Co-Collaborator",
        handle: `@${actor.name.toLowerCase().replace(/[\s&.]+/g, "_")}`,
        verified: true,
        status: "VERIFIED",
        isUploader: false,
        verificationTimestamp: new Date().toISOString(),
        verifiedBy: `Dikonfirmasi langsung oleh @${actor.name.toLowerCase().replace(/[\s&.]+/g, "_")}`,
        verificationMethod: "PEER_CONFIRMED",
      });
    }

    const totalCr = newCredits.length;
    const verifiedCr = newCredits.filter((c: any) => c.verified).length;
    const newRate = totalCr > 0 ? `${Math.round((verifiedCr / totalCr) * 100)}%` : "100%";

    await prisma.asset.update({
      where: { id: assetId },
      data: {
        attributes: {
          ...attrs,
          tear_sheet: {
            ...tearSheet,
            verificationRate: newRate,
            credits: newCredits,
          },
        },
      },
    });

    if (effectiveTargetId && effectiveTargetId !== actor.id) {
      await createNotification({
        actorId: effectiveTargetId,
        title: "Kredit Kru Disetujui",
        message: `Klaim kredit Anda pada karya "${asset.name}" telah disetujui dan kini aktif di portofolio Anda.`,
        type: "INFO",
        link: "/showcase?scope=mine",
        metadata: { assetId: asset.id },
      }).catch((err) => console.error("Error sending approval notification:", err));
    }

    revalidatePath("/dashboard");
    revalidatePath("/showcase");
    revalidatePath(`/directory/${actor.id}`);
    revalidatePath(`/directory/${asset.actorId}`);
    revalidatePath("/dashboard/showcase");

    return { success: true, assetName: asset.name };
  } catch (error: any) {
    console.error("Error confirming co-credit:", error);
    return { success: false, error: error.message };
  }
}

export async function rejectCoCredit(assetId: string, targetActorId?: string, reason?: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const actor = await prisma.actor.findFirst({
      where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    });

    if (!actor) throw new Error("Actor profile not found");

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) throw new Error("Asset not found");

    const attrs = (asset.attributes as any) || {};
    const tearSheet = attrs.tear_sheet || { credits: [] };
    const existingCredits = Array.isArray(tearSheet.credits) ? [...tearSheet.credits] : [];

    const isOwner = asset.actorId === actor.id;
    const effectiveTargetId = isOwner
      ? (targetActorId || existingCredits.find((c: any) => c.status === "PENDING")?.actorId)
      : actor.id;

    const newCredits = existingCredits.map((c: any) => {
      if (c.actorId === effectiveTargetId) {
        return {
          ...c,
          verified: false,
          status: "REJECTED",
          rejectedAt: new Date().toISOString(),
          rejectionReason:
            reason ||
            (isOwner ? "Ditolak oleh pemilik karya" : "Ditolak oleh pemilik nama"),
        };
      }
      return c;
    });

    await prisma.asset.update({
      where: { id: assetId },
      data: {
        attributes: {
          ...attrs,
          tear_sheet: {
            ...tearSheet,
            credits: newCredits,
          },
        },
      },
    });

    if (effectiveTargetId && effectiveTargetId !== actor.id) {
      await createNotification({
        actorId: effectiveTargetId,
        title: "Penyematan Kredit Ditolak",
        message: `Penyematan kredit pada karya "${asset.name}" tidak dapat disetujui.`,
        type: "INFO",
        link: "/showcase",
        metadata: { assetId: asset.id },
      }).catch((err) => console.error("Error sending rejection notification:", err));
    }

    revalidatePath("/dashboard");
    revalidatePath("/showcase");
    revalidatePath(`/directory/${actor.id}`);
    revalidatePath(`/directory/${asset.actorId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error rejecting co-credit:", error);
    return { success: false, error: error.message };
  }
}
