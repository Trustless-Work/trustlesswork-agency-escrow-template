<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agency Escrow V1 contributor rules

## Authority hierarchy

Use the following order when deciding what is true and what should change:

1. `docs/PRODUCT-BRIEF.md` and `docs/PRD.md` define the Agency Escrow V1 product model and scope.
2. Current code and tests on `develop` are executable truth for the shipped implementation.
3. GitHub issues define the current scoped execution work and acceptance criteria.
4. `.agents/skills/trustless-work/` provides repo-local Trustless Work integration guidance and should stay synchronized with the canonical `Trustless-Work/trustlesswork-skill` repository.
5. `docs/BUILD-PLAN.md` records the completed V1 build wave and the current release/maintenance phase; it is not a substitute for the active issue backlog.

If code, docs, and the active issue conflict, stop and surface the conflict instead of silently choosing one interpretation.

## Product model

The workspace can be either payer or payee. Never hard-code `agency = receiver` or `client = payer`.

Use:
- `workspace`
- `counterparty`
- `paymentDirection: receivable | payable`
- derived payer/payee and Trustless Work roles

Read `docs/PRODUCT-BRIEF.md`, `docs/PRD.md`, and `docs/FULL-USER-FLOW_ESCROW-ROLE-MAPPING.md` before changing escrow behavior.

V1 remains intentionally narrow:
- one escrow protects one payment/deliverable from an agreement that already exists;
- Trustless Work Single-Release;
- exactly one milestone in the template UX;
- mock mode for zero-credential contributor work;
- real testnet mode behind the same application-facing boundary.

Do not expand V1 into Multi-Release, disputes/arbitration UX, fiat rails, production auth/backend persistence, contract authoring/e-signature, subscriptions, or team permissions unless the active issue explicitly changes product scope.

## Architecture boundaries

Preserve the existing separation:

```text
route/view/components
        ↓
application hooks
        ↓
mock or testnet orchestration/service boundary
        ↓
Trustless Work SDK / Stellar wallet / indexer
```

Guidelines:
- lifecycle screens should consume application-facing hooks rather than call Trustless Work SDK hooks directly;
- keep payable/receivable role derivation centralized;
- keep Trustless Work payload mapping and wallet/XDR mechanics out of presentation components;
- prefer bounded fixes over broad architecture rewrites during release/maintenance work;
- if an issue exposes a larger cross-cutting defect, document it and open/link a follow-up rather than silently expanding scope.

## Trustless Work integration

Before changing SDK/API/wallet behavior:

1. Read the repo-local `.agents/skills/trustless-work/SKILL.md` and the relevant reference files in that folder.
2. Check the canonical source at `Trustless-Work/trustlesswork-skill` when behavior, payload types, lifecycle rules, trustline guidance, fees, or role permissions may have changed.
3. Prefer the canonical skill/install path when refreshing bundled guidance:

```bash
npx skills add trustless-work/trustlesswork-skill
```

Important V1 rules:
- approval is irreversible on-chain;
- request changes is pre-approval application workflow metadata, not an on-chain unapprove;
- approval does not transfer funds;
- release performs the payout;
- all escrow amount fields are numbers;
- milestone indexes are strings;
- user-role transactions remain non-custodial and are signed by the required wallet.

## Current phase: V1 release and maintenance

The original #13–#19 parallel contributor wave is complete. Current work should optimize for a trustworthy V1 baseline rather than reopening that build structure.

Priorities now include:
- release correctness and dogfood;
- real testnet reference behavior;
- documentation accuracy;
- security and dependency hygiene;
- SDK/skill drift management;
- bounded UX/product correctness fixes discovered during release validation.

## Branch and issue discipline

Before starting work:

```bash
git switch develop
git pull origin develop
```

Then:
- read the active GitHub issue and its dependencies/related work;
- search for an existing issue before creating overlapping scope;
- create a focused branch from the latest `develop`;
- modify only what is needed to satisfy the issue;
- avoid unrelated refactors;
- preserve existing product/architecture boundaries unless the issue explicitly authorizes changing them.

GitHub issues, not the historical contributor-wave file ownership table, are the current execution contract.

## Quality gate

Run before opening or updating a PR:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Also run:

```bash
pnpm test:e2e
```

when the change modifies real testnet lifecycle behavior, Trustless Work payload mapping, wallet signing/role enforcement, release money-flow semantics, or release evidence that depends on the live testnet path.

PR evidence should match the issue. Examples:
- UI changes: screenshots or a short recording across relevant desktop/mobile states;
- testnet lifecycle changes: safe contract/transaction references and role/signer evidence, with no secrets or XDR logged;
- documentation changes: verify commands, paths, env names, and examples against the current repository rather than copying historical instructions.
