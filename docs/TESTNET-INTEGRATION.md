# Trustless Work testnet integration (#20)

This document is the reference and evidence template for the real testnet
runtime behind the Agency Escrow application hooks. It covers the architecture,
the app→Trustless Work mapping, the on-chain/derived/local field map, the
two-wallet runbook, the execution evidence matrices, negative tests, the API-key
decision, SDK friction, and follow-ups.

---

## 1. Architecture

Screens never see Trustless Work payloads, XDR, Soroban, signing, or transport.
They call the same application hooks in both modes; the hooks pick the runtime.

```
Lifecycle screens  (unchanged — no SDK imports)
      │
      ▼
application hooks   src/features/escrow/hooks/{use-escrow-actions,use-escrow-queries}.ts
      │  mock ───────────────► mock singleton service  (default contributor mode)
      │  testnet ────────────► useTestnetEscrowRuntime()   ← React/SDK orchestration
      ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ testnet runtime (React context)                              │
   │   payload mapping   tw-mappers.ts        (pure, unit-tested)  │
   │   wallet signing    lib/wallet-provider  (Stellar Wallets Kit)│
   │   TW SDK hooks      @trustless-work/escrow/hooks              │
   │   preflight         stellar-preflight.ts (Horizon)           │
   │   local metadata    metadata-store.ts    (app-only fields)    │
   │   confirm/retry     retry.ts (bounded poll + backoff)         │
   └─────────────────────────────────────────────────────────────┘
```

Why this seam: the Trustless Work SDK write/read APIs are **React hooks**, so
they must run inside React context and cannot live in a plain singleton service.
The runtime hook owns the SDK; the pure mappers own translation; the mock
service is untouched. Both modes return the stable `AgencyEscrow` model, so the
screen layer is identical.

Key files:

| Concern | File |
| --- | --- |
| Runtime mode + fail-fast config + network SoT | `src/features/escrow/config/escrow-config.ts` |
| App→TW payload mapping, fee conversion, TW→AgencyEscrow, status derivation | `src/features/escrow/services/testnet/tw-mappers.ts` |
| Local app-only metadata (paymentDirection, names, notes, timestamps, tx refs) | `src/features/escrow/services/testnet/metadata-store.ts` |
| Trustline + balance pre-flight (Horizon) | `src/features/escrow/services/testnet/stellar-preflight.ts` |
| Bounded retry + indexer confirmation polling | `src/features/escrow/services/testnet/retry.ts` |
| Typed, user-safe errors | `src/features/escrow/services/testnet/errors.ts` |
| Orchestration (get XDR → verify actor → sign → submit → confirm) | `src/features/escrow/hooks/testnet/use-testnet-escrow-runtime.ts` |
| Wallet actor selection (connect/switch/disconnect) | `src/features/escrow/components/wallet/WalletActorBar.tsx` |

---

## 2. Non-custodial write contract

Every real write goes through this exact sequence in the runtime hook:

1. Build the TW payload from the app model (pure mapper).
2. Call the TW write hook → receive `unsignedTransaction`.
3. **Verify the connected wallet is the required actor** (role gate) — before signing.
4. Sign the XDR client-side with that wallet (Stellar Wallets Kit).
5. Submit the signed XDR with `useSendTransaction`.
6. **Confirm** the expected state by polling the indexer (bounded), then update
   TanStack Query.

A write is not treated as complete on an unsigned XDR or a signature alone. If
the indexer does not reflect the expected state within the bounded budget, an
`IndexerTimeoutError` is raised instead of advancing to a false optimistic state.

Trustlines are never created through Trustless Work (`/helper/set-trustline` is
removed). Participants add the USDC trustline from their own wallet. We pre-flight
funder readiness before funding and receiver readiness before release.

---

## 3. App → Trustless Work operation mapping (Single-Release, 1 milestone)

