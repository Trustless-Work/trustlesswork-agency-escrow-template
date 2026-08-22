import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPaymentParties } from "@/features/escrow/utils/roles";
import type { AgencyEscrow, AgencyEscrowParty } from "@/types/agency-escrow";
import { WalletAddress } from "./WalletAddress";
import { viewerCardClass, viewerLabelClass, viewerMutedClass } from "./viewer-styles";

type EscrowPartiesCardProps = {
  escrow: AgencyEscrow;
};

const PartyRow = ({
  label,
  party,
}: {
  label: string;
  party: AgencyEscrowParty;
}) => {
  return (
    <div>
      <p className={viewerLabelClass}>{label}</p>
      <p className="mt-1 font-semibold">
        {party.name}
      </p>
      {party.email ? <p className={viewerMutedClass}>{party.email}</p> : null}
      <WalletAddress address={party.walletAddress} />
    </div>
  );
};

export const EscrowPartiesCard = ({ escrow }: EscrowPartiesCardProps) => {
  const { payer, payee } = getPaymentParties(
    escrow.paymentDirection,
    escrow.workspace,
    escrow.counterparty,
  );

  return (
    <Card className={viewerCardClass}>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Parties</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <PartyRow
          label={
            escrow.paymentDirection === "payable"
              ? "Payer · Workspace"
              : "Payer · Counterparty"
          }
          party={payer}
        />
        <PartyRow
          label={
            escrow.paymentDirection === "payable"
              ? "Payee · Counterparty"
              : "Payee · Workspace"
          }
          party={payee}
        />
      </CardContent>
    </Card>
  );
};
