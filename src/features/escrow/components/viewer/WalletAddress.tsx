import { formatWalletAddress } from "./format";

type WalletAddressProps = {
  address: string;
};

export const WalletAddress = ({ address }: WalletAddressProps) => {
  return (
    <span className="font-mono text-xs text-gray-500" title={address}>
      {formatWalletAddress(address)}
    </span>
  );
};
