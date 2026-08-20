import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Building2 } from "lucide-react";
import type { DashboardSummary } from "@/lib/mock-data/dashboard";

export function MembersByBranch({
  byBranch,
  isLoading,
}: {
  byBranch?: DashboardSummary["byBranch"];
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Members by Branch</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </>
        ) : !byBranch || byBranch.length === 0 ? (
          <EmptyState icon={Building2} title="No branches yet" />
        ) : (
          byBranch.map((b) => (
            <div key={b.branchId} className="flex items-center justify-between text-sm">
              <span>{b.branchName}</span>
              <span className="font-medium">{b.count}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
