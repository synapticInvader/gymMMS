import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  endOfQuarter,
  format,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfQuarter,
} from "date-fns";

/** Single fixed "today" used everywhere (Attendance's same-day check, Dashboard's
 * "this month", Finance's period bucketing) so pages never disagree on the current day. */
export function today(): Date {
  return startOfDay(new Date());
}

export function computeExpiryDate(joinDate: string | Date, durationDays: number): Date {
  const start = typeof joinDate === "string" ? new Date(joinDate) : joinDate;
  return addDays(startOfDay(start), durationDays);
}

export function daysUntil(date: string | Date, from: Date = today()): number {
  const target = typeof date === "string" ? new Date(date) : date;
  return differenceInCalendarDays(startOfDay(target), from);
}

export function isSameDay(a: string | Date, b: Date = today()): boolean {
  return daysUntil(a, b) === 0;
}

export type Period = "month" | "quarter";

export function periodBounds(period: Period, anchor: Date = today()) {
  return period === "month"
    ? { start: startOfMonth(anchor), end: endOfMonth(anchor) }
    : { start: startOfQuarter(anchor), end: endOfQuarter(anchor) };
}

export function isWithinPeriod(date: string | Date, period: Period, anchor: Date = today()) {
  const target = typeof date === "string" ? new Date(date) : date;
  const { start, end } = periodBounds(period, anchor);
  return isWithinInterval(target, { start, end });
}

export function formatDate(date: string | Date, pattern = "dd/MM/yyyy"): string {
  const target = typeof date === "string" ? new Date(date) : date;
  return format(target, pattern);
}
