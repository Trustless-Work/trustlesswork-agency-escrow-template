import type {
  AgencyEscrow,
  AgencyEscrowEvent,
  AgencyEscrowEventType,
  CreateAgencyEscrowInput,
} from "@/types/agency-escrow";
import { deriveAgencyEscrowRoles, canActorPerformAction } from "@/features/escrow/utils/roles";
import { assertTransition } from "@/features/escrow/utils/state-machine";
import { MOCK_ESCROW_SEED, MOCK_EVENT_SEED } from "./mock-seed";
import type {
  AgencyEscrowService,
  EscrowActionContext,
  RequestChangesContext,
  SubmitDeliverableContext,
} from "./escrow-service";

const ESCROWS_KEY = "trustless-work-agency:escrows:v1";
const EVENTS_KEY = "trustless-work-agency:events:v1";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function storage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

function initializeSeed(): void {
  const localStorage = storage();
  if (!localStorage) return;

  if (!localStorage.getItem(ESCROWS_KEY)) {
    localStorage.setItem(ESCROWS_KEY, JSON.stringify(MOCK_ESCROW_SEED));
  }
  if (!localStorage.getItem(EVENTS_KEY)) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(MOCK_EVENT_SEED));
  }
}

function readEscrows(): AgencyEscrow[] {
  initializeSeed();
  const localStorage = storage();
  if (!localStorage) return clone(MOCK_ESCROW_SEED);
  return JSON.parse(localStorage.getItem(ESCROWS_KEY) ?? "[]") as AgencyEscrow[];
}

function writeEscrows(escrows: AgencyEscrow[]): void {
  const localStorage = storage();
  if (!localStorage) return;
  localStorage.setItem(ESCROWS_KEY, JSON.stringify(escrows));
}

function readEvents(): AgencyEscrowEvent[] {
  initializeSeed();
  const localStorage = storage();
  if (!localStorage) return clone(MOCK_EVENT_SEED);
  return JSON.parse(localStorage.getItem(EVENTS_KEY) ?? "[]") as AgencyEscrowEvent[];
}

