import { prisma } from "@/infrastructure/database/prisma";
import { Users } from "lucide-react";
import { UserManagementClient } from "./UserManagementClient";

export default async function AdminUsersPage() {
  const actors = await prisma.actor.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      owner: { select: { email: true } },
      _count: { select: { assets: true, bookingRequestsReceived: true } },
    },
  });

  const statusCounts = {
    ACTIVE: actors.filter((a) => a.status === "ACTIVE").length,
    DRAFT: actors.filter((a) => a.status === "DRAFT").length,
    SUSPENDED: actors.filter((a) => a.status === "SUSPENDED").length,
    BANNED: actors.filter((a) => a.status === "BANNED").length,
    VERIFIED: actors.filter((a) => a.isVerified).length,
    CURATED: actors.filter((a) => a.isCurated).length,
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
            Trust & Safety
          </span>
        </div>
        <h1 className="text-2xl font-black text-[#27213D]">
          Manajemen Talenta & Studio
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Kelola status kepatuhan akun, kurasi spotlight hero section, dan sanksi pelanggaran pedoman.
        </p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <div className="text-2xl font-black text-emerald-600">{statusCounts.ACTIVE}</div>
          <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-1">Aktif</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <div className="text-2xl font-black text-amber-600">{statusCounts.CURATED}</div>
          <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-1">★ Spotlight</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <div className="text-2xl font-black text-sky-600">{statusCounts.VERIFIED}</div>
          <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-1">✓ Verified</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <div className="text-2xl font-black text-stone-600">{statusCounts.DRAFT}</div>
          <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-1">Draf</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <div className="text-2xl font-black text-amber-700">{statusCounts.SUSPENDED}</div>
          <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-1">Suspended</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <div className="text-2xl font-black text-rose-600">{statusCounts.BANNED}</div>
          <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-1">Banned</div>
        </div>
      </div>

      {/* Interactive Table Client Component */}
      <UserManagementClient initialActors={actors as any} />
    </div>
  );
}

