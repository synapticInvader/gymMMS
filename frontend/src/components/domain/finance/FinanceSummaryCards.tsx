import { ArrowDownCircle, ArrowUpCircle, PiggyBank, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FinanceSummary } from "@/lib/mock-data/finance";

const CARDS = [
  { key: "income", label: "Income", icon: ArrowUpCircle },
  { key: "expenses", label: "Expenses", icon: ArrowDownCircle },
  { key: "payroll", label: "Payroll", icon: Users },
  { key: "otherIncome", label: "Other Income", icon: PiggyBank },
  { key: "netProfit", label: "Net Profit", icon: TrendingUp },
] as const;

export function FinanceSummaryCards({ summary, isLoading }: { summary?: FinanceSummary; isLoading: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {CARDS.map(({ key, label, icon: Icon }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            <Icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-xl font-bold">₹{(summary?.[key] ?? 0).toLocaleString("en-IN")}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
