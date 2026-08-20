import { UserPlus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function AddMemberPage() {
  return (
    <EmptyState
      icon={UserPlus}
      title="Add Member"
      description="The member form with a live expiry preview ships in the next PR."
    />
  );
}
