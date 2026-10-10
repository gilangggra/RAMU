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

  const tabs: { key: TabKey; label: string; shortLabel: string; icon: any; badge?: number }[] = [
    { key: "briefs", label: "Brief Proyek", shortLabel: "Brief", icon: Briefcase },
    { key: "matches", label: "Rekomendasi", shortLabel: "Rekomendasi", icon: Handshake },
    { key: "resources", label: "Resource & Studio", shortLabel: "Resource", icon: Layers },
    ...(outcomeSection ? [{ key: "outcomes" as TabKey, label: "Luaran SPK", shortLabel: "SPK", icon: TrendingUp }] : []),
    ...(bookingsSection ? [{ key: "bookings" as TabKey, label: "Pesanan Masuk", shortLabel: "Pesanan", icon: Inbox, badge: pendingBookingCount }] : []),
  ];

  return (
    <div className="space-y-4">
      {/* FILTER TABS (Clean Responsive Segmented Tab Bar - Zero Clipping) */}
      <div className="w-full">
        <div className="p-1 sm:p-1.5 rounded-full bg-white/95 border border-stone-200/80 shadow-xs flex items-center gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-w-max sm:min-w-0 ${
                  isActive
                    ? "bg-[#4CC9FE] text-white shadow-xs shadow-[#4CC9FE]/30"
                    : "text-[#716B7E] hover:text-[#27213D] hover:bg-stone-100/70 font-semibold"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-[#716B7E]"}`} />
                <span className="hidden xl:inline">{tab.label}</span>
                <span className="xl:hidden">{tab.shortLabel}</span>
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full leading-none shrink-0 ${
                      isActive ? "bg-white text-[#0284c7]" : "bg-amber-500 text-white"
                    }`}
                  >
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
