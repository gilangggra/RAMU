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
    orderBy: { createdAt: "asc" },
  });

  if (!primaryActor) {
    redirect("/onboarding");
  }

  // Fetch only PORTFOLIO_WORK assets for the current user
  const portfolioAssets = await prisma.asset.findMany({
    where: {
      actorId: primaryActor.id,
      category: "PORTFOLIO_WORK",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <AppShell actor={primaryActor} activeRoute="/dashboard">
      <div className="space-y-6 pb-12">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-[#1E1B2E] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>
        <ShowcaseManager assets={portfolioAssets} />
      </div>
    </AppShell>
  );
}
