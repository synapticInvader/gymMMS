import { LayoutDashboard } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function DashboardPage() {
  return (
    <EmptyState
      icon={LayoutDashboard}
      title="Dashboard"
      description="Summary cards, members-by-branch, and recently joined ship in the next PR."
    />
  );
}
