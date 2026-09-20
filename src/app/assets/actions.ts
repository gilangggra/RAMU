"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { AssetCategory, AssetRole, AssetStatus, SourceType, ConfidenceLevel, Prisma } from "@prisma/client";

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

  if (!name || !category || !subtype) {
    redirect(`/assets?error=${encodeURIComponent("Nama, Kategori, dan Subtipe aset wajib diisi.")}`);
  }

  const validCategories = Object.values(AssetCategory);
  if (!validCategories.includes(category)) {
    redirect(`/assets?error=${encodeURIComponent("Kategori aset tidak valid.")}`);
  }

  const validRoles = Object.values(AssetRole);
  const roles = rolesRaw.filter((r) => validRoles.includes(r as AssetRole)) as AssetRole[];

  // Parse atribut opsional
  const capacity = formData.get("capacity") as string;
  const unit = formData.get("unit") as string;
  const minimumOrder = formData.get("minimumOrder") as string;
  const leadTimeDays = formData.get("leadTimeDays") as string;

  const attributes: Record<string, unknown> = {};
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
    redirect(`/assets?error=${encodeURIComponent("Gagal menyimpan aset: " + (e?.message?.split("\n")[0] || "Error"))}`);
  }

  revalidatePath("/assets");
  revalidatePath("/dashboard");
  redirect("/assets");
}

export async function archiveAsset(assetId: string) {
  const actor = await getPrimaryActor();

  await prisma.asset.updateMany({
    where: { id: assetId, actorId: actor.id },
    data: { status: AssetStatus.ARCHIVED, archivedAt: new Date() },
  });

  revalidatePath("/assets");
  revalidatePath("/dashboard");
}
