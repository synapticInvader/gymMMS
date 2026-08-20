import { Wallet } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function DuesPage() {
  return (
    <EmptyState
      icon={Wallet}
      title="Dues"
      description="Members with an outstanding balance ship in an upcoming PR."
    />
  );
}
