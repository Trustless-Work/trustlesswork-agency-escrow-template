# Build Plan — Agency Escrow Template V1

This document records the completed V1 build sequence and the repository's current release/maintenance phase.

It is **not** the live implementation source of truth. Use the following authority order:

1. `docs/PRODUCT-BRIEF.md` and `docs/PRD.md` for product model and V1 boundaries.
2. Current code and tests on `develop` for executable behavior.
3. Active GitHub issues for current scoped work and acceptance criteria.
4. `.agents/skills/trustless-work/` for repo-local Trustless Work integration guidance, reconciled against the canonical `Trustless-Work/trustlesswork-skill` source when needed.

## Product target

> Put escrow around work you already agreed on.

The workspace can either be getting paid or paying someone. V1 protects one payment/deliverable using a Single-Release Trustless Work escrow with exactly one milestone in the template UX.

The underlying contract, proposal, SOW, quote, invoice, or commercial agreement remains the source of the business obligation. The template coordinates the protected payment around it.

## Architecture target

```text
route / view / components
          ↓
application-facing hooks
          ↓
mock adapter | testnet orchestration
          ↓
Trustless Work SDK / wallet / indexer
```

Key constraints:
- payable and receivable use the same domain model;
- payer/payee and Trustless Work roles are derived from payment direction;
- screens do not construct Trustless Work payloads or handle XDR directly;
- mock and testnet share the same application-facing boundary;
- V1 remains Single-Release and intentionally narrow.

---

# Completed V1 build sequence

The sections below describe how the current V1 was assembled. They are retained for provenance and contributor context; they are not a current parallel-work assignment plan.

## Phase A — Core foundation

### #10 Bidirectional domain model and docs

Established:
- workspace/counterparty terminology;
- `receivable` / `payable`;
- payer/payee derivation;
- Trustless Work role derivation;
- schemas;
- state machine;
- guards;
- fee math;
- product docs.

### #11 SDK infrastructure and service seam

Established:
- `@trustless-work/escrow`;
- Stellar Wallets Kit;
- provider/config setup;
- `mock` vs `testnet` runtime boundary;
- stable application service contract;
- mock adapter + local persistence;
- Trustless Work integration seam.

### #12 Application hooks and contributor fixtures

Established:
- TanStack Query keys;
- application-facing hooks;
- cache invalidation;
- canonical TechRebel receivable/payable seed data.

## Phase B — OSS lifecycle UI wave

The original contributor wave implemented isolated route/view/component slices from `develop`:

| Issue | Slice | Route / area |
| --- | --- | --- |
| #13 | Create escrow | `/agency/create` |
| #14 | Escrows dashboard | `/agency` |
| #15 | Shared viewer + timeline | `/escrow/[escrowId]` |
| #16 | Funding | `/escrow/[escrowId]/fund` |
| #17 | Work submission/resubmission | `/escrow/[escrowId]/submit` |
| #18 | Approval/request changes | `/escrow/[escrowId]/review` |
| #19 | Release | `/escrow/[escrowId]/release` |

That parallel ownership model is now historical. Current work follows the active GitHub issue rather than this table.

## Phase C — Integration and UX hardening

### #20 Real Trustless Work testnet integration

Added and verified the real two-wallet Single-Release lifecycle behind the application hooks:
- create;
- fund;
- submit/resubmit;
- approve;
- release;
- wallet-as-actor enforcement;
- unsigned-XDR → wallet-sign → submit → confirm flow;
- testnet reads/indexer mapping;
- trustline/balance/config preflight;
- mock regression coverage.

### #21 lifecycle UX convergence

Unified the separate contributor-built screens around one lifecycle visual language and shared presentational primitives while preserving the product/domain boundary.

Follow-up UX fixes, including the dark-theme boundary work, completed the V1 visual convergence.

---

# Canonical V1 scenarios

## Receivable

`Acme → TechRebel`

Acme funds → TechRebel submits → Acme may request changes → TechRebel resubmits → Acme approves → Acme releases → TechRebel receives.

## Payable

`TechRebel → Maria`

TechRebel funds → Maria submits → TechRebel approves → TechRebel releases → Maria receives.

These scenarios must remain valid in mock mode and in real testnet validation when the affected work touches the live integration path.

# V1 state machine

```text
created
  ↓ fund
funded
  ↓ submit
in_review
  ├─ request changes → revision_requested → resubmit → in_review
  └─ approve → approved → release → released → closed
```

Approval is irreversible on-chain. `Request changes` exists only before approval and is application-level workflow metadata where the contract has no equivalent reversible state.

# Runtime modes

## mock

Default contributor mode:
- no API key;
- no real wallet;
- local persistence;
- seeded receivable/payable examples;
- simulated lifecycle behavior through the same app-facing hooks.

## testnet

Real Trustless Work development environment:
- Trustless Work SDK/API;
- Stellar wallet signing;
- real contract IDs and on-chain state;
- testnet USDC trustlines/balances;
- bounded confirmation/indexer handling;
- same screen-facing application hooks as mock mode.

Mainnet remains out of V1 scope unless a future issue explicitly changes that boundary.

---

# Current phase — V1 release and maintenance

The repository is no longer in the initial contributor-build phase. The current objective is a trustworthy, reproducible V1 reference application.

## Current priorities

### 1. Release correctness and dogfood

The README and final release evidence must match what actually ships and what a clean checkout can reproduce.

### 2. Money-flow correctness

Displayed gross amount, platform fee, Trustless Work protocol fee where applicable, and receiver net must match actual release behavior. Fee semantics should be centralized rather than reimplemented per screen.

### 3. Real testnet reference behavior

When integration behavior changes, preserve the non-custodial write contract:

```text
write operation
  → unsigned XDR
  → required role wallet signs
  → signed transaction submitted
  → expected state confirmed
  → app queries refreshed
```

Do not advance UI state merely because an unsigned XDR was created or a signature was produced.

### 4. Documentation accuracy

Commands, env names, setup paths, product claims, role semantics, fee examples, and known limitations must be verified against the repository before merging release docs.

### 5. Security and dependency hygiene

Resolve or explicitly risk-accept material dependency/security findings before calling the repository release-ready.

### 6. SDK / skill drift management

The bundled `.agents/skills/trustless-work/` copy is local guidance, not an independently maintained fork of platform truth. Reconcile it against the canonical `Trustless-Work/trustlesswork-skill` source when integration facts change.

### 7. Bounded follow-up improvements

Release findings should become focused issues. Avoid reopening V1 architecture or adding adjacent product scope unless a new issue explicitly justifies it.

## Current related work

At the time this plan was refreshed, relevant release/maintenance work included:
- #34 / PR #44 — final V1 release-readiness and README pass;
- #35 / PR #43 — bundled Trustless Work skill reconciliation;
- #45 — payout/fee correctness;
- #46 — vulnerable transitive dependency cleanup;
- #47 — repository operating-document refresh.

The live GitHub backlog is authoritative if this list becomes stale.

---

# Contribution discipline

Every change should start from the latest `develop` and an active issue.

```bash
git switch develop
git pull origin develop
```

Then:
- inspect the issue and related work;
- search for overlapping issues before expanding scope;
- create a focused branch;
- preserve the existing architecture and product boundaries unless the issue explicitly changes them;
- keep unrelated refactors out of release/maintenance PRs;
- open a separate linked issue when a substantial new defect is discovered.

# Quality gate

Default PR gate:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Run the real testnet lifecycle proof when the change affects the live integration path, payload mapping, wallet signing/role enforcement, release money flow, or release evidence:

```bash
pnpm test:e2e
```

UI PRs should include screenshots or a short recording for the affected states. Testnet/integration PRs should include safe contract/transaction evidence where relevant and must never expose API keys, private keys, or XDR material.
