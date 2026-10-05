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
        <div className="flex items-center gap-2 mb-1">
          <ScrollText className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
            Sistem Keamanan & Kepatuhan
          </span>
        </div>
        <h1 className="text-2xl font-black text-[#27213D]">Audit Trail Aktivitas Admin</h1>
        <p className="text-sm text-stone-500 mt-1">
          Rekaman mutasi permanen di tingkat basis data — melacak siapa, apa, target, dan rincian parameter perubahan.
        </p>
      </div>

      <AuditLogsClient initialLogs={auditLogs} />
    </div>
  );
}
