/**
 * FrankKi MCP example: validate an address, draft a letter, quote the price,
 * and (optionally) send it as real physical mail.
 *
 * Run:
 *   export FRANKKI_API_KEY=sk_sandbox_...   # sandbox key: full flow, no real mail
 *   npm install && npm start
 *
 * Get a key at https://frankki.app/mcp
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const ENDPOINT = "https://mcp.frankki.app/mcp";
const SEND_FOR_REAL = false; // flip to true to actually charge the wallet and mail paper

async function main() {
  const apiKey = process.env.FRANKKI_API_KEY;
  if (!apiKey) throw new Error("Set FRANKKI_API_KEY (issue one at https://frankki.app/mcp)");

  const transport = new StreamableHTTPClientTransport(new URL(ENDPOINT), {
    requestInit: { headers: { Authorization: `Bearer ${apiKey}` } },
  });
  const client = new Client({ name: "frankki-example", version: "1.0.0" });
  await client.connect(transport);

  const { tools } = await client.listTools();
  console.log(`Connected. ${tools.length} tools available:`, tools.map((t) => t.name).join(", "));

  const recipient = {
    name: "Erika Mustermann",
    street: "Musterstraße",
    houseNumber: "12",
    zip: "10115",
    city: "Berlin",
    country: "DE",
  };

  // 1. Validate the recipient address against postal rules.
  const validation = await client.callTool({
    name: "address_validate",
    arguments: { address: recipient },
  });
  console.log("Address validation:", JSON.stringify(validation.content, null, 2));

  // 2. Draft the letter. FrankKi renders a DIN 5008 formatted document and
  //    returns a preview. Nothing is sent yet.
  const draft = await client.callTool({
    name: "letter_create_draft",
    arguments: {
      recipient,
      subject: "Ihre Anfrage vom 1. Juli",
      body:
        "Sehr geehrte Frau Mustermann,\n\n" +
        "vielen Dank für Ihre Anfrage. Anbei erhalten Sie die gewünschten Unterlagen.\n\n" +
        "Mit freundlichen Grüßen",
    },
  });
  console.log("Draft:", JSON.stringify(draft.content, null, 2));

  // 3. Quote the exact price for this destination before committing.
  const quote = await client.callTool({
    name: "shipping_quote",
    arguments: { recipientCountry: "DE", deliveryType: "standard" },
  });
  console.log("Quote:", JSON.stringify(quote.content, null, 2));

  // 4. Send. Guard with maxCostEuros so a price surprise aborts instead of spending.
  if (SEND_FOR_REAL) {
    const send = await client.callTool({
      name: "order_send",
      arguments: { letterId: extractLetterId(draft), maxCostEuros: 5.0 },
    });
    console.log("Sent:", JSON.stringify(send.content, null, 2));
  } else {
    console.log("Dry run complete. Set SEND_FOR_REAL = true to dispatch.");
  }

  await client.close();
}

function extractLetterId(draftResult: { content?: unknown }): string {
  const text = JSON.stringify(draftResult.content ?? "");
  const match = text.match(/"letterId"\s*:\s*"([^"]+)"/);
  if (!match) throw new Error("No letterId in draft result");
  return match[1];
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
