/**
 * Million Phones API — Single phone number lookup
 * https://millionphones.com/docs
 *
 * Usage:
 *   export MILLIONPHONES_API_KEY=your_key_here
 *   npx tsx lookup.ts williamhgates
 */

interface PhoneResponse {
  phone_numbers: string[];
}

async function lookupPhone(socialUrl: string): Promise<string[] | null> {
  const apiKey = process.env.MILLIONPHONES_API_KEY;

  if (!apiKey) {
    throw new Error("Missing MILLIONPHONES_API_KEY environment variable");
  }

  const url = `https://millionphones.com/v1/phone?social_url=${encodeURIComponent(socialUrl)}`;

  const response = await fetch(url, {
    headers: {
      "x-api-key": apiKey,
    },
  });

  if (!response.ok) {
    console.error(`Lookup failed: ${response.status} ${response.statusText}`);
    return null;
  }

  const data = (await response.json()) as PhoneResponse;
  return data.phone_numbers?.length ? data.phone_numbers : null;
}

async function main() {
  const handle = process.argv[2];

  if (!handle) {
    console.log("Usage: npx tsx lookup.ts <linkedin-handle>");
    process.exit(1);
  }

  console.log(`Looking up: ${handle}`);
  const phones = await lookupPhone(handle);

  if (phones) {
    phones.forEach((phone) => console.log(`✅ ${phone}`));
  } else {
    console.log("❌ No verified number found");
  }
}

main();