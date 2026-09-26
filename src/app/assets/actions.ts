"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { AssetCategory, AssetRole, AssetStatus, SourceType, ConfidenceLevel, Prisma } from "@prisma/client";

import { writeFile, mkdir } from "fs/promises";
import path from "path";

async function getPrimaryActor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "asc" },
  });

  if (!actor) redirect("/onboarding");
  return actor;
}

export async function createAsset(formData: FormData) {
  const actor = await getPrimaryActor();

  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string)?.trim() as AssetCategory;
  const subtype = (formData.get("subtype") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const rolesRaw = formData.getAll("roles") as string[];

  const returnTo = (formData.get("returnTo") as string) || "/readiness?tab=assets";
  const baseUrl = returnTo.split("?")[0];
  const queryStr = returnTo.includes("?") ? returnTo.slice(returnTo.indexOf("?")) : "";

  if (!name || !category || !subtype) {
    redirect(`${baseUrl}${queryStr ? `${queryStr}&` : "?"}error=${encodeURIComponent("Nama, Kategori, dan Subtipe aset wajib diisi.")}`);
  }

  const validCategories = Object.values(AssetCategory);
  if (!validCategories.includes(category)) {
    redirect(`${baseUrl}${queryStr ? `${queryStr}&` : "?"}error=${encodeURIComponent("Kategori aset tidak valid.")}`);
  }

  const validRoles = Object.values(AssetRole);
  const roles = rolesRaw.filter((r) => validRoles.includes(r as AssetRole)) as AssetRole[];

  // 1. Handle file foto langsung dari pengguna (Direct Upload)
  const imageFile = formData.get("imageFile") as File | null;
  let finalImageUrl: string | null = null;

  if (imageFile && imageFile.size > 0 && typeof imageFile.arrayBuffer === "function") {
    try {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filename = `${Date.now()}-${safeName}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "assets");
      await mkdir(uploadDir, { recursive: true });
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      finalImageUrl = `/uploads/assets/${filename}`;
    } catch (uploadErr) {
      console.error("Gagal menyimpan file foto aset:", uploadErr);
    }
  }

  // Fallback jika ada URL
  if (!finalImageUrl) {
    const rawUrl = (formData.get("imageUrl") as string)?.trim();
    if (rawUrl) finalImageUrl = rawUrl;
  }

  // Parse atribut teknis opsional
  const gearSpecs = (formData.get("gearSpecs") as string)?.trim();
  const condition = (formData.get("condition") as string)?.trim();
  const capacity = formData.get("capacity") as string;
  const unit = formData.get("unit") as string;
  const minimumOrder = formData.get("minimumOrder") as string;
  const leadTimeDays = formData.get("leadTimeDays") as string;

  const attributes: Record<string, unknown> = {};
  if (finalImageUrl) attributes.image_url = finalImageUrl;
  if (gearSpecs) attributes.gear_specs = gearSpecs;
  if (condition) attributes.condition = condition;
  if (capacity) attributes.capacity = Number(capacity);
  if (unit) attributes.unit = unit.trim();
  if (minimumOrder) attributes.minimum_order = Number(minimumOrder);
  if (leadTimeDays) attributes.lead_time_days = Number(leadTimeDays);

  try {
    await prisma.asset.create({
      data: {
        actorId: actor.id,
        category,
        subtype,
        name,
        description,
        roles,
        attributes: attributes as Prisma.InputJsonValue,
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.MEDIUM,
        status: AssetStatus.ACTIVE,
      },
    });
  } catch (e: any) {
    redirect(`${baseUrl}${queryStr ? `${queryStr}&` : "?"}error=${encodeURIComponent("Gagal menyimpan aset: " + (e?.message?.split("\n")[0] || "Error"))}`);
  }

  revalidatePath("/readiness");
  revalidatePath("/assets");
  revalidatePath("/dashboard");
  redirect(returnTo);
}

export async function archiveAsset(assetId: string) {
  const actor = await getPrimaryActor();

  await prisma.asset.updateMany({
    where: { id: assetId, actorId: actor.id },
    data: { status: AssetStatus.ARCHIVED, archivedAt: new Date() },
  });

  revalidatePath("/readiness");
  revalidatePath("/assets");
  revalidatePath("/dashboard");
}
