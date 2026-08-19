#!/usr/bin/env bash
# Bulk-creates labels + all Phase 1 backlog issues via GitHub CLI.
# Prereqs: `gh auth login` already run, and this script run from inside
# your cloned gym-mms repo directory (so `gh` knows which repo to target).
set -e

echo "Creating labels..."
gh label create "epic:members"    --color "0E8A16" --force
gh label create "epic:payments"   --color "1D76DB" --force
gh label create "epic:lifecycle"  --color "5319E7" --force
gh label create "epic:attendance" --color "FBCA04" --force
gh label create "epic:dashboard"  --color "D93F0B" --force
gh label create "epic:access"     --color "B60205" --force
gh label create "epic:finance"    --color "0052CC" --force
gh label create "frontend"        --color "C5DEF5" --force
gh label create "backend"         --color "BFD4F2" --force

echo "Creating issues..."

# ---------------- Epic 1: Member Management ----------------

gh issue create --title "[FR-1.1] Member creation (frontend + backend)" \
  --label "epic:members,frontend,backend" \
  --body "As Admin/Staff, I want to add a new member with name, mobile, gender, branch, and joining date, so their membership starts being tracked.

Acceptance criteria:
- Frontend form matches fields in FR-1.1, client-side validation on required fields
- Backend POST /members validates and persists the record
- Duplicate mobile+branch is rejected with a clear error (ties to FR-1.4)

Status: DONE (feature/member-create-list) — closing on creation for record-keeping."

gh issue create --title "[FR-1.3] Member list, search & filter" \
  --label "epic:members,frontend,backend" \
  --body "As Admin/Staff, I want to search/filter members by name, mobile, or status, so I can find a member quickly.

Acceptance criteria:
- Frontend list view with search box and status filter dropdown
- Backend GET /members supports query params for name/mobile/status filtering

Status: PARTIAL — list endpoint done, filtering not yet added."

gh issue create --title "[FR-1.2] Member edit" \
  --label "epic:members,frontend,backend" \
  --body "As Admin/Staff, I want to edit an existing member's details, so I can correct mistakes or update info.

Acceptance criteria:
- Frontend edit form, pre-filled with current values
- Backend PATCH /members/{id} updates only provided fields"

gh issue create --title "[FR-1.4] Duplicate member prevention" \
  --label "epic:members,backend" \
  --body "System shall prevent duplicate member records based on mobile number + branch.

Acceptance criteria:
- DB unique constraint verified working
- API returns a clean 409 error, not a raw DB error, on violation

Status: DONE (part of feature/member-create-list) — closing on creation for record-keeping."

gh issue create --title "[FR-1.5] Member edit/delete audit logging" \
  --label "epic:members,backend" \
  --body "System shall log all edits/deletions to member records with user and timestamp.

Acceptance criteria:
- Every PATCH/DELETE on members writes a row to audit_log
- Audit entries capture before/after diff, performed_by, timestamp"

# ---------------- Epic 6.2: Auth (pulled forward) ----------------

gh issue create --title "[FR-6.2] Authentication required" \
  --label "epic:access,frontend,backend" \
  --body "System shall require authentication for all access; no anonymous access to member/financial data.

Acceptance criteria:
- Frontend login page (Supabase Auth)
- Backend rejects unauthenticated requests to all non-health endpoints

Priority note: pulled forward in build order — do this before shipping any more write endpoints against real data."

# ---------------- Epic 2: Package & Payments ----------------

gh issue create --title "[FR-2.1] Package assignment" \
  --label "epic:payments,frontend,backend" \
  --body "As Admin/Staff, I want to assign a package (name, duration, total amount) to a member, so their membership term and cost are defined.

Acceptance criteria:
- Frontend package-selection step in Add Member (or a separate Assign Package action)
- Backend POST /members/{id}/packages creates a member_packages row with computed expiry_date"

gh issue create --title "[FR-2.2] Payment ledger entry (immutable)" \
  --label "epic:payments,frontend,backend" \
  --body "As Admin/Staff, I want to record a payment against a member's package, so their balance updates accurately without editable balance fields.

