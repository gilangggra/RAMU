import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { ProfileForm } from "@/components/settings/ProfileForm";

export default async function SettingsProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id },
    select: {
      name: true,
      sector: true,
      description: true,
      location: true,
      websiteUrl: true,
      contactEmail: true,
      contactPhone: true,
    },
  });

  if (!actor) {
    redirect("/onboarding");
  }

  return (
    <div className="space-y-6">
      <ProfileForm initialData={actor} />
    </div>
  );
}
