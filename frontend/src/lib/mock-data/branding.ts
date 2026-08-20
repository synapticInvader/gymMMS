import { delay } from "@/lib/mock-data/delay";
import { BRANCHES, BRANDING, PACKAGES, TENANT } from "@/lib/mock-data/seed";
import type { Branch, Branding, Package } from "@/lib/mock-data/types";

let branchCounter = BRANCHES.length;
let packageCounter = PACKAGES.length;

export async function getBranding(): Promise<Branding> {
  await delay();
  return { ...BRANDING };
}

export async function saveBranding(patch: Partial<Omit<Branding, "tenant_id">>): Promise<Branding> {
  await delay();
  Object.assign(BRANDING, patch);
  return { ...BRANDING };
}

export async function getBranches(): Promise<Branch[]> {
  await delay();
  return [...BRANCHES];
}

export async function addBranch(name: string): Promise<Branch> {
  await delay();
  branchCounter += 1;
  const branch: Branch = {
    id: `branch_${String(branchCounter).padStart(3, "0")}`,
    tenant_id: TENANT.id,
    name,
    created_at: new Date().toISOString(),
  };
  BRANCHES.push(branch);
  return branch;
}

export async function getPackages(): Promise<Package[]> {
  await delay();
  return [...PACKAGES];
}

export async function addPackage(input: {
  name: string;
  durationDays: number;
  defaultPrice: number;
}): Promise<Package> {
  await delay();
  packageCounter += 1;
  const pkg: Package = {
    id: `pkg_${String(packageCounter).padStart(3, "0")}`,
    tenant_id: TENANT.id,
    name: input.name,
    duration_days: input.durationDays,
    default_price: input.defaultPrice,
  };
  PACKAGES.push(pkg);
  return pkg;
}
