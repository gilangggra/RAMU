import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/infrastructure/database/prisma";

import { isUserAdmin } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isUserAdmin(user)) {
    redirect("/dashboard");
  }

  const adminName =
    user.user_metadata?.display_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Admin";

  const adminAvatar =
    user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

  // Double role = admin yang juga punya profil kreator/actor
  const actorCount = await prisma.actor.count({
    where: { ownerUserId: user.id },
  });
  const isDoubleRole = actorCount > 0;

  return (
    <AdminShell adminName={adminName} adminAvatar={adminAvatar} isDoubleRole={isDoubleRole}>
      {children}
    </AdminShell>
  );
}
