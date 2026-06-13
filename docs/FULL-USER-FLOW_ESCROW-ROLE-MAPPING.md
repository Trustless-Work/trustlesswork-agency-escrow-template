# Full User Flow + Escrow Role Mapping

# Agency Escrow Template

## Full User Flow + Escrow Role Mapping

## 1. Product Framing

### Template Name

**Agency Escrow Template**

### Use Case

A client hires an agency, consultant, freelancer, or product studio for milestone-based work. Instead of paying fully upfront or paying after delivery, the client funds a smart escrow before work begins. The agency delivers the milestone, the client approves it, and funds are released.

### Core Promise

> Agencies stop chasing invoices. Clients only release funds when work is delivered.
> 

### Primary Users

| User | Description |
| --- | --- |
| Client | The buyer of the service. Funds the escrow and approves delivery. |
| Agency / Provider | The service provider. Delivers the work and receives payment. |
| Platform / Template Operator | Trustless Work, Tech Rebel, or a third-party platform offering the escrow workflow. |
| Optional Resolver | A neutral party that handles disputes if client and agency disagree. |

---

# 2. Core Escrow Roles

## Role Mapping

| Trustless Work Role | Agency Template Meaning | Default Actor |
| --- | --- | --- |
| **Payer / Funder** | Client deposits funds into escrow | Client |
| **Receiver** | Receives funds after milestone approval | Agency |
| **Milestone Marker** | Marks the milestone as completed/submitted | Agency |
| **Approver** | Reviews and approves the milestone | Client |
| **Release Signer** | Triggers fund release after approval | Client, platform, or automated signer |
| **Platform Address** | Receives platform/infrastructure fee | Trustless Work / platform |
| **Resolver** | Handles disputed milestones | Optional third party / DAO / platform admin |
| **Admin / Creator** | Creates escrow configuration | Agency, platform, or client |

---

# 3. Recommended Default Configuration

For the first version, keep the role design simple.

| Role | Recommended MVP Assignment | Reason |
| --- | --- | --- |
| Escrow Creator | Agency | Agency usually initiates the commercial proposal. |
| Funder | Client | Client deposits funds before work starts. |
| Receiver | Agency | Agency receives payment after approval. |
| Milestone Marker | Agency | Agency knows when work has been delivered. |
| Approver | Client | Client controls acceptance. |
| Release Signer | Client or platform-assisted signer | Simple mental model: client approves and releases. |
| Platform Address | Trustless Work / Tech Rebel | Captures fee on successful release. |
| Resolver | Not required in MVP, optional in v2 | Avoid overcomplicating first flow. |

## MVP Recommendation

For v1:

> **Client should be both Approver and Release Signer.**
> 

This keeps the workflow very understandable:

1. Agency submits work.
2. Client approves.
3. Client releases funds.

Later, this can evolve into:

- approval by client, release by automated signer
- approval by client, release by platform
- approval by client + agency co-sign
- approval by external project manager
- approval by DAO / multisig
- automatic release after approval window expires

---

# 4. Main User Flow

## Flow A — Agency Creates Milestone Escrow

### Goal

Agency creates a milestone escrow and sends it to the client for funding.

### Steps

| Step | User | Action | System Result |
| --- | --- | --- | --- |
| 1 | Agency | Opens Agency Escrow Template | Template form loads |
| 2 | Agency | Enters client wallet/email | Client is assigned as funder/approver |
| 3 | Agency | Enters agency wallet | Agency is assigned as receiver |
| 4 | Agency | Defines milestone name | Escrow metadata created |
| 5 | Agency | Defines deliverable description | Milestone scope becomes explicit |
| 6 | Agency | Sets amount | Escrow expected funding amount defined |
| 7 | Agency | Sets due date | Timeline metadata added |
| 8 | Agency | Sets approval terms | Client knows acceptance criteria |
| 9 | Agency | Reviews escrow configuration | Preview displayed |
| 10 | Agency | Creates escrow | Smart escrow is deployed/configured |
| 11 | System | Generates escrow link | Client funding link created |
| 12 | Agency | Sends link to client | Client can review and fund |

### Required Fields

| Field | Example |
| --- | --- |
| Client name | Acme Inc. |
| Client wallet address | `G...` |
| Agency name | Tech Rebel |
| Agency wallet address | `G...` |
| Milestone title | Product Discovery Sprint |
| Description | Define ICP, user flows, MVP scope, and delivery plan |
| Amount | 1,250 USDC |
| Due date | June 21, 2026 |
| Acceptance criteria | Client receives final discovery brief and approves scope |
| Platform fee | 0.3% or configured basis points |
| Escrow visibility | Private link or public viewer |

---

# 5. Client Funding Flow

## Flow B — Client Reviews And Funds Escrow

### Goal

Client reviews the milestone agreement and deposits funds before work begins.

### Steps

| Step | User | Action | System Result |
| --- | --- | --- | --- |
| 1 | Client | Opens escrow link | Escrow viewer loads |
| 2 | Client | Reviews milestone details | Client understands scope |
| 3 | Client | Reviews parties and roles | Client sees who can do what |
| 4 | Client | Reviews amount and fee | Payment terms are transparent |
| 5 | Client | Connects wallet | Wallet session starts |
| 6 | Client | Funds escrow | Funds are locked in smart escrow |
| 7 | System | Updates status to Funded | Agency is notified |
| 8 | Agency | Starts work | Work begins with funds secured |

### Client View Should Show

| Section | Purpose |
| --- | --- |
| Milestone summary | What is being paid for |
| Amount | How much is locked |
| Receiver | Who gets paid |
| Approval role | Who controls approval |
| Release rules | When funds can move |
| Platform fee | How much fee is routed |
| Status | Created / Funded / Submitted / Approved / Released |
| Timeline | Created date, funded date, due date |

---

# 6. Agency Delivery Flow

## Flow C — Agency Submits Milestone

### Goal

Agency marks the milestone as completed and provides proof of delivery.

### Steps

| Step | User | Action | System Result |
| --- | --- | --- | --- |
| 1 | Agency | Opens funded escrow | Escrow dashboard loads |
| 2 | Agency | Clicks “Submit Milestone” | Submission form opens |
| 3 | Agency | Adds delivery notes | Notes stored in metadata |
| 4 | Agency | Adds links/files/references | Deliverable evidence attached |
| 5 | Agency | Marks milestone as completed | Escrow status updates to In Review |
| 6 | System | Notifies client | Client is asked to review |

### Submission Fields

| Field | Example |
| --- | --- |
| Delivery summary | Product discovery sprint completed |
| Deliverable links | Figma, Notion, GitHub, Google Drive |
| Notes | Scope includes ICP, user flows, and MVP recommendations |
| Completion date | June 18, 2026 |
| Requested action | Please review and approve milestone |

### Status Transition

```
Funded → In Review
```

---

# 7. Client Approval Flow

## Flow D — Client Reviews And Approves

### Goal

Client confirms the milestone was delivered according to the agreement.

### Steps

| Step | User | Action | System Result |
| --- | --- | --- | --- |
| 1 | Client | Opens review notification | Escrow review page opens |
| 2 | Client | Reviews submission | Client checks deliverables |
| 3 | Client | Chooses Approve or Request Changes | Escrow moves to next state |
| 4A | Client | Approves | Milestone status becomes Approved |
| 5A | Client | Releases funds | Payment goes to agency |
| 4B | Client | Requests changes | Escrow returns to Revision Requested |
| 5B | Agency | Updates deliverable | Agency resubmits |

### Approval Options

| Action | Meaning | Status |
| --- | --- | --- |
| Approve | Work accepted | Approved |
| Request Changes | Work not accepted yet | Revision Requested |
| Dispute | Serious disagreement | Disputed |
| Cancel | Only if allowed by agreement | Cancelled / Refund flow |

