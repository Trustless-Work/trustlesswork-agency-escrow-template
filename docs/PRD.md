# PRD: Agency Escrow Template

## 1. Product Summary

### Product Name

**Agency Escrow Template**

### Product Type

Trustless Work escrow template / reference implementation.

### One-Liner

A milestone-based escrow workflow that lets agencies, consultants, freelancers, and product studios secure client funds upfront and release payment only after approved delivery.

### Core Value Proposition

Agencies stop chasing invoices. Clients gain confidence that funds are only released when work is delivered and approved.

### Strategic Purpose

The Agency Escrow Template should become the first practical, dogfoodable reference template for Trustless Work. It demonstrates how smart escrows can

---

## 2. Background

Agency and consulting work often suffers from payment friction. Clients may hesitate to pay large retainers upfront, while agencies may hesitate to begin work without secured funds. Smart escrows separate funding from release: the client funds a milestone upfront, the agency delivers, and payment is released after approval.

---

## 3. Problem Statement

Agencies and service providers need a better way to align client payment with milestone delivery.

Current workflows create several problems:

- Agencies chase invoices after work is completed.
- Clients fear paying upfront without visibility or control.
- Scope and payment terms are often tracked informally.
- Payment conversations become uncomfortable.
- Agencies take delivery risk when funds are not secured.
- Clients may forget what was already paid or approved.
- There is no transparent shared source of truth for milestone status.

Core problem:

> Agency work lacks a neutral, programmable payment coordination layer that secures funds upfront and releases them only when agreed work is delivered and approved.
> 

---

## 4. Goals

### Product Goals

1. Allow an agency to create a milestone escrow for client work.
2. Allow a client to review and fund the milestone escrow.
3. Allow the agency to mark the milestone as completed.
4. Allow the client to approve the completed milestone.
5. Allow funds to be released to the agency after approval.
6. Route platform fees transparently.
7. Provide a clear escrow status page for both parties.

### Business Goals

1. Use the template internally with Tech Rebel and Trustless Work.
2. Demonstrate the practical value of Trustless Work in real workflows.
3. Produce a case study around milestone-based service payments.
4. Generate a reference implementation for future integrations.
5. Support future paid integration pilots.

### Developer Goals

1. Provide a clear template developers can reuse or adapt.
2. Demonstrate role-based escrow configuration.
3. Show the lifecycle from creation to funding to release.
4. Keep the first version simple enough to ship quickly.

---

## 5. Non-Goals

The MVP should not attempt to solve every agency contracting problem.

Out of scope for MVP:

- Full legal contract generation.
- E-signature workflows.
- Multi-party arbitration.
- Automated dispute resolution.
- Multi-milestone smart contract logic.
- Partial fund releases.
- Recurring subscription billing.
- Fiat payments.
- Tax reporting.
- Invoice accounting integrations.
- CRM integrations.
- Client portal with full project management.
- Team-based permission management.
- Complex multisig approval flows.

These may be explored after the first template proves useful.

---

## 6. Target Users

### 6.1 Agency / Service Provider

A software agency, consultant, freelancer, product studio, DevRel contractor, design studio, or Web3 development team that sells work through milestones.

Jobs to be done:

- Create a clear payment milestone.
- Secure client funds before starting work.
- Submit proof of delivery.
- Request approval.
- Get paid quickly after completion.
- Avoid chasing invoices.
- Maintain a transparent history of delivered work.

Pain points:

- Unpaid invoices.
- Slow client payments.
- Scope ambiguity.
- Cash flow uncertainty.
- Awkward payment conversations.
- Difficulty proving what was delivered and when.

### 6.2 Client

A startup, founder, protocol, DAO, company, or enterprise hiring an external provider for milestone-based work.

Jobs to be done:

- Understand what is being funded.
- Deposit funds safely.
- Keep control over approval.
- Release funds after delivery.
- Maintain visibility into payment status.
- Avoid paying for unclear or incomplete work.

