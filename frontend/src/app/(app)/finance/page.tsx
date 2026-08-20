"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinanceSummaryCards } from "@/components/domain/finance/FinanceSummaryCards";
import { ExpensesSection } from "@/components/domain/finance/ExpensesSection";
import { PayrollSection } from "@/components/domain/finance/PayrollSection";
import { OtherIncomeSection } from "@/components/domain/finance/OtherIncomeSection";
import { getFinanceSummary } from "@/lib/mock-data/finance";
import type { Period } from "@/lib/date";

export default function FinancePage() {
  const [period, setPeriod] = useState<Period>("month");

  const { data: summary, isLoading } = useQuery({
    queryKey: ["finance", "summary", period],
    queryFn: () => getFinanceSummary(period),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Finance</h1>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="quarter">This Quarter</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <FinanceSummaryCards summary={summary} isLoading={isLoading} />

      <ExpensesSection period={period} />
      <PayrollSection period={period} />
      <OtherIncomeSection period={period} />
    </div>
  );
}
