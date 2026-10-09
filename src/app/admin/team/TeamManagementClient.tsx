"use client";

import { useState, useTransition } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  Search,
  UserCheck,
  UserX,
  X,
  AlertTriangle,
  Loader2,
  Users,
  CheckCircle2,
} from "lucide-react";
import { grantAdminRoleAction, revokeAdminRoleAction } from "../actions";

interface TeamUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  role: string;
  actorsCount: number;
  createdAt: Date | string;
}

export default function TeamManagementClient({
  users,
  currentAdminId,
}: {
  users: TeamUser[];
  currentAdminId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "USER">("ALL");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: "GRANT" | "REVOKE";
    user: TeamUser | null;
  }>({
    open: false,
    type: "GRANT",
    user: null,
  });

  const filteredUsers = users.filter((u) => {
    if (roleFilter === "ADMIN" && !u.isAdmin) return false;
    if (roleFilter === "USER" && u.isAdmin) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.displayName.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
    }
    return true;
  });

  const adminCount = users.filter((u) => u.isAdmin).length;

  const handleConfirmAction = () => {
    if (!confirmModal.user) return;
    const target = confirmModal.user;

    startTransition(async () => {
      if (confirmModal.type === "GRANT") {
        const res = await grantAdminRoleAction(target.id, target.email);
        if (res.success) {
          setFeedback({
            type: "success",
            text: `Hak akses administrator berhasil diberikan kepada ${target.displayName || target.email}.`,
          });
          setConfirmModal({ open: false, type: "GRANT", user: null });
        } else {
          setFeedback({ type: "error", text: res.error || "Gagal mengangkat admin." });
        }
      } else {
        const res = await revokeAdminRoleAction(target.id, target.email);
        if (res.success) {
          setFeedback({
            type: "success",
            text: `Hak akses administrator ${target.displayName || target.email} berhasil dicabut.`,
          });
          setConfirmModal({ open: false, type: "REVOKE", user: null });
        } else {
          setFeedback({ type: "error", text: res.error || "Gagal mencabut hak akses admin." });
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            className="hover:opacity-75 p-1 rounded transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700 border border-purple-200/70">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              Total Pengguna
            </p>
            <p className="text-xl font-bold text-stone-900">{users.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 border border-emerald-200/70">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              Administrator Aktif
            </p>
            <p className="text-xl font-bold text-emerald-700">{adminCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700 border border-purple-200/70">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              Level Keamanan
            </p>
            <p className="text-xs font-bold text-stone-900 mt-1">Multi-Admin RBAC</p>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setRoleFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
              roleFilter === "ALL"
                ? "bg-stone-900 text-white font-semibold shadow-2xs"
                : "bg-white border border-stone-200/90 text-stone-600 font-medium hover:text-stone-900"
            }`}
          >
            Semua ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter("ADMIN")}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
              roleFilter === "ADMIN"
                ? "bg-stone-900 text-white font-semibold shadow-2xs"
                : "bg-white border border-stone-200/90 text-stone-600 font-medium hover:text-stone-900"
            }`}
          >
            Admin Saja ({adminCount})
          </button>
          <button
            onClick={() => setRoleFilter("USER")}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
              roleFilter === "USER"
                ? "bg-stone-900 text-white font-semibold shadow-2xs"
                : "bg-white border border-stone-200/90 text-stone-600 font-medium hover:text-stone-900"
            }`}
          >
            Pengguna Biasa ({users.length - adminCount})
          </button>
        </div>
      </div>

      {/* Users / Admins Table */}
      <div className="rounded-2xl bg-white border border-stone-200/90 overflow-hidden shadow-2xs">
        <div className="px-5 py-4 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/70">
          <h2 className="text-sm font-bold text-stone-900">Daftar Pengguna & Hak Akses</h2>
          <span className="text-[11px] text-stone-500 font-normal">
            Menampilkan {filteredUsers.length} pengguna
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Tidak Ada Pengguna Ditemukan</h3>
            <p className="text-xs text-stone-500">
              Coba sesuaikan kata kunci pencarian atau filter peranan.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredUsers.map((u) => {
              const isSelf = u.id === currentAdminId;

              return (
                <div
                  key={u.id}
                  className="p-4 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-xs font-bold text-stone-900 shrink-0 overflow-hidden">
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt={u.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        u.displayName?.slice(0, 2).toUpperCase() || "U"
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-stone-900">
                          {u.displayName || "Tanpa Nama"}
                        </span>
                        {isSelf && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/70">
                            Akun Anda
                          </span>
                        )}
                        {u.isAdmin ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                            <ShieldCheck className="w-3 h-3" />
                            Administrator
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-stone-600 px-2 py-0.5 rounded bg-stone-100 border border-stone-200">
                            Pengguna ({u.role})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-500 mt-0.5 font-normal">
                        <span>{u.email}</span>
                        <span>•</span>
                        <span>{u.actorsCount} entitas profil kreator</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {u.isAdmin ? (
                      <button
                        disabled={isSelf || isPending}
                        onClick={() =>
                          setConfirmModal({
                            open: true,
                            type: "REVOKE",
                            user: u,
                          })
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isSelf
                            ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                            : "bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100"
                        }`}
                        title={isSelf ? "Anda tidak dapat mencabut hak akses Anda sendiri" : "Cabut Wewenang Admin"}
                      >
                        <UserX className="w-3.5 h-3.5" />
                        Cabut Akses Admin
                      </button>
                    ) : (
                      <button
                        disabled={isPending}
                        onClick={() =>
                          setConfirmModal({
                            open: true,
                            type: "GRANT",
                            user: u,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Angkat Jadi Admin
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.open && confirmModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  confirmModal.type === "GRANT"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                    : "bg-rose-50 text-rose-700 border border-rose-200/70"
                }`}
              >
                {confirmModal.type === "GRANT" ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {confirmModal.type === "GRANT"
                    ? "Angkat Sebagai Administrator?"
                    : "Cabut Hak Akses Administrator?"}
                </h3>
                <p className="text-xs text-stone-500 font-normal">Konfirmasi perubahan wewenang sistem</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-semibold">Nama:</span>
                <span className="font-bold text-stone-900">{confirmModal.user.displayName || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-semibold">Email:</span>
                <span className="font-mono text-stone-700">{confirmModal.user.email}</span>
              </div>
              <div className="pt-2 border-t border-stone-200/80 text-stone-600 text-[11px] leading-relaxed">
                {confirmModal.type === "GRANT" ? (
                  <p>
                    Pengguna ini akan memiliki akses penuh ke <strong>Panel Admin RAMU (/admin)</strong>, termasuk
                    kemampuan moderasi brief, sengketa, kurasi badge, dan tata kelola sistem.
                  </p>
                ) : (
                  <p>
                    Pengguna ini akan kehilangan seluruh akses ke <strong>Panel Admin RAMU (/admin)</strong> dan
                    kembali berstatus sebagai anggota biasa.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                disabled={isPending}
                onClick={() => setConfirmModal({ open: false, type: "GRANT", user: null })}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Batal
              </button>
              <button
                disabled={isPending}
                onClick={handleConfirmAction}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors shadow-2xs ${
                  confirmModal.type === "GRANT"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {confirmModal.type === "GRANT" ? "Ya, Angkat Jadi Admin" : "Ya, Cabut Akses"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
