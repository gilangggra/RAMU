"use client";

import { useState } from "react";
import {
  ScrollText,
  Shield,
  Search,
  Filter,
  Eye,
  X,
  Clock,
  User,
  Layers,
  ChevronRight,
} from "lucide-react";

interface AuditLogItem {
  id: string;
  adminId: string;
  adminName: string | null;
  actionType: string;
  targetEntity: string;
  targetId: string | null;
  detailsJson: any;
  createdAt: Date | string;
}

export default function AuditLogsClient({
  initialLogs,
}: {
  initialLogs: AuditLogItem[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<string>("ALL");
  const [selectedAction, setSelectedAction] = useState<string>("ALL");
  const [activeLog, setActiveLog] = useState<AuditLogItem | null>(null);

  // Collect unique entities and actions for filters
  const entities = Array.from(new Set(initialLogs.map((l) => l.targetEntity))).filter(Boolean);
  const actions = Array.from(new Set(initialLogs.map((l) => l.actionType))).filter(Boolean);

  // Filter logs
  const filteredLogs = initialLogs.filter((log) => {
    if (selectedEntity !== "ALL" && log.targetEntity !== selectedEntity) return false;
    if (selectedAction !== "ALL" && log.actionType !== selectedAction) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = log.adminName?.toLowerCase().includes(q);
      const matchAction = log.actionType.toLowerCase().includes(q);
      const matchEntity = log.targetEntity.toLowerCase().includes(q);
      const matchTargetId = log.targetId?.toLowerCase().includes(q);
      const matchDetails = JSON.stringify(log.detailsJson || {}).toLowerCase().includes(q);
      if (!matchName && !matchAction && !matchEntity && !matchTargetId && !matchDetails) return false;
    }
    return true;
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes("APPROVED") || action.includes("RESTORE") || action.includes("GRANTED") || action.includes("RESOLVED")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (action.includes("BAN") || action.includes("SUSPEND") || action.includes("TAKEN_DOWN") || action.includes("REVOKED") || action.includes("DELETED")) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (action.includes("WARN") || action.includes("REVISION") || action.includes("TIMEOUT")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    return "bg-sky-50 text-sky-700 border-sky-200";
  };

  return (
    <div className="space-y-6">
      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Cari admin, ID target, atau detail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400"
            />
          </div>

          {/* Filter Entity */}
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-stone-400 shrink-0" />
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400"
            >
              <option value="ALL">Semua Entitas ({initialLogs.length})</option>
              {entities.map((ent) => (
                <option key={ent} value={ent}>
                  Entitas: {ent}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Action */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400 shrink-0" />
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400"
            >
              <option value="ALL">Semua Jenis Aksi</option>
              {actions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
          <span>
            Menampilkan <strong className="text-stone-900">{filteredLogs.length}</strong> dari {initialLogs.length} log audit permanen
          </span>
          {(searchQuery || selectedEntity !== "ALL" || selectedAction !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedEntity("ALL");
                setSelectedAction("ALL");
              }}
              className="text-purple-700 font-bold hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Table / List */}
      <div className="rounded-2xl bg-white border border-stone-200/90 overflow-hidden shadow-2xs">
        <div className="px-5 py-4 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-bold text-stone-900">Log Aktivitas & Mutasi Admin</h2>
          </div>
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
            Postgres Audit Trail
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
              <ScrollText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Belum Ada Riwayat Aktivitas Audit</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Tidak ada catatan mutasi yang cocok dengan kriteria filter saat ini.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredLogs.map((log) => {
              const dateStr = new Date(log.createdAt).toLocaleString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });

              return (
                <div
                  key={log.id}
                  onClick={() => setActiveLog(log)}
                  className="px-5 py-3.5 hover:bg-stone-50/80 transition-colors cursor-pointer group flex items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${getActionBadgeColor(
                          log.actionType
                        )}`}
                      >
                        {log.actionType}
                      </span>
                      <span className="text-[10px] font-semibold text-stone-600 px-2 py-0.5 rounded bg-stone-100 border border-stone-200">
                        {log.targetEntity}
                      </span>
                      {log.targetId && (
                        <span className="text-[10px] font-mono text-stone-400 truncate max-w-[140px]">
                          #{log.targetId.slice(0, 8)}...
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-stone-600">
                      <span className="inline-flex items-center gap-1 font-semibold text-stone-900">
                        <User className="w-3 h-3 text-stone-400" />
                        {log.adminName || "Administrator"}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="text-stone-500 truncate max-w-md text-[11px]">
                        {JSON.stringify(log.detailsJson || {}).slice(0, 80)}...
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 text-[11px] text-stone-400 font-medium">
                        <Clock className="w-3 h-3 text-stone-300" />
                        {dateStr}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {activeLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-700 border border-purple-200/70">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Rincian Log Audit</h3>
                  <p className="text-xs text-stone-500 font-normal">ID: {activeLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveLog(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <div>
                  <span className="block text-[10px] font-bold text-stone-400 uppercase">Pelaksana</span>
                  <span className="font-bold text-stone-900">{activeLog.adminName || "Administrator"}</span>
                  <span className="block text-[10px] text-stone-400 font-mono mt-0.5 truncate">
                    {activeLog.adminId}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-stone-400 uppercase">Waktu Eksekusi</span>
                  <span className="font-semibold text-stone-700">
                    {new Date(activeLog.createdAt).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <div>
                  <span className="block text-[10px] font-bold text-stone-400 uppercase">Jenis Aksi</span>
                  <span
                    className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded border ${getActionBadgeColor(
                      activeLog.actionType
                    )}`}
                  >
                    {activeLog.actionType}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-stone-400 uppercase">Target Entitas</span>
                  <span className="font-semibold text-stone-700">{activeLog.targetEntity}</span>
                  {activeLog.targetId && (
                    <span className="block text-[10px] text-stone-400 font-mono mt-0.5 truncate">
                      {activeLog.targetId}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                  Payload & Data Mutasi (JSON)
                </span>
                <pre className="p-3.5 rounded-xl bg-stone-900 text-purple-300 font-mono text-[11px] overflow-x-auto max-h-52">
                  {JSON.stringify(activeLog.detailsJson, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 text-right">
              <button
                onClick={() => setActiveLog(null)}
                className="px-4 py-2 rounded-lg bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
