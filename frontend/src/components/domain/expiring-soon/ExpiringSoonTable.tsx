import Link from "next/link";
import { Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/date";
import type { MemberView } from "@/lib/mock-data/members";

export function ExpiringSoonTable({
  members,
  isLoading,
}: {
  members?: (MemberView & { daysLeft: number })[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <EmptyState icon={Clock} title="Nothing expiring soon" description="No memberships fall within this window." />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Branch</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead className="text-right">Days Left</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((m) => (
          <TableRow key={m.id}>
            <TableCell className="p-0">
              <Link href={`/members/${m.id}`} className="block px-4 py-2 font-medium">
                {m.name}
              </Link>
            </TableCell>
            <TableCell>{m.branch.name}</TableCell>
            <TableCell>{m.activePackage ? formatDate(m.activePackage.expiry_date) : "—"}</TableCell>
            <TableCell className="text-right">{m.daysLeft === 0 ? "Today" : `${m.daysLeft}d`}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
