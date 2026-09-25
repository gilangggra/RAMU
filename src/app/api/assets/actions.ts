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

    if (!name || !subtype || !imageUrl) {
      throw new Error("Missing required fields");
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
          project_url: projectUrl || null,
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
