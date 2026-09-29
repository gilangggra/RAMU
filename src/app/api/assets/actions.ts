"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { revalidatePath } from "next/cache";
import { AssetCategory, SourceType, ConfidenceLevel, AssetStatus } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function createShowcaseAsset(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const actor = await prisma.actor.findFirst({
      where: { ownerUserId: user.id },
    });

    if (!actor) throw new Error("Actor profile not found");

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const subtype = formData.get("subtype") as string;
    let imageUrl = formData.get("imageUrl") as string;
    const projectUrl = formData.get("projectUrl") as string;
    const imageFile = formData.get("imageFile") as File | null;

    // Video metadata & direct video upload handling
    const mediaType = (formData.get("mediaType") as string) || "IMAGE";
    let videoSource = (formData.get("videoSource") as string) || null;
    let videoUrl = (formData.get("videoUrl") as string) || "";
    const aspectRatio = (formData.get("aspectRatio") as string) || "16:9";
    const videoFile = formData.get("videoFile") as File | null;

    // Handle direct video upload
    if (videoFile && videoFile.size > 0) {
      const videoBytes = await videoFile.arrayBuffer();
      const videoBuffer = Buffer.from(videoBytes);
      const cleanVideoName = `${Date.now()}-${videoFile.name.replace(/\s+/g, '-')}`;
      const videoUploadDir = path.join(process.cwd(), 'public', 'uploads', 'portfolios', 'videos');

      try {
        await mkdir(videoUploadDir, { recursive: true });
      } catch (e) {
        // ignore if exists
      }

      const videoFilePath = path.join(videoUploadDir, cleanVideoName);
      await writeFile(videoFilePath, videoBuffer);
      videoUrl = `/uploads/portfolios/videos/${cleanVideoName}`;
      videoSource = "DIRECT_UPLOAD";
    }

    // Handle poster cover image upload
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'portfolios');
      
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (e) {
        // ignore if exists
      }

      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      imageUrl = `/uploads/portfolios/${filename}`;
    }

    // Auto-detect YouTube thumbnail if cover image wasn't uploaded manually
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
      // Fallback poster for video or general portfolio
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
        roles: ["OUTPUT"], // Default role for portfolio works
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

    const actor = await prisma.actor.findFirst({
      where: { ownerUserId: user.id },
    });

    if (!actor) throw new Error("Actor profile not found");

    // Verify ownership
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset || asset.actorId !== actor.id) {
      throw new Error("Asset not found or unauthorized");
    }

    await prisma.asset.delete({
      where: { id: assetId },
    });

    revalidatePath("/dashboard/showcase");
    revalidatePath("/showcase");
    revalidatePath(`/directory/${actor.id}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting showcase asset:", error);
    return { success: false, error: error.message };
  }
}

export async function confirmCoCredit(assetId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

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

    // Update the credit entry for this actor
    let updated = false;
    const newCredits = existingCredits.map((c: any) => {
      if (c.actorId === actor.id) {
        updated = true;
        return {
          ...c,
          verified: true,
          status: "VERIFIED",
          verificationTimestamp: new Date().toISOString(),
          verifiedBy: `Dikonfirmasi langsung oleh @${actor.name.toLowerCase().replace(/[\s&.]+/g, "_")}`,
          verificationMethod: "PEER_CONFIRMED",
        };
      }
      return c;
    });

    if (!updated) {
      newCredits.push({
        actorId: actor.id,
        name: actor.name,
        role: actor.sector.toLowerCase().includes("foto") ? "Director of Photography" : "Lead Creative Co-Collaborator",
        handle: `@${actor.name.toLowerCase().replace(/[\s&.]+/g, "_")}`,
        verified: true,
        status: "VERIFIED",
        isUploader: false,
        verificationTimestamp: new Date().toISOString(),
        verifiedBy: `Dikonfirmasi langsung oleh @${actor.name.toLowerCase().replace(/[\s&.]+/g, "_")}`,
        verificationMethod: "PEER_CONFIRMED",
      });
    }

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

export async function rejectCoCredit(assetId: string, reason?: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

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

    const newCredits = existingCredits.map((c: any) => {
      if (c.actorId === actor.id) {
        return {
          ...c,
          verified: false,
          status: "REJECTED",
          rejectedAt: new Date().toISOString(),
          rejectionReason: reason || "Ditolak oleh pemilik nama",
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
