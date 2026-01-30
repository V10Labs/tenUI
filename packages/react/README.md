# @tenui/react

React adapter for TenUI — renders `RenderNode[]` from `@tenui/core` into JSX.

## Installation

```bash
yarn add @tenui/react @tenui/core
```

## Quick Start

```tsx
import { GenerativeRenderer } from '@tenui/react';
import { createGenerativeUI } from '@tenui/core';

const ui = createGenerativeUI()
  .extract(({ apiResponse }) => apiResponse?.tool_calls || [])
  .onTool('get_empty_fields')
    .component(({ file_id }) => <div>{file_id}</div>)
  .end()
  .done();

const nodes = ui.resolve({ apiResponse });

export function App() {
  return <GenerativeRenderer nodes={nodes} />;
}
```

## API

### `GenerativeRenderer`

```tsx
<GenerativeRenderer nodes={nodes} />
```

- `nodes`: array of render nodes produced by `@tenui/core`.

## Types

This package re-exports core types for convenience:

- `ToolCall`
- `RenderNode`
- `ExtractFn`
- `MapFn`
- `KeyFn`
- `GenerativeUIInstance`

## License

MIT
