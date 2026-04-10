/**
 * Million Phones API — Batch phone number lookup
 * https://millionphones.com/docs
 *
 * Reads LinkedIn handles from a text file (one per line),
 * looks up verified phone numbers, and writes results to JSON.
 *
 * Usage:
 *   export MILLIONPHONES_API_KEY=your_key_here
 *   npx tsx batch-lookup.ts handles.txt results.json
 */

import { readFileSync, writeFileSync } from "fs";

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
    console.error(`Lookup failed for ${socialUrl}: ${response.status} ${response.statusText}`);
    return null;
  }

  const data = (await response.json()) as PhoneResponse;
  return data.phone_numbers?.length ? data.phone_numbers : null;
}

async function lookupWithRetry(
  socialUrl: string,
  retries = 3
): Promise<string[] | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await lookupPhone(socialUrl);
      if (result) return result;
    } catch (err) {
      console.error(`Attempt ${attempt} failed for ${socialUrl}:`, err);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
  }
  return null;
}

async function main() {
  const inputFile = process.argv[2];
  const outputFile = process.argv[3] || "results.json";

  if (!inputFile) {
    console.log("Usage: npx tsx batch-lookup.ts <input-file> [output-file]");
    console.log("  Input file should contain one LinkedIn handle per line.");
    process.exit(1);
  }

  const handles = readFileSync(inputFile, "utf-8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  console.log(`Processing ${handles.length} handles...\n`);

  const results: { handle: string; phones: string[] | null }[] = [];
  let found = 0;

  for (let i = 0; i < handles.length; i++) {
    const handle = handles[i];
    const phones = await lookupWithRetry(handle);

    if (phones) {
      console.log(`[${i + 1}/${handles.length}] ✅ ${handle} → ${phones.join(", ")}`);
      results.push({ handle, phones });
      found++;
    } else {
      console.log(`[${i + 1}/${handles.length}] ❌ ${handle} → not found`);
      results.push({ handle, phones: null });
    }

    // Rate limiting — 200ms between requests
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`\nDone. ${found}/${handles.length} verified numbers found.`);
  console.log(`Results written to ${outputFile}`);
}

main();