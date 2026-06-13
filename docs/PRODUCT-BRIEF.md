## Agency Escrow Template — Product Brief

Full User Flow + Escrow Role Mapping

### One-liner

A milestone-based escrow workflow for agencies, consultants, and product studios to secure client funds upfront, deliver work in clear increments, and release payment only after approval.

### Core Problem

Agency work breaks when **delivery, scope, and payment** become unclear.

Clients do not want to pay large retainers blindly.

Agencies do not want to start work without secured funds.

Both sides lose trust when invoices, approvals, and deliverables are tracked separately.

### Core Use Case

A client funds an escrow for a specific deliverable, sprint, epic, or milestone. The agency starts work once funds are secured. When the work is delivered, the client approves it and funds are released to the agency.

### Parties

| Party | Role |
| --- | --- |
| Client | Funds escrow and approves delivery |
| Agency / Provider | Delivers the work and receives payment |
| Milestone Marker | Marks work as submitted / completed |
| Approver | Confirms milestone acceptance |
| Release Signer | Releases funds after approval |
| Platform Address | Receives Trustless Work/platform fee |
| Optional Resolver | Handles disputes |

### Core Flow

1. Client and agency define a milestone.
2. Client funds escrow.
3. Agency begins work.
4. Agency submits deliverable.
5. Milestone is marked as completed.
6. Client reviews.
7. Client approves or disputes.
8. Funds are released to agency.
9. Platform fee is routed.
10. Next milestone escrow is created or funded.

### MVP Version

**Template name:** Agency Escrow Template

**MVP scope:**

- Create escrow for one milestone
- Define client, agency, approver, release signer, and platform fee address
- Fund escrow
- Mark milestone as completed
- Approve milestone
- Release funds
- Show escrow status in dashboard/viewer

### Example

A client hires Tech Rebel for a `$5,000/month` product sprint.

The sprint is split into 4 milestones:

| Milestone | Value |
| --- | --- |
| Product discovery brief | $1,250 |
| User flow + scope definition | $1,250 |
| Prototype / implementation plan | $1,250 |
| Final handoff package | $1,250 |

Each milestone can be funded, delivered, approved, and released independently.

### Why This Is Strong

- Immediate internal dogfooding
- Clear pain
- Simple workflow
- Natural milestone structure
- Strong stablecoin use case for global agencies
- Easy content angle: “stop chasing invoices”
- Strong template for developers to copy
- Can evolve into a vertical later