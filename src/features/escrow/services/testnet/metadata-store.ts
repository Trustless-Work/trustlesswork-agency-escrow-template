import type {
  AgencyEscrowEvent,
  AgencyEscrowEventType,
  AgencyEscrowParty,
  AgencyEscrowTimestamps,
  AgencyEscrowTransactions,
  PaymentDirection,
} from "@/types/agency-escrow";

/**
 * Local metadata store for the testnet runtime.
 *
 * Trustless Work / the indexer are the source of truth for on-chain fields
 * (roles, amount, fee, milestone status/approved/evidence, balance, flags).
 * They do NOT store app-only concepts such as payment direction, party names,
 * agreement URL, due date, acceptance criteria, request-changes notes, or the
 * per-phase timestamps/tx references we captured. Those live here, keyed by the
 * on-chain contract ID, and are merged back into the stable AgencyEscrow model.
 *
 * Persistence is `localStorage` (V1 scope). This is per-browser: metadata does
 * NOT sync across devices. Cross-device parity would need real backend
 * persistence, which is explicitly out of scope for this issue.
 */

export type TestnetEscrowMeta = {
  contractId: string;
  engagementId: string;
  paymentDirection: PaymentDirection;
  workspace: AgencyEscrowParty;
  counterparty: AgencyEscrowParty;
  agreementUrl?: string;
  dueDate?: string;
  milestoneTitle: string;
  acceptanceCriteria: string;
  deliverySummary?: string;
  deliverableLinks?: string[];
  revisionNotes?: string;
  /** App-level workflow flag: changes requested before approval (never on-chain). */
  revisionRequested?: boolean;
  platformFeeBps: number;
  asset: string;
  timestamps: AgencyEscrowTimestamps;
  transactions: AgencyEscrowTransactions;
};

const META_KEY = "trustless-work-agency:testnet:meta:v1";
const EVENTS_KEY = "trustless-work-agency:testnet:events:v1";

function storage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

function readMap<T>(key: string): Record<string, T> {
  const store = storage();
  if (!store) return {};
  try {
    return JSON.parse(store.getItem(key) ?? "{}") as Record<string, T>;
  } catch {
    return {};
  }
}

function writeMap<T>(key: string, value: Record<string, T>): void {
  const store = storage();
  if (!store) return;
  store.setItem(key, JSON.stringify(value));
}

function id(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${random}`;
}

export function saveEscrowMeta(meta: TestnetEscrowMeta): void {
  const map = readMap<TestnetEscrowMeta>(META_KEY);
  map[meta.contractId] = meta;
  writeMap(META_KEY, map);
}

export function getEscrowMeta(contractId: string): TestnetEscrowMeta | null {
  return readMap<TestnetEscrowMeta>(META_KEY)[contractId] ?? null;
}

export function getAllEscrowMeta(): TestnetEscrowMeta[] {
  return Object.values(readMap<TestnetEscrowMeta>(META_KEY));
}

export function getKnownContractIds(): string[] {
  return Object.keys(readMap<TestnetEscrowMeta>(META_KEY));
}

export function patchEscrowMeta(
  contractId: string,
  patch: Partial<TestnetEscrowMeta>,
): TestnetEscrowMeta | null {
  const map = readMap<TestnetEscrowMeta>(META_KEY);
  const current = map[contractId];
  if (!current) return null;
  const next: TestnetEscrowMeta = {
    ...current,
    ...patch,
    timestamps: { ...current.timestamps, ...patch.timestamps },
    transactions: { ...current.transactions, ...patch.transactions },
  };
  map[contractId] = next;
  writeMap(META_KEY, map);
  return next;
}

export function appendEscrowEvent(
  contractId: string,
  type: AgencyEscrowEventType,
  options: { actor?: string; note?: string; transactionHash?: string } = {},
): void {
  const map = readMap<AgencyEscrowEvent[]>(EVENTS_KEY);
  const list = map[contractId] ?? [];
  list.push({
    id: id("event"),
    escrowId: contractId,
    type,
    timestamp: new Date().toISOString(),
    actor: options.actor,
    note: options.note,
    transactionHash: options.transactionHash,
  });
  map[contractId] = list;
  writeMap(EVENTS_KEY, map);
}

export function getEscrowEvents(contractId: string): AgencyEscrowEvent[] {
  const list = readMap<AgencyEscrowEvent[]>(EVENTS_KEY)[contractId] ?? [];
  return [...list].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}
