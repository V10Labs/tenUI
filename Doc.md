# Generative UI Framework — Architecture & Scalability Guide

**Document purpose:** Define a long‑term, scalable architecture for evolving the Generative UI library into a full framework.

---

## 1. Vision

Generative UI is not a component library. It is a **UI resolution framework**.

Its job is to:

* Translate **intentful responses** (AI tools, APIs, workflows)
* Into **deterministic UI instructions**
* Renderable across **multiple frontends** (React today, others later)

Long‑term, GenUI becomes:

> “The runtime that turns agent decisions into interfaces.”

---

## 2. Core Philosophy (Non‑Negotiables)

These principles must hold forever, even as features grow.

### 2.1 Determinism over magic

* Same input → same UI nodes
* No hidden state
* No implicit side effects

### 2.2 Separation of concerns

| Layer   | Responsibility                         |
| ------- | -------------------------------------- |
| Core    | Interpretation, resolution, validation |
| Adapter | Rendering + framework glue             |
| App     | State, effects, persistence            |

### 2.3 Declarative intent, not imperative UI

GenUI resolves **what should appear**, not **how it mutates state**.

---

## 3. Layered Architecture

```
┌────────────────────────────┐
│        Host Application     │
│  (state, effects, routing) │
└─────────────▲──────────────┘
              │ RenderNodes
┌─────────────┴──────────────┐
│     Framework Adapters      │
│   React / Solid / Vue       │
└─────────────▲──────────────┘
              │ normalized UI
┌─────────────┴──────────────┐
│        GenUI Core           │
│  resolver · registry · DSL  │
└─────────────▲──────────────┘
              │ intent calls
┌─────────────┴──────────────┐
│   Input Normalization       │
│  AI / API / workflow data  │
└────────────────────────────┘
```

---

## 4. Core Modules (Stable Contracts)

### 4.1 Input Normalization Layer

**Purpose:** Convert arbitrary response shapes into a common intent model.

```ts
type ToolCall = {
  tool: string;
  args: unknown;
  meta?: Record<string, any>;
};
```

Rules:

* Must be synchronous
* Must be pure
* No framework imports

This layer absorbs backend churn so the rest of the system stays stable.

---

### 4.2 Resolver Engine (Heart of the Framework)

The resolver:

* matches tool calls against bindings
* applies conditions and priority rules
* emits **RenderNodes**

```ts
type RenderNode = {
  id: string;
  tool: string;
  variant?: string;
  Component: unknown;
  props: unknown;
  meta?: Record<string, any>;
};
```

Resolver guarantees:

* No missing components
* Deterministic ordering
* Safe fallbacks

---

### 4.3 Registry & DSL

The registry is a **domain‑specific language**, not config.

```ts
ui
  .onTool("create_task")
  .when((args) => args.priority === "high")
  .variant("urgent")
  .component(UrgentTaskCard)
  .map(mapUrgent)
  .end();
```

Design goals:

* Chainable
* Composable
* Tree‑shakable

---

## 5. Extensibility Model

### 5.1 First‑Class Extension Points

| Extension    | Purpose             |
| ------------ | ------------------- |
| extract()    | Input adapters      |
| onTool()     | Intent routing      |
| when()       | Conditional UI      |
| many()       | Collections         |
| variant()    | Visual branching    |
| middleware() | Cross‑cutting logic |

---

### 5.2 Middleware Architecture

Middleware allows cross‑cutting behavior without core changes.

```ts
ui.use((ctx, next) => {
  log(ctx.tool);
  return next();
});
```

Use cases:

* analytics
* debugging
* permission gating
* feature flags

---

## 6. Adapter Architecture (Framework Scaling)

Adapters are thin translators.

```ts
@genui/react
@genui/solid
@genui/vue
@genui/react-native
```

Rules:

* No business logic
* No resolver logic
* Only rendering + lifecycle glue

---

## 7. Versioning & Compatibility

### 7.1 Intent Stability Contract

Breaking changes are **only allowed** in:

* extract() implementations

Everything downstream must remain backward compatible.

---

### 7.2 Registry Versioning

```ts
ui.version("1.0").onTool("create_task")...
```

Allows apps to migrate incrementally.

---

## 8. Performance & Scale

### 8.1 Resolution Guarantees

* O(n) resolution per response
* No deep recursion
* No dynamic imports at runtime

---

### 8.2 Memory Safety

* No retained closures after resolve()
* Stateless core
* Immutable output

---

## 9. Testing Strategy (Framework‑Level)

### 9.1 Core Tests

* Tool matching
* Fallback handling
* Conditional resolution
* Determinism tests

### 9.2 Adapter Tests

* Snapshot rendering
* Prop passthrough
* Error boundaries

### 9.3 Contract Tests

* Input → RenderNode snapshots
* Cross‑version compatibility

---

## 10. Anti‑Patterns (Do Not Allow)

❌ Putting app state in core
❌ Framework imports in resolver
❌ Implicit side effects
❌ Hidden async behavior
❌ Tool‑specific hacks

---

## 11. Roadmap (Framework Evolution)

### Phase 1 — Library (Now)

* Core resolver
* React adapter
* Tool registry DSL

### Phase 2 — Framework

* Middleware system
* Variant resolution
* Devtools

### Phase 3 — Platform

* Visual inspector
* Remote registries
* Agent‑UI protocol

---

## 12. Final Principle

> **GenUI does not build interfaces.**
> **It resolves intent into interfaces.**

If this principle holds, the framework will scale.
