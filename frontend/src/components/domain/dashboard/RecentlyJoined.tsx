import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/date";
import type { MemberView } from "@/lib/mock-data/members";

export function RecentlyJoined({ members, isLoading }: { members?: MemberView[]; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recently Joined</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </>
        ) : !members || members.length === 0 ? (
          <EmptyState icon={UserPlus} title="No members yet" description="New members will show up here." />
        ) : (
          members.map((m) => (
            <Link
              key={m.id}
              href={`/members/${m.id}`}
              className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              <div>
                <div className="font-medium">{m.name}</div>
                <div className="text-xs text-muted-foreground">
                  {m.branch.name} · Joined {formatDate(m.join_date)}
                </div>
              </div>
              <StatusPill status={m.computedStatus} />
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
