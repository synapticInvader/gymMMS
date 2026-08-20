import { isWithinPeriod } from "@/lib/date";
import { delay } from "@/lib/mock-data/delay";
import { listMemberViews, type MemberView } from "@/lib/mock-data/members";
import { BRANCHES } from "@/lib/mock-data/seed";

export interface DashboardSummary {
  totalMembers: number;
  newThisMonth: number;
  due: number;
  expired: number;
  byBranch: { branchId: string; branchName: string; count: number }[];
  recentlyJoined: MemberView[];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  await delay();
  const views = listMemberViews();

  const byBranch = BRANCHES.map((branch) => ({
    branchId: branch.id,
    branchName: branch.name,
    count: views.filter((m) => m.branch_id === branch.id).length,
  }));

  const recentlyJoined = [...views]
    .sort((a, b) => new Date(b.join_date).getTime() - new Date(a.join_date).getTime())
    .slice(0, 5);

  return {
    totalMembers: views.length,
    newThisMonth: views.filter((m) => isWithinPeriod(m.join_date, "month")).length,
    due: views.filter((m) => m.computedStatus === "due").length,
    expired: views.filter((m) => m.computedStatus === "expired").length,
    byBranch,
    recentlyJoined,
  };
}
