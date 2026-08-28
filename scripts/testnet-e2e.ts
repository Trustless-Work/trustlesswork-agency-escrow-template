/**
 * Headless two-wallet testnet lifecycle proof for the Trustless Work integration
 * (issue #20). Runs BOTH payment directions end-to-end against the real
 * Trustless Work dev (testnet) API and real Stellar testnet, with no browser.
 *
 * It reuses the application's REAL payload mapper (`buildSingleReleaseDeployPayload`,
 * `feePercentFromBps`) so this exercises the shipped integration logic, not a
 * reimplementation. It generates throwaway testnet keypairs, funds them via
 * friendbot, gives them a trustline to the TW-recognized testnet USDC, and
 * acquires real USDC for the payer by swapping XLM on the testnet DEX. Then it
 * drives: create -> fund -> submit -> approve -> release, capturing contract IDs,
 * tx hashes, confirmed state, and USDC balance deltas (net-to-receiver + platform
 * fee routing) into an evidence matrix.
 *
 * Requirements: NEXT_PUBLIC_API_KEY (or TW_API_KEY) = a Trustless Work TESTNET
 * API key. Everything else is generated. No secrets are printed.
 *
 * Run: pnpm test:e2e            (both scenarios)
 *      pnpm test:e2e receivable (one scenario)
 *      E2E_SETUP_ONLY=1 pnpm test:e2e   (Stellar setup only, no API key needed)
 */

import {
  Asset,
  BASE_FEE,
  Horizon,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import type {
  CreateAgencyEscrowInput,
  PaymentDirection,
} from "../src/types/agency-escrow.ts";
import {
  buildSingleReleaseDeployPayload,
  feePercentFromBps,
  type DeployConfig,
} from "../src/features/escrow/services/testnet/tw-mappers.ts";

const TW_BASE_URL = "https://dev.api.trustlesswork.com";
const HORIZON_URL = "https://horizon-testnet.stellar.org";
const FRIENDBOT_URL = "https://friendbot.stellar.org";
const NETWORK = Networks.TESTNET;
const SYMBOL = "USDC";
const FEE_BPS = 30; // 0.30% platform fee (our app's 30 bps)
// Trustless Work charges its own protocol fee on release, on top of the platform
// fee. Observed empirically as 0.30% on testnet (net = amount - platform - TW).
const TW_PROTOCOL_FEE_BPS = 30;

// TW-recognized Stellar testnet USDC (issuer G-address). Confirmed by the TW
// smart-contract demo and by the app's deploy validation.
const USDC_ISSUER = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const USDC = new Asset(SYMBOL, USDC_ISSUER);

const API_KEY = (
  process.env.NEXT_PUBLIC_API_KEY ??
  process.env.TW_API_KEY ??
  ""
).trim();

const server = new Horizon.Server(HORIZON_URL);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Trustless Work REST helpers ─────────────────────────────────────────────

async function callTw<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${TW_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`TW ${path} -> ${res.status}: ${text.slice(0, 300)}`);
  }
  return JSON.parse(text) as T;
}

type TwWriteResponse = {
  status?: string;
  unsignedTransaction?: string;
  contractId?: string;
  message?: string;
};

/** Deploy with a bounded retry on TW's eventual-consistency validation error. */
async function deployWithAssetRetry(
  payload: unknown,
  attempts = 6,
  waitMs = 12000,
): Promise<TwWriteResponse> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await callTw<TwWriteResponse>("/deployer/single-release", payload);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (/does not have the required asset/i.test(msg) && i < attempts - 1) {
        console.log(
          `  deploy validation not ready (indexer lag), retry ${
            i + 1
          }/${attempts} in ${waitMs / 1000}s…`,
        );
        await sleep(waitMs);
        continue;
      }
      throw error;
    }
  }
  throw new Error("deploy retries exhausted");
}

/** Sign a TW unsigned XDR with the required role wallet and submit it. */
async function signAndSubmit(
  unsignedXdr: string | undefined,
  signer: Keypair,
): Promise<{ txHash: string; response: TwWriteResponse }> {
  if (!unsignedXdr) throw new Error("No unsignedTransaction returned by TW");
  const tx = TransactionBuilder.fromXDR(unsignedXdr, NETWORK);
  tx.sign(signer);
  const txHash = Buffer.from(tx.hash()).toString("hex");
  const response = await callTw<TwWriteResponse>("/helper/send-transaction", {
    signedXdr: tx.toXDR(),
  });
  return { txHash, response };
}