### 6.3 Platform / Template Operator

Trustless Work, Tech Rebel, or any platform embedding this template into its own service workflow.

---

## 7. User Personas

### 7.1 Agency Founder

**Name:** Sofia  

**Role:** Founder of a Web3 product studio  

**Need:** Wants clients to fund milestones before her team starts work.  

**Frustration:** Clients often delay payment after work is delivered.  

**Desired Outcome:** Each milestone is funded, delivered, approved, and released transparently.

### 7.2 Startup Client

**Name:** Daniel  

**Role:** Founder hiring an agency to build a prototype  

**Need:** Wants confidence that he only releases money once work is delivered.  

**Frustration:** Does not want to pay a full retainer upfront without control.  

**Desired Outcome:** Funds are locked safely and released only after approval.

### 7.3 Trustless Work Integrator

**Name:** Ana  

**Role:** Developer integrating Trustless Work into an agency platform  

**Need:** Wants a simple reference template showing how to configure roles and lifecycle actions.  

**Desired Outcome:** A working template she can adapt.

---

## 8. Core User Stories

### Agency Stories

1. As an agency, I want to create a milestone escrow so that my client can fund a specific deliverable.
2. As an agency, I want to define the milestone title, amount, description, and acceptance criteria so that scope is clear.
3. As an agency, I want to assign the client as funder and approver so that they control funding and acceptance.
4. As an agency, I want to assign my wallet as receiver so that funds are released to the right address.
5. As an agency, I want to send the client a funding link so that they can review and deposit funds.
6. As an agency, I want to mark work as completed so that the client can review it.
7. As an agency, I want to attach delivery notes or links so that the client can verify completion.
8. As an agency, I want to see escrow status so that I know whether work is created, funded, in review, approved, or released.

### Client Stories

1. As a client, I want to review the escrow before funding so that I understand what I am paying for.
2. As a client, I want to see the agency wallet and milestone terms so that I know who receives funds and under what conditions.
3. As a client, I want to fund escrow with stablecoins so that payment is secured before work begins.
4. As a client, I want to review submitted work so that I can approve only completed deliverables.
5. As a client, I want to request changes so that work can be revised before funds are released.
6. As a client, I want to release funds after approval so that the agency is paid.
7. As a client, I want to see platform fees so that payment routing is transparent.

### Platform Stories

1. As a platform, I want to collect a fee on released funds so that the template supports monetization.
2. As a platform, I want users to see escrow status so that support burden is reduced.
3. As a platform, I want this template to be reusable so that other service workflows can be built from it.
4. As a platform, I want event history so that each escrow creates a transparent audit trail.

---

## 9. Functional Requirements

### 9.1 Escrow Creation

The agency creates a new one-milestone escrow.

Required inputs:

- Client name
- Client wallet address
- Client email, optional
- Agency name
- Agency wallet address
- Agency email, optional
- Milestone title
- Milestone description
- Acceptance criteria
- Amount
- Asset
- Due date, optional
- Platform fee basis points
- Platform fee address
- Escrow visibility setting

Requirements:

1. The system must allow an agency to create a new milestone escrow.
2. The system must validate required fields before creation.
3. The system must assign the client as funder.
4. The system must assign the agency as receiver.
5. The system must assign the agency as milestone marker.
6. The system must assign the client as approver.
7. The system must assign the client or configured platform signer as release signer.
8. The system must define the platform fee recipient.
9. The system must create or configure the escrow through Trustless Work infrastructure.
10. The system must generate a unique escrow link.

Acceptance criteria:

- Given all required fields are complete, when the agency creates the escrow, then the escrow is created successfully.
- Given required fields are missing, when the agency submits the form, then the system shows validation errors.
- Given the escrow is created, when the agency views the escrow, then the status is `Created`.
- Given the escrow is created, then the system generates a shareable client funding link.

### 9.2 Escrow Review

The client opens the escrow link and reviews the milestone before funding.

Requirements:

