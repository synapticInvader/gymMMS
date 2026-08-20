"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Package as PackageIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { addPackage, getPackages } from "@/lib/mock-data/branding";

export function PackagesSection() {
  const [name, setName] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [defaultPrice, setDefaultPrice] = useState("");
  const queryClient = useQueryClient();
  const { data: packages, isLoading } = useQuery({ queryKey: ["packages"], queryFn: getPackages });

  const mutation = useMutation({
    mutationFn: () =>
      addPackage({ name: name.trim(), durationDays: Number(durationDays), defaultPrice: Number(defaultPrice) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      toast.success("Package added");
      setName("");
      setDurationDays("");
      setDefaultPrice("");
    },
  });

  const canSubmit = name.trim().length > 0 && Number(durationDays) > 0 && Number(defaultPrice) >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Packages</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : !packages || packages.length === 0 ? (
          <EmptyState icon={PackageIcon} title="No packages yet" />
        ) : (
          <ul className="divide-y rounded-md border">
            {packages.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <span>{p.name}</span>
                <span className="text-muted-foreground">
                  {p.duration_days} days · ₹{p.default_price.toLocaleString("en-IN")}
                </span>
              </li>
            ))}
          </ul>
        )}

        <form
          className="flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) mutation.mutate();
          }}
        >
          <Input placeholder="Package name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 min-w-32" />
          <Input
            type="number"
            placeholder="Duration (days)"
            min={1}
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            className="w-36"
          />
          <Input
            type="number"
            placeholder="Price (₹)"
            min={0}
            value={defaultPrice}
            onChange={(e) => setDefaultPrice(e.target.value)}
            className="w-32"
          />
          <Button type="submit" disabled={!canSubmit || mutation.isPending}>
            {mutation.isPending ? <Spinner /> : <Plus />}
            Add
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
