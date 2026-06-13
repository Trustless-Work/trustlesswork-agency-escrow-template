<p align="center"> <img src="https://github.com/user-attachments/assets/5b182044-dceb-41f5-acf0-da22dea7c98a" alt="CLR-S (2)"> </p>

# Trustless Work | [Documentation](https://docs.trustlesswork.com/trustless-work)

## Agency Escrow Template

A **milestone-based escrow workflow** for agencies, consultants, freelancers, and product studios to secure client funds upfront, deliver work in clear increments, and release payment only after approval.

> **Agencies stop chasing invoices. Clients only release funds when work is delivered.**

Built on [Trustless Work](https://docs.trustlesswork.com/trustless-work) — Escrow-as-a-Service on Stellar/Soroban — this template is a reference implementation you can fork, adapt, and dogfood for real client engagements.

### The problem

Agency work breaks when **delivery, scope, and payment** live in separate tools. Clients hesitate to pay large retainers blindly; agencies hesitate to start without secured funds. This template adds a neutral, programmable payment layer: funds are locked before work begins and released when the client approves delivery.

### Core workflow

| Step | Actor | Action |
| --- | --- | --- |
| 1 | Agency | Creates a one-milestone escrow and sends a funding link to the client |
| 2 | Client | Reviews terms and funds the escrow (stablecoin on Stellar) |
| 3 | Agency | Delivers work and marks the milestone as submitted |
| 4 | Client | Reviews deliverables and approves the milestone |
| 5 | Client | Releases funds to the agency; platform fee is routed automatically |
| 6 | Both | View escrow status and event timeline in the dashboard |

### Default role mapping (MVP)

| Trustless Work role | Template meaning | Default actor |
| --- | --- | --- |
| Creator | Initiates the commercial proposal | Agency |
| Funder | Deposits funds into escrow | Client |
| Receiver | Receives payment after approval | Agency |
| Milestone Marker | Marks work as submitted | Agency |
| Approver | Confirms milestone acceptance | Client |
| Release Signer | Triggers fund release | Client |
| Platform Address | Receives infrastructure fee | Trustless Work / platform |

### MVP scope

**In scope**

- One milestone per escrow
- Create escrow, assign roles, define amount and acceptance criteria
- Client funding, agency submission, client approval, fund release
- Platform fee routing and escrow status viewer for both parties

**Out of scope (future versions)**

- Multi-milestone contracts, disputes, partial releases, subscriptions, fiat, CRM, or full project management

For full product requirements, user flows, state machine, and acceptance criteria, see the [`docs/`](docs/) folder:

| Document | Purpose |
| --- | --- |
| [`docs/PRODUCT-BRIEF.md`](docs/PRODUCT-BRIEF.md) | Executive summary and example milestones |
| [`docs/PRD.md`](docs/PRD.md) | Full PRD: personas, functional requirements, UX, data model |
| [`docs/FULL-USER-FLOW_ESCROW-ROLE-MAPPING.md`](docs/FULL-USER-FLOW_ESCROW-ROLE-MAPPING.md) | Step-by-step flows, role mapping, state machine |

### Tech stack

- [Next.js 16](https://nextjs.org/) (App Router) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Trustless Work SDK](https://docs.trustlesswork.com/trustless-work) — `@trustless-work/escrow` and/or `@trustless-work/blocks` (to be integrated)
- [Stellar Wallets Kit](https://github.com/Creit-Tech/Stellar-Wallets-Kit) + [Freighter](https://www.freighter.app/) (testnet for development)

---

## Local installation

### Prerequisites

- **Node.js 20+** and [pnpm](https://pnpm.io/)
- A [Trustless Work API key](https://docs.trustlesswork.com/trustless-work)
- [Freighter](https://www.freighter.app/) (or another Stellar wallet supported by Wallets Kit) on **Stellar testnet**
- Testnet USDC (or your chosen escrow asset) and a **trustline** to the asset issuer (`G…` address, not the contract `C…` address)

### Setup

```bash
# Clone the repository
git clone https://github.com/Trustless-Work/trustlesswork-agency-escrow-template.git
cd trustlesswork-agency-escrow-template

# Install dependencies
pnpm install

# Copy environment variables and fill in your values
cp .env.local.example .env.local   # create this file — see below
```

Create `.env.local` in the project root (never commit this file):

```env
# Trustless Work API (required once SDK/blocks are wired)
NEXT_PUBLIC_API_KEY=your_trustless_work_api_key
```

When integrating the SDK or Blocks, you will also configure role addresses, asset issuer, and provider nesting. See [Trustless Work React SDK](https://docs.trustlesswork.com/trustless-work) and the bundled agent skill at [`.agents/skills/trustless-work/`](.agents/skills/trustless-work/).

### Run locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The page hot-reloads as you edit files under `src/`.

Other scripts:

| Command | Description |
| --- | --- |
| `pnpm build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | Run ESLint |

---

## Trustless Work resources & AI tools

### Platform documentation

| Resource | Link |
| --- | --- |
| Documentation home | [docs.trustlesswork.com/trustless-work](https://docs.trustlesswork.com/trustless-work) |
| REST API | [API reference](https://docs.trustlesswork.com/trustless-work) |
| React SDK (`@trustless-work/escrow`) | [SDK guides](https://docs.trustlesswork.com/trustless-work) |
| UI Blocks (`@trustless-work/blocks`) | [Blocks guides](https://docs.trustlesswork.com/trustless-work) |
| Documentation index (LLMs) | [llms.txt](https://docs.trustlesswork.com/trustless-work/llms.txt) |

**Template-specific behavior** (roles, screens, MVP boundaries) lives in this repo’s [`docs/`](docs/) folder. **Platform mechanics** (XDR signing, trustlines, API payloads) live in Trustless Work docs.

### AI Skill (Skills.sh)

Install the official Trustless Work skill so your AI assistant understands escrow lifecycle, XDR signing, trustlines, provider setup, and common integration mistakes:

```bash
npx skills add trustless-work/trustless-work-dev-skill
```

Update installed skills later:

```bash
npx skills update
```

Registry: [skills.sh/trustless-work](https://www.skills.sh/trustless-work)

This repository also ships a local copy at [`.agents/skills/trustless-work/`](.agents/skills/trustless-work/) for Cursor and compatible agents.

Learn more: [Trustless Work Skill](https://docs.trustlesswork.com/trustless-work/ai/skill)

### MCP (Cursor & compatible editors)

Connect your editor to Trustless Work documentation and escrow tools via MCP. Use **both** servers together:

- **`trustlesswork-docs`** — read docs and generate integrations
- **`trustlesswork`** — escrow actions and live operations

Add to your project `mcp.json` (project root) or Cursor **Settings → MCP**:

```json
{
  "mcpServers": {
    "trustlesswork-docs": {
      "type": "streamable-http",
      "url": "https://docs.trustlesswork.com/trustless-work/~gitbook/mcp",
      "headers": {}
    },
    "trustlesswork": {
      "type": "streamable-http",
      "url": "https://mcp.trustlesswork.com/mcp",
      "headers": {}
    }
  }
}
```

After saving, reload Cursor and confirm both servers show **Connected** under **Settings → MCP**. Use **Agent Mode** and prompts such as:

- *Create a multi-release escrow with the SDK.*
- *Generate code to call the changeMilestoneStatus endpoint.*
- *Show me how to sign a transaction for releaseFunds.*

Setup guide: [Trustless Work MCP](https://docs.trustlesswork.com/trustless-work/ai/mcp)

---

# Maintainers | [Telegram](https://t.me/+kmr8tGegxLU0NTA5)

<table align="center">
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/6b97e15f-9954-47d0-81b5-49f83bed5e4b" alt="Owner 1" width="150" />
      <br /><br />
      <strong>Tech Rebel | Product Manager</strong>
      <br /><br />
      <a href="https://github.com/techrebelgit" target="_blank">techrebelgit</a>
      <br />
      <a href="https://t.me/Tech_Rebel" target="_blank">Telegram</a>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/e245e8af-6f6f-4a0a-a37f-df132e9b4986" alt="Owner 2" width="150" />
      <br /><br />
      <strong>Joel Vargas | Frontend Developer</strong>
      <br /><br />
      <a href="https://github.com/JoelVR17" target="_blank">JoelVR17</a>
      <br />
      <a href="https://t.me/joelvr20" target="_blank">Telegram</a>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/53d65ea1-007e-40aa-b9b5-e7a10d7bea84" alt="Owner 3" width="150" />
      <br /><br />
      <strong>Armando Murillo | Full Stack Developer</strong>
      <br /><br />
      <a href="https://github.com/armandocodecr" target="_blank">armandocodecr</a>
      <br />
      <a href="https://t.me/armandocode" target="_blank">Telegram</a>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/851273f6-2f91-413d-bd2d-d8dc1f3c2d28" alt="Owner 4" width="150" />
      <br /><br />
      <strong>Caleb Loría | Smart Contract Developer</strong>
      <br /><br />
      <a href="https://github.com/zkCaleb-dev" target="_blank">zkCaleb-dev</a>
      <br />
      <a href="https://t.me/zkCaleb_dev" target="_blank">Telegram</a>
    </td>
  </tr>
</table>

---

## **Thanks to all the contributors who have made this project possible!**

[![Contributors](https://contrib.rocks/image?repo=Trustless-Work/trustlesswork-agency-escrow-template)](https://github.com/Trustless-Work/trustlesswork-agency-escrow-template/graphs/contributors)
