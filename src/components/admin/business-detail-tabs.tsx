"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type DetailTab = "overview" | "menu" | "history";

const TABS: { key: DetailTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "menu", label: "Menu" },
  { key: "history", label: "Subscription History" },
];

export function BusinessDetailTabs({
  overview,
  menu,
  history,
}: {
  overview: React.ReactNode;
  menu: React.ReactNode;
  history: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const panels: Record<DetailTab, React.ReactNode> = { overview, menu, history };

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex gap-5 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "-mb-px border-b-2 pb-3 text-sm font-medium transition-colors",
              tab.key === activeTab
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div>{panels[activeTab]}</div>
    </div>
  );
}
