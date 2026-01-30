# TenUI Architecture Document

**Version:** 0.1.0  
**Date:** 2026-01-29  
**Status:** Draft for Implementation  

---

## 1. Overview

TenUI is a monorepo containing a Generative UI library that maps AI tool responses to React components via a chainable builder API.

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Monorepo (yarn workspaces) | Clean separation between core logic and framework adapters |
| Core is framework-agnostic | Allows future adapters (Vue, Svelte, etc.) |
| Builder pattern API | Fluent, discoverable, type-friendly |
| No state management | Host app retains full control |

---

## 2. Repository Structure

```
tenui/
├── packages/
│   ├── core/                    # Framework-agnostic core
│   │   ├── src/
│   │   │   ├── index.ts         # Public API exports
│   │   │   ├── types.ts         # Shared type definitions
│   │   │   ├── builder.ts       # ToolBuilder class + registry
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── react/                   # React adapter
│   │   ├── src/
│   │   │   ├── index.ts         # Public exports
│   │   │   └── renderer.tsx     # GenerativeRenderer component
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── zod/                     # Schema validation adapter (future)
│       └── ...
│
├── playground/
│   └── react-app/               # Local testing environment
│       ├── src/
│       ├── package.json
│       └── vite.config.ts
│
├── package.json                 # Root workspace config
├── yarn.lock
└── tsconfig.base.json           # Shared TypeScript config
```

---

## 3. Package Specifications

### 3.1 `@tenui/core`

**Responsibility:** Pure TypeScript logic for parsing API responses and resolving tool-to-component mappings.

**Public API:**

```ts
// Entry: packages/core/src/index.ts
export { createGenerativeUI } from './builder';
export type { 
  ToolCall, 
  RenderNode, 
  ExtractFn, 
  MapFn, 
  KeyFn,
  GenerativeUIInstance 
} from './types';
```

**Key Classes/Interfaces:**

| Name | File | Purpose |
|------|------|---------|
| `createGenerativeUI()` | `builder.ts` | Factory function, returns builder API |
| `ToolBuilder` | `builder.ts` | Chainable builder for tool bindings |
| `ToolCall` | `types.ts` | Input: extracted tool call from API |
| `RenderNode` | `types.ts` | Output: render-ready component instructions |

**Internal Flow:**

```
createGenerativeUI()
    ├── .extract(fn) → stores ExtractFn
    ├── .onTool(name) → returns ToolBuilder
    │       ├── .component(C) → stores Component
    │       ├── .map(fn) → stores MapFn
    │       └── .key(fn) → stores KeyFn
    ├── .fallback(C) → stores fallback Component
    └── .done() → returns { resolve(ctx) }
```

**Dependencies:** None (pure TypeScript)

---

### 3.2 `@tenui/react`

**Responsibility:** React-specific rendering layer and hooks.

**Public API:**

```tsx
// Entry: packages/react/src/index.ts
export { GenerativeRenderer } from './renderer';
export { useGenerativeUI } from './hooks';  // future
export type { GenerativeRendererProps } from './renderer';
```

**Components:**

| Component | File | Props | Purpose |
|-----------|------|-------|---------|
| `GenerativeRenderer` | `renderer.tsx` | `{ nodes: RenderNode[] }` | Maps RenderNodes to JSX |

**Dependencies:**
- `react` (peer dependency)
- `react-dom` (peer dependency)
- `@tenui/core` (workspace dependency)

---

### 3.3 `playground/react-app`

**Responsibility:** Local development and manual testing environment.

**Features:**
- Hot reload of core/react packages
- Example AI responses for testing
- Visual component library showcase

**Dependencies:**
- `@tenui/core` (workspace)
- `@tenui/react` (workspace)
- `react`, `react-dom`
- `vite` (dev server)

---

## 4. Inter-Package Dependencies

```
┌─────────────────┐
│   playground    │
│   (react-app)   │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│  core  │ │ react  │
│(no deps)│ │(peer:  │
└────────┘ │ react) │
           └───┬────┘
               │
               ▼
           ┌────────┐
           │  core  │
           └────────┘
```

---

## 5. Build Configuration

### 5.1 Root `package.json`

```json
{
  "name": "@tenui/monorepo",
  "private": true,
  "workspaces": ["packages/*", "playground/*"],
  "scripts": {
    "build": "yarn workspaces run build",
    "test": "yarn workspaces run test",
    "lint": "eslint packages/**/*.{ts,tsx}",
    "clean": "yarn workspaces run clean",
    "dev": "yarn workspace @tenui/playground dev"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "eslint": "^8.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### 5.2 Core Package `package.json`

```json
{
  "name": "@tenui/core",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  }
}
```

### 5.3 React Package `package.json`

```json
{
  "name": "@tenui/react",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "clean": "rm -rf dist"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "dependencies": {
    "@tenui/core": "0.1.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/react": "^18.0.0",
    "jest": "^29.0.0"
  }
}
```

---

## 6. Type Definitions

### 6.1 Core Types (`packages/core/src/types.ts`)

```ts
/**
 * Represents a tool call extracted from an API response.
 */
export type ToolCall = {
  /** The tool identifier (e.g., "create_task") */
  tool: string;
  /** Arguments passed to the tool */
  args: any;
};

/**
 * Output: A render-ready node containing component and props.
 */