| App hook | TW hook (`type: "single-release"`) | Signer (role) | Notable payload |
| --- | --- | --- | --- |
| `useCreateProtectedPayment` | `useInitializeEscrow().deployEscrow` | issuer = `workspace.walletAddress` | `amount` number, `platformFee` percent, `roles` derived, `receiver` in roles, `trustline {address: G-issuer, symbol: "USDC"}`, exactly 1 milestone |
| `useFundProtectedPayment` | `useFundEscrow().fundEscrow` | derived funder (payer) | `amount` **number** (not string), `contractId`, `signer` |
| `useSubmitDeliverable` | `useChangeMilestoneStatus().changeMilestoneStatus` | derived service provider (payee) | `milestoneIndex "0"`, `newStatus "Under Review"`, `newEvidence` mapped when available |
| `useReviewDeliverable().requestChanges` | none (app metadata) | derived approver (payer) | local-only; pre-approval; not an on-chain un-approve |
| `useReviewDeliverable().approve` | `useApproveMilestone().approveMilestone` | derived approver (payer) | `milestoneIndex "0"`; irreversible; does not pay |
| `useReleaseProtectedPayment` | `useReleaseFunds().releaseFunds` | derived release signer (payer) | `contractId`, `releaseSigner`; final payout |
| `useAgencyEscrows` / `useAgencyEscrow` / `useEscrowActivity` | `useGetEscrowsFromIndexerBySigner` / `useGetEscrowFromIndexerByContractIds` | — (reads need no key) | mapped to `AgencyEscrow` |

### Fee conversion (critical)

Application fee is **basis points**; TW `platformFee` is a **percentage number**.

```
feePercentFromBps(30)  === 0.3     // 30 bps  = 0.30%
feePercentFromBps(250) === 2.5     // 250 bps = 2.5%
```

Passing `30` to TW would charge 30%. Covered by an assertion in
`tw-mappers.test.ts`.

### Role derivation (both directions)

Roles are derived from payment direction via `deriveAgencyEscrowRoles`, never
hand-configured in the UI.

| Concept | Receivable | Payable |
| --- | --- | --- |
| issuer (deploy signer) | workspace (A) | workspace (A) |
| funder / approver / releaseSigner (payer) | counterparty (B) | workspace (A) |
| serviceProvider / receiver (payee) | workspace (A) | counterparty (B) |

---

## 4. Field provenance map (on-chain vs derived vs local)

The `AgencyEscrow` model is intentionally richer than on-chain state. Each field
is one of: **on-chain** (TW indexer truth), **derived** (computed from on-chain
+ config), or **local** (app metadata in `localStorage`, per-browser).

| AgencyEscrow field | Source |
| --- | --- |
| `contractId`, `escrowId` | on-chain (contract ID; `escrowId === contractId` in testnet) |
| `engagementId`, `agreement.title`, `agreement.description` | on-chain |
| `payment.amount`, `payment.asset` | on-chain (`amount`, `trustline.symbol`) |
| `fee.platformFeeBps` | derived (`round(platformFee × 100)`), or local if stored |
| `roles.*` (approver/serviceProvider/releaseSigner/receiver/platformAddress/disputeResolver) | on-chain |
| `roles.issuer`, `roles.funder` | derived (issuer = signer; funder = approver/payer) |
| `paymentDirection` | local, else derived (`receiver === issuer ⇒ receivable`) |
| `status` | derived (flags + milestone.approved + milestone.status + balance; `revision_requested` from local) |
| `milestone.description`, `milestone.evidence` | on-chain |
| `workspace/counterparty.walletAddress` | derived from roles |
| `workspace/counterparty.name`/`.email` | local (fallback: shortened address) |
| `agreement.agreementUrl`, `agreement.dueDate` | local |
| `milestone.title`, `milestone.acceptanceCriteria` | local |
| `milestone.deliverySummary`, `milestone.deliverableLinks`, `milestone.revisionNotes` | local |
| `timestamps.*` | local (recorded when each write is performed) |
| `transactions.*` | local (see SDK friction §9 — tx hashes are not surfaced by the SDK send response) |
| activity events | local event log |

