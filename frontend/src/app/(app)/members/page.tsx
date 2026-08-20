"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Download, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MemberTable } from "@/components/domain/members/MemberTable";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getMembers } from "@/lib/mock-data/members";
import { STATUS_LABEL } from "@/lib/status";
import { exportToCsv } from "@/lib/csv";
import { formatDate } from "@/lib/date";
import type { MemberStatus } from "@/lib/mock-data/types";

const STATUS_OPTIONS: (MemberStatus | "all")[] = ["all", "active", "due", "expiring_soon", "expired"];

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<MemberStatus | "all">("all");
  const debouncedSearch = useDebouncedValue(search);

  const { data: members, isLoading } = useQuery({
    queryKey: ["members", debouncedSearch, status],
    queryFn: () => getMembers({ search: debouncedSearch, status }),
  });

  function handleExport() {
    if (!members || members.length === 0) return;
    exportToCsv("members", members.map((m) => ({
      Name: m.name,
      Mobile: m.mobile,
      Branch: m.branch.name,
      "Join Date": formatDate(m.join_date),
      Status: STATUS_LABEL[m.computedStatus],
    })));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Members</h1>
        <Button asChild>
          <Link href="/members/new">
            <Plus />
            Add Member
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or mobile"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as MemberStatus | "all")}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "all" ? "All statuses" : STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={!members || members.length === 0}>
          <Download />
          Export CSV
        </Button>
      </div>

      <MemberTable members={members} isLoading={isLoading} />
    </div>
  );
}