// ── Stellar testnet helpers ─────────────────────────────────────────────────

async function friendbot(pub: string): Promise<void> {
  const res = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(pub)}`);
  if (!res.ok && res.status !== 400) {
    throw new Error(`friendbot failed for ${pub}: ${res.status}`);
  }
}

async function submitClassic(
  source: Keypair,
  build: (b: TransactionBuilder) => TransactionBuilder,
): Promise<void> {
  const account = await server.loadAccount(source.publicKey());
  const builder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK,
  });
  const tx = build(builder).setTimeout(60).build();
  tx.sign(source);
  await server.submitTransaction(tx);
}

async function addTrustline(holder: Keypair): Promise<void> {
  await submitClassic(holder, (b) =>
    b.addOperation(Operation.changeTrust({ asset: USDC, limit: "1000000" })),
  );
}

/** Acquire real testnet USDC by swapping XLM on the DEX (USDC is not mintable). */
async function swapXlmForUsdc(holder: Keypair, sendXlm: string): Promise<void> {
  await submitClassic(holder, (b) =>
    b.addOperation(
      Operation.pathPaymentStrictSend({
        sendAsset: Asset.native(),
        sendAmount: sendXlm,
        destAsset: USDC,
        destMin: "0.0000001",
        destination: holder.publicKey(),
      }),
    ),
  );
}

async function usdcBalance(pub: string): Promise<number> {
  const account = await server.loadAccount(pub);
  const line = account.balances.find(
    (bal) =>
      bal.asset_type !== "native" &&
      "asset_code" in bal &&
      bal.asset_code === SYMBOL &&
      "asset_issuer" in bal &&
      bal.asset_issuer === USDC_ISSUER,
  );
  return line ? Number(line.balance) : 0;
}

// ── Evidence matrix ─────────────────────────────────────────────────────────

type MatrixRow = {
  step: string;
  role: string;
  expectedWallet: string;
  actualWallet: string;
  contractId: string;
  txRef: string;
  confirmed: string;
};

function short(addr: string): string {
  return addr ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : "—";
}

function printMatrix(title: string, rows: MatrixRow[]): void {
  console.log(`\n### ${title}\n`);
  console.log(
    "| Step | Role | Expected wallet | Actual wallet | Contract ID | Tx reference | Confirmed |",
  );
  console.log("| --- | --- | --- | --- | --- | --- | --- |");
  for (const r of rows) {
    console.log(
      `| ${r.step} | ${r.role} | ${short(r.expectedWallet)} | ${short(
        r.actualWallet,
      )} | ${r.contractId ? short(r.contractId) : "—"} | ${
        r.txRef ? r.txRef.slice(0, 12) + "…" : "—"
      } | ${r.confirmed} |`,
    );
  }
}

// ── One full lifecycle ──────────────────────────────────────────────────────

type Wallets = {
  A: Keypair; // workspace / issuer
  B: Keypair; // counterparty
  platform: Keypair;
  resolver: Keypair;
};