**Cross-device limitation:** local fields live in `localStorage` and do not sync
across browsers/devices. On-chain fields are always re-read from the indexer, so
a second device still sees correct amounts, roles, and lifecycle status — it just
shows shortened addresses instead of stored names, and lacks local notes. Real
metadata persistence is out of scope for this issue.

---

## 5. Testnet setup

1. Create two testnet Stellar wallets (A and B) in a browser wallet (Freighter,
   xBull, etc.). Fund both with XLM from friendbot.
2. In **each** wallet, add the testnet **USDC trustline** (Add Asset → USDC with
   the configured G-issuer). Give the payer USDC to fund with (testnet faucet /
   anchor). Trustlines cannot be added through the app.
3. Get a **testnet** Trustless Work API key from https://dapp.trustlesswork.com.
4. Copy `.env.local.example` → `.env.local` and set:
   - `NEXT_PUBLIC_ESCROW_MODE=testnet`
   - `NEXT_PUBLIC_API_KEY=<testnet key>`
   - `NEXT_PUBLIC_USE_MAINNET=false`
   - `NEXT_PUBLIC_PLATFORM_ADDRESS`, `NEXT_PUBLIC_DISPUTE_RESOLVER_ADDRESS` (valid G-addresses)
   - `NEXT_PUBLIC_USDC_ISSUER` (G-issuer of testnet USDC — never a C-address)
5. `pnpm dev`. The testnet actor bar appears at the top; connect wallet A.

Config is validated on first use and fails fast, listing every missing/invalid
value.

---

## 6. Two-wallet runbook

Use the actor bar to switch wallets between steps. The app blocks any action
whose required signer is not the connected wallet (before signing).

### Scenario A — Receivable (A = workspace/payee, B = counterparty/payer)

1. Connect **A** → create escrow at `/agency/create` ("We're getting paid").
2. Verify roles: issuer A; funder B; serviceProvider A; approver B; releaseSigner B; receiver A.
3. Switch to **B** → fund (USDC).
4. Switch to **A** → submit deliverable.
5. Switch to **B** → request changes (app-layer).
6. Switch to **A** → resubmit (status/evidence on-chain).
7. Switch to **B** → approve. Verify **no funds moved** on approval.
8. Still **B** → release. Verify **A** receives net USDC and platform fee routing.

### Scenario B — Payable (A = workspace/payer, B = provider/payee)

1. Connect **A** → create escrow ("We're paying someone").
2. Verify roles: issuer A; funder A; serviceProvider B; approver A; releaseSigner A; receiver B.
3. **A** → fund.
4. Switch to **B** → submit.
5. Switch to **A** → approve. Verify **no funds moved**.
6. Still **A** → release. Verify **B** receives net USDC and platform fee routing.

---

## 7. Execution evidence matrices

> Fill during a real two-wallet run. No secrets / XDR / private keys.

### Scenario A — Receivable

| Step | Expected role | Expected wallet | Actual wallet | Contract ID | Tx reference | Confirmed state |
| --- | --- | --- | --- | --- | --- | --- |
| Create | issuer | A | | | | created |
| Fund | funder | B | | | | funded |
| Submit | serviceProvider | A | | | | in review |
| Approve | approver | B | | | | approved |
| Release | releaseSigner | B | | | | released |

Net receiver (A) USDC delta: ______  Platform fee routed to platform: ______

### Scenario B — Payable

| Step | Expected role | Expected wallet | Actual wallet | Contract ID | Tx reference | Confirmed state |
| --- | --- | --- | --- | --- | --- | --- |
| Create | issuer | A | | | | created |
| Fund | funder | A | | | | funded |
| Submit | serviceProvider | B | | | | in review |
| Approve | approver | A | | | | approved |
| Release | releaseSigner | A | | | | released |

