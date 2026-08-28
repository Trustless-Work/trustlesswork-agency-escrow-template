import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getTestnetConfig,
  isMainnetRequested,
  isStellarAddress,
} from "./escrow-config.ts";

const G = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";

function resetEnv() {
  delete process.env.NEXT_PUBLIC_USE_MAINNET;
  process.env.NEXT_PUBLIC_API_KEY = "";
  process.env.NEXT_PUBLIC_PLATFORM_ADDRESS = "";
  process.env.NEXT_PUBLIC_DISPUTE_RESOLVER_ADDRESS = "";
  process.env.NEXT_PUBLIC_USDC_ISSUER = "";
}

test("isStellarAddress validates G-addresses", () => {
  assert.equal(isStellarAddress(G), true);
  assert.equal(isStellarAddress("not-a-wallet"), false);
  assert.equal(
    isStellarAddress("CA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZ"),
    false,
  );
  assert.equal(isStellarAddress(""), false);
});

test("getTestnetConfig fails fast when values are missing", () => {
  resetEnv();
  assert.throws(() => getTestnetConfig(), /configuration is incomplete/i);
});

test("getTestnetConfig fails fast when mainnet is requested", () => {
  resetEnv();
  process.env.NEXT_PUBLIC_USE_MAINNET = "true";
  assert.equal(isMainnetRequested(), true);
  assert.throws(() => getTestnetConfig(), /mainnet is out of scope/i);
});

test("getTestnetConfig rejects a C-address USDC issuer", () => {
  resetEnv();
  process.env.NEXT_PUBLIC_API_KEY = "test-key";
  process.env.NEXT_PUBLIC_PLATFORM_ADDRESS = G;
  process.env.NEXT_PUBLIC_DISPUTE_RESOLVER_ADDRESS = G;
  process.env.NEXT_PUBLIC_USDC_ISSUER =
    "CA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZ";
  assert.throws(() => getTestnetConfig(), /G-issuer|valid G-address/i);
});

test("getTestnetConfig returns a valid config when fully set", () => {
  resetEnv();
  process.env.NEXT_PUBLIC_API_KEY = "test-key";
  process.env.NEXT_PUBLIC_PLATFORM_ADDRESS = G;
  process.env.NEXT_PUBLIC_DISPUTE_RESOLVER_ADDRESS = G;
  process.env.NEXT_PUBLIC_USDC_ISSUER = G;

  const config = getTestnetConfig();
  assert.equal(config.network, "testnet");
  assert.equal(config.assetSymbol, "USDC");
  assert.equal(config.usdcIssuer, G);
  assert.equal(config.networkPassphrase, "Test SDF Network ; September 2015");
});
