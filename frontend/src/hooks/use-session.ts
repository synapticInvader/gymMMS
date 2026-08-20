"use client";

import { useQuery } from "@tanstack/react-query";
import { getSession } from "@/lib/mock-data/auth";

export function useSession() {
  return useQuery({ queryKey: ["session"], queryFn: getSession, staleTime: Infinity });
}
