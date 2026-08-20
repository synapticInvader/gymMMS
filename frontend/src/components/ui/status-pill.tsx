import { cn } from "@/lib/utils";
import { STATUS_LABEL } from "@/lib/status";
import type { MemberStatus } from "@/lib/mock-data/types";

const STATUS_CLASSES: Record<MemberStatus, string> = {
  active: "bg-status-active text-status-active-foreground",
  due: "bg-status-due text-status-due-foreground",
  expiring_soon: "bg-status-expiring text-status-expiring-foreground",
  expired: "bg-status-expired text-status-expired-foreground",
};

export function StatusPill({ status, className }: { status: MemberStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_CLASSES[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
