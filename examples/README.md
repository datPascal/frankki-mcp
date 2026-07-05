# Examples

Minimal, runnable clients for the hosted FrankKi MCP server. Each one walks the canonical flow: validate an address, draft a letter, quote the price, and (behind an explicit flag) send it as real physical mail.

| Example | Stack | Run |
|---------|-------|-----|
| [`typescript/`](typescript/) | Node 18+, `@modelcontextprotocol/sdk` | `npm install && npm start` |
| [`python/`](python/) | Python 3.10+, `mcp` | `pip install -r requirements.txt && python send_letter.py` |

Both need a `FRANKKI_API_KEY` environment variable. Use a **sandbox key** (issued at [frankki.app/mcp](https://frankki.app/mcp)) to run the full flow with a funded test wallet and zero real mail. The send step is off by default (`SEND_FOR_REAL = false`) either way.

Using Claude Desktop, Cursor, or another MCP client instead of the SDK? See [docs/clients.md](../docs/clients.md); there is nothing to code at all.
