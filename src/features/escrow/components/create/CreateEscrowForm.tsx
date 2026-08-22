"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { ArrowRight, Loader2, RefreshCw, Wallet } from "lucide-react";
import type { CreateAgencyEscrowInput } from "@/types/agency-escrow";
import { createEscrowSchema } from "@/features/escrow/schemas/agency-escrow";
import { getPaymentParties } from "@/features/escrow/utils/roles";
import { calculateFeeBreakdown } from "@/features/escrow/utils/fees";
import { useWallet } from "@/lib/wallet-provider";
import { cn } from "@/lib/utils";
import { DirectionField } from "./DirectionField";
import { EscrowPreview } from "./EscrowPreview";
import { Field, FormSection, fieldInputClass, inputStateClass } from "./form-primitives";
import {
  DEFAULT_DISPUTE_RESOLVER_ADDRESS,
  DEFAULT_PLATFORM_ADDRESS,
  DEFAULT_PLATFORM_FEE_BPS,
  SUPPORTED_ASSETS,
  generateEngagementReference,
  getDirectionCopy,
} from "./create-flow";

type FormValues = z.input<typeof createEscrowSchema>;

type CreateEscrowFormProps = {
  onCreate: (input: CreateAgencyEscrowInput) => Promise<void>;
  isSubmitting: boolean;
};

