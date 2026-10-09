"use client";

import { useMemo } from "react";
import {
  CheckSquare,
  Circle,
  Target,
  Scroll,
  Trophy,
  Star,
  Users,
  MessageSquare,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

type ActivityKind =
  | "task_created"
  | "task_completed"
  | "task_in_progress"
  | "milestone_reached"
  | "milestone_pending"
  | "decision_recorded"
  | "outcome_added"
  | "feedback_given"
  | "participant_joined"
  | "collaboration_started";

interface ActivityEntry {
  id: string;
  kind: ActivityKind;
  title: string;
  subtitle?: string;
  actorName?: string;
  timestamp: Date;
}

const KIND_CONFIG: Record<
  ActivityKind,
  { icon: React.ComponentType<{ className?: string }>; bg: string; iconColor: string; dot: string }
> = {
  task_completed: {
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    dot: "bg-emerald-500",
  },
  task_in_progress: {
    icon: Loader2,
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    dot: "bg-amber-400",
  },
  task_created: {
    icon: CheckSquare,
    bg: "bg-slate-50",
    iconColor: "text-slate-500",
    dot: "bg-slate-300",
  },
  milestone_reached: {
    icon: Target,
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
    dot: "bg-violet-500",
  },
  milestone_pending: {
    icon: Circle,
    bg: "bg-slate-50",
    iconColor: "text-slate-400",
    dot: "bg-slate-200",
  },
  decision_recorded: {
    icon: Scroll,
    bg: "bg-sky-50",
    iconColor: "text-sky-600",
    dot: "bg-sky-400",
  },
  outcome_added: {
    icon: TrendingUp,
    bg: "bg-teal-50",
    iconColor: "text-teal-600",
    dot: "bg-teal-400",
  },
  feedback_given: {
    icon: Star,
    bg: "bg-pink-50",
    iconColor: "text-pink-600",
    dot: "bg-pink-400",
  },
  participant_joined: {
    icon: Users,
    bg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    dot: "bg-indigo-400",
  },
  collaboration_started: {
    icon: Trophy,
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    dot: "bg-amber-400",
  },
};

function relativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHr < 24) return `${diffHr} jam lalu`;
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: diffDay > 365 ? "numeric" : undefined,
  });
}

interface CollaborationActivityFeedProps {
  collaboration: {
    createdAt: string | Date;
    title: string;
    tasks?: Array<{
      id: string;
      title: string;
      status: string;
      createdAt: string | Date;
      updatedAt: string | Date;
      assignedActor?: { name: string } | null;
    }>;
    milestones?: Array<{
      id: string;
      title: string;
      status: string;
      createdAt: string | Date;
      updatedAt: string | Date;
    }>;
    decisions?: Array<{
      id: string;
      title: string;
      createdAt: string | Date;
    }>;
    outcomes?: Array<{
      id: string;
      title: string;
      createdAt: string | Date;
    }>;
    feedbacks?: Array<{
      id: string;
      rating?: number | null;
      createdAt: string | Date;
      actor?: { name: string } | null;
    }>;
    participants?: Array<{
      actorId: string;
      joinedAt: string | Date;
      actor?: { name: string } | null;
    }>;
  };
}

