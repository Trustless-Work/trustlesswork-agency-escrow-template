export type AgencyEscrowTemplateType = "agency_payment";

export type PaymentDirection = "receivable" | "payable";
export type EscrowRuntimeMode = "mock" | "testnet";

export type AgencyEscrowStatus =
  | "created"
  | "funded"
  | "in_review"
  | "revision_requested"
  | "approved"
  | "released"
  | "closed";

export type AgencyEscrowAction =
  | "fund"
  | "submit"
  | "approve"
  | "request_changes"
  | "release";

export type AgencyEscrowParty = {
  name: string;
  walletAddress: string;
  email?: string;
};

export type AgencyEscrowAgreement = {
  title: string;
  description: string;
  agreementUrl?: string;
  dueDate?: string;
};

export type AgencyEscrowPayment = {
  amount: number;
  asset: string;
};

export type AgencyEscrowMilestone = {
  title: string;
  description: string;
  acceptanceCriteria: string;
  deliverySummary?: string;
  deliverableLinks?: string[];
  revisionNotes?: string;
  evidence?: string;
};

/**
 * Application-level authorization map. The Trustless Work adapter translates
 * this into SDK payload fields. Keeping issuer/funder here lets the app express
 * actor authorization even when a particular SDK payload uses `signer` instead.
 */
export type AgencyEscrowRoles = {
  issuer: string;
  funder: string;
  serviceProvider: string;
  approver: string;
  releaseSigner: string;
  receiver: string;
  platformAddress: string;
  disputeResolver: string;
};

export type AgencyEscrowFee = {
  protocolFeeBps: number;
  platformFeeBps: number;
  platformAddress: string;
};

export type AgencyEscrowTimestamps = {
  createdAt: string;
  fundedAt?: string;
  submittedAt?: string;
  revisionRequestedAt?: string;
  approvedAt?: string;
  releasedAt?: string;
  closedAt?: string;
};

export type AgencyEscrowTransactions = {
  creationTx?: string;
  fundingTx?: string;
  submissionTx?: string;
  approvalTx?: string;
  releaseTx?: string;
};

export type AgencyEscrow = {
  escrowId: string;
  contractId?: string;
  engagementId: string;
  templateType: AgencyEscrowTemplateType;
  paymentDirection: PaymentDirection;
  workspace: AgencyEscrowParty;
  counterparty: AgencyEscrowParty;
  agreement: AgencyEscrowAgreement;
  payment: AgencyEscrowPayment;
  milestone: AgencyEscrowMilestone;
  roles: AgencyEscrowRoles;
  fee: AgencyEscrowFee;
  status: AgencyEscrowStatus;
  timestamps: AgencyEscrowTimestamps;
  transactions: AgencyEscrowTransactions;
};

export type CreateAgencyEscrowInput = {
  engagementId: string;
  paymentDirection: PaymentDirection;
  workspace: AgencyEscrowParty;
  counterparty: AgencyEscrowParty;
  agreement: AgencyEscrowAgreement;
  payment: AgencyEscrowPayment;
  milestone: Pick<
    AgencyEscrowMilestone,
    "title" | "description" | "acceptanceCriteria"
  >;
  platformFeeBps: number;
  platformAddress: string;
  disputeResolverAddress: string;
};

export type SubmitDeliverableInput = {
  deliverySummary: string;
  deliverableLinks?: string[];
  evidence?: string;
};

export type RequestChangesInput = {
  revisionNotes: string;
};

export type AgencyEscrowEventType =
  | "created"
  | "funded"
  | "submitted"
  | "changes_requested"
  | "resubmitted"
  | "approved"
  | "released"
  | "closed";

export type AgencyEscrowEvent = {
  id: string;
  escrowId: string;
  type: AgencyEscrowEventType;
  timestamp: string;
  actor?: string;
  note?: string;
  transactionHash?: string;
};
