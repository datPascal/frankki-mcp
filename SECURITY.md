# Security policy

FrankKi moves real money (prepaid wallets) and real mail (letters that cannot be recalled once printed), so we take reports seriously and respond fast.

## Reporting a vulnerability

**Do not open a public issue for security problems.**

Email **support@frankki.app** with the subject line `SECURITY`. Include what you found, how to reproduce it, and what impact you believe it has. You will get a human response, typically within 2 business days.

In scope:

- The hosted MCP server at `mcp.frankki.app` (auth, scopes, spending limits, approval queue, rate limiting)
- The OAuth 2.1 authorization flow
- The partner dashboard and API at `frankki.app` / `backend.frankki.app`

Out of scope: volumetric denial of service, reports from automated scanners without a demonstrated impact, and social engineering of FrankKi staff.

## Handling of API keys

If you find a leaked FrankKi API key (in a public repo, a paste, a log), report it to the same address; we will revoke it and notify the owner. If you leak your own key, revoke it immediately in the dashboard at [frankki.app/mcp](https://frankki.app/mcp); per-key spending limits bound the damage in the meantime.

## Data protection

Letter data is processed in the EU under GDPR. Privacy questions and data subject requests: **datenschutz@frankki.app**.
