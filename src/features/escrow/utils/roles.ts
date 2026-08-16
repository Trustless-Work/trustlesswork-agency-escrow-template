import type {
  AgencyEscrow,
  AgencyEscrowAction,
  AgencyEscrowParty,
  AgencyEscrowRoles,
  AgencyEscrowStatus,
  PaymentDirection,
} from "@/types/agency-escrow";

export type RoleDerivationInput = {
  paymentDirection: PaymentDirection;
  workspace: AgencyEscrowParty;
  counterparty: AgencyEscrowParty;
  platformAddress: string;
  disputeResolverAddress: string;
};

export function getPaymentParties(
  paymentDirection: PaymentDirection,
  workspace: AgencyEscrowParty,
  counterparty: AgencyEscrowParty,
): { payer: AgencyEscrowParty; payee: AgencyEscrowParty } {
  return paymentDirection === "receivable"
    ? { payer: counterparty, payee: workspace }
    : { payer: workspace, payee: counterparty };
}

export function deriveAgencyEscrowRoles({
  paymentDirection,
  workspace,
  counterparty,
  platformAddress,
  disputeResolverAddress,
}: RoleDerivationInput): AgencyEscrowRoles {
  const { payer, payee } = getPaymentParties(
    paymentDirection,
    workspace,
    counterparty,
  );

  return {
    issuer: workspace.walletAddress,
    funder: payer.walletAddress,
    serviceProvider: payee.walletAddress,
    approver: payer.walletAddress,
    releaseSigner: payer.walletAddress,
    receiver: payee.walletAddress,
    platformAddress,
    disputeResolver: disputeResolverAddress,
  };
}

const ACTION_STATUS: Record<AgencyEscrowAction, AgencyEscrowStatus[]> = {
  fund: ["created"],
  submit: ["funded", "revision_requested"],
  approve: ["in_review"],
  request_changes: ["in_review"],
  release: ["approved"],
};

export function canActorPerformAction(
  escrow: AgencyEscrow,
  action: AgencyEscrowAction,
  actorAddress: string | null | undefined,
): boolean {
  if (!actorAddress || !ACTION_STATUS[action].includes(escrow.status)) {
    return false;
  }

  const expectedAddress = {
    fund: escrow.roles.funder,
    submit: escrow.roles.serviceProvider,
    approve: escrow.roles.approver,
    request_changes: escrow.roles.approver,
    release: escrow.roles.releaseSigner,
  }[action];

  return expectedAddress === actorAddress;
}

export function getAvailableActions(
  escrow: AgencyEscrow,
  actorAddress: string | null | undefined,
): AgencyEscrowAction[] {
  const actions: AgencyEscrowAction[] = [
    "fund",
    "submit",
    "approve",
    "request_changes",
    "release",
  ];

  return actions.filter((action) =>
    canActorPerformAction(escrow, action, actorAddress),
  );
}
