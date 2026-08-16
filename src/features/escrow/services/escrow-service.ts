import type {
  AgencyEscrow,
  AgencyEscrowEvent,
  CreateAgencyEscrowInput,
  EscrowRuntimeMode,
  RequestChangesInput,
  SubmitDeliverableInput,
} from "@/types/agency-escrow";
import { mockAgencyEscrowService } from "./mock-escrow-service";

export type EscrowActionContext = {
  escrowId: string;
  actorAddress: string;
};

export type SubmitDeliverableContext = EscrowActionContext & {
  data: SubmitDeliverableInput;
};

export type RequestChangesContext = EscrowActionContext & {
  data: RequestChangesInput;
};

export interface AgencyEscrowService {
  listEscrows(): Promise<AgencyEscrow[]>;
  getEscrow(escrowId: string): Promise<AgencyEscrow | null>;
  getEscrowEvents(escrowId: string): Promise<AgencyEscrowEvent[]>;
  createEscrow(input: CreateAgencyEscrowInput): Promise<AgencyEscrow>;
  fundEscrow(input: EscrowActionContext): Promise<AgencyEscrow>;
  submitDeliverable(input: SubmitDeliverableContext): Promise<AgencyEscrow>;
  requestChanges(input: RequestChangesContext): Promise<AgencyEscrow>;
  approveDeliverable(input: EscrowActionContext): Promise<AgencyEscrow>;
  releaseProtectedPayment(input: EscrowActionContext): Promise<AgencyEscrow>;
}

export function getEscrowRuntimeMode(): EscrowRuntimeMode {
  return process.env.NEXT_PUBLIC_ESCROW_MODE === "testnet" ? "testnet" : "mock";
}

export function getAgencyEscrowService(): AgencyEscrowService {
  const mode = getEscrowRuntimeMode();

  if (mode === "testnet") {
    throw new Error(
      "Testnet mode requires the Trustless Work adapter. Use NEXT_PUBLIC_ESCROW_MODE=mock until the SDK foundation is configured.",
    );
  }

  return mockAgencyEscrowService;
}
