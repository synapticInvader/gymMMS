export type MemberStatus = "active" | "due" | "expiring_soon" | "expired";

export type PaymentMode = "cash" | "upi" | "card";

export interface Tenant {
  id: string;
  name: string;
  plan: string;
  created_at: string;
}

export interface Branch {
  id: string;
  tenant_id: string;
  name: string;
  created_at: string;
}

export interface Package {
  id: string;
  tenant_id: string;
  name: string;
  duration_days: number;
  default_price: number;
}

export interface Member {
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

export interface MemberPackage {
  id: string;
  member_id: string;
  package_id: string;
  total_amount: number;
  start_date: string;
  expiry_date: string;
  created_at: string;
}

export interface Payment {
  id: string;
  member_package_id: string;
  amount: number;
  mode: PaymentMode;
  paid_on: string;
  recorded_by: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  member_id: string;
  branch_id: string;
  checked_in_at: string;
}

export type ExpenseCategory =
  | "rent"
  | "utilities"
  | "maintenance"
  | "supplies"
  | "marketing"
  | "other";

export interface Expense {
  id: string;
  tenant_id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  note: string | null;
}

export interface PayrollEntry {
  id: string;
  tenant_id: string;
  staff_name: string;
  amount: number;
  pay_period: string;
  date: string;
}

export interface OtherIncome {
  id: string;
  tenant_id: string;
  source: string;
  amount: number;
  date: string;
}

export interface Branding {
  tenant_id: string;
  gym_name: string;
  tagline: string;
  primary_color: string;
  logo_url: string | null;
  custom_domain: string | null;
}

export type UserRole = "owner" | "manager" | "front_desk";

export interface Session {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
}
