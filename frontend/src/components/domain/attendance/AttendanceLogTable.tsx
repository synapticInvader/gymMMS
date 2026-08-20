import { CalendarCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/date";
import type { AttendanceRow } from "@/lib/mock-data/attendance";

export function AttendanceLogTable({ rows, isLoading }: { rows?: AttendanceRow[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <EmptyState icon={CalendarCheck} title="No check-ins" description="No attendance records match these filters." />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Branch</TableHead>
          <TableHead>Checked In</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.memberName}</TableCell>
            <TableCell>{row.branchName}</TableCell>
            <TableCell>{formatDate(row.checked_in_at, "d MMM yyyy, h:mm a")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
