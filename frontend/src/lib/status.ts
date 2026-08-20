import { daysUntil, today } from "@/lib/date";
import type { MemberStatus } from "@/lib/mock-data/types";

export const DEFAULT_EXPIRING_WINDOW_DAYS = 7;

/** Single source of truth for status derivation — Dashboard, Members, Dues, and
 * Expiring Soon all call this so their counts never silently disagree. */
export function deriveStatus(params: {
  expiryDate: string | Date;
  balance: number;
  expiringWindowDays?: number;
  now?: Date;
}): MemberStatus {
  const { expiryDate, balance, expiringWindowDays = DEFAULT_EXPIRING_WINDOW_DAYS, now = today() } = params;
  const remainingDays = daysUntil(expiryDate, now);

  if (remainingDays < 0) return "expired";
  if (balance > 0) return "due";
  if (remainingDays <= expiringWindowDays) return "expiring_soon";
  return "active";
}

export const STATUS_LABEL: Record<MemberStatus, string> = {
  active: "Active",
  due: "Due",
  expiring_soon: "Expiring Soon",
  expired: "Expired",
};
