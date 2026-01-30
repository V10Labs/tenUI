# Generative UI — Publishing & Distribution Guide (npm / yarn)

This document explains **how to package, version, and publish GenUI** so it can be consumed via **npm**, **yarn**, and **pnpm**, while remaining scalable as a multi-package framework.

---

## 1. Publishing Strategy (Important)

GenUI is a **multi-package framework**, not a single bundle.

### Published Packages

| Package        | Purpose                           |
| -------------- | --------------------------------- |
| `@genui/core`  | Framework-agnostic resolver + DSL |
| `@genui/react` | React rendering adapter           |

Future:

* `@genui/solid`
* `@genui/vue`
* `@genui/devtools`

Each package is **published independently**.

---

## 2. Monorepo Setup (pnpm Workspaces)

### Root `package.json`

```json
{
  "name": "genui",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "packageManager": "pnpm@8"
}
```

Install deps:

```bash
pnpm install
```

---

## 3. Package Structure (Per Package)

Each publishable package **must** have its own:

* `package.json`
* `src/`
* build output (`dist/`)

Example:

```
packages/core/
├─ src/
│  └─ index.ts
├─ package.json
└─ tsconfig.json
```

---

## 4. Package Configuration (`@genui/core`)

### `packages/core/package.json`

```json
{
  "name": "@genui/core",
  "version": "0.1.0",
  "description": "Framework-agnostic generative UI resolver",
  "license": "MIT",
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "sideEffects": false,
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 5. React Adapter Package (`@genui/react`)

### `packages/react/package.json`

```json
{
  "name": "@genui/react",
  "version": "0.1.0",
  "description": "React adapter for GenUI",
  "license": "MIT",
  "peerDependencies": {
    "react": ">=18"
  },
  "dependencies": {
    "@genui/core": "^0.1.0"
  },
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "sideEffects": false,
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  },
  "scripts": {
    "build": "tsup src/index.tsx --format esm,cjs --dts"
  }
}
```

---

## 6. TypeScript Configuration (Shared)

### Root `tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "declaration": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

Each package extends it.

---

## 7. Building All Packages

From repo root:

```bash
pnpm -r run build
```

Verify output:

```bash
ls packages/*/dist
```

---

## 8. Versioning Strategy

### Semantic Versioning

* `0.x` → rapid iteration
* `1.0.0` → public framework API freeze

### Syncing Versions

Recommended (early):

* Keep **core + adapters on same version**

Later:

* Allow adapter minor divergence

---

## 9. Publishing to npm

### 9.1 Login

```bash
npm login
```

### 9.2 Publish Core

```bash
cd packages/core
npm publish --access public
```

### 9.3 Publish React Adapter

```bash
cd ../react
npm publish --access public
```

Scoped packages (`@genui/*`) **require `--access public`**.

---

## 10. Using with npm, yarn, pnpm

All package managers work automatically once published.

### npm

```bash
npm install @genui/core @genui/react
```

### yarn

```bash
yarn add @genui/core @genui/react
```

### pnpm

```bash
pnpm add @genui/core @genui/react
```

---

## 11. Verifying the Publish

Create a clean test app:

```bash
npm create vite@latest genui-test -- --template react-ts
cd genui-test
npm install @genui/core @genui/react
npm run dev
```

If imports work, publish is successful.

---

## 12. Common Publishing Pitfalls

❌ Forgetting `files: ["dist"]`
❌ Publishing TypeScript source instead of built output
❌ Missing `peerDependencies` for React
❌ Breaking `exports` map
❌ Not using `--access public` for scoped packages

---

## 13. CI Recommendation (Later)

Automate publishing via GitHub Actions:

* tag → build → publish
* prevent manual mistakes

---

## 14. Final Rule

> **If it installs cleanly via npm, it will work everywhere.**

GenUI should always ship as **plain, boring, standards-compliant packages**.