1. The system must show the milestone title.
2. The system must show the milestone description.
3. The system must show acceptance criteria.
4. The system must show amount and asset.
5. The system must show agency wallet address.
6. The system must show client role assignments.
7. The system must show platform fee.
8. The system must show current escrow status.
9. The system must show a clear fund escrow CTA.

Acceptance criteria:

- Given the client opens the funding link, then the client can review all relevant escrow details.
- Given the escrow is already funded, then the funding CTA is disabled or replaced with the current status.
- Given the escrow configuration includes a platform fee, then the platform fee is visible to the client.

### 9.3 Escrow Funding

The client funds the escrow with the configured asset.

Requirements:

1. The client must connect a wallet.
2. The connected wallet should match the assigned client/funder wallet if strict validation is enabled.
3. The system must check the escrow status before funding.
4. The system must only allow funding when status is `Created`.
5. The system must initiate the funding transaction.
6. The system must update status to `Funded` after confirmation.
7. The system must notify or show confirmation to the agency.

Acceptance criteria:

- Given the escrow status is `Created`, when the client funds the escrow successfully, then the status changes to `Funded`.
- Given the wallet has insufficient balance, when the client attempts to fund, then the transaction fails gracefully.
- Given the escrow is already funded, when the client opens the page, then duplicate funding is not allowed unless explicitly supported.
- Given funding succeeds, then the agency can see that work may begin.

### 9.4 Milestone Submission

The agency marks the funded milestone as completed and submits proof of delivery.

Required inputs:

- Delivery summary
- Deliverable links, optional
- Notes, optional
- Completion date, automatic or manual

Requirements:

1. The system must allow milestone submission only after funding.
2. The connected wallet must match the milestone marker role.
3. The agency must be able to add a delivery summary.
4. The agency should be able to add one or more deliverable links.
5. The system must update the escrow status to `In Review`.
6. The system must notify or prompt the client to review.

Acceptance criteria:

- Given the escrow is `Funded`, when the agency submits the milestone, then the status becomes `In Review`.
- Given the connected wallet is not the milestone marker, when the user attempts to submit, then the action is blocked.
- Given delivery notes are submitted, then the client can view them on the review screen.

### 9.5 Client Review

The client reviews the submitted milestone and chooses whether to approve, request changes, or dispute.

MVP actions:

- Approve
- Request changes

V2 actions:

- Dispute
- Cancel
- Partial approval

Requirements:

1. The system must allow review only when status is `In Review`.
2. The connected wallet must match the approver role.
3. The client must be able to view delivery notes and links.
4. The client must be able to approve the milestone.
5. The client should be able to request changes.
6. If approved, the status must change to `Approved`.
7. If changes are requested, the status should change to `Revision Requested`.

Acceptance criteria:

- Given the escrow is `In Review`, when the approver approves, then the status changes to `Approved`.
- Given the escrow is `In Review`, when the approver requests changes, then the status changes to `Revision Requested`.
- Given a non-approver attempts to approve, then the system blocks the action.
- Given changes are requested, then the agency can view the revision notes.

### 9.6 Fund Release

Funds are released to the agency after milestone approval.

Requirements:

1. Funds must only be released after approval.
2. The connected wallet must match the release signer role.
3. The system must validate escrow status before release.
4. The system must calculate platform fee.
5. The system must route net funds to the agency receiver.
6. The system must route platform fee to the platform address.
7. The system must update status to `Released`.
8. The system must eventually mark escrow as `Closed`.

Acceptance criteria:

- Given the milestone is `Approved`, when the release signer releases funds, then funds are sent to the agency receiver.
- Given the milestone is not approved, when release is attempted, then release is blocked.
- Given the platform fee is configured, when funds are released, then the fee is routed to the platform address.
- Given funds are released successfully, then status changes to `Released` or `Closed`.

### 9.7 Escrow Status Viewer

Both parties can view the current status of the escrow.

MVP statuses:

- `Created`
- `Funded`
- `In Review`
- `Revision Requested`
- `Approved`
- `Released`
- `Closed`

Future statuses:

- `Disputed`
- `Resolved`
- `Cancelled`
- `Refunded`
- `Partially Released`

Requirements:

1. The system must show current escrow status.
2. The system must show relevant timestamps.
3. The system must show parties and roles.
4. The system must show amount and asset.
5. The system must show platform fee.
6. The system must show transaction references when available.
7. The system should show an activity timeline.

---

## 10. Escrow Role Mapping

| Trustless Work Role | Agency Template Meaning | MVP Actor |
| --- | --- | --- |
| Escrow Creator | Creates the milestone escrow | Agency |
| Funder / Payer | Deposits funds into escrow | Client |
| Receiver | Receives funds after release | Agency |
| Milestone Marker | Marks milestone as completed | Agency |
| Approver | Approves delivered milestone | Client |
| Release Signer | Releases funds after approval | Client |
| Platform Address | Receives platform fee | Trustless Work / Tech Rebel / platform |
| Resolver | Handles disputes | Not included in MVP |
| Admin | Can configure or manage escrow | Platform / agency, depending on implementation |

---

## 11. State Machine

### 11.1 MVP State Machine

```
Created
  ↓
Funded
  ↓
In Review
  ↓
Approved
  ↓
Released
  ↓
Closed
```

### 11.2 Revision Flow

```
Funded
  ↓
In Review
  ↓
Revision Requested
  ↓
In Review
  ↓
Approved
  ↓
Released
```

### 11.3 Future Dispute Flow

```
In Review
  ↓
Disputed
  ↓
Resolved
  ↓
Released / Refunded / Split
```

---

## 12. UX Requirements

### 12.1 Agency Screens

#### Agency Dashboard

Purpose: show all agency-created escrows.

Must show:

- Client name
- Milestone title
- Amount
- Asset
- Status
- Due date
- CTA based on status

Possible CTAs:

- View escrow
- Copy funding link
- Submit milestone
- View review
- View release status

#### Create Escrow Screen

Purpose: configure milestone escrow.

Sections:

1. Client information
2. Agency information
3. Milestone details
4. Payment details
5. Role configuration
6. Fee configuration
7. Preview and create

#### Escrow Preview Screen

Purpose: allow the agency to review before creation.

Must show:

- Parties
- Roles
- Amount
- Platform fee
- Milestone description
- Acceptance criteria
- Due date
- Visibility

#### Submit Milestone Screen

Purpose: submit work for client review.

Fields:

- Delivery summary
- Deliverable links
- Notes
- Submit CTA

### 12.2 Client Screens

#### Client Funding Page

Purpose: review and fund escrow.

Must show:

- Milestone summary
- Amount
- Asset
- Agency receiver
- Approval terms
- Platform fee
- Status
- Fund escrow CTA

#### Client Review Page

Purpose: approve or request changes.

Must show:

- Original milestone details
- Delivery summary
- Deliverable links
- Approval CTA
- Request changes CTA

#### Release Funds Screen

Purpose: release payment after approval.

Must show:

- Gross amount
- Platform fee
- Net amount to agency
- Receiver address
- Release CTA

### 12.3 Shared Screens

#### Escrow Viewer

Purpose: transparent status page.

Must show:

- Escrow ID
- Status
- Amount
- Asset
- Parties
- Roles
- Milestone details
- Timeline
- Transaction references

---

## 13. Data Model

