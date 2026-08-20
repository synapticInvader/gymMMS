import { UserRound } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default async function MemberDetailPage({ params }: PageProps<"/members/[id]">) {
  const { id } = await params;

  return (
    <EmptyState
      icon={UserRound}
      title={`Member ${id}`}
      description="Editable info, payment ledger, and Renew ship in the next PR."
    />
  );
}
