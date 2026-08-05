# Tool reference

FrankKi MCP exposes a focused, scoped tool set for composing, pricing, sending, and tracking physical letters. This page documents all **63 registered tools**.

Three things to know before you rely on this page:

1. **The server is the source of truth.** The authoritative, versioned tool list is always what the server returns from the MCP `tools/list` method.
2. **63 registered is not 63 listed.** 54 tools are listed for every account. The remaining 9 sit behind a rollout flag and are absent from `tools/list` entirely until that flag is on for the deployment — they are marked 🔒 below, with the flag named. A rollout-gated tool does not error when it is off; it simply is not there, so an agent should discover from `tools/list` rather than assume this page. (A separate set of iframe-only tools backs the approval and preview cards inside MCP-Apps hosts. They are never offered to a model and are deliberately not documented here.)
3. **Every tool is scoped.** Each API key and OAuth grant carries an explicit scope list. A key without `order:send` physically cannot call `order_send`, no matter what the model asks for. Read-only scopes are the default.

Legend: **read** = no side effects. **write** = creates or changes data on your account. **spends money** = charges the prepaid wallet and results in real, printed mail. 🔒 = rollout-gated.

> Counts and scopes on this page are generated from the server's own registry (`npm run export:mcp-tools`) and pinned by a test. If you find a number here that disagrees with `tools/list`, `tools/list` wins and the mismatch is a bug — please open an issue.

## Account and wallet

| Tool | Scope | Effect | What it does |
|------|-------|--------|--------------|
| `profile_get` | `profile:read` | read | Read the partner account profile: name, plan, limits, defaults. |
| `wallet_balance` | `wallet:read` | read | Current prepaid wallet balance. Check before large sends. |
| `wallet_topup_link` | `wallet:read` | read | Create a secure Stripe Checkout link to top up the wallet. The tool only produces a link; payment happens in the browser, never through the agent. |
| `analytics_summary` | `analytics:read` | read | Aggregated account metrics: letters per month, cost per client for rebilling, transit times to delivery, failure rates, and spend against configured limits. Amounts are net cost in cents. |
| `mcp_health` | — | read | Echo probe: verifies the token and the processing chain end to end, and reports the granted scopes, token mode and capabilities of the current session. With `checkRender: true` it also checks that rendering is currently possible. Call it before building a template you intend to preview. Needs no scope. |

## Sender profiles

| Tool | Scope | Effect | What it does |
|------|-------|--------|--------------|
| `sender_profile_list` | `sender_profile:read` | read | List the sender identities (return addresses) configured on the account. |
| `sender_profile_get` | `sender_profile:read` | read | Read one sender profile in full. |
| `sender_profile_validate` | `sender_profile:read` | read | Validate a sender profile against postal formatting rules before it is used on a letter. |
| `sender_profile_upsert` | `sender_profile:write` | write | Create or edit a sender profile: legal form, mandatory details, optionally bank details, disclaimer and default letterhead. An incomplete profile is saved and reports back which fields are missing, so it can be completed step by step. Sending requires the mandatory details to be complete. |

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
| `template_save` | `template:write` | write | Write a template as a **draft** version. Set `documentKind` to `letter` or `form`. Letterhead and brand stay an external layer, resolved only at preview or send time. Every save appends a new immutable draft version; nothing is overwritten. |
| `template_preview` | `template:read` | read | 🔒 `structured_documents` — Render a **saved** template with sample values and return inline PNGs, a PDF link and `designRender`. Free and read-only. For a `blocks` layout still being composed, use `letter_preview` instead. |
| `template_release` | `template:write` | write | Release a draft version so it becomes sendable — the last step of the authoring chain. **Note:** `template_preview` shows a human an approval card with a Release button. While that card is open the release belongs to the human; only call this tool when the human has not been given that card. |
| `template_archive` | `template:write` | write | Archive a template. It disappears from the lists and from sending but is fully preserved. Calling it again is harmless. Annotated destructive: it removes the template from the working set and has no undo tool, so a client should confirm with its user. |
| `template_draft_discard` | `template:write` | write | Discard a draft version while it is still awaiting release. Released and superseded versions stay untouchable. Calling it again is harmless. Annotated destructive, for the same reason as `template_archive`. |

The template authoring chain is: `template_get` → edit → `letter_preview` → `template_save` → `template_preview` → `template_release`.

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
| `letter_preview` | `order:send` | read | 🔒 `structured_documents` — Compose a letter exactly as a real send would and return inline PNGs, a PDF link, page count, price and `designRender` (actual `documentMode`, drawn elements, `bodyStartMm`). The preview is free and the letter is not sent. Takes a `letterId`, or inline `content` **or** `blocks`. |