---

# 8. Release Flow

## Flow E — Funds Are Released

### Goal

Funds are sent to the agency after client approval.

### Steps

| Step | Actor | Action | System Result |
| --- | --- | --- | --- |
| 1 | Client / Release Signer | Clicks Release Funds | Release transaction starts |
| 2 | Wallet | Signs transaction | Contract validates permissions |
| 3 | Smart Contract | Checks approval state | Release allowed only if approved |
| 4 | Smart Contract | Sends payment to agency | Receiver gets milestone amount minus fees if applicable |
| 5 | Smart Contract | Routes platform fee | Platform address receives fee |
| 6 | System | Updates status | Escrow becomes Released / Closed |

### Status Transition

```
Approved → Released → Closed
```

### Fee Example

For a `1,250 USDC` milestone with a `0.3%` platform fee:

| Item | Amount |
| --- | --- |
| Gross milestone amount | 1,250.00 USDC |
| Platform fee | 3.75 USDC |
| Agency receives | 1,246.25 USDC |

---

# 9. Revision Flow

## Flow F — Client Requests Changes

### Goal

Client does not approve yet, but wants the agency to revise the work.

### Steps

| Step | User | Action | System Result |
| --- | --- | --- | --- |
| 1 | Client | Clicks Request Changes | Revision form opens |
| 2 | Client | Adds revision notes | Notes stored |
| 3 | System | Updates status | Escrow becomes Revision Requested |
| 4 | Agency | Reviews notes | Agency understands required changes |
| 5 | Agency | Updates deliverable | New work is prepared |
| 6 | Agency | Resubmits milestone | Status returns to In Review |

### Status Transition

```
In Review → Revision Requested → In Review
```

### MVP Note

This can be off-chain metadata at first. The smart contract may only need to understand broader states like:

```
Funded → In Review → Approved → Released
```

Revision details can live in the application layer.

---

# 10. Dispute Flow

## Flow G — Optional V2 Dispute Handling

### Goal

Resolve conflicts when client and agency disagree.

### Common Dispute Reasons

| Reason | Example |
| --- | --- |
| Scope disagreement | Client says deliverable does not match agreed scope |
| Quality disagreement | Client believes work is incomplete |
| Non-response | Client stops responding after delivery |
| Late delivery | Agency misses deadline |
| Payment disagreement | Parties disagree about release amount |
| Cancellation | Client wants to stop work after funding |

### Possible Dispute Flow

| Step | User | Action | System Result |
| --- | --- | --- | --- |
| 1 | Client or Agency | Opens dispute | Escrow status becomes Disputed |
| 2 | System | Freezes release | Funds cannot be released normally |
| 3 | Resolver | Reviews milestone and evidence | Resolver evaluates case |
| 4 | Resolver | Chooses outcome | Release, refund, split, or revise |
| 5 | Smart Contract / App | Executes decision | Funds move according to resolution |
| 6 | System | Closes escrow | Final state recorded |

### Resolver Outcomes

| Outcome | Meaning |
| --- | --- |
| Release to agency | Work was acceptable |
| Refund to client | Work was not delivered |
| Partial release | Some value was delivered |
| Revision required | Agency must fix before release |
| Cancel escrow | Agreement terminated |

### Recommendation

Do **not** make dispute resolution part of the first MVP unless the current contract already supports it cleanly.

For v1, use:

> “Disputes are handled manually/off-chain. The escrow remains locked until both parties agree or an admin/resolver process is triggered.”
> 

---

# 11. Multi-Milestone Flow

## Flow H — Monthly Retainer With Multiple Milestones

### Example

Client hires Tech Rebel for a `5,000 USDC` monthly sprint.

