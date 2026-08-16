# Product Brief — Agency Escrow Template V1

## Product idea

**Put escrow around work you already agreed on.**

The template is for an agency, studio, consultant, freelancer, or small organization that already has a proposal, contract, SOW, quote, or otherwise agreed commercial terms and wants to protect one payment with escrow.

The app is not a contract generator, CRM, or project-management suite. The agreement defines the relationship; escrow protects the payment.

## Canonical workspace example

TechRebel is the workspace/operator. For each escrow it may be on either side of the payment:

### Receivable — we are getting paid

`Acme → TechRebel`

Acme funds the escrow, TechRebel delivers, Acme approves/releases, TechRebel receives funds.

### Payable — we are paying someone

`TechRebel → Maria`

TechRebel funds the escrow, Maria delivers, TechRebel approves/releases, Maria receives funds.

The product therefore must not treat `Agency` and `Client` as permanent economic roles.

## V1 mental model

1. Choose whether the workspace is getting paid or paying someone.
2. Identify the counterparty.
3. Capture the one payment being protected.
4. Capture the deliverable and acceptance criteria.
5. Create a one-milestone Single-Release escrow.
6. Payer funds.
7. Service provider submits delivery/evidence.
8. Approver approves or requests revisions before approval.
9. Release signer releases funds to the payee.

## V1 principle

> One escrow protects one payment/deliverable from an agreement that already exists.

A larger contract may produce several independent escrows over time. V1 does not reproduce the full legal agreement on-chain.

## Product language

Prefer human payment language in the primary UX:

- Workspace / organization
- Counterparty
- Payer
- Payee / service provider
- Deliverable
- Acceptance criteria
- Fund
- Submit work
- Approve
- Release

Trustless Work protocol roles are derived automatically and may be shown in advanced/debug views only.

## Trustless Work implementation

V1 uses **Single-Release** escrow with **one milestone**.

Application mapping:

- payer → funder
- payee → receiver
- payee → service provider
- payer → approver
- payer → release signer
- workspace → issuer by default
- configured platform → platform address
- configured resolver → dispute resolver

Approval is irreversible on-chain. `Request changes` is a pre-approval product state, not an on-chain unapproval operation.

## V1 success criteria

A new user can understand and complete both TechRebel scenarios without needing to understand Stellar, XDR, Soroban, or Trustless Work role names.
