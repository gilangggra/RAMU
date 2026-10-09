import { prisma } from "@/infrastructure/database/prisma";
import { UserManagementClient } from "./UserManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  let actors: any[] = [];
  try {
    actors = await prisma.actor.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        owner: { select: { email: true } },
        _count: { select: { assets: true, bookingRequestsReceived: true } },
      },
    });
  } catch (error) {
    console.error("Gagal memuat data talenta & studio admin:", error);
    actors = [];
  }

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
      <div className="border-b border-stone-200/70 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/70">
            Trust &amp; Safety • User Moderation
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight mt-1">
          Manajemen Talenta &amp; Studio
        </h1>
        <p className="text-xs text-stone-500 leading-relaxed font-normal mt-0.5">
          Kelola status kepatuhan akun, kurasi spotlight hero section, dan sanksi pelanggaran pedoman.
        </p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs">
          <div className="text-xl font-bold text-emerald-700">{statusCounts.ACTIVE}</div>
          <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">Aktif</div>
        </div>
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs">
          <div className="text-xl font-bold text-amber-700">{statusCounts.CURATED}</div>
          <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">★ Spotlight</div>
        </div>
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs">
          <div className="text-xl font-bold text-sky-700">{statusCounts.VERIFIED}</div>
          <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">✓ Verified</div>
        </div>
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs">
          <div className="text-xl font-bold text-stone-700">{statusCounts.DRAFT}</div>
          <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">Draf</div>
        </div>
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs">
          <div className="text-xl font-bold text-amber-800">{statusCounts.SUSPENDED}</div>
          <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">Suspended</div>
        </div>
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-white to-stone-50/80 border border-stone-200/80 shadow-2xs">
          <div className="text-xl font-bold text-rose-700">{statusCounts.BANNED}</div>
          <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">Banned</div>
        </div>
      </div>

      {/* Interactive Table Client Component */}
      <UserManagementClient initialActors={actors as any} />
    </div>
  );
}

