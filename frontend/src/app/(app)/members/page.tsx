import { Users } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function MembersPage() {
  return (
    <EmptyState
      icon={Users}
      title="Members"
      description="Search, status filter, and the members table ship in the next PR."
    />
  );
}
