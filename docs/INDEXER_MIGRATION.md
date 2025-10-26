# Project Restructure Complete ✅

## New Project Structure

```
encode-2025/
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                    # Utilities
├── contracts/              # Solidity contracts
├── indexer/                # 🆕 Envio indexer (separate project)
│   ├── config.yaml
│   ├── src/
│   │   └── EventHandlers.ts
│   ├── generated/
│   ├── package.json
│   ├── .env
│   └── README.md
├── package.json            # Next.js dependencies
└── .env                    # Next.js environment variables
```

## How to Run

### 1. Install Dependencies

**Root (Next.js):**
```bash
pnpm install
```

**Indexer:**
```bash
cd indexer
pnpm install
```

Or from root:
```bash
pnpm indexer:install
```

### 2. Start Development

**Terminal 1 - Envio Indexer (port 8080):**
```bash
pnpm indexer:dev
```

**Terminal 2 - Next.js App (port 3000):**
```bash
pnpm dev
```

### 3. Access

- **Next.js App:** http://localhost:3000
- **GraphQL Playground:** http://localhost:8080/v1/graphql

## Environment Variables

### Root `.env` (Next.js)
- Frontend variables (`NEXT_PUBLIC_*`)
- Contract addresses
- API keys
- GraphQL endpoint: `NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8080/v1/graphql`

### `indexer/.env` (Envio)
- `ENVIO_API_TOKEN` - Your Envio API token

## Available Scripts

### Root Level
- `pnpm dev` - Start Next.js dev server
- `pnpm build` - Build Next.js app
- `pnpm start` - Start Next.js production server
- `pnpm indexer:install` - Install indexer dependencies
- `pnpm indexer:codegen` - Generate indexer types
- `pnpm indexer:dev` - Start indexer in dev mode
- `pnpm indexer:start` - Start indexer in production mode

### Indexer Directory
- `pnpm codegen` - Generate TypeScript types from config
- `pnpm dev` - Start with hot reload
- `pnpm start` - Start in production mode
- `pnpm test` - Run tests

## Benefits

✅ **Clean Separation:** Next.js and Envio are now separate projects
✅ **No Port Conflicts:** They run on different ports
✅ **Independent Dependencies:** Each has its own package.json
✅ **Better Organization:** Clear project boundaries
✅ **Easy Deployment:** Can deploy separately if needed

## Next Steps

1. Navigate to `indexer/` and run `pnpm install`
2. Generate types: `pnpm indexer:codegen`
3. Start the indexer: `pnpm indexer:dev`
4. In another terminal, start Next.js: `pnpm dev`
5. Query indexed data from your Next.js app using the GraphQL endpoint
