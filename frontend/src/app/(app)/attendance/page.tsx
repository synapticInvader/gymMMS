"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckInSearch } from "@/components/domain/attendance/CheckInSearch";
import { AttendanceLogTable } from "@/components/domain/attendance/AttendanceLogTable";
import { getAttendanceLog } from "@/lib/mock-data/attendance";
import { getBranches } from "@/lib/mock-data/branding";

export default function AttendancePage() {
  const [branchId, setBranchId] = useState<string>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data: branches } = useQuery({ queryKey: ["branches"], queryFn: getBranches });
  const { data: rows, isLoading } = useQuery({
    queryKey: ["attendance-log", branchId, from, to],
    queryFn: () => getAttendanceLog({ branchId, from: from || undefined, to: to || undefined }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Attendance</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Check In</CardTitle>
        </CardHeader>
        <CardContent>
          <CheckInSearch />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={branchId} onValueChange={setBranchId}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All branches</SelectItem>
            {branches?.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DatePicker value={from} onChange={setFrom} placeholder="From" className="w-40" />
        <span className="text-sm text-muted-foreground">to</span>
        <DatePicker value={to} onChange={setTo} placeholder="To" className="w-40" />
      </div>

      <AttendanceLogTable rows={rows} isLoading={isLoading} />
    </div>
  );
}
