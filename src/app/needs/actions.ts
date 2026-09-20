"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { NeedCategory, NeedStatus } from "@prisma/client";

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

export async function createNeed(formData: FormData) {
  const actor = await getPrimaryActor();

  const category = (formData.get("category") as string)?.trim() as NeedCategory;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const relatedGoalId = (formData.get("relatedGoalId") as string)?.trim() || null;
  const priorityStr = formData.get("priority") as string;

  if (!category || !title) {
    redirect(`/needs?error=${encodeURIComponent("Kategori dan judul kebutuhan wajib diisi.")}`);
  }

  const validCategories = Object.values(NeedCategory);
  if (!validCategories.includes(category)) {
    redirect(`/needs?error=${encodeURIComponent("Kategori kebutuhan tidak valid.")}`);
  }

  const priority = Math.min(5, Math.max(1, parseInt(priorityStr) || 3));

  try {
    await prisma.need.create({
      data: {
        actorId: actor.id,
        category,
        title,
        description: description || null,
        relatedGoalId: relatedGoalId || null,
        priority,
        status: NeedStatus.ACTIVE,
      },
    });
  } catch (e: any) {
    redirect(`/needs?error=${encodeURIComponent("Gagal menyimpan kebutuhan: " + (e?.message?.split("\n")[0] || "Error"))}`);
  }

  revalidatePath("/needs");
  revalidatePath("/dashboard");
  redirect("/needs");
}

export async function deleteNeed(needId: string) {
  const actor = await getPrimaryActor();

  await prisma.need.deleteMany({
    where: { id: needId, actorId: actor.id },
  });

  revalidatePath("/needs");
  revalidatePath("/dashboard");
}
