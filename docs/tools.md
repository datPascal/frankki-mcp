# Tool reference

FrankKi MCP exposes a focused, scoped tool set for composing, pricing, sending, and tracking physical letters. This page documents every tool the hosted server can register.

Two things to know before you rely on this page:

1. **The server is the source of truth.** The authoritative, versioned tool list is always what the server returns from the MCP `tools/list` method. Tools ship behind per-account feature flags, so your account may see a subset of what is documented here.
2. **Every tool is scoped.** Each API key and OAuth grant carries an explicit scope list. A key without `order:send` physically cannot call `order_send`, no matter what the model asks for. Read-only scopes are the default.

Legend: **read** = no side effects. **write** = creates or changes data on your account. **spends money** = charges the prepaid wallet and results in real, printed mail.

## Account and wallet

| Tool | Scope | Effect | What it does |
|------|-------|--------|--------------|
| `profile_get` | `profile:read` | read | Read the partner account profile: name, plan, limits, defaults. |
| `wallet_balance` | `wallet:read` | read | Current prepaid wallet balance. Check before large sends. |
| `wallet_topup_link` | `wallet:read` | read | Create a secure Stripe Checkout link to top up the wallet. The tool only produces a link; payment happens in the browser, never through the agent. |

## Sender profiles

| Tool | Scope | Effect | What it does |
|------|-------|--------|--------------|
| `sender_profile_list` | `sender_profile:read` | read | List the sender identities (return addresses) configured on the account. |
| `sender_profile_get` | `sender_profile:read` | read | Read one sender profile in full. |
| `sender_profile_validate` | `sender_profile:read` | read | Validate a sender profile against postal formatting rules before it is used on a letter. |

## Addresses

| Tool | Scope | Effect | What it does |
|------|-------|--------|--------------|
| `address_list` | `address:read` | read | Browse the account address book. |
| `address_validate` | `address:read` | read | Validate a recipient address against destination-country postal rules before sending. |
| `address_search_company` | `address:read` | read | Look up a company's postal address by name (registry-backed search). Useful when the agent knows who to write to but not where. |
| `address_upsert` | `address:write` | write | Create or update an address book entry. |

## Templates and presets

| Tool | Scope | Effect | What it does |
|------|-------|--------|--------------|
| `template_list` | `template:read` | read | List reusable letter templates on the account. |
| `template_get` | `template:read` | read | Read one template, including its merge fields. |
| `template_apply_with_merge_fields` | `template:read` | read | Render a template with concrete merge-field values and return the resulting letter content for review. |
| `template_diff_check` | `template:read` | read | Compare a final letter against the template it came from and report what the merge changed. Designed as a pre-send audit step. |
| `preset_save` | `preset:write` | write | Save a named send preset (delivery type, color, letterhead, defaults) for reuse across sends. |

## Letterheads and signatures

| Tool | Scope | Effect | What it does |
|------|-------|--------|--------------|
| `letterhead_list` | `profile:read` | read | List uploaded letterheads. |
| `letterhead_upload` | `letterhead:write` | write | Upload a letterhead (PNG or PDF) with placement (header, footer, or full page). |
| `signature_list` | `profile:read` | read | List uploaded signatures. |
| `signature_upload` | `signature:write` | write | Upload a signature image to be placed on letters. |

## Composing letters

| Tool | Scope | Effect | What it does |
|------|-------|--------|--------------|
| `letter_create_draft` | `order:send` | write | Create a letter draft from plain text plus a recipient. FrankKi renders a correctly formatted document (DIN 5008 by default) and returns a preview. Nothing is sent. |
| `letter_get` | `letter:read` | read | Read one letter, including its rendered state and status. |
| `letter_list` | `letter:read` | read | List letters on the account, filterable by status. |
| `letter_search` | `letter:read` | read | Full-text search across the account's letters. |
| `attachment_upload_pdf` | `order:send` | write | Attach a PDF (by URL or Base64) to a draft. Attachments are printed after the letter body. |
| `attachment_upload_image` | `order:send` | write | Attach an image (by URL or Base64, with rotation) to a draft. |

Composition is text-first: you provide content and a recipient, FrankKi produces the document. Sending a pre-rendered arbitrary PDF as the letter itself is intentionally not part of the platform; attachments ride along with a composed letter.

## Pricing and sending

| Tool | Scope | Effect | What it does |
|------|-------|--------|--------------|
| `shipping_quote` | `letter:read` | read | Exact price for a send to a given destination country, delivery type, and options. Always call this before sending; prices are authoritative from the server. |
| `order_send` | `order:send` | **spends money** | Send one physical letter. Charges the wallet atomically and hands the job to print fulfillment. Supports `maxCostEuros`: if the live price exceeds your cap, the send aborts instead of spending. |
| `order_send_batch` | `order:send` | **spends money** | Bulk send: one call, many recipients, same letter or template with per-recipient merge fields. Supports `stopOnError`. |
| `letter_schedule` | `letter:schedule` | write | Schedule a letter to be sent at a future date instead of immediately. |
| `schedule_list_or_cancel` | `letter:schedule` | write | List scheduled sends or cancel one before it dispatches. |

## Orders and tracking

| Tool | Scope | Effect | What it does |
|------|-------|--------|--------------|
| `order_status` | `order:read` | read | Track an order through its lifecycle: accepted, printed, posted, and, where the destination supports it, delivered. |
| `order_cancel` | `order:send` | write | Cancel an order that has not yet been printed. After print handoff, physical mail cannot be recalled. |
| `order_einlieferungsbeleg` | `order:read` | read | Retrieve the posting receipt (Einlieferungsbeleg) for a sent letter, for proof-of-posting and audit trails. |

## Approval queue (human-in-the-loop)

| Tool | Scope | Effect | What it does |
|------|-------|--------|--------------|
| `approval_submit` | `order:send` | write | Route a letter into the four-eyes approval queue instead of sending directly. A human reviews the rendered letter and price before anything is printed. |
| `approval_list` | `approval:read` | read | List pending and decided approval items. |
| `approval_decide` | `approval:decide` | write | Approve or reject a queued letter. Typically reserved for human-operated sessions; every decision is logged. |

## Clients (Mandanten)

For accounts that send on behalf of multiple clients (tax advisors, law firms, property managers):

| Tool | Scope | Effect | What it does |
|------|-------|--------|--------------|
| `mandant_list` | `mandant:read` | read | List client records. |
| `mandant_get` | `mandant:read` | read | Read one client record. |
| `mandant_search` | `mandant:read` | read | Search clients by name or reference. |

Client records are managed in the web dashboard; the MCP surface is deliberately read-only here.

## Compliance exports

| Tool | Scope | Effect | What it does |
|------|-------|--------|--------------|
| `archive_export` | `archive:read` | read | Start an export of the GoBD-compliant send archive (generic DMS or DATEV format). |
| `archive_export_status` | `archive:read` | read | Poll an export job and retrieve the download link when ready. |

## The canonical send flow

```text
address_validate ──► letter_create_draft ──► shipping_quote ──► order_send ──► order_status
                                                    │
                                                    └──► approval_submit (four-eyes) ──► human approves ──► send
```

1. Validate the recipient (`address_validate`).
2. Draft and preview (`letter_create_draft`).
3. Price it (`shipping_quote`). Never hardcode prices.
4. Send (`order_send`, ideally with `maxCostEuros`), or route through `approval_submit` for a human check.
5. Track (`order_status`), fetch the receipt (`order_einlieferungsbeleg`).

## Error model

Errors follow the standard MCP error shape with stable, machine-readable codes. The ones worth handling explicitly:

| Code | Meaning | What your agent should do |
|------|---------|---------------------------|
| `INSUFFICIENT_FUNDS` | Wallet balance below send price | Call `wallet_topup_link`, surface the link to a human |
| `RATE_LIMITED` | Too many requests | Back off and retry with jitter |
| `DAILY_CAP_EXCEEDED` | Key's daily spend limit reached | Stop sending; a human raised limit is required |
| `SCOPE_MISSING` | Key lacks the required scope | Do not retry; the key must be re-issued with the scope |
| `PDF_LETTER_UNSUPPORTED` | Attempt to send a pre-rendered PDF as the letter | Compose text-first instead; PDFs are supported as attachments |
