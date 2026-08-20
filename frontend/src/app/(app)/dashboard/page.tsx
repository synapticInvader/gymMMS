"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "@/lib/mock-data/dashboard";
import { SummaryCards } from "@/components/domain/dashboard/SummaryCards";
import { MembersByBranch } from "@/components/domain/dashboard/MembersByBranch";
import { RecentlyJoined } from "@/components/domain/dashboard/RecentlyJoined";

export default function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard-summary"], queryFn: getDashboardSummary });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <SummaryCards summary={data} isLoading={isLoading} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MembersByBranch byBranch={data?.byBranch} isLoading={isLoading} />
        <RecentlyJoined members={data?.recentlyJoined} isLoading={isLoading} />
      </div>
    </div>
  );
}