```tsx
type AgencyEscrow = {
  escrowId: string;
  templateType: "agency_milestone";

  client: {
    name: string;
    walletAddress: string;
    email?: string;
  };

  agency: {
    name: string;
    walletAddress: string;
    email?: string;
  };

  milestone: {
    title: string;
    description: string;
    acceptanceCriteria: string;
    amount: string;
    asset: string;
    dueDate?: string;
    deliverableLinks?: string[];
    deliverySummary?: string;
    revisionNotes?: string;
  };

  roles: {
    creator: string;
    funder: string;
    receiver: string;
    milestoneMarker: string;
    approver: string;
    releaseSigner: string;
    platformAddress: string;
    resolver?: string;
  };

  fee: {
    platformFeeBps: number;
    platformAddress: string;
  };

  status:
    | "created"
    | "funded"
    | "in_review"
    | "revision_requested"
    | "approved"
    | "released"
    | "closed"
    | "disputed"
    | "cancelled"
    | "refunded";

  timestamps: {
    createdAt: string;
    fundedAt?: string;
    submittedAt?: string;
    revisionRequestedAt?: string;
    approvedAt?: string;
    releasedAt?: string;
    closedAt?: string;
  };

  transactions: {
    creationTx?: string;
    fundingTx?: string;
    approvalTx?: string;
    releaseTx?: string;
  };
};
```

---

## 14. API / Contract Assumptions

This PRD assumes Trustless Work already supports or will support:

1. Escrow creation.
2. Role assignment.
3. Stablecoin funding.
4. Milestone status updates.
5. Approval action.
6. Release action.
7. Platform fee routing.
8. Escrow status query.
9. Event emission.
10. Transaction references.

### 14.1 Required Template-Level API Operations

```
createAgencyEscrow()
getAgencyEscrow()
fundEscrow()
submitMilestone()
approveMilestone()
requestChanges()
releaseFunds()
getEscrowEvents()
```

### 14.2 Smart Contract vs Application Layer

The smart contract should handle:

- escrow funding
- role permissions
- approval state, if supported
- release validation
- fund release
- fee routing
- event emission

The application layer can handle:

- client name
- agency name
- milestone descriptions
- acceptance criteria
- deliverable links
- delivery notes
- revision notes
- user-friendly timeline
- email notifications
- off-chain dispute records

---

## 15. MVP Scope

### 15.1 Must-Have

| Feature | Description |
| --- | --- |
| Create one-milestone escrow | Agency can create one escrow for one deliverable |
| Assign roles | Client, agency, approver, release signer, receiver, platform address |
| Define payment amount | Amount and stablecoin asset |
| Define acceptance criteria | Client knows what approval means |
| Generate funding link | Agency can send link to client |
| Client funds escrow | Funds are deposited into smart escrow |
| Agency submits milestone | Agency marks work as completed |
| Client approves | Client accepts milestone |
| Funds release | Funds are sent to agency |
| Platform fee routing | Fee sent to platform address |
| Escrow status viewer | Both parties can see status |
| Basic event timeline | Created, funded, submitted, approved, released |

### 15.2 Should-Have

| Feature | Description |
| --- | --- |
| Delivery links | Agency can attach Figma, Notion, GitHub, Google Drive, or other links |
| Request changes | Client can request revisions before approval |
| Copy/share escrow link | Agency can easily send client link |
| Wallet role validation | Actions gated by wallet role |
| Basic notifications | Email or in-app status updates |

### 15.3 Nice-to-Have

| Feature | Description |
| --- | --- |
| Multi-milestone contract | One escrow with multiple deliverables |
| Partial release | Release a portion of milestone funds |
| Dispute flow | Resolver-based conflict handling |
| PDF agreement export | Generate a simple milestone agreement |
| Auto-release window | Release if client does not respond after X days |
| Team permissions | Multiple agency/client users |
| Multisig release | Client team or DAO approval |
| Accounting integration | Invoice and bookkeeping export |

---

## 16. Success Metrics

### Product Metrics

- Number of agency escrows created.
- Number of agency escrows funded.
- Percentage of created escrows that get funded.
- Number of milestones submitted.
- Number of milestones approved.
- Number of escrows released.
- Average time from creation to funding.
- Average time from submission to approval.
- Average time from approval to release.
- Total escrow volume processed.
- Total platform fees collected.

### Activation Metrics

- Number of agencies using the template.
- Number of clients funding escrows.
- Number of repeat agency users.
- Number of milestones per agency.
- Number of templates reused by developers.

