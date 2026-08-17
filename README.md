# Gym MMS — Member Management System

A custom-built, owned member management platform, developed to replace a buggy third-party vendor tool (HTGMS) for a real, operating gym business (~180 active members, multi-branch). Built solo — requirements gathered directly from a business stakeholder, through architecture, to a working system in active development.

> 🎥 **[3-minute walkthrough video](#)** — discovery process, architecture decisions, and a live look at the codebase.
> 📄 **[Full case study](docs/CASE_STUDY.md)** — the problem, the process, and the key technical decisions, written up in detail.

---

## The problem

The gym's existing software (a third-party vendor system) had no ownership, no customization, and real data-integrity bugs — null/default dates displaying as `"30-11-0001"`, duplicate attendance rows for the same check-in, and fully manual dues/renewal tracking with no automation. This project replaces it with a system the business fully owns, fixes those defect classes at the architecture level (not just patches them), and is designed to support a future white-label version resellable to other gym owners.

## My role

Sole engineer, working directly with a gym owner as the stakeholder. I ran the discovery process, wrote and got sign-off on the requirements (BRD/FRS) and architecture (HLD/LLD), and am now building the system feature-by-feature through a real Git branching workflow with PRs and CI — the same process I'd expect to follow inside a team, self-imposed here because it's the right way to build, not because anyone required it of me.

## Process — from ambiguous ask to working system

1. **Discovery** — structured stakeholder interview (walkthrough of current system, pain points, goals, constraints) → written discovery summary
2. **Requirements** — BRD (business goals, as-is/to-be) + FRS (functional requirements, epic by epic) → reviewed and signed off before any code was written
3. **Architecture** — HLD (system diagram, component responsibilities) + LLD (Postgres schema, API contract) → also signed off, with explicit **[ADRs](docs/adr/)** documenting *why* each significant decision was made
4. **Build** — feature branches off `dev`, PRs reviewed before merge, CI running tests on every push, `main` branch-protected and only updated via reviewed PR from `dev`

Full documents: [`docs/01_Lead_Qualification.md`](docs/01_Lead_Qualification.md) → [`docs/05_HLD_Architecture_SignOff.md`](docs/05_HLD_Architecture_SignOff.md)

## Architecture

```
Next.js (Vercel) → FastAPI (Render) → Supabase (Postgres + RLS, Auth, Storage)
                                              ↑
                          GitHub Actions (CI/CD, scheduled jobs)
                          Sentry (error tracking) · Cloudflare (DNS)
```

Every core table carries `tenant_id` / `branch_id` from day one, and Postgres Row-Level Security is enabled with policy stubs in place — the system runs single-tenant today (Phase 1), but the data model needs no rearchitecture when it becomes a multi-tenant, white-labeled product (Phase 2).

**Why these choices:** see [`docs/adr/`](docs/adr/) — e.g. [ADR-0002](docs/adr/0002-immutable-payment-ledger.md) explains the payment-ledger design that directly fixes the balance-drift bug found in the legacy system.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Backend | FastAPI (Python) | Typed request/response models, auto-generated OpenAPI docs, async-ready |
| Database | Supabase (Postgres) | Managed Postgres + native Row-Level Security, fits the multi-tenant roadmap without extra infra |
| Frontend | Next.js | App Router, deploys cleanly on Vercel with per-branch previews |
| Infra | Docker, Render, GitHub Actions | Portable, reproducible builds; CI gates every merge |
| Monitoring | Sentry | Errors surfaced before a user has to report them |

## A key technical decision — the payment ledger

The legacy system stored `paid_amount` as a directly editable field, which allowed silent balance drift and had no audit trail. This system stores payments as an **append-only ledger** — no `UPDATE`/`DELETE` ever issued against it — and computes remaining balance at query time as `total_amount − sum(payments)`. Full reasoning in [ADR-0002](docs/adr/0002-immutable-payment-ledger.md); the calculation logic itself is unit-tested in [`backend/tests/test_balance_service.py`](backend/tests/test_balance_service.py).

## Engineering workflow

- `main` is branch-protected — no direct pushes, PR + review required
- Feature branches (`feature/xxx`) off `dev`, PR back into `dev`, promoted to `main` as releases
- Conventional Commits (`feat:`, `fix:`, `chore:`)
- CI (GitHub Actions) runs lint + tests on every push/PR
- Separate dev/prod Supabase and Render environments — no direct production edits, ever

## Status

🚧 **Active development.** Phase 1 (single-tenant MVP: member management, payments, attendance, dashboard) is being built feature-by-feature via the workflow above. Phase 2 (multi-tenant white-label) is scoped but intentionally not started — see [`docs/03_Proposal_and_Contracting.md`](docs/03_Proposal_and_Contracting.md) for the phase boundary and reasoning.

## Repo structure

```
gym-mms/
├── backend/         FastAPI app — models, routers, services, tests
├── frontend/         Next.js app
├── supabase/          SQL migrations
├── docs/               BRD, FRS, HLD, ADRs, case study
└── .github/workflows/  CI pipeline
```

---

*This project reflects a real engagement with a real stakeholder — some figures and names in `docs/` are anonymized for public sharing.*