# @tenui/core

Framework-agnostic core for TenUI — a Generative UI library that maps AI tool responses to UI components.

## Installation

```bash
yarn add @tenui/core
```

## Quick Start

```typescript
import { createGenerativeUI } from '@tenui/core';

// Define your UI configuration
const ui = createGenerativeUI()
  .extract(({ apiResponse }) => {
    // Extract tool calls from your API response format
    return apiResponse.tools.map(t => ({ tool: t.name, args: t.arguments }));
  })
  .onTool('create_task')
    .component(TaskCard)
    .map((args) => ({ 
      title: args.title,
      description: args.description 
    }))
    .key((args) => args.taskId)
  .end()
  .fallback(UnknownTool)
  .done();

// Resolve to render nodes
const nodes = ui.resolve({ apiResponse });
// nodes: [{ tool, key, Component, props, rawArgs }]
```

## API Reference

### `createGenerativeUI<TCtx>()`

Creates a new builder instance. Optional generic `TCtx` defines your context type.

### `.extract(fn)`

Defines how to extract `ToolCall[]` from your context object.

```ts
.extract((ctx: MyContext) => [
  { tool: 'name', args: { ... } }
])
```

### `.onTool(toolName)`

Starts a chain to define a component binding for the specified tool.

### `.component(Component)`

Sets the component to render (required).

### `.map(fn)`

Transforms tool arguments into component props.

```ts
.map((args, ctx) => ({ title: args.title }))
```

### `.key(fn)`

Generates a stable key for React reconciliation.

```ts
.key((args) => args.id)
```

### `.end()`

Completes the tool binding and returns to the root builder.

### `.fallback(Component)`

Sets a component to render for unregistered tools.

### `.done()`

Finalizes the builder and returns the resolver instance.

## Types

```typescript
interface ToolCall {
  tool: string;
  args: any;
}

interface RenderNode {
  tool: string;
  key: string;
  Component: any;
  props: any;
  rawArgs: any;
}
```

## Testing

```bash
yarn test
```

## License

MIT
