import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { ArrowLeft } from "lucide-react";
import { ShowcaseManager } from "./ShowcaseManager";

export const metadata = {
  title: "Kelola Portofolio | RAMU Dashboard",
  description: "Unggah dan atur portofolio karya visual Anda.",
};

export default async function DashboardShowcasePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const primaryActor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
    include: {
      owner: {
        select: {
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!primaryActor) {
    redirect("/onboarding");
  }

  const portfolioAssets = await prisma.asset.findMany({
    where: {
      actorId: primaryActor.id,
      category: "PORTFOLIO_WORK",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const registeredActors = await prisma.actor.findMany({
    where: { status: { not: "ARCHIVED" } },
    select: {
      id: true,
      name: true,
      sector: true,
      location: true,
    },
    orderBy: {
      name: "asc",
    },
    take: 100,
  });

  return (
    <AppShell actor={primaryActor} activeRoute="/showcase">
      <div className="space-y-6 pb-12">
        <Link
          href="/showcase"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Galeri Karya</span>
        </Link>
        <ShowcaseManager assets={portfolioAssets} registeredActors={registeredActors} />
      </div>
    </AppShell>
  );
}
