"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBranding } from "@/lib/mock-data/branding";

/** Applies the saved primary color as the live --brand-primary CSS var on load,
 * so a color saved in Settings shows up app-wide without visiting Settings again. */
export function BrandingPreviewSync() {
  const { data: branding } = useQuery({ queryKey: ["branding"], queryFn: getBranding });

  useEffect(() => {
    if (branding) document.documentElement.style.setProperty("--brand-primary", branding.primary_color);
  }, [branding]);

  return null;
}
