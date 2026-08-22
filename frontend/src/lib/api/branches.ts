import { apiFetch } from "@/lib/api/client";
import { BRANCHES } from "@/lib/mock-data/seed";
import type { Branch } from "@/lib/mock-data/types";

/** Mirrors real backend branches into the mock BRANCHES store so member views built
 * from mock data (toMemberView) can resolve a real branch_id from a created member. */
export async function getBranches(): Promise<Branch[]> {
  const branches = await apiFetch<Branch[]>("/branches");
  for (const branch of branches) {
    if (!BRANCHES.some((b) => b.id === branch.id)) {
      BRANCHES.push(branch);
    }
  }
  return branches;
}
