import { apiFetch } from "@/lib/api/client";
import { delay } from "@/lib/mock-data/delay";
import { BRANCHES, MEMBERS, MEMBER_PACKAGES, PACKAGES, PAYMENTS } from "@/lib/mock-data/seed";
import { deriveStatus } from "@/lib/status";
import type { Branch, Member, MemberPackage, MemberStatus, Package, PaymentMode } from "@/lib/mock-data/types";

export function balanceForPackage(memberPackageId: string): number {
  const mp = MEMBER_PACKAGES.find((p) => p.id === memberPackageId);
  if (!mp) return 0;
  const paid = PAYMENTS.filter((p) => p.member_package_id === memberPackageId).reduce(
    (sum, p) => sum + p.amount,
    0,
  );
  return mp.total_amount - paid;
}

/** The member's current (most recently started) package — renewals create a new row
 * rather than mutating the old one, so this is always the latest by start_date. */
export function activePackageForMember(memberId: string): MemberPackage | undefined {
  return MEMBER_PACKAGES.filter((p) => p.member_id === memberId).sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
  )[0];
}

export interface MemberView extends Member {
  branch: Branch;
  activePackage: MemberPackage | undefined;
  package: Package | undefined;
  balance: number;
  computedStatus: MemberStatus;
}

/** Recomputes status from the live balance/expiry rather than trusting the stored
 * `member.status` snapshot — this is what Dashboard, Members, Dues, and Expiring Soon
 * all call so their numbers never silently disagree. */
export function toMemberView(member: Member): MemberView {
  const branch = BRANCHES.find((b) => b.id === member.branch_id)!;
  const activePackage = activePackageForMember(member.id);
  const pkg = activePackage ? PACKAGES.find((p) => p.id === activePackage.package_id) : undefined;
  const balance = activePackage ? balanceForPackage(activePackage.id) : 0;
  const computedStatus = activePackage
    ? deriveStatus({ expiryDate: activePackage.expiry_date, balance })
    : "active";

  return { ...member, branch, activePackage, package: pkg, balance, computedStatus };
}

export function listMemberViews(): MemberView[] {
  return MEMBERS.map(toMemberView);
}

export interface MemberFilters {
  search?: string;
  status?: MemberStatus | "all";
  branchId?: string | "all";
}

export async function getMembers(filters: MemberFilters = {}): Promise<MemberView[]> {
  await delay();
  const { search = "", status = "all", branchId = "all" } = filters;
  const query = search.trim().toLowerCase();

  return listMemberViews().filter((m) => {
    const matchesSearch =
      query.length === 0 || m.name.toLowerCase().includes(query) || m.mobile.includes(query);
    const matchesStatus = status === "all" || m.computedStatus === status;
    const matchesBranch = branchId === "all" || m.branch_id === branchId;
    return matchesSearch && matchesStatus && matchesBranch;
  });
}

export async function getMemberById(memberId: string): Promise<MemberView | undefined> {
  await delay();
  const member = MEMBERS.find((m) => m.id === memberId);
  return member ? toMemberView(member) : undefined;
}

export interface CreateMemberInput {
  branch_id: string;
  name: string;
  mobile: string;
  gender: string | null;
  join_date: string;
  package_id: string;
  initial_payment?: number;
  payment_mode?: PaymentMode;
}

interface BackendMember {
  id: string;
  tenant_id: string;
  branch_id: string;
  name: string;
  mobile: string;
  gender: string | null;
  join_date: string;
  status: MemberStatus;
  created_at: string;
}

export async function createMember(input: CreateMemberInput): Promise<MemberView> {
  const created = await apiFetch<BackendMember>("/members", {
    method: "POST",
    body: JSON.stringify({
      branch_id: input.branch_id,
      name: input.name,
      mobile: input.mobile,
      gender: input.gender,
      join_date: input.join_date,
    }),
  });

  const memberId = created.id;
  const now = created.created_at;

  const member: Member = {
    id: memberId,
    tenant_id: created.tenant_id,
    branch_id: created.branch_id,
    name: created.name,
    mobile: created.mobile,
    gender: created.gender,
    join_date: created.join_date,
    status: created.status,
    created_at: now,
  };
  MEMBERS.push(member);

  // Packages/payments have no backend endpoint yet, so this part stays mock-only.
  const pkg = PACKAGES.find((p) => p.id === input.package_id);
  if (pkg) {
    const start = new Date(input.join_date);
    const expiry = new Date(start);
    expiry.setDate(expiry.getDate() + pkg.duration_days);

    const memberPackage: MemberPackage = {
      id: crypto.randomUUID(),
      member_id: memberId,
      package_id: pkg.id,
      total_amount: pkg.default_price,
      start_date: input.join_date,
      expiry_date: expiry.toISOString().slice(0, 10),
      created_at: now,
    };
    MEMBER_PACKAGES.push(memberPackage);

    if (input.initial_payment && input.initial_payment > 0) {
      PAYMENTS.push({
        id: crypto.randomUUID(),
        member_package_id: memberPackage.id,
        amount: input.initial_payment,
        mode: input.payment_mode ?? "cash",
        paid_on: input.join_date,
        recorded_by: "user_owner",
        created_at: now,
      });
    }
  }

  return toMemberView(member);
}

export interface UpdateMemberInput {
  name?: string;
  mobile?: string;
  gender?: string | null;
  branch_id?: string;
}

export async function updateMember(memberId: string, patch: UpdateMemberInput): Promise<MemberView> {
  await delay();
  const member = MEMBERS.find((m) => m.id === memberId);
  if (!member) throw new Error("Member not found");
  Object.assign(member, patch);
  return toMemberView(member);
}
