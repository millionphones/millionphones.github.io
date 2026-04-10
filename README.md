# Million Phones API Examples

Integration examples and scripts for the [Million Phones API](https://millionphones.com/docs) — verified mobile phone numbers for sales teams.

## Examples

### [TypeScript API](examples/typescript-api/)

Look up verified phone numbers using TypeScript and Node 18+.

```bash
cd examples/typescript-api
npm install
export MILLIONPHONES_API_KEY=your_key_here

# Single lookup
npx tsx lookup.ts williamhgates

# Batch lookup
npx tsx batch-lookup.ts handles.txt results.json
```

## Links

- [API Docs](https://millionphones.com/docs)
- [Get API Key](https://millionphones.com/login)
- [millionphones.com](https://millionphones.com)
