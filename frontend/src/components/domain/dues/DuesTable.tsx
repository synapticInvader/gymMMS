import { CircleCheck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusPill } from "@/components/ui/status-pill";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AddPaymentDialog } from "@/components/domain/members/AddPaymentDialog";
import type { MemberView } from "@/lib/mock-data/members";

export function DuesTable({ dues, isLoading }: { dues?: MemberView[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!dues || dues.length === 0) {
    return <EmptyState icon={CircleCheck} title="No outstanding dues" description="Every member is paid up." />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Mobile</TableHead>
          <TableHead>Branch</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Balance</TableHead>
          <TableHead className="w-1" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {dues.map((m) => (
          <TableRow key={m.id}>
            <TableCell className="font-medium">{m.name}</TableCell>
            <TableCell>{m.mobile}</TableCell>
            <TableCell>{m.branch.name}</TableCell>
            <TableCell>
              <StatusPill status={m.computedStatus} />
            </TableCell>
            <TableCell className="text-right">₹{m.balance.toLocaleString("en-IN")}</TableCell>
            <TableCell>
              {m.activePackage && (
                <AddPaymentDialog
                  memberId={m.id}
                  memberPackageId={m.activePackage.id}
                  trigger={
                    <Button size="sm" variant="outline">
                      <CreditCard />
                      Collect Payment
                    </Button>
                  }
                />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
