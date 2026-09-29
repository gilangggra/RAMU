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
      owner: {
        select: {
          avatarUrl: true,
        },
      },
    },
  });

  if (!actor) {
    redirect("/onboarding");
  }

  const profileData = {
    name: actor.name,
    sector: actor.sector,
    description: actor.description,
    location: actor.location,
    websiteUrl: actor.websiteUrl,
    contactEmail: actor.contactEmail,
    contactPhone: actor.contactPhone,
    avatarUrl: actor.owner?.avatarUrl || null,
  };

  return (
    <div className="space-y-6">
      <ProfileForm initialData={profileData} />
    </div>
  );
}
