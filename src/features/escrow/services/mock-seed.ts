import type { AgencyEscrow, AgencyEscrowEvent } from "@/types/agency-escrow";
import { deriveAgencyEscrowRoles } from "@/features/escrow/utils/roles";

const TECHREBEL = {
  name: "TechRebel",
  email: "hello@techrebel.world",
  walletAddress: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
};

const ACME = {
  name: "Acme",
  email: "ops@acme.example",
  walletAddress: "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
};

const MARIA = {
  name: "Maria",
  email: "maria@example.com",
  walletAddress: "GCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
};

const PLATFORM = "GDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD";

function roles(
  paymentDirection: AgencyEscrow["paymentDirection"],
  counterparty: AgencyEscrow["counterparty"],
) {
  return deriveAgencyEscrowRoles({
    paymentDirection,
    workspace: TECHREBEL,
    counterparty,
    platformAddress: PLATFORM,
    disputeResolverAddress: PLATFORM,
  });
}

export const MOCK_ESCROW_SEED: AgencyEscrow[] = [
  {
    escrowId: "demo-receivable-created",
    engagementId: "TR-ACME-001",
    templateType: "agency_payment",
    paymentDirection: "receivable",
    workspace: TECHREBEL,
    counterparty: ACME,
    agreement: {
      title: "Product strategy sprint",
      description: "Two-week product strategy and roadmap engagement.",
      agreementUrl: "https://example.com/proposals/acme-strategy",
      dueDate: "2026-09-05",
    },
    payment: { amount: 5000, asset: "USDC" },
    milestone: {
      title: "Strategy sprint delivery",
      description: "Research summary, prioritized roadmap, and final workshop.",
      acceptanceCriteria:
        "Roadmap delivered, workshop completed, and final recommendations shared.",
    },
    roles: roles("receivable", ACME),
    fee: { protocolFeeBps: 30, platformFeeBps: 30, platformAddress: PLATFORM },
    status: "created",
    timestamps: { createdAt: "2026-08-16T14:00:00.000Z" },
    transactions: {},
  },
  {
    escrowId: "demo-payable-funded",
    engagementId: "TR-MARIA-001",
    templateType: "agency_payment",
    paymentDirection: "payable",
    workspace: TECHREBEL,
    counterparty: MARIA,
    agreement: {
      title: "Landing page implementation",
      description: "Implement the approved landing page design in Next.js.",
      dueDate: "2026-08-30",
    },
    payment: { amount: 2000, asset: "USDC" },
    milestone: {
      title: "Production-ready landing page",
      description: "Responsive implementation of the approved design.",
      acceptanceCriteria:
        "Matches approved design, responsive on mobile/desktop, and deployed to staging.",
    },
    roles: roles("payable", MARIA),
    fee: { protocolFeeBps: 30, platformFeeBps: 30, platformAddress: PLATFORM },
    status: "funded",
    timestamps: {
      createdAt: "2026-08-14T12:00:00.000Z",
      fundedAt: "2026-08-14T12:30:00.000Z",
    },
    transactions: {},
  },
  {
    escrowId: "demo-receivable-review",
    engagementId: "TR-ACME-002",
    templateType: "agency_payment",
    paymentDirection: "receivable",
    workspace: TECHREBEL,
    counterparty: ACME,
    agreement: {
      title: "Web3 product audit",
      description: "Product and onboarding audit with prioritized recommendations.",
    },
    payment: { amount: 3200, asset: "USDC" },
    milestone: {
      title: "Audit report",
      description: "Final audit report and review call.",
      acceptanceCriteria: "Report includes findings, priorities, and recommended next actions.",
      deliverySummary: "Final audit report is ready for review.",
      deliverableLinks: ["https://example.com/deliverables/product-audit"],
      evidence: "https://example.com/deliverables/product-audit",
    },
    roles: roles("receivable", ACME),
    fee: { protocolFeeBps: 30, platformFeeBps: 30, platformAddress: PLATFORM },
    status: "in_review",
    timestamps: {
      createdAt: "2026-08-10T10:00:00.000Z",
      fundedAt: "2026-08-10T11:00:00.000Z",
      submittedAt: "2026-08-15T15:00:00.000Z",
    },
    transactions: {},
  },
  {
    escrowId: "demo-payable-approved",
    engagementId: "TR-MARIA-002",
    templateType: "agency_payment",
    paymentDirection: "payable",
    workspace: TECHREBEL,
    counterparty: MARIA,
    agreement: {
      title: "Event microsite",
      description: "Build and ship a lightweight event microsite.",
    },
    payment: { amount: 1500, asset: "USDC" },
    milestone: {
      title: "Microsite deployed",
      description: "Responsive microsite deployed to production.",
      acceptanceCriteria: "Production URL is live and final QA checklist passes.",
      deliverySummary: "Microsite deployed and QA complete.",
      deliverableLinks: ["https://example.com/event-site"],
    },
    roles: roles("payable", MARIA),
    fee: { protocolFeeBps: 30, platformFeeBps: 30, platformAddress: PLATFORM },
    status: "approved",
    timestamps: {
      createdAt: "2026-08-08T09:00:00.000Z",
      fundedAt: "2026-08-08T09:20:00.000Z",
      submittedAt: "2026-08-15T18:00:00.000Z",
      approvedAt: "2026-08-16T09:00:00.000Z",
    },
    transactions: {},
  },
];

export const MOCK_EVENT_SEED: AgencyEscrowEvent[] = [
  {
    id: "event-created-1",
    escrowId: "demo-receivable-created",
    type: "created",
    timestamp: "2026-08-16T14:00:00.000Z",
    actor: TECHREBEL.walletAddress,
  },
  {
    id: "event-created-2",
    escrowId: "demo-payable-funded",
    type: "created",
    timestamp: "2026-08-14T12:00:00.000Z",
    actor: TECHREBEL.walletAddress,
  },
  {
    id: "event-funded-2",
    escrowId: "demo-payable-funded",
    type: "funded",
    timestamp: "2026-08-14T12:30:00.000Z",
    actor: TECHREBEL.walletAddress,
  },
  {
    id: "event-created-3",
    escrowId: "demo-receivable-review",
    type: "created",
    timestamp: "2026-08-10T10:00:00.000Z",
    actor: TECHREBEL.walletAddress,
  },
  {
    id: "event-funded-3",
    escrowId: "demo-receivable-review",
    type: "funded",
    timestamp: "2026-08-10T11:00:00.000Z",
    actor: ACME.walletAddress,
  },
  {
    id: "event-submitted-3",
    escrowId: "demo-receivable-review",
    type: "submitted",
    timestamp: "2026-08-15T15:00:00.000Z",
    actor: TECHREBEL.walletAddress,
  },
  {
    id: "event-created-4",
    escrowId: "demo-payable-approved",
    type: "created",
    timestamp: "2026-08-08T09:00:00.000Z",
    actor: TECHREBEL.walletAddress,
  },
  {
    id: "event-funded-4",
    escrowId: "demo-payable-approved",
    type: "funded",
    timestamp: "2026-08-08T09:20:00.000Z",
    actor: TECHREBEL.walletAddress,
  },
  {
    id: "event-submitted-4",
    escrowId: "demo-payable-approved",
    type: "submitted",
    timestamp: "2026-08-15T18:00:00.000Z",
    actor: MARIA.walletAddress,
  },
  {
    id: "event-approved-4",
    escrowId: "demo-payable-approved",
    type: "approved",
    timestamp: "2026-08-16T09:00:00.000Z",
    actor: TECHREBEL.walletAddress,
  },
];
