import { addDays, subDays, subMonths } from "date-fns";
import { today } from "@/lib/date";
import { deriveStatus } from "@/lib/status";
import type {
  Attendance,
  Branch,
  Branding,
  Expense,
  Member,
  MemberPackage,
  OtherIncome,
  Package,
  Payment,
  PayrollEntry,
  Tenant,
} from "@/lib/mock-data/types";

function id(prefix: string, n: number): string {
  return `${prefix}_${String(n).padStart(3, "0")}`;
}

function iso(date: Date): string {
  return date.toISOString();
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export const TENANT: Tenant = {
  id: id("tenant", 1),
  name: "My Gym",
  plan: "basic",
  created_at: iso(subMonths(today(), 18)),
};

export const BRANCHES: Branch[] = [
  { id: id("branch", 1), tenant_id: TENANT.id, name: "Main Branch", created_at: iso(subMonths(today(), 18)) },
  { id: id("branch", 2), tenant_id: TENANT.id, name: "Westside Branch", created_at: iso(subMonths(today(), 10)) },
];

export const PACKAGES: Package[] = [
  { id: id("pkg", 1), tenant_id: TENANT.id, name: "Monthly", duration_days: 30, default_price: 1500 },
  { id: id("pkg", 2), tenant_id: TENANT.id, name: "Quarterly", duration_days: 90, default_price: 4000 },
  { id: id("pkg", 3), tenant_id: TENANT.id, name: "Half-Yearly", duration_days: 180, default_price: 7000 },
  { id: id("pkg", 4), tenant_id: TENANT.id, name: "Annual", duration_days: 365, default_price: 12000 },
];

const OWNER_USER_ID = "user_owner";

interface MemberSeed {
  name: string;
  mobile: string;
  gender: "male" | "female" | null;
  branch: Branch;
  package: Package;
  /** Days ago the current package started. */
  startOffsetDays: number;
  /** Fraction of the package price already paid (drives balance / "due" status). */
  paidRatio: number;
  /** Number of separate payments to split the paid amount across. */
  paymentSplits?: number;
  /** Extra prior (renewed/expired) package to exercise history preservation. */
  priorPackage?: { package: Package; startOffsetDays: number; paidRatio: number };
}

const MEMBER_SEEDS: MemberSeed[] = [
  { name: "Aarav Sharma", mobile: "9820011122", gender: "male", branch: BRANCHES[0], package: PACKAGES[3], startOffsetDays: 200, paidRatio: 1, paymentSplits: 2,
    priorPackage: { package: PACKAGES[1], startOffsetDays: 290, paidRatio: 1 } },
  { name: "Priya Iyer", mobile: "9820011123", gender: "female", branch: BRANCHES[0], package: PACKAGES[0], startOffsetDays: 10, paidRatio: 1 },
  { name: "Rohan Mehta", mobile: "9820011124", gender: "male", branch: BRANCHES[0], package: PACKAGES[1], startOffsetDays: 40, paidRatio: 0.5, paymentSplits: 1 },
  { name: "Sneha Kulkarni", mobile: "9820011125", gender: "female", branch: BRANCHES[0], package: PACKAGES[0], startOffsetDays: 27, paidRatio: 1 },
  { name: "Vikram Nair", mobile: "9820011126", gender: "male", branch: BRANCHES[0], package: PACKAGES[2], startOffsetDays: 175, paidRatio: 1, paymentSplits: 2 },
  { name: "Ananya Rao", mobile: "9820011127", gender: "female", branch: BRANCHES[0], package: PACKAGES[0], startOffsetDays: 35, paidRatio: 0 },
  { name: "Karan Malhotra", mobile: "9820011128", gender: "male", branch: BRANCHES[0], package: PACKAGES[1], startOffsetDays: 3, paidRatio: 1 },
  { name: "Ishita Desai", mobile: "9820011129", gender: "female", branch: BRANCHES[0], package: PACKAGES[0], startOffsetDays: 1, paidRatio: 1 },
  { name: "Aditya Kapoor", mobile: "9820011130", gender: "male", branch: BRANCHES[1], package: PACKAGES[3], startOffsetDays: 100, paidRatio: 1, paymentSplits: 3 },
  { name: "Meera Pillai", mobile: "9820011131", gender: "female", branch: BRANCHES[1], package: PACKAGES[0], startOffsetDays: 26, paidRatio: 1 },
  { name: "Siddharth Joshi", mobile: "9820011132", gender: "male", branch: BRANCHES[1], package: PACKAGES[1], startOffsetDays: 85, paidRatio: 0.3 },
  { name: "Divya Menon", mobile: "9820011133", gender: "female", branch: BRANCHES[1], package: PACKAGES[0], startOffsetDays: 5, paidRatio: 1 },
  { name: "Arjun Reddy", mobile: "9820011134", gender: "male", branch: BRANCHES[1], package: PACKAGES[2], startOffsetDays: 170, paidRatio: 1 },
  { name: "Kavya Bhat", mobile: "9820011135", gender: "female", branch: BRANCHES[1], package: PACKAGES[0], startOffsetDays: 32, paidRatio: 1 },
];

let memberSeq = 0;
let packageSeq = 0;
let paymentSeq = 0;
let attendanceSeq = 0;

const members: Member[] = [];
const memberPackages: MemberPackage[] = [];
const payments: Payment[] = [];
const attendance: Attendance[] = [];

function buildPackageAndPayments(memberId: string, seed: {
  package: Package;
  startOffsetDays: number;
  paidRatio: number;
  paymentSplits?: number;
}) {
  packageSeq += 1;
  const startDate = subDays(today(), seed.startOffsetDays);
  const expiryDate = addDays(startDate, seed.package.duration_days);
  const mp: MemberPackage = {
    id: id("mpkg", packageSeq),
    member_id: memberId,
    package_id: seed.package.id,
    total_amount: seed.package.default_price,
    start_date: isoDate(startDate),
    expiry_date: isoDate(expiryDate),
    created_at: iso(startDate),
  };
  memberPackages.push(mp);

  const paidAmount = Math.round(seed.package.default_price * seed.paidRatio);
  const splits = seed.paymentSplits ?? (paidAmount > 0 ? 1 : 0);
  if (splits > 0 && paidAmount > 0) {
    const perSplit = Math.floor(paidAmount / splits);
    for (let i = 0; i < splits; i += 1) {
      paymentSeq += 1;
      const isLast = i === splits - 1;
      payments.push({
        id: id("pay", paymentSeq),
        member_package_id: mp.id,
        amount: isLast ? paidAmount - perSplit * (splits - 1) : perSplit,
        mode: (["cash", "upi", "card"] as const)[i % 3],
        paid_on: isoDate(addDays(startDate, i * 2)),
        recorded_by: OWNER_USER_ID,
        created_at: iso(addDays(startDate, i * 2)),
      });
    }
  }

  return mp;
}

for (const seed of MEMBER_SEEDS) {
  memberSeq += 1;
  const memberId = id("member", memberSeq);

  if (seed.priorPackage) {
    buildPackageAndPayments(memberId, seed.priorPackage);
  }
  const currentPackage = buildPackageAndPayments(memberId, seed);

  const balance = currentPackage.total_amount - payments
    .filter((p) => p.member_package_id === currentPackage.id)
    .reduce((sum, p) => sum + p.amount, 0);

  const status = deriveStatus({ expiryDate: currentPackage.expiry_date, balance });

  members.push({
    id: memberId,
    tenant_id: TENANT.id,
    branch_id: seed.branch.id,
    name: seed.name,
    mobile: seed.mobile,
    gender: seed.gender,
    join_date: isoDate(subDays(today(), seed.startOffsetDays)),
    status,
    created_at: iso(subDays(today(), seed.startOffsetDays)),
  });
}

// Attendance: a handful of check-ins today, plus a two-week history.
const todaysCheckIns = [members[1], members[3], members[6], members[7], members[9]];
for (const member of todaysCheckIns) {
  attendanceSeq += 1;
  attendance.push({
    id: id("att", attendanceSeq),
    member_id: member.id,
    branch_id: member.branch_id,
    checked_in_at: iso(subDays(today(), 0)),
  });
}
for (let daysAgo = 1; daysAgo <= 14; daysAgo += 1) {
  const attendeesToday = members.filter((_, idx) => (idx + daysAgo) % 3 !== 0);
  for (const member of attendeesToday) {
    attendanceSeq += 1;
    attendance.push({
      id: id("att", attendanceSeq),
      member_id: member.id,
      branch_id: member.branch_id,
      checked_in_at: iso(subDays(today(), daysAgo)),
    });
  }
}

export const MEMBERS = members;
export const MEMBER_PACKAGES = memberPackages;
export const PAYMENTS = payments;
export const ATTENDANCE = attendance;

// --- Finance: expenses / payroll / other income across this month and last month ---

export const EXPENSES: Expense[] = [
  { id: id("exp", 1), tenant_id: TENANT.id, category: "rent", amount: 45000, date: isoDate(today()), note: "Monthly rent" },
  { id: id("exp", 2), tenant_id: TENANT.id, category: "utilities", amount: 6200, date: isoDate(subDays(today(), 4)), note: "Electricity + water" },
  { id: id("exp", 3), tenant_id: TENANT.id, category: "maintenance", amount: 3500, date: isoDate(subDays(today(), 9)), note: "Treadmill servicing" },
  { id: id("exp", 4), tenant_id: TENANT.id, category: "supplies", amount: 1800, date: isoDate(subDays(today(), 15)), note: "Cleaning supplies" },
  { id: id("exp", 5), tenant_id: TENANT.id, category: "rent", amount: 45000, date: isoDate(subMonths(today(), 1)), note: "Monthly rent" },
  { id: id("exp", 6), tenant_id: TENANT.id, category: "marketing", amount: 5000, date: isoDate(subMonths(today(), 1)), note: "Local flyers" },
];

export const PAYROLL: PayrollEntry[] = [
  { id: id("pay_e", 1), tenant_id: TENANT.id, staff_name: "Rahul Verma (Trainer)", amount: 22000, pay_period: isoDate(today()).slice(0, 7), date: isoDate(today()) },
  { id: id("pay_e", 2), tenant_id: TENANT.id, staff_name: "Neha Shah (Front Desk)", amount: 16000, pay_period: isoDate(today()).slice(0, 7), date: isoDate(today()) },
  { id: id("pay_e", 3), tenant_id: TENANT.id, staff_name: "Rahul Verma (Trainer)", amount: 22000, pay_period: isoDate(subMonths(today(), 1)).slice(0, 7), date: isoDate(subMonths(today(), 1)) },
  { id: id("pay_e", 4), tenant_id: TENANT.id, staff_name: "Neha Shah (Front Desk)", amount: 16000, pay_period: isoDate(subMonths(today(), 1)).slice(0, 7), date: isoDate(subMonths(today(), 1)) },
];

export const OTHER_INCOME: OtherIncome[] = [
  { id: id("oi", 1), tenant_id: TENANT.id, source: "Personal training add-on", amount: 3000, date: isoDate(subDays(today(), 6)) },
  { id: id("oi", 2), tenant_id: TENANT.id, source: "Merchandise sale", amount: 1200, date: isoDate(subMonths(today(), 1)) },
];

export const BRANDING: Branding = {
  tenant_id: TENANT.id,
  gym_name: "My Gym",
  tagline: "Stronger every day",
  primary_color: "#4f46e5",
  logo_url: null,
  custom_domain: null,
};