function clean(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function toCreateInput(values: FormValues): CreateAgencyEscrowInput {
  return {
    engagementId: values.engagementId.trim(),
    paymentDirection: values.paymentDirection,
    workspace: {
      name: values.workspace.name.trim(),
      walletAddress: values.workspace.walletAddress.trim(),
      email: clean(values.workspace.email),
    },
    counterparty: {
      name: values.counterparty.name.trim(),
      walletAddress: values.counterparty.walletAddress.trim(),
      email: clean(values.counterparty.email),
    },
    agreement: {
      title: values.agreement.title.trim(),
      description: values.agreement.description.trim(),
      agreementUrl: clean(values.agreement.agreementUrl),
      dueDate: clean(values.agreement.dueDate),
    },
    payment: {
      amount: values.payment.amount,
      asset: values.payment.asset,
    },
    milestone: {
      title: values.milestone.title.trim(),
      description: values.milestone.description.trim(),
      acceptanceCriteria: values.milestone.acceptanceCriteria.trim(),
    },
    platformFeeBps: values.platformFeeBps,
    platformAddress: values.platformAddress,
    disputeResolverAddress: values.disputeResolverAddress,
  };
}

export function CreateEscrowForm({
  onCreate,
  isSubmitting,
}: CreateEscrowFormProps) {
  const { address, isMock, connect } = useWallet();

  const form = useForm<FormValues>({
    resolver: zodResolver(createEscrowSchema),
    mode: "onTouched",
    defaultValues: {
      paymentDirection: "receivable",
      engagementId: "",
      workspace: { name: "", walletAddress: address ?? "", email: "" },
      counterparty: { name: "", walletAddress: "", email: "" },
      agreement: { title: "", description: "", agreementUrl: "", dueDate: "" },
      payment: { amount: undefined, asset: "USDC" },
      milestone: { title: "", description: "", acceptanceCriteria: "" },
      platformFeeBps: DEFAULT_PLATFORM_FEE_BPS,
      platformAddress: DEFAULT_PLATFORM_ADDRESS,
      disputeResolverAddress: DEFAULT_DISPUTE_RESOLVER_ADDRESS,
    },
  });

  const { control, register, setValue, formState } = form;
  const { errors } = formState;

  // Generate the engagement reference client-side to avoid a hydration mismatch.
  useEffect(() => {
    if (!form.getValues("engagementId")) {
      setValue("engagementId", generateEngagementReference());
    }
  }, [form, setValue]);

  // Keep the workspace wallet in sync once a real wallet connects.
  useEffect(() => {
    if (address) setValue("workspace.walletAddress", address);
  }, [address, setValue]);

  const values = useWatch({ control });
  const direction = values.paymentDirection ?? "receivable";
  const copy = getDirectionCopy(direction);

  const workspaceParty = {
    name: values.workspace?.name ?? "",
    walletAddress: values.workspace?.walletAddress ?? "",
    email: values.workspace?.email,
  };
  const counterparty = {
    name: values.counterparty?.name ?? "",
    walletAddress: values.counterparty?.walletAddress ?? "",
    email: values.counterparty?.email,
  };
  const { payer, payee } = getPaymentParties(
    direction,
    workspaceParty,
    counterparty,
  );

  const amount = Number(values.payment?.amount);
  const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;
  const asset = values.payment?.asset ?? "USDC";
  const fee = calculateFeeBreakdown(safeAmount, DEFAULT_PLATFORM_FEE_BPS);

  const submit = form.handleSubmit(async (validated) => {
    try {
      await onCreate(toCreateInput(validated));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Couldn't create the escrow. Please try again.",
      );
    }
  });

  const walletMissing = !isMock && !address;

  return (
    <form onSubmit={submit} noValidate className="w-full">
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          {/* 1 — Direction */}
          <FormSection
            step={1}
            title="Payment direction"
            description="Choose whether this escrow pays you or pays someone else. Everything else adapts to your choice."
          >
            <DirectionField
              name="paymentDirection"
              value={direction}
              onChange={(next) =>
                setValue("paymentDirection", next, { shouldDirty: true })
              }
            />
          </FormSection>

          {/* 2 — Your workspace */}
          <FormSection
            step={2}
            title="Your workspace"
            description="This is you — the side operating the escrow."
          >
            <div className="space-y-4">
              <Field
                label="Workspace name"
                htmlFor="workspace-name"
                error={errors.workspace?.name?.message}
              >
                <input
                  id="workspace-name"
                  type="text"
                  placeholder="e.g. TechRebel Studio"
                  className={cn(
                    fieldInputClass,
                    inputStateClass(Boolean(errors.workspace?.name)),
                  )}
                  {...register("workspace.name")}
                />
              </Field>

              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  <Wallet className="h-3.5 w-3.5" aria-hidden />
                  Your Stellar wallet
                  {isMock && (
                    <span className="rounded-full bg-neutral-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                      Mock
                    </span>
                  )}
                </div>
                {walletMissing ? (
                  <button
                    type="button"
                    onClick={() => void connect()}
                    className="mt-2 inline-flex items-center gap-2 rounded-md bg-neutral-950 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900"
                  >
                    Connect wallet
                  </button>
                ) : (
                  <p className="mt-1 break-all font-mono text-xs text-neutral-700 dark:text-neutral-300">
                    {values.workspace?.walletAddress || "—"}
                  </p>
                )}
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  Used to derive the escrow roles automatically — no manual role
                  setup needed.
                </p>
              </div>
            </div>
          </FormSection>

          {/* 3 — Counterparty */}
          <FormSection
            step={3}
            title={copy.counterpartyHeading}
            description={copy.counterpartyDescription}
          >
            <div className="space-y-4">
              <Field
                label={copy.counterpartyNameLabel}
                htmlFor="counterparty-name"
                error={errors.counterparty?.name?.message}
              >
                <input
                  id="counterparty-name"
                  type="text"
                  placeholder={copy.counterpartyNamePlaceholder}
                  className={cn(
                    fieldInputClass,
                    inputStateClass(Boolean(errors.counterparty?.name)),
                  )}
                  {...register("counterparty.name")}
                />
              </Field>

              <Field
                label="Email"
                htmlFor="counterparty-email"
                optional
                error={errors.counterparty?.email?.message}
              >
                <input
                  id="counterparty-email"
                  type="email"
                  placeholder="name@company.com"
                  className={cn(
                    fieldInputClass,
                    inputStateClass(Boolean(errors.counterparty?.email)),
                  )}
                  {...register("counterparty.email")}
                />
              </Field>

              <Field
                label={copy.counterpartyWalletLabel}
                htmlFor="counterparty-wallet"
                error={errors.counterparty?.walletAddress?.message}
                hint="Stellar public key starting with G."
              >
                <input
                  id="counterparty-wallet"
                  type="text"
                  spellCheck={false}
                  placeholder="G…"
                  className={cn(
                    fieldInputClass,
                    "font-mono",
                    inputStateClass(Boolean(errors.counterparty?.walletAddress)),
                  )}
                  {...register("counterparty.walletAddress")}
                />
              </Field>
            </div>
          </FormSection>

          {/* 4 — Agreement & payment */}
          <FormSection
            step={4}
            title="Agreement & payment"
            description="The engagement being protected and the amount held in escrow."
          >
            <div className="space-y-4">
              <Field
                label="Engagement title"
                htmlFor="agreement-title"
                error={errors.agreement?.title?.message}
              >
                <input
                  id="agreement-title"
                  type="text"
                  placeholder="e.g. Product strategy sprint"
                  className={cn(
                    fieldInputClass,
                    inputStateClass(Boolean(errors.agreement?.title)),
                  )}
                  {...register("agreement.title")}
                />
              </Field>

              <Field
                label="Description"
                htmlFor="agreement-description"
                error={errors.agreement?.description?.message}
              >
                <textarea
                  id="agreement-description"
                  rows={3}
                  placeholder="Summarise the engagement and its scope."
                  className={cn(
                    fieldInputClass,
                    "resize-y",
                    inputStateClass(Boolean(errors.agreement?.description)),
                  )}
                  {...register("agreement.description")}
                />
              </Field>

              <Field
                label="Agreement / proposal URL"
                htmlFor="agreement-url"
                optional
                error={errors.agreement?.agreementUrl?.message}
              >
                <input
                  id="agreement-url"
                  type="url"
                  placeholder="https://…"
                  className={cn(
                    fieldInputClass,
                    inputStateClass(Boolean(errors.agreement?.agreementUrl)),
                  )}
                  {...register("agreement.agreementUrl")}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label={copy.amountLabel}
                  htmlFor="payment-amount"
                  error={errors.payment?.amount?.message}
                >
                  <input
                    id="payment-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="0.00"
                    className={cn(
                      fieldInputClass,
                      inputStateClass(Boolean(errors.payment?.amount)),
                    )}
                    {...register("payment.amount", {
                      setValueAs: (v) =>
                        v === "" || v === undefined || v === null
                          ? 0
                          : Number(v),
                    })}
                  />
                </Field>

                <Field
                  label="Asset"
                  htmlFor="payment-asset"
                  error={errors.payment?.asset?.message}
                >
                  <select
                    id="payment-asset"
                    className={cn(
                      fieldInputClass,
                      inputStateClass(Boolean(errors.payment?.asset)),
                    )}
                    {...register("payment.asset")}
                  >
                    {SUPPORTED_ASSETS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Due date"
                  htmlFor="agreement-due"
                  optional
                  error={errors.agreement?.dueDate?.message}
                >
                  <input
                    id="agreement-due"
                    type="date"
                    className={cn(
                      fieldInputClass,
                      inputStateClass(Boolean(errors.agreement?.dueDate)),
                    )}
                    {...register("agreement.dueDate")}
                  />
                </Field>

                <Field
                  label="Engagement reference"
                  htmlFor="engagement-id"
                  error={errors.engagementId?.message}
                  hint="Auto-generated. Edit if you track your own IDs."
                >
                  <div className="flex gap-2">
                    <input
                      id="engagement-id"
                      type="text"
                      className={cn(
                        fieldInputClass,
                        "font-mono",
                        inputStateClass(Boolean(errors.engagementId)),
                      )}
                      {...register("engagementId")}
                    />
                    <button
                      type="button"
                      aria-label="Regenerate reference"
                      onClick={() =>
                        setValue(
                          "engagementId",
                          generateEngagementReference(
                            values.counterparty?.name,
                          ),
                          { shouldValidate: true },
                        )
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-neutral-300 text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
                    >
                      <RefreshCw className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </Field>
              </div>
            </div>
          </FormSection>

          {/* 5 — Deliverable & acceptance */}
          <FormSection
            step={5}
            title={copy.deliverableHeading}
            description={copy.deliverableDescription}
          >
            <div className="space-y-4">
              <Field
                label="Deliverable title"
                htmlFor="milestone-title"
                error={errors.milestone?.title?.message}
              >
                <input
                  id="milestone-title"
                  type="text"
                  placeholder="e.g. Final strategy deck & workshop"
                  className={cn(
                    fieldInputClass,
                    inputStateClass(Boolean(errors.milestone?.title)),
                  )}
                  {...register("milestone.title")}
                />
              </Field>

              <Field
                label="Deliverable description"
                htmlFor="milestone-description"
                error={errors.milestone?.description?.message}
              >
                <textarea
                  id="milestone-description"
                  rows={2}
                  placeholder="What exactly will be produced?"
                  className={cn(
                    fieldInputClass,
                    "resize-y",
                    inputStateClass(Boolean(errors.milestone?.description)),
                  )}
                  {...register("milestone.description")}
                />
              </Field>

              <Field
                label={copy.acceptanceLabel}
                htmlFor="milestone-acceptance"
                error={errors.milestone?.acceptanceCriteria?.message}
                hint={copy.acceptanceHint}
              >
                <textarea
                  id="milestone-acceptance"
                  rows={3}
                  placeholder="List the conditions that must be met before payment is approved."
                  className={cn(
                    fieldInputClass,
                    "resize-y",
                    inputStateClass(
                      Boolean(errors.milestone?.acceptanceCriteria),
                    ),
                  )}
                  {...register("milestone.acceptanceCriteria")}
                />
              </Field>
            </div>
          </FormSection>
        </div>

        {/* Live preview + submit */}
        <aside className="lg:col-span-2">
          <div className="space-y-4 lg:sticky lg:top-6">
            <EscrowPreview
              data={{
                direction,
                payerName: payer.name,
                payeeName: payee.name,
                amount: safeAmount,
                asset,
                deliverableTitle: values.milestone?.title ?? "",
                acceptanceCriteria: values.milestone?.acceptanceCriteria ?? "",
                dueDate: clean(values.agreement?.dueDate),
                fee,
                engagementReference: values.engagementId ?? "",
              }}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Creating…
                </>
              ) : (
                <>
                  Create escrow
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </>
              )}
            </button>
            <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
              Runs in mock mode — no wallet signature or API key required.
            </p>
          </div>
        </aside>
      </div>
    </form>
  );
}
