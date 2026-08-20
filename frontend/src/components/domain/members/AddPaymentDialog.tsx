"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { addPayment } from "@/lib/mock-data/payments";
import type { PaymentMode } from "@/lib/mock-data/types";

const today = new Date().toISOString().slice(0, 10);

export function AddPaymentDialog({
  memberId,
  memberPackageId,
  trigger,
}: {
  memberId: string;
  memberPackageId: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<PaymentMode>("cash");
  const [date, setDate] = useState(today);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => addPayment(memberPackageId, { amount: Number(amount), mode, date }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member", memberId] });
      queryClient.invalidateQueries({ queryKey: ["payment-history", memberId] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["dues"] });
      toast.success("Payment recorded");
      setOpen(false);
      setAmount("");
    },
  });

  const amountValue = Number(amount);
  const canSubmit = amount.trim().length > 0 && amountValue > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
          <DialogDescription>Record a payment against this member&apos;s current package.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="payment-amount">Amount</FieldLabel>
            <Input
              id="payment-amount"
              type="number"
              min={1}
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="payment-mode">Mode</FieldLabel>
            <Select value={mode} onValueChange={(v) => setMode(v as PaymentMode)}>
              <SelectTrigger id="payment-mode" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="payment-date">Date</FieldLabel>
            <Input id="payment-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button disabled={!canSubmit || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending && <Spinner />}
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
