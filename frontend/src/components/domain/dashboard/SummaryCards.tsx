import { AlertTriangle, CalendarPlus, UserRoundX, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CARDS = [
  { key: "totalMembers", label: "Total Members", icon: Users },
  { key: "newThisMonth", label: "New This Month", icon: CalendarPlus },
  { key: "due", label: "Due", icon: AlertTriangle },
  { key: "expired", label: "Expired", icon: UserRoundX },
] as const;

export function SummaryCards({
  summary,
  isLoading,
}: {
  summary?: Record<(typeof CARDS)[number]["key"], number>;
  isLoading: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map(({ key, label, icon: Icon }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            <Icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{summary?.[key] ?? 0}</div>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
