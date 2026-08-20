"use client";

import { useQuery } from "@tanstack/react-query";
import { CreditCard, RefreshCw, UserRoundX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/date";
import { getMemberById } from "@/lib/mock-data/members";
import { getPackageHistory } from "@/lib/mock-data/payments";
import { MemberInfoEditable } from "@/components/domain/members/MemberInfoEditable";
import { PaymentHistoryTable } from "@/components/domain/members/PaymentHistoryTable";
import { AddPaymentDialog } from "@/components/domain/members/AddPaymentDialog";
import { RenewDialog } from "@/components/domain/members/RenewDialog";

export function MemberDetailView({ memberId }: { memberId: string }) {
  const { data: member, isLoading: memberLoading } = useQuery({
    queryKey: ["member", memberId],
    queryFn: () => getMemberById(memberId),
  });
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["payment-history", memberId],
    queryFn: () => getPackageHistory(memberId),
  });

  if (memberLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!member) {
    return <EmptyState icon={UserRoundX} title="Member not found" description="This member may have been removed." />;
  }

  return (
    <div className="space-y-6">
      <MemberInfoEditable member={member} />

      <Card>
        <CardHeader>
          <CardTitle>Current Membership</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-8 text-sm">
            <div>
              <div className="text-muted-foreground">Package</div>
              <div className="font-medium">{member.package?.name ?? "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Expires</div>
              <div className="font-medium">
                {member.activePackage ? formatDate(member.activePackage.expiry_date) : "—"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Balance</div>
              <div className="font-medium">₹{member.balance.toLocaleString("en-IN")}</div>
            </div>
          </div>
          <div className="flex gap-2">
            {member.activePackage && (
              <AddPaymentDialog
                memberId={member.id}
                memberPackageId={member.activePackage.id}
                trigger={
                  <Button variant="outline" size="sm">
                    <CreditCard />
                    Add Payment
                  </Button>
                }
              />
            )}
            <RenewDialog
              memberId={member.id}
              trigger={
                <Button size="sm">
                  <RefreshCw />
                  Renew
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentHistoryTable history={history} isLoading={historyLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
