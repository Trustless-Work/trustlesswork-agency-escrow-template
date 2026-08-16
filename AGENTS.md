<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agency Escrow V1 contributor rules

## Product model

The workspace can be either payer or payee. Never hard-code `agency = receiver` or `client = payer`.

Use:
- `workspace`
- `counterparty`
- `paymentDirection: receivable | payable`
- derived payer/payee and Trustless Work roles

Read `docs/PRODUCT-BRIEF.md`, `docs/PRD.md`, and `docs/FULL-USER-FLOW_ESCROW-ROLE-MAPPING.md` before implementing escrow behavior.

## Trustless Work

Before changing SDK/API/wallet behavior, read `.agents/skills/trustless-work/SKILL.md` and the relevant reference files in that skill folder.

V1 is Single-Release with one milestone. Approval is irreversible on-chain. Request-changes behavior occurs before approval.

## OSS issue isolation

Issues #13–#19 are intentionally parallel.

- Branch from the latest `develop`.
- Stay inside the route/view/component ownership listed in the issue.
- Consume shared domain types and hooks from #10–#12.
- Do not refactor shared schemas, services, hooks, providers, or adjacent feature slices unless a maintainer explicitly approves it.
- Do not call Trustless Work SDK hooks directly from #13–#19 screen components.

## Quality gate

Run before opening a PR:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

UI PRs should include screenshots or a short recording and describe which mock seed escrow was used for verification.
