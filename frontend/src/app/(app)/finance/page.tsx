import { WalletCards } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function FinancePage() {
  return (
    <EmptyState
      icon={WalletCards}
      title="Finance"
      description="Income, expenses, payroll, and other income ship in an upcoming PR."
    />
  );
}
