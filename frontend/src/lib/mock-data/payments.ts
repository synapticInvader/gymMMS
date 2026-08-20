import { delay } from "@/lib/mock-data/delay";
import { MEMBER_PACKAGES, PACKAGES, PAYMENTS } from "@/lib/mock-data/seed";
import { activePackageForMember, balanceForPackage } from "@/lib/mock-data/members";
import type { MemberPackage, Package, Payment, PaymentMode } from "@/lib/mock-data/types";

let packageCounter = MEMBER_PACKAGES.length;
let paymentCounter = PAYMENTS.length;

export interface PackageHistoryEntry {
  memberPackage: MemberPackage;
  package: Package | undefined;
  payments: Payment[];
  balance: number;
}

/** Every package the member has ever had, most recent first — renewals never delete
 * or mutate prior rows, so old payment history always stays visible. */
export async function getPackageHistory(memberId: string): Promise<PackageHistoryEntry[]> {
  await delay();
  return MEMBER_PACKAGES.filter((p) => p.member_id === memberId)
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
    .map((memberPackage) => ({
      memberPackage,
      package: PACKAGES.find((p) => p.id === memberPackage.package_id),
      payments: PAYMENTS.filter((p) => p.member_package_id === memberPackage.id).sort(
        (a, b) => new Date(b.paid_on).getTime() - new Date(a.paid_on).getTime(),
      ),
      balance: balanceForPackage(memberPackage.id),
    }));
}

export async function addPayment(
  memberPackageId: string,
  input: { amount: number; mode: PaymentMode; date: string },
): Promise<Payment> {
  await delay();
  paymentCounter += 1;
  const payment: Payment = {
    id: `pay_${String(paymentCounter).padStart(3, "0")}`,
    member_package_id: memberPackageId,
    amount: input.amount,
    mode: input.mode,
    paid_on: input.date,
    recorded_by: "user_owner",
    created_at: new Date().toISOString(),
  };
  PAYMENTS.push(payment);
  return payment;
}

export interface RenewMemberInput {
  packageId: string;
  startDate: string;
  initialPayment?: number;
  paymentMode?: PaymentMode;
}

/** Renew creates a brand-new member_package row rather than mutating the existing
 * one, so the prior package's expiry and payment history stay exactly as they were. */
export async function renewMember(memberId: string, input: RenewMemberInput): Promise<MemberPackage> {
  await delay();
  const pkg = PACKAGES.find((p) => p.id === input.packageId);
  if (!pkg) throw new Error("Package not found");

  const start = new Date(input.startDate);
  const expiry = new Date(start);
  expiry.setDate(expiry.getDate() + pkg.duration_days);

  packageCounter += 1;
  const memberPackage: MemberPackage = {
    id: `mpkg_${String(packageCounter).padStart(3, "0")}`,
    member_id: memberId,
    package_id: pkg.id,
    total_amount: pkg.default_price,
    start_date: input.startDate,
    expiry_date: expiry.toISOString().slice(0, 10),
    created_at: new Date().toISOString(),
  };
  MEMBER_PACKAGES.push(memberPackage);

  if (input.initialPayment && input.initialPayment > 0) {
    await addPayment(memberPackage.id, {
      amount: input.initialPayment,
      mode: input.paymentMode ?? "cash",
      date: input.startDate,
    });
  }

  return memberPackage;
}

export { activePackageForMember, balanceForPackage };