async function runScenario(
  direction: PaymentDirection,
  amount: number,
  w: Wallets,
): Promise<boolean> {
  const config: DeployConfig = {
    platformAddress: w.platform.publicKey(),
    disputeResolverAddress: w.resolver.publicKey(),
    usdcIssuer: USDC_ISSUER,
    assetSymbol: SYMBOL,
  };

  const input: CreateAgencyEscrowInput = {
    engagementId: `TR-E2E-${direction}-${Date.now()}`,
    paymentDirection: direction,
    workspace: { name: "Workspace A", walletAddress: w.A.publicKey() },
    counterparty: { name: "Counterparty B", walletAddress: w.B.publicKey() },
    agreement: {
      title: `E2E ${direction}`,
      description: `Automated ${direction} lifecycle proof`,
    },
    payment: { amount, asset: SYMBOL },
    milestone: {
      title: "Deliverable",
      description: "Automated deliverable",
      acceptanceCriteria: "Accepted automatically in the e2e run",
    },
    platformFeeBps: FEE_BPS,
    platformAddress: config.platformAddress,
    disputeResolverAddress: config.disputeResolverAddress,
  };

  const payer = direction === "receivable" ? w.B : w.A;
  const payee = direction === "receivable" ? w.A : w.B;
  const kp = new Map<string, Keypair>([
    [w.A.publicKey(), w.A],
    [w.B.publicKey(), w.B],
  ]);

  const rows: MatrixRow[] = [];
  const payload = buildSingleReleaseDeployPayload(input, config);

  console.log(
    `\n[${direction}] amount=${amount} ${SYMBOL}, platformFee=${feePercentFromBps(
      FEE_BPS,
    )}% (expected fee ${(amount * FEE_BPS) / 10_000} ${SYMBOL})`,
  );
  console.log(
    `[${direction}] roles: issuer=${short(payload.signer)} funder=${short(
      payload.roles.approver,
    )} serviceProvider=${short(payload.roles.serviceProvider)} receiver=${short(
      payload.roles.receiver,
    )}`,
  );

  const before = {
    payee: await usdcBalance(payee.publicKey()),
    platform: await usdcBalance(w.platform.publicKey()),
  };

  // 1) Create (issuer = workspace A signs)
  const deploy = await deployWithAssetRetry(payload);
  const created = await signAndSubmit(deploy.unsignedTransaction, w.A);
  const contractId = created.response.contractId ?? deploy.contractId ?? "";
  if (!contractId) throw new Error("No contractId returned from deploy");
  rows.push({
    step: "Create",
    role: "issuer",
    expectedWallet: payload.signer,
    actualWallet: w.A.publicKey(),
    contractId,
    txRef: created.txHash,
    confirmed: "created",
  });

  // 2) Fund (funder = payer)
  const fund = await callTw<TwWriteResponse>(
    "/escrow/single-release/fund-escrow",
    { contractId, signer: payload.roles.approver, amount },
  );
  const funded = await signAndSubmit(
    fund.unsignedTransaction,
    kp.get(payload.roles.approver)!,
  );
  rows.push({
    step: "Fund",
    role: "funder",
    expectedWallet: payload.roles.approver,
    actualWallet: payer.publicKey(),
    contractId,
    txRef: funded.txHash,
    confirmed: "funded",
  });

  // 3) Submit (serviceProvider = payee)
  const submit = await callTw<TwWriteResponse>(
    "/escrow/single-release/change-milestone-status",
    {
      contractId,
      serviceProvider: payload.roles.serviceProvider,
      milestoneIndex: "0",
      newStatus: "Under Review",
      newEvidence: "https://example.com/e2e-evidence",
    },
  );
  const submitted = await signAndSubmit(
    submit.unsignedTransaction,
    kp.get(payload.roles.serviceProvider)!,
  );
  rows.push({
    step: "Submit",
    role: "serviceProvider",
    expectedWallet: payload.roles.serviceProvider,
    actualWallet: payee.publicKey(),
    contractId,
    txRef: submitted.txHash,
    confirmed: "in review",
  });

  // 4) Approve (approver = payer). Does not move funds.
  const approve = await callTw<TwWriteResponse>(
    "/escrow/single-release/approve-milestone",
    { contractId, approver: payload.roles.approver, milestoneIndex: "0" },
  );
  const approved = await signAndSubmit(
    approve.unsignedTransaction,
    kp.get(payload.roles.approver)!,
  );
  const payeeAfterApprove = await usdcBalance(payee.publicKey());
  rows.push({
    step: "Approve",
    role: "approver",
    expectedWallet: payload.roles.approver,
    actualWallet: payer.publicKey(),
    contractId,
    txRef: approved.txHash,
    confirmed:
      payeeAfterApprove === before.payee
        ? "approved (no funds moved ✓)"
        : "approved (WARN funds moved)",
  });

  // 5) Release (releaseSigner = payer)
  const release = await callTw<TwWriteResponse>(
    "/escrow/single-release/release-funds",
    { contractId, releaseSigner: payload.roles.releaseSigner },
  );
  const released = await signAndSubmit(
    release.unsignedTransaction,
    kp.get(payload.roles.releaseSigner)!,
  );

  await sleep(4000); // let balances settle
  const after = {
    payee: await usdcBalance(payee.publicKey()),
    platform: await usdcBalance(w.platform.publicKey()),
  };
  const netToPayee = Number((after.payee - before.payee).toFixed(4));
  const feeToPlatform = Number((after.platform - before.platform).toFixed(4));
  const expectedFee = (amount * FEE_BPS) / 10_000;
  const twFee = (amount * TW_PROTOCOL_FEE_BPS) / 10_000;
  const expectedNet = amount - expectedFee - twFee;

  rows.push({
    step: "Release",
    role: "releaseSigner",
    expectedWallet: payload.roles.releaseSigner,
    actualWallet: payer.publicKey(),
    contractId,
    txRef: released.txHash,
    confirmed: "released",
  });

  printMatrix(
    `Scenario ${direction === "receivable" ? "A — Receivable" : "B — Payable"}`,
    rows,
  );
  console.log(
    `\nContract: https://stellar.expert/explorer/testnet/contract/${contractId}`,
  );
  console.log(
    `Money flow: payee net +${netToPayee} ${SYMBOL} (expected ${expectedNet}), platform fee +${feeToPlatform} ${SYMBOL} (expected ${expectedFee}), TW protocol fee ${twFee} ${SYMBOL}.`,
  );
  const ok =
    Math.abs(netToPayee - expectedNet) < 0.001 &&
    Math.abs(feeToPlatform - expectedFee) < 0.001;
  console.log(ok ? "RESULT: PASS ✓" : "RESULT: CHECK ✗ (amounts differ)");
  return ok;
}