Acceptance criteria:
- Frontend Add Payment form (amount, mode, date)
- Backend POST /members/{package_id}/payments inserts a ledger row — no update/delete path exists
- Remaining balance is computed, never stored/edited directly"

gh issue create --title "[FR-2.3] Partial payment & balance calculation" \
  --label "epic:payments,backend" \
  --body "System shall support partial payments, auto-calculating remaining balance after each entry.

Acceptance criteria:
- GET /members/{package_id}/balance returns total, paid, remaining
- Verified against balance_service.py unit tests (already passing)"

gh issue create --title "[FR-2.4] Payment idempotency" \
  --label "epic:payments,backend" \
  --body "System shall prevent duplicate/double-submission of the same payment.

Acceptance criteria:
- Frontend disables submit button during request in-flight
- Backend rejects an identical duplicate submission within a short window"

gh issue create --title "[FR-2.5] Payment history view" \
  --label "epic:payments,frontend,backend" \
  --body "As Admin/Staff, I want to see a member's full payment history, so I can verify what's been paid and when.

Acceptance criteria:
- Frontend payment history list on member detail page
- Backend GET /members/{package_id}/payments returns ordered ledger entries"

# ---------------- Epic 3: Membership Lifecycle ----------------

gh issue create --title "[FR-3.1] Expiry date calculation" \
  --label "epic:lifecycle,backend" \
  --body "System shall auto-calculate expiry date from join date + package duration.

Acceptance criteria:
- Verified via compute_expiry_date() unit tests (already passing)
- Wired into package assignment (FR-2.1) so expiry_date is set on creation"

gh issue create --title "[FR-3.4] No null/invalid dates" \
  --label "epic:lifecycle,backend" \
  --body "System shall never display a null/invalid date; validated at entry and enforced at the database layer.

Acceptance criteria:
- All date columns are not null (already in schema)
- Frontend date pickers reject empty submission"

gh issue create --title "[FR-3.2] Member status classification" \
  --label "epic:lifecycle,frontend,backend" \
  --body "As Admin/Staff, I want each member's status (Active/Due/Expiring Soon/Expired) shown clearly, so I know who needs follow-up.

Acceptance criteria:
- Frontend status badge on member list/detail (color-coded)
- Backend computes status via compute_status() (already unit-tested) on read, or via a scheduled job"

gh issue create --title "[FR-3.3] Renewal workflow" \
  --label "epic:lifecycle,frontend,backend" \
  --body "As Admin/Staff, I want to renew a member's package, extending expiry and logging a new payment, without losing prior history.

Acceptance criteria:
- Frontend Renew action from member list/detail
- Backend POST /members/{id}/renew creates a new member_packages row + new payment ledger entry — old records untouched"

# ---------------- Epic 4: Attendance ----------------

gh issue create --title "[FR-4.1] Check-in logging" \
  --label "epic:attendance,frontend,backend" \
  --body "As Staff, I want to check in a member, so their visit is recorded.

Acceptance criteria:
- Frontend check-in action (search member, tap check-in)
- Backend POST /attendance inserts a row"

gh issue create --title "[FR-4.2] Duplicate check-in prevention" \
  --label "epic:attendance,backend" \
  --body "System shall prevent duplicate check-in entries for the same member on the same day.

Acceptance criteria:
- DB unique index on (member_id, date_ist(checked_in_at)) already in migration
- API returns a clean 409, not a raw DB error"

gh issue create --title "[FR-4.3] Attendance history view" \
  --label "epic:attendance,frontend,backend" \
  --body "As Admin/Staff, I want to view attendance history filterable by branch and date range.

Acceptance criteria:
- Frontend attendance list with branch/date filters
- Backend GET /attendance supports those query params"

# ---------------- Epic 5: Dashboard & Reporting ----------------

gh issue create --title "[FR-5.1] Dashboard summary counts" \
  --label "epic:dashboard,frontend,backend" \
  --body "As Admin, I want to see Total Members, New This Month, Expired, and Due counts at a glance.

Acceptance criteria:
- Frontend dashboard summary cards
- Backend GET /dashboard/summary returns all four counts (New This Month currently a TODO)"

