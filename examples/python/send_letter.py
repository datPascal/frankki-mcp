"""FrankKi MCP example: validate an address, draft a letter, quote the price,
and (optionally) send it as real physical mail.

Run:
    export FRANKKI_API_KEY=sk_sandbox_...   # sandbox key: full flow, no real mail
    pip install -r requirements.txt
    python send_letter.py

Get a key at https://frankki.app/mcp
"""

import asyncio
import json
import os

from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

ENDPOINT = "https://mcp.frankki.app/mcp"
SEND_FOR_REAL = False  # flip to True to actually charge the wallet and mail paper

RECIPIENT = {
    "name": "Erika Mustermann",
    "street": "Musterstraße",
    "houseNumber": "12",
    "zip": "10115",
    "city": "Berlin",
    "country": "DE",
}

BODY = (
    "Sehr geehrte Frau Mustermann,\n\n"
    "vielen Dank für Ihre Anfrage. Anbei erhalten Sie die gewünschten Unterlagen.\n\n"
    "Mit freundlichen Grüßen"
)


async def main() -> None:
    api_key = os.environ.get("FRANKKI_API_KEY")
    if not api_key:
        raise SystemExit("Set FRANKKI_API_KEY (issue one at https://frankki.app/mcp)")

    headers = {"Authorization": f"Bearer {api_key}"}
    async with streamablehttp_client(ENDPOINT, headers=headers) as (read, write, _):
        async with ClientSession(read, write) as session:
            await session.initialize()

            tools = await session.list_tools()
            names = [t.name for t in tools.tools]
            print(f"Connected. {len(names)} tools available: {', '.join(names)}")

            # 1. Validate the recipient address against postal rules.
            validation = await session.call_tool(
                "address_validate", {"address": RECIPIENT}
            )
            print("Address validation:", validation.content)

            # 2. Draft the letter. FrankKi renders a DIN 5008 formatted document
            #    and returns a preview. Nothing is sent yet.
            draft = await session.call_tool(
                "letter_create_draft",
                {
                    "recipient": RECIPIENT,
                    "subject": "Ihre Anfrage vom 1. Juli",
                    "body": BODY,
                },
            )
            print("Draft:", draft.content)

            # 3. Quote the exact price before committing.
            quote = await session.call_tool(
                "shipping_quote",
                {"recipientCountry": "DE", "deliveryType": "standard"},
            )
            print("Quote:", quote.content)

            # 4. Send, guarded by maxCostEuros so a price surprise aborts
            #    instead of spending.
            if SEND_FOR_REAL:
                letter_id = _extract_letter_id(draft)
                send = await session.call_tool(
                    "order_send", {"letterId": letter_id, "maxCostEuros": 5.0}
                )
                print("Sent:", send.content)
            else:
                print("Dry run complete. Set SEND_FOR_REAL = True to dispatch.")


def _extract_letter_id(result) -> str:
    for item in result.content:
        text = getattr(item, "text", "")
        try:
            data = json.loads(text)
        except (json.JSONDecodeError, TypeError):
            continue
        if isinstance(data, dict) and "letterId" in data:
            return data["letterId"]
    raise RuntimeError("No letterId in draft result")


if __name__ == "__main__":
    asyncio.run(main())
