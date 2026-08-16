# V1 User Flow & Escrow Role Mapping

## Canonical rule

The workspace/operator is not always the payee. Every escrow begins with one decision:

- **We're getting paid** (`receivable`)
- **We're paying someone** (`payable`)

From that decision the app derives the payment actors and Trustless Work roles.

## Receivable flow — Acme → TechRebel

| Concept | Actor |
| --- | --- |
| Workspace | TechRebel |
| Counterparty | Acme |
| Payer / funding signer | Acme |
| Payee / receiver | TechRebel |
| Service provider | TechRebel |
| Approver | Acme |
| Release signer | Acme |
| Issuer | TechRebel workspace wallet |

```text
TechRebel creates
      ↓
Acme funds
      ↓
TechRebel delivers + submits
      ↓
Acme requests changes OR approves
      ↓
(if changes) TechRebel resubmits
      ↓
Acme approves
      ↓
Acme releases
      ↓
TechRebel receives
```

## Payable flow — TechRebel → Maria

| Concept | Actor |
| --- | --- |
| Workspace | TechRebel |
| Counterparty | Maria |
| Payer / funding signer | TechRebel |
| Payee / receiver | Maria |
| Service provider | Maria |
| Approver | TechRebel |
| Release signer | TechRebel |
| Issuer | TechRebel workspace wallet |

```text
TechRebel creates
      ↓
TechRebel funds
      ↓
Maria delivers + submits
      ↓
TechRebel requests changes OR approves
      ↓
(if changes) Maria resubmits
      ↓
TechRebel approves
      ↓
TechRebel releases
      ↓
Maria receives
```

## Trustless Work mapping

V1 uses Single-Release, one milestone.

| Application concept | Trustless Work concept |
| --- | --- |
| Workspace initiator | Issuer / deployment signer |
| Payer | Funding signer (`signer` in fund payload) |
| Payee | `roles.receiver` |
| Service provider | `roles.serviceProvider` / `serviceProvider` operation field |
| Approver | `roles.approver` / `approver` operation field |
| Release signer | `roles.releaseSigner` / `releaseSigner` operation field |
| Platform | `roles.platformAddress` |
| Resolver | `roles.disputeResolver` |

## State versus on-chain fields

The app state is intentionally more expressive than the single milestone's on-chain fields.

- `funded` tracks successful funding.
- `in_review` corresponds to service-provider status/evidence submission.
- `revision_requested` is app-level workflow state before approval.
- `approved` maps to irreversible milestone approval.
- `released` maps to payout.

Never implement `request changes` by approving and attempting to undo approval. Trustless Work approval is irreversible.

## Role guard matrix

| Action | Required app status | Required actor |
| --- | --- | --- |
| Fund | `created` | payer / funder |
| Submit | `funded`, `revision_requested` | service provider / payee |
| Request changes | `in_review` | approver / payer |
| Approve | `in_review` | approver / payer |
| Release | `approved` | release signer / payer |
