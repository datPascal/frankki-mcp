# Use cases: what agents send by physical mail

Some correspondence still has to arrive on paper to be legally effective, taken seriously, or accepted at all. These are the workflows FrankKi MCP was built for, with the tool sequence each one uses.

## Dunning and payment reminders

The classic. Your billing system knows who is overdue; an agent drafts the reminder in the right tone for the escalation stage and mails it.

- Escalation stages map to templates (`template_list`, `template_apply_with_merge_fields`).
- `order_send_batch` handles the nightly run; `maxCostEuros` and per-key daily caps bound the spend.
- `order_einlieferungsbeleg` gives you proof of posting per letter, which matters if the case ends up in court.

## Contract terminations, cancellations, and objections

Terminations and formal objections often require written form and proof of dispatch. An agent that manages subscriptions or contracts can close the loop itself.

- `address_search_company` finds the counterparty's postal address when you only have a name.
- Registered mail (where the destination supports it) via the `deliveryType` option on `shipping_quote` and `order_send`.
- Route through `approval_submit` so a human sees the letter before it becomes legally binding.

## Compliance and regulatory mail

Notices that regulation says must be sent in writing: privacy notifications, terms changes, account closures, shareholder communications.

- `order_send_batch` with per-recipient merge fields for personalization at scale.
- GoBD-compliant archiving is automatic; `archive_export` produces DATEV or DMS bundles for the auditors.

## Customer onboarding and lifecycle

Welcome letters, activation codes, physical vouchers. Paper converts differently than the 40th email.

- Letterheads and signatures (`letterhead_upload`, `signature_upload`) make it look like it came from your brand, because it did.
- `letter_schedule` times the letter to land days after signup.

## Professional services (tax advisors, law firms, property managers)

Firms that correspond on behalf of many clients get client-scoped records (`mandant_list`, `mandant_get`, `mandant_search`) and a four-eyes approval queue, so a paralegal or clerk approves what an agent drafted.

## Agent-native products

The most interesting category: products where the agent IS the product. An AI assistant that handles bureaucracy for consumers, an ops copilot that resolves disputes, a service that answers government letters. FrankKi is the physical-output layer; you never touch a printer, in any country.

## What it is deliberately not for

- **Unsolicited advertising mail.** Bulk cold mail is against the acceptable-use policy.
- **Sending arbitrary pre-rendered PDFs as the letter.** Composition is text-first so every letter is well-formed, archivable, and reviewable. PDFs are supported as attachments to a composed letter.
- **Anything a wallet can't bound.** All spend is prepaid. There is no way for an agent to run up an invoice.
