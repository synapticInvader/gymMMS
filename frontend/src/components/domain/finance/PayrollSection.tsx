"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Plus, Users } from "lucide-react";
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
import { addPayrollEntry, getPayroll } from "@/lib/mock-data/finance";
import type { Period } from "@/lib/date";

const today = new Date().toISOString().slice(0, 10);
const currentMonth = today.slice(0, 7);

function AddPayrollDialog() {
  const [open, setOpen] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [amount, setAmount] = useState("");
  const [payPeriod, setPayPeriod] = useState(currentMonth);
  const [date, setDate] = useState(today);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => addPayrollEntry({ staffName, amount: Number(amount), payPeriod, date }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      toast.success("Payroll entry added");
      setOpen(false);
      setStaffName("");
      setAmount("");
    },
  });

  const canSubmit = staffName.trim().length > 0 && Number(amount) > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus />
          Add Payroll Entry
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Payroll Entry</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="payroll-name">Staff Name</FieldLabel>
            <Input id="payroll-name" value={staffName} onChange={(e) => setStaffName(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="payroll-amount">Amount</FieldLabel>
            <Input id="payroll-amount" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="payroll-period">Pay Period</FieldLabel>
            <Input id="payroll-period" type="month" value={payPeriod} onChange={(e) => setPayPeriod(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="payroll-date">Date</FieldLabel>
            <DatePicker id="payroll-date" value={date} onChange={setDate} />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button disabled={!canSubmit || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending && <Spinner />}
            Add Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PayrollSection({ period }: { period: Period }) {
  const { data: entries, isLoading } = useQuery({
    queryKey: ["finance", "payroll", period],
    queryFn: () => getPayroll(period),
  });

  function handleExport() {
    if (!entries || entries.length === 0) return;
    exportToCsv(
      "payroll",
      entries.map((p) => ({
        Date: formatDate(p.date),
        Staff: p.staff_name,
        "Pay Period": p.pay_period,
        Amount: p.amount,
      })),
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payroll</CardTitle>
        <CardAction className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={handleExport} disabled={!entries || entries.length === 0}>
            <Download />
            Export CSV
          </Button>
          <AddPayrollDialog />
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : !entries || entries.length === 0 ? (
          <EmptyState icon={Users} title="No payroll entries this period" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Pay Period</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{formatDate(p.date)}</TableCell>
                  <TableCell>{p.staff_name}</TableCell>
                  <TableCell>{p.pay_period}</TableCell>
                  <TableCell className="text-right">₹{p.amount.toLocaleString("en-IN")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
