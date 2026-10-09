"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { initiateCollaboration } from "@/app/collaborations/actions";
import { Sparkles, CheckCircle2, X, Send, Users, Calendar, DollarSign, FileText } from "lucide-react";
import { toast } from "@/components/ui/Toast";
import { CurrencyInput } from "@/components/ui/CurrencyInput";

export interface ParticipantInfo {
  actorId?: string;
  name: string;
  sector?: string;
  roleLabel?: string | null;
  roleCode?: string;
}

export interface InitiateCollaborationButtonProps {
  opportunityId: string;
  existingCollaborationId?: string | null;
  opportunityTitle?: string;
  patternName?: string;
  participants?: ParticipantInfo[];
  initialBudget?: string;
  initialTimeline?: string;
  className?: string;
}

export function InitiateCollaborationButton({
  opportunityId,
  existingCollaborationId,
  opportunityTitle,
  patternName,
  participants = [],
  initialBudget = "Rp 15.000.000",
  initialTimeline = "3-4 Minggu",
  className = "",
}: InitiateCollaborationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [proposedBudget, setProposedBudget] = useState(initialBudget);
  const [targetLaunch, setTargetLaunch] = useState(initialTimeline);
  const [costSharingModel, setCostSharingModel] = useState("Bagi Hasil & Fee Produksi Terverifikasi");
  const [proposalMessage, setProposalMessage] = useState(
    "Halo, saya melihat potensi sinergi aset komplementer kita pada peluang ini. Mari buka ruang negosiasi dan sepakati pembagian peran serta target pelaksanaan bersama."
  );
  const router = useRouter();

  if (existingCollaborationId) {
    return (
      <Link
        href={`/collaborations/${existingCollaborationId}`}
        className={`btn-primary-pill inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all text-white !bg-emerald-600 hover:!bg-emerald-700 ${className}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
        <span>Buka Workspace Kolaborasi</span>
      </Link>
    );
  }

  async function handleSendInvitation(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await initiateCollaboration(opportunityId, {
        proposedBudget: proposedBudget.trim() || undefined,
        targetLaunch: targetLaunch.trim() || undefined,
        costSharingModel: costSharingModel.trim() || undefined,
        proposalMessage: proposalMessage.trim() || undefined,
      });

      if (res.success && res.collaborationId) {
        toast.success("Undangan kolaborasi berhasil dikirim!");
        setIsOpen(false);
        router.push(`/collaborations/${res.collaborationId}`);
      } else {
        toast.error(res.error || "Gagal menginisiasi kolaborasi.");
      }
    } catch {
      toast.error("Terjadi kesalahan teknis saat menginisiasi kolaborasi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`btn-primary-pill inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold shadow-md shadow-[#4CC9FE]/25 cursor-pointer group transition-all text-white ${className}`}
      >
        <Sparkles className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-white" />
        <span>Ajukan Inisiasi Kolaborasi</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-[22px] border border-slate-200/90 shadow-2xl p-6 sm:p-7 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#4CC9FE]/15 text-[#0284c7] border border-[#4CC9FE]/30">
                  <Sparkles className="w-3 h-3" />
                  <span>Proposal Inisiasi Kolaboratif</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Inisiasi Kolaborasi &amp; Ajukan Proposal
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Kirimkan draf proposal awal ke calon mitra untuk membuka ruang kerja dan memulai negosiasi kesepakatan resmi secara transparan.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                aria-label="Tutup modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {participants.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>Mitra Kolaborasi yang Dilibatkan ({participants.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {participants.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-2.5 text-xs"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#4CC9FE]/20 text-[#0284c7] font-bold flex items-center justify-center text-xs shrink-0">
                        {p.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 truncate">{p.name}</div>
                        <div className="text-[10px] text-[#0284c7] font-medium truncate">
                          {p.roleLabel || p.roleCode || p.sector || "Mitra Kolaborator"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSendInvitation} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>Estimasi Anggaran / Nilai Proyek</span>
                </label>
                <CurrencyInput
                  value={proposedBudget}
                  onChange={(val) => setProposedBudget(val)}
                  placeholder="Rp 15.000.000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all"
                />
                <span className="text-[11px] text-slate-500 font-normal block">
                  Estimasi nilai produksi atau valuasi proyek bersama. Dapat disesuaikan kembali dalam ruang negosiasi.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#0284c7]" />
                    <span>Target Timeline Pelaksanaan</span>
                  </label>
                  <input
                    type="text"
                    value={targetLaunch}
                    onChange={(e) => setTargetLaunch(e.target.value)}
                    placeholder="Contoh: 3-4 Minggu atau Akhir Bulan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#0284c7]" />
                    <span>Model Kompensasi Awal</span>
                  </label>
                  <select
                    value={costSharingModel}
                    onChange={(e) => setCostSharingModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all"
                  >
                    <option value="Bagi Hasil & Fee Produksi Terverifikasi">Bagi Hasil &amp; Fee Produksi</option>
                    <option value="Barter Komplementer (Resource Sharing)">Barter Kapasitas Idle &amp; Co-Credit</option>
                    <option value="Fee Tetap Per Peran (Fixed Role Fee)">Fee Tetap Per Peran Kerja</option>
                    <option value="Proporsional Sesuai SPK">Proporsional Sesuai SPK Platform</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Pesan Pembuka &amp; Visi Kolaborasi (Proposal Pitch)
                </label>
                <textarea
                  rows={3}
                  value={proposalMessage}
                  onChange={(e) => setProposalMessage(e.target.value)}
                  placeholder="Jelaskan alasan Anda menginisiasi proyek ini dan bagaimana aset masing-masing pihak saling melengkapi..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all leading-relaxed"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary-pill inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold shadow-md shadow-[#4CC9FE]/25 cursor-pointer text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-3.5 w-3.5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Mempersiapkan Workspace...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-white" />
                      <span>Kirim Undangan &amp; Buka Ruang Negosiasi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
