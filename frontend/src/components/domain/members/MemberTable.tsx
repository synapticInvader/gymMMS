import Link from "next/link";
import { Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusPill } from "@/components/ui/status-pill";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/date";
import type { MemberView } from "@/lib/mock-data/members";

export function MemberTable({ members, isLoading }: { members?: MemberView[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No members found"
        description="Try a different search or status filter, or add a new member."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Mobile</TableHead>
          <TableHead>Branch</TableHead>
          <TableHead>Join Date</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((m) => (
          <TableRow key={m.id} className="cursor-pointer">
            <TableCell className="p-0">
              <Link href={`/members/${m.id}`} className="block px-4 py-2 font-medium">
                {m.name}
              </Link>
            </TableCell>
            <TableCell className="p-0">
              <Link href={`/members/${m.id}`} className="block px-4 py-2">
                {m.mobile}
              </Link>
            </TableCell>
            <TableCell className="p-0">
              <Link href={`/members/${m.id}`} className="block px-4 py-2">
                {m.branch.name}
              </Link>
            </TableCell>
            <TableCell className="p-0">
              <Link href={`/members/${m.id}`} className="block px-4 py-2">
                {formatDate(m.join_date)}
              </Link>
            </TableCell>
            <TableCell className="p-0">
              <Link href={`/members/${m.id}`} className="block px-4 py-2">
                <StatusPill status={m.computedStatus} />
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