Composition is text-first: you provide content and a recipient, FrankKi produces the document. Sending a pre-rendered arbitrary PDF as the letter itself is intentionally not part of the platform; attachments ride along with a composed letter.

## Pricing and sending

| Tool | Scope | Effect | What it does |
|------|-------|--------|--------------|
| `shipping_quote` | `letter:read` | read | Exact price for a send to a given destination country, delivery type, and options. Always call this before sending; prices are authoritative from the server. |
| `pricing_tiers` | `letter:read` | read | The volume tiers: from which monthly quantity which example per-letter price applies. Use it when someone asks about volume discounts or bulk pricing. The example prices assume a one-page black-and-white standard letter within Germany; the real price also depends on page count, colour, delivery type and destination, so quote with `shipping_quote`. |
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
| `order_fix_resubmit` | `order:send` | write | Correct the recipient address of a letter that is waiting on a fix (status `awaiting_partner_fix`) and release it for sending again. The price does not change: the existing reservation or charge stands, so this does **not** spend additional money. Any other status answers `ORDER_NOT_FIXABLE`. Annotated destructive: it releases a physical send. |

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

## Letterhead design and brand

A letter design is reusable stationery: it carries every piece of mail the account sends — cancellation, invoice, dunning letter, offer, contract, correspondence with authorities.

| Tool | Scope | Effect | What it does |
|------|-------|--------|--------------|
| `letter_design_list` | `letter_design:write` | read | List the account's saved letter designs with their full design JSON. A design is referenced by name or id when sending. |
| `letter_design_save` | `letter_design:write` | write | Save a reusable letter design (`schemaVersion` 1 or 2) and return its `designId` plus a hash of the stored source. The design is validated before it is stored. |
| `letter_design_preview` | `letter_design:write` | read | Render a saved or inline design through the same resolution and composer a real send uses, with real sender data and an invented recipient. Returns an inline PNG page. `sampleVariant: "empty"` shows the stationery alone. |
| `letter_design_delete` | `letter_design:write` | write | Archive a saved design. New sends run on the remaining designs; already-sent letters keep their original for auditability. |
| `letter_design_list_presets` | `letter_design:write` | read | 🔒 `letter_design_v2` — Owner-approved native-v2 designs as safe starting points. The plain list is text-only and cheap; passing a `presetId` renders exactly one real composer preview with an inline PNG. |
| `brand_kit_get` | `profile:read` | read | 🔒 `letter_design_v2` — Read the saved brand values: logo references, colours and font, for further work with `letter_design_preview` and `letter_design_save`. |
| `brand_kit_save` | `letter_design:write` | write | 🔒 `letter_design_v2` — Save logo references, colours and font. `brandingOwnershipConfirmed` must be `true`, asserting the rights to the supplied brand assets. |
| `brand_import_from_website` | `letter_design:write` | write | 🔒 `brand_import` — Read a public company website and propose a letterhead from it: brand colours, house-font mapping, ranked logo candidates and company details from the Impressum. Discovered logos are stored as design assets. The result is a **proposal** for a human to confirm, not an applied brand. |

Note the scope shape: the read-only design tools also gate on `letter_design:write`. A read-only design scope is a planned addition and does not exist in v1, so a key that may look at designs may also write them. Grant accordingly.

## Documents (invoices, reminders, dunning, credit notes)

🔒 All three are gated on `billing_suite`.

| Tool | Scope | Effect | What it does |
|------|-------|--------|--------------|
| `document_create` | `order:send` | write | Turn structured billing data into a finished document and file it as a letter draft: FrankKi recalculates line items, net, VAT rates and gross, checks the mandatory details required by § 14 UStG, optionally assigns the number from your own number range, and lays it out per DIN 5008 with your letter design. The draft sits free of charge until you send it. All amounts in whole cents. |
| `document_list` | `letter:read` | read | List created documents (invoice, payment reminder, dunning letter, credit note), newest first, filterable by kind, client, recipient or referenced document. |
| `document_get` | `letter:read` | read | Read one document with all billing data, plus the `letterId` and `orderId` of the letter carrying it. `referencePrefill` returns a ready-made `references` block: pass it unchanged into a `document_create` to raise a follow-up (reminder, dunning letter, credit note). |

A document is not sent by creating it. It becomes a draft; sending is still `order_send`, and still spends money.

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