export function CollaborationActivityFeed({
  collaboration,
}: CollaborationActivityFeedProps) {
  const activities = useMemo<ActivityEntry[]>(() => {
    const entries: ActivityEntry[] = [];

    entries.push({
      id: "collab-start",
      kind: "collaboration_started",
      title: "Kolaborasi dimulai",
      subtitle: collaboration.title,
      timestamp: new Date(collaboration.createdAt),
    });

    for (const p of collaboration.participants ?? []) {
      entries.push({
        id: `participant-${p.actorId}`,
        kind: "participant_joined",
        title: `${p.actor?.name ?? "Anggota"} bergabung`,
        subtitle: "Anggota kolaborasi",
        timestamp: new Date(p.joinedAt),
      });
    }

    for (const task of collaboration.tasks ?? []) {

      entries.push({
        id: `task-created-${task.id}`,
        kind: "task_created",
        title: `Tugas dibuat: ${task.title}`,
        subtitle: task.assignedActor ? `Ditugaskan ke ${task.assignedActor.name}` : undefined,
        timestamp: new Date(task.createdAt),
      });

      const createdMs = new Date(task.createdAt).getTime();
      const updatedMs = new Date(task.updatedAt).getTime();
      if (updatedMs - createdMs > 30_000) {
        if (task.status === "DONE") {
          entries.push({
            id: `task-done-${task.id}`,
            kind: "task_completed",
            title: `Tugas selesai: ${task.title}`,
            actorName: task.assignedActor?.name,
            timestamp: new Date(task.updatedAt),
          });
        } else if (task.status === "IN_PROGRESS") {
          entries.push({
            id: `task-inprogress-${task.id}`,
            kind: "task_in_progress",
            title: `Tugas dikerjakan: ${task.title}`,
            actorName: task.assignedActor?.name,
            timestamp: new Date(task.updatedAt),
          });
        }
      }
    }

    for (const ms of collaboration.milestones ?? []) {
      const updatedMs = new Date(ms.updatedAt).getTime();
      const createdMs = new Date(ms.createdAt).getTime();
      const isDone = ms.status === "COMPLETED" || ms.status === "ACHIEVED";
      if (isDone && updatedMs - createdMs > 30_000) {
        entries.push({
          id: `milestone-${ms.id}`,
          kind: "milestone_reached",
          title: `Milestone tercapai: ${ms.title}`,
          timestamp: new Date(ms.updatedAt),
        });
      } else {
        entries.push({
          id: `milestone-created-${ms.id}`,
          kind: "milestone_pending",
          title: `Milestone ditetapkan: ${ms.title}`,
          timestamp: new Date(ms.createdAt),
        });
      }
    }

    for (const d of collaboration.decisions ?? []) {
      entries.push({
        id: `decision-${d.id}`,
        kind: "decision_recorded",
        title: `Keputusan dicatat: ${d.title}`,
        timestamp: new Date(d.createdAt),
      });
    }

    for (const o of collaboration.outcomes ?? []) {
      entries.push({
        id: `outcome-${o.id}`,
        kind: "outcome_added",
        title: `Output ditambahkan: ${o.title}`,
        timestamp: new Date(o.createdAt),
      });
    }

    for (const f of collaboration.feedbacks ?? []) {
      entries.push({
        id: `feedback-${f.id}`,
        kind: "feedback_given",
        title: `Ulasan diberikan${f.rating ? ` · Rating ${f.rating}/5` : ""}`,
        actorName: f.actor?.name,
        timestamp: new Date(f.createdAt),
      });
    }

    return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [collaboration]);

  if (activities.length === 0) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  function dateGroup(ts: Date): string {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime()) return "Hari Ini";
    if (d.getTime() === yesterday.getTime()) return "Kemarin";
    return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });
  }

  const groups: { label: string; items: ActivityEntry[] }[] = [];
  for (const a of activities) {
    const label = dateGroup(a.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(a);
    } else {
      groups.push({ label, items: [a] });
    }
  }

  return (
    <section className="rounded-[22px] overflow-hidden border border-white/80 glass-card shadow-2xs">

      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-white/95 border border-white/80 shadow-2xs flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-[#0284c7]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Aktivitas Kolaborasi
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {activities.length} event · urut terbaru
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">Live</span>
        </div>
      </div>

      <div className="px-6 py-4 space-y-5 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {groups.map((group) => (
          <div key={group.label} className="space-y-3">

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 shrink-0">
                {group.label}
              </span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <div className="relative space-y-1 pl-5">

              <div className="absolute left-[7px] top-4 bottom-4 w-px bg-slate-100" />

              {group.items.map((activity) => {
                const cfg = KIND_CONFIG[activity.kind];
                const Icon = cfg.icon;

                return (
                  <div
                    key={activity.id}
                    className="relative flex items-start gap-3 py-2 group"
                  >

                    <div
                      className={`absolute left-[-13px] w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm shrink-0 mt-1 ${cfg.dot}`}
                    />

                    <div
                      className={`w-7 h-7 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${cfg.iconColor}`} />
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-[12px] font-semibold text-slate-900 leading-snug truncate">
                        {activity.title}
                      </p>
                      {(activity.subtitle || activity.actorName) && (
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                          {activity.actorName && (
                            <span className="font-medium text-slate-500">{activity.actorName}</span>
                          )}
                          {activity.actorName && activity.subtitle && " · "}
                          {activity.subtitle}
                        </p>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-300 shrink-0 pt-0.5 font-medium">
                      {relativeTime(activity.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 text-center">
          Aktivitas diperbarui secara otomatis setiap kali ada perubahan di workspace ini
        </p>
      </div>
    </section>
  );
}
