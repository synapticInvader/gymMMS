-- Initial schema for Gym MMS
-- Phase 1 runs as a single tenant; tenant_id/branch_id are present on every
-- table from day one so Phase 2 (multi-tenant white-label) needs no rearchitecture.

create extension if not exists pgcrypto;

-- Tenants (Phase 1: single row; Phase 2: one row per gym client)
create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'basic',
  created_at timestamptz not null default now()
);

-- Branches
create table branches (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  name text not null,
  created_at timestamptz not null default now()
);

-- Members
create table members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  branch_id uuid not null references branches(id),
  name text not null,
  mobile text not null,
  gender text,
  join_date date not null,
  status text not null default 'active', -- active | due | expiring_soon | expired
  created_at timestamptz not null default now(),
  unique (tenant_id, branch_id, mobile)
);

-- Packages
create table packages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  name text not null,
  duration_days integer not null check (duration_days > 0),
  default_price numeric(10,2)
);

-- Member package assignments
create table member_packages (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id),
  package_id uuid not null references packages(id),
  total_amount numeric(10,2) not null check (total_amount >= 0),
  start_date date not null,
  expiry_date date not null,
  created_at timestamptz not null default now()
);

-- Payments (immutable ledger — application layer never issues UPDATE/DELETE
-- against this table; corrections are new offsetting rows)
create table payments (
  id uuid primary key default gen_random_uuid(),
  member_package_id uuid not null references member_packages(id),
  amount numeric(10,2) not null check (amount > 0),
  mode text not null check (mode in ('cash', 'upi', 'card')),
  paid_on date not null default current_date,
  recorded_by uuid not null, -- references auth.users(id)
  created_at timestamptz not null default now()
);

-- Attendance — unique constraint blocks duplicate same-day check-ins
create table attendance (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id),
  branch_id uuid not null references branches(id),
  checked_in_at timestamptz not null default now(),
  unique (member_id, (checked_in_at::date))
);

-- Audit log
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  entity text not null,
  entity_id uuid not null,
  action text not null check (action in ('create', 'update', 'delete')),
  performed_by uuid not null,
  performed_at timestamptz not null default now(),
  diff jsonb
);

-- ---------------------------------------------------------------------
-- Row-Level Security
-- Phase 1 note: policies below use a permissive "true" check since we run
-- single-tenant. Before Phase 2 (multi-tenant), tighten every policy to
-- compare tenant_id against the authenticated user's tenant claim.
-- TODO(Phase 2): replace every `using (true)` below with real tenant checks.
-- ---------------------------------------------------------------------

alter table tenants enable row level security;
alter table branches enable row level security;
alter table members enable row level security;
alter table packages enable row level security;
alter table member_packages enable row level security;
alter table payments enable row level security;
alter table attendance enable row level security;
alter table audit_log enable row level security;

create policy "tenant_isolation_tenants" on tenants for all using (true);
create policy "tenant_isolation_branches" on branches for all using (true);
create policy "tenant_isolation_members" on members for all using (true);
create policy "tenant_isolation_packages" on packages for all using (true);
create policy "tenant_isolation_member_packages" on member_packages for all using (true);
create policy "tenant_isolation_payments" on payments for all using (true);
create policy "tenant_isolation_attendance" on attendance for all using (true);
create policy "tenant_isolation_audit_log" on audit_log for all using (true);

-- ---------------------------------------------------------------------
-- Seed: one tenant + one branch for Phase 1 local/dev use.
-- Copy the printed tenant id into backend/.env as DEFAULT_TENANT_ID.
-- ---------------------------------------------------------------------
insert into tenants (name, plan) values ('My Gym', 'basic');
insert into branches (tenant_id, name)
  select id, 'Main Branch' from tenants where name = 'My Gym';