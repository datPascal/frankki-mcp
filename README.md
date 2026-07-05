<!-- Repo: frankki-mcp | Homepage: https://frankki.app/mcp | Topics: mcp, mcp-server, claude, ai-agents, physical-mail, letters -->

# FrankKi MCP

**Physical mail for AI agents.** With one tool call, FrankKi MCP lets an agent send a real, printed letter to a physical address anywhere in the world. Compose, price, send, and track. The document is printed, franked, and delivered by postal partners worldwide.

This is the official Model Context Protocol (MCP) server for [**FrankKi**](https://frankki.app). It is built for B2B and developer use: give your agents, backends, and automated workflows the ability to put real letters in the mail, at scale, worldwide.

> Website: **[frankki.app](https://frankki.app)** · MCP for humans and agents: **[frankki.app/mcp](https://frankki.app/mcp)** (English: **[frankki.app/en/mcp](https://frankki.app/en/mcp)**)

![Status](https://img.shields.io/badge/status-public%20beta-d97757)
![MCP](https://img.shields.io/badge/protocol-MCP-blue)
![Delivery](https://img.shields.io/badge/delivery-worldwide-brightgreen)
![Transport](https://img.shields.io/badge/transport-streamable%20HTTP-informational)
![Auth](https://img.shields.io/badge/auth-OAuth%202.1%20%7C%20API%20key-green)

---

## Contents

- [What is FrankKi MCP?](#what-is-frankki-mcp)
- [Why physical mail via MCP?](#why-physical-mail-via-mcp)
- [What your agent can do](#what-your-agent-can-do)
- [Quick start for humans](#quick-start-for-humans)
- [Quick start for AI agents](#quick-start-for-ai-agents)
- [Authentication](#authentication)
- [Wallet and pricing](#wallet-and-pricing)
- [Safety and human-in-the-loop](#safety-and-human-in-the-loop)
- [Sandbox](#sandbox)
- [Compliance](#compliance)
- [How a send actually works](#how-a-send-actually-works)
- [Discovery and server manifest](#discovery-and-server-manifest)
- [Documentation](#documentation)
- [FAQ](#faq)
- [Links](#links)

---

## What is FrankKi MCP?

FrankKi MCP is the agent-native interface to [FrankKi](https://frankki.app)'s physical mail infrastructure. FrankKi composes, prints, and physically mails letters. This server exposes that capability to software: your model drafts a letter and sends it, and a real document arrives at the recipient's address.

Delivery is **worldwide**, handled by Deutsche Post together with local postal partners in each destination country. It is primarily a **B2B and developer product**: if you are building an assistant, an ops automation, or a backend that needs to produce and dispatch physical correspondence, this is your physical-output layer.

## Why physical mail via MCP?

Some things still have to arrive on paper: formal and legal notices, transactional and compliance mail, contract confirmations, dunning and reminders, customer onboarding, official correspondence. These workflows usually dead-end at "now a human prints this and walks to a postbox." FrankKi MCP removes that step. The same agent that drafts the letter can send it, worldwide, and track delivery.

Typical uses:

- Dunning and payment reminders
- Cancellations, terminations, objections, and other formal notices
- Contract and order confirmations
- Customer and account notifications
- Onboarding and welcome letters
- Any workflow whose last step must be a physical letter

## What your agent can do

The server exposes a focused, scoped tool set. The core send flow:

| Tool | What it does | Side effect |
|------|--------------|-------------|
| `address_validate` | Validate a recipient address against destination-country postal rules | read only |
| `address_search_company` | Look up a company's postal address by name | read only |
| `template_list` | Browse reusable letter templates | read only |
| `letter_create_draft` | Draft a professionally formatted letter from plain text plus a recipient, returns a preview | creates a draft, no send |
| `shipping_quote` | Get the exact price for a send to a given destination before committing | read only |
| `wallet_balance` | Read the prepaid wallet balance | read only |
| `order_send` | Send one physical letter, charges the wallet; supports a `maxCostEuros` guard | **spends money, mails paper** |
| `order_send_batch` | Bulk send: one call, many recipients with merge fields | **spends money, mails paper** |
| `approval_submit` | Route a letter into the four-eyes approval queue instead of sending directly | queues, no send |
| `order_status` | Track a letter through printed, posted, and delivered | read only |
| `wallet_topup_link` | Create a secure Stripe top-up link | creates a payment link |

Beyond the core flow there are tools for attachments, letterheads and signatures, sender profiles, send presets, scheduled sends, order cancellation, posting receipts (Einlieferungsbeleg), client (Mandanten) lookups, and GoBD/DATEV archive exports. The full list with scopes and side effects: **[docs/tools.md](docs/tools.md)**. The authoritative, versioned list is always what the server returns from the MCP `tools/list` method.

Composition is text-first: you provide the letter content and the recipient, and FrankKi produces the correctly laid-out document (DIN 5008 by default). Attachments are supported. Sending a pre-rendered arbitrary PDF is intentionally not part of the platform.

## Quick start for humans

You do not clone or self-host anything. The FrankKi MCP server is hosted. You point your MCP client at it and authenticate.

**1. Get access.** Create a partner account and issue a key from the dashboard at **[frankki.app/mcp](https://frankki.app/mcp)**. Fund your wallet, or use the [sandbox](#sandbox) first (no real mail).

**2a. Claude Desktop and clients with native remote support.** Add a custom connector pointing at the endpoint. OAuth runs in your browser on first use:

```json
{
  "mcpServers": {
    "frankki": {
      "url": "https://mcp.frankki.app/mcp"
    }
  }
}
```

**2b. Clients that only speak stdio** (older Claude Desktop, some Cursor setups). Bridge with `mcp-remote`:

```json
{
  "mcpServers": {
    "frankki": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.frankki.app/mcp"]
    }
  }
}
```

**2c. Headless with an API key** (no interactive browser). Pass the key as a bearer header:

```json
{
  "mcpServers": {
    "frankki": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote", "https://mcp.frankki.app/mcp",
        "--header", "Authorization: Bearer ${FRANKKI_API_KEY}"
      ]
    }
  }
}
```

**2d. Claude Code.** One command:

```bash
claude mcp add --transport http frankki https://mcp.frankki.app/mcp
```

Restart the client, and your model can now send letters. Ask it something like: *"Send this payment reminder to the address on file, but show me the price first."*

Step-by-step guides for Cursor, VS Code, Windsurf, Zed, the OpenAI Agents SDK, and LangChain: **[docs/clients.md](docs/clients.md)**.

## Quick start for AI agents

The server is standard **streamable HTTP** MCP. Discovery, endpoint, and auth in one place:

- **Endpoint:** `https://mcp.frankki.app/mcp`
- **Registry name:** `app.frankki/frankki` (Official MCP Registry)
- **Auth metadata:** `https://mcp.frankki.app/.well-known/oauth-authorization-server` (OAuth 2.1, dynamic client registration) or a static bearer API key
- **Machine-readable overview:** `https://frankki.app/llms.txt`

### TypeScript

```ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const transport = new StreamableHTTPClientTransport(
  new URL("https://mcp.frankki.app/mcp"),
  { requestInit: { headers: { Authorization: `Bearer ${process.env.FRANKKI_API_KEY}` } } }
);

const client = new Client({ name: "my-agent", version: "1.0.0" });
await client.connect(transport);

const { tools } = await client.listTools();
console.log(tools.map((t) => t.name));

const price = await client.callTool({
  name: "shipping_quote",
  arguments: { recipientCountry: "US", deliveryType: "standard" },
});
```

### Python

```python
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

url = "https://mcp.frankki.app/mcp"
headers = {"Authorization": f"Bearer {FRANKKI_API_KEY}"}

async with streamablehttp_client(url, headers=headers) as (read, write, _):
    async with ClientSession(read, write) as session:
        await session.initialize()
        tools = await session.list_tools()
        print([t.name for t in tools.tools])
```

## Authentication

Two modes, pick per client:

- **OAuth 2.1** for interactive clients (Claude Desktop, IDEs). The consent screen shows what the agent is allowed to do, and read-only scopes are granted by default. Best when an end user connects their own FrankKi account.
- **API key** (bearer token) for headless agents, servers, and CI. Issue and rotate keys in the dashboard. Each key can carry a spending limit and an allowed-tools scope, so a key that may look up prices does not have to be a key that may spend money.

## Wallet and pricing

FrankKi runs on a **prepaid wallet**. You top it up (via Stripe), and each send draws from the balance. No surprise post-paid invoices, and an out-of-credit agent simply cannot spend.

- Pricing depends on the **destination country**. A domestic letter within Germany starts at **3,49 EUR**; international sends are priced per destination.
- Registered mail and other service levels are available where the destination supports them.
- Volume tiers (**Staffelpreise**) reduce the per-letter price at scale.

Always call `shipping_quote` for the live, exact figure before `order_send`. Prices are authoritative from the server, never hardcode them.

## Safety and human-in-the-loop

Sending physical mail is irreversible and costs money, so the platform is cautious by default:

- **Honest annotations.** `order_send` and `order_send_batch` are annotated as destructive; read tools as read-only. Your agent can gate on this, and `order_send` accepts a `maxCostEuros` cap that aborts the send if the live price exceeds it.
- **Approval queue.** Route sensitive letters through `approval_submit` for a **four-eyes** human check before anything is printed. Every decision is logged.
- **Per-key spending limits and tool scopes.** Cap what an automated key can spend, and restrict which tools it may call.
- **Preview before commit.** `letter_create_draft` returns a rendered preview and `shipping_quote` returns the cost, so an agent or a human can confirm before `order_send`.

## Sandbox

Test the full flow without mailing anything. Request a **sandbox key** from the dashboard, point at the same endpoint, and you get a funded test wallet. Composition, pricing, and status all behave like production, but no paper is printed and no charge is made. Build and demo your integration end to end, then swap in a live key.

## Compliance

Enterprise and EU-grade, for teams that need it:

- **GoBD-compliant** archiving of every send, with retrievable receipts.
- **DATEV** and generic **DMS** exports for accounting and document management.
- **DSGVO / GDPR**: letter data is processed in the EU.
- Platform and messages available in **English and German**.

## How a send actually works

1. Your agent calls `letter_create_draft` with the text and a recipient. FrankKi renders a professionally formatted document.
2. `shipping_quote` returns the exact cost for that destination. The agent, or a human via the approval queue, confirms.
3. `order_send` charges the prepaid wallet atomically and hands the job to fulfillment.
4. FrankKi prints the letter and hands it off for delivery worldwide via Deutsche Post and local postal partners.
5. Status flows back through `order_status`: printed, posted, and, where supported, delivered. `order_einlieferungsbeleg` returns the posting receipt.

## Discovery and server manifest

For directories and registries, this repo publishes [`server.json`](server.json) (Official MCP Registry schema, name `app.frankki/frankki`) and a repo-level [`llms.txt`](llms.txt) for AI-assisted discovery.

Found this server through an MCP directory? The canonical source of truth is always **[frankki.app/mcp](https://frankki.app/mcp)**.

## Documentation

| Doc | Contents |
|-----|----------|
| [docs/tools.md](docs/tools.md) | Every tool with scope, side effects, the canonical send flow, and error codes |
| [docs/authentication.md](docs/authentication.md) | OAuth 2.1, API keys, the full scope list, recommended setups |
| [docs/clients.md](docs/clients.md) | Setup for Claude Desktop, Claude Code, Cursor, VS Code, Windsurf, Zed, OpenAI Agents SDK, LangChain |
| [docs/use-cases.md](docs/use-cases.md) | Dunning, terminations, compliance mail, onboarding, agent-native products |
| [examples/](examples/) | Runnable TypeScript and Python clients (sandbox-first, send behind an explicit flag) |

## FAQ

**Is the letter really printed and mailed, or is it email?**
Real paper. It is printed, franked, and delivered by postal partners. This is not email.

**Which countries can it deliver to?**
Worldwide. Use `shipping_quote` to confirm reach and cost for a specific destination.

**Do I host the server?**
No. FrankKi hosts it. This repo is documentation, `server.json`, and examples. You connect a client or agent to the hosted endpoint.

**Is this for consumers or businesses?**
Primarily B2B and developer use: agents, backends, and automated workflows that need to dispatch physical mail at scale.

**What if my agent goes rogue?**
It cannot spend beyond the wallet balance or a key's spending limit, sensitive letters can be forced through a human approval queue, and destructive tools are clearly annotated. Start in the [sandbox](#sandbox).

**Is there an API without MCP?**
Yes, FrankKi also exposes a REST API. The MCP server is the agent-native front door. See **[frankki.app/mcp](https://frankki.app/mcp)**.

## Links

- **Homepage:** https://frankki.app
- **MCP for humans and agents:** https://frankki.app/mcp · https://frankki.app/en/mcp
- **Machine-readable overview:** https://frankki.app/llms.txt
- **Endpoint:** https://mcp.frankki.app/mcp
- **Registry name:** `app.frankki/frankki`

---

Built by the team behind **[FrankKi](https://frankki.app)**: physical mail infrastructure for software, so your agents and workflows can send real letters worldwide without ever touching a printer.
