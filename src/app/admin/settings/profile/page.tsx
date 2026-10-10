import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { parseSocialLinks } from "@/lib/socialUtils";
import { AdminProfileForm } from "@/components/admin/settings/AdminProfileForm";

export const metadata = {
  title: "Profil & Identitas | Pengaturan Admin RAMU",
  description: "Kelola foto, nama, dan kontak akun administrator RAMU.",
};

export default async function AdminSettingsProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profile, actor] = await Promise.all([
    prisma.profile.findUnique({
      where: { id: user.id },
      select: { displayName: true, avatarUrl: true },
    }),
    prisma.actor.findFirst({
      where: { ownerUserId: user.id, status: { not: "ARCHIVED" } },
      orderBy: { createdAt: "asc" },
      select: { name: true, contactEmail: true, contactPhone: true, websiteUrl: true },
    }),
  ]);

  const meta = (user.user_metadata || {}) as Record<string, unknown>;
  const metaContact = ((meta.admin_contact as Record<string, string | null>) || {}) as Record<string, string | null>;

  const instagramHandle = actor
    ? parseSocialLinks(actor.websiteUrl).instagram?.handle || null
    : metaContact.instagram
      ? `@${metaContact.instagram}`
      : null;

  const profileData = {
    name: String(
      profile?.displayName ||
        actor?.name ||
        (meta.display_name as string) ||
        user.email?.split("@")[0] ||
        "Admin"
    ),
    contactEmail: actor ? actor.contactEmail : metaContact.contactEmail || null,
    contactPhone: actor ? actor.contactPhone : metaContact.contactPhone || null,
    instagram: instagramHandle,
    avatarUrl:
      profile?.avatarUrl ||
      (meta.avatar_url as string | null) ||
      (meta.picture as string | null) ||
      null,
  };

  return (
    <div className="space-y-6">
      <AdminProfileForm initialData={profileData} />
    </div>
  );
}
