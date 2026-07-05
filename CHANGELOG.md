# Changelog

Notable changes to the FrankKi MCP server and this repository. The authoritative tool list is always the server's `tools/list` response.

## 2026-07 — Public documentation

- Full tool reference published ([docs/tools.md](docs/tools.md)): composition, pricing, sending, batch, scheduling, approvals, tracking, compliance exports.
- Authentication guide (OAuth 2.1 and scoped API keys), client setup guides for Claude Desktop, Claude Code, Cursor, VS Code, Windsurf, Zed, OpenAI Agents SDK, and LangChain.
- Runnable TypeScript and Python examples.
- `server.json` manifest for the Official MCP Registry (`app.frankki/frankki`).

## 2026 — Platform (highlights)

- **Public beta** of the hosted MCP server at `https://mcp.frankki.app/mcp` (streamable HTTP).
- OAuth 2.1 with dynamic client registration alongside scoped API keys.
- Worldwide delivery with per-destination live pricing (`shipping_quote`).
- Four-eyes approval queue, per-key spending limits, `maxCostEuros` send guard.
- GoBD-compliant archiving with DATEV and DMS exports.
- Sandbox mode: full flow against a funded test wallet, no real mail.
