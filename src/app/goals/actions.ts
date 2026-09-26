"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { GoalCategory, GoalStatus } from "@prisma/client";

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

export async function createGoal(formData: FormData) {
  const actor = await getPrimaryActor();

  const category = (formData.get("category") as string)?.trim() as GoalCategory;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const priorityStr = formData.get("priority") as string;

  const returnTo = (formData.get("returnTo") as string) || "/readiness?tab=goals";
  const baseUrl = returnTo.split("?")[0];
  const queryStr = returnTo.includes("?") ? returnTo.slice(returnTo.indexOf("?")) : "";

  if (!category || !title) {
    redirect(`${baseUrl}${queryStr ? `${queryStr}&` : "?"}error=${encodeURIComponent("Kategori dan judul target wajib diisi.")}`);
  }

  const validCategories = Object.values(GoalCategory);
  if (!validCategories.includes(category)) {
    redirect(`${baseUrl}${queryStr ? `${queryStr}&` : "?"}error=${encodeURIComponent("Kategori target tidak valid.")}`);
  }

  const priority = Math.min(5, Math.max(1, parseInt(priorityStr) || 3));

  try {
    await prisma.goal.create({
      data: {
        actorId: actor.id,
        category,
        title,
        description: description || null,
        priority,
        status: GoalStatus.ACTIVE,
      },
    });
  } catch (e: any) {
    redirect(`${baseUrl}${queryStr ? `${queryStr}&` : "?"}error=${encodeURIComponent("Gagal menyimpan target: " + (e?.message?.split("\n")[0] || "Error"))}`);
  }

  revalidatePath("/readiness");
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  redirect(returnTo);
}

export async function deleteGoal(goalId: string) {
  const actor = await getPrimaryActor();

  await prisma.goal.deleteMany({
    where: { id: goalId, actorId: actor.id },
  });

  revalidatePath("/readiness");
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}
