export const escrowQueryKeys = {
  all: ["agency-escrows"] as const,
  lists: () => [...escrowQueryKeys.all, "list"] as const,
  detail: (escrowId: string) => [...escrowQueryKeys.all, "detail", escrowId] as const,
  activity: (escrowId: string) =>
    [...escrowQueryKeys.all, "activity", escrowId] as const,
};
