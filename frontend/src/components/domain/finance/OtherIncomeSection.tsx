"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, PiggyBank, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exportToCsv } from "@/lib/csv";
import { formatDate } from "@/lib/date";
import { addOtherIncome, getOtherIncome } from "@/lib/mock-data/finance";
import type { Period } from "@/lib/date";

const today = new Date().toISOString().slice(0, 10);

function AddOtherIncomeDialog() {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => addOtherIncome({ source, amount: Number(amount), date }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      toast.success("Income recorded");
      setOpen(false);
      setSource("");
      setAmount("");
    },
  });

  const canSubmit = source.trim().length > 0 && Number(amount) > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus />
          Add Other Income
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Other Income</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="income-source">Source</FieldLabel>
            <Input id="income-source" value={source} onChange={(e) => setSource(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="income-amount">Amount</FieldLabel>
            <Input id="income-amount" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="income-date">Date</FieldLabel>
            <DatePicker id="income-date" value={date} onChange={setDate} />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button disabled={!canSubmit || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending && <Spinner />}
            Add Income
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function OtherIncomeSection({ period }: { period: Period }) {
  const { data: entries, isLoading } = useQuery({
    queryKey: ["finance", "other-income", period],
    queryFn: () => getOtherIncome(period),
  });

  function handleExport() {
    if (!entries || entries.length === 0) return;
    exportToCsv(
      "other-income",
      entries.map((o) => ({ Date: formatDate(o.date), Source: o.source, Amount: o.amount })),
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Other Income</CardTitle>
        <CardAction className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={handleExport} disabled={!entries || entries.length === 0}>
            <Download />
            Export CSV
          </Button>
          <AddOtherIncomeDialog />
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : !entries || entries.length === 0 ? (
          <EmptyState icon={PiggyBank} title="No other income this period" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>{formatDate(o.date)}</TableCell>
                  <TableCell>{o.source}</TableCell>
                  <TableCell className="text-right">₹{o.amount.toLocaleString("en-IN")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
