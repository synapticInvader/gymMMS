"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { addBranch, getBranches } from "@/lib/mock-data/branding";

export function BranchesSection() {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();
  const { data: branches, isLoading } = useQuery({ queryKey: ["branches"], queryFn: getBranches });

  const mutation = useMutation({
    mutationFn: () => addBranch(name.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Branch added");
      setName("");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branches</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : !branches || branches.length === 0 ? (
          <EmptyState icon={Building2} title="No branches yet" />
        ) : (
          <ul className="divide-y rounded-md border">
            {branches.map((b) => (
              <li key={b.id} className="px-3 py-2 text-sm">
                {b.name}
              </li>
            ))}
          </ul>
        )}

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) mutation.mutate();
          }}
        >
          <Input placeholder="New branch name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="submit" disabled={!name.trim() || mutation.isPending}>
            {mutation.isPending ? <Spinner /> : <Plus />}
            Add
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
