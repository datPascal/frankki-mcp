# Authentication

FrankKi MCP supports two authentication modes. Pick per client; both hit the same endpoint.

| | OAuth 2.1 | API key |
|---|---|---|
| Best for | Interactive clients (Claude Desktop, IDEs), end users connecting their own account | Headless agents, servers, CI, backends |
| Setup | None; browser consent on first connect | Issue a key in the dashboard |
| Scopes | Chosen on the consent screen; read-only granted by default | Fixed per key at issue time |
| Spending limits | Account-level | Per key |
| Rotation | Token refresh is automatic | Rotate in the dashboard, old key revoked |

## OAuth 2.1 (interactive clients)

The server implements the standard MCP authorization flow: OAuth 2.1 with PKCE and dynamic client registration. Clients that support remote MCP servers (Claude Desktop, Claude Code, Cursor, VS Code, and others) handle the whole flow for you: point them at the endpoint and a browser window opens for login and consent.

- **Authorization server metadata:** `https://mcp.frankki.app/.well-known/oauth-authorization-server`
- **Consent:** the consent screen lists exactly which tool scopes the client requested. Read-only scopes are granted by default; write and spend scopes are opt-in and clearly marked.
- **Token lifecycle:** short-lived access tokens with rotating refresh tokens. Revoking access in the dashboard invalidates the grant immediately.

No client credentials to manage, nothing to configure server-side. If your client asks for a "custom connector" or "remote MCP server" URL, that URL is:

```
https://mcp.frankki.app/mcp
```

## API keys (headless agents)

For agents that run without a human in the loop, issue a key from the dashboard at [frankki.app/mcp](https://frankki.app/mcp) and pass it as a bearer token:

```
Authorization: Bearer <FRANKKI_API_KEY>
```

Each key carries its own policy, configured at issue time:

- **Scopes.** A key that quotes prices does not have to be a key that spends money. Grant `letter:read` and `address:read` for research agents; reserve `order:send` for the component that actually dispatches.
- **Spending limits.** A daily cap in euros. When the cap is hit, sends fail with `DAILY_CAP_EXCEEDED` regardless of wallet balance.
- **Revocation.** Revoke a key in the dashboard and it stops working immediately.

Store keys in your secret manager, never in prompts or code. If a key leaks, revoke it; the wallet and the key's spend cap bound the damage in the meantime.

## Scope reference

| Scope | Grants |
|-------|--------|
| `profile:read` | Account profile, letterhead and signature lists |
| `wallet:read` | Balance, top-up links |
| `letter:read` | Read, list, and search letters; price quotes |
| `letter:schedule` | Schedule and cancel future sends |
| `address:read` | Address book reads, validation, company search |
| `address:write` | Address book writes |
| `template:read` | Templates, template rendering, diff checks |
| `preset:write` | Save send presets |
| `letterhead:write` | Upload letterheads |
| `signature:write` | Upload signatures |
| `sender_profile:read` | Sender profile reads and validation |
| `order:read` | Order status, posting receipts |
| `order:send` | Create drafts, attach files, send, cancel, submit for approval. **This is the scope that spends money.** |
| `approval:read` | List approval queue items |
| `approval:decide` | Approve or reject queued letters |
| `mandant:read` | Client (Mandant) reads |
| `archive:read` | Compliance archive exports |

## Recommended setups

**A customer-facing assistant** that helps users draft letters: OAuth, default read scopes plus `order:send`, with the account's approval queue enforced so a human confirms every send.

**A dunning automation** in your backend: API key with `letter:read`, `address:read`, `template:read`, `order:read`, `order:send`, a conservative daily spend cap, and `maxCostEuros` set on every `order_send` call.

**A research or reporting agent**: API key with read scopes only. It can quote, search, and track, and it cannot spend a cent by construction.
