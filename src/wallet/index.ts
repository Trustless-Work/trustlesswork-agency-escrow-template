import {
  StelWalletName,
  StelModule,
  createStellarWallet,
} from "@creit.tech/stellar-wallets-kit";

// Agency Escrow V1 explicitly loads only the Freighter module to minimize
// hardware-wallet / Trezor transitive surface. The Trezor stack pulls in
// @trezor/protobuf which historically resolved protobufjs@7.4.0 / 7.5.5,
// both of which are covered by the GHSA-* advisory family (all ≤ 7.5.5).
//
// By using `modules: [StelModule.FREIGHTER]` instead of `defaultModules()`,
// we avoid pulling the full Trezor dependency chain when only Freighter
// signing is required on TESTNET.
//
// If additional wallet support (e.g. Keystone) is added later, add the
// corresponding StelModule entry here rather than reverting to defaultModules().

export const wallet = createStellarWallet({
  name: "AgencyEscrowV1",
  modules: [StelModule.FREIGHTER],
});

export { StelWalletName, StelModule };
