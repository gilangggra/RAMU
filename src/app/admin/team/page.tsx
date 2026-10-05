import { Users } from "lucide-react";
import { prisma } from "@/infrastructure/database/prisma";
import { getAuthenticatedAdmin } from "../actions";
import TeamManagementClient from "./TeamManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const currentAdmin = await getAuthenticatedAdmin();

  // 1. Fetch profiles
  const profiles = await prisma.profile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      actors: {
        select: { id: true },
      },
    },
  });

  // 2. Query auth.users to inspect raw_user_meta_data->>'is_admin'
  let authUsersMap: Record<string, boolean> = {};
  try {
    const rawAuthUsers = await prisma.$queryRawUnsafe<
      Array<{ id: string; is_admin: boolean | null }>
    >(`
      SELECT id::text, (raw_user_meta_data->>'is_admin')::boolean as is_admin
      FROM auth.users
    `);

    for (const au of rawAuthUsers) {
      authUsersMap[au.id] = au.is_admin === true;
    }
  } catch (err) {
    console.error("Could not fetch auth.users metadata:", err);
  }

  // 3. Map into combined list
  const users = profiles.map((p) => {
    const isMetaAdmin = authUsersMap[p.id] === true;
    const isRoleAdmin = p.role === "SUPERADMIN";
    return {
      id: p.id,
      email: p.email,
      displayName: p.displayName,
      avatarUrl: p.avatarUrl,
      isAdmin: isMetaAdmin || isRoleAdmin,
      role: p.role,
      actorsCount: p.actors.length,
      createdAt: p.createdAt,
    };
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Users className="w-4 h-4 text-purple-600" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/70">
            Akses & Otoritas Sistem
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">Manajemen Akses Administrator</h1>
        <p className="text-xs text-stone-500 mt-1 font-normal">
          Beri atau cabut wewenang administrator platform untuk akun terdaftar tanpa perlu akses langsung ke database console.
        </p>
      </div>

      <TeamManagementClient users={users} currentAdminId={currentAdmin.adminId} />
    </div>
  );
}