### Business Metrics

- Escrow volume from agency use case.
- Revenue from platform fees.
- Number of paid integration leads generated.
- Number of case studies created.
- Conversion from template user to platform/integration customer.

---

## 17. Dogfooding Plan

### 17.1 First Internal Pilot

Use Tech Rebel as the first real user.

Example engagement: a client hires Tech Rebel for a 4-week product or integration sprint.

Total value: `5,000 USDC`

| Week | Milestone | Amount |
| --- | --- | --- |
| --- | --- | ---: |
| Week 1 | Discovery + product brief | 1,250 USDC |
| Week 2 | User flow + scope definition | 1,250 USDC |
| Week 3 | Prototype or technical implementation plan | 1,250 USDC |
| Week 4 | Final handoff + backlog | 1,250 USDC |

### 17.2 MVP Pilot Model

Use one escrow per milestone.

```
Client funds milestone escrow
→ Tech Rebel delivers work
→ Client approves
→ Funds are released
→ Next milestone begins
```

### 17.3 Dogfooding Goals

- Validate whether clients understand escrow funding.
- Validate whether agencies find the workflow useful.
- Identify friction in funding, approval, and release.
- Create a real case study.
- Improve the template based on actual usage.
- Use the result in Trustless Work content and investor updates.

---

## 16. Success Metrics

### Product Metrics

- Number of agency escrows created.
- Number of agency escrows funded.
- Percentage of created escrows that get funded.
- Number of milestones submitted.
- Number of milestones approved.
- Number of escrows released.
- Average time from creation to funding.
- Average time from submission to approval.
- Average time from approval to release.
- Total escrow volume processed.
- Total platform fees collected.

### Activation Metrics

- Number of agencies using the template.
- Number of clients funding escrows.
- Number of repeat agency users.
- Number of milestones per agency.
- Number of templates reused by developers.

### Business Metrics

- Escrow volume from agency use case.
- Revenue from platform fees.
- Number of paid integration leads generated.
- Number of case studies created.
- Conversion from template user to platform/integration customer.

---

## 17. Dogfooding Plan

### 17.1 First Internal Pilot

Use Tech Rebel as the first real user.

Example engagement: a client hires Tech Rebel for a 4-week product or integration sprint.

Total value: `5,000 USDC`

| Week | Milestone | Amount |
| --- | --- | --- |
| --- | --- | ---: |
| Week 1 | Discovery + product brief | 1,250 USDC |
| Week 2 | User flow + scope definition | 1,250 USDC |
| Week 3 | Prototype or technical implementation plan | 1,250 USDC |
| Week 4 | Final handoff + backlog | 1,250 USDC |

### 17.2 MVP Pilot Model

Use one escrow per milestone.

```
Client funds milestone escrow
→ Tech Rebel delivers work
→ Client approves
→ Funds are released
→ Next milestone begins
```

### 17.3 Dogfooding Goals

- Validate whether clients understand escrow funding.
- Validate whether agencies find the workflow useful.
- Identify friction in funding, approval, and release.
- Create a real case study.
- Improve the template based on actual usage.
- Use the result in Trustless Work content and investor updates.

---

## 18. Risks

### 18.1 Client Funding Friction

Clients may not want to connect wallets or fund in stablecoins.

Mitigation:

- Start with Web3-native clients.
- Use embedded wallet or passkey wallet later.
- Provide simple funding instructions.
- Use small pilot amounts first.

### 18.2 Overcomplicating Scope

Adding disputes, legal contracts, and multi-milestone flows too early could slow delivery.

Mitigation:

- Start with one milestone per escrow.
- Keep disputes manual.
- Keep legal agreements outside the template for MVP.

### 18.3 Agency Workflow Fragmentation

Agencies may already use tools like Notion, Linear, GitHub, Figma, or Google Drive.

Mitigation:

- Do not replace project management tools.
- Let agencies attach links to existing tools.
- Focus only on payment coordination.

