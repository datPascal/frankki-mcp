# Contributing

This repository holds the public documentation, registry manifest, and client examples for the hosted FrankKi MCP server. The server itself is a hosted service and is not developed in this repo.

Contributions that are very welcome here:

- **Fixes and clarifications to the docs.** If something in [docs/](docs/) did not match what the server actually returned, that is a bug in the docs; please tell us or open a PR.
- **Client setup guides.** Got FrankKi working in an MCP client we do not cover in [docs/clients.md](docs/clients.md)? A short PR with the working config helps the next person.
- **Examples.** New minimal examples in other languages or agent frameworks, following the same shape as [examples/](examples/): validate, draft, quote, send behind an explicit flag, sandbox-first.

How:

1. Fork, branch, make the change.
2. Keep examples runnable against a sandbox key with no real mail sent by default.
3. Open a PR with a one-paragraph description.

For anything about the service itself (feature requests, account issues, bugs in the hosted server), use the dashboard at [frankki.app/mcp](https://frankki.app/mcp) or email support@frankki.app. Security issues: see [SECURITY.md](SECURITY.md), never a public issue.
