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

/**
 * The singleton service backs MOCK mode only. Testnet mode is orchestrated
 * through React hooks (`useTestnetEscrowRuntime`), because the Trustless Work
 * SDK write/read APIs are React hooks and must run inside React context — they
 * cannot be called from a plain singleton. The application hooks branch on the
 * runtime mode, so this function is never reached in testnet mode.
 */
export function getAgencyEscrowService(): AgencyEscrowService {
  const mode = getEscrowRuntimeMode();

  if (mode === "testnet") {
    throw new Error(
      "getAgencyEscrowService() is mock-only. Testnet writes/reads go through useTestnetEscrowRuntime; this path should not be reached in testnet mode.",
    );
  }

  return mockAgencyEscrowService;
}
