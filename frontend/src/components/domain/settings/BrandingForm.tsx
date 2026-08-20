"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { getBranding, saveBranding } from "@/lib/mock-data/branding";
import type { Branding } from "@/lib/mock-data/types";

function applyPreview(color: string) {
  document.documentElement.style.setProperty("--brand-primary", color);
}

// Mounted only once `branding` has loaded, so its initial state comes straight
// from the loaded value on first render — no effect needed to sync it in afterward.
function BrandingFields({ branding }: { branding: Branding }) {
  const queryClient = useQueryClient();
  const [gymName, setGymName] = useState(branding.gym_name);
  const [tagline, setTagline] = useState(branding.tagline);
  const [primaryColor, setPrimaryColor] = useState(branding.primary_color);

  const mutation = useMutation({
    mutationFn: () => saveBranding({ gym_name: gymName, tagline, primary_color: primaryColor }),
    onSuccess: (saved) => {
      queryClient.setQueryData(["branding"], saved);
      toast.success("Branding saved");
    },
  });

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="gym-name">Gym / Tenant Name</FieldLabel>
        <Input id="gym-name" value={gymName} onChange={(e) => setGymName(e.target.value)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="tagline">Tagline</FieldLabel>
        <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="primary-color">Primary Color</FieldLabel>
        <div className="flex items-center gap-3">
          <input
            id="primary-color"
            type="color"
            value={primaryColor}
            onChange={(e) => {
              setPrimaryColor(e.target.value);
              applyPreview(e.target.value);
            }}
            className="h-9 w-14 cursor-pointer rounded border"
          />
          <span className="text-sm text-muted-foreground">{primaryColor}</span>
        </div>
      </Field>
      <Button disabled={mutation.isPending} onClick={() => mutation.mutate()} className="w-fit">
        {mutation.isPending && <Spinner />}
        Save Branding
      </Button>
    </FieldGroup>
  );
}

export function BrandingForm() {
  const { data: branding, isLoading } = useQuery({ queryKey: ["branding"], queryFn: getBranding });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding</CardTitle>
        <CardDescription>
          Primary Color updates accents and buttons app-wide as a live preview — it never affects the sidebar or
          status pill colors, which stay fixed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || !branding ? (
          <div className="space-y-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-24" />
          </div>
        ) : (
          <BrandingFields branding={branding} />
        )}
      </CardContent>
    </Card>
  );
}