### 18.4 Release Trust Issue

Clients may approve but forget or delay the release transaction.

Mitigation:

- Make approval and release part of the same UX where possible.
- Add reminders.
- Later support automated release after approval.

### 18.5 Regulatory / Legal Ambiguity

Escrow workflows may have legal implications depending on jurisdiction.

Mitigation:

- Position as non-custodial smart contract infrastructure.
- Avoid acting as legal arbiter in MVP.
- Keep legal contracts outside the template.
- Work with appropriate counsel before scaling regulated use cases.

---

## 19. Open Questions

1. Should the MVP require the client wallet to match the exact wallet address entered during escrow creation?
2. Should approval and release be one combined action or two separate actions?
3. Should the agency or client create the first escrow in the default UX?
4. Should the platform fee be visible before funding?
5. Should the first version support revision requests on-chain or only in the app metadata?
6. Should the template live inside the Trustless Work dApp, escrow viewer, or as a standalone demo?
7. Should Tech Rebel be the first named implementation?
8. Should the template include email notifications from day one?
9. Should there be an expiration date if the client does not fund?
10. Should there be an approval deadline after submission?

---

## 20. Recommended MVP Decisions

| Question | Recommendation |
| --- | --- |
| Who creates the escrow? | Agency |
| Who funds the escrow? | Client |
| Who marks milestone completed? | Agency |
| Who approves? | Client |
| Who releases? | Client for MVP |
| One escrow or many? | One escrow per milestone |
| Include disputes? | No, manual/off-chain for MVP |
| Include revisions? | Yes, as app-level metadata |
| Include platform fee? | Yes |
| Include multi-milestone contracts? | No, future version |
| First dogfood user? | Tech Rebel |

---

## 21. Future Iterations

### V2: Better Agency Workflow

- Multi-milestone contracts.
- Client dashboard.
- Agency dashboard.
- Revision history.
- Approval deadline.
- Auto-reminders.
- PDF agreement export.
- Basic invoice export.

### V3: Dispute And Resolution Layer

- Add resolver role.
- Dispute fee.
- Evidence submission.
- Partial release.
- Refund flow.
- DAO or multisig resolver options.

### V4: Platformization

- Agency profiles.
- Reusable client contracts.
- Project templates.
- Recurring retainers.
- Team permissions.
- CRM integrations.
- Accounting integrations.
- White-label agency escrow portal.

---

## 22. Launch Plan

### Phase 1: Internal Template Build

- Build one-milestone escrow creation flow.
- Connect to Trustless Work escrow infrastructure.
- Build client funding page.
- Build milestone submission flow.
- Build approval and release flow.
- Build escrow status viewer.

### Phase 2: Tech Rebel Dogfood

- Run one real or simulated client engagement.
- Use 2–4 milestone escrows.
- Track friction.
- Collect screenshots.
- Document learnings.

### Phase 3: Public Case Study

Possible title:

> How Tech Rebel Uses Smart Escrows To Stop Chasing Invoices
> 

Content should cover:

- The agency payment problem.
- How milestone escrows work.
- What the client sees.
- What the agency sees.
- How funds are released.
- What Trustless Work enables.

### Phase 4: Template Release

- Publish template in Trustless Work docs.
- Create GitHub issue/task for developers.
- Add it to demos.
- Turn it into a developer tutorial.
- Use it in outreach to agencies, product studios, and Web3 dev shops.

---

## 23. Final MVP Definition

The MVP is successful when:

1. An agency can create a one-milestone escrow.
2. A client can fund it.
3. The agency can submit the completed milestone.
4. The client can approve it.
5. Funds can be released to the agency.
6. Platform fees can be routed.
7. Both parties can view escrow status.
8. The flow is clear enough to use as a real Trustless Work demo and Tech Rebel dogfooding case study.

The MVP should not try to become a full agency management platform. It should focus only on the core coordination problem:

> Funds are secured before work begins and released when delivery is approved.
>