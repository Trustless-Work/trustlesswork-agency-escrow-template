import { Button } from "@/components/ui/button";
import { truncateAddress } from "./format";

type MockActorSwitcherProps = {
  workspaceName: string;
  workspaceAddress: string;
  counterpartyName: string;
  counterpartyAddress: string;
  currentAddress: string | null;
  onSelect: (address: string) => void;
};

export const MockActorSwitcher = ({
  workspaceName,
  workspaceAddress,
  counterpartyName,
  counterpartyAddress,
  currentAddress,
  onSelect,
}: MockActorSwitcherProps) => {
  const actors = [
    { name: workspaceName, address: workspaceAddress },
    { name: counterpartyName, address: counterpartyAddress },
  ];

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium">Mock mode</p>
        <p className="text-xs leading-5 text-muted-foreground">
          Act as a party to verify the release signer guard for both directions.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {actors.map((actor) => {
          const isActive = actor.address === currentAddress;
          return (
            <Button
              key={actor.address}
              type="button"
              size="sm"
              variant={isActive ? "default" : "outline"}
              aria-pressed={isActive}
              onClick={() => onSelect(actor.address)}
            >
              {actor.name} · {truncateAddress(actor.address)}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
