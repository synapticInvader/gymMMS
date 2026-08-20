import { Clock } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function ExpiringSoonPage() {
  return (
    <EmptyState
      icon={Clock}
      title="Expiring Soon"
      description="Members expiring within the selected window ship in an upcoming PR."
    />
  );
}