| Milestone | Amount | Due Date | Status |
| --- | --- | --- | --- |
| Discovery Brief | 1,250 USDC | Week 1 | Released |
| User Flow + Scope | 1,250 USDC | Week 2 | In Review |
| Prototype Plan | 1,250 USDC | Week 3 | Funded |
| Final Handoff | 1,250 USDC | Week 4 | Created |

## Two Possible Models

### Model A — One Escrow Per Milestone

Best for MVP.

```
Milestone 1 → Escrow 1
Milestone 2 → Escrow 2
Milestone 3 → Escrow 3
Milestone 4 → Escrow 4
```

**Pros**

- Simple
- Easy to understand
- Easier to build
- Easier to cancel or continue
- Lower contract complexity

**Cons**

- More repeated funding actions
- Less elegant for larger contracts

### Model B — One Escrow With Multiple Milestones

Better for later.

```
One Contract
    ├── Milestone 1: 1,250 USDC
    ├── Milestone 2: 1,250 USDC
    ├── Milestone 3: 1,250 USDC
    └── Milestone 4: 1,250 USDC
```

**Pros**

- Better for retainers
- One agreement
- Better dashboard
- Better monthly contract experience

**Cons**

- More contract complexity
- More state management
- More approval logic
- More edge cases

## Recommendation

Start with:

> **One escrow per milestone.**
> 

Then evolve to:

> **Multi-milestone escrow for retainers and larger agency contracts.**
> 

---

# 12. Escrow State Machine

## MVP State Machine

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

## Extended State Machine

```
Created
  ↓
Funded
  ↓
In Progress
  ↓
Submitted / In Review
  ├── Revision Requested
  │       ↓
  │   Submitted / In Review
  ├── Approved
  │       ↓
  │   Released
  │       ↓
  │   Closed
  └── Disputed
          ↓
      Resolved
          ↓
      Released / Refunded / Split / Cancelled
```

---

# 13. UX Screens Needed

## Agency Side

| Screen | Purpose |
| --- | --- |
| Agency Dashboard | View all client escrows |
| Create Escrow | Configure milestone |
| Escrow Preview | Confirm roles, amount, fee, and terms |
| Share Link | Send funding link to client |
| Submit Milestone | Mark work completed |
| Escrow Detail | Track status and history |

## Client Side

| Screen | Purpose |
| --- | --- |
| Escrow Review Page | Understand agreement before funding |
| Fund Escrow | Deposit stablecoins |
| Review Submission | Approve, request changes, or dispute |
| Release Funds | Sign release transaction |
| Escrow History | See what happened and when |

## Shared / Public

| Screen | Purpose |
| --- | --- |
| Escrow Viewer | Transparent status page |
| Activity Timeline | Show escrow events |
| Role Breakdown | Explain permissions |
| Transaction Details | Show funding/release transactions |

---

# 14. Data Model For Template

