"use client";

import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DuesTable } from "@/components/domain/dues/DuesTable";
import { getDues, getDuesSummary } from "@/lib/mock-data/dues";
import { STATUS_LABEL } from "@/lib/status";
import { exportToCsv } from "@/lib/csv";

export default function DuesPage() {
  const { data: dues, isLoading } = useQuery({ queryKey: ["dues", "list"], queryFn: getDues });
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["dues", "summary"],
    queryFn: getDuesSummary,
  });

  function handleExport() {
    if (!dues || dues.length === 0) return;
    exportToCsv(
      "dues",
      dues.map((m) => ({
        Name: m.name,
        Mobile: m.mobile,
        Branch: m.branch.name,
        Status: STATUS_LABEL[m.computedStatus],
        Balance: m.balance,
      })),
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dues</h1>
        <Button variant="outline" onClick={handleExport} disabled={!dues || dues.length === 0}>
          <Download />
          Export CSV
        </Button>
      </div>

      <Card className="max-w-xs">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Outstanding</CardTitle>
        </CardHeader>
        <CardContent>
          {summaryLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="text-2xl font-bold">₹{(summary?.totalDue ?? 0).toLocaleString("en-IN")}</div>
          )}
          {!summaryLoading && (
            <p className="text-xs text-muted-foreground">{summary?.memberCount ?? 0} member(s)</p>
          )}
        </CardContent>
      </Card>

      <DuesTable dues={dues} isLoading={isLoading} />
    </div>
  );
}
