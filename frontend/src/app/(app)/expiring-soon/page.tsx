"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExpiringSoonTable } from "@/components/domain/expiring-soon/ExpiringSoonTable";
import { getExpiringSoon } from "@/lib/mock-data/dues";
import { DEFAULT_EXPIRING_WINDOW_DAYS } from "@/lib/status";
import { exportToCsv } from "@/lib/csv";
import { formatDate } from "@/lib/date";

const WINDOW_OPTIONS = [3, 7, 14, 30];

export default function ExpiringSoonPage() {
  const [windowDays, setWindowDays] = useState(DEFAULT_EXPIRING_WINDOW_DAYS);

  const { data: members, isLoading } = useQuery({
    queryKey: ["expiring-soon", windowDays],
    queryFn: () => getExpiringSoon(windowDays),
  });

  function handleExport() {
    if (!members || members.length === 0) return;
    exportToCsv(
      "expiring-soon",
      members.map((m) => ({
        Name: m.name,
        Branch: m.branch.name,
        Expires: m.activePackage ? formatDate(m.activePackage.expiry_date) : "",
        "Days Left": m.daysLeft,
      })),
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Expiring Soon</h1>
        <Button variant="outline" onClick={handleExport} disabled={!members || members.length === 0}>
          <Download />
          Export CSV
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Within</span>
        <Select value={String(windowDays)} onValueChange={(v) => setWindowDays(Number(v))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WINDOW_OPTIONS.map((d) => (
              <SelectItem key={d} value={String(d)}>
                {d} days
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ExpiringSoonTable members={members} isLoading={isLoading} />
    </div>
  );
}
