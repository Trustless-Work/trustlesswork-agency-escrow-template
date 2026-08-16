# Build Plan — V1 Contributor-Ready Agency Escrow Template

This file is the implementation source of truth for V1.

## Product target

> Put escrow around work you already agreed on.

The workspace can either be getting paid or paying someone. V1 protects one payment/deliverable using a Single-Release Trustless Work escrow with one milestone.

## Contribution strategy

The core team prepares shared contracts first. OSS contributors then implement isolated UI slices in parallel.

Every contributor must branch from the latest `develop` and work only inside the file ownership described by their issue.

## Phase A — Core-team foundation

### #10 Bidirectional domain model and docs

Defines:
- workspace/counterparty
- `receivable` / `payable`
- payer/payee derivation
- Trustless Work role derivation
- schemas
- state machine
- guards
- fee math
- product docs

### #11 SDK infrastructure and service seam

Defines:
- `@trustless-work/escrow`
- Stellar Wallets Kit
- provider/config setup
- `mock` vs `testnet`
- stable service contract
- mock adapter + local persistence
- Trustless Work adapter boundary

### #12 Application hooks and contributor fixtures

Defines:
- stable TanStack Query keys
- app-facing hooks
- cache invalidation
- TechRebel receivable/payable seed data

**Foundation freeze:** after #10–#12 merge, #13–#19 should not refactor shared domain/service/hook contracts.

## Phase B — OSS contributor wave (parallel)

All issues below branch from `develop` after foundation freeze.

| Issue | Slice | Primary ownership |
| --- | --- | --- |
| #13 | Create escrow | `/agency/create`, create view/components |
| #14 | Escrows dashboard | `/agency`, dashboard view/components |
| #15 | Shared viewer + timeline | `/escrow/[escrowId]`, viewer components |
| #16 | Funding | `/escrow/[escrowId]/fund`, funding components |
| #17 | Work submission/resubmission | `/escrow/[escrowId]/submit`, submission components |
| #18 | Approval/request changes | `/escrow/[escrowId]/review`, review components |
| #19 | Release | `/escrow/[escrowId]/release`, release components |

These slices should consume only the frozen app types/hooks and their own route/view/component folders.

## Phase C — Core-team integration hardening

### #20 Testnet hardening

After #13–#19 merge, verify the full real Trustless Work lifecycle for both payment directions and fix integration-only issues without redesigning contributor UI.

### #21 Dogfood + V1 QA

Run the two canonical TechRebel scenarios end to end, polish bounded UX issues, and update final contributor/user docs.

## Canonical scenarios

### Receivable

`Acme → TechRebel`

Acme funds → TechRebel submits → Acme approves/releases → TechRebel receives.

### Payable

`TechRebel → Maria`

TechRebel funds → Maria submits → TechRebel approves/releases → Maria receives.

## V1 state machine

```text
created
  ↓
funded
  ↓
in_review
  ├─→ revision_requested → in_review
  └─→ approved → released → closed
```

## Modes

### mock

Default for OSS. No API key or wallet. Local persistence and seed fixtures.

### testnet

Real Trustless Work SDK + Stellar wallet signing. Same screen-facing app hooks.

## Quality gate for every PR

```bash
pnpm lint
pnpm typecheck
pnpm build
```

PRs should also include screenshots/recordings for UI changes and stay inside issue file ownership unless a maintainer approves a shared-contract change.
