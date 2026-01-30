# Generative UI Library (Pattern A)

**Status:** v0 — initial build
**Audience:** Library author / early adopters
**Target:** React (core is framework-agnostic)

---

## 1. Purpose

This library provides a reusable way to map **AI tool responses (or any structured API response)** to **UI components** using a **chainable builder API**.

Instead of repeatedly writing logic like:

> “If the AI returns `create_task`, render a TaskCard and update state”

You define it once:

```ts
ui
  .onTool("create_task")
  .component(TaskCard)
  .map((args) => ({ description: args.description }))
```

The library:

* parses API responses
* resolves tool → component mappings
* outputs render instructions
* stays decoupled from app state, Remix, Next, etc.

---

## 2. Design Principles

* Core logic is **framework-agnostic**
* React is an **adapter**, not the engine
* AI responses are **normalized before rendering**
* Library **never mutates app state**
* Host app controls side effects

---

## 3. High-Level Architecture

```
API / AI Response
        ↓
   extract()        ← normalize response shape
        ↓
 Tool Calls         ← [{ tool, args }]
        ↓
 Registry           ← onTool("x").component().map()
        ↓
 Render Nodes       ← [{ Component, props, key }]
        ↓
 React Renderer     ← maps nodes → JSX
```

---

## 4. Repo Structure (Recommended)

```
genui/
├─ packages/
│  ├─ core/              # pure TypeScript (no React)
│  │  └─ src/
│  │     ├─ index.ts
│  │     └─ types.ts
│  │
│  └─ react/             # React adapter
│     └─ src/
│        └─ renderer.tsx
│
└─ playground/
   └─ react-app/         # local testing app
```

Use **pnpm workspaces** so the playground consumes the local package.

---

## 5. Core API (Pattern A)

### Builder API

```ts
createGenerativeUI()
  .extract(fn)
  .onTool(toolName)
    .component(Component)
    .map(fn)
    .key(fn?)
  .end()
  .fallback(Component)
  .done()
```

### Output

```ts
ui.resolve(context) → RenderNode[]
```

---

## 6. Core Types

```ts
export type ToolCall = {
  tool: string;
  args: any;
};

export type RenderNode = {
  tool: string;
  key: string;
  Component: any;
  props: any;
  rawArgs: any;
};
```

---

## 7. Core Implementation

```ts
type ExtractFn<TCtx> = (ctx: TCtx) => ToolCall[];
type MapFn = (args: any, ctx: any) => any;
type KeyFn = (args: any, ctx: any) => string;

type ToolBinding = {
  tool: string;
  Component: any;
  map?: MapFn;
  key?: KeyFn;
};

class ToolBuilder {
  private binding: Partial<ToolBinding>;
  private commit: (b: ToolBinding) => void;
  private getRoot: () => any;

  constructor(tool: string, commit: (b: ToolBinding) => void, getRoot: () => any) {
    this.binding = { tool };
    this.commit = commit;
    this.getRoot = getRoot;
  }

  component(Component: any) {
    this.binding.Component = Component;
    return this;
  }

  map(fn: MapFn) {
    this.binding.map = fn;
    return this;
  }

  key(fn: KeyFn) {
    this.binding.key = fn;
    return this;
  }

  end() {
    const b = this.binding as ToolBinding;
    if (!b.Component) throw new Error(`Missing component for tool "${b.tool}"`);
    this.commit(b);
    return this.getRoot();
  }
}

export function createGenerativeUI<TCtx extends object = any>() {
  let extractFn: ExtractFn<TCtx> | null = null;
  const bindings = new Map<string, ToolBinding>();
  let fallbackComponent: any = null;

  const api: any = {
    extract(fn: ExtractFn<TCtx>) {
      extractFn = fn;
      return api;
    },

    onTool(tool: string) {
      return new ToolBuilder(tool, (b) => bindings.set(tool, b), () => api);
    },

    fallback(Component: any) {
      fallbackComponent = Component;
      return api;
    },

    done() {
      if (!extractFn) throw new Error("Missing extract()");

      return {
        resolve(ctx: TCtx) {
          const calls = extractFn!(ctx) ?? [];

          return calls.map((call, i) => {
            const binding = bindings.get(call.tool);

            if (!binding) {
              if (!fallbackComponent) throw new Error(`Unregistered tool "${call.tool}"`);
              return {
                tool: call.tool,
                key: `unknown:${i}`,
                Component: fallbackComponent,
                props: { tool: call.tool, args: call.args },
                rawArgs: call.args,
              };
            }

            const props = binding.map ? binding.map(call.args, ctx) : call.args;
            const key = binding.key ? binding.key(call.args, ctx) : `${call.tool}:${i}`;

            return { tool: call.tool, key, Component: binding.Component, props, rawArgs: call.args };
          });
        },
      };
    },
  };

  return api;
}
```

---

## 8. React Adapter

```tsx
export function GenerativeRenderer({ nodes }: { nodes: any[] }) {
  return (
    <>
      {nodes.map((n) => (
        <n.Component key={n.key} {...n.props} />
      ))}
    </>
  );
}
```

---

## 9. Local Testing (Single React App)

### Workspace Setup

```json
{
  "private": true,
  "workspaces": ["packages/*", "playground/*"]
}
```

### Example Usage

```tsx
const ui = createGenerativeUI()
  .extract(({ apiResponse }) => {
    const fn = apiResponse?.data?.function ?? {};
    return Object.entries(fn).map(([tool, payload]: any) => ({ tool, args: payload.arguments }));
  })
  .onTool("create_task")
    .component(TaskCard)
    .map((args) => ({ description: args.description }))
  .end()
  .fallback(UnknownTool)
  .done();

const nodes = ui.resolve({ apiResponse });
```

If the UI renders, the system works.

---

## 10. Validation Checklist

* [ ] Tool extracted correctly
* [ ] Component registry resolves
* [ ] Props mapping works
* [ ] Fallback renders for unknown tools
* [ ] No app state mutated

---

## 11. Next Extensions

1. `.many()` — tool returns array
2. `.when()` — conditional rendering
3. Schema validation (Zod)
4. Namespacing (`billing.create_invoice`)
5. Debug / explain mode

---

## 12. Non-Goals

* No state management
* No API calls
* No framework assumptions
* No AI vendor coupling

This library is a **resolver**, not a framework.
