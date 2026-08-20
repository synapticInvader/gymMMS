"use client";

import { formatDate, today } from "@/lib/date";
import { useSession } from "@/hooks/use-session";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  manager: "Manager",
  front_desk: "Front Desk",
};

export function Topbar() {
  const { data: session, isLoading } = useSession();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <span className="text-sm text-muted-foreground">{formatDate(today(), "EEEE, dd/MM/yy")}</span>
      </div>
      {isLoading ? (
        <Skeleton className="h-5 w-24" />
      ) : (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{session?.name}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{session ? ROLE_LABEL[session.role] : ""}</span>
        </div>
      )}
    </header>
  );
}
