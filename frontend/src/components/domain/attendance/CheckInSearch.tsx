"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Search, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { checkIn, searchMembersForCheckIn } from "@/lib/mock-data/attendance";
import { formatDate } from "@/lib/date";

export function CheckInSearch() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);
  const queryClient = useQueryClient();

  const { data: results, isLoading } = useQuery({
    queryKey: ["checkin-search", debouncedQuery],
    queryFn: () => searchMembersForCheckIn(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
  });

  const mutation = useMutation({
    mutationFn: checkIn,
    onSuccess: (_, memberId) => {
      const member = results?.find((r) => r.member.id === memberId)?.member;
      toast.success(`${member?.name ?? "Member"} checked in`);
      queryClient.invalidateQueries({ queryKey: ["checkin-search"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-log"] });
    },
  });

  return (
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or mobile to check in"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {debouncedQuery.trim().length > 0 && (
        <div className="max-w-sm divide-y rounded-md border">
          {isLoading ? (
            <div className="p-3 text-sm text-muted-foreground">Searching…</div>
          ) : !results || results.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground">No members match &quot;{query}&quot;</div>
          ) : (
            results.map(({ member, checkedInToday }) => (
              <div key={member.id} className="flex items-center justify-between p-3">
                <div>
                  <div className="text-sm font-medium">{member.name}</div>
                  <div className="text-xs text-muted-foreground">{member.mobile}</div>
                </div>
                {checkedInToday ? (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-3.5 text-status-active-foreground" />
                    Checked in {formatDate(checkedInToday.checked_in_at, "h:mm a")}
                  </span>
                ) : (
                  <Button
                    size="sm"
                    disabled={mutation.isPending && mutation.variables === member.id}
                    onClick={() => mutation.mutate(member.id)}
                  >
                    {mutation.isPending && mutation.variables === member.id ? <Spinner /> : <UserCheck />}
                    Check In
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
