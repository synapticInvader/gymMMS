import { isSameDay } from "@/lib/date";
import { delay } from "@/lib/mock-data/delay";
import { ATTENDANCE, BRANCHES, MEMBERS } from "@/lib/mock-data/seed";
import type { Attendance } from "@/lib/mock-data/types";

let attendanceCounter = ATTENDANCE.length;

export interface AttendanceRow extends Attendance {
  memberName: string;
  branchName: string;
}

function toRow(a: Attendance): AttendanceRow {
  return {
    ...a,
    memberName: MEMBERS.find((m) => m.id === a.member_id)?.name ?? "Unknown member",
    branchName: BRANCHES.find((b) => b.id === a.branch_id)?.name ?? "Unknown branch",
  };
}

export function todaysCheckInFor(memberId: string): Attendance | undefined {
  return ATTENDANCE.find((a) => a.member_id === memberId && isSameDay(a.checked_in_at));
}

export async function searchMembersForCheckIn(query: string) {
  await delay(250);
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];
  return MEMBERS.filter((m) => m.name.toLowerCase().includes(q) || m.mobile.includes(q)).map((m) => ({
    member: m,
    checkedInToday: todaysCheckInFor(m.id),
  }));
}

export async function checkIn(memberId: string): Promise<Attendance> {
  await delay();
  const member = MEMBERS.find((m) => m.id === memberId);
  if (!member) throw new Error("Member not found");
  if (todaysCheckInFor(memberId)) {
    throw new Error("This member has already checked in today");
  }

  attendanceCounter += 1;
  const record: Attendance = {
    id: `att_${String(attendanceCounter).padStart(3, "0")}`,
    member_id: memberId,
    branch_id: member.branch_id,
    checked_in_at: new Date().toISOString(),
  };
  ATTENDANCE.push(record);
  return record;
}

export interface AttendanceFilters {
  branchId?: string | "all";
  from?: string;
  to?: string;
}

export async function getAttendanceLog(filters: AttendanceFilters = {}): Promise<AttendanceRow[]> {
  await delay();
  const { branchId = "all", from, to } = filters;

  return ATTENDANCE.filter((a) => {
    const matchesBranch = branchId === "all" || a.branch_id === branchId;
    const checkedInDate = a.checked_in_at.slice(0, 10);
    const matchesFrom = !from || checkedInDate >= from;
    const matchesTo = !to || checkedInDate <= to;
    return matchesBranch && matchesFrom && matchesTo;
  })
    .sort((a, b) => new Date(b.checked_in_at).getTime() - new Date(a.checked_in_at).getTime())
    .map(toRow);
}
