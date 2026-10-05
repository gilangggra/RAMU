"use client";

import React, { useState } from "react";
import { SlidersHorizontal, Sparkles, Layers, Briefcase, Inbox, Layers3 } from "lucide-react";

interface DashboardFeedContainerProps {
  matchesSection: React.ReactNode;
  resourcesSection: React.ReactNode;
  outcomeSection: React.ReactNode;
  briefsSection: React.ReactNode;
  bookingsSection: React.ReactNode;
  notificationsSection: React.ReactNode;
  coCreditSection: React.ReactNode;
}

type TabKey = "all" | "matches" | "resources" | "briefs" | "bookings";

export function DashboardFeedContainer({
  matchesSection,
  resourcesSection,
  outcomeSection,
  briefsSection,
  bookingsSection,
  notificationsSection,
  coCreditSection,
}: DashboardFeedContainerProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const tabs = [
    { key: "all" as TabKey, label: "Semua Feed", icon: Layers3 },
    { key: "matches" as TabKey, label: "Kecocokan 4 Pilar", icon: Sparkles },
    { key: "resources" as TabKey, label: "Resource Idle", icon: Layers },
    { key: "briefs" as TabKey, label: "Proyek & Brief", icon: Briefcase },
    { key: "bookings" as TabKey, label: "Pesanan Masuk", icon: Inbox },
  ];

  return (
    <div className="space-y-6">
      {/* FILTER TABS (Attio segmented control bar) */}
      <div className="flex items-center justify-between gap-3 border-b border-stone-200/70 pb-3 overflow-x-auto no-scrollbar">
        <div className="inline-flex items-center p-1 rounded-xl bg-stone-100/90 border border-stone-200/70 shrink-0 gap-1 shadow-2xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-stone-900 font-semibold shadow-2xs border border-stone-200/80"
                    : "text-stone-500 hover:text-stone-900 font-medium hover:bg-stone-200/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-stone-900" : "text-stone-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-stone-400 text-xs shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium text-stone-500">Tampilan Terstruktur</span>
        </div>
      </div>

      {/* FEED CONTENT BASED ON ACTIVE TAB */}
      <div className="space-y-8 animate-fade-in">
        {coCreditSection}

        {(activeTab === "all" || activeTab === "matches") && (
          <section className="space-y-2">{matchesSection}</section>
        )}

        {(activeTab === "all" || activeTab === "resources") && (
          <section className="space-y-2">{resourcesSection}</section>
        )}

        {activeTab === "all" && (
          <section className="space-y-2">{outcomeSection}</section>
        )}

        {(activeTab === "all" || activeTab === "briefs") && (
          <section className="space-y-2">{briefsSection}</section>
        )}

        {(activeTab === "all" || activeTab === "bookings") && (
          <section className="space-y-2">{bookingsSection}</section>
        )}

        {activeTab === "all" && (
          <section className="space-y-2">{notificationsSection}</section>
        )}
      </div>
    </div>
  );
}
