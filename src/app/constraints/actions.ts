"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import {
  ConstraintType,
  ConstraintSeverity,
  ConstraintOperator,
  Negotiability,
  SourceType,
  ConfidenceLevel,
  Prisma,
} from "@prisma/client";

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

export async function createConstraint(formData: FormData) {
  const actor = await getPrimaryActor();

  const type = (formData.get("type") as string)?.trim() as ConstraintType;
  const valueRaw = (formData.get("value") as string)?.trim();
  const unit = (formData.get("unit") as string)?.trim() || null;
  const severity = ((formData.get("severity") as string)?.trim() || "SOFT") as ConstraintSeverity;
  const negotiability = ((formData.get("negotiability") as string)?.trim() || "NEGOTIABLE") as Negotiability;
  const notes = (formData.get("notes") as string)?.trim() || null;

  const returnTo = (formData.get("returnTo") as string) || "/readiness?tab=constraints";
  const baseUrl = returnTo.split("?")[0];
  const queryStr = returnTo.includes("?") ? returnTo.slice(returnTo.indexOf("?")) : "";

  if (!type || !valueRaw) {
    redirect(`${baseUrl}${queryStr ? `${queryStr}&` : "?"}error=${encodeURIComponent("Tipe dan nilai batasan wajib diisi.")}`);
  }

  const validTypes = Object.values(ConstraintType);
  if (!validTypes.includes(type)) {
    redirect(`${baseUrl}${queryStr ? `${queryStr}&` : "?"}error=${encodeURIComponent("Tipe batasan tidak valid.")}`);
  }

  // Nilai disimpan sebagai JSON — bisa string, angka, atau array
  let value: unknown;
  try {
    value = JSON.parse(valueRaw);
  } catch {
    value = valueRaw; // simpan sebagai string biasa jika bukan JSON valid
  }

  try {
    await prisma.constraint.create({
      data: {
        actorId: actor.id,
        type,
        value: value as Prisma.InputJsonValue,
        unit,
        operator: ConstraintOperator.LTE,
        severity,
        negotiability,
        sourceType: SourceType.SELF_REPORTED,
        confidenceLevel: ConfidenceLevel.MEDIUM,
        notes,
      },
    });
  } catch (e: any) {
    redirect(`${baseUrl}${queryStr ? `${queryStr}&` : "?"}error=${encodeURIComponent("Gagal menyimpan batasan: " + (e?.message?.split("\n")[0] || "Error"))}`);
  }

  revalidatePath("/readiness");
  revalidatePath("/constraints");
  revalidatePath("/dashboard");
  redirect(returnTo);
}

export async function deleteConstraint(constraintId: string) {
  const actor = await getPrimaryActor();

  await prisma.constraint.deleteMany({
    where: { id: constraintId, actorId: actor.id },
  });

  revalidatePath("/readiness");
  revalidatePath("/constraints");
  revalidatePath("/dashboard");
}
