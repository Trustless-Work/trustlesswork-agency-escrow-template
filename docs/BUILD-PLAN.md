# Build Plan & OSS Issue Backlog

Implementation source of truth for the **Agency Escrow Template**: a milestone-based escrow workflow where agencies create one-milestone escrows, clients fund and approve delivery, and funds release to the agency with platform fee routing on Stellar via Trustless Work.

Each GitHub issue in this backlog is sized for **meaningful work (1–4 days)**. Prefer **one merged PR per issue**. Issues are ordered by dependency; do not skip ahead without closing blockers.

**Related docs**

| Document | Purpose |
| --- | --- |
| [`docs/PRODUCT-BRIEF.md`](PRODUCT-BRIEF.md) | Executive summary, parties, MVP scope, example milestones |
| [`docs/PRD.md`](PRD.md) | Full PRD: functional requirements, UX screens, data model, MVP must/should/nice |
| [`docs/FULL-USER-FLOW_ESCROW-ROLE-MAPPING.md`](FULL-USER-FLOW_ESCROW-ROLE-MAPPING.md) | Flows A–H, role mapping, state machine, acceptance criteria |
| [`.cursor/rules/FOLDER_LAYOUT.mdc`](../.cursor/rules/FOLDER_LAYOUT.mdc) | Vertical slice layout under `src/features/` |
| [`.cursor/rules/DAPP.mdc`](../.cursor/rules/DAPP.mdc) | Stack, forms, UI, TanStack Query, TypeScript conventions |
| [`.cursor/rules/FORMS.mdc`](../.cursor/rules/FORMS.mdc) | Layered form architecture (view → component → hook → schema → service) |
| [`.agents/skills/trustless-work/SKILL.md`](../.agents/skills/trustless-work/SKILL.md) | Trustless Work SDK/Blocks, roles, XDR signing, trustlines |
| [Trustless Work platform docs](https://docs.trustlesswork.com/trustless-work) | API, SDK, Blocks mechanics (external) |

---

## How to use this document

1. Create GitHub issues **in phase order** (P1 → P12). One BUILD-PLAN entry = one GitHub issue unless maintainers explicitly split one.
2. Implement only issues whose **Blocked by** dependencies are closed/merged.
3. Copy the **GitHub issue template** at the end of this file into each issue body. Always include the **BUILD-PLAN ID** (`#1`, `#2`, …) — it is not the same as the GitHub issue number.
4. Follow architecture decisions in this doc and rules in `.cursor/rules/`. Do not redefine folder layout or role mapping per issue.
5. Validate scope against [`docs/PRD.md`](PRD.md) §15 and [`docs/FULL-USER-FLOW_ESCROW-ROLE-MAPPING.md`](FULL-USER-FLOW_ESCROW-ROLE-MAPPING.md) §16 before expanding an issue.
6. **Mock-first strategy:** Issues #1–#10 deliver the full MVP lifecycle using a mock/offline escrow layer. Issue #11 replaces mock I/O with Trustless Work testnet integration. Do not start #11 until mock demo (#10) is mergeable.
7. Should-have work (#12) stays last and must not block MVP demo.

---

## Effort scale

| Size | Effort | Meaning |
| --- | --- | --- |
| **M** | 1–2 days | One domain slice, one screen family, or a focused utility layer |
| **L** | 2–3 days | Multiple components, a full user flow, or SDK wiring for one action |
| **XL** | 3–5 days | Cross-cutting integration, XDR signing on testnet, end-to-end verification |

---

## Suggested GitHub labels

| Label | Usage |
| --- | --- |
| `epic:setup` | Foundation, toolchain, providers |
| `epic:domain` | Types, schemas, state machine, mock service |
| `epic:agency` | Agency dashboard, create escrow, submit milestone |
| `epic:client` | Client fund, review, approve, release |
| `epic:shared` | Escrow viewer, timeline, layout |
| `epic:integration` | Trustless Work SDK / Blocks / testnet |
| `epic:docs` | README, contributor docs, dogfooding notes |
| `priority:must-have` | MVP (PRD §15.1, flow doc §16 must-have) |
| `priority:should-have` | Post-MVP polish (PRD §15.2) |
| `size:M` / `size:L` / `size:XL` | Effort estimate |
| `help wanted` | Ready for external OSS contributors |

---

## Architecture decisions

These decisions are **fixed for the MVP backlog**. Individual issues must not renegotiate them without maintainer approval and a doc update.

### 1. Folder layout

| Location | Responsibility |
| --- | --- |
| `src/app/` | Next.js App Router: thin route files that compose feature `views/` |
| `src/features/escrow/` | Core escrow domain: create, fund, submit, approve, release, viewer |
| `src/features/escrow/components/` | Presentational forms and panels (CreateEscrowForm, FundEscrowPanel, …) |
| `src/features/escrow/views/` | Full pages: AgencyDashboardView, EscrowDetailView, ClientFundingView, … |
| `src/features/escrow/hooks/` | Form hooks, mutations, role-gated action hooks |
| `src/features/escrow/schemas/` | Zod schemas + inferred form types |
| `src/features/escrow/services/` | Escrow I/O: mock adapter (#4) then Trustless Work adapter (#11) |
| `src/features/escrow/utils/` | Status transitions, role checks, fee math, link builders |
| `src/components/ui/` | shadcn primitives shared app-wide |
| `src/lib/` | HTTP client helpers, env validation, query client, wallet/TW provider wrappers |
| `src/types/` | Cross-feature DTOs only when not owned by a single slice |

### 2. Module dependency rule

```
src/app/*           → may import features/*, components/ui, lib/*
src/features/*      → may import components/ui, lib/*, types/* — NOT other features' internals
src/components/ui   → no feature imports
src/lib             → no feature imports, no JSX
```

### 3. Reuse vs custom (integrations)

| Concern | Reuse (preferred) | Custom in this template |
| --- | --- | --- |
| Escrow contract lifecycle | Trustless Work API / `@trustless-work/escrow` | — |
| Pre-built TW UI where it fits | `@trustless-work/blocks` (evaluate per screen in #11) | Agency-specific copy, role labels, milestone metadata fields |
| Wallet connection | Stellar Wallets Kit + Freighter (testnet) | Role-gated action buttons, connect CTA placement |
| Forms & validation | react-hook-form + zod + shadcn `Form*` | Agency escrow schemas, acceptance criteria fields |
| Server state | TanStack Query | Escrow list/detail/mutation keys |
| App metadata (delivery notes, revision notes, client/agency names) | — | Application layer / mock store (#4); optional TW metadata fields in #11 |
| Notifications (email) | — | Out of MVP (#12 optional in-app toasts only) |

### 4. Global config (providers, env, modes)

**Provider nesting order (outer → inner):**

```
ThemeProvider → QueryClientProvider → WalletProvider → TrustlessWorkProvider → {children}
```

**Environment variables**

| Variable | Required when | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_KEY` | Real mode (#11+) | Trustless Work API key |
| `NEXT_PUBLIC_ESCROW_MODE` | Optional | `mock` (default) \| `testnet` — selects service adapter |
| `NEXT_PUBLIC_STELLAR_NETWORK` | Real mode | `testnet` for MVP |
| `NEXT_PUBLIC_PLATFORM_FEE_BPS` | Optional | Default platform fee basis points |
| `NEXT_PUBLIC_PLATFORM_ADDRESS` | Real mode | G… address for fee recipient |
| `NEXT_PUBLIC_USDC_ISSUER` | Real mode | USDC issuer G… (not contract C…) |

**Modes**

- **`mock`** (default): No API key. Escrows persisted in browser `localStorage` via mock service. Wallet connect optional for role-gating UX; transactions are simulated.
- **`testnet`**: Full XDR signing via Trustless Work SDK. Requires API key, trustlines, testnet USDC.

### 5. Escrow role mapping (MVP)

| Trustless Work role | Template actor | Wallet |
| --- | --- | --- |
| Creator / Issuer | Agency | Agency G… |
| Funder | Client | Client G… |
| Service Provider / Milestone Marker | Agency | Agency G… |
| Receiver | Agency | Agency G… |
| Approver | Client | Client G… |
| Release Signer | Client | Client G… |
| Platform Address | Trustless Work / platform | Config G… |
| Dispute Resolver | — | Not in MVP |

Per PRD §20 and flow doc §3: **client is both Approver and Release Signer** for MVP.

### 6. Escrow type & milestone model

- **One escrow per milestone** (PRD non-goals, flow doc §11 Model A).
- On-chain: prefer **Single-Release** escrow with **one milestone** in Trustless Work (#11).
- **Revision Requested** is **app-level metadata** only; on-chain state remains `Funded` → milestone status text updates until re-submitted (flow doc §9).

### 7. MVP state machine

Application statuses (canonical strings in code: snake_case):

```
created
  ↓ fund
funded
  ↓ submit milestone
in_review
  ↓ approve                    ↓ request changes
approved                  revision_requested
  ↓ release                         ↓ resubmit
released ──→ closed            in_review (loop)
```

On-chain TW lifecycle maps to these in the integration layer (#11). Dispute/cancel/refund states are **out of scope**.

---

## Tech stack & dependencies

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 App Router, React 19, TypeScript strict |
| Styling | Tailwind CSS v4, shadcn/ui, light/dark |
| Data fetching | TanStack Query |
| Forms | react-hook-form, zod, `@hookform/resolvers/zod` |
| Notifications | sonner |
| Escrow | `@trustless-work/escrow` (+ optional `@trustless-work/blocks`) |
| Wallet | `@stellar/stellar-wallets-kit` (Freighter, testnet) |
| Package manager | pnpm 9+, Node 20+ |

**Bootstrap commands (after #2)**

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build
pnpm lint
pnpm typecheck
```

---

## Target repository structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                          # landing / redirect to dashboard
│   ├── agency/
│   │   ├── page.tsx                      # agency dashboard
│   │   └── create/page.tsx               # create escrow
│   └── escrow/
│       └── [escrowId]/
│           ├── page.tsx                  # shared viewer
│           ├── fund/page.tsx             # client funding
│           ├── review/page.tsx           # client approve / request changes
│           └── release/page.tsx          # client release
├── components/ui/                        # shadcn
├── features/escrow/
│   ├── components/
│   ├── views/
│   ├── hooks/
│   ├── schemas/
│   ├── services/
│   │   ├── escrow.service.ts             # facade
│   │   ├── mock-escrow.service.ts
│   │   └── trustless-escrow.service.ts
│   └── utils/
├── lib/
│   ├── env.ts
│   ├── query-client.ts
│   └── providers/
└── types/
    └── agency-escrow.ts
```

---

## Issue dependency graph

```
#1 Foundation & feature scaffold
    │
    ▼
#2 Toolchain, shadcn & app providers
    │
    ├────────────────────┐
    ▼                    ▼
#3 Domain model      #4 Mock escrow service
    │                    │
    └─────────┬──────────┘
              ▼
#5 Agency: create escrow + dashboard
              │
              ▼
#6 Shared: escrow viewer & timeline
              │
      ┌───────┴───────┐
      ▼               ▼
#7 Client: fund   #8 Agency: submit milestone
      │               │
      └───────┬───────┘
              ▼
#9 Client: approve & request changes
              │
              ▼
#10 Client: release funds (mock)
              │
              ▼
#11 Trustless Work testnet integration
              │
              ▼
#12 Should-have polish & contributor docs
```

---

## Issue creation order

### Phase sequence

| Phase | Issue ID | Size | Outcome (verifiable in one sentence) |
| --- | --- | --- | --- |
| P1 | #1 | M | App runs with `src/features/escrow` scaffold, shared types, and route stubs |
| P2 | #2 | L | shadcn, TanStack Query, theme, provider shell, responsive app layout |
| P3 | #3 | M | `AgencyEscrow` types, Zod schemas, status machine + role guard utils |
| P4 | #4 | L | Mock escrow CRUD, timeline events, `localStorage` persistence, service facade |
| P5 | #5 | L | Agency creates one-milestone escrow, preview, funding link, dashboard list |
| P6 | #6 | M | Public escrow viewer shows status, parties, milestone, activity timeline |
| P7 | #7 | L | Client reviews and funds escrow (mock); wallet connect + role hints |
| P8 | #8 | M | Agency submits milestone with delivery summary and links → `in_review` |
| P9 | #9 | L | Client approves or requests changes; revision loop back to submit |
| P10 | #10 | L | Client releases funds (mock); fee breakdown; status → `released`/`closed` |
| P11 | #11 | XL | Replace mock with TW SDK on testnet for create/fund/submit/approve/release |
| P12 | #12 | M | Should-haves: copy link, wallet role validation UX, README dogfood path |

### Milestones

| Milestone | Issues | Demo result |
| --- | --- | --- |
| **M1 — Foundation** | #1, #2 | App boots with design system, providers, empty agency route |
| **M2 — Domain + mock I/O** | #3, #4 | Can seed/read escrows via mock service in dev |
| **M3 — Agency create** | #5, #6 | Agency creates escrow; anyone opens viewer by link |
| **M4 — Full mock lifecycle** | #7, #8, #9, #10 | End-to-end mock: fund → submit → approve → release without API key |
| **M5 — Testnet** | #11 | Same flow on Stellar testnet with real XDR signing |
| **M6 — OSS ready** | #12 | README + polish for external contributors and dogfooding |

### Agent prompt snippet

```
Create 12 GitHub issues from docs/BUILD-PLAN.md in order #1 → #12.
Each issue represents 1–4 days of work. Use the issue template at the bottom of BUILD-PLAN.md.
Set GitHub "Blocked by" to the prior issue numbers once created.
BUILD-PLAN IDs (#1, #2, …) are logical IDs; GitHub issue numbers may differ — always include BUILD-PLAN ID in the issue body.
Apply labels from the "Suggested GitHub labels" section.
Do not create testnet integration issues before mock lifecycle (#10) is defined.
```

---

# Issue backlog

---

## Issue #1 — Scaffold feature folders, routes, and shared types

| | |
| --- | --- |
| **Epic** | setup |
| **Effort** | M (1–2 days) |
| **Labels** | `epic:setup`, `priority:must-have`, `size:M`, `help wanted` |
| **Blocked by** | — |
| **Blocks** | #2, #3 |

### Summary

Establish the vertical-slice folder structure under `src/features/escrow`, add thin App Router stubs for agency and escrow routes, and define the core `AgencyEscrow` TypeScript types aligned with PRD §13. The app must build and serve placeholder pages.

### Scope

**In scope**

- Create `src/features/escrow/` subfolders: `components/`, `views/`, `hooks/`, `schemas/`, `services/`, `utils/`
- Add `src/types/agency-escrow.ts` (or feature-local equivalent) with PRD data model
- Route stubs: `/`, `/agency`, `/agency/create`, `/escrow/[escrowId]`, `/escrow/[escrowId]/fund`, `/review`, `/release`
- Path alias `@/` verified in `tsconfig.json`
- Minimal landing page explaining template purpose + link to agency dashboard

**Out of scope**

- shadcn, providers, forms (#2)
- Zod schemas and state machine logic (#3)
- Any escrow persistence (#4)

### Tasks

- [ ] Create feature folder tree per FOLDER_LAYOUT.mdc
- [ ] Add `AgencyEscrow`, status union, roles, fee, timestamps types
- [ ] Wire App Router pages that render placeholder `views/` components
- [ ] Ensure `pnpm build`, `pnpm lint`, `pnpm typecheck` pass

### Acceptance criteria

- [ ] Navigating `/agency` and `/escrow/test-id` renders without error
- [ ] Types match PRD §13 fields (client, agency, milestone, roles, fee, status, timestamps)
- [ ] No business logic in route files — only imports from `features/escrow/views/`

### Definition of done

- Repo has a clear feature-slice skeleton; next issue can add UI primitives and providers without restructuring.

### Files (expected)

- `src/types/agency-escrow.ts`
- `src/features/escrow/views/**`
- `src/app/agency/**`, `src/app/escrow/**`
- `src/app/page.tsx`

### References

- PRD §12–13, flow doc §13–14

---

## Issue #2 — Toolchain, shadcn UI, and global providers

| | |
| --- | --- |
| **Epic** | setup |
| **Effort** | L (2–3 days) |
| **Labels** | `epic:setup`, `priority:must-have`, `size:L` |
| **Blocked by** | #1 |
| **Blocks** | #5, #6, #7 |

### Summary

Initialize shadcn/ui, app-wide layout (header, theme toggle), TanStack Query, and provider shells for wallet and Trustless Work. Delivers a polished empty shell ready for forms and actions.

### Scope

**In scope**

- shadcn init + core components: Button, Card, Input, Label, Form, Badge, Skeleton, Sonner toast
- `ThemeProvider` with light/dark support
- `QueryClientProvider` in root layout
- Stub `WalletProvider` and `TrustlessWorkProvider` (no-op or mock context)
- Responsive app shell: header with nav (Agency dashboard, docs link)
- Extend `.env.local.example` with mode/network placeholders

**Out of scope**

- Real wallet kit wiring (#7, #11)
- Real TW SDK initialization (#11)
- Feature forms (#5+)

### Tasks

- [ ] Run shadcn init aligned with project Tailwind v4 setup
- [ ] Add providers under `src/lib/providers/`
- [ ] Build `AppShell` layout component used by agency/escrow views
- [ ] Add sonner Toaster to root layout
- [ ] Document new env vars in `.env.local.example`

### Acceptance criteria

- [ ] Theme toggle works; UI readable in light and dark
- [ ] Layout responsive from mobile through `xl` breakpoints
- [ ] `pnpm dev` shows shell on `/agency` with no hydration errors
- [ ] Query devtools optional; QueryClient available to hooks

### Definition of done

- Design system and provider nesting are stable; feature issues only add domain UI inside the shell.

### Files (expected)

- `src/components/ui/**`
- `src/lib/providers/**`, `src/lib/query-client.ts`, `src/lib/env.ts`
- `src/app/layout.tsx`, `src/app/globals.css`
- `.env.local.example`

### References

- DAPP.mdc (UI, TanStack Query, shadcn)
- Trustless Work skill — provider nesting

---

## Issue #3 — Domain schemas, status machine, and role guards

| | |
| --- | --- |
| **Epic** | domain |
| **Effort** | M (1–2 days) |
| **Labels** | `epic:domain`, `priority:must-have`, `size:M` |
| **Blocked by** | #1 |
| **Blocks** | #4, #5, #8, #9, #10 |

### Summary

Implement Zod schemas for create/submit/review/release forms, pure functions for valid status transitions, and wallet role guards so UI can disable actions consistently.

### Scope

**In scope**

- `createEscrowSchema`, `submitMilestoneSchema`, `requestChangesSchema`, `releaseFundsSchema`
- `canTransition(from, to)` and `getAvailableActions(status, connectedWallet, roles)`
- Fee calculation helper: gross, platform fee bps, net to agency
- Stellar G-address validation (basic format)
- Unit-testable pure utils (tests optional unless requested)

**Out of scope**

- Persistence (#4)
- Form components (#5+)
- On-chain TW status mapping (#11)

### Tasks

- [ ] Add schemas under `src/features/escrow/schemas/`
- [ ] Implement `escrow-status.ts` with MVP transitions including `revision_requested`
- [ ] Implement `role-guards.ts` per flow doc §15
- [ ] Implement `fee.ts` for release preview

### Acceptance criteria

- [ ] Invalid transitions (e.g. `created` → `approved`) return false
- [ ] Agency cannot approve; client cannot submit milestone (guard functions)
- [ ] Create schema rejects missing client wallet, amount, milestone title
- [ ] Fee math matches flow doc §8 example (1,250 USDC @ 0.3%)

### Definition of done

- Hooks and services import guards/schemas without duplicating business rules.

### Files (expected)

- `src/features/escrow/schemas/**`
- `src/features/escrow/utils/escrow-status.ts`
- `src/features/escrow/utils/role-guards.ts`
- `src/features/escrow/utils/fee.ts`

### References

- PRD §9.1–9.6, §11; flow doc §12, §15
- FORMS.mdc

---

## Issue #4 — Mock escrow service and activity timeline

| | |
| --- | --- |
| **Epic** | domain |
| **Effort** | L (2–3 days) |
| **Labels** | `epic:domain`, `priority:must-have`, `size:L` |
| **Blocked by** | #3 |
| **Blocks** | #5, #6, #7, #8, #9, #10 |

### Summary

Build a mock escrow service with CRUD, lifecycle mutations, and append-only event timeline persisted in `localStorage`. Expose a single facade selected by `NEXT_PUBLIC_ESCROW_MODE=mock`.

### Scope

**In scope**

- Methods: `createAgencyEscrow`, `getAgencyEscrow`, `listAgencyEscrows`, `fundEscrow`, `submitMilestone`, `approveMilestone`, `requestChanges`, `releaseFunds`, `getEscrowEvents`
- Generate `escrowId` and shareable paths (`/escrow/[id]/fund`, etc.)
- Timeline events: created, funded, submitted, revision_requested, approved, released
- TanStack Query keys + mutation hooks wrapping the service
- Seed/dev helper to reset mock store (document in README snippet)

**Out of scope**

- Real HTTP or TW API (#11)
- UI screens (#5–#10)

### Tasks

- [ ] Implement `mock-escrow.service.ts` with localStorage namespace
- [ ] Implement `escrow.service.ts` facade reading `env.escrowMode`
- [ ] Add hooks: `useEscrow`, `useEscrowList`, `useEscrowMutations`
- [ ] Append events on each transition with ISO timestamps

### Acceptance criteria

- [ ] Creating an escrow via service returns `status: created` and a funding URL
- [ ] Full mock lifecycle mutates status correctly through `closed`
- [ ] `getEscrowEvents` returns ordered timeline for viewer
- [ ] Refreshing browser preserves escrows in mock mode

### Definition of done

- All user-flow issues (#5–#10) can call the facade without knowing mock vs real implementation.

### Files (expected)

- `src/features/escrow/services/mock-escrow.service.ts`
- `src/features/escrow/services/escrow.service.ts`
- `src/features/escrow/hooks/useEscrow*.ts`
- `src/lib/env.ts` (mode flag)

### References

- PRD §14.1; flow doc §14

---

## Issue #5 — Agency: create escrow, preview, and dashboard

| | |
| --- | --- |
| **Epic** | agency |
| **Effort** | L (2–3 days) |
| **Labels** | `epic:agency`, `priority:must-have`, `size:L`, `help wanted` |
| **Blocked by** | #2, #4 |
| **Blocks** | #6, #8 |

### Summary

Agency can fill the create-escrow form (PRD §9.1), preview configuration, submit to create a one-milestone escrow, copy the client funding link, and see escrows on the agency dashboard.

### Scope

**In scope**

- Create escrow form sections: client, agency, milestone, payment, fee (PRD §12.1)
- Preview step before submit
- Auto-assign roles: client = funder/approver/releaseSigner; agency = receiver/milestoneMarker/creator
- Dashboard table (md+) and card list (mobile) with status badges and CTAs
- Copy-to-clipboard funding link
- Form hook + component per FORMS.mdc

**Out of scope**

- Client funding UI (#7)
- Wallet connect on create (agency wallet is typed address for MVP)
- Testnet create (#11)

### Tasks

- [ ] `useCreateEscrow` hook with `createEscrowSchema`
- [ ] `CreateEscrowForm`, `CreateEscrowPreview` components
- [ ] `AgencyDashboardView` with responsive list/table
- [ ] Post-create success state with share link

### Acceptance criteria

- [ ] Given valid fields, escrow is created with status `created` (PRD §9.1)
- [ ] Given missing required fields, inline validation errors show
- [ ] Dashboard lists escrows with client name, milestone title, amount, asset, status
- [ ] Funding link opens `/escrow/[id]/fund` route

### Definition of done

- Agency can initiate Flow A (flow doc §4) end-to-end in mock mode.

### Files (expected)

- `src/features/escrow/components/CreateEscrowForm.tsx`
- `src/features/escrow/hooks/useCreateEscrow.ts`
- `src/features/escrow/views/AgencyDashboardView.tsx`, `CreateEscrowView.tsx`
- `src/app/agency/page.tsx`, `src/app/agency/create/page.tsx`

### References

- PRD §9.1, §12.1; flow doc Flow A, §4

---

## Issue #6 — Shared escrow viewer and activity timeline

| | |
| --- | --- |
| **Epic** | shared |
| **Effort** | M (1–2 days) |
| **Labels** | `epic:shared`, `priority:must-have`, `size:M` |
| **Blocked by** | #5 |
| **Blocks** | #7, #9, #10 |

### Summary

Public escrow detail page shows milestone terms, parties, roles, platform fee, current status, and chronological activity timeline. Serves as the hub for status-specific CTAs (fund, submit, review, release).

### Scope

**In scope**

- `EscrowDetailView` / viewer components: summary, role breakdown, fee display
- Activity timeline from `getEscrowEvents`
- Status badge component mapped to MVP statuses
- Role-aware CTA slot (links to fund/review/release/submit routes when applicable)
- Loading and not-found states

**Out of scope**

- Action forms on sub-routes (#7–#10)
- Transaction hashes from chain (#11)

### Tasks

- [ ] Build viewer layout responsive mobile-first
- [ ] `EscrowTimeline` component
- [ ] `EscrowStatusBadge`, `EscrowPartiesCard`, `MilestoneSummaryCard`
- [ ] Wire `/escrow/[escrowId]/page.tsx`

### Acceptance criteria

- [ ] Opening `/escrow/[id]` shows all fields from PRD §9.7
- [ ] Timeline shows at least created event after #5 create
- [ ] CTAs hidden or disabled when action not allowed by status/role guards
- [ ] Works for both agency and client personas (read-only)

### Definition of done

- Single shareable URL communicates escrow state to both parties.

### Files (expected)

- `src/features/escrow/components/EscrowTimeline.tsx`
- `src/features/escrow/views/EscrowDetailView.tsx`
- `src/app/escrow/[escrowId]/page.tsx`

### References

- PRD §9.2, §9.7, §12.3; flow doc §13

---

## Issue #7 — Client: review and fund escrow (mock)

| | |
| --- | --- |
| **Epic** | client |
| **Effort** | L (2–3 days) |
| **Labels** | `epic:client`, `priority:must-have`, `size:L`, `help wanted` |
| **Blocked by** | #2, #4, #6 |
| **Blocks** | #8, #11 |

### Summary

Client opens the funding link, reviews milestone agreement, connects wallet (Stellar Wallets Kit shell), and funds the escrow in mock mode. Funding CTA disabled when already funded.

### Scope

**In scope**

- `ClientFundingView` with PRD §9.2 fields
- Wallet connect button + display connected address
- Soft warning if connected wallet ≠ configured funder (configurable strictness off by default per PRD §19 Q1)
- Mock `fundEscrow` mutation → status `funded`
- Trustline reminder copy ( informational for mock; required before #11)

**Out of scope**

- Real XDR funding (#11)
- Email notifications

### Tasks

- [ ] Integrate Stellar Wallets Kit provider (testnet network config)
- [ ] `useFundEscrow` hook + fund panel component
- [ ] Disable fund CTA when status ≠ `created`
- [ ] Success toast + redirect to viewer

### Acceptance criteria

- [ ] Client sees milestone summary, amount, agency receiver, platform fee (PRD §9.2)
- [ ] Mock fund transitions status to `funded` with timeline event
- [ ] Already-funded escrow shows status instead of fund CTA
- [ ] Insufficient balance message stubbed for real mode compatibility

### Definition of done

- Flow B (flow doc §5) complete in mock mode.

### Files (expected)

- `src/features/escrow/views/ClientFundingView.tsx`
- `src/features/escrow/hooks/useFundEscrow.ts`
- `src/lib/providers/wallet-provider.tsx`
- `src/app/escrow/[escrowId]/fund/page.tsx`

### References

- PRD §9.3; flow doc Flow B, §5

---

## Issue #8 — Agency: submit milestone

| | |
| --- | --- |
| **Epic** | agency |
| **Effort** | M (1–2 days) |
| **Labels** | `epic:agency`, `priority:must-have`, `size:M` |
| **Blocked by** | #5, #7 |
| **Blocks** | #9 |

### Summary

Agency submits delivery summary, optional deliverable links, and notes when escrow is funded (or `revision_requested`). Status moves to `in_review`.

### Scope

**In scope**

- Submit form (PRD §9.4, flow doc §6)
- Role guard: only milestone marker wallet can submit
- Allow resubmit from `revision_requested` → `in_review`
- Link list input (URLs)
- CTA from dashboard and escrow viewer

**Out of scope**

- Client review actions (#9)
- On-chain milestone status text (#11)

### Tasks

- [ ] `useSubmitMilestone` + `SubmitMilestoneForm`
- [ ] `SubmitMilestoneView` route or modal from dashboard
- [ ] Validation via `submitMilestoneSchema`

### Acceptance criteria

- [ ] Submit blocked when status is `created` or `approved`
- [ ] Successful submit sets `in_review` and timeline event
- [ ] Client can see delivery summary on viewer (read-only until #9)

### Definition of done

- Flow C (flow doc §6) complete in mock mode.

### Files (expected)

- `src/features/escrow/components/SubmitMilestoneForm.tsx`
- `src/features/escrow/hooks/useSubmitMilestone.ts`
- `src/features/escrow/views/SubmitMilestoneView.tsx`

### References

- PRD §9.4; flow doc Flow C, §6

---

## Issue #9 — Client: approve milestone and request changes

| | |
| --- | --- |
| **Epic** | client |
| **Effort** | L (2–3 days) |
| **Labels** | `epic:client`, `priority:must-have`, `size:L` |
| **Blocked by** | #6, #8 |
| **Blocks** | #10 |

### Summary

Client reviews submission, approves milestone, or requests changes with revision notes. Implements revision loop as app metadata (flow doc §9).

### Scope

**In scope**

- Review page: original milestone + delivery content (PRD §9.5)
- Approve → `approved`
- Request changes → `revision_requested` + store `revisionNotes`
- Role guard: approver wallet only
- Agency sees revision notes on dashboard/viewer

**Out of scope**

- Release funds (#10)
- Dispute flow (PRD non-goals)

### Tasks

- [ ] `ClientReviewView` with approve / request changes actions
- [ ] `useApproveMilestone`, `useRequestChanges` hooks
- [ ] Revision notes display on agency side

### Acceptance criteria

- [ ] Approve only when `in_review` and approver wallet connected
- [ ] Request changes stores notes and sets `revision_requested`
- [ ] Resubmit from agency returns to `in_review` (#8 integration)
- [ ] Non-approver blocked from approve action

### Definition of done

- Flows D + F (flow doc §7, §9) work in mock mode excluding release.

### Files (expected)

- `src/features/escrow/views/ClientReviewView.tsx`
- `src/features/escrow/hooks/useApproveMilestone.ts`, `useRequestChanges.ts`
- `src/app/escrow/[escrowId]/review/page.tsx`

### References

- PRD §9.5, §11.2; flow doc Flow D, Flow F

---

## Issue #10 — Client: release funds (mock) and close escrow

| | |
| --- | --- |
| **Epic** | client |
| **Effort** | L (2–3 days) |
| **Labels** | `epic:client`, `priority:must-have`, `size:L` |
| **Blocked by** | #9 |
| **Blocks** | #11, #12 |

### Summary

After approval, release signer releases funds in mock mode with transparent fee breakdown; escrow reaches `released` then `closed`. Completes the MVP mock demo without API key.

### Scope

**In scope**

- Release screen: gross, platform fee, net, receiver address (PRD §9.6, §12.2)
- Mock `releaseFunds` mutation
- Role guard: release signer only
- Release blocked unless `approved`
- Timeline events for release/close

**Out of scope**

- Real fee routing on-chain (#11)
- Combined approve+release single action (keep separate per PRD §19 Q2 recommendation: two steps for MVP)

### Tasks

- [ ] `ClientReleaseView` + `useReleaseFunds`
- [ ] Fee preview using `fee.ts`
- [ ] Post-release success state on viewer

### Acceptance criteria

- [ ] Release blocked when status ≠ `approved`
- [ ] Successful release shows net to agency and platform fee amounts
- [ ] Status ends at `released` or `closed` with timeline complete
- [ ] Full mock lifecycle demoable in under 5 minutes

### Definition of done

- PRD §23 MVP success criteria 1–7 achievable in mock mode; #11 adds criterion 6 on-chain.

### Files (expected)

- `src/features/escrow/views/ClientReleaseView.tsx`
- `src/features/escrow/hooks/useReleaseFunds.ts`
- `src/app/escrow/[escrowId]/release/page.tsx`

### References

- PRD §9.6, §23; flow doc Flow E, §8

---

## Issue #11 — Trustless Work testnet integration

| | |
| --- | --- |
| **Epic** | integration |
| **Effort** | XL (3–5 days) |
| **Labels** | `epic:integration`, `priority:must-have`, `size:XL` |
| **Blocked by** | #10 |
| **Blocks** | #12 |

### Summary

Implement `trustless-escrow.service.ts` using `@trustless-work/escrow` (and Blocks where appropriate) for create, fund, change milestone status, approve, and release on Stellar testnet. Switch facade when `NEXT_PUBLIC_ESCROW_MODE=testnet`.

### Scope

**In scope**

- TW provider with API key from env
- Single-Release escrow, **one milestone**, USDC testnet asset
- Map template roles → TW roles (skill: serviceProvider, approver, releaseSigner, receiver, platformAddress)
- XDR sign-and-submit pattern for funder, service provider, approver, release signer
- Trustline check UX before fund
- Persist `engagementId` / contract refs on `AgencyEscrow`
- Transaction references on viewer when available
- README section: testnet setup, Freighter, faucet, trustline

**Out of scope**

- Mainnet deployment
- Multi-milestone contract
- Dispute resolver
- Email notifications

### Tasks

- [ ] Add `@trustless-work/escrow` (+ blocks if adopted) dependencies
- [ ] Implement `trustless-escrow.service.ts` mirroring mock method signatures
- [ ] Wire facade mode switch + env validation
- [ ] Map app statuses ↔ on-chain flags/milestone state
- [ ] Error handling for TW API failures with user-visible messages
- [ ] Manual test checklist in PR description

### Acceptance criteria

- [ ] With `NEXT_PUBLIC_ESCROW_MODE=testnet` and valid API key, agency creates on-chain escrow
- [ ] Client funds with connected Freighter on testnet
- [ ] Agency updates milestone status / submission reflected on-chain
- [ ] Client approves and releases; agency net and platform fee match configuration
- [ ] Mock mode still works when env mode unset or `mock`

### Definition of done

- Dogfood-ready testnet path documented; template satisfies PRD §23 on testnet.

### Files (expected)

- `src/features/escrow/services/trustless-escrow.service.ts`
- `src/lib/providers/trustless-work-provider.tsx`
- `package.json`, `.env.local.example`, `README.md` (testnet section)

### References

- PRD §10, §14; flow doc §2–3, §15
- `.agents/skills/trustless-work/SKILL.md`, `sdk.md`, `api.md`

---

## Issue #12 — Should-have polish and OSS contributor readiness

| | |
| --- | --- |
| **Epic** | docs |
| **Effort** | M (1–2 days) |
| **Labels** | `epic:docs`, `priority:should-have`, `size:M`, `help wanted` |
| **Blocked by** | #11 |
| **Blocks** | — |

### Summary

Close PRD §15.2 should-haves that fit MVP: copy/share link polish, wallet role validation UX, deliverable links UX, basic dashboard filters. Update README with BUILD-PLAN link and contributor workflow.

### Scope

**In scope**

- Enforce wallet role mismatch warnings on all gated actions
- Dashboard filter by status (created, funded, in review, …)
- Improve empty states and error boundaries on escrow routes
- README: link to `docs/BUILD-PLAN.md`, mock vs testnet, issue claiming
- Optional: combine approve+release UX hint (still two txs if separate on-chain)

**Out of scope**

- Email notifications (PRD should-have — defer v2)
- Multi-milestone, disputes, PDF export (PRD nice-to-have / non-goals)

### Tasks

- [ ] Audit all actions for `role-guards` consistency
- [ ] Add status filter to agency dashboard
- [ ] README contributor section + BUILD-PLAN reference
- [ ] Light accessibility pass on primary CTAs

### Acceptance criteria

- [ ] Wrong wallet shows clear blocked state on fund/submit/approve/release
- [ ] README documents how to pick an issue and run mock vs testnet
- [ ] No must-have regressions from #1–#11

### Definition of done

- Template is approachable for OSS contributors and Tech Rebel dogfooding (PRD §17).

### Files (expected)

- `README.md`, `docs/BUILD-PLAN.md` (footer date)
- `src/features/escrow/views/AgencyDashboardView.tsx`
- Various action components (minor UX)

### References

- PRD §15.2, §17, §22; flow doc §16 should-have

---

# MVP completion checklist

Maps PRD §23 / flow doc §16 must-haves to issues.

| # | Criterion | Issues |
| --- | --- | --- |
| 1 | Contributor can clone, install, and run the app | #1, #2 |
| 2 | Agency creates one-milestone escrow with roles and fee | #3, #4, #5 |
| 3 | Client receives funding link and reviews terms | #5, #6, #7 |
| 4 | Client funds escrow (mock; testnet in #11) | #7, #11 |
| 5 | Agency submits milestone with delivery proof | #8 |
| 6 | Client approves or requests changes | #9 |
| 7 | Client releases funds; platform fee shown | #10, #11 |
| 8 | Both parties view status and activity timeline | #6 |
| 9 | Flow demoable without API key (mock mode) | #4, #10 |
| 10 | Flow runnable on Stellar testnet | #11 |
| 11 | OSS issue backlog and architecture documented | This doc, #12 |

---

# Out of scope

Explicitly **not** in this backlog (see PRD §5, §15.3, flow doc §10–11, §16 nice-to-have):

- Multi-milestone single contract (Flow H Model B)
- Dispute resolution, resolver role, partial release, refund flows
- Legal contracts, e-signatures, PDF agreement export
- Fiat on-ramp, subscriptions, recurring billing
- CRM, accounting, email notification system
- Team permissions, multisig, DAO approvals
- Client dashboard (agency dashboard only in MVP; client uses direct links)
- Mainnet production deployment and regulated compliance workflow

---

# Creating a GitHub issue (template)

Copy into each new GitHub issue:

```markdown
## Summary
[1–2 sentences: deliverable and why it matters for the next step]

## BUILD-PLAN ID
Issue #N

## Effort
size:M | size:L | size:XL — [N days estimate]

## Epic
[epic:setup | epic:domain | epic:agency | epic:client | epic:shared | epic:integration | epic:docs]

## Dependencies
- Blocked by: #[GitHub issue numbers]
- Blocks: #[GitHub issue numbers]

## Scope
### In scope
- ...

### Out of scope
- ... (reference other BUILD-PLAN issues)

## Tasks
- [ ] ...

## Acceptance criteria
- [ ] ...

## Definition of done
- ...

## Files (expected)
- `paths/**`

## References
- docs/BUILD-PLAN.md — Issue #N
- docs/PRD.md — §X
- docs/FULL-USER-FLOW_ESCROW-ROLE-MAPPING.md — §X / Flow X
```

**Important:** BUILD-PLAN ID (`#1`, `#2`, …) ≠ GitHub issue number. Always include BUILD-PLAN ID in the issue body for traceability.

---

**Last updated:** 2026-06-13 — Initial BUILD-PLAN: 12 issues (mock-first lifecycle #1–#10, testnet #11, polish #12), M/L/XL sizing, agency escrow MVP aligned with PRD and flow doc.