export type RenderNode = {
  /** Original tool name */
  tool: string;
  /** Stable key for React reconciliation */
  key: string;
  /** Component constructor/type */
  Component: any;
  /** Mapped props for the component */
  props: any;
  /** Original unmapped arguments */
  rawArgs: any;
};

/** Extracts ToolCalls from context */
export type ExtractFn<TCtx> = (ctx: TCtx) => ToolCall[];

/** Maps tool arguments to component props */
export type MapFn = (args: any, ctx: any) => any;

/** Generates a stable key for the render node */
export type KeyFn = (args: any, ctx: any) => string;

/** Resolved instance API */
export type GenerativeUIInstance<TCtx> = {
  resolve: (ctx: TCtx) => RenderNode[];
};
```

---

## 7. Implementation Tasks

### Task A: Core Package (`@tenui/core`)

**Owner:** Engineer 1  
**Estimated:** 2-3 days

**Deliverables:**
- [ ] `packages/core/src/types.ts` — All type definitions
- [ ] `packages/core/src/builder.ts` — `ToolBuilder` class and `createGenerativeUI()`
- [ ] `packages/core/src/index.ts` — Public exports
- [ ] Unit tests for:
  - Tool extraction
  - Component resolution
  - Props mapping
  - Key generation
  - Fallback behavior

**Acceptance Criteria:**
```ts
// Should work without errors
const ui = createGenerativeUI()
  .extract((ctx) => [{ tool: 'test', args: ctx }])
  .onTool('test')
    .component(({ name }) => name)
    .map((args) => ({ name: args.name }))
  .end()
  .done();

const nodes = ui.resolve({ name: 'Hello' });
// nodes[0].props.name === 'Hello'
```

---

### Task B: React Package (`@tenui/react`)

**Owner:** Engineer 2  
**Estimated:** 1-2 days

**Deliverables:**
- [ ] `packages/react/src/renderer.tsx` — `GenerativeRenderer` component
- [ ] `packages/react/src/index.ts` — Public exports
- [ ] Integration tests with `@testing-library/react`

**Acceptance Criteria:**
```tsx
// Should render without errors
const nodes = [
  { key: '1', Component: ({ text }) => <span>{text}</span>, props: { text: 'Hi' } }
];

render(<GenerativeRenderer nodes={nodes} />);
// expect(screen.getByText('Hi')).toBeInTheDocument();
```

**Dependencies on Task A:**
- `@tenui/core` types for `RenderNode`

---

### Task C: Playground App

**Owner:** Engineer 1 or 2  
**Estimated:** 1 day

**Deliverables:**
- [ ] `playground/react-app/` Vite setup
- [ ] Example tool components (TaskCard, UnknownTool)
- [ ] Mock AI responses
- [ ] Live demo page

**Dependencies:**
- Task A (core)
- Task B (react)

---

## 8. Development Workflow

### Getting Started

```bash
# 1. Install dependencies
yarn install

# 2. Build all packages
yarn build

# 3. Run tests
yarn test

# 4. Start playground for manual testing
yarn dev
```

### Working on a Package

```bash
# Watch mode for core
cd packages/core && yarn build --watch

# Watch mode for react (depends on core)
cd packages/react && yarn build --watch
```

### Testing Changes in Playground

The playground uses workspace symlinks, so changes to core/react are immediately reflected after rebuild.

---

## 9. API Usage Examples

### Basic Setup

```tsx
// ui-config.ts
import { createGenerativeUI } from '@tenui/core';
import { TaskCard, UnknownTool } from './components';

export const ui = createGenerativeUI()
  .extract(({ apiResponse }) => {
    const fn = apiResponse?.data?.function ?? {};
    return Object.entries(fn).map(([tool, payload]: any) => ({
      tool,
      args: payload.arguments,
    }));
  })
  .onTool('create_task')
    .component(TaskCard)
    .map((args) => ({ 
      description: args.description,
      priority: args.priority 
    }))
  .end()
  .fallback(UnknownTool)
  .done();
```

### React Integration

```tsx
// App.tsx
import { GenerativeRenderer } from '@tenui/react';
import { ui } from './ui-config';

function App() {
  const [apiResponse, setApiResponse] = useState(null);
  const nodes = ui.resolve({ apiResponse });

  return (
    <div>
      <AIChat onResponse={setApiResponse} />
      <GenerativeRenderer nodes={nodes} />
    </div>
  );
}
```

---

## 10. Extension Points

Future features should extend these points:

| Feature | Extension Point | Package |
|---------|-----------------|---------|
| `.many()` | `ToolBuilder` method | core |
| `.when()` | Add predicate to `ToolBinding` | core |
| Zod validation | New `schema()` method on ToolBuilder | zod |
| Namespacing | Tool name parsing in registry | core |
| Debug mode | Add `debug` option to `done()` | core |
| Vue adapter | New `packages/vue/` | vue |

---

## 11. Non-Goals (Out of Scope)

The following are explicitly **not** part of this library:

- State management (use Redux, Zustand, etc.)
- API calling logic (host app handles AI calls)
- Framework-specific routing
- AI vendor SDK coupling
- Component styling system

---

## 12. Appendix: File Templates

### TypeScript Config (Base)

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### Jest Config

```js
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
};
```

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-29 | 0.1.0 | Initial architecture draft |