function writeEvents(events: AgencyEscrowEvent[]): void {
  const localStorage = storage();
  if (!localStorage) return;
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

function id(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${random}`;
}

function now(): string {
  return new Date().toISOString();
}

function findEscrow(escrowId: string): AgencyEscrow {
  const escrow = readEscrows().find((item) => item.escrowId === escrowId);
  if (!escrow) throw new Error(`Escrow not found: ${escrowId}`);
  return escrow;
}

function replaceEscrow(next: AgencyEscrow): AgencyEscrow {
  const escrows = readEscrows();
  const index = escrows.findIndex((item) => item.escrowId === next.escrowId);
  if (index < 0) throw new Error(`Escrow not found: ${next.escrowId}`);
  escrows[index] = next;
  writeEscrows(escrows);
  return clone(next);
}

function appendEvent(
  escrowId: string,
  type: AgencyEscrowEventType,
  actor?: string,
  note?: string,
): void {
  const events = readEvents();
  events.push({ id: id("event"), escrowId, type, timestamp: now(), actor, note });
  writeEvents(events);
}

function assertAction(
  escrow: AgencyEscrow,
  action: Parameters<typeof canActorPerformAction>[1],
  actorAddress: string,
): void {
  if (!canActorPerformAction(escrow, action, actorAddress)) {
    throw new Error(`Actor is not allowed to ${action} escrow ${escrow.escrowId}`);
  }
}

export const mockAgencyEscrowService: AgencyEscrowService = {
  async listEscrows() {
    return clone(readEscrows()).sort((a, b) =>
      b.timestamps.createdAt.localeCompare(a.timestamps.createdAt),
    );
  },

  async getEscrow(escrowId) {
    return clone(readEscrows().find((item) => item.escrowId === escrowId) ?? null);
  },

  async getEscrowEvents(escrowId) {
    return clone(
      readEvents()
        .filter((event) => event.escrowId === escrowId)
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    );
  },

  async createEscrow(input: CreateAgencyEscrowInput) {
    const createdAt = now();
    const escrowId = id("escrow");
    const roles = deriveAgencyEscrowRoles({
      paymentDirection: input.paymentDirection,
      workspace: input.workspace,
      counterparty: input.counterparty,
      platformAddress: input.platformAddress,
      disputeResolverAddress: input.disputeResolverAddress,
    });

    const escrow: AgencyEscrow = {
      escrowId,
      engagementId: input.engagementId,
      templateType: "agency_payment",
      paymentDirection: input.paymentDirection,
      workspace: input.workspace,
      counterparty: input.counterparty,
      agreement: input.agreement,
      payment: input.payment,
      milestone: input.milestone,
      roles,
      fee: {
        platformFeeBps: input.platformFeeBps,
        platformAddress: input.platformAddress,
      },
      status: "created",
      timestamps: { createdAt },
      transactions: {},
    };

    const escrows = readEscrows();
    escrows.unshift(escrow);
    writeEscrows(escrows);
    appendEvent(escrowId, "created", roles.issuer);
    return clone(escrow);
  },

  async fundEscrow({ escrowId, actorAddress }: EscrowActionContext) {
    const escrow = findEscrow(escrowId);
    assertAction(escrow, "fund", actorAddress);
    assertTransition(escrow.status, "funded");

    const next: AgencyEscrow = {
      ...escrow,
      status: "funded",
      timestamps: { ...escrow.timestamps, fundedAt: now() },
    };
    appendEvent(escrowId, "funded", actorAddress);
    return replaceEscrow(next);
  },

  async submitDeliverable({
    escrowId,
    actorAddress,
    data,
  }: SubmitDeliverableContext) {
    const escrow = findEscrow(escrowId);
    assertAction(escrow, "submit", actorAddress);
    const eventType: AgencyEscrowEventType =
      escrow.status === "revision_requested" ? "resubmitted" : "submitted";
    assertTransition(escrow.status, "in_review");

    const next: AgencyEscrow = {
      ...escrow,
      status: "in_review",
      milestone: {
        ...escrow.milestone,
        deliverySummary: data.deliverySummary,
        deliverableLinks: data.deliverableLinks,
        evidence: data.evidence,
      },
      timestamps: { ...escrow.timestamps, submittedAt: now() },
    };
    appendEvent(escrowId, eventType, actorAddress, data.deliverySummary);
    return replaceEscrow(next);
  },

  async requestChanges({ escrowId, actorAddress, data }: RequestChangesContext) {
    const escrow = findEscrow(escrowId);
    assertAction(escrow, "request_changes", actorAddress);
    assertTransition(escrow.status, "revision_requested");

    const next: AgencyEscrow = {
      ...escrow,
      status: "revision_requested",
      milestone: { ...escrow.milestone, revisionNotes: data.revisionNotes },
      timestamps: { ...escrow.timestamps, revisionRequestedAt: now() },
    };
    appendEvent(escrowId, "changes_requested", actorAddress, data.revisionNotes);
    return replaceEscrow(next);
  },

  async approveDeliverable({ escrowId, actorAddress }: EscrowActionContext) {
    const escrow = findEscrow(escrowId);
    assertAction(escrow, "approve", actorAddress);
    assertTransition(escrow.status, "approved");

    const next: AgencyEscrow = {
      ...escrow,
      status: "approved",
      timestamps: { ...escrow.timestamps, approvedAt: now() },
    };
    appendEvent(escrowId, "approved", actorAddress);
    return replaceEscrow(next);
  },

  async releaseProtectedPayment({ escrowId, actorAddress }: EscrowActionContext) {
    const escrow = findEscrow(escrowId);
    assertAction(escrow, "release", actorAddress);
    assertTransition(escrow.status, "released");

    const next: AgencyEscrow = {
      ...escrow,
      status: "released",
      timestamps: { ...escrow.timestamps, releasedAt: now() },
    };
    appendEvent(escrowId, "released", actorAddress);
    return replaceEscrow(next);
  },
};
