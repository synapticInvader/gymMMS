"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Plus, Receipt } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { exportToCsv } from "@/lib/csv";
import { formatDate } from "@/lib/date";
import { addExpense, getExpenses } from "@/lib/mock-data/finance";
import type { ExpenseCategory } from "@/lib/mock-data/types";
import type { Period } from "@/lib/date";

const CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  rent: "Rent",
  utilities: "Utilities",
  maintenance: "Maintenance",
  supplies: "Supplies",
  marketing: "Marketing",
  other: "Other",
};

const today = new Date().toISOString().slice(0, 10);

function AddExpenseDialog() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>("rent");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => addExpense({ category, amount: Number(amount), date, note: note || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      toast.success("Expense added");
      setOpen(false);
      setAmount("");
      setNote("");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="expense-category">Category</FieldLabel>
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger id="expense-category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="expense-amount">Amount</FieldLabel>
            <Input id="expense-amount" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="expense-date">Date</FieldLabel>
            <DatePicker id="expense-date" value={date} onChange={setDate} />
          </Field>
          <Field>
            <FieldLabel htmlFor="expense-note">Note (optional)</FieldLabel>
            <Textarea id="expense-note" value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button
            disabled={!amount || Number(amount) <= 0 || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && <Spinner />}
            Add Expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ExpensesSection({ period }: { period: Period }) {
  const { data: expenses, isLoading } = useQuery({
    queryKey: ["finance", "expenses", period],
    queryFn: () => getExpenses(period),
  });

  function handleExport() {
    if (!expenses || expenses.length === 0) return;
    exportToCsv(
      "expenses",
      expenses.map((e) => ({
        Date: formatDate(e.date),
        Category: CATEGORY_LABEL[e.category],
        Amount: e.amount,
        Note: e.note ?? "",
      })),
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses</CardTitle>
        <CardAction className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={handleExport} disabled={!expenses || expenses.length === 0}>
            <Download />
            Export CSV
          </Button>
          <AddExpenseDialog />
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : !expenses || expenses.length === 0 ? (
          <EmptyState icon={Receipt} title="No expenses this period" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{formatDate(e.date)}</TableCell>
                  <TableCell>{CATEGORY_LABEL[e.category]}</TableCell>
                  <TableCell className="text-muted-foreground">{e.note ?? "—"}</TableCell>
                  <TableCell className="text-right">₹{e.amount.toLocaleString("en-IN")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
