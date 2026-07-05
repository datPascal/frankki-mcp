# Client setup guides

FrankKi MCP is a hosted, remote MCP server speaking **streamable HTTP**. There is nothing to install or run locally; every guide below just points a client at:

```
https://mcp.frankki.app/mcp
```

Interactive clients use OAuth (a browser window opens on first use). Headless setups pass an API key as a bearer header. See [authentication.md](authentication.md).

- [Claude Desktop](#claude-desktop)
- [Claude Code](#claude-code)
- [Claude (web and mobile)](#claude-web-and-mobile)
- [Cursor](#cursor)
- [VS Code (GitHub Copilot)](#vs-code-github-copilot)
- [Windsurf](#windsurf)
- [Zed](#zed)
- [OpenAI Agents SDK](#openai-agents-sdk)
- [LangChain / LangGraph](#langchain--langgraph)
- [Any stdio-only client via mcp-remote](#any-stdio-only-client-via-mcp-remote)

## Claude Desktop

Settings → Connectors → **Add custom connector**, paste the endpoint URL, done. OAuth runs in the browser on first use.

Or via `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "frankki": {
      "url": "https://mcp.frankki.app/mcp"
    }
  }
}
```

Older Claude Desktop builds without native remote support: use the [mcp-remote bridge](#any-stdio-only-client-via-mcp-remote).

## Claude Code

One command:

```bash
claude mcp add --transport http frankki https://mcp.frankki.app/mcp
```

Headless (CI, agents) with an API key:

```bash
claude mcp add --transport http frankki https://mcp.frankki.app/mcp \
  --header "Authorization: Bearer ${FRANKKI_API_KEY}"
```

Then in a session: *"Quote me the price of a registered letter to an address in Austria, then draft it."*

## Claude (web and mobile)

Settings → Connectors → **Add custom connector** → paste `https://mcp.frankki.app/mcp`. Requires a Claude plan with custom connector support.

## Cursor

Settings → MCP → **Add new MCP server**, or add to `.cursor/mcp.json` (project) / `~/.cursor/mcp.json` (global):

```json
{
  "mcpServers": {
    "frankki": {
      "url": "https://mcp.frankki.app/mcp"
    }
  }
}
```

With an API key, add a `headers` object:

```json
{
  "mcpServers": {
    "frankki": {
      "url": "https://mcp.frankki.app/mcp",
      "headers": {
        "Authorization": "Bearer ${FRANKKI_API_KEY}"
      }
    }
  }
}
```

## VS Code (GitHub Copilot)

Command palette → **MCP: Add Server** → HTTP, or add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "frankki": {
      "type": "http",
      "url": "https://mcp.frankki.app/mcp"
    }
  }
}
```

## Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "frankki": {
      "serverUrl": "https://mcp.frankki.app/mcp"
    }
  }
}
```

## Zed

Settings → open `settings.json` and add:

```json
{
  "context_servers": {
    "frankki": {
      "source": "custom",
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.frankki.app/mcp"]
    }
  }
}
```

## OpenAI Agents SDK

MCP is model-agnostic. From the OpenAI Agents SDK (Python):

```python
from agents.mcp import MCPServerStreamableHttp

async with MCPServerStreamableHttp(
    params={
        "url": "https://mcp.frankki.app/mcp",
        "headers": {"Authorization": f"Bearer {FRANKKI_API_KEY}"},
    }
) as frankki:
    agent = Agent(
        name="mail-agent",
        instructions="You can send real physical letters. Always quote the price first.",
        mcp_servers=[frankki],
    )
```

## LangChain / LangGraph

Via `langchain-mcp-adapters`:

```python
from langchain_mcp_adapters.client import MultiServerMCPClient

client = MultiServerMCPClient({
    "frankki": {
        "transport": "streamable_http",
        "url": "https://mcp.frankki.app/mcp",
        "headers": {"Authorization": f"Bearer {FRANKKI_API_KEY}"},
    }
})
tools = await client.get_tools()
```

## Any stdio-only client via mcp-remote

For clients that only launch local stdio servers, bridge with [`mcp-remote`](https://www.npmjs.com/package/mcp-remote):

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

With an API key (skips the OAuth browser flow):

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

## First prompt to try

Once connected, ask your model:

> Validate this address, draft a short formal letter to it, quote the price for standard delivery, and stop before sending so I can review.

Safe by construction: drafting and quoting are read-mostly. Nothing is printed until `order_send` runs, and you can start with a [sandbox key](../README.md#sandbox) where even that mails nothing.
