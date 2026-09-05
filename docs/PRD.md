# PRD — Agency Escrow Template V1

## 1. Product summary

**One-liner:** Turn an existing agreement into a protected payment workflow.

The Agency Escrow Template is a reusable Trustless Work reference application for service payments. A workspace/operator can use it when it is receiving payment from a client or when it is paying a freelancer, agency, consultant, or other provider.

## 2. Problem

Service relationships frequently have agreed commercial terms but weak payment coordination:

- providers start work before funds are secured;
- payers hesitate to pay before delivery;
- approval and payment status are tracked informally;
- invoice collection becomes a separate negotiation;
- both parties lack a neutral payment state they can inspect.

The product adds an escrow layer without trying to replace the underlying agreement.

## 3. Core product principle

> One escrow protects one payment/deliverable from an agreement that already exists.

The contract, proposal, SOW, or quote remains the legal/commercial source. V1 captures only what is needed to protect one payment: parties, amount/asset, deliverable, acceptance criteria, and optional agreement reference/due date.

## 4. Actor model

### Workspace / operator

The organization using the template. TechRebel is the canonical demo workspace.

### Counterparty

The other party to the payment obligation.

### Payment direction

- `receivable` — the workspace is getting paid.
- `payable` — the workspace is paying someone.

`Agency` and `Client` are contextual labels, not permanent system roles.

## 5. Derived payment roles

### Receivable

- payer: counterparty
- payee/service provider: workspace
- approver: counterparty
- release signer: counterparty
- receiver: workspace

### Payable

- payer: workspace
- payee/service provider: counterparty
- approver: workspace
- release signer: workspace
- receiver: counterparty

The normal create flow must derive Trustless Work roles from payment direction rather than ask users to configure protocol roles manually.

## 6. V1 user journey

1. Workspace starts a new escrow.
2. Chooses `We're getting paid` or `We're paying someone`.
3. Adds counterparty identity/contact/wallet.
4. Captures agreement/payment title, description, amount, asset, optional link and due date.
5. Defines the deliverable and acceptance criteria.
6. Reviews payer → payee and creates the escrow.
7. Assigned payer funds.
8. Assigned service provider completes work and submits delivery summary/evidence.
9. Assigned approver either requests changes or approves.
10. If changes are requested, service provider revises and resubmits.
11. After approval, assigned release signer releases funds.
12. Payee receives funds and the escrow becomes released/closed.

## 7. State machine

```text
created
  ↓ fund
funded
  ↓ submit
in_review
  ├─ request changes → revision_requested → resubmit → in_review
  └─ approve → approved → release → released → closed
```

Approval is irreversible in Trustless Work. Revision requests therefore exist only before approval.

## 8. Functional requirements

### Create

Required domain inputs:

- payment direction
- workspace
- counterparty
- engagement ID
- agreement/payment title and description
- amount as a number
- asset
- deliverable title/description
- acceptance criteria
- optional agreement URL
- optional due date

System derives payer/payee and Trustless Work roles.

### Dashboard

Show all workspace escrows with:

- title
- payer → payee
- `YOU ARE PAYING` or `YOU ARE GETTING PAID`
- amount/asset
- status
- next action

### Shared viewer

Show payment terms, parties, status, acceptance criteria, relevant technical addresses, and activity history. Technical blockchain information should not dominate the page.

### Funding

Only the derived payer may fund a `created` escrow.

### Submission

Only the derived service provider may submit from `funded` or `revision_requested`. Submission includes a delivery summary and optional evidence/links.

### Review

Only the derived approver may review `in_review` work. The approver may request changes before approval or approve. Once approved, there is no V1 unapprove path.

### Release

Only the derived release signer may release an `approved` escrow. Show gross amount, fee, and net amount before confirmation.

## 9. Trustless Work contract model

V1 uses **Single-Release escrow with exactly one milestone**.

The adapter must follow `.agents/skills/trustless-work/` as the integration source of truth.

Important type boundary:

- deploy amount: `number`
- platform fee: `number`
- fund amount: `number`
- milestone index for operations: SDK payload `string`

Write hooks return unsigned XDR. The wallet belonging to the required role signs and submits the transaction.

## 10. Mock and testnet modes

### Mock

Default contributor mode. No API key or wallet required. Data persists locally and ships with canonical TechRebel examples.

### Testnet

Uses Trustless Work development configuration and Stellar wallet signing. UI consumes the same application-facing hooks in both modes.

## 11. V1 limitations

Out of scope:

- full contract generation/e-signature
- multi-milestone or multi-release UX
- partial releases
- disputes/arbitration UX
- fiat rails
- accounting/CRM integrations
- subscriptions
- team permissions
- production authentication/backend persistence

`Request changes` is app-level workflow metadata. Cross-device persistence for revision notes requires a shared backing store and is not guaranteed by the escrow contract itself.

## 12. OSS architecture rule

Issues #13–#19 own separate route/view/component trees. Shared domain, service, and hook contracts are prepared by #10–#12 and should be treated as frozen during the contributor wave.
