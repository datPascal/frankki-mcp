# Changelog

Notable changes to the FrankKi MCP server and this repository. The authoritative tool list is always the server's `tools/list` response.

## 2026-07: Public documentation

- Full tool reference published ([docs/tools.md](docs/tools.md)): composition, pricing, sending, batch, scheduling, approvals, tracking, compliance exports.
- Authentication guide (OAuth 2.1 and scoped API keys), client setup guides for Claude Desktop, Claude Code, Cursor, VS Code, Windsurf, Zed, OpenAI Agents SDK, and LangChain.
- Runnable TypeScript and Python examples.
- `server.json` manifest for the Official MCP Registry (`app.frankki/letters`).

## 2026-08-05: Live

- The hosted MCP server is **live**, not in beta. Connect string is the bare host: `https://mcp.frankki.app`. `POST /` is the transport; the older `/api/mcp/v1` path still answers for anyone already configured against it but is no longer advertised.
- OAuth 2.1 with dynamic client registration verified live on the connect host, alongside scoped API keys.
- Tool reference completed to cover all **63 registered tools**. 54 are listed for every account; 9 sit behind a rollout flag and are absent from `tools/list` while it is off (marked in [docs/tools.md](docs/tools.md)).

## 2026-08-06: Nothing dark

- Every rollout flag that gated a tool is now on in production (`structured_documents`, `letter_design_v2`, `billing_suite`, `brand_import`, `onboarding_cards`). The count is **64 registered, 64 listed, 0 dark**, superseding the 63 / 54 / 9 split recorded on 2026-08-05. [docs/tools.md](docs/tools.md) carries no rollout markers any more.
- `letter_design_delete` now carries `destructiveHint: true`. It archives irreversibly and no restore tool exists, the same reasoning that already applied to `template_archive`.
- Registry manifest name settled on **`app.frankki/letters`**. Two earlier candidate names circulated in drafts; both are superseded and neither should appear anywhere again.

## 2026: Platform (highlights)

- Hosted MCP server at `https://mcp.frankki.app` (streamable HTTP).
- OAuth 2.1 with dynamic client registration alongside scoped API keys.
- Worldwide delivery with per-destination live pricing (`shipping_quote`).
- Four-eyes approval queue, per-key spending limits, `maxCostEuros` send guard.
- GoBD-compliant archiving with DATEV and DMS exports.
- Sandbox mode, enabled per account on request: the full flow with no real mail. A sandbox send books nothing and needs no wallet balance.
