import {
  getAvailableActions,
  getPaymentParties,
} from "@/features/escrow/utils/roles";
import type {
  AgencyEscrow,
  AgencyEscrowAction,
  AgencyEscrowParty,
  AgencyEscrowStatus,
} from "@/types/agency-escrow";

export type ViewerNextActionKey = "fund" | "submit" | "review" | "release";

export type ViewerNextAction = {
  key: ViewerNextActionKey;
  href: string;
  label: string;
  description: string;
  availableToViewer: boolean;
};

const STATUS_NEXT_ACTION: Partial<
  Record<AgencyEscrowStatus, ViewerNextActionKey>
> = {
  created: "fund",
  funded: "submit",
  revision_requested: "submit",
  in_review: "review",
  approved: "release",
};

const ACTION_HREF: Record<ViewerNextActionKey, (escrowId: string) => string> = {
  fund: (escrowId) => `/escrow/${escrowId}/fund`,
  submit: (escrowId) => `/escrow/${escrowId}/submit`,
  review: (escrowId) => `/escrow/${escrowId}/review`,
  release: (escrowId) => `/escrow/${escrowId}/release`,
};

const ACTION_TO_KEY: Record<AgencyEscrowAction, ViewerNextActionKey> = {
  fund: "fund",
  submit: "submit",
  approve: "review",
  request_changes: "review",
  release: "release",
};

function partyForAction(
  key: ViewerNextActionKey,
  payer: AgencyEscrowParty,
  payee: AgencyEscrowParty,
): AgencyEscrowParty {
  return key === "submit" ? payee : payer;
}

function actionCopy(
  key: ViewerNextActionKey,
  waitingOn: AgencyEscrowParty,
  availableToViewer: boolean,
  isResubmit: boolean,
): { label: string; description: string } {
  if (key === "fund") {
    return {
      label: "Fund escrow",
      description: availableToViewer
        ? "Lock the payment before work starts."
        : `Waiting for ${waitingOn.name} to fund.`,
    };
  }

  if (key === "submit") {
    return {
      label: isResubmit ? "Resubmit work" : "Submit work",
      description: availableToViewer
        ? isResubmit
          ? "Address the requested changes and resubmit."
          : "Submit the deliverable for review."
        : `Waiting for ${waitingOn.name} to submit work.`,
    };
  }

  if (key === "review") {
    return {
      label: "Review delivery",
      description: availableToViewer
        ? "Approve the work or request changes."
        : `Waiting for ${waitingOn.name} to review.`,
    };
  }

  return {
    label: "Release funds",
    description: availableToViewer
      ? "Release the locked payment to the payee."
      : `Waiting for ${waitingOn.name} to release funds.`,
  };
}

export function getViewerNextAction(
  escrow: AgencyEscrow,
  viewerAddress?: string,
): ViewerNextAction | null {
  const key = STATUS_NEXT_ACTION[escrow.status];
  if (!key) return null;

  const { payer, payee } = getPaymentParties(
    escrow.paymentDirection,
    escrow.workspace,
    escrow.counterparty,
  );
  const waitingOn = partyForAction(key, payer, payee);
  const availableToViewer = viewerAddress
    ? getAvailableActions(escrow, viewerAddress).some(
        (action) => ACTION_TO_KEY[action] === key,
      )
    : false;

  return {
    key,
    href: ACTION_HREF[key](escrow.escrowId),
    availableToViewer,
    ...actionCopy(
      key,
      waitingOn,
      availableToViewer,
      escrow.status === "revision_requested",
    ),
  };
}
