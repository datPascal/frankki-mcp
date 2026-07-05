<!-- Repo: frankki-mcp | Homepage: https://frankki.app/mcp | Topics: mcp, mcp-server, claude, ai-agents, letters, germany -->

# FrankKi MCP

**Let any AI agent send a real, physical letter.** FrankKi turns a single tool call into paper in a mailbox: composed to the German DIN 5008 standard, printed, franked, and handed to Deutsche Post and local postal partners for delivery across Germany and worldwide.

This is the official Model Context Protocol (MCP) server for [**FrankKi**](https://frankki.app). Connect it to Claude, Cursor, or your own agent runtime and your model gains one new, very physical capability: it can put a letter in the post.

> Website: **[frankki.app](https://frankki.app)** · MCP landing page: **[frankki.app/mcp](https://frankki.app/mcp)** (English: **[frankki.app/en/mcp](https://frankki.app/en/mcp)**)

![Status](https://img.shields.io/badge/status-public%20beta-d97757)
![MCP](https://img.shields.io/badge/protocol-MCP-blue)
![Transport](https://img.shields.io/badge/transport-streamable%20HTTP-informational)
![Auth](https://img.shields.io/badge/auth-OAuth%202.1%20%7C%20API%20key-green)
![License](https://img.shields.io/badge/docs-MIT-lightgrey)

---

## Contents

- [What is FrankKi?](#what-is-frankki)
- [Why an MCP server for letters?](#why-an-mcp-server-for-letters)
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
- [FAQ](#faq)
- [Links](#links)

---

## What is FrankKi?

[FrankKi](https://frankki.app) is a German letter service that writes, prints, and physically mails letters for you. People use it to answer a letter from an Amt, send a Kündigung, mail an Einschreiben, or handle any correspondence that still has to arrive on paper. It runs as a native iOS app and, now, as an MCP server so that software agents can do the same thing programmatically.

Every letter is formatted to **DIN 5008**, printed on real paper, and delivered **per Post** by Deutsche Post together with local postal partners in the destination country. Learn more at **[frankki.app](https://frankki.app)**.

## Why an MCP server for letters?

Plenty of workflows still dead-end at "and now a human has to print this and walk to a postbox." Registered cancellations, objections to authorities, tenancy notices, reminders, and formal confirmations often only count when they arrive physically. FrankKi MCP closes that gap: the last mile of an automated workflow can now be an actual letter, initiated by the same agent that drafted it.

If you are building an assistant that helps people deal with German bureaucracy, an ops bot that dispatches formal notices, or an internal tool that mails documents, this server is the physical-output layer you were missing.

## What your agent can do

The server exposes a focused set of tools. Names below are representative. The authoritative, versioned list is always what the server returns from the MCP `tools/list` method, and every tool carries annotations (`readOnlyHint`, `destructiveHint`) so your agent can reason about side effects before it acts.

| Tool | What it does | Side effect |
|------|--------------|-------------|
| `search_addresses` | Look up and validate a recipient address (German and international format) | read only |
| `list_templates` | Browse reusable letter templates (Kündigung, Widerspruch, and more) | read only |
| `compose_letter` | Draft a DIN 5008 letter from plain text plus a recipient, returns a preview | read only, creates a draft |
| `estimate_price` | Get the exact price for a send before committing | read only |
| `get_wallet_balance` | Read the prepaid wallet balance | read only |
| `send_letter` | Send one physical letter, charges the wallet | **spends money, mails paper** |
| `send_batch` | Sammelversand: one call, many recipients | **spends money, mails paper** |
| `submit_for_approval` | Route a letter into the four-eyes approval queue instead of sending directly | queues, no send |
| `get_order_status` | Track a letter through printed, posted, and delivered | read only |
| `top_up_wallet` | Create a secure Stripe top-up link (10 to 500 EUR) | creates a payment link |

Composition is text-first: you give FrankKi the letter content and the recipient, and it produces the correctly laid-out document. Attachments are supported. Sending a pre-rendered arbitrary PDF is intentionally not part of the platform.

## Quick start for humans

You do not clone or self-host anything. The FrankKi MCP server is hosted. You point your MCP client at it and authenticate.

**1. Get access.** Create a partner account and issue a key from the dashboard at **[frankki.app/mcp](https://frankki.app/mcp)**. Fund your wallet (or use the [sandbox](#sandbox) first, no real mail).

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

Restart the client, and your model can now send letters. Ask it something like: *"Draft a friendly reminder to this address and mail it, but show me the price first."*

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
  name: "estimate_price",
  arguments: { country: "DE", registered: false },
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

- **OAuth 2.1** for interactive clients (Claude Desktop, IDEs). The consent screen shows what the agent is allowed to do, and read-only scopes are granted by default. Best for end users connecting their own FrankKi account.
- **API key** (bearer token) for headless agents, servers, and CI. Issue and rotate keys in the dashboard. Each key can carry a spending limit and an allowed-tools scope, so a key that may look up prices does not have to be a key that may spend money.

## Wallet and pricing

FrankKi runs on a **prepaid wallet**. You top it up (10 to 500 EUR per top-up, via Stripe), and each send draws from the balance. No surprise post-paid invoices, and an out-of-credit agent simply cannot spend.

- Standard letter within Germany: **from 3,49 EUR**.
- Registered mail (**Einschreiben**) and international sending are available at their own rates.
- Volume tiers (**Staffelpreise**) reduce the per-letter price at scale.

Always call `estimate_price` for the live, exact figure before `send_letter`. Prices are authoritative from the server, never hardcode them.

## Safety and human-in-the-loop

Sending physical mail is irreversible and costs money, so the platform is built to be cautious by default:

- **Honest annotations.** `send_letter` and `send_batch` are marked `destructiveHint: true`. Read tools are `readOnlyHint: true`. Your agent can gate on this.
- **Approval queue.** Route sensitive letters through `submit_for_approval` for a **four-eyes** human check before anything is printed. Every decision is logged.
- **Per-key spending limits and tool scopes.** Cap what an automated key can spend, and restrict which tools it may call.
- **Preview before commit.** `compose_letter` returns a rendered preview and `estimate_price` returns the cost, so an agent (or a human) can confirm before `send_letter`.

## Sandbox

Test the full flow without mailing anything. Request a **sandbox key** from the dashboard, point at the same endpoint, and you get a funded test wallet. Composition, pricing, and status all behave like production, but no paper is printed and no charge is made. Build and demo your integration end to end, then swap in a live key.

## Compliance

Built for German and EU requirements:

- **GoBD-compliant** archiving of every send, with retrievable receipts.
- **DATEV** and generic **DMS** exports for accounting and document management.
- **DSGVO / GDPR**: letter data is processed in the EU.
- German-first support, with the platform and its messages available in **German and English**.

## How a send actually works

1. Your agent calls `compose_letter` with the text and a recipient. FrankKi renders a DIN 5008 document.
2. `estimate_price` returns the exact cost. The agent (or a human via the approval queue) confirms.
3. `send_letter` charges the prepaid wallet atomically and hands the job to fulfillment.
4. FrankKi prints the letter and hands it off for delivery **per Post** via Deutsche Post and local postal partners.
5. Status flows back through `get_order_status`: printed, posted, and (for tracked mail) delivered.

## Discovery and server manifest

For directories and registries, this repo publishes a `server.json` (Official MCP Registry schema). Representative shape:

```json
{
  "$schema": "https://static.modelcontextprotocol.io/schemas/2025-07-09/server.schema.json",
  "name": "app.frankki/frankki",
  "description": "Send real, physical letters from any AI agent. Delivered per Post in Germany and worldwide.",
  "version": "1.0.0",
  "websiteUrl": "https://frankki.app/mcp",
  "repository": { "url": "https://github.com/frankki-app/frankki-mcp", "source": "github" },
  "remotes": [
    { "type": "streamable-http", "url": "https://mcp.frankki.app/mcp" }
  ]
}
```

Found this server through an MCP directory? The canonical source of truth is always **[frankki.app/mcp](https://frankki.app/mcp)**.

## FAQ

**Is the letter really printed and mailed, or is it email?**
Real paper. It is printed, franked, and delivered by Deutsche Post and local postal partners. This is not email.

**Which countries?**
Germany plus worldwide destinations. Use `estimate_price` to confirm reach and cost for a given country.

**Do I host the server?**
No. FrankKi hosts it. This repo is documentation, `server.json`, and examples. You connect a client or agent to the hosted endpoint.

**Can it send registered mail?**
Yes, Einschreiben is supported for German sends.

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

Made by the team behind **[FrankKi](https://frankki.app)**, the app that mails your letters so you do not have to find a printer, an envelope, and a postbox.

*Docs and examples in this repo are MIT licensed. Use of the hosted FrankKi MCP service is governed by the terms at [frankki.app](https://frankki.app).*