## Escrow Metadata

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
    asset: "USDC" | string;
    dueDate?: string;
    deliverableLinks?: string[];
  };

  roles: {
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
    | "in_progress"
    | "in_review"
    | "revision_requested"
    | "approved"
    | "released"
    | "closed"
    | "disputed"
    | "cancelled";

  timestamps: {
    createdAt: string;
    fundedAt?: string;
    submittedAt?: string;
    approvedAt?: string;
    releasedAt?: string;
    closedAt?: string;
  };
};
```

---

# 15. Acceptance Criteria

## Create Escrow

The agency can create an escrow when:

- client wallet is provided
- agency wallet is provided
- amount is provided
- milestone title is provided
- receiver is defined
- approver is defined
- release signer is defined
- platform fee address is defined

## Fund Escrow

The client can fund when:

- escrow status is `created`
- wallet is connected
- client has sufficient balance
- asset matches escrow configuration
- transaction is signed successfully

## Submit Milestone

The agency can submit when:

- escrow status is `funded` or `in_progress`
- connected wallet matches `milestoneMarker`
- delivery notes or proof are provided

## Approve Milestone

The client can approve when:

- escrow status is `in_review`
- connected wallet matches `approver`

## Release Funds

Funds can be released when:

- milestone status is `approved`
- connected wallet matches `releaseSigner`
- escrow has sufficient balance
- contract validates permissions
- platform fee is routed correctly

---

# 16. MVP Build Scope

## Must-Have

| Feature | Priority |
| --- | --- |
| Create one-milestone escrow | Must |
| Assign client and agency roles | Must |
| Define amount and asset | Must |
| Fund escrow | Must |
| Mark milestone complete | Must |
| Approve milestone | Must |
| Release funds | Must |
| Route platform fee | Must |
| Show status in viewer | Must |
| Show activity timeline | Must |

## Should-Have

| Feature | Priority |
| --- | --- |
| Email notifications | Should |
| Deliverable links | Should |
| Revision requested status | Should |
| Client-facing funding link | Should |
| Basic dashboard filters | Should |

## Nice-to-Have

| Feature | Priority |
| --- | --- |
| Multi-milestone contract | Later |
| Dispute flow | Later |
| Partial release | Later |
| Auto-release after approval window | Later |
| PDF agreement generation | Later |
| Embedded contract signing | Later |
| Fiat on-ramp | Later |
| Team/multisig approvals | Later |

---

# 17. Key Product Decisions

## Decision 1: Who creates the escrow?

**Recommendation:** Agency creates it.

Why:

- Agencies know their deliverables.
- Agencies are motivated to secure payment.
- It mirrors proposal/invoice creation.
- Client simply reviews and funds.

## Decision 2: Who approves?

**Recommendation:** Client approves.

Why:

- Client controls acceptance.
- It feels fair.
- It matches real agency workflows.

## Decision 3: Who releases funds?

**Recommendation for MVP:** Client releases.

Why:

- Simple mental model.
- Avoids automation complexity.
- Easy to explain in demos.

**Future improvement:** approval automatically enables release by automation/platform signer.

## Decision 4: One escrow or many?

**Recommendation:** One escrow per milestone for MVP.

Why:

- Easier to build.
- Easier to test.
- Lower complexity.
- Good for first dogfooding.

## Decision 5: Include disputes?

**Recommendation:** Not in MVP.

Why:

- Disputes increase scope.
- First value is secured funding + approval-based release.
- Manual dispute handling is acceptable for early pilots.

---

# 18. Ideal First Dogfood Scenario

## Tech Rebel Internal Pilot

### Contract

Tech Rebel sells a 4-week product/integration sprint.

### Amount

`5,000 USDC`

### Structure

| Week | Milestone | Amount |
| --- | --- | --- |
| Week 1 | Discovery + product brief | 1,250 USDC |
| Week 2 | User flow + scope definition | 1,250 USDC |
| Week 3 | Prototype or technical plan | 1,250 USDC |
| Week 4 | Final handoff + backlog | 1,250 USDC |

### MVP Execution

Create 4 separate milestone escrows.

Each week:

```
Client funds → Tech Rebel delivers → Client approves → Funds released
```

### Case Study Angle

> Tech Rebel used Trustless Work to manage a client engagement through milestone-based smart escrows, reducing invoice friction and creating a transparent delivery-payment workflow.
> 

---

# 19. Product Narrative

## For Agencies

> Stop chasing invoices. Create milestone escrows that clients fund before work begins and release when deliverables are approved.
> 

## For Clients

> Fund work safely. Your payment stays locked until the agreed milestone is delivered and approved.
> 

## For Trustless Work

> This template shows how any service provider can turn payment coordination into a transparent, programmable workflow.
> 

---

# 20. Next Build Step

Create the **Agency Escrow Template PRD** with:

1. Problem statement
2. Goals and non-goals
3. User stories
4. Functional requirements
5. API/contract assumptions
6. UX screens
7. Acceptance criteria
8. MVP scope
9. Future iterations
10. Open questions