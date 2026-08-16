"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useTrustlessWorkRuntime } from "@/lib/trustlesswork-provider";

const MOCK_WORKSPACE_ADDRESS =
  "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const TESTNET_PASSPHRASE = "Test SDF Network ; September 2015";
const PUBLIC_PASSPHRASE = "Public Global Stellar Network ; September 2015";

let realWalletInitialized = false;

async function getRealWalletKit() {
  const [{ StellarWalletsKit }, { defaultModules }, { Networks }] =
    await Promise.all([
      import("@creit.tech/stellar-wallets-kit/sdk"),
      import("@creit.tech/stellar-wallets-kit/modules/utils"),
      import("@creit.tech/stellar-wallets-kit/types"),
    ]);

  if (!realWalletInitialized) {
    StellarWalletsKit.init({
      modules: defaultModules(),
      network:
        process.env.NEXT_PUBLIC_USE_MAINNET === "true"
          ? Networks.PUBLIC
          : Networks.TESTNET,
    });
    realWalletInitialized = true;
  }

  return StellarWalletsKit;
}

type WalletContextType = {
  connected: boolean;
  address: string | null;
  isMock: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  setMockAddress: (address: string | null) => void;
  signTransaction: (unsignedXdr: string, signerAddress?: string) => Promise<string>;
};

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { mode, isMainnet } = useTrustlessWorkRuntime();
  const isMock = mode === "mock";
  const [address, setAddress] = useState<string | null>(
    isMock ? MOCK_WORKSPACE_ADDRESS : null,
  );

  useEffect(() => {
    if (isMock) return;

    let active = true;
    void getRealWalletKit()
      .then((kit) => kit.getAddress())
      .then(({ address: restoredAddress }) => {
        if (active) setAddress(restoredAddress);
      })
      .catch(() => {
        // A missing prior wallet session is expected on first load.
      });

    return () => {
      active = false;
    };
  }, [isMock]);

  const connect = useCallback(async () => {
    if (isMock) {
      setAddress((current) => current ?? MOCK_WORKSPACE_ADDRESS);
      return;
    }

    const kit = await getRealWalletKit();
    const { address: connectedAddress } = await kit.authModal();
    setAddress(connectedAddress);
  }, [isMock]);

  const disconnect = useCallback(async () => {
    if (!isMock) {
      const kit = await getRealWalletKit();
      await kit.disconnect();
    }
    setAddress(null);
  }, [isMock]);

  const signTransaction = useCallback(
    async (unsignedXdr: string, signerAddress?: string) => {
      if (isMock) {
        throw new Error("Mock mode does not sign Stellar transactions.");
      }

      const signer = signerAddress ?? address;
      if (!signer) {
        throw new Error("Connect the required Stellar wallet before signing.");
      }

      const kit = await getRealWalletKit();
      const { signedTxXdr } = await kit.signTransaction(unsignedXdr, {
        address: signer,
        networkPassphrase: isMainnet ? PUBLIC_PASSPHRASE : TESTNET_PASSPHRASE,
      });
      return signedTxXdr;
    },
    [address, isMainnet, isMock],
  );

  return (
    <WalletContext.Provider
      value={{
        connected: Boolean(address),
        address,
        isMock,
        connect,
        disconnect,
        setMockAddress: isMock ? setAddress : () => undefined,
        signTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}
