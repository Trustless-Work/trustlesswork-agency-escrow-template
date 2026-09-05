<p align="center"> <img src="https://github.com/user-attachments/assets/5b182044-dceb-41f5-acf0-da22dea7c98a" alt="CLR-S (2)"> </p>

# Trustless Work | Agency Escrow Template

[![Stellar](https://img.shields.io/badge/Network-Stellar%20Testnet-blue.svg)](https://stellar.org)
[![Trustless Work](https://img.shields.io/badge/Escrow-Trustless%20Work%20SDK-purple.svg)](https://docs.trustlesswork.com/trustless-work)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A **single-milestone commercial escrow workflow** for agencies, consultancies, product studios, and independent contractors to lock client retainers upfront, protect a single payment and deliverable, and release payment upon verifiable approval.

> **Agencies stop chasing invoices. Clients only release funds when work is delivered.**

Built on [Trustless Work](https://docs.trustlesswork.com/trustless-work) — Escrow-as-a-Service powered by Soroban smart contracts on Stellar. This template serves as a real, testnet, dogfoodable developer reference implementation that can be immediately forked, adapted, and explored for client engagements.

---

## Table of Contents

- [The Problem & JTBD](#the-problem--product-purpose)
- [Commercial Model: Payable vs Receivable](#commercial-model-payable-vs-receivable)
- [Escrow Lifecycle & State Machine](#escrow-lifecycle--state-machine)
- [Architecture & Trustless Work SDK](#architecture--trustless-work-sdk)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Mock Mode (Default & Credential-Free)](#running-mock-mode-default--credential-free)
  - [Running Testnet Mode (Real Soroban Escrow)](#running-testnet-mode-real-soroban-escrow)
- [Stellar Wallet & Testnet USDC Trustlines](#stellar-wallet--testnet-usdc-trustlines)
- [Local-Only Metadata & Revision Loop](#local-only-metadata--revision-loop)
- [Two Canonical End-to-End Walkthroughs](#two-canonical-end-to-end-walkthroughs)
  - [Scenario 1: Receivable (Agency Gets Paid)](#scenario-1-receivable-agency-gets-paid)
  - [Scenario 2: Payable (Agency Pays Subcontractor)](#scenario-2-payable-agency-pays-subcontractor)
- [V1 Release Readiness & Dogfood Verification Report](#v1-release-readiness--dogfood-verification-report)
- [V1 Scope & Known Boundaries](#v1-scope--known-boundaries)
- [Contributing & Development](#contributing--development)
- [Maintainers](#maintainers)

---

## The Problem & Product Purpose

Agency, studio, and consultancy engagements frequently break down because **delivery, commercial scope, and payments** live in fragmented tools:
- **Clients** hesitate to pay 50% or 100% upfront retainers without guaranteed delivery milestones.
- **Agencies** cannot afford to allocate engineering and design resources on net-30 or net-60 invoices without guaranteed settlement.
- **Escrow dispute risk** creates friction when terms and acceptance criteria are ambiguous.

### Jobs To Be Done (JTBD)
1. **Upfront Commitment**: Lock agreed funds into non-custodial Soroban smart contracts before work starts.
2. **Clear Acceptance Criteria**: Bind each engagement milestone to explicit review criteria and deliverable links.
3. **Structured Review Loop**: Provide an iterative review and revision mechanism prior to irrevocable approval.
4. **Instant Non-Custodial Settlement**: Route payments directly to recipient wallets upon milestone sign-off, automatically deducting platform infrastructure fees.

---

## Commercial Model: Payable vs Receivable

The template natively supports bidirectional commercial flows without hardcoding the agency as strictly payer or payee.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           COMMERCIAL DIRECTION                          │
├───────────────────────────────────┬─────────────────────────────────────┤
│      RECEIVABLE ("We get paid")    │     PAYABLE ("We pay someone")      │
├───────────────────────────────────┼─────────────────────────────────────┤
│ • Agency delivers the service     │ • Agency acts as the client / buyer │
│ • Client deposits & locks funds   │ • Agency deposits & locks funds     │
│ • Client reviews and approves     │ • Subcontractor / vendor delivers   │
│ • Payout routed to Agency wallet  │ • Agency reviews and approves       │
│ • Payer: Client                   │ • Payout routed to Vendor wallet    │
│ • Payee: Agency                   │ • Payer: Agency                     │
│                                   │ • Payee: Contractor / Vendor        │
└───────────────────────────────────┴─────────────────────────────────────┘
```

### Trustless Work V1 Role Mapping

In Trustless Work single-release escrows, roles are derived deterministically based on commercial direction:

| Trustless Work Role | Receivable (Agency Gets Paid) | Payable (Agency Pays Someone) | Description |
| :--- | :--- | :--- | :--- |
| **Creator** | Agency Workspace | Agency Workspace | Signs the escrow initialization transaction. |
| **Funder / Payer** | Client | Agency Workspace | Deposits and locks funds into the Soroban contract. |
| **Service Provider / Marker** | Agency Workspace | Contractor / Vendor | Submits deliverables and marks milestone status. |
| **Approver** | Client | Agency Workspace | Reviews deliverables and signs milestone approval. |
| **Release Signer** | Client | Agency Workspace | Executes the final on-chain fund release. |
| **Receiver / Payee** | Agency Workspace | Contractor / Vendor | Receives net payment upon release execution. |
| **Platform Address** | Platform (`NEXT_PUBLIC_PLATFORM_ADDRESS`) | Platform (`NEXT_PUBLIC_PLATFORM_ADDRESS`) | Receives the configured platform fee (e.g. 0.30% / 30 bps). |
| **Dispute Resolver** | Arbiter (`NEXT_PUBLIC_DISPUTE_RESOLVER_ADDRESS`) | Arbiter (`NEXT_PUBLIC_DISPUTE_RESOLVER_ADDRESS`) | Contract-level configuration address required by Soroban integration (in-app dispute & arbitration UX is out of V1 scope). |

---

## Escrow Lifecycle & State Machine

```mermaid
stateDiagram-v2
    [*] --> Created: Deploy Escrow (Unfunded)
    Created --> Funded: Funder Deposits USDC
    
    state "Work in Progress" as WIP
    Funded --> WIP
    WIP --> Submitted: Service Provider Submits Deliverables
    
    state "Review & Revision Loop" as Review {
        Submitted --> ChangesRequested: Approver Requests Changes
        ChangesRequested --> Resubmitted: Service Provider Updates Deliverables
        Resubmitted --> ChangesRequested: Additional Changes
        Resubmitted --> Approved: Approver Approves Deliverables
        Submitted --> Approved: Approver Approves Deliverables
    }
    
    Approved --> Released: Release Signer Releases Funds
    Released --> [*]: Net USDC -> Receiver / Fee -> Platform
```

### Lifecycle States

1. **`created`**: Escrow is deployed on-chain or initialized in mock store. Balance is zero.
2. **`funded`**: Funder locks full milestone amount. Balance is held securely by the Soroban escrow contract.
3. **`submitted`**: Service provider submits evidence and links. Milestone status moves to `in_review`.
4. **`changes_requested`**: (App-layer pre-approval loop) Approver provides revision feedback; provider remains active to resubmit.
5. **`approved`**: Approver signs milestone acceptance. The approval is **irreversible** on-chain.
6. **`released`**: Release signer triggers release transaction. Escrow transfers net funds to receiver and platform fee to platform address.

---

## Architecture & Trustless Work SDK

The template uses the official `@trustless-work/escrow` SDK hooks and implements a decoupled runtime pattern:

```
src/
├── app/                           # Next.js App Router routes
│   ├── agency/create/             # Unified Escrow Creation (Payable / Receivable)
│   ├── escrow/[escrowId]/         # Escrow Hub & Overview
│   │   ├── fund/                  # Funder Deposit Screen
│   │   ├── submit/                # Deliverable Submission Screen
│   │   ├── review/                # Approval & Revision Screen
│   │   └── release/               # Protected Fund Release Screen
├── features/escrow/
│   ├── components/                # Lifecycle UX & presentation components
│   ├── config/                    # Escrow & network configuration (escrow-config.ts)
│   ├── hooks/                     # Unified queries and action hooks
│   │   ├── testnet/               # use-testnet-escrow-runtime.ts (SDK & Horizon orchestration)
│   │   └── mock/                  # use-mock-escrow-runtime.ts (Credential-free simulation)
│   └── services/testnet/
│       ├── stellar-preflight.ts   # Balance & USDC trustline verification
│       ├── metadata-store.ts      # Local-first metadata & timeline persistence
│       └── tw-mappers.ts          # Trustless Work wire <-> Domain model mappings
└── lib/
    ├── wallet-provider.tsx        # Stellar Wallets Kit + Freighter integration
    └── trustlesswork-provider.tsx # Root Trustless Work SDK React context
```

### SDK Integration Decisions
- **Single-Release Architecture**: Built around the `single-release` contract type (`@trustless-work/escrow` v3).
- **Native Number Amounts**: In accordance with the canonical Trustless Work SDK specification, all payment amounts are passed as standard JavaScript numbers (e.g. `1000` for 1,000 USDC), never raw integer stroops or strings.
- **Client-Side API Key**: `NEXT_PUBLIC_API_KEY` is configured via `TrustlessworkProvider` in the root layout, enabling non-custodial indexer queries and transaction preparation directly from the browser.

---

## Quick Start

### Prerequisites

- **Node.js**: `v20.19.0` or higher (Node 22 LTS recommended)
- **Package Manager**: [pnpm](https://pnpm.io/) `v9+`
- **Browser Wallet**: [Freighter](https://www.freighter.app/) extension (for Testnet mode)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/Trustless-Work/trustlesswork-agency-escrow-template.git
cd trustlesswork-agency-escrow-template

# 2. Install dependencies
pnpm install

# 3. Create local environment file
cp .env.local.example .env.local
```

### Running Mock Mode (Default & Credential-Free)

Mock mode runs completely offline with **zero API keys, zero wallet extensions, and zero testnet token requirements**.

```bash
# .env.local
NEXT_PUBLIC_ESCROW_MODE=mock
```

Start the local development server:
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000).

> [!TIP]
> **Mock Actor Switcher**: While in mock mode, use the interactive actor switcher in the page header to seamlessly toggle between the **Agency Workspace** and **Counterparty Client** personas to test role-gated buttons, funding, revisions, approval, and release.

### Running Testnet Mode (Real Soroban Escrow)

To run against the live Stellar Testnet using real Soroban contracts:

1. Obtain a **Trustless Work API Key** from [Trustless Work Documentation](https://docs.trustlesswork.com/trustless-work).
2. Configure your `.env.local`:

```env
# Runtime Mode
NEXT_PUBLIC_ESCROW_MODE=testnet
NEXT_PUBLIC_USE_MAINNET=false

# Trustless Work API Credentials
NEXT_PUBLIC_API_KEY=tw_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Platform Configuration (Must be valid Stellar G... public keys)
NEXT_PUBLIC_PLATFORM_ADDRESS=GA2M...YourPlatformAddressHere...
NEXT_PUBLIC_DISPUTE_RESOLVER_ADDRESS=GB3N...YourDisputeResolverAddress...

# Testnet USDC Asset Issuer (Must be a G... public key, NEVER a Soroban C... contract address)
# Standard SDF Testnet USDC Issuer:
NEXT_PUBLIC_USDC_ISSUER=GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
```

3. Launch application:
```bash
pnpm dev
```

---

## Stellar Wallet & Testnet USDC Trustlines

When operating in **Testnet Mode**, all writes require cryptographic authorization using a Stellar wallet:

1. **Network**: Open Freighter Settings → Network → Select **Testnet** (`Test SDF Network ; September 2015`).
2. **Account Funding**: Fund your testnet wallet using [Stellar Friendbot](https://stellar.expert/faucet/testnet).
3. **USDC Trustline Setup**:
   - The **Funder** must have an established trustline for asset code `USDC` with issuer `NEXT_PUBLIC_USDC_ISSUER` and sufficient USDC balance to fund the escrow.
   - The **Receiver** must also establish the `USDC` trustline prior to fund release, ensuring the Soroban contract can pay out net funds without transaction aborts.
4. **Pre-flight Assertion**: The template's `stellar-preflight.ts` service automatically queries Horizon before triggering wallet signatures. If the required trustline or balance is missing, clear, actionable diagnostic errors are displayed.

---

## Local-Only Metadata & Revision Loop

Soroban smart contracts are designed for lean, decentralized execution; they store financial state, milestone completion flags, and account addresses. 

To deliver a comprehensive agency UX without requiring a custodial backend database in V1:
- **Application Metadata Store**: Commercial details (agreement URLs, milestone titles, detailed acceptance criteria markdown, deliverable links, and revision feedback) are preserved locally via `metadata-store.ts` in browser `localStorage`.
- **Pre-Approval Revision Flow**:
  - In Soroban, milestone approval is an irrevocable state transition.
  - The template introduces a **Pre-Approval Revision Loop**: When an approver requests changes, the request and revision instructions are recorded in the local metadata store.
  - The provider receives instant UI notification, updates deliverables, and resubmits.
  - Only when the approver is fully satisfied do they submit the on-chain approval transaction.

---

## Two Canonical End-to-End Walkthroughs

### Scenario 1: Receivable (Agency Gets Paid)

**Context**: TechRebel Agency provides a Web3 frontend for Client Acme Inc. ($5,000 USDC).

1. **Create Escrow**:
   - Agency selects **"We're getting paid"** (`receivable`).
   - Agency enters Client Name ("Acme Inc.") and Client Stellar Wallet (`G...`).
   - Defines amount (`5000 USDC`), milestone title, and acceptance criteria.
   - Signs transaction to deploy the Soroban escrow.
2. **Funding**:
   - Client Acme Inc. opens the escrow link (`/escrow/[id]/fund`).
   - Connects wallet and deposits `5,000 USDC`. Funds are now locked on-chain.
3. **Delivery Submission**:
   - Agency completes the milestone and visits `/escrow/[id]/submit`.
   - Submits repository PR link and deployment demo URL. Status moves to `in_review`.
4. **Change Request (Revision Loop)**:
   - Client reviews work at `/escrow/[id]/review`.
   - Notices missing responsive tablet breakpoints and clicks **"Request Changes"**.
   - Agency is notified, addresses feedback, and resubmits revised deliverables.
5. **Approval & Fund Release**:
   - Client reviews updated deliverables and clicks **"Approve Deliverable"** (signs on-chain approval).
   - Client navigates to `/escrow/[id]/release` and triggers **"Release Payment"**.
   - **Fee Semantics & Settlement Note**: On-chain fund release executes settlement through Trustless Work. Net funds are routed to TechRebel's wallet after deducting the configured platform fee (`NEXT_PUBLIC_PLATFORM_FEE_BPS`, e.g. 30 bps / 0.30% = 15 USDC) to `NEXT_PUBLIC_PLATFORM_ADDRESS` as well as the underlying Trustless Work protocol release fee (~30 bps observed on testnet, currently tracked for explicit dual-fee UI display in [#45](https://github.com/Trustless-Work/trustlesswork-agency-escrow-template/issues/45)). Actual on-chain net deposited reflects both deductions.

---

### Scenario 2: Payable (Agency Pays Subcontractor)

**Context**: TechRebel Agency contracts a Rust smart contract auditor ($2,500 USDC).

1. **Create Escrow**:
   - Agency selects **"We're paying someone"** (`payable`).
   - Enters Payee Name ("AuditWorks") and Payee Stellar Wallet (`G...`).
   - Signs transaction to deploy the escrow.
2. **Funding**:
   - Agency immediately visits `/escrow/[id]/fund` and deposits `2,500 USDC`.
   - AuditWorks begins auditing with payment guaranteed on-chain.
3. **Delivery**:
   - AuditWorks visits `/escrow/[id]/submit` and links the finalized audit PDF.
4. **Approval & Release**:
   - Agency reviews the report at `/escrow/[id]/review` and approves the delivery.
   - Agency executes the release transaction at `/escrow/[id]/release`.
   - AuditWorks receives net funds in their Stellar wallet (reflecting deduction of the 30 bps platform fee and Trustless Work protocol fee, tracked in [#45](https://github.com/Trustless-Work/trustlesswork-agency-escrow-template/issues/45)).

---

## V1 Release Readiness & Dogfood Verification Report

In accordance with release-readiness criteria ([#34](https://github.com/Trustless-Work/trustlesswork-agency-escrow-template/issues/34)), the template has undergone end-to-end verification across both mock simulation and live Stellar Testnet:

### 1. Dogfood Verification Matrix

| Area | Acceptance Test | Result | Notes / Details |
| :--- | :--- | :--- | :--- |
| **Receivable Flow** | Agency creates $\rightarrow$ Client funds $\rightarrow$ Agency submits $\rightarrow$ Client approves $\rightarrow$ Client releases | ✅ Verified | Tested in Mock and live Testnet. |
| **Payable Flow** | Agency creates $\rightarrow$ Agency funds $\rightarrow$ Contractor submits $\rightarrow$ Agency approves $\rightarrow$ Agency releases | ✅ Verified | Tested in Mock and live Testnet. |
| **Revision Loop** | Pre-approval change request $\rightarrow$ status `changes_requested` $\rightarrow$ resubmission | ✅ Verified | Local metadata preserves revision feedback without on-chain aborts. |
| **Deep Links & Refresh** | Direct navigation to `/escrow/[id]/*` with page reload | ✅ Verified | On-chain contract state and local metadata rehydrate cleanly. |
| **Role-Gated Actions** | Non-funder blocked on deposit; non-approver blocked on sign-off | ✅ Verified | Interactive actor switcher (mock) & connected wallet (testnet) enforce access. |
| **Responsive Layouts** | Mobile (375px), Tablet (768px), and Desktop (1440px) viewports | ✅ Verified | Tailwind responsive containers with zero layout truncation. |
| **Clean Setup** | README-only setup from fresh checkout using `.env.local.example` | ✅ Verified | Zero tribal knowledge or hidden dependencies. |

### 2. Live Testnet References & Money Flow Evidence

Evidence established during real two-wallet integration ([#20](https://github.com/Trustless-Work/trustlesswork-agency-escrow-template/issues/20) / [PR #37](https://github.com/Trustless-Work/trustlesswork-agency-escrow-template/pull/37)):
- **Network**: Stellar Testnet (`Test SDF Network ; September 2015`)
- **Canonical Asset**: Testnet USDC (`GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`)
- **Observed Settlement Verification**:
  - **100 USDC Escrow**: Funder deposits 100.0 USDC $\rightarrow$ Release pays Receiver `99.40 USDC` net, Platform `0.30 USDC` (30 bps platform fee), and Trustless Work Protocol `~0.30 USDC` (~30 bps protocol fee).
  - **50 USDC Escrow**: Funder deposits 50.0 USDC $\rightarrow$ Release pays Receiver `49.70 USDC` net, Platform `0.15 USDC` (30 bps platform fee), and Trustless Work Protocol `~0.15 USDC` (~30 bps protocol fee).

### 3. Discovered Defects & Follow-Up Linkages

During the V1 release pass, two architectural items were documented and opened for dedicated tracking:
- **[#45](https://github.com/Trustless-Work/trustlesswork-agency-escrow-template/issues/45)**: `[BUG][FEES] Reconcile Trustless Work protocol fee in payout previews and net amounts` — UI fee helper audit to explicitly split platform fee vs Trustless Work protocol fee across preview, funding, and release dialogs.
- **[#46](https://github.com/Trustless-Work/trustlesswork-agency-escrow-template/issues/46)**: `[SECURITY] Remove vulnerable protobufjs@7.4.0 transitive dependency from wallet stack` — Transitive `@creit.tech/stellar-wallets-kit` dependency override pass for GHSA-xq3m-2v4x-88gg.

### 4. Final V1 Boundaries & Operating Assumptions
- **Testnet Reference Target**: V1 is explicitly targeted at Stellar Testnet; production deployment requires custom contract verification, backend persistence, and dedicated authentication.
- **Single-Milestone Model**: Exactly one milestone per escrow (Single Release).
- **Browser-Local Metadata**: Revision comments and off-chain delivery details are stored in `localStorage`.
- **Dispute Resolver**: Address is configured as a required contract parameter, but arbitration UX is out of V1 scope.

---

## V1 Scope & Known Boundaries

| Feature | V1 MVP Status | Future Roadmap (V2+) |
| :--- | :--- | :--- |
| **Milestone Count** | **Single-milestone** per escrow | Multi-milestone contracts with scheduled releases |
| **Network Support** | **Stellar Testnet** only (`NEXT_PUBLIC_USE_MAINNET=false`) | Stellar Public Mainnet |
| **Asset Support** | **USDC** (settlement asset) | Multi-asset (XLM, EURC, custom Stellar tokens) |
| **Metadata Storage** | **Browser LocalStorage** + On-Chain State | Decentralized IPFS metadata indexing or cloud backend |
| **Dispute Resolution** | Configured integration address (in-app dispute & arbitration UX is out of V1 scope) | On-chain arbitration and evidence voting portal |

---

## Contributing & Development

We welcome contributions from the community!

### Verification Commands

Before opening a pull request, ensure all verification checks pass with zero warnings:

```bash
# 1. Run unit test suite
pnpm test

# 2. Run TypeScript strict typecheck
pnpm typecheck

# 3. Run ESLint checks
pnpm lint

# 4. Verify production Next.js build
pnpm build
```

### Git Branching Conventions
- Base branch for PRs: **`develop`**
- Use Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`)
- Link related issues in PR descriptions (e.g. `Closes #34`)

---

## Maintainers | [Telegram Community](https://t.me/+kmr8tGegxLU0NTA5)

<table align="center">
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/6b97e15f-9954-47d0-81b5-49f83bed5e4b" alt="Tech Rebel" width="120" />
      <br /><br />
      <strong>Tech Rebel</strong>
      <br />Product Manager<br />
      <a href="https://github.com/techrebelgit" target="_blank">techrebelgit</a> · <a href="https://t.me/Tech_Rebel" target="_blank">Telegram</a>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/e245e8af-6f6f-4a0a-a37f-df132e9b4986" alt="Joel Vargas" width="120" />
      <br /><br />
      <strong>Joel Vargas</strong>
      <br />Frontend Developer<br />
      <a href="https://github.com/JoelVR17" target="_blank">JoelVR17</a> · <a href="https://t.me/joelvr20" target="_blank">Telegram</a>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/53d65ea1-007e-40aa-b9b5-e7a10d7bea84" alt="Armando Murillo" width="120" />
      <br /><br />
      <strong>Armando Murillo</strong>
      <br />Full Stack Developer<br />
      <a href="https://github.com/armandocodecr" target="_blank">armandocodecr</a> · <a href="https://t.me/armandocode" target="_blank">Telegram</a>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/851273f6-2f91-413d-bd2d-d8dc1f3c2d28" alt="Caleb Loría" width="120" />
      <br /><br />
      <strong>Caleb Loría</strong>
      <br />Smart Contract Developer<br />
      <a href="https://github.com/zkCaleb-dev" target="_blank">zkCaleb-dev</a> · <a href="https://t.me/zkCaleb_dev" target="_blank">Telegram</a>
    </td>
  </tr>
</table>

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
