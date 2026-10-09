"use client";

import React, { useState } from "react";
import { Handshake, Layers, Briefcase, Inbox, TrendingUp } from "lucide-react";

interface DashboardFeedContainerProps {
  matchesSection: React.ReactNode;
  resourcesSection: React.ReactNode;
  outcomeSection?: React.ReactNode;
  briefsSection: React.ReactNode;
  bookingsSection?: React.ReactNode;
  notificationsSection?: React.ReactNode;
  coCreditSection?: React.ReactNode;
  pendingBookingCount?: number;
}

type TabKey = "briefs" | "matches" | "resources" | "outcomes" | "bookings";

export function DashboardFeedContainer({
  matchesSection,
  resourcesSection,
  outcomeSection,
  briefsSection,
  bookingsSection,
  notificationsSection,
  coCreditSection,
  pendingBookingCount = 0,
}: DashboardFeedContainerProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("briefs");

  const tabs: { key: TabKey; label: string; icon: any; badge?: number }[] = [
    { key: "briefs", label: "Brief Proyek", icon: Briefcase },
    { key: "matches", label: "Rekomendasi Match", icon: Handshake },
    { key: "resources", label: "Resource & Studio", icon: Layers },
    ...(outcomeSection ? [{ key: "outcomes" as TabKey, label: "Dampak & Luaran SPK", icon: TrendingUp }] : []),
    ...(bookingsSection ? [{ key: "bookings" as TabKey, label: "Pesanan Masuk", icon: Inbox, badge: pendingBookingCount }] : []),
  ];

  return (
    <div className="space-y-4">
      {/* FILTER TABS (Clean Modern Tab Bar) */}
      <div className="flex items-center justify-between gap-3 border-b border-white/80 pb-3 overflow-x-auto no-scrollbar">
        <div className="inline-flex items-center p-1.5 rounded-full bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] shrink-0 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                  isActive
                    ? "bg-white/95 text-[#111827] font-bold shadow-xs border border-white/80"
                    : "text-[#4B5563] hover:text-[#111827] font-medium hover:bg-white/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#0284c7]" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-white leading-none">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* FEED CONTENT: FOCUSED PER TAB */}
      <div className="space-y-4 animate-fade-in">
        {coCreditSection}

        {activeTab === "briefs" && (
          <section className="space-y-3">{briefsSection}</section>
        )}

        {activeTab === "matches" && (
          <section className="space-y-4">{matchesSection}</section>
        )}

        {activeTab === "resources" && (
          <section className="space-y-3">{resourcesSection}</section>
        )}

        {activeTab === "outcomes" && outcomeSection && (
          <section className="space-y-3">{outcomeSection}</section>
        )}

        {activeTab === "bookings" && bookingsSection && (
          <section className="space-y-3">{bookingsSection}</section>
        )}
      </div>
    </div>
  );
}
