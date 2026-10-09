"use client";

import { useState } from "react";
import Link from "next/link";
import {
  updateCollaborationTerms,
  updateSharedProjectLinks,
  createTask,
  toggleTaskStatus,
  deleteTask,
  updateMilestoneStatus,
  recordDecision,
  signSpkAction,
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
  Phone,
  Mail,
  Trash2,
  User,
  Folder,
  ExternalLink,
  Copy,
  ListTodo,
  Zap,
  MessageSquare,
  ArrowRight,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { SocialCreditGenerator } from "@/components/collaborations/SocialCreditGenerator";
import { CollaborationActivityFeed } from "@/components/collaborations/CollaborationActivityFeed";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import {
  MultiPartySpkModal,
  type MultiPartySpkData,
  type SpkParticipant,
} from "@/components/collaborations/MultiPartySpkModal";

interface WorkspaceProps {
  collaboration: any;
  currentActorId: string;
}

export function CollaborationWorkspaceClient({ collaboration, currentActorId }: WorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "callsheet" | "plan" | "credits" | "outcomes">("overview");
  const [isSpkModalOpen, setIsSpkModalOpen] = useState(false);
  const [callsheetCopied, setCallsheetCopied] = useState(false);
  const [isCreditGeneratorOpen, setIsCreditGeneratorOpen] = useState(false);

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

  const totalParties = participants.length;
  const signedParties = participants.filter((p: any) => Boolean(p.signedAt)).length;
  const currentActorParticipant = participants.find(
    (p: any) => (p.actorId ?? p.id) === currentActorId
  );
  const hasCurrentActorSigned = Boolean(currentActorParticipant?.signedAt);
  const isSpkFullySigned = totalParties > 0 && signedParties === totalParties;

  const otherParticipant = participants.find(
    (p: any) => (p.actorId ?? p.id) !== currentActorId
  );
  const partnerActorId = otherParticipant?.actorId ?? otherParticipant?.id;
  const chatTimUrl = partnerActorId ? `/messages?with=${partnerActorId}` : "/messages";

  const [taskFilter, setTaskFilter] = useState<string>("ALL");
  const [taskViewMode, setTaskViewMode] = useState<"kanban" | "list">("kanban");
  const filteredTasks = tasks.filter((t: any) => {
    if (taskFilter === "ALL") return true;
    return t.status === taskFilter;
  });

  const [isSavingTerms, setIsSavingTerms] = useState(false);
  const [termsMessage, setTermsMessage] = useState<string | null>(null);
  const [isEditingTerms, setIsEditingTerms] = useState(false);

  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskMessage, setTaskMessage] = useState<string | null>(null);

  const [isRecordingDecision, setIsRecordingDecision] = useState(false);
  const [decisionMessage, setDecisionMessage] = useState<string | null>(null);

  const projectLinks = (timeline?.projectLinks as any) || {};
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [isSavingLinks, setIsSavingLinks] = useState(false);
  const [linksMessage, setLinksMessage] = useState<string | null>(null);

  function generateCallsheetWhatsAppText() {
    const lines: string[] = [];
    lines.push(`*CALL SHEET & RUNDOWN PRODUKSI*`);
    lines.push(`*Proyek:* ${collaboration.title}`);
    if (timeline?.targetLaunch || timeline?.estimatedDuration) {
      lines.push(`*Jadwal/Target:* ${timeline.targetLaunch || timeline.estimatedDuration}`);
    }
    lines.push(``);

    if (participants.length > 0) {
      lines.push(`*TIM PRODUKSI & KONTAK:*`);
      participants.forEach((p: any) => {
        const waNumber = p.actor?.contactPhone
          ? ` (WA: https://wa.me/${p.actor.contactPhone.replace(/\D/g, "").replace(/^0/, "62")})`
          : "";
        lines.push(`- *${p.actor.name}* [${p.roleCode} - ${p.actor.sector}]${waNumber}`);
      });
      lines.push(``);
    }

    if (projectLinks.moodboardUrl || projectLinks.assetsFolderUrl || projectLinks.notesUrl) {
      lines.push(`*TAUTAN KERJA & MOODBOARD:*`);
      if (projectLinks.moodboardUrl) lines.push(`- Moodboard: ${projectLinks.moodboardUrl}`);
      if (projectLinks.assetsFolderUrl) lines.push(`- Google Drive: ${projectLinks.assetsFolderUrl}`);
      if (projectLinks.notesUrl) lines.push(`- Catatan/Notion: ${projectLinks.notesUrl}`);
      lines.push(``);
    }

    if (tasks.length > 0) {
      lines.push(`*RUNDOWN SESI & DETAIL LOOK:*`);
      tasks.forEach((t: any, idx: number) => {
        const statusLabel = t.status === "DONE" ? "[SELESAI]" : "[PROSES]";
        const assigned = t.assignedActor ? ` (PJ: ${t.assignedActor.name})` : "";
        lines.push(`${idx + 1}. ${statusLabel} *${t.title}*${assigned}`);
        if (t.description) lines.push(`   Catatan: ${t.description}`);
      });
      lines.push(``);
    }

    lines.push(`_Dibuat otomatis via RAMU Workspace_`);
    return lines.join("\n");
  }

  async function handleSaveLinks(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSavingLinks(true);
    setLinksMessage(null);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await updateSharedProjectLinks(plan.id, formData);
      if (res.success) {
        setLinksMessage("Tautan kerja kolaborasi berhasil diperbarui!");
        setIsEditingLinks(false);
      } else {
        setLinksMessage(res.error || "Gagal menyimpan tautan.");
      }
    } finally {
      setIsSavingLinks(false);
      setTimeout(() => setLinksMessage(null), 4000);
    }
  }

  async function handleSaveTerms(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSavingTerms(true);
    setTermsMessage(null);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await updateCollaborationTerms(plan.id, formData);
      if (res.success) {
        setTermsMessage("Kesepakatan & ketentuan berhasil disimpan!");
        setIsEditingTerms(false);
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
        setTaskMessage("Sesi baru berhasil ditambahkan ke rundown!");
      } else {
        setTaskMessage(res.error || "Gagal membuat sesi.");
      }
    } finally {
      setIsCreatingTask(false);
      setTimeout(() => setTaskMessage(null), 4000);
    }
  }

  async function handleToggleTask(taskId: string, currentStatus: TaskStatus) {
    await toggleTaskStatus(taskId, collaboration.id, currentStatus);
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm("Hapus sesi ini dari rundown proyek?")) return;
    await deleteTask(taskId, collaboration.id);
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
    PRODUCT: { label: "Produk Fisik / Digital", icon: Package, badge: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    CAMPAIGN: { label: "Kampanye / Pameran", icon: Megaphone, badge: "bg-purple-50 text-purple-800 border-purple-200" },
    SERVICE: { label: "Layanan Kolaboratif", icon: Handshake, badge: "bg-blue-50 text-blue-800 border-blue-200" },
    MARKET_ACCESS: { label: "Akses Pasar / Ritel", icon: Globe, badge: "bg-teal-50 text-teal-800 border-teal-200" },
    REVENUE: { label: "Realisasi Omzet / Finansial", icon: CircleDollarSign, badge: "bg-amber-50 text-amber-800 border-amber-200" },
    AUDIENCE_GROWTH: { label: "Pertumbuhan Audiens", icon: TrendingUp, badge: "bg-rose-50 text-rose-800 border-rose-200" },
    CREATIVE_ASSET: { label: "Aset Kreatif / Desain", icon: Palette, badge: "bg-indigo-50 text-indigo-800 border-indigo-200" },
    OTHER: { label: "Luaran Lainnya", icon: Sparkles, badge: "bg-slate-100 text-slate-700 border-slate-200" },
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
        setOutcomeMessage("Luaran nyata berhasil dicatat ke dalam portofolio kolaborasi!");
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
        setFeedbackMessage("Terima kasih! Ulasan Anda berhasil disimpan.");
      } else {
        setFeedbackMessage(res.error || "Gagal menyimpan ulasan.");
      }
    } finally {
      setIsSubmittingFeedback(false);
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  }

  const isCompleted = collaboration.status === "COMPLETED";

  return (
    <div className="space-y-3.5 w-full max-w-7xl mx-auto">

      {/* 1. CLEAN MODERN HEADER */}
      <section className="bg-white glass-card p-4 sm:p-5 rounded-[22px] border-white/80 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                isCompleted
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-900 border-amber-200/80"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                <span>{isCompleted ? "Proyek Tuntas" : "Kolaborasi Aktif Berjalan"}</span>
              </span>

              <span className="text-slate-300">•</span>

              <span className="text-xs text-slate-500 font-medium">
                Pola: <strong className="text-slate-700 font-semibold">{plan?.patternCode?.replace(/_/g, " ") || "Produksi Bersama"}</strong>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {collaboration.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              {collaboration.description || plan?.objective || "Ruang kerja bersama untuk koordinasi tim produksi, jadwal, dan deliverables karya."}
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center">
            <button
              type="button"
              onClick={() => setIsSpkModalOpen(true)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                !hasCurrentActorSigned
                  ? "bg-slate-900 hover:bg-black text-white"
                  : "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200"
              }`}
            >
              <FileText className={`w-3.5 h-3.5 ${!hasCurrentActorSigned ? "text-amber-400" : "text-emerald-600"}`} />
              <span>
                {!hasCurrentActorSigned ? "Tanda Tangani SPK" : "Dokumen SPK"}
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSpkFullySigned
                  ? "bg-emerald-100 text-emerald-800 font-bold"
                  : "bg-slate-100 text-slate-600 font-bold"
              }`}>
                {isSpkFullySigned ? "Sah" : `${signedParties}/${totalParties}`}
              </span>
            </button>

            <Link
              href={chatTimUrl}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Chat Tim</span>
            </Link>

            {!isCompleted ? (
              <button
                type="button"
                onClick={handleCompleteCollaboration}
                disabled={isCompletingCollab}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isCompletingCollab ? "Menyelesaikan..." : "Tandai Selesai"}</span>
              </button>
            ) : (
              <Link
                href="/dashboard/showcase"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-2xs"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Lihat di Portofolio</span>
              </Link>
            )}
          </div>
        </div>

        {/* 4 Crisp Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3.5 mt-3.5 border-t border-slate-100">
          <div className="p-3 rounded-[16px] bg-white/70 backdrop-blur-xs border border-white/80 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tim Terlibat</div>
            <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {participants.length} <span className="text-xs font-normal text-slate-500">Kreator</span>
            </div>
          </div>

          <div className="p-3 rounded-[16px] bg-white/70 backdrop-blur-xs border border-white/80 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Call Sheet & Sesi</div>
            <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {completedTasks} <span className="text-xs font-normal text-slate-500">/{tasks.length} Selesai</span>
            </div>
          </div>

          <div className="p-3 rounded-[16px] bg-white/70 backdrop-blur-xs border border-white/80 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Persetujuan SPK</div>
            <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
              <span className={isSpkFullySigned ? "text-emerald-700" : "text-amber-800"}>
                {isSpkFullySigned ? "Sah Semua Pihak" : `${signedParties}/${totalParties} Disetujui`}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-[16px] bg-white/70 backdrop-blur-xs border border-white/80 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hasil & Luaran</div>
            <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {outcomes.length} <span className="text-xs font-normal text-slate-500">Karya Rilis</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TAB NAVIGATION (Signature RAMU Capsule Pill Switcher: 4-Phase Industrial Lifecycle) */}
      <div className="p-1 bg-white/80 backdrop-blur-md rounded-full border border-white/80 inline-flex items-center gap-1 max-w-full overflow-x-auto no-scrollbar shadow-2xs">
        {[
          { key: "overview", label: "Ringkasan & Tim", badge: null },
          {
            key: "plan",
            label: "SPK & Kesepakatan",
            badge: isSpkFullySigned ? "Sah" : `${signedParties}/${totalParties}`,
          },
          { key: "callsheet", label: "Call Sheet & Rundown", badge: `${tasks.length}` },
          { key: "outcomes", label: "Luaran & Portofolio", badge: `${outcomes.length}` },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "btn-primary-pill text-white font-bold shadow-md shadow-[#4CC9FE]/25"
                  : "text-slate-600 hover:text-slate-900 font-medium hover:bg-white/60"
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-[#4CC9FE]/15 text-[#0284c7]"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. TAB CONTENT */}

      {/* ===================== TAB 1: OVERVIEW & TEAM ===================== */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">

          {/* MAIN COLUMN (8 COLS) */}
          <div className="lg:col-span-8 space-y-6">

            {/* TAUTAN KERJA & MOODBOARD */}
            <div className="p-6 sm:p-7 rounded-[22px] glass-card border border-white/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Folder className="w-4 h-4 text-amber-500" />
                    <span>Tautan Dokumen &amp; Folder Aset Bersama</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-normal">
                    Akses bersama tim untuk moodboard, folder file mentah &amp; final, dan catatan jadwal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingLinks(!isEditingLinks)}
                  className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                >
                  {isEditingLinks ? "Batal" : "Kelola Tautan"}
                </button>
              </div>

              {linksMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 animate-fade-in">
                  {linksMessage}
                </div>
              )}

              {isEditingLinks ? (
                <form onSubmit={handleSaveLinks} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                        Moodboard (Canva / Pinterest)
                      </label>
                      <input
                        type="url"
                        name="moodboardUrl"
                        defaultValue={projectLinks.moodboardUrl || ""}
                        placeholder="https://pinterest.com/..."
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                        Folder Foto (Drive / Dropbox)
                      </label>
                      <input
                        type="url"
                        name="assetsFolderUrl"
                        defaultValue={projectLinks.assetsFolderUrl || ""}
                        placeholder="https://drive.google.com/..."
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                        Catatan Produksi (Docs / Notion)
                      </label>
                      <input
                        type="url"
                        name="notesUrl"
                        defaultValue={projectLinks.notesUrl || ""}
                        placeholder="https://notion.so/..."
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isSavingLinks}
                      className="btn-primary-pill px-5 py-2 text-white text-xs font-semibold rounded-full shadow-md shadow-[#4CC9FE]/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSavingLinks ? "Menyimpan..." : "Simpan Tautan"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Card 1: Moodboard */}
                  <div className="p-4 rounded-[18px] bg-white/85 border border-slate-200/70 shadow-2xs flex flex-col justify-between space-y-2">
                    <div>
                      <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Konsep Visual</div>
                      <div className="font-bold text-xs text-slate-900 mt-0.5">Moodboard &amp; Lookbook</div>
                    </div>
                    {projectLinks.moodboardUrl ? (
                      <a
                        href={projectLinks.moodboardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 text-xs font-semibold shadow-2xs transition-colors"
                      >
                        <span className="truncate">Buka Tautan</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditingLinks(true)}
                        className="text-xs font-semibold text-amber-800 hover:underline text-left cursor-pointer"
                      >
                        + Tautkan Moodboard
                      </button>
                    )}
                  </div>

                  {/* Card 2: Drive Folder */}
                  <div className="p-4 rounded-[18px] bg-white/85 border border-slate-200/70 shadow-2xs flex flex-col justify-between space-y-2">
                    <div>
                      <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Aset &amp; File</div>
                      <div className="font-bold text-xs text-slate-900 mt-0.5">Google Drive / Dropbox</div>
                    </div>
                    {projectLinks.assetsFolderUrl ? (
                      <a
                        href={projectLinks.assetsFolderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 text-xs font-semibold shadow-2xs transition-colors"
                      >
                        <span className="truncate">Buka Folder</span>
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditingLinks(true)}
                        className="text-xs font-semibold text-emerald-700 hover:underline text-left cursor-pointer"
                      >
                        + Tautkan Folder Drive
                      </button>
                    )}
                  </div>

                  {/* Card 3: Notes / Call Sheet Doc */}
                  <div className="p-4 rounded-[18px] bg-white/85 border border-slate-200/70 shadow-2xs flex flex-col justify-between space-y-2">
                    <div>
                      <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Dokumen Kerja</div>
                      <div className="font-bold text-xs text-slate-900 mt-0.5">Catatan &amp; Notion</div>
                    </div>
                    {projectLinks.notesUrl ? (
                      <a
                        href={projectLinks.notesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 text-xs font-semibold shadow-2xs transition-colors"
                      >
                        <span className="truncate">Buka Catatan</span>
                        <ExternalLink className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditingLinks(true)}
                        className="text-xs font-semibold text-purple-700 hover:underline text-left cursor-pointer"
                      >
                        + Tautkan Catatan
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* EXPECTED DELIVERABLES */}
            {plan?.expectedOutputs && Array.isArray(plan.expectedOutputs) && plan.expectedOutputs.length > 0 && (
              <div className="p-6 rounded-[22px] glass-card border border-white/80 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Target Hasil Karya (Deliverables Proyek)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {plan.expectedOutputs.map((out: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#4CC9FE]/10 text-slate-800 border border-[#4CC9FE]/30 shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{out}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ACTIVITY FEED */}
            <CollaborationActivityFeed collaboration={collaboration} />
          </div>

          {/* SIDEBAR COLUMN (4 COLS) */}
          <div className="lg:col-span-4 space-y-6">

            {/* CARD 1: STATUS DOKUMEN SPK DIGITAL */}
            <div className="p-6 rounded-[22px] glass-card border border-white/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Status SPK Kolaborasi
                  </h3>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  isSpkFullySigned
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}>
                  {isSpkFullySigned ? "Disepakati Penuh" : `${signedParties}/${totalParties} Disetujui`}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {!hasCurrentActorSigned
                    ? "Tanda tangan digital Anda diperlukan untuk mengunci kesepakatan pembagian peran, hak pakai karya, dan tata kelola proyek."
                    : "Anda telah menyetujui dokumen perjanjian ini. Seluruh ketentuan hak karya dan pembagian peran telah terlindungi."}
                </p>

                {/* Signers list */}
                <div className="space-y-1.5 pt-1">
                  {participants.map((p: any) => {
                    const isSigned = Boolean(p.signedAt);
                    const isMe = (p.actorId ?? p.id) === currentActorId;
                    return (
                      <div
                        key={p.id || p.actorId}
                        className="flex items-center justify-between text-xs py-2 px-3 rounded-[12px] bg-white/90 border border-slate-100 shadow-2xs"
                      >
                        <span className="font-medium text-slate-800 truncate">
                          {p.actor?.name} {isMe && <strong className="text-slate-500">(Anda)</strong>}
                        </span>
                        <span className={`text-[10px] font-bold shrink-0 ${isSigned ? "text-emerald-700" : "text-amber-700"}`}>
                          {isSigned ? "✓ Sudah TTD" : "Menunggu TTD"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSpkModalOpen(true)}
                className={`btn-primary-pill w-full py-3 rounded-full text-xs font-bold text-white shadow-md shadow-[#4CC9FE]/20 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  !hasCurrentActorSigned
                    ? "bg-slate-900 hover:bg-black text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{!hasCurrentActorSigned ? "Buka & Tanda Tangani SPK" : "Buka Dokumen SPK"}</span>
              </button>
            </div>

            {/* CARD 2: TIM KOLABORASI & KONTAK */}
            <div className="p-6 rounded-[22px] glass-card border border-white/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Tim Kolaborasi ({participants.length})
                  </h3>
                </div>
                <Link
                  href={chatTimUrl}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  <span>Chat Tim</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {participants.map((p: any) => {
                  const isYou = p.actorId === currentActorId;
                  const roleDef = plan?.roles?.find((r: any) => r.actorId === p.actorId);

                  return (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-2 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-slate-900 truncate">{p.actor?.name}</span>
                            {isYou && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 text-slate-700">
                                Anda
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {p.roleCode || p.actor?.sector}
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 shrink-0">
                          {p.roleCode}
                        </span>
                      </div>

                      {roleDef?.contribution && (
                        <p className="text-[11px] text-slate-600 leading-relaxed font-light">
                          {roleDef.contribution}
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50">
                        <Link
                          href={`/directory/${p.actorId}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-700 shadow-2xs transition-colors"
                        >
                          <User className="w-3 h-3" />
                          <span>Profil</span>
                        </Link>

                        {!isYou && (
                          <Link
                            href={`/messages?with=${p.actorId ?? p.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-700 shadow-2xs transition-colors"
                          >
                            <MessageSquare className="w-3 h-3 text-slate-400" />
                            <span>Chat</span>
                          </Link>
                        )}

                        {!isYou && p.actor?.contactPhone && (
                          <a
                            href={`https://wa.me/${p.actor.contactPhone.replace(/\D/g, "").replace(/^0/, "62")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 ml-auto"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CARD 3: CALL SHEET & GENERATOR PROMO */}
            <div className="p-5 rounded-[20px] bg-white/75 backdrop-blur-md border border-white/80 shadow-2xs text-slate-700 space-y-2.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Format Kredit Publikasi</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                Siap rilis hasil produksi ke media sosial? Gunakan format tag Instagram &amp; TikTok satu-klik agar seluruh anggota tim diapresiasi.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("credits")}
                className="btn-primary-pill !text-xs !py-1.5 !px-3.5 inline-flex items-center gap-1.5 text-white font-semibold rounded-full shadow-xs mt-1 cursor-pointer"
              >
                <span>Buka Generator Kredit</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================== TAB 2: SPK & KESEPAKATAN (PERIKATAN HUKUM & KONTRAK SAH) ===================== */}
      {activeTab === "plan" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start animate-fade-in">

          {/* LEFT COLUMN: 8 COLS (Unified SPK Executive Agreement Matrix) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* MAIN SPK EXECUTIVE CARD */}
            <div className="p-5 sm:p-6 rounded-[22px] glass-card border border-white/80 shadow-2xs space-y-3.5">
              
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-sm text-slate-900 tracking-tight">
                      Surat Perintah Kerja (SPK) &amp; Perikatan Sah
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      isSpkFullySigned
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}>
                      {isSpkFullySigned ? "Disepakati Penuh" : `${signedParties}/${totalParties} Disetujui`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-normal">
                    Nomor: <span className="font-mono text-slate-700 font-semibold">PKSK/RAMU/{new Date().getFullYear()}/{collaboration.id.slice(0, 8).toUpperCase()}</span> &bull; Terlindungi UU ITE No. 1/2024
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsSpkModalOpen(true)}
                    className="btn-primary-pill inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold text-white shadow-md shadow-[#4CC9FE]/20 transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{!hasCurrentActorSigned ? "Tanda Tangani SPK" : "Buka Dokumen SPK"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingTerms(!isEditingTerms)}
                    className="px-3.5 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer"
                  >
                    {isEditingTerms ? "Tutup Editor" : "Ubah Draf"}
                  </button>
                </div>
              </div>

              {/* IF EDITING TERMS: SHOW INLINE EDITOR */}
              {isEditingTerms ? (
                <form onSubmit={handleSaveTerms} className="p-4 sm:p-5 rounded-[18px] bg-slate-50/80 border border-slate-200/80 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Handshake className="w-4 h-4 text-slate-600" />
                      <span>Ubah Ketentuan Kesepakatan</span>
                    </span>
                    {termsMessage && (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {termsMessage}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Estimasi Total Biaya</label>
                      <CurrencyInput
                        name="estimatedTotal"
                        defaultValue={budget.estimatedTotal || "Rp 15.000.000"}
                        placeholder="Rp 15.000.000"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#4CC9FE]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Estimasi Durasi</label>
                      <input
                        type="text"
                        name="estimatedDuration"
                        defaultValue={timeline.estimatedDuration || "6 Minggu"}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#4CC9FE]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Proporsi Bagi Hasil</label>
                      <input
                        type="text"
                        name="proposedSplit"
                        defaultValue={revenueModel.proposedSplit || "50% : 50%"}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#4CC9FE]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Model Brand</label>
                      <input
                        type="text"
                        name="brandModel"
                        defaultValue={ownershipRules.brandModel || "Co-Branding Bersama"}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#4CC9FE]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => setIsEditingTerms(false)}
                      className="px-3.5 py-1.5 rounded-full border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-white"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingTerms}
                      className="btn-primary-pill px-5 py-1.5 rounded-full text-white text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isSavingTerms ? "Menyimpan..." : "Simpan Ketentuan"}
                    </button>
                  </div>
                </form>
              ) : (
                /* 4-PILLAR EXECUTIVE MATRIX (Compact & Balanced Grid) */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Pillar 1: Anggaran & Biaya */}
                  <div className="p-3.5 rounded-[16px] bg-white/85 border border-slate-200/70 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <CircleDollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Anggaran &amp; Biaya</span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">Termin 50:50</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="text-sm font-bold text-slate-900">
                        {budget.estimatedTotal || "Rp 15.000.000"}
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal leading-relaxed truncate">
                        {budget.costSharingModel || "Proporsional sesuai porsi produksi"}
                      </p>
                    </div>
                  </div>

                  {/* Pillar 2: Linimasa & Durasi */}
                  <div className="p-3.5 rounded-[16px] bg-white/85 border border-slate-200/70 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Linimasa &amp; Durasi</span>
                      </span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">Jadwal Sesi</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="text-sm font-bold text-slate-900">
                        {timeline.estimatedDuration || "6 Minggu"}
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal leading-relaxed truncate">
                        Target Rilis: {timeline.targetLaunch || "Bulan Depan"}
                      </p>
                    </div>
                  </div>

                  {/* Pillar 3: Bagi Hasil & Branding */}
                  <div className="p-3.5 rounded-[16px] bg-white/85 border border-slate-200/70 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                        <span>Bagi Hasil &amp; Branding</span>
                      </span>
                      <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60">Komersial</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="text-sm font-bold text-slate-900">
                        {revenueModel.proposedSplit || "50% : 50%"}
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal leading-relaxed truncate">
                        Model: {ownershipRules.brandModel || "Co-Branding Bersama"}
                      </p>
                    </div>
                  </div>

                  {/* Pillar 4: Hak Cipta & Lisensi */}
                  <div className="p-3.5 rounded-[16px] bg-white/85 border border-slate-200/70 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Hak Cipta (HAKI)</span>
                      </span>
                      <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">Terproteksi</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {ipRules.originalIp || "Hak Cipta Pencipta Asli"}
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal leading-relaxed truncate">
                        {ipRules.derivativeWorks || "Hak pakai bersama selama proyek"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Compact Security & Anti-AI Banner */}
              <div className="p-2.5 rounded-[14px] bg-sky-50/70 border border-sky-100 flex items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2 text-[#0284c7] font-semibold text-[11px]">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-[#0284c7]" />
                  <span>Klausul Anti-AI: Seluruh karya dilarang digunakan untuk melatih model AI tanpa izin tertulis.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSpkModalOpen(true)}
                  className="text-[11px] font-bold text-[#0284c7] hover:underline shrink-0 cursor-pointer"
                >
                  Baca 10 Pasal &rarr;
                </button>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: 4 COLS (Status TTD Para Pihak + Adendum Mufakat) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Card: Status Penandatangan Para Pihak */}
            <div className="p-4 rounded-[20px] glass-card border border-white/80 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Pihak Penandatangan ({participants.length})
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isSpkFullySigned ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                }`}>
                  {signedParties}/{totalParties} TTD
                </span>
              </div>

              <div className="space-y-1.5">
                {participants.map((p: any) => {
                  const isSigned = Boolean(p.signedAt);
                  const isMe = (p.actorId ?? p.id) === currentActorId;
                  return (
                    <div
                      key={p.id || p.actorId}
                      className="p-2.5 rounded-[14px] bg-white/85 border border-slate-200/70 flex items-center justify-between gap-2 text-xs shadow-2xs"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate flex items-center gap-1">
                          <span>{p.actor?.name}</span>
                          {isMe && <span className="text-[10px] text-slate-400 font-normal">(Anda)</span>}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">{p.roleCode} &bull; {p.actor?.sector}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                        isSigned
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {isSigned ? "Sudah TTD" : "Menunggu"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card: Log Mufakat & Adendum (Compact with collapsible form) */}
            <div className="p-4 rounded-[20px] glass-card border border-white/80 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Scroll className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Adendum Mufakat ({decisions.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRecordingDecision(!isRecordingDecision)}
                  className="text-[11px] font-semibold text-[#0284c7] hover:underline cursor-pointer"
                >
                  {isRecordingDecision ? "Batal" : "+ Catat Mufakat"}
                </button>
              </div>

              {decisionMessage && (
                <div className="p-2 rounded-xl text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {decisionMessage}
                </div>
              )}

              {isRecordingDecision && (
                <form onSubmit={handleRecordDecision} className="p-3 rounded-[16px] bg-white border border-slate-200/80 space-y-2.5 animate-fade-in">
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="Judul: misal Tambah 2 Look Foto"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#4CC9FE]"
                  />
                  <textarea
                    name="decision"
                    required
                    rows={2}
                    placeholder="Rincian kesepakatan mufakat..."
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#4CC9FE] resize-none"
                  />
                  <button
                    type="submit"
                    className="btn-primary-pill w-full py-1.5 rounded-full text-xs font-bold text-white shadow-xs cursor-pointer"
                  >
                    Simpan Adendum
                  </button>
                </form>
              )}

              <div className="space-y-1.5 max-h-[140px] overflow-y-auto no-scrollbar">
                {decisions.length === 0 ? (
                  <p className="text-[11px] text-slate-400 text-center py-2">
                    Belum ada adendum atau perubahan draf.
                  </p>
                ) : (
                  decisions.map((d: any) => (
                    <div key={d.id} className="p-2.5 rounded-[14px] bg-white/80 border border-slate-200/60 text-xs space-y-0.5 shadow-2xs">
                      <div className="font-semibold text-slate-900 text-[11px] truncate">{d.title}</div>
                      <p className="text-[10px] text-slate-600 line-clamp-1">{d.decision}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ===================== TAB 3: CALL SHEET & RUNDOWN (JADWAL PRODUKSI LAPANGAN) ===================== */}
      {activeTab === "callsheet" && (
        <div className="space-y-6 animate-fade-in">

          {/* Callsheet Action Header */}
          <div className="p-6 sm:p-7 rounded-[22px] glass-card border border-white/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-slate-800" />
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Call Sheet &amp; Rundown Sesi Produksi
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {completedTasks}/{tasks.length} Sesi Selesai
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                Kelola jadwal sesi pemotretan, fitting busana, dan briefing kru. Salin format teks rapi langsung ke grup WhatsApp kru.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const text = generateCallsheetWhatsAppText();
                  navigator.clipboard.writeText(text);
                  setCallsheetCopied(true);
                  setTimeout(() => setCallsheetCopied(false), 3000);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                  callsheetCopied
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-900 hover:bg-black text-white"
                }`}
              >
                {callsheetCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin! Siap Paste</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Salin Rundown</span>
                  </>
                )}
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(generateCallsheetWhatsAppText())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-2xs"
                title="Buka WhatsApp Langsung dengan Teks Rundown"
              >
                <Phone className="w-3.5 h-3.5 text-white" />
                <span>Kirim via WA</span>
              </a>
            </div>
          </div>

          {/* Filter Bar & Tasks List */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Daftar Sesi ({filteredTasks.length})</span>
                </div>

                {/* View Switcher: List vs Kanban */}
                <div className="inline-flex rounded-full bg-slate-100/90 p-1 border border-slate-200/70 text-xs">
                  <button
                    type="button"
                    onClick={() => setTaskViewMode("kanban")}
                    className={`px-3.5 py-1 rounded-full transition-all font-medium ${
                      taskViewMode === "kanban"
                        ? "bg-white text-slate-900 shadow-2xs font-semibold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Papan Kanban
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskViewMode("list")}
                    className={`px-3.5 py-1 rounded-full transition-all font-medium ${
                      taskViewMode === "list"
                        ? "bg-white text-slate-900 shadow-2xs font-semibold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Daftar List
                  </button>
                </div>
              </div>

              {taskViewMode === "list" && (
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                  {[
                    { key: "ALL", label: "Semua Sesi" },
                    { key: "TODO", label: "Antrean" },
                    { key: "IN_PROGRESS", label: "Berjalan" },
                    { key: "DONE", label: "Selesai" },
                  ].map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setTaskFilter(f.key)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        taskFilter === f.key
                          ? "bg-white text-slate-900 shadow-2xs font-semibold"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* KANBAN BOARD VIEW */}
            {taskViewMode === "kanban" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    status: "TODO",
                    title: "Antrean Sesi (TODO)",
                    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
                    items: tasks.filter((t: any) => t.status === "TODO"),
                  },
                  {
                    status: "IN_PROGRESS",
                    title: "Sedang Berjalan On-Set",
                    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
                    items: tasks.filter((t: any) => t.status === "IN_PROGRESS"),
                  },
                  {
                    status: "DONE",
                    title: "Selesai / Terverifikasi",
                    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
                    items: tasks.filter((t: any) => t.status === "DONE"),
                  },
                ].map((col) => (
                  <div key={col.status} className="p-5 rounded-[22px] bg-white/60 backdrop-blur-md border border-white/80 shadow-2xs flex flex-col space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <span className="text-xs font-bold text-slate-800">{col.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${col.badgeColor}`}>
                        {col.items.length}
                      </span>
                    </div>

                    <div className="space-y-2.5 flex-1 min-h-[140px]">
                      {col.items.length === 0 ? (
                        <div className="h-full flex items-center justify-center p-4 text-center rounded-xl border border-dashed border-slate-200 text-[11px] text-slate-400">
                          Tidak ada sesi di tahap ini
                        </div>
                      ) : (
                        col.items.map((t: any, idx: number) => {
                          const assignedParticipant = participants.find((p: any) => p.actorId === t.assignedActorId);
                          return (
                            <div
                              key={t.id}
                              className="p-3.5 rounded-[16px] bg-white/95 border border-slate-200/70 shadow-2xs space-y-2 hover:border-[#4CC9FE]/40 transition-all"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                    t.priority === "HIGH"
                                      ? "bg-rose-50 text-rose-700 border-rose-200"
                                      : t.priority === "MEDIUM"
                                      ? "bg-amber-50 text-amber-800 border-amber-200"
                                      : "bg-slate-50 text-slate-600 border-slate-200"
                                  }`}
                                >
                                  {t.priority === "HIGH" ? "Krusial" : t.priority === "MEDIUM" ? "Standar" : "Fleksibel"}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteTask(t.id)}
                                  className="text-slate-300 hover:text-rose-500 transition-colors p-0.5"
                                  title="Hapus sesi"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              <h4 className="text-xs font-bold text-slate-900 leading-snug">{t.title}</h4>
                              {t.description && (
                                <p className="text-[11px] text-slate-500 leading-relaxed font-normal line-clamp-2">
                                  {t.description}
                                </p>
                              )}

                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px]">
                                {assignedParticipant ? (
                                  <span className="text-slate-600 font-medium truncate">
                                    PJ: {assignedParticipant.actor?.name}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">Semua Kru</span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleToggleTask(t.id, t.status)}
                                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] transition-colors cursor-pointer shrink-0"
                                >
                                  {col.status === "TODO" ? "Mulai" : col.status === "IN_PROGRESS" ? "Selesai" : "Reset"}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="p-8 text-center rounded-[22px] bg-white border border-dashed border-slate-300 space-y-2">
                <ListTodo className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">
                  {taskFilter === "ALL" ? "Belum Ada Sesi Rundown" : "Tidak Ada Sesi di Kategori Ini"}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {taskFilter === "ALL"
                    ? "Gunakan formulir di bawah untuk menambahkan urutan pemotretan atau jadwal fitting."
                    : "Pilih filter 'Semua Sesi' untuk melihat seluruh urutan."}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredTasks.map((t: any, index: number) => {
                  const isDone = t.status === "DONE";
                  const isInProgress = t.status === "IN_PROGRESS";
                  const assignedParticipant = participants.find((p: any) => p.actorId === t.assignedActorId);

                  return (
                    <div
                      key={t.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isDone
                          ? "bg-slate-50/70 border-slate-200/60 opacity-75"
                          : "bg-white border-slate-200/80 shadow-2xs hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(t.id, t.status)}
                          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            isDone
                              ? "bg-emerald-600 text-white"
                              : isInProgress
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "border border-slate-300 hover:border-slate-500 bg-white"
                          }`}
                          title={isDone ? "Tandai belum selesai" : "Tandai selesai"}
                        >
                          {isDone ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : isInProgress ? (
                            <Clock className="w-3 h-3 text-amber-700" />
                          ) : null}
                        </button>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              #{index + 1}
                            </span>

                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                                t.priority === "HIGH"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : t.priority === "MEDIUM"
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : "bg-slate-50 text-slate-600 border-slate-200"
                              }`}
                            >
                              {t.priority === "HIGH"
                                ? "Krusial"
                                : t.priority === "MEDIUM"
                                ? "Standar"
                                : "Fleksibel"}
                            </span>

                            {assignedParticipant && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200/60 flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400" />
                                <span>PJ: {assignedParticipant.actor?.name}</span>
                              </span>
                            )}
                          </div>

                          <h4 className={`text-xs sm:text-sm font-semibold ${isDone ? "line-through text-slate-400" : "text-slate-900"}`}>
                            {t.title}
                          </h4>

                          {t.description && (
                            <p className="text-xs text-slate-500 leading-relaxed font-normal">
                              {t.description}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteTask(t.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                          title="Hapus sesi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Task / Session Form */}
          <form onSubmit={handleCreateTask} className="p-6 sm:p-7 rounded-[22px] glass-card border border-white/80 shadow-2xs space-y-4">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-slate-700" />
                <span>Tambah Sesi / Look Baru</span>
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Tambahkan sesi pemotretan, waktu fitting, atau giliran pergantian busana ke rundown.
              </p>
            </div>

            {taskMessage && (
              <div className="p-3 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {taskMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Judul Sesi / Jam *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Misal: 09:30 - Look 1 Gaun Sutra Merah"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Penanggung Jawab (PJ)
                </label>
                <select
                  name="assignedActorId"
                  defaultValue={currentActorId}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white cursor-pointer"
                >
                  <option value="">— Seluruh Tim —</option>
                  {participants.map((p: any) => (
                    <option key={p.actorId} value={p.actorId}>
                      {p.actor?.name} ({p.roleCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Prioritas
                </label>
                <select
                  name="priority"
                  defaultValue={TaskPriority.MEDIUM}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white cursor-pointer"
                >
                  <option value={TaskPriority.HIGH}>Krusial / Wajib</option>
                  <option value={TaskPriority.MEDIUM}>Prioritas Standar</option>
                  <option value={TaskPriority.LOW}>Fleksibel / Cadangan</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Arahan Teknis / Catatan Sesi
              </label>
              <textarea
                name="description"
                rows={2}
                placeholder="Catatan lighting, background cyclorama, aksesoris, atau arahan pose..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white resize-none"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isCreatingTask}
                className="btn-primary-pill px-6 py-2.5 text-white font-semibold text-xs rounded-full shadow-md shadow-[#4CC9FE]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isCreatingTask ? "Menambahkan..." : "Tambah ke Rundown"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===================== TAB 4: LUARAN & PORTOFOLIO (DENGAN GENERATOR KREDIT TERINTEGRASI) ===================== */}
      {(activeTab === "outcomes" || activeTab === "credits") && (
        <div className="space-y-5 animate-fade-in">

          {/* Outcome & Completion Status */}
          <div className="p-5 sm:p-6 rounded-[22px] glass-card border border-white/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Hasil Karya &amp; Publikasi Kolaborasi
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                Catat link foto Instagram, lookbook digital, atau rilis media. Gunakan generator kredit terintegrasi untuk menyalin tag kontributor resmi satu-klik.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {/* Button to toggle Social Credit Generator */}
              <button
                type="button"
                onClick={() => setIsCreditGeneratorOpen(!isCreditGeneratorOpen)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                  isCreditGeneratorOpen
                    ? "btn-primary-pill text-white shadow-md shadow-[#4CC9FE]/20"
                    : "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80"
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${isCreditGeneratorOpen ? "text-white" : "text-amber-500"}`} />
                <span>{isCreditGeneratorOpen ? "Tutup Generator Kredit" : "Generator Kredit Medsos"}</span>
              </button>

              {isCompleted ? (
                <div className="px-3.5 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Proyek Telah Selesai</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCompleteCollaboration}
                  disabled={isCompletingCollab || !isSpkFullySigned}
                  title={!isSpkFullySigned ? "SPK wajib disetujui penuh seluruh pihak sebelum diselesaikan" : "Tandai proyek tuntas"}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isSpkFullySigned
                      ? "btn-primary-pill text-white shadow-md shadow-[#4CC9FE]/20 cursor-pointer"
                      : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isCompletingCollab ? "Menyelesaikan..." : "Tandai Proyek Selesai"}</span>
                </button>
              )}

              <Link
                href="/dashboard/showcase"
                className="px-3.5 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Portofolio</span>
              </Link>
            </div>
          </div>

          {/* INTEGRATED SOCIAL CREDIT GENERATOR (COLLAPSIBLE / ON-DEMAND) */}
          {isCreditGeneratorOpen && (
            <div className="p-5 sm:p-6 rounded-[22px] glass-card border border-white/80 shadow-2xs space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Generator Format Kredit &amp; Tag Media Sosial Resmi
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreditGeneratorOpen(false)}
                  className="px-3 py-1 rounded-full text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Tutup Panel
                </button>
              </div>

              <SocialCreditGenerator
                collaborationTitle={collaboration.title}
                participants={participants}
                plan={plan}
              />
            </div>
          )}

          {collabCompleteMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 animate-fade-in">
              {collabCompleteMessage}
            </div>
          )}

          {/* Outcomes list */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-3.5 h-3.5 text-slate-500" />
              <span>Daftar Luaran Rilis ({outcomes.length})</span>
            </h3>

            {outcomes.length === 0 ? (
              <div className="p-8 text-center rounded-[22px] bg-white border border-dashed border-slate-300 text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-800">Belum ada karya luaran yang dicatat</p>
                <p>Ketika sesi photoshoot selesai atau hasil karya tayang, catat tautan dan buktinya melalui formulir di bawah.</p>
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
                      className="p-5 rounded-[22px] bg-white border border-slate-200/80 shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1.5 ${typeInfo.badge}`}>
                          <TypeIcon className="w-3 h-3" />
                          <span>{typeInfo.label}</span>
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString("id-ID")}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h4>
                        {item.description && (
                          <p className="text-xs text-slate-600 leading-relaxed font-normal">{item.description}</p>
                        )}
                      </div>

                      {metrics.evidenceUrl && (
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-slate-500">Bukti Publikasi:</span>
                          <a
                            href={metrics.evidenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:underline"
                          >
                            <span>Lihat Karya Utama</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-600" />
                          </a>
                        </div>
                      )}

                      {metrics.galleryUrls && Array.isArray(metrics.galleryUrls) && metrics.galleryUrls.length > 0 && (
                        <div className="pt-1.5 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">Bukti Pendukung:</span>
                          {metrics.galleryUrls.map((gUrl: string, gIdx: number) => (
                            <a
                              key={gIdx}
                              href={gUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 hover:bg-slate-100 text-[10px] font-medium text-slate-700 border border-slate-200 transition-colors"
                            >
                              <span>Tautan #{gIdx + 2}</span>
                              <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form Catat Luaran Baru */}
          <form onSubmit={handleRecordOutcome} className="p-6 sm:p-7 rounded-[22px] glass-card border border-white/80 shadow-2xs space-y-4">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-slate-700" />
                <span>Catat Hasil Karya / Luaran Baru</span>
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Sertakan tautan postingan Instagram, link video TikTok BTS, katalog Google Drive, atau liputan media.
              </p>
            </div>

            {outcomeMessage && (
              <div className="p-3 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {outcomeMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Judul Karya *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Misal: Rilis Lookbook 12 Look Musim Semi"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Tautan Bukti Publikasi Utama *
                </label>
                <input
                  type="url"
                  name="evidenceUrl"
                  required
                  placeholder="https://instagram.com/p/... atau link Google Drive"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Tautan Bukti Tambahan / Multi-Link Galeri (Opsional)
                </label>
                <textarea
                  name="galleryUrls"
                  rows={2}
                  placeholder="https://drive.google.com/..., https://tiktok.com/@... (pisahkan dengan baris baru atau koma)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Kategori Luaran
                </label>
                <select
                  name="outcomeType"
                  defaultValue="PRODUCT"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white cursor-pointer"
                >
                  <option value="PRODUCT">Produk / Foto Lookbook</option>
                  <option value="CAMPAIGN">Kampanye / Pameran</option>
                  <option value="SERVICE">Layanan Kolaboratif</option>
                  <option value="MARKET_ACCESS">Ritel / Akses Pasar</option>
                  <option value="CREATIVE_ASSET">Aset Desain</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Jumlah Look / Item (Opsional)
                </label>
                <input
                  type="number"
                  name="unitsProduced"
                  min="0"
                  placeholder="12 (12 look foto / 3 video)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Deskripsi Singkat *
                </label>
                <textarea
                  name="description"
                  required
                  rows={2}
                  placeholder="Ceritakan proses realisasi atau respons audiens..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isRecordingOutcome}
                className="btn-primary-pill px-6 py-2.5 text-white font-semibold text-xs rounded-full shadow-md shadow-[#4CC9FE]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isRecordingOutcome ? "Menyimpan..." : "Simpan Luaran"}
              </button>
            </div>
          </form>

          {/* Form Evaluasi & Ulasan Tim */}
          <div className="p-6 sm:p-7 rounded-[22px] glass-card border border-white/80 shadow-2xs space-y-4">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                <span>Evaluasi Pengalaman Kolaborasi</span>
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Berikan ulasan Anda terhadap kerja sama proyek ini untuk meningkatkan reputasi portofolio sesama kreator.
              </p>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              {feedbackMessage && (
                <div className="p-3 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {feedbackMessage}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: "relevanceScore", label: "Kualitas Karya", sub: "Estetika & kerapian visual" },
                  { key: "feasibilityScore", label: "Ketepatan Waktu", sub: "Disiplin rundown & deadline" },
                  { key: "noveltyScore", label: "Komunikasi Tim", sub: "Sikap kerja & koordinasi" },
                  { key: "usefulnessScore", label: "Kepuasan Kerja Sama", sub: "Kesesuaian ekspektasi brief" },
                ].map((item) => (
                  <div key={item.key} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                    <div>
                      <span className="text-[11px] font-bold text-slate-900 block truncate">{item.label}</span>
                      <span className="text-[9px] text-slate-500 block truncate">{item.sub}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const currentVal = (selectedRatings as any)[item.key];
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setSelectedRatings((prev) => ({ ...prev, [item.key]: star }))}
                            className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center cursor-pointer transition-colors ${
                              currentVal >= star
                                ? "bg-amber-500 text-white"
                                : "bg-white text-slate-400 border border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {star}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Catatan / Ulasan Kualitatif (Opsional)
                </label>
                <textarea
                  name="comments"
                  rows={2}
                  placeholder="Ceritakan pengalaman kerja sama Anda bersama tim ini..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingFeedback}
                  className="btn-primary-pill px-6 py-2.5 text-white font-semibold text-xs rounded-full shadow-md shadow-[#4CC9FE]/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingFeedback ? "Mengirim..." : "Kirim Ulasan"}
                </button>
              </div>
            </form>

            {/* List Ulasan Sebelumnya */}
            {feedbacks.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <h4 className="text-[11px] font-bold uppercase text-slate-500">Ulasan Rekan Tim ({feedbacks.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {feedbacks.map((f: any) => (
                    <div key={f.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-slate-900">
                        <span>{f.actor?.name || "Kreator"}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(f.createdAt).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                      {f.comments && <p className="text-slate-600 italic font-light">&ldquo;{f.comments}&rdquo;</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. MODAL SPK MULTI-PIHAK */}
      {(() => {
        const planCreator = collaboration.plan;
        const allP: any[] = participants;
        const budgetData = planCreator?.budget as any;
        const roleFees = (budgetData?.roleFees as Record<string, string>) || {};
        const planRoles = planCreator?.roles || [];

        const buildParty = (p: any): SpkParticipant => {
          const matchedPlanRole = planRoles.find((r: any) => r.actorId === (p.actorId ?? p.id));
          const roleLabel = matchedPlanRole?.responsibility || p.roleCode || p.actor?.sector || "Kreator";
          let fee = roleFees[roleLabel] || roleFees[p.roleCode] || null;
          if (!fee && matchedPlanRole?.contribution?.includes("Honor:")) {
            fee = matchedPlanRole.contribution.split("Honor:")[1]?.split("(")[0]?.trim() || null;
          }

          return {
            id: p.actorId ?? p.id,
            name: p.actor?.name ?? "—",
            sector: p.actor?.sector ?? "—",
            roleCode: p.roleCode ?? "KREATOR",
            roleLabel,
            fee,
            location: p.actor?.location ?? null,
            contactPhone: p.actor?.contactPhone ?? null,
            contactEmail: p.actor?.contactEmail ?? null,
            actorType: p.actor?.actorType,
            signedAt: p.signedAt ? String(p.signedAt) : null,
          };
        };

        if (allP.length === 0) return null;

        const creatorId = collaboration.plan?.createdByActorId || collaboration.initiatorActorId;
        const initiatorIndex = allP.findIndex((p: any) => (p.actorId ?? p.id) === creatorId);
        const initiatorRaw = initiatorIndex >= 0 ? allP[initiatorIndex] : allP[0];
        const restRaw = initiatorIndex >= 0
          ? allP.filter((_: any, idx: number) => idx !== initiatorIndex)
          : allP.slice(1);

        const spkData: MultiPartySpkData = {
          collaborationId: collaboration.id,
          collaborationTitle: collaboration.title,
          createdAt: collaboration.startedAt ?? collaboration.createdAt ?? new Date().toISOString(),
          status: collaboration.status,
          initiator: buildParty(initiatorRaw),
          participants: restRaw.map(buildParty),
          plan: {
            objective: planCreator?.objective ?? collaboration.description ?? null,
            budget: {
              estimatedTotal: (planCreator?.budget as any)?.estimatedTotal,
              costSharingModel: (planCreator?.budget as any)?.costSharingModel,
              roleFees: (planCreator?.budget as any)?.roleFees,
              notes: (planCreator?.budget as any)?.notes,
            },
            timeline: {
              estimatedDuration: (planCreator?.timeline as any)?.estimatedDuration,
              targetLaunch: (planCreator?.timeline as any)?.targetLaunch,
            },
            revenueModel: {
              proposedSplit: (planCreator?.revenueModel as any)?.proposedSplit,
              brandModel: (planCreator?.revenueModel as any)?.brandModel,
              modelType: (planCreator?.revenueModel as any)?.modelType,
            },
            ipRules: {
              originalIp: (planCreator?.ipRules as any)?.originalIp,
              derivativeWorks: (planCreator?.ipRules as any)?.derivativeWorks,
            },
            ownershipRules: {
              brandModel: (planCreator?.ownershipRules as any)?.brandModel,
            },
          },
        };

        return (
          <MultiPartySpkModal
            isOpen={isSpkModalOpen}
            onClose={() => setIsSpkModalOpen(false)}
            data={spkData}
            currentActorId={currentActorId}
            onSign={signSpkAction}
          />
        );
      })()}

    </div>
  );
}
