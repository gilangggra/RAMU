"use client";

import { useState } from "react";
import {
  updateCollaborationTerms,
  createTask,
  toggleTaskStatus,
  updateMilestoneStatus,
  recordDecision,
} from "../actions";
import {
  recordOutcomeAction,
  completeCollaborationAction,
  submitCollaborationFeedbackAction,
} from "../outcome-actions";
import {
  TaskStatus,
  TaskPriority,
  MilestoneStatus,
  CollaborationStatus,
  OutcomeType,
} from "@prisma/client";
import {
  FileText,
  Handshake,
  CheckSquare,
  Target,
  Scroll,
  Trophy,
  Users,
  Sparkles,
  CircleDollarSign,
  Clock,
  TrendingUp,
  ShieldCheck,
  Save,
  Check,
  Circle,
  Package,
  Megaphone,
  Globe,
  Palette,
  Star,
  ArrowUpRight,
  Plus,
} from "lucide-react";

interface WorkspaceProps {
  collaboration: any;
  currentActorId: string;
}

export function CollaborationWorkspaceClient({ collaboration, currentActorId }: WorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "plan" | "tasks" | "milestones" | "decisions" | "outcomes">("overview");

  const plan = collaboration.plan;
  const participants = collaboration.participants || [];
  const tasks = collaboration.tasks || [];
  const milestones = collaboration.milestones || [];
  const decisions = collaboration.decisions || [];
  const outcomes = collaboration.outcomes || [];
  const feedbacks = collaboration.feedbacks || [];

  const budget = (plan?.budget as any) || {};
  const timeline = (plan?.timeline as any) || {};
  const revenueModel = (plan?.revenueModel as any) || {};
  const ownershipRules = (plan?.ownershipRules as any) || {};
  const ipRules = (plan?.ipRules as any) || {};

  const completedTasks = tasks.filter((t: any) => t.status === "DONE").length;
  const achievedMilestones = milestones.filter((m: any) => m.status === "ACHIEVED").length;

  const [taskFilter, setTaskFilter] = useState<string>("ALL");
  const filteredTasks = tasks.filter((t: any) => {
    if (taskFilter === "ALL") return true;
    return t.status === taskFilter;
  });

  const [isSavingTerms, setIsSavingTerms] = useState(false);
  const [termsMessage, setTermsMessage] = useState<string | null>(null);

  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskMessage, setTaskMessage] = useState<string | null>(null);

  const [isRecordingDecision, setIsRecordingDecision] = useState(false);
  const [decisionMessage, setDecisionMessage] = useState<string | null>(null);

  async function handleSaveTerms(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSavingTerms(true);
    setTermsMessage(null);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await updateCollaborationTerms(plan.id, formData);
      if (res.success) {
        setTermsMessage("Kesepakatan & ketentuan berhasil disimpan!");
      } else {
        setTermsMessage(res.error || "Gagal menyimpan.");
      }
    } finally {
      setIsSavingTerms(false);
      setTimeout(() => setTermsMessage(null), 4000);
    }
  }

  async function handleCreateTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsCreatingTask(true);
    setTaskMessage(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const res = await createTask(collaboration.id, formData);
      if (res.success) {
        form.reset();
        setTaskMessage("Tugas baru berhasil ditambahkan!");
      } else {
        setTaskMessage(res.error || "Gagal membuat tugas.");
      }
    } finally {
      setIsCreatingTask(false);
      setTimeout(() => setTaskMessage(null), 4000);
    }
  }

  async function handleToggleTask(taskId: string, currentStatus: TaskStatus) {
    await toggleTaskStatus(taskId, collaboration.id, currentStatus);
  }

  async function handleUpdateMilestone(milestoneId: string, status: MilestoneStatus) {
    await updateMilestoneStatus(milestoneId, collaboration.id, status);
  }

  async function handleRecordDecision(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsRecordingDecision(true);
    setDecisionMessage(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const res = await recordDecision(collaboration.id, formData);
      if (res.success) {
        form.reset();
        setDecisionMessage("Keputusan baru berhasil dicatat dalam log konsensus!");
      } else {
        setDecisionMessage(res.error || "Gagal mencatat keputusan.");
      }
    } finally {
      setIsRecordingDecision(false);
      setTimeout(() => setDecisionMessage(null), 4000);
    }
  }

  const [isRecordingOutcome, setIsRecordingOutcome] = useState(false);
  const [outcomeMessage, setOutcomeMessage] = useState<string | null>(null);

  const [isCompletingCollab, setIsCompletingCollab] = useState(false);
  const [collabCompleteMessage, setCollabCompleteMessage] = useState<string | null>(null);

  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [selectedRatings, setSelectedRatings] = useState({
    relevanceScore: 5,
    feasibilityScore: 5,
    noveltyScore: 5,
    usefulnessScore: 5,
  });

  const outcomeTypeLabels: Record<
    string,
    { label: string; icon: React.ComponentType<{ className?: string }>; badge: string }
  > = {
    PRODUCT: { label: "Produk Fisik / Digital", icon: Package, badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    CAMPAIGN: { label: "Kampanye / Pameran", icon: Megaphone, badge: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    SERVICE: { label: "Layanan Kolaboratif", icon: Handshake, badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    MARKET_ACCESS: { label: "Akses Pasar / Ritel", icon: Globe, badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
    REVENUE: { label: "Realisasi Omzet / Finansial", icon: CircleDollarSign, badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    AUDIENCE_GROWTH: { label: "Pertumbuhan Audiens", icon: TrendingUp, badge: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
    CREATIVE_ASSET: { label: "Aset Kreatif / Desain", icon: Palette, badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
    OTHER: { label: "Luaran Lainnya", icon: Sparkles, badge: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  };

  async function handleRecordOutcome(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsRecordingOutcome(true);
    setOutcomeMessage(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const res = await recordOutcomeAction(collaboration.id, formData);
      if (res.success) {
        form.reset();
        setOutcomeMessage("Luaran nyata berhasil dicatat ke dalam rekam jejak kolaborasi!");
      } else {
        setOutcomeMessage(res.error || "Gagal mencatat luaran.");
      }
    } finally {
      setIsRecordingOutcome(false);
      setTimeout(() => setOutcomeMessage(null), 4000);
    }
  }

  async function handleCompleteCollaboration() {
    if (!confirm("Apakah Anda yakin ingin menandai kolaborasi ini selesai? Status akan diubah menjadi COMPLETED.")) return;
    setIsCompletingCollab(true);
    setCollabCompleteMessage(null);
    try {
      const res = await completeCollaborationAction(collaboration.id);
      if (res.success) {
        setCollabCompleteMessage("Selamat! Proyek kolaborasi resmi dinyatakan selesai (COMPLETED)!");
      } else {
        setCollabCompleteMessage(res.error || "Gagal mengubah status kolaborasi.");
      }
    } finally {
      setIsCompletingCollab(false);
      setTimeout(() => setCollabCompleteMessage(null), 5000);
    }
  }

  async function handleSubmitFeedback(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    setFeedbackMessage(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("relevanceScore", String(selectedRatings.relevanceScore));
    formData.set("feasibilityScore", String(selectedRatings.feasibilityScore));
    formData.set("noveltyScore", String(selectedRatings.noveltyScore));
    formData.set("usefulnessScore", String(selectedRatings.usefulnessScore));
    try {
      const res = await submitCollaborationFeedbackAction(collaboration.id, formData);
      if (res.success) {
        setFeedbackMessage("Terima kasih! Evaluasi Anda berhasil disimpan sebagai sinyal pembelajaran ekosistem.");
      } else {
        setFeedbackMessage(res.error || "Gagal menyimpan evaluasi.");
      }
    } finally {
      setIsSubmittingFeedback(false);
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  }

  return (
    <div className="space-y-8">
      <section className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 relative overflow-hidden space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Phase 4: Ruang Kolaborasi Aktif
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Status: {collaboration.status}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
              {collaboration.title}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {collaboration.description || plan?.objective}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0 min-w-[280px]">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Tugas Selesai</div>
              <div className="text-xl font-black text-amber-400">
                {completedTasks} / {tasks.length}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Milestone</div>
              <div className="text-xl font-black text-emerald-400">
                {achievedMilestones} / {milestones.length}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 col-span-2 sm:col-span-1">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Luaran Nyata</div>
              <div className="text-xl font-black text-cyan-400">
                {outcomes.length} Hasil
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { key: "overview", label: "Ringkasan Proyek", icon: FileText, count: participants.length },
          { key: "plan", label: "Negosiasi & Kesepakatan", icon: Handshake },
          { key: "tasks", label: "Tugas Kerja (Tasks)", icon: CheckSquare, count: tasks.length },
          { key: "milestones", label: "Milestone", icon: Target, count: milestones.length },
          { key: "decisions", label: "Log Keputusan", icon: Scroll, count: decisions.length },
          { key: "outcomes", label: "Luaran & Evaluasi (Phase 5)", icon: Trophy, count: outcomes.length },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <TabIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? "bg-slate-950/30 text-slate-950" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8 animate-fade-in">
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span>Partisipan & Alokasi Peran ({participants.length})</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {participants.map((p: any) => {
                const roleDef = plan?.roles?.find((r: any) => r.actorId === p.actorId);
                const isYou = p.actorId === currentActorId;

                return (
                  <div
                    key={p.id}
                    className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-amber-400">
                          {p.actor.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{p.actor.name}</span>
                            {isYou && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 text-[10px] font-bold">
                                Anda
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">{p.actor.sector}</div>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {p.roleCode}
                      </span>
                    </div>

                    {roleDef && (
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Tanggung Jawab:
                        </div>
                        <div className="text-xs text-slate-200">{roleDef.contribution}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {plan?.expectedOutputs && (
            <section className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Target Luaran Nyata (Deliverables)</h3>
              <div className="flex flex-wrap gap-2">
                {(plan.expectedOutputs as string[]).map((out: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-950 text-amber-300 border border-amber-500/20"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{out}</span>
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {activeTab === "plan" && (
        <form onSubmit={handleSaveTerms} className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Handshake className="w-5 h-5 text-amber-400" />
              <span>Lembar Negosiasi & Ketentuan Kolaborasi</span>
            </h2>
            {termsMessage && (
              <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                {termsMessage}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CircleDollarSign className="w-4 h-4 text-amber-400" />
                <span>Anggaran & Pembagian Biaya</span>
              </h3>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Estimasi Total Kebutuhan Biaya
                </label>
                <input
                  type="text"
                  name="estimatedTotal"
                  defaultValue={budget.estimatedTotal || "Rp 15.000.000"}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Skema Pembagian Biaya
                </label>
                <input
                  type="text"
                  name="costSharingModel"
                  defaultValue={budget.costSharingModel || "Proporsional sesuai porsi produksi"}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Linimasa & Durasi Kerja</span>
              </h3>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Estimasi Durasi Proyek
                </label>
                <input
                  type="text"
                  name="estimatedDuration"
                  defaultValue={timeline.estimatedDuration || "6 Minggu"}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Target Peluncuran
                </label>
                <input
                  type="text"
                  name="targetLaunch"
                  defaultValue={timeline.targetLaunch || "Bulan Depan"}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Model Pendapatan & Bagi Hasil</span>
              </h3>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Proporsi Bagi Hasil Penjualan Bersih
                </label>
                <input
                  type="text"
                  name="proposedSplit"
                  defaultValue={revenueModel.proposedSplit || "50% : 50%"}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Format Brand Kolaborasi
                </label>
                <input
                  type="text"
                  name="brandModel"
                  defaultValue={ownershipRules.brandModel || "Co-Branding Bersama"}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Hak Kekayaan Intelektual (HAKI / IP)</span>
              </h3>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Kepemilikan Motif/Desain Asli
                </label>
                <input
                  type="text"
                  name="originalIp"
                  defaultValue={ipRules.originalIp || "Hak cipta tetap milik pencipta asli"}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Hak Pakai Produk Turunan
                </label>
                <input
                  type="text"
                  name="derivativeWorks"
                  defaultValue={ipRules.derivativeWorks || "Hak pakai bersama selama proyek aktif"}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingTerms}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingTerms ? "Menyimpan..." : "Simpan Kesepakatan & Ketentuan"}</span>
            </button>
          </div>
        </form>
      )}

      {activeTab === "tasks" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {["ALL", "TODO", "IN_PROGRESS", "DONE"].map((st) => (
                <button
                  key={st}
                  onClick={() => setTaskFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    taskFilter === st
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  {st === "ALL" ? "Semua" : st}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400">
              Menampilkan {filteredTasks.length} dari {tasks.length} tugas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((t: any) => {
              const isDone = t.status === "DONE";
              const inProgress = t.status === "IN_PROGRESS";

              return (
                <div
                  key={t.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
                    isDone
                      ? "bg-slate-950/40 border-slate-800/50 opacity-70"
                      : inProgress
                      ? "bg-slate-900/80 border-amber-500/30"
                      : "bg-slate-900/60 border-slate-800"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={`text-sm font-bold tracking-tight ${
                          isDone ? "line-through text-slate-400" : "text-white"
                        }`}
                      >
                        {t.title}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.priority === "HIGH"
                            ? "bg-rose-500/20 text-rose-300"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>
                    {t.description && (
                      <p className="text-xs text-slate-400 line-clamp-2">{t.description}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                    <div className="text-slate-400 text-[11px]">
                      PIC: <span className="text-slate-200 font-medium">{t.assignedActor?.name || "Semua"}</span>
                    </div>

                    <button
                      onClick={() => handleToggleTask(t.id, t.status)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isDone
                          ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                          : inProgress
                          ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {isDone ? (
                        <span className="inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Selesai</span>
                        </span>
                      ) : inProgress ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Berjalan</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <Circle className="w-3 h-3" />
                          <span>Belum</span>
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <form
            onSubmit={handleCreateTask}
            className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Tambah Tugas Baru</span>
              </h3>
              {taskMessage && (
                <span className="text-xs text-emerald-400 font-medium">{taskMessage}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Judul Tugas *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Contoh: Menyiapkan 5 meter kain batik pola garuda"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Penanggung Jawab (Assignee)
                </label>
                <select
                  name="assignedActorId"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  {participants.map((p: any) => (
                    <option key={p.actorId} value={p.actorId}>
                      {p.actor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Deskripsi / Rincian
                </label>
                <input
                  type="text"
                  name="description"
                  placeholder="Catatan tambahan spesifikasi atau instruksi kerja"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Prioritas
                </label>
                <select
                  name="priority"
                  defaultValue={TaskPriority.MEDIUM}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value={TaskPriority.HIGH}>Tinggi (High)</option>
                  <option value={TaskPriority.MEDIUM}>Sedang (Medium)</option>
                  <option value={TaskPriority.LOW}>Rendah (Low)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreatingTask}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {isCreatingTask ? "Menambahkan..." : "Simpan Tugas"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "milestones" && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            <span>Tahapan & Tonggak Pencapaian (Milestones)</span>
          </h2>

          <div className="space-y-4">
            {milestones.map((m: any, idx: number) => {
              const isAchieved = m.status === "ACHIEVED";
              const inProgress = m.status === "IN_PROGRESS";

              return (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isAchieved
                          ? "bg-emerald-500 text-slate-950"
                          : inProgress
                          ? "bg-amber-500 text-slate-950"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {isAchieved ? <Check className="w-4 h-4 text-slate-950" /> : idx + 1}
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white">{m.title}</h4>
                      {m.description && <p className="text-xs text-slate-400">{m.description}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() =>
                        handleUpdateMilestone(
                          m.id,
                          isAchieved ? MilestoneStatus.PENDING : MilestoneStatus.ACHIEVED
                        )
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isAchieved
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                      }`}
                    >
                      {isAchieved ? (
                        <span className="inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Tercapai</span>
                        </span>
                      ) : (
                        "Tandai Tercapai"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "decisions" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Scroll className="w-5 h-5 text-amber-400" />
              <span>Buku Log Keputusan Bersama (Decision Log)</span>
            </h2>
            {decisionMessage && (
              <span className="text-xs text-emerald-400 font-medium">{decisionMessage}</span>
            )}
          </div>

          <div className="space-y-3">
            {decisions.map((d: any) => (
              <div key={d.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-base font-bold text-white">{d.title}</h4>
                  <span className="text-[11px] text-slate-400">
                    {new Date(d.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200">
                  {d.decision}
                </div>
                {d.reason && (
                  <div className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Alasan:</span> {d.reason}
                  </div>
                )}
              </div>
            ))}
          </div>

          <form
            onSubmit={handleRecordDecision}
            className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4"
          >
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Catat Keputusan Baru</span>
            </h3>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Judul Keputusan *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Contoh: Kesepakatan Warna & Dimensi Tas Koleksi"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Bunyi Keputusan *
                </label>
                <textarea
                  name="decision"
                  required
                  rows={2}
                  placeholder="Rincian hasil permufakatan bersama yang disetujui seluruh pihak..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Dasar Pertimbangan / Alasan
                </label>
                <input
                  type="text"
                  name="reason"
                  placeholder="Mengapa keputusan ini diambil (opsional)"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isRecordingDecision}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {isRecordingDecision ? "Menyimpan..." : "Catat ke Buku Log"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "outcomes" && (
        <div className="space-y-8 animate-fade-in">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Status Proyek & Siklus Hasil Kolaborasi
                  </h2>
                </div>
                <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                  Phase 5 menutup siklus peluang dengan merekam pencapaian nyata (produk, omzet, kampanye) serta umpan balik evaluasi 4-dimensi untuk melatih kecerdasan engine.
                </p>
              </div>

              <div>
                {collaboration.status === "COMPLETED" ? (
                  <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <Check className="w-4 h-4" />
                    <span>Kolaborasi Selesai (COMPLETED)</span>
                  </div>
                ) : (
                  <button
                    onClick={handleCompleteCollaboration}
                    disabled={isCompletingCollab}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isCompletingCollab ? "Memproses..." : "Tandai Kolaborasi Selesai"}</span>
                  </button>
                )}
              </div>
            </div>

            {collabCompleteMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-semibold animate-fade-in">
                {collabCompleteMessage}
              </div>
            )}
          </div>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                <span>Daftar Luaran Nyata ({outcomes.length})</span>
              </h3>
            </div>

            {outcomes.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800/80 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/60 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-300">Belum Ada Luaran yang Dicatat</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Ketika batch sampel pertama selesai, produk diluncurkan, atau pameran diselenggarakan, catat hasilnya melalui formulir di bawah ini untuk menutup siklus kolaborasi.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {outcomes.map((item: any) => {
                  const typeInfo = outcomeTypeLabels[item.outcomeType] || outcomeTypeLabels.OTHER;
                  const TypeIcon = typeInfo.icon;
                  const metrics = (item.metrics as any) || {};

                  return (
                    <div
                      key={item.id}
                      className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${typeInfo.badge}`}>
                          <TypeIcon className="w-3.5 h-3.5" />
                          <span>{typeInfo.label}</span>
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-white leading-snug">{item.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Unit Produksi</span>
                          <span className="font-bold text-white">
                            {metrics.unitsProduced ? `${metrics.unitsProduced} Unit` : "Belum dicatat"}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Nilai Finansial</span>
                          <span className="font-bold text-amber-400">
                            {metrics.revenueAmount || "Belum dicatat"}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Jangkauan Audiens</span>
                          <span className="font-bold text-purple-300">
                            {metrics.audienceReached || "Belum dicatat"}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bukti Dokumentasi</span>
                          {metrics.evidenceUrl ? (
                            <a
                              href={metrics.evidenceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-sky-400 hover:underline flex items-center gap-1 truncate"
                            >
                              <span>Buka Tautan</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="text-slate-400">Belum dicatat</span>
                          )}
                        </div>
                      </div>

                      {metrics.notes && (
                        <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 italic">
                          "{metrics.notes}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <form
            onSubmit={handleRecordOutcome}
            className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-5"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Catat Luaran Nyata (Outcome Baru)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Catat hasil riil yang terwujud dari kolaborasi ini sesuai fakta lapangan (tanpa mengarang angka).
              </p>
            </div>

            {outcomeMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold animate-fade-in ${
                  outcomeMessage.includes("berhasil")
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                }`}
              >
                {outcomeMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Judul Luaran Nyata *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Contoh: Batch Perdana 50 Tas Heritage Batik-Kulit Terjual Habis"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Kategori Luaran *
                </label>
                <select
                  name="outcomeType"
                  defaultValue="PRODUCT"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="PRODUCT">Produk Fisik / Digital</option>
                  <option value="CAMPAIGN">Kampanye / Pameran Bersama</option>
                  <option value="SERVICE">Layanan Kolaboratif</option>
                  <option value="MARKET_ACCESS">Akses Pasar / Toko Baru</option>
                  <option value="REVENUE">Realisasi Omzet / Penjualan</option>
                  <option value="AUDIENCE_GROWTH">Pertumbuhan Pengikut / Audiens</option>
                  <option value="CREATIVE_ASSET">Aset Desain / HKI Bersama</option>
                  <option value="OTHER">Luaran Lainnya</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Jumlah Unit Diproduksi
                </label>
                <input
                  type="number"
                  name="unitsProduced"
                  min="0"
                  placeholder="Contoh: 50 (opsional)"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Nilai Finansial / Omzet Riil
                </label>
                <input
                  type="text"
                  name="revenueAmount"
                  placeholder="Contoh: Rp 17.500.000 (opsional)"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Jangkauan Audiens / Pembeli
                </label>
                <input
                  type="text"
                  name="audienceReached"
                  placeholder="Contoh: 1.200 pengunjung pameran (opsional)"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Tautan Bukti Dokumentasi / Katalog
                </label>
                <input
                  type="url"
                  name="evidenceUrl"
                  placeholder="https://instagram.com/... atau https://katalog-produk.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Deskripsi Hasil Capaian *
                </label>
                <textarea
                  name="description"
                  required
                  rows={2}
                  placeholder="Rincian proses realisasi, respons pasar, atau keberhasilan karya bersama..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Catatan Pembelajaran Tambahan
                </label>
                <input
                  type="text"
                  name="notes"
                  placeholder="Kendala produksi yang teratasi, efisiensi bahan, dsb. (opsional)"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isRecordingOutcome}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isRecordingOutcome ? "Menyimpan Luaran..." : "Simpan Luaran Nyata"}
            </button>
          </form>

          <section className="space-y-6 pt-6 border-t border-slate-800">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-current" />
                <span>Evaluasi Kualitas Kolaborasi & Sinyal Pembelajaran Engine</span>
              </h3>
              <p className="text-xs text-slate-400">
                Berikan penilaian 4-dimensi terhadap kolaborasi ini. Penilaian Anda menjadi sinyal validasi nyata untuk menyempurnakan engine peluang bagi seluruh ekosistem.
              </p>
            </div>

            <form
              onSubmit={handleSubmitFeedback}
              className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-6"
            >
              {feedbackMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold animate-fade-in ${
                    feedbackMessage.includes("berhasil")
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                  }`}
                >
                  {feedbackMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-white block">1. Relevansi Peluang</label>
                    <span className="text-[11px] text-slate-400 block">Kesesuaian dengan visi & identitas brand</span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRatings((prev) => ({ ...prev, relevanceScore: star }))}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                          selectedRatings.relevanceScore >= star
                            ? "bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20"
                            : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        <span>{star}</span>
                        <Star className="w-2.5 h-2.5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-white block">2. Kelayakan Eksekusi</label>
                    <span className="text-[11px] text-slate-400 block">Kemudahan peran & koordinasi kerja</span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRatings((prev) => ({ ...prev, feasibilityScore: star }))}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                          selectedRatings.feasibilityScore >= star
                            ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20"
                            : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        <span>{star}</span>
                        <Star className="w-2.5 h-2.5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-white block">3. Kebaruan / Inovasi</label>
                    <span className="text-[11px] text-slate-400 block">Ide orisinal yang belum terpikirkan</span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRatings((prev) => ({ ...prev, noveltyScore: star }))}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                          selectedRatings.noveltyScore >= star
                            ? "bg-purple-500 text-slate-950 shadow-sm shadow-purple-500/20"
                            : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        <span>{star}</span>
                        <Star className="w-2.5 h-2.5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-white block">4. Nilai Manfaat Nyata</label>
                    <span className="text-[11px] text-slate-400 block">Dampak positif bagi pertumbuhan usaha</span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRatings((prev) => ({ ...prev, usefulnessScore: star }))}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                          selectedRatings.usefulnessScore >= star
                            ? "bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20"
                            : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        <span>{star}</span>
                        <Star className="w-2.5 h-2.5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Ulasan Kualitatif / Catatan Evaluasi Kolaborasi
                </label>
                <textarea
                  name="comments"
                  rows={2}
                  placeholder="Ceritakan pengalaman kolaborasi Anda, apa yang berjalan efektif, dan apa yang dapat diperbaiki..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingFeedback}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingFeedback ? "Menyimpan Evaluasi..." : "Kirim Ulasan Evaluasi"}
              </button>
            </form>

            {feedbacks.length > 0 && (
              <div className="space-y-3 pt-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Ulasan dari Rekan Kolaborator ({feedbacks.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {feedbacks.map((f: any) => (
                    <div
                      key={f.id}
                      className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{f.actor?.name || "Aktor"}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(f.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[10px]">
                        {f.relevanceScore && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold flex items-center gap-1">
                            <span>Relevansi: {f.relevanceScore}</span>
                            <Star className="w-2.5 h-2.5 fill-current" />
                          </span>
                        )}
                        {f.feasibilityScore && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold flex items-center gap-1">
                            <span>Kelayakan: {f.feasibilityScore}</span>
                            <Star className="w-2.5 h-2.5 fill-current" />
                          </span>
                        )}
                        {f.noveltyScore && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold flex items-center gap-1">
                            <span>Kebaruan: {f.noveltyScore}</span>
                            <Star className="w-2.5 h-2.5 fill-current" />
                          </span>
                        )}
                        {f.usefulnessScore && (
                          <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold flex items-center gap-1">
                            <span>Manfaat: {f.usefulnessScore}</span>
                            <Star className="w-2.5 h-2.5 fill-current" />
                          </span>
                        )}
                      </div>

                      {f.comments && (
                        <p className="text-slate-300 leading-relaxed italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                          "{f.comments}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
