import React, { useState, useEffect } from "react";
import {
  StelWalletName,
  StelModule,
  wallet as stelWallet,
} from "../wallet";

interface WalletConnectProps {
  onConnected: (address: string) => void;
  onDisconnected: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  onConnected,
  onDisconnected,
}) => {
  const [address, setAddress] = useState<string>("");
  const [walletName, setWalletName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Current logged-in wallet info
  useEffect(() => {
    (async () => {
      try {
        const { name, address: addr } = await stelWallet.getAddress();
        if (addr) {
          setAddress(addr);
          setWalletName(name);
        }
      } catch {
        // Not connected — that's fine
      }
    })();
  }, []);

  const connect = async () => {
    setLoading(true);
    setError("");
    try {
      await stelWallet.setSelectedWallet(StelWalletName.FREIGHTER);
      const { address: addr, name } = await stelWallet.getAddress();
      setAddress(addr);
      setWalletName(name ?? StelWalletName.FREIGHTER);
      onConnected(addr);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Connection failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      await stelWallet.disconnect();
      setAddress("");
      setWalletName("");
      onDisconnected();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Disconnect failed: ${msg}`);
    }
  };

  const switchWallet = async (target: StelWalletName) => {
    setLoading(true);
    setError("");
    try {
      await stelWallet.setSelectedWallet(target);
      const { address: addr, name } = await stelWallet.getAddress();
      setAddress(addr);
      setWalletName(name ?? target);
      onConnected(addr);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Switch failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-connect">
      <h3>Wallet Connection</h3>
      {address && (
        <p>
          Connected: <strong>{address}</strong> ({walletName})
        </p>
      )}
      {!address && (
        <>
          <button onClick={connect} disabled={loading}>
            {loading ? "Connecting…" : "Connect Freighter (TESTNET)"}
          </button>
          <p className="hint">
            Freighter is the only module loaded for V1. This intentionally
            narrows the dependency surface and removes the Trezor
            <code> @trezor/protobuf</code> transitive path that previously
            pulled in vulnerable <code>protobufjs ≤ 7.5.5</code>.
          </p>
        </>
      )}
      {address && (
        <button onClick={disconnect} disabled={loading}>
          Disconnect
        </button>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
};
