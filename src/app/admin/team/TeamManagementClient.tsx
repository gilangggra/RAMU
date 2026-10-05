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
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Total Pengguna
            </p>
            <p className="text-xl font-black text-[#27213D]">{users.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Administrator Aktif
            </p>
            <p className="text-xl font-black text-emerald-700">{adminCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Level Keamanan
            </p>
            <p className="text-xs font-bold text-[#27213D] mt-1">Multi-Admin RBAC</p>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setRoleFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              roleFilter === "ALL"
                ? "bg-[#27213D] text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Semua ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter("ADMIN")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              roleFilter === "ADMIN"
                ? "bg-emerald-600 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Admin Saja ({adminCount})
          </button>
          <button
            onClick={() => setRoleFilter("USER")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              roleFilter === "USER"
                ? "bg-stone-700 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Pengguna Biasa ({users.length - adminCount})
          </button>
        </div>
      </div>

      {/* Users / Admins Table */}
      <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <h2 className="text-sm font-bold text-[#27213D]">Daftar Pengguna & Hak Akses</h2>
          <span className="text-[11px] text-stone-400">
            Menampilkan {filteredUsers.length} pengguna
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-700">Tidak Ada Pengguna Ditemukan</h3>
            <p className="text-xs text-stone-400">
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
                    <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-xs font-bold text-[#27213D] shrink-0 overflow-hidden">
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
                        <span className="text-sm font-bold text-[#27213D]">
                          {u.displayName || "Tanpa Nama"}
                        </span>
                        {isSelf && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Akun Anda
                          </span>
                        )}
                        {u.isAdmin ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" />
                            Administrator
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-stone-500 px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200">
                            Pengguna ({u.role})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-400 mt-0.5">
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
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          isSelf
                            ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                            : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  confirmModal.type === "GRANT"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                {confirmModal.type === "GRANT" ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#27213D]">
                  {confirmModal.type === "GRANT"
                    ? "Angkat Sebagai Administrator?"
                    : "Cabut Hak Akses Administrator?"}
                </h3>
                <p className="text-xs text-stone-400">Konfirmasi perubahan wewenang sistem</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-stone-400 font-semibold">Nama:</span>
                <span className="font-bold text-[#27213D]">{confirmModal.user.displayName || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400 font-semibold">Email:</span>
                <span className="font-mono text-stone-700">{confirmModal.user.email}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 text-stone-600 text-[11px] leading-relaxed">
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
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Batal
              </button>
              <button
                disabled={isPending}
                onClick={handleConfirmAction}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors ${
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