gh issue create --title "[FR-5.2] Dues list view" \
  --label "epic:dashboard,frontend,backend" \
  --body "As Admin/Staff, I want a list of members with an outstanding balance, so I can follow up on collections.

Acceptance criteria:
- Frontend Dues List page
- Backend GET /reports/dues returns members with balance > 0"

gh issue create --title "[FR-5.3] Expiring-soon list view" \
  --label "epic:dashboard,frontend,backend" \
  --body "As Admin/Staff, I want a list of members expiring within a configurable window, so I can proactively reach out.

Acceptance criteria:
- Frontend Expiring Soon page
- Backend GET /reports/expiring with configurable days query param (default 7)"

gh issue create --title "[FR-5.4] CSV/Excel export" \
  --label "epic:dashboard,frontend,backend" \
  --body "As Admin, I want to export any list view to CSV/Excel, so I can share or archive it.

Acceptance criteria:
- Frontend export button on Members, Dues, Expiring, Attendance list views
- Backend returns CSV for the same filtered query as the on-screen list"

# ---------------- Epic 6: Access Control (remainder) ----------------

gh issue create --title "[FR-6.1] Role-based access (Admin/Staff)" \
  --label "epic:access,backend" \
  --body "System shall support role-based access: Admin (full), Staff (limited: add member, add payment, check-in).

Acceptance criteria:
- app_users table with role column
- Backend endpoints enforce role checks (e.g., delete-member restricted to Admin)"

gh issue create --title "[FR-6.3] Branch-scoped visibility" \
  --label "epic:access,backend" \
  --body "System shall enforce branch-scoped data visibility if multi-branch is enabled.

Acceptance criteria:
- RLS/API filters respect branch_id for Staff-level users, if/when multiple branches exist in Phase 1 data"

# ---------------- Epic 8: Financial Management & Dashboard ----------------

gh issue create --title "[FR-8.3] Income derived from payments ledger" \
  --label "epic:finance,backend" \
  --body "System shall auto-derive Income from the existing payments ledger — no duplicate manual entry for membership revenue.

Acceptance criteria:
- Backend query aggregates payments by date range for the financial dashboard"

gh issue create --title "[FR-8.1] Expense recording" \
  --label "epic:finance,frontend,backend" \
  --body "As Admin, I want to record a business expense (category, amount, date, note).

Acceptance criteria:
- Frontend Add Expense form
- Backend POST /expenses, new expenses table (add via migration)"

gh issue create --title "[FR-8.2] Payroll recording" \
  --label "epic:finance,frontend,backend" \
  --body "As Admin, I want to record staff salary/payroll entries.

Acceptance criteria:
- Frontend Add Payroll Entry form
- Backend POST /payroll, new payroll table (add via migration)"

gh issue create --title "[FR-8.4] Non-membership income entry" \
  --label "epic:finance,frontend,backend" \
  --body "As Admin, I want to record other income (PT sessions, retail) not tied to membership payments.

Acceptance criteria:
- Frontend Add Other Income form
- Backend POST /income, new other_income table"

gh issue create --title "[FR-8.5] Financial dashboard summary" \
  --label "epic:finance,frontend,backend" \
  --body "As Admin, I want a Financial Dashboard summarizing Income, Expenses, Payroll, and Net Profit for a selected period.

Acceptance criteria:
- Frontend Financial Dashboard page with period selector
- Backend GET /finance/summary?period= aggregates all sources into one response"

gh issue create --title "[FR-8.7] Expense/payroll audit logging" \
  --label "epic:finance,backend" \
  --body "Expense and payroll edits/deletes shall be audit-logged, no silent overwrites.

Acceptance criteria:
- Same audit_log pattern as FR-1.5, applied to expenses and payroll tables"

gh issue create --title "[FR-8.6] Financial CSV/Excel export" \
  --label "epic:finance,frontend,backend" \
  --body "As Admin, I want to export expense, payroll, and income records for my accountant.

Acceptance criteria:
- Export buttons on Expense/Payroll/Income list views, same pattern as FR-5.4"

echo "Done. $(gh issue list --limit 100 | wc -l) issues now open."
