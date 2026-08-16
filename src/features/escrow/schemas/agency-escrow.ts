import { z } from "zod";

const stellarAddressSchema = z
  .string()
  .trim()
  .regex(/^G[A-Z2-7]{55}$/, "Enter a valid Stellar G-address");

export const agencyEscrowPartySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  walletAddress: stellarAddressSchema,
  email: z.string().trim().email().optional().or(z.literal("")),
});

export const createEscrowSchema = z.object({
  paymentDirection: z.enum(["receivable", "payable"]),
  engagementId: z.string().trim().min(1, "Engagement ID is required"),
  workspace: agencyEscrowPartySchema,
  counterparty: agencyEscrowPartySchema,
  agreement: z.object({
    title: z.string().trim().min(1, "Agreement title is required"),
    description: z.string().trim().min(1, "Description is required"),
    agreementUrl: z.string().trim().url().optional().or(z.literal("")),
    dueDate: z.string().trim().optional(),
  }),
  payment: z.object({
    amount: z.number().positive("Amount must be greater than zero"),
    asset: z.string().trim().min(1, "Asset is required"),
  }),
  milestone: z.object({
    title: z.string().trim().min(1, "Deliverable title is required"),
    description: z.string().trim().min(1, "Deliverable description is required"),
    acceptanceCriteria: z
      .string()
      .trim()
      .min(1, "Acceptance criteria are required"),
  }),
  platformFeeBps: z.number().int().min(0).max(10_000),
  platformAddress: stellarAddressSchema,
  disputeResolverAddress: stellarAddressSchema,
});

export const submitDeliverableSchema = z.object({
  deliverySummary: z.string().trim().min(1, "Delivery summary is required"),
  deliverableLinks: z.array(z.string().trim().url()).optional(),
  evidence: z.string().trim().url().optional().or(z.literal("")),
});

export const requestChangesSchema = z.object({
  revisionNotes: z.string().trim().min(1, "Revision notes are required"),
});

export const releaseFundsSchema = z.object({
  escrowId: z.string().trim().min(1),
  actorAddress: stellarAddressSchema,
});

export { stellarAddressSchema };
