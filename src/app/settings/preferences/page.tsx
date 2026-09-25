import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { PreferencesForm } from "@/components/settings/PreferencesForm";

export default async function SettingsPreferencesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const actor = await prisma.actor.findFirst({
    where: { ownerUserId: user.id },
    select: {
      experienceLevel: true,
      aestheticStyles: true,
      compensationModels: true,
    },
  });

  if (!actor) {
    redirect("/onboarding");
  }

  return (
    <div className="space-y-6">
      <PreferencesForm initialData={actor} />
    </div>
  );
}