Net receiver (B) USDC delta: ______  Platform fee routed to platform: ______

---

## 8. Negative tests

| Test | Expected behavior | Handled by |
| --- | --- | --- |
| Wrong wallet: fund/submit/approve/release | Blocked before signing with a "switch to the … wallet" message | `assertActor` → `WrongWalletError` |
| Missing funder trustline | "not ready to use testnet USDC — add the USDC trustline" | `assertBalanceAndTrustline` → `MissingTrustlineError` |
| Missing receiver trustline (pre-release) | Same guidance, blocks release | `assertTrustlineReady` |
| Insufficient USDC balance to fund | "needs X USDC but wallet holds Y" | `InsufficientBalanceError` |
| Invalid / missing API key | Config fails fast; write surfaces a key error | `getTestnetConfig` / `ApiKeyError` |
| Rejected wallet signature | "signature was rejected or cancelled" | `SignatureRejectedError` |
| Indexer lag after submit | Bounded polling; `IndexerTimeoutError` instead of false state | `pollUntil` / `confirmState` |
| Rate limit (429) / transient 5xx | Bounded exponential backoff, then surfaced | `withRateLimitRetry` |
| Mainnet requested | Fails fast (out of scope for V1) | `getTestnetConfig` |

> Fill actual results (screenshots / notes) during the run. No sensitive material.

---

## 9. API key exposure decision

**V1 uses the client SDK with a browser-exposed testnet API key**
(`NEXT_PUBLIC_API_KEY`).

Rationale:
- The Trustless Work write APIs are React hooks designed to run in the browser,
  and this is a testnet-only template. The exposed key is a **testnet** key with
  no mainnet value.
- `NEXT_PUBLIC_*` is **not secret** — it is inlined into the client bundle. We do
  not treat it as a secret anywhere, and we never log it.
- Non-custodial signing is unaffected: user-role transactions are always signed
  client-side by the connected wallet. We never sign user-role transactions
  server-side.

Follow-up (out of scope here): for mainnet, proxy writes through a Next.js Route
Handler holding a server-side `TW_API_KEY`, keeping the key off the client. See
§11.

We never log API keys, private keys, or signed/unsigned XDR. Errors are
normalized to safe messages (`toSafeErrorMessage`) before reaching the UI.

---

## 10. Trustless Work SDK / API friction discovered

- **Fee unit**: `platformFee` is a percentage number, not basis points — easy to
  get wrong. Encapsulated + tested in `feePercentFromBps`.
- **`type` argument**: in `@trustless-work/escrow@3.0.5`, every write hook
  (`fund`, `changeMilestoneStatus`, `approve`, `release`) takes
  `(payload, "single-release")`. Some docs/examples show a single argument — the
  installed types are authoritative.
- **`sendTransaction(signedXdr: string)`** takes a plain string, while some docs
  show `{ signedXdr }`. The installed type is a string.
- **Funding amount type**: the bundled skill says fund-escrow amount is a string;
  the installed `FundEscrowPayload.amount` is a **number**, matching the issue's
  authoritative correction. We pass a number.
- **Tx hashes not surfaced**: `SendTransactionResponse` is `{ status, message }`
  with no transaction hash, and deploy returns `contractId` but no hash. We retain
  the contract ID as the durable reference; per-write tx hashes are not available
  from the SDK send response (follow-up §11).
- **No status enum for the indexer read**: lifecycle status is derived from
  `flags`, `milestone.approved`, `milestone.status`, and `balance`.

---

## 11. Follow-up issues

1. Server-side API-key proxy (Route Handler) for mainnet readiness.
2. Persist app metadata in a backend for cross-device parity (replace
   `localStorage`).
3. Surface per-write transaction hashes once the SDK/indexer exposes them
   (populate `transactions.*` and the evidence "Tx reference" column).
4. Optional on-chain `validateOnChain` reads for stronger confirmation.
5. Dispute UI (out of scope here; roles/wiring already present).
