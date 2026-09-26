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
} from "lucide-react";
import { SocialCreditGenerator } from "@/components/collaborations/SocialCreditGenerator";

interface WorkspaceProps {
  collaboration: any;
  currentActorId: string;
}

export function CollaborationWorkspaceClient({ collaboration, currentActorId }: WorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "callsheet" | "plan" | "credits" | "outcomes">("overview");
  const [callsheetCopied, setCallsheetCopied] = useState(false);

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

  const projectLinks = (timeline?.projectLinks as any) || {};
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [isSavingLinks, setIsSavingLinks] = useState(false);
  const [linksMessage, setLinksMessage] = useState<string | null>(null);

  function generateCallsheetWhatsAppText() {
    const lines: string[] = [];
    lines.push(`📋 *CALL SHEET & RUNDOWN PRODUKSI*`);
    lines.push(`*Proyek:* ${collaboration.title}`);
    if (timeline?.targetLaunch || timeline?.estimatedDuration) {
      lines.push(`*Jadwal/Target:* ${timeline.targetLaunch || timeline.estimatedDuration}`);
    }
    lines.push(``);

    if (participants.length > 0) {
      lines.push(`👥 *TIM PRODUKSI & KONTAK:*`);
      participants.forEach((p: any) => {
        const waNumber = p.actor?.contactPhone
          ? ` (WA: https://wa.me/${p.actor.contactPhone.replace(/\\D/g, "").replace(/^0/, "62")})`
          : "";
        lines.push(`- *${p.actor.name}* [${p.roleCode} - ${p.actor.sector}]${waNumber}`);
      });
      lines.push(``);
    }

    if (projectLinks.moodboardUrl || projectLinks.assetsDriveUrl || projectLinks.notesUrl) {
      lines.push(`📍 *TAUTAN KERJA & MOODBOARD:*`);
      if (projectLinks.moodboardUrl) lines.push(`- 🎨 Moodboard: ${projectLinks.moodboardUrl}`);
      if (projectLinks.assetsDriveUrl) lines.push(`- 📁 Google Drive: ${projectLinks.assetsDriveUrl}`);
      if (projectLinks.notesUrl) lines.push(`- 📝 Catatan/Notion: ${projectLinks.notesUrl}`);
      lines.push(``);
    }

    if (tasks.length > 0) {
      lines.push(`⏰ *RUNDOWN SESI & DETAIL LOOK:*`);
      tasks.forEach((t: any, idx: number) => {
        const statusIcon = t.status === "DONE" ? "✅" : "⏳";
        const assigned = t.assignedActor ? ` (PJ: ${t.assignedActor.name})` : "";
        lines.push(`${idx + 1}. ${statusIcon} *${t.title}*${assigned}`);
        if (t.description) lines.push(`   Catatan: ${t.description}`);
      });
      lines.push(``);
    }

    lines.push(`_Dibuat otomatis via RAMU Creative Workspace_`);
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

  async function handleDeleteTask(taskId: string) {
    if (!confirm("Hapus tugas ini dari checklist proyek?")) return;
    await deleteTask(taskId, collaboration.id);
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
    PRODUCT: { label: "Produk Fisik / Digital", icon: Package, badge: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    CAMPAIGN: { label: "Kampanye / Pameran", icon: Megaphone, badge: "bg-purple-50 text-purple-800 border-purple-200" },
    SERVICE: { label: "Layanan Kolaboratif", icon: Handshake, badge: "bg-blue-50 text-blue-800 border-blue-200" },
    MARKET_ACCESS: { label: "Akses Pasar / Ritel", icon: Globe, badge: "bg-teal-50 text-teal-800 border-teal-200" },
    REVENUE: { label: "Realisasi Omzet / Finansial", icon: CircleDollarSign, badge: "bg-amber-50 text-amber-800 border-amber-200" },
    AUDIENCE_GROWTH: { label: "Pertumbuhan Audiens", icon: TrendingUp, badge: "bg-rose-50 text-rose-800 border-rose-200" },
    CREATIVE_ASSET: { label: "Aset Kreatif / Desain", icon: Palette, badge: "bg-indigo-50 text-indigo-800 border-indigo-200" },
    OTHER: { label: "Luaran Lainnya", icon: Sparkles, badge: "bg-stone-100 text-stone-700 border-stone-200" },
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
    <div className="space-y-12">
      {/* Editorial Header */}
      <section className="border-b border-stone-200 pb-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                Workspace
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E1B2E] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E1B2E] animate-pulse" />
                Status: {collaboration.status}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-[#1E1B2E] tracking-tighter leading-[1.1] max-w-3xl">
              {collaboration.title}
            </h1>
            <p className="text-sm font-light text-stone-500 max-w-2xl leading-relaxed">
              {collaboration.description || plan?.objective}
            </p>
          </div>

          <div className="flex flex-wrap gap-6 shrink-0 pt-4 lg:pt-0">
            <div className="space-y-1">
              <div className="text-[10px] text-stone-400 uppercase font-bold tracking-[0.2em]">Tim Kreatif</div>
              <div className="text-2xl font-light text-[#1E1B2E]">
                {participants.length} <span className="text-stone-300 text-lg">Kreator</span>
              </div>
            </div>
            <div className="w-px h-10 bg-stone-200 hidden sm:block"></div>
            <div className="space-y-1">
              <div className="text-[10px] text-stone-400 uppercase font-bold tracking-[0.2em]">Status Proyek</div>
              <div className="text-xl font-light">
                {collaboration.status === "COMPLETED" ? (
                  <span className="text-emerald-700 font-medium">Selesai</span>
                ) : (
                  <span className="text-[#E66A48] font-medium">Aktif Berjalan</span>
                )}
              </div>
            </div>
            <div className="w-px h-10 bg-stone-200 hidden sm:block"></div>
            <div className="space-y-1">
              <div className="text-[10px] text-stone-400 uppercase font-bold tracking-[0.2em]">Karya Rilis</div>
              <div className="text-2xl font-light text-[#1E1B2E]">
                {outcomes.length} <span className="text-stone-300 text-lg">Luaran</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPLETED CELEBRATION & TEAR-SHEET BANNER */}
      {collaboration.status === "COMPLETED" && (
        <section className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-br from-emerald-950 via-[#1E1B2E] to-stone-900 text-white border border-emerald-500/30 shadow-2xl relative overflow-hidden animate-fade-in">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Karya Kolaborasi Resmi Selesai & Terverifikasi</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
                Selamat! Proyek Sinergi Ini Telah Tuntas
              </h2>
              <p className="text-xs text-stone-300 font-light leading-relaxed">
                Seluruh tahapan produksi telah diselesaikan bersama. Sekarang saatnya mempublikasikan karya ke media sosial dengan kredit tear-sheet terverifikasi dan menyematkan hasil luaran ke portofolio publik Anda.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("callsheet")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
              >
                <ListTodo className="w-4 h-4 text-amber-400" />
                <span>Call Sheet ({completedTasks}/{tasks.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("credits")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#E66A48] hover:from-amber-600 hover:to-[#d85c3b] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Salin Kredit & Tear Sheet</span>
              </button>
              <Link
                href="/dashboard/showcase"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                <span>Sematkan ke Showcase</span>
              </Link>
              <button
                type="button"
                onClick={() => setActiveTab("outcomes")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
              >
                <Star className="w-4 h-4 text-amber-400 fill-current" />
                <span>Luaran & Ulasan ({outcomes.length})</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-8 overflow-x-auto no-scrollbar border-b border-stone-200">
        {[
          { key: "overview", label: "Ringkasan", badge: null },
          { key: "callsheet", label: "Call Sheet & Rundown", badge: `${tasks.length}` },
          { key: "plan", label: "Ketentuan & Hak", badge: null },
          { key: "credits", label: "Kredit & Tag", badge: "Baru" },
          { key: "outcomes", label: "Luaran & Ulasan", badge: `${outcomes.length}` },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-4 whitespace-nowrap text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "text-[#1E1B2E] border-b-2 border-[#1E1B2E]"
                  : "text-stone-400 hover:text-stone-600 border-b-2 border-transparent"
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  isActive ? "bg-[#1E1B2E] text-white" : "bg-stone-100 text-stone-500"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-fade-in">
          {/* SHARED PROJECT HUB (LINKS) */}
          <section className="p-6 sm:p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-amber-500" />
                  <h2 className="text-base font-bold text-[#1E1B2E] tracking-tight">
                    Tautan Kerja & Dokumen Kolaborasi
                  </h2>
                </div>
                <p className="text-xs text-stone-500 font-light">
                  Akses bersama untuk moodboard visual (Pinterest/Canva), folder foto mentah & final (Google Drive/Dropbox), serta catatan produksi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingLinks(!isEditingLinks)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#1E1B2E] text-xs font-bold transition-all shrink-0 cursor-pointer"
              >
                <span>{isEditingLinks ? "Tutup Editor" : "Kelola Tautan"}</span>
              </button>
            </div>

            {linksMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 animate-fade-in">
                {linksMessage}
              </div>
            )}

            {isEditingLinks ? (
              <form onSubmit={handleSaveLinks} className="space-y-4 p-5 rounded-2xl bg-stone-50 border border-stone-200/80 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
                      🎨 Moodboard / Arah Gaya
                    </label>
                    <input
                      type="url"
                      name="moodboardUrl"
                      defaultValue={projectLinks.moodboardUrl || ""}
                      placeholder="https://pinterest.com/... atau Canva"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs text-[#1E1B2E] focus:outline-none focus:border-[#E66A48]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
                      📸 Folder Foto / Video Aset
                    </label>
                    <input
                      type="url"
                      name="assetsFolderUrl"
                      defaultValue={projectLinks.assetsFolderUrl || ""}
                      placeholder="https://drive.google.com/... atau Dropbox"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs text-[#1E1B2E] focus:outline-none focus:border-[#E66A48]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
                      📝 Dokumen / Call Sheet
                    </label>
                    <input
                      type="url"
                      name="notesUrl"
                      defaultValue={projectLinks.notesUrl || ""}
                      placeholder="https://docs.google.com/... atau Notion"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs text-[#1E1B2E] focus:outline-none focus:border-[#E66A48]"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSavingLinks}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-[#E66A48] hover:from-amber-600 hover:to-[#d85c3b] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSavingLinks ? "Menyimpan..." : "Simpan Tautan Kerja"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Moodboard Card */}
                <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 flex flex-col justify-between space-y-3 hover:bg-stone-50 transition-colors">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                      Konsep Visual
                    </div>
                    <div className="font-bold text-sm text-[#1E1B2E]">
                      Moodboard & Lookbook
                    </div>
                    <p className="text-[11px] text-stone-500 truncate font-light">
                      {projectLinks.moodboardUrl ? projectLinks.moodboardUrl : "Belum ditautkan"}
                    </p>
                  </div>
                  {projectLinks.moodboardUrl ? (
                    <a
                      href={projectLinks.moodboardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-[#1E1B2E] border border-stone-200 text-xs font-bold transition-colors"
                    >
                      <span>Buka Moodboard</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#E66A48]" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingLinks(true)}
                      className="text-xs font-bold text-[#E66A48] hover:underline text-left cursor-pointer"
                    >
                      + Tautkan Pinterest/Canva
                    </button>
                  )}
                </div>

                {/* Asset Folder Card */}
                <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 flex flex-col justify-between space-y-3 hover:bg-stone-50 transition-colors">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                      Aset & Foto
                    </div>
                    <div className="font-bold text-sm text-[#1E1B2E]">
                      Folder Drive / Dropbox
                    </div>
                    <p className="text-[11px] text-stone-500 truncate font-light">
                      {projectLinks.assetsFolderUrl ? projectLinks.assetsFolderUrl : "Belum ditautkan"}
                    </p>
                  </div>
                  {projectLinks.assetsFolderUrl ? (
                    <a
                      href={projectLinks.assetsFolderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-[#1E1B2E] border border-stone-200 text-xs font-bold transition-colors"
                    >
                      <span>Buka Folder Drive</span>
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingLinks(true)}
                      className="text-xs font-bold text-[#E66A48] hover:underline text-left cursor-pointer"
                    >
                      + Tautkan Google Drive
                    </button>
                  )}
                </div>

                {/* Production Notes / Call Sheet Card */}
                <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 flex flex-col justify-between space-y-3 hover:bg-stone-50 transition-colors">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                      Dokumen Produksi
                    </div>
                    <div className="font-bold text-sm text-[#1E1B2E]">
                      Call Sheet & Catatan
                    </div>
                    <p className="text-[11px] text-stone-500 truncate font-light">
                      {projectLinks.notesUrl ? projectLinks.notesUrl : "Belum ditautkan"}
                    </p>
                  </div>
                  {projectLinks.notesUrl ? (
                    <a
                      href={projectLinks.notesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-[#1E1B2E] border border-stone-200 text-xs font-bold transition-colors"
                    >
                      <span>Buka Catatan</span>
                      <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingLinks(true)}
                      className="text-xs font-bold text-[#E66A48] hover:underline text-left cursor-pointer"
                    >
                      + Tautkan Docs / Notion
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-[#27213D] tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              <span>Partisipan & Alokasi Peran ({participants.length})</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {participants.map((p: any) => {
                const roleDef = plan?.roles?.find((r: any) => r.actorId === p.actorId);
                const isYou = p.actorId === currentActorId;

                return (
                  <div
                    key={p.id}
                    className="p-6 rounded-[28px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center font-black text-amber-800">
                          {p.actor.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#27213D] text-sm">{p.actor.name}</span>
                            {isYou && (
                              <span className="px-2 py-0.5 rounded-md bg-[#FFF7ED] text-[#E66A48] border border-[#F9D8C4] text-[10px] font-bold">
                                Anda
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#716B7E]">{p.actor.sector}</div>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFF7ED] text-[#E66A48] border border-[#F9D8C4]">
                        {p.roleCode}
                      </span>
                    </div>

                    {roleDef && (
                      <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1">
                        <div className="text-[11px] font-bold text-[#716B7E] uppercase tracking-wider">
                          Tanggung Jawab:
                        </div>
                        <div className="text-xs text-[#27213D] leading-relaxed">{roleDef.contribution}</div>
                      </div>
                    )}

                    {/* Action Links */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
                      <Link
                        href={`/directory/${p.actorId}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#1E1B2E] text-[11px] font-bold transition-colors"
                      >
                        <User className="w-3 h-3 text-stone-500" />
                        <span>Profil</span>
                      </Link>

                      {!isYou && p.actor?.contactPhone && (
                        <a
                          href={`https://wa.me/${p.actor.contactPhone.replace(/\D/g, "").replace(/^0/, "62")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-colors"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      {!isYou && p.actor?.contactEmail && (
                        <a
                          href={`mailto:${p.actor.contactEmail}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#1E1B2E] text-[11px] font-bold transition-colors"
                        >
                          <Mail className="w-3 h-3 text-stone-500" />
                          <span>Email</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Quick Social Media Credits Banner */}
          <div className="p-6 rounded-[28px] bg-gradient-to-r from-amber-500/10 via-[#E66A48]/10 to-transparent border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E66A48]" />
                <h3 className="text-sm font-bold text-[#1E1B2E]">Format Kredit Publikasi & Media Sosial Satu-Klik</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E66A48] text-white">Baru</span>
              </div>
              <p className="text-xs text-stone-600 font-light">
                Siap rilis hasil photoshoot, lookbook, atau video campaign? Generate format kredit Instagram Feed, TikTok BTS, Story mention sticker, dan call sheet roster tanpa perlu tanya manual.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("credits")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E1B2E] hover:bg-stone-800 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm"
            >
              <span>Buka Generator Kredit</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {plan?.expectedOutputs && (
            <section className="p-6 sm:p-8 rounded-[28px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#716B7E]">Target Luaran Nyata (Deliverables)</h3>
              <div className="flex flex-wrap gap-2">
                {(plan.expectedOutputs as string[]).map((out: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200/80"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{out}</span>
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* TAB 2: CALL SHEET & RUNDOWN SESI PRODUKSI */}
      {activeTab === "callsheet" && (
        <div className="space-y-8 animate-fade-in">
          {/* Header Action Banner */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-r from-[#1E1B2E] via-[#2A243D] to-[#1E1B2E] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-[#1E1B2E]/5">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Call Sheet & Rundown Sesi Produksi
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  {completedTasks}/{tasks.length} Sesi Selesai
                </span>
              </div>
              <p className="text-xs text-stone-300 font-light leading-relaxed">
                Pusat kendali eksekusi hari-H bagi tim kreatif (Fotografer, MUA, Desainer, Model, Stylist). Pantau giliran look, jadwal fitting, dan salin langsung ke format WhatsApp tim H-1 sebelum pemotretan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const text = generateCallsheetWhatsAppText();
                  navigator.clipboard.writeText(text);
                  setCallsheetCopied(true);
                  setTimeout(() => setCallsheetCopied(false), 3000);
                }}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                  callsheetCopied
                    ? "bg-emerald-500 text-white shadow-emerald-500/20"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                }`}
              >
                {callsheetCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tersalin! Siap Paste di WA Tim</span>
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 text-emerald-200" />
                    <span>Salin Call Sheet ke WhatsApp Tim</span>
                    <Copy className="w-3.5 h-3.5 opacity-80" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sesi Rundown List */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-[#27213D] uppercase tracking-wider">
                  Susunan Rundown & Jadwal Sesi ({tasks.length})
                </h3>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs">
                {[
                  { key: "ALL", label: "Semua Sesi" },
                  { key: "TODO", label: "Belum / Antrean" },
                  { key: "IN_PROGRESS", label: "Berjalan" },
                  { key: "DONE", label: "Selesai" },
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setTaskFilter(f.key)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      taskFilter === f.key
                        ? "bg-white text-[#1E1B2E] shadow-2xs"
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="p-10 rounded-[32px] bg-white/95 border border-dashed border-stone-300 text-center space-y-3">
                <ListTodo className="w-8 h-8 text-stone-400 mx-auto" />
                <h4 className="text-sm font-bold text-[#27213D]">
                  {taskFilter === "ALL" ? "Belum Ada Sesi Rundown" : "Tidak Ada Sesi di Kategori Ini"}
                </h4>
                <p className="text-xs text-[#716B7E] max-w-md mx-auto">
                  {taskFilter === "ALL"
                    ? "Tambahkan rincian sesi pemotretan, fitting look, atau briefing menggunakan formulir di bawah."
                    : "Pilih filter 'Semua Sesi' untuk melihat seluruh susunan jadwal."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((t: any, index: number) => {
                  const isDone = t.status === "DONE";
                  const isInProgress = t.status === "IN_PROGRESS";
                  const assignedParticipant = participants.find((p: any) => p.actorId === t.assignedActorId);

                  return (
                    <div
                      key={t.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isDone
                          ? "bg-emerald-50/40 border-emerald-200/80 opacity-80"
                          : "bg-white/95 border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] hover:border-stone-300"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleTask(t.id, t.status)}
                          className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            isDone
                              ? "bg-emerald-600 text-white shadow-xs"
                              : isInProgress
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "border-2 border-stone-300 hover:border-[#E66A48] bg-white"
                          }`}
                          title={isDone ? "Tandai belum selesai" : "Tandai selesai"}
                        >
                          {isDone ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : isInProgress ? (
                            <Clock className="w-3.5 h-3.5" />
                          ) : null}
                        </button>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                              Sesi #{index + 1}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                t.priority === "HIGH"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : t.priority === "MEDIUM"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-stone-50 text-stone-600 border-stone-200"
                              }`}
                            >
                              {t.priority === "HIGH"
                                ? "Krusial / Wajib"
                                : t.priority === "MEDIUM"
                                ? "Prioritas Standar"
                                : "Fleksibel"}
                            </span>
                            {assignedParticipant && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-[#1E1B2E] border border-stone-200 flex items-center gap-1">
                                <User className="w-3 h-3 text-stone-500" />
                                <span>PJ: {assignedParticipant.actor?.name}</span>
                              </span>
                            )}
                          </div>

                          <h4
                            className={`text-sm font-bold ${
                              isDone ? "line-through text-stone-500" : "text-[#27213D]"
                            }`}
                          >
                            {t.title}
                          </h4>

                          {t.description && (
                            <p className="text-xs text-[#716B7E] leading-relaxed">
                              {t.description}
                            </p>
                          )}
                        </div>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(t.id)}
                          className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                          title="Hapus sesi dari rundown"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Form Tambah Sesi Rundown Baru */}
          <form
            onSubmit={handleCreateTask}
            className="p-6 sm:p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-4"
          >
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E] flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#E66A48]" />
                <span>Tambah Sesi / Look Baru ke Rundown</span>
              </h4>
              <p className="text-xs text-stone-500 font-light">
                Tambahkan sesi pemotretan, waktu fitting, briefing pencahayaan, atau penyerahan file ke call sheet tim.
              </p>
            </div>

            {taskMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  taskMessage.includes("berhasil")
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {taskMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Judul Sesi / Jam *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Contoh: 09:30 - Look 1 Gaun Sutra Merah"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#1E1B2E] focus:outline-none focus:border-[#E66A48] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Penanggung Jawab (PJ)
                </label>
                <select
                  name="assignedActorId"
                  defaultValue={currentActorId}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#1E1B2E] focus:outline-none focus:border-[#E66A48] focus:bg-white cursor-pointer"
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
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Tingkat Prioritas
                </label>
                <select
                  name="priority"
                  defaultValue={TaskPriority.MEDIUM}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#1E1B2E] focus:outline-none focus:border-[#E66A48] focus:bg-white cursor-pointer"
                >
                  <option value={TaskPriority.HIGH}>Krusial / Wajib</option>
                  <option value={TaskPriority.MEDIUM}>Prioritas Standar</option>
                  <option value={TaskPriority.LOW}>Fleksibel / Opsional</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Detail Arahan Teknis / Catatan Sesi
              </label>
              <textarea
                name="description"
                rows={2}
                placeholder="Contoh: Studio B, background polos beige, penataan rambut clean updo, lighting softbox 45 derajat..."
                className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#1E1B2E] focus:outline-none focus:border-[#E66A48] focus:bg-white resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isCreatingTask}
                className="px-5 py-2 rounded-xl bg-[#1E1B2E] hover:bg-stone-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isCreatingTask ? "Menambahkan..." : "Tambahkan ke Call Sheet"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: PLAN */}
      {activeTab === "plan" && (
        <div className="space-y-8 animate-fade-in">
          <form onSubmit={handleSaveTerms} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#27213D] tracking-tight flex items-center gap-2">
              <Handshake className="w-5 h-5 text-amber-500" />
              <span>Lembar Negosiasi & Ketentuan Kolaborasi</span>
            </h2>
            {termsMessage && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-xl border border-emerald-200">
                {termsMessage}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-[28px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-4">
              <h3 className="text-sm font-bold text-[#27213D] flex items-center gap-2">
                <CircleDollarSign className="w-4 h-4 text-[#E66A48]" />
                <span>Anggaran & Pembagian Biaya</span>
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#716B7E]">
                  Estimasi Total Kebutuhan Biaya
                </label>
                <input
                  type="text"
                  name="estimatedTotal"
                  defaultValue={budget.estimatedTotal || "Rp 15.000.000"}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-sm text-[#27213D] focus:outline-none focus:border-[#E66A48] focus:bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#716B7E]">
                  Skema Pembagian Biaya
                </label>
                <input
                  type="text"
                  name="costSharingModel"
                  defaultValue={budget.costSharingModel || "Proporsional sesuai porsi produksi"}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-sm text-[#27213D] focus:outline-none focus:border-[#E66A48] focus:bg-white"
                />
              </div>
            </div>

            <div className="p-6 rounded-[28px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-4">
              <h3 className="text-sm font-bold text-[#27213D] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#E66A48]" />
                <span>Linimasa & Durasi Kerja</span>
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#716B7E]">
                  Estimasi Durasi Proyek
                </label>
                <input
                  type="text"
                  name="estimatedDuration"
                  defaultValue={timeline.estimatedDuration || "6 Minggu"}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-sm text-[#27213D] focus:outline-none focus:border-[#E66A48] focus:bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#716B7E]">
                  Target Peluncuran
                </label>
                <input
                  type="text"
                  name="targetLaunch"
                  defaultValue={timeline.targetLaunch || "Bulan Depan"}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-sm text-[#27213D] focus:outline-none focus:border-[#E66A48] focus:bg-white"
                />
              </div>
            </div>

            <div className="p-6 rounded-[28px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-4">
              <h3 className="text-sm font-bold text-[#27213D] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#E66A48]" />
                <span>Model Pendapatan & Bagi Hasil</span>
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#716B7E]">
                  Proporsi Bagi Hasil Penjualan Bersih
                </label>
                <input
                  type="text"
                  name="proposedSplit"
                  defaultValue={revenueModel.proposedSplit || "50% : 50%"}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-sm text-[#27213D] focus:outline-none focus:border-[#E66A48] focus:bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#716B7E]">
                  Format Brand Kolaborasi
                </label>
                <input
                  type="text"
                  name="brandModel"
                  defaultValue={ownershipRules.brandModel || "Co-Branding Bersama"}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-sm text-[#27213D] focus:outline-none focus:border-[#E66A48] focus:bg-white"
                />
              </div>
            </div>

            <div className="p-6 rounded-[28px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-4">
              <h3 className="text-sm font-bold text-[#27213D] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#E66A48]" />
                <span>Hak Kekayaan Intelektual (HAKI / IP)</span>
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#716B7E]">
                  Kepemilikan Motif/Desain Asli
                </label>
                <input
                  type="text"
                  name="originalIp"
                  defaultValue={ipRules.originalIp || "Hak cipta tetap milik pencipta asli"}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-sm text-[#27213D] focus:outline-none focus:border-[#E66A48] focus:bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#716B7E]">
                  Hak Pakai Produk Turunan
                </label>
                <input
                  type="text"
                  name="derivativeWorks"
                  defaultValue={ipRules.derivativeWorks || "Hak pakai bersama selama proyek aktif"}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-sm text-[#27213D] focus:outline-none focus:border-[#E66A48] focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingTerms}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-[#E66A48] hover:from-amber-600 hover:to-[#d85c3b] text-white font-bold text-sm shadow-md shadow-[#E66A48]/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingTerms ? "Menyimpan..." : "Simpan Kesepakatan & Ketentuan"}</span>
            </button>
          </div>
        </form>

        {/* Sub-seksi: Buku Log Kesepakatan & Adendum Bersama */}
        <section className="pt-8 border-t border-stone-200/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1E1B2E] tracking-tight flex items-center gap-2">
                <Scroll className="w-4 h-4 text-amber-500" />
                <span>Buku Log Kesepakatan & Adendum Bersama ({decisions.length})</span>
              </h3>
              <p className="text-xs text-stone-500 font-light">
                Catatan resmi jika ada penyesuaian kesepakatan tim di tengah kolaborasi (misal: penambahan look foto, pembagian biaya tambahan).
              </p>
            </div>
            {decisionMessage && (
              <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-3.5 py-1 rounded-xl border border-emerald-200">
                {decisionMessage}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {decisions.length === 0 ? (
              <div className="p-6 text-center rounded-[24px] bg-white border border-stone-200/80 text-xs text-stone-500 font-light">
                Belum ada adendum atau keputusan tambahan yang dicatat. Gunakan formulir di bawah jika ada perubahan kesepakatan tim.
              </div>
            ) : (
              decisions.map((d: any) => (
                <div key={d.id} className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm font-bold text-[#1E1B2E]">{d.title}</h4>
                    <span className="text-[10px] text-stone-400 font-medium">
                      {new Date(d.createdAt).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <div className="text-xs text-[#1E1B2E] leading-relaxed p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                    {d.decision}
                  </div>
                  {d.reason && (
                    <div className="text-[11px] text-stone-500 font-light">
                      <span className="font-semibold text-stone-600">Alasan:</span> {d.reason}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={handleRecordDecision}
            className="p-6 rounded-[28px] bg-white border border-stone-200/80 shadow-sm space-y-4"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E1B2E] flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-[#E66A48]" />
              <span>Catat Kesepakatan / Adendum Baru</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Judul Kesepakatan *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Contoh: Penambahan 2 Look Foto Sutra"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#1E1B2E] focus:outline-none focus:border-[#E66A48] focus:bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Dasar Pertimbangan (Opsional)
                </label>
                <input
                  type="text"
                  name="reason"
                  placeholder="Contoh: Kesepakatan bersama saat sesi fitting"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#1E1B2E] focus:outline-none focus:border-[#E66A48] focus:bg-white"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Isi Kesepakatan / Perubahan *
              </label>
              <textarea
                name="decision"
                required
                rows={2}
                placeholder="Rincian hasil mufakat yang disepakati seluruh pihak kolaborasi..."
                className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#1E1B2E] focus:outline-none focus:border-[#E66A48] focus:bg-white resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isRecordingDecision}
                className="px-5 py-2 rounded-xl bg-[#1E1B2E] hover:bg-stone-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isRecordingDecision ? "Menyimpan..." : "Simpan Catatan Kesepakatan"}
              </button>
            </div>
          </form>
        </section>
      </div>
      )}






      {/* TAB: CREDITS & SOCIAL TAGS */}
      {activeTab === "credits" && (
        <div className="space-y-8 animate-fade-in">
          <SocialCreditGenerator
            collaborationTitle={collaboration.title}
            participants={participants}
            plan={plan}
          />
        </div>
      )}

      {/* TAB 6: OUTCOMES & EVALUATION */}
      {activeTab === "outcomes" && (
        <div className="space-y-8 animate-fade-in">
          <div className="p-6 sm:p-8 rounded-[32px] bg-amber-50/50 border border-amber-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-[#27213D] tracking-tight">
                    Status Proyek & Siklus Hasil Kolaborasi
                  </h2>
                </div>
                <p className="text-xs text-[#716B7E] max-w-xl leading-relaxed">
                  Siklus kolaborasi dilengkapi dengan perekaman pencapaian nyata (produk, omzet, kampanye) serta umpan balik evaluasi komprehensif untuk menyempurnakan rekomendasi sinergi ekosistem.
                </p>
              </div>

              <div>
                {collaboration.status === "COMPLETED" ? (
                  <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <Check className="w-4 h-4" />
                    <span>Kolaborasi Selesai (COMPLETED)</span>
                  </div>
                ) : (
                  <button
                    onClick={handleCompleteCollaboration}
                    disabled={isCompletingCollab}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isCompletingCollab ? "Memproses..." : "Tandai Kolaborasi Selesai"}</span>
                  </button>
                )}
              </div>
            </div>

            {collabCompleteMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold animate-fade-in">
                {collabCompleteMessage}
              </div>
            )}

            {/* Direct Loop to Portfolio Showcase */}
            <div className="pt-3 border-t border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-stone-700">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Hasil dan luaran kolaborasi dapat Anda kelola dan pamerkan langsung di portofolio publik Anda.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/dashboard/showcase"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 text-[#1E1B2E] hover:bg-stone-50 text-xs font-bold transition-all shadow-2xs"
                >
                  <span>Kelola di Portofolio</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/showcase"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1E1B2E] text-white hover:bg-black text-xs font-bold transition-all shadow-2xs"
                >
                  <span>Lihat Showcase Publik</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#27213D] uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-500" />
                <span>Daftar Luaran Nyata ({outcomes.length})</span>
              </h3>
            </div>

            {outcomes.length === 0 ? (
              <div className="p-10 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#27213D]">Belum Ada Luaran yang Dicatat</h4>
                <p className="text-xs text-[#716B7E] max-w-md mx-auto leading-relaxed">
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
                      className="p-6 rounded-[28px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${typeInfo.badge}`}>
                          <TypeIcon className="w-3.5 h-3.5" />
                          <span>{typeInfo.label}</span>
                        </span>
                        <span className="text-[11px] text-[#716B7E]">
                          {new Date(item.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-[#27213D] leading-snug">{item.title}</h4>
                        <p className="text-xs text-[#716B7E] leading-relaxed">{item.description}</p>
                      </div>

                      {/* Prominent Evidence / Live Publication Link */}
                      {metrics.evidenceUrl && (
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-200/80 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <Globe className="w-4 h-4 text-[#E66A48] shrink-0" />
                            <span className="text-xs font-bold text-[#27213D] truncate">Publikasi / Bukti Portofolio</span>
                          </div>
                          <a
                            href={metrics.evidenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#E66A48] hover:bg-[#d85c3b] text-white text-[11px] font-bold transition-all shrink-0 shadow-2xs"
                          >
                            <span>Buka Karya</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-xs">
                        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                          <span className="text-[10px] text-[#716B7E] uppercase font-bold block">Hasil Karya / Unit</span>
                          <span className="font-bold text-[#27213D] mt-0.5 block">
                            {metrics.unitsProduced ? `${metrics.unitsProduced} Item / Look` : "Koleksi Selesai"}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                          <span className="text-[10px] text-[#716B7E] uppercase font-bold block">Nilai Finansial</span>
                          <span className="font-bold text-amber-800 mt-0.5 block">
                            {metrics.revenueAmount || "Barter / TFP Kolaboratif"}
                          </span>
                        </div>
                        {metrics.audienceReached && (
                          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 col-span-2">
                            <span className="text-[10px] text-[#716B7E] uppercase font-bold block">Jangkauan Audiens</span>
                            <span className="font-bold text-purple-800 mt-0.5 block">
                              {metrics.audienceReached}
                            </span>
                          </div>
                        )}
                      </div>

                      {metrics.notes && (
                        <div className="text-[11px] text-[#716B7E] bg-stone-50 p-3 rounded-xl border border-stone-200/60 italic">
                          &quot;{metrics.notes}&quot;
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Social Media Publication Credit Banner */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-r from-[#1E1B2E] via-[#2A243D] to-[#1E1B2E] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-[#1E1B2E]/5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-base font-bold text-white tracking-tight">
                  Publikasikan Karya Kolaborasi ke Media Sosial?
                </h4>
              </div>
              <p className="text-xs text-stone-300 font-light max-w-xl leading-relaxed">
                Gunakan format kredit satu-klik untuk memastikan seluruh tim kreatif (Wardrobe & Busana, Fotografer, Stylist, MUA, Model) ter-tag dan diapresiasi secara profesional di Instagram, TikTok, dan Press Release.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("credits")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#E66A48] hover:from-amber-600 hover:to-[#d85c3b] text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-md"
            >
              <span>Buka Generator Kredit</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <form
            onSubmit={handleRecordOutcome}
            className="p-6 sm:p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-5"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#27213D] uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#E66A48]" />
                <span>Catat Luaran Nyata (Outcome Baru)</span>
              </h3>
              <p className="text-xs text-[#716B7E]">
                Catat hasil riil yang terwujud dari kolaborasi ini sesuai fakta lapangan (tanpa mengarang angka).
              </p>
            </div>

            {outcomeMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs font-bold ${
                  outcomeMessage.includes("berhasil")
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border border-rose-200 text-rose-800"
                }`}
              >
                {outcomeMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#716B7E]">
                  Judul Luaran Nyata *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Contoh: Rilis Lookbook 12 Look Selesai & Terdistribusi ke Media"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-sm text-[#27213D] focus:outline-none focus:border-[#E66A48] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#716B7E] flex items-center justify-between">
                  <span>Tautan Bukti Publikasi / Media Sosial / Portofolio *</span>
                  <span className="text-[10px] text-[#E66A48] font-bold">Otentikasi Lapangan</span>
                </label>
                <input
                  type="url"
                  name="evidenceUrl"
                  required
                  placeholder="https://instagram.com/p/... atau https://drive.google.com/... atau link website lookbook"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-sm text-[#27213D] focus:outline-none focus:border-[#E66A48] focus:bg-white"
                />
                <p className="text-[11px] text-[#716B7E]">
                  Sertakan tautan postingan Instagram, link video TikTok BTS, katalog Google Drive, atau liputan media agar karya bersama terverifikasi.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#716B7E]">
                  Kategori Luaran *
                </label>
                <select
                  name="outcomeType"
                  defaultValue="PRODUCT"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-sm text-[#27213D] focus:outline-none focus:border-[#E66A48] focus:bg-white cursor-pointer"
                >
                  <option value="PRODUCT">Produk Fisik / Digital (Lookbook, Pakaian, Foto)</option>
                  <option value="CAMPAIGN">Kampanye / Pameran Bersama</option>
                  <option value="SERVICE">Layanan Kolaboratif</option>
                  <option value="MARKET_ACCESS">Akses Pasar / Ritel / Pop-up</option>
                  <option value="CREATIVE_ASSET">Aset Desain / HKI Bersama</option>
                  <option value="REVENUE">Realisasi Omzet / Penjualan Berbayar</option>
                  <option value="AUDIENCE_GROWTH">Pertumbuhan Pengikut / Audiens</option>
                  <option value="OTHER">Luaran Lainnya</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#716B7E]">
                  Jumlah Karya / Look / Konten (Opsional)
                </label>
                <input
                  type="number"
                  name="unitsProduced"
                  min="0"
                  placeholder="Contoh: 12 (12 look foto / 3 video reels)"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-sm text-[#27213D] focus:outline-none focus:border-[#E66A48] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#716B7E]">
                  Estimasi Nilai Komersial / Nilai Barter (Opsional)
                </label>
                <input
                  type="text"
                  name="revenueAmount"
                  placeholder="Contoh: Rp 17.500.000 (kosongkan jika barter/TFP)"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-sm text-[#27213D] focus:outline-none focus:border-[#E66A48] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#716B7E]">
                  Jangkauan Audiens / Impresi (Opsional)
                </label>
                <input
                  type="text"
                  name="audienceReached"
                  placeholder="Contoh: 12.000 tayangan video / 1.500 likes"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-sm text-[#27213D] focus:outline-none focus:border-[#E66A48] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#716B7E]">
                  Deskripsi Hasil Capaian *
                </label>
                <textarea
                  name="description"
                  required
                  rows={2}
                  placeholder="Rincian proses realisasi, respons pasar, atau keberhasilan karya bersama..."
                  className="w-full px-4 py-2 rounded-xl bg-stone-50 border border-stone-200/80 text-sm text-[#27213D] focus:outline-none focus:border-[#E66A48] focus:bg-white resize-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#716B7E]">
                  Catatan Pembelajaran Tambahan
                </label>
                <input
                  type="text"
                  name="notes"
                  placeholder="Kendala produksi yang teratasi, efisiensi bahan, dsb. (opsional)"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-sm text-[#27213D] focus:outline-none focus:border-[#E66A48] focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isRecordingOutcome}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#E66A48] hover:from-amber-600 hover:to-[#d85c3b] text-white font-bold text-xs shadow-md shadow-[#E66A48]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isRecordingOutcome ? "Menyimpan Luaran..." : "Simpan Luaran Nyata"}
            </button>
          </form>

          <section className="space-y-6 pt-6 border-t border-stone-200/80">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#27213D] uppercase tracking-wider flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-current" />
                <span>Evaluasi Kualitas Kolaborasi & Sinyal Pembelajaran Engine</span>
              </h3>
              <p className="text-xs text-[#716B7E]">
                Berikan penilaian 4-dimensi terhadap kolaborasi ini. Penilaian Anda menjadi sinyal validasi nyata untuk menyempurnakan engine peluang bagi seluruh ekosistem.
              </p>
            </div>

            <form
              onSubmit={handleSubmitFeedback}
              className="p-6 sm:p-8 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_10px_30px_rgba(39,33,61,0.03)] space-y-6"
            >
              {feedbackMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-bold ${
                    feedbackMessage.includes("berhasil")
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border border-rose-200 text-rose-800"
                  }`}
                >
                  {feedbackMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-[#27213D] block">1. Relevansi Peluang</label>
                    <span className="text-[11px] text-[#716B7E] block">Kesesuaian visi & identitas brand</span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRatings((prev) => ({ ...prev, relevanceScore: star }))}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                          selectedRatings.relevanceScore >= star
                            ? "bg-amber-500 text-white shadow-xs"
                            : "bg-white text-stone-400 hover:bg-stone-100 border border-stone-200"
                        }`}
                      >
                        <span>{star}</span>
                        <Star className="w-2.5 h-2.5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-[#27213D] block">2. Kelayakan Eksekusi</label>
                    <span className="text-[11px] text-[#716B7E] block">Kemudahan peran & koordinasi</span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRatings((prev) => ({ ...prev, feasibilityScore: star }))}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                          selectedRatings.feasibilityScore >= star
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-white text-stone-400 hover:bg-stone-100 border border-stone-200"
                        }`}
                      >
                        <span>{star}</span>
                        <Star className="w-2.5 h-2.5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-[#27213D] block">3. Kebaruan / Inovasi</label>
                    <span className="text-[11px] text-[#716B7E] block">Ide orisinal yang segar</span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRatings((prev) => ({ ...prev, noveltyScore: star }))}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                          selectedRatings.noveltyScore >= star
                            ? "bg-purple-600 text-white shadow-xs"
                            : "bg-white text-stone-400 hover:bg-stone-100 border border-stone-200"
                        }`}
                      >
                        <span>{star}</span>
                        <Star className="w-2.5 h-2.5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-[#27213D] block">4. Nilai Manfaat Nyata</label>
                    <span className="text-[11px] text-[#716B7E] block">Dampak positif pada usaha</span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRatings((prev) => ({ ...prev, usefulnessScore: star }))}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                          selectedRatings.usefulnessScore >= star
                            ? "bg-teal-600 text-white shadow-xs"
                            : "bg-white text-stone-400 hover:bg-stone-100 border border-stone-200"
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
                <label className="text-xs font-bold uppercase tracking-wider text-[#716B7E]">
                  Ulasan Kualitatif / Catatan Evaluasi Kolaborasi
                </label>
                <textarea
                  name="comments"
                  rows={2}
                  placeholder="Ceritakan pengalaman kolaborasi Anda, apa yang berjalan efektif, dan apa yang dapat diperbaiki..."
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-sm text-[#27213D] focus:outline-none focus:border-[#E66A48] focus:bg-white resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingFeedback}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#E66A48] hover:from-amber-600 hover:to-[#d85c3b] text-white font-bold text-xs shadow-md shadow-[#E66A48]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingFeedback ? "Menyimpan Evaluasi..." : "Kirim Ulasan Evaluasi"}
              </button>
            </form>

            {feedbacks.length > 0 && (
              <div className="space-y-3 pt-4">
                <h4 className="text-xs font-bold text-[#27213D] uppercase tracking-wider">
                  Ulasan dari Rekan Kolaborator ({feedbacks.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {feedbacks.map((f: any) => (
                    <div
                      key={f.id}
                      className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#27213D]">{f.actor?.name || "Aktor"}</span>
                        <span className="text-[11px] text-[#716B7E]">
                          {new Date(f.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[10px]">
                        {f.relevanceScore && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold flex items-center gap-1">
                            <span>Relevansi: {f.relevanceScore}</span>
                            <Star className="w-2.5 h-2.5 fill-current" />
                          </span>
                        )}
                        {f.feasibilityScore && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1">
                            <span>Kelayakan: {f.feasibilityScore}</span>
                            <Star className="w-2.5 h-2.5 fill-current" />
                          </span>
                        )}
                        {f.noveltyScore && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 font-bold flex items-center gap-1">
                            <span>Kebaruan: {f.noveltyScore}</span>
                            <Star className="w-2.5 h-2.5 fill-current" />
                          </span>
                        )}
                        {f.usefulnessScore && (
                          <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 font-bold flex items-center gap-1">
                            <span>Manfaat: {f.usefulnessScore}</span>
                            <Star className="w-2.5 h-2.5 fill-current" />
                          </span>
                        )}
                      </div>

                      {f.comments && (
                        <p className="text-[#27213D] leading-relaxed italic bg-stone-50 p-3 rounded-xl border border-stone-200/60">
                          &quot;{f.comments}&quot;
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