async function setupWallets(): Promise<Wallets> {
  const A = Keypair.random();
  const B = Keypair.random();
  const platform = Keypair.random();
  const resolver = Keypair.random();

  console.log("Funding testnet accounts via friendbot…");
  await Promise.all(
    [A, B, platform, resolver].map((k) => friendbot(k.publicKey())),
  );
  await sleep(5000);

  console.log("Adding trustlines to the recognized testnet USDC…");
  for (const holder of [A, B, platform, resolver]) {
    await addTrustline(holder);
  }

  // Every role wallet holds some USDC (payers need enough to fund; platform and
  // resolver a nominal amount). USDC is acquired by swapping XLM on the DEX.
  console.log("Swapping XLM -> USDC for role wallets…");
  await swapXlmForUsdc(A, "1000");
  await swapXlmForUsdc(B, "1000");
  await swapXlmForUsdc(platform, "100");
  await swapXlmForUsdc(resolver, "100");

  console.log("Waiting for the indexer to observe new accounts…");
  await sleep(12000);

  return { A, B, platform, resolver };
}

async function main(): Promise<void> {
  const setupOnly = process.env.E2E_SETUP_ONLY === "1";

  if (!setupOnly && !API_KEY) {
    console.error(
      "Missing API key. Set NEXT_PUBLIC_API_KEY (testnet) in .env.local or the environment.",
    );
    process.exit(1);
  }

  const arg = process.argv[2] as PaymentDirection | undefined;
  const wallets = await setupWallets();

  console.log(`\nWorkspace A: ${wallets.A.publicKey()}`);
  console.log(`Counterparty B: ${wallets.B.publicKey()}`);
  console.log(`Platform: ${wallets.platform.publicKey()}`);
  console.log(`USDC issuer: ${USDC_ISSUER}`);

  if (setupOnly) {
    const balA = await usdcBalance(wallets.A.publicKey());
    const balB = await usdcBalance(wallets.B.publicKey());
    const balPlatform = await usdcBalance(wallets.platform.publicKey());
    console.log(
      `\nSetup OK ✓  USDC balances — A: ${balA}, B: ${balB}, platform: ${balPlatform}`,
    );
    return;
  }

  let allOk = true;
  if (arg === "receivable" || arg === "payable") {
    allOk = await runScenario(arg, 100, wallets);
  } else {
    const a = await runScenario("receivable", 100, wallets);
    const b = await runScenario("payable", 50, wallets);
    allOk = a && b;
  }
  console.log(`\nDone. ${allOk ? "ALL SCENARIOS PASSED ✓" : "SOME CHECKS FAILED ✗"}`);
  process.exit(allOk ? 0 : 1);
}

main().catch((error) => {
  console.error("\nE2E run failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
