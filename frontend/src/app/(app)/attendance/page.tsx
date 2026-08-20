import { CalendarCheck } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function AttendancePage() {
  return (
    <EmptyState
      icon={CalendarCheck}
      title="Attendance"
      description="Check-in search and the attendance log ship in an upcoming PR."
    />
  );
}
