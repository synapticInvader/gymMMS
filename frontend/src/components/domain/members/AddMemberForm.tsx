"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { computeExpiryDate, formatDate } from "@/lib/date";
import { createMember } from "@/lib/mock-data/members";
import { getPackages } from "@/lib/mock-data/branding";
import { getBranches } from "@/lib/api/branches";

const addMemberSchema = z.object({
  name: z.string().trim().min(1, "Full name is required").max(120),
  mobile: z
    .string()
    .trim()
    .min(10, "Mobile must be 10-15 digits")
    .max(15, "Mobile must be 10-15 digits")
    .regex(/^\d+$/, "Mobile must contain digits only"),
  gender: z.string().optional(),
  branch_id: z.string().min(1, "Branch is required"),
  join_date: z.string().min(1, "Joining date is required"),
  package_id: z.string().min(1, "Package is required"),
  initial_payment: z.string().optional(),
  payment_mode: z.enum(["cash", "upi", "card"]),
});

type AddMemberValues = z.infer<typeof addMemberSchema>;

const today = new Date().toISOString().slice(0, 10);

export function AddMemberForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: branches } = useQuery({ queryKey: ["branches"], queryFn: getBranches });
  const { data: packages } = useQuery({ queryKey: ["packages"], queryFn: getPackages });

  const {
    register,
    handleSubmit,
    watch,
    control,
    setError,
    formState: { errors },
  } = useForm<AddMemberValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { join_date: today, payment_mode: "cash", initial_payment: "" },
  });

  const [joinDate, packageId, initialPayment] = watch(["join_date", "package_id", "initial_payment"]);
  const selectedPackage = packages?.find((p) => p.id === packageId);
  const expiryPreview =
    selectedPackage && joinDate ? formatDate(computeExpiryDate(joinDate, selectedPackage.duration_days)) : null;
  const remainingBalance = selectedPackage
    ? Math.max(selectedPackage.default_price - (Number(initialPayment) || 0), 0)
    : null;

  const mutation = useMutation({
    mutationFn: createMember,
    onSuccess: (member) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success(`${member.name} added`);
      router.push(`/members/${member.id}`);
    },
    onError: (error: Error) => {
      setError("mobile", { message: error.message });
    },
  });

  function onSubmit(values: AddMemberValues) {
    mutation.mutate({
      branch_id: values.branch_id,
      name: values.name,
      mobile: values.mobile,
      gender: values.gender || null,
      join_date: values.join_date,
      package_id: values.package_id,
      initial_payment: values.initial_payment ? Number(values.initial_payment) : undefined,
      payment_mode: values.payment_mode,
    });
  }

  return (
    <Card className="max-w-2xl">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input id="name" {...register("name")} />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.mobile}>
              <FieldLabel htmlFor="mobile">Mobile</FieldLabel>
              <Input id="mobile" inputMode="numeric" {...register("mobile")} />
              {errors.mobile && <FieldError>{errors.mobile.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="gender">Gender</FieldLabel>
              <Input id="gender" placeholder="Optional" {...register("gender")} />
            </Field>

            <Field data-invalid={!!errors.branch_id}>
              <FieldLabel htmlFor="branch_id">Branch</FieldLabel>
              <Controller
                control={control}
                name="branch_id"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="branch_id" className="w-full">
                      <SelectValue placeholder="Select a branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches?.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.branch_id && <FieldError>{errors.branch_id.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.join_date}>
              <FieldLabel htmlFor="join_date">Joining Date</FieldLabel>
              <Controller
                control={control}
                name="join_date"
                render={({ field }) => <DatePicker id="join_date" value={field.value} onChange={field.onChange} />}
              />
              {errors.join_date && <FieldError>{errors.join_date.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.package_id}>
              <FieldLabel htmlFor="package_id">Package</FieldLabel>
              <Controller
                control={control}
                name="package_id"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="package_id" className="w-full">
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
                )}
              />
              {errors.package_id && <FieldError>{errors.package_id.message}</FieldError>}
            </Field>

            {expiryPreview && (
              <p className="text-sm text-muted-foreground">
                Membership will expire on <span className="font-medium text-foreground">{expiryPreview}</span>
              </p>
            )}

            <Field>
              <FieldLabel htmlFor="initial_payment">Initial Payment (optional)</FieldLabel>
              <Input id="initial_payment" type="number" min={0} step="1" {...register("initial_payment")} />
            </Field>

            <Field>
              <FieldLabel htmlFor="payment_mode">Payment Mode</FieldLabel>
              <Controller
                control={control}
                name="payment_mode"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="payment_mode" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="remaining_balance">Remaining Balance</FieldLabel>
              <Input
                id="remaining_balance"
                readOnly
                disabled
                value={remainingBalance !== null ? `₹${remainingBalance.toLocaleString("en-IN")}` : "—"}
              />
            </Field>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Spinner />}
              Add Member
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
