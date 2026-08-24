import type {
  AgencyEscrow,
  AgencyEscrowParty,
  AgencyEscrowStatus,
} from '@/types/agency-escrow'
import {
  canActorPerformAction,
  getPaymentParties,
} from '@/features/escrow/utils/roles'

export type SubmissionMode = 'submit' | 'resubmit'

export type ServiceProviderIdentity = {
  party: AgencyEscrowParty
  /** Which side of the workspace/counterparty pair does the work in this escrow. */
  side: 'workspace' | 'counterparty'
}

export type SubmissionAccess =
  | { state: 'allowed'; mode: SubmissionMode }
  | { state: 'blocked'; title: string; description: string }

/**
 * The service provider is always the payee, derived from `paymentDirection`.
 * It is never hard-coded to the workspace.
 */
export function getServiceProvider(escrow: AgencyEscrow): ServiceProviderIdentity {
  const { payee } = getPaymentParties(
    escrow.paymentDirection,
    escrow.workspace,
    escrow.counterparty,
  )

  return {
    party: payee,
    side:
      payee.walletAddress === escrow.workspace.walletAddress
        ? 'workspace'
        : 'counterparty',
  }
}

const STATUS_BLOCK_COPY: Record<
  Exclude<AgencyEscrowStatus, 'funded' | 'revision_requested'>,
  { title: string; description: string }
> = {
  created: {
    title: 'This engagement is not funded yet',
    description:
      'Work can only be submitted once the payer has funded the protected payment. You will be able to submit as soon as the funds are locked in escrow.',
  },
  in_review: {
    title: 'Delivery is already under review',
    description:
      'This deliverable has been submitted and is waiting on the approver. You can submit again only if changes are requested.',
  },
  approved: {
    title: 'Delivery has been approved',
    description:
      'Approval is final on-chain, so no further submissions are possible for this engagement.',
  },
  released: {
    title: 'Payment has already been released',
    description: 'This engagement is complete and no longer accepts submissions.',
  },
  closed: {
    title: 'This engagement is closed',
    description: 'Closed engagements no longer accept submissions.',
  },
}

export type SubmissionAccessInput = {
  escrow: AgencyEscrow
  walletAddress: string | null
  isMock: boolean
}

/**
 * Mock mode intentionally acts on behalf of the escrow role rather than the
 * connected wallet (see `useActionActor`), so identity is gated on the wallet
 * only outside mock mode. Status is always gated.
 */
export function resolveSubmissionAccess({
  escrow,
  walletAddress,
  isMock,
}: SubmissionAccessInput): SubmissionAccess {
  if (escrow.status !== 'funded' && escrow.status !== 'revision_requested') {
    return { state: 'blocked', ...STATUS_BLOCK_COPY[escrow.status] }
  }

  const serviceProvider = getServiceProvider(escrow)

  if (!isMock) {
    if (!walletAddress) {
      return {
        state: 'blocked',
        title: 'Connect a wallet to submit',
        description: `Only ${serviceProvider.party.name}, the service provider on this engagement, can submit the deliverable.`,
      }
    }

    if (!canActorPerformAction(escrow, 'submit', walletAddress)) {
      return {
        state: 'blocked',
        title: 'You are not the service provider',
        description: `The connected wallet does not match the service provider for this engagement. Only ${serviceProvider.party.name} can submit work here.`,
      }
    }
  }

  return {
    state: 'allowed',
    mode: escrow.status === 'revision_requested' ? 'resubmit' : 'submit',
  }
}
