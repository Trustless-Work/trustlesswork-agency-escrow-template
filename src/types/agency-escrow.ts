export type AgencyEscrowTemplateType = "agency_milestone";

export type AgencyEscrowStatus =
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

export type AgencyEscrowParty = {
  name: string;
  walletAddress: string;
  email?: string;
};

export type AgencyEscrowMilestone = {
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

export type AgencyEscrowRoles = {
  creator: string;
  funder: string;
  receiver: string;
  milestoneMarker: string;
  approver: string;
  releaseSigner: string;
  platformAddress: string;
  resolver?: string;
};

export type AgencyEscrowFee = {
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
  approvalTx?: string;
  releaseTx?: string;
};

export type AgencyEscrow = {
  escrowId: string;
  templateType: AgencyEscrowTemplateType;
  client: AgencyEscrowParty;
  agency: AgencyEscrowParty;
  milestone: AgencyEscrowMilestone;
  roles: AgencyEscrowRoles;
  fee: AgencyEscrowFee;
  status: AgencyEscrowStatus;
  timestamps: AgencyEscrowTimestamps;
  transactions: AgencyEscrowTransactions;
};
