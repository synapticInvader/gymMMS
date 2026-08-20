import { Receipt } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/date";
import type { PackageHistoryEntry } from "@/lib/mock-data/payments";

const MODE_LABEL: Record<string, string> = { cash: "Cash", upi: "UPI", card: "Card" };

export function PaymentHistoryTable({
  history,
  isLoading,
}: {
  history?: PackageHistoryEntry[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const payments = (history ?? []).flatMap((entry) =>
    entry.payments.map((payment) => ({ payment, packageName: entry.package?.name ?? "Package" })),
  );

  if (payments.length === 0) {
    return <EmptyState icon={Receipt} title="No payments yet" description="Payments will appear here once recorded." />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Package</TableHead>
          <TableHead>Mode</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map(({ payment, packageName }) => (
          <TableRow key={payment.id}>
            <TableCell>{formatDate(payment.paid_on)}</TableCell>
            <TableCell>{packageName}</TableCell>
            <TableCell>{MODE_LABEL[payment.mode]}</TableCell>
            <TableCell className="text-right">₹{payment.amount.toLocaleString("en-IN")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
