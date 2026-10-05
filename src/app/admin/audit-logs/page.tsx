import { ScrollText } from "lucide-react";
import { prisma } from "@/infrastructure/database/prisma";
import AuditLogsClient from "./AuditLogsClient";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  const auditLogs = await prisma.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <ScrollText className="w-4 h-4 text-purple-600" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/70">
            Sistem Keamanan & Kepatuhan
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">Audit Trail Aktivitas Admin</h1>
        <p className="text-xs text-stone-500 mt-1 font-normal">
          Rekaman mutasi permanen di tingkat basis data — melacak siapa, apa, target, dan rincian parameter perubahan.
        </p>
      </div>

      <AuditLogsClient initialLogs={auditLogs} />
    </div>
  );
}
