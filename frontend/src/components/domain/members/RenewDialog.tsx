"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { computeExpiryDate, formatDate } from "@/lib/date";
import { getPackages } from "@/lib/mock-data/branding";
import { renewMember } from "@/lib/mock-data/payments";
import type { PaymentMode } from "@/lib/mock-data/types";

const today = new Date().toISOString().slice(0, 10);

export function RenewDialog({ memberId, trigger }: { memberId: string; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [packageId, setPackageId] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [initialPayment, setInitialPayment] = useState("");
  const [mode, setMode] = useState<PaymentMode>("cash");
  const queryClient = useQueryClient();

  const { data: packages } = useQuery({ queryKey: ["packages"], queryFn: getPackages });
  const selectedPackage = packages?.find((p) => p.id === packageId);
  const expiryPreview = selectedPackage ? formatDate(computeExpiryDate(startDate, selectedPackage.duration_days)) : null;

  const mutation = useMutation({
    mutationFn: () =>
      renewMember(memberId, {
        packageId,
        startDate,
        initialPayment: initialPayment ? Number(initialPayment) : undefined,
        paymentMode: mode,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member", memberId] });
      queryClient.invalidateQueries({ queryKey: ["payment-history", memberId] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["expiring-soon"] });
      queryClient.invalidateQueries({ queryKey: ["dues"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Membership renewed");
      setOpen(false);
      setPackageId("");
      setInitialPayment("");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renew Membership</DialogTitle>
          <DialogDescription>
            Starts a new membership term. The current term&apos;s history is preserved.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="renew-package">Package</FieldLabel>
            <Select value={packageId} onValueChange={setPackageId}>
              <SelectTrigger id="renew-package" className="w-full">
                <SelectValue placeholder="Select a package" />
              </SelectTrigger>
              <SelectContent>
                {packages?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} · {p.duration_days} days · ₹{p.default_price.toLocaleString("en-IN")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="renew-start">Start Date</FieldLabel>
            <DatePicker id="renew-start" value={startDate} onChange={setStartDate} />
          </Field>
          {expiryPreview && (
            <p className="text-sm text-muted-foreground">
              New expiry: <span className="font-medium text-foreground">{expiryPreview}</span>
            </p>
          )}
          <Field>
            <FieldLabel htmlFor="renew-payment">Initial Payment (optional)</FieldLabel>
            <Input
              id="renew-payment"
              type="number"
              min={0}
              step="1"
              value={initialPayment}
              onChange={(e) => setInitialPayment(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="renew-mode">Payment Mode</FieldLabel>
            <Select value={mode} onValueChange={(v) => setMode(v as PaymentMode)}>
              <SelectTrigger id="renew-mode" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button disabled={!packageId || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending && <Spinner />}
            Renew
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
