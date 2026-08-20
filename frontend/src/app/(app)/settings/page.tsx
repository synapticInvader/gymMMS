import { Settings } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function SettingsPage() {
  return (
    <EmptyState
      icon={Settings}
      title="Branding & Settings"
      description="Branding, branches, and packages management ship in an upcoming PR."
    />
  );
}
