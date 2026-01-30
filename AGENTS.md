# Repository Guidelines

## Project Overview

**TenUI** — A Generative UI library that maps AI tool responses to UI components via a chainable builder API.

## Project Structure

```
tenui/
├── packages/
│   ├── core/                    # @tenui/core — Framework-agnostic core
│   │   ├── src/
│   │   │   ├── index.ts         # Public exports
│   │   │   ├── types.ts         # Type definitions
│   │   │   ├── builder.ts       # createGenerativeUI + ToolBuilder
│   │   │   └── __tests__/
│   │   │       └── builder.test.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── jest.config.cjs      # Jest config (CJS for ESM package)
│   │
│   └── react/                   # @tenui/react — React adapter
│       ├── src/
│       │   ├── index.ts         # Public exports
│       │   └── renderer.tsx     # GenerativeRenderer component
│       ├── package.json
│       └── tsconfig.json
│
├── playground/
│   └── react-app/               # Vite test app
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   └── components.tsx
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
│
├── package.json                 # Root workspace config
├── tsconfig.base.json           # Shared TypeScript config
├── ARCHITECTURE.md              # Implementation guide
└── AGENTS.md                    # This file
```

## Build, Test, and Development Commands

### Root level
```bash
yarn install    # Install all dependencies + link workspaces
yarn build      # Build all packages
yarn test       # Run all tests
yarn clean      # Clean all dist folders
yarn dev        # Start playground dev server
```

### Package: @tenui/core
```bash
cd packages/core
yarn build      # Compile TypeScript (ESM)
yarn test       # Run Jest tests
yarn clean      # Remove dist/
yarn typecheck  # Type check without emit
```

### Package: @tenui/react
```bash
cd packages/react
yarn build      # Compile TypeScript (ESM)
yarn test       # Run Jest (passWithNoTests)
```

### Playground
```bash
cd playground/react-app
yarn dev        # Start Vite dev server
yarn build      # Build for production
yarn preview    # Preview production build
```

## Key Technical Details

### ESM-First
- All packages use `"type": "module"` (ESM)
- TypeScript compiles to ES modules
- Jest uses `.cjs` config file for ESM packages

### Workspace Links
- Root `node_modules/@tenui/*` → symlinks to `packages/*`
- Playground imports from `@tenui/core` and `@tenui/react`

### Build Output
- `packages/core/dist/` — ESM + type declarations
- `packages/react/dist/` — ESM + type declarations
- `playground/react-app/dist/` — Vite production build

## Coding Style

- TypeScript strict mode
- 2-space indentation
- JSDoc comments for public APIs
- Descriptive variable names

## Testing

- Core: 19 unit tests for builder API
- React: No tests yet (configured to passWithNoTests)
- Playground: Manual testing via Vite app

## Documentation Files

| File | Purpose |
|------|---------|
| `GenUI.md` | Original library pattern spec (reference) |
| `Doc.md` | Long-term architecture vision |
| `Publishing.md` | npm publishing guide (update to @tenui/*) |
| `ARCHITECTURE.md` | Implementation guide for engineers |
| `AGENTS.md` | This file — quick reference |
