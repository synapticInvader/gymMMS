import { daysUntil } from "@/lib/date";
import { delay } from "@/lib/mock-data/delay";
import { listMemberViews, type MemberView } from "@/lib/mock-data/members";

export async function getDues(): Promise<MemberView[]> {
  await delay();
  return listMemberViews()
    .filter((m) => m.balance > 0)
    .sort((a, b) => b.balance - a.balance);
}

export async function getDuesSummary(): Promise<{ totalDue: number; memberCount: number }> {
  await delay();
  const dues = listMemberViews().filter((m) => m.balance > 0);
  return {
    totalDue: dues.reduce((sum, m) => sum + m.balance, 0),
    memberCount: dues.length,
  };
}

export async function getExpiringSoon(windowDays: number): Promise<(MemberView & { daysLeft: number })[]> {
  await delay();
  return listMemberViews()
    .filter((m) => m.activePackage && m.balance === 0)
    .map((m) => ({ ...m, daysLeft: daysUntil(m.activePackage!.expiry_date) }))
    .filter((m) => m.daysLeft >= 0 && m.daysLeft <= windowDays)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}
