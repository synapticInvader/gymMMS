import { isWithinPeriod, type Period } from "@/lib/date";
import { delay } from "@/lib/mock-data/delay";
import { EXPENSES, OTHER_INCOME, PAYROLL, PAYMENTS, TENANT } from "@/lib/mock-data/seed";
import type { Expense, ExpenseCategory, OtherIncome, PayrollEntry } from "@/lib/mock-data/types";

let expenseCounter = EXPENSES.length;
let payrollCounter = PAYROLL.length;
let otherIncomeCounter = OTHER_INCOME.length;

export async function getExpenses(period: Period): Promise<Expense[]> {
  await delay();
  return EXPENSES.filter((e) => isWithinPeriod(e.date, period)).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function addExpense(input: {
  category: ExpenseCategory;
  amount: number;
  date: string;
  note?: string;
}): Promise<Expense> {
  await delay();
  expenseCounter += 1;
  const expense: Expense = {
    id: `exp_${String(expenseCounter).padStart(3, "0")}`,
    tenant_id: TENANT.id,
    category: input.category,
    amount: input.amount,
    date: input.date,
    note: input.note ?? null,
  };
  EXPENSES.push(expense);
  return expense;
}

export async function getPayroll(period: Period): Promise<PayrollEntry[]> {
  await delay();
  return PAYROLL.filter((p) => isWithinPeriod(p.date, period)).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function addPayrollEntry(input: {
  staffName: string;
  amount: number;
  payPeriod: string;
  date: string;
}): Promise<PayrollEntry> {
  await delay();
  payrollCounter += 1;
  const entry: PayrollEntry = {
    id: `pay_e_${String(payrollCounter).padStart(3, "0")}`,
    tenant_id: TENANT.id,
    staff_name: input.staffName,
    amount: input.amount,
    pay_period: input.payPeriod,
    date: input.date,
  };
  PAYROLL.push(entry);
  return entry;
}

export async function getOtherIncome(period: Period): Promise<OtherIncome[]> {
  await delay();
  return OTHER_INCOME.filter((o) => isWithinPeriod(o.date, period)).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function addOtherIncome(input: {
  source: string;
  amount: number;
  date: string;
}): Promise<OtherIncome> {
  await delay();
  otherIncomeCounter += 1;
  const entry: OtherIncome = {
    id: `oi_${String(otherIncomeCounter).padStart(3, "0")}`,
    tenant_id: TENANT.id,
    source: input.source,
    amount: input.amount,
    date: input.date,
  };
  OTHER_INCOME.push(entry);
  return entry;
}

export interface FinanceSummary {
  income: number;
  expenses: number;
  payroll: number;
  otherIncome: number;
  netProfit: number;
}

/** Income is derived from the same payments ledger Members/Dues use — not a
 * separate mock array — so Finance's numbers stay consistent with the rest of the app. */
export async function getFinanceSummary(period: Period): Promise<FinanceSummary> {
  await delay();
  const income = PAYMENTS.filter((p) => isWithinPeriod(p.paid_on, period)).reduce(
    (sum, p) => sum + p.amount,
    0,
  );
  const expenses = EXPENSES.filter((e) => isWithinPeriod(e.date, period)).reduce((sum, e) => sum + e.amount, 0);
  const payroll = PAYROLL.filter((p) => isWithinPeriod(p.date, period)).reduce((sum, p) => sum + p.amount, 0);
  const otherIncome = OTHER_INCOME.filter((o) => isWithinPeriod(o.date, period)).reduce(
    (sum, o) => sum + o.amount,
    0,
  );

  return { income, expenses, payroll, otherIncome, netProfit: income + otherIncome - expenses - payroll };
}
