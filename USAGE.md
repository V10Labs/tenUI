# TenUI Usage Guide

Quick start guide for using TenUI in your React application.

---

## Table of Contents

1. [Installation](#installation)
2. [Basic Setup](#basic-setup)
3. [Creating Your First Tool](#creating-your-first-tool)
4. [Registering Tools](#registering-tools)
5. [Rendering Components](#rendering-components)
6. [Advanced Usage](#advanced-usage)
7. [TypeScript](#typescript)
8. [Troubleshooting](#troubleshooting)

---

## Installation

### Local Development (file: protocol)

Add to your `package.json`:

```json
{
  "dependencies": {
    "@tenui/core": "file:/path/to/TenUI/packages/core",
    "@tenui/react": "file:/path/to/TenUI/packages/react"
  },
  "resolutions": {
    "@tenui/core": "file:/path/to/TenUI/packages/core"
  }
}
```

Then install:

```bash
yarn install
```

### From npm (when published)

```bash
yarn add @tenui/core @tenui/react
```

---

## Basic Setup

### 1. Create a UI Configuration

Create a file (e.g., `ui-config.ts`) to define your tool-to-component mappings:

```typescript
import { createGenerativeUI } from '@tenui/core';

// Define your components
const TaskCard = ({ title, description }: { title: string; description: string }) => (
  <div className="task-card">
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

// Create the UI instance
export const ui = createGenerativeUI()
  .extract(({ apiResponse }) => {
    // Extract tool calls from your AI/API response
    return apiResponse?.tools?.map((tool: any) => ({
      tool: tool.name,
      args: tool.arguments,
    })) || [];
  })
  .onTool('create_task')
    .component(TaskCard)
    .map((args) => ({
      title: args.title,
      description: args.description,
    }))
  .end()
  .done();
```

## TenUIV1 — Empty Fields Resolver Example

This mirrors the playground’s exact `get_empty_fields` tool call and shows how TenUI maps it to the resolver.

### Example tool call payload (from the AI response)

```json
{
  "tool_calls": [
    {
      "name": "get_empty_fields",
      "arguments": {},
      "result": {
        "file_id": "b8719188-a592-4be9-9d9c-0dc20b8b0e35",
        "filename": "dummy_340b_claims_mapping_test_v2.xlsx",
        "total_rows": 15,
        "rows_analyzed": 15,
        "empty_fields_by_row": {
          "0": ["Entity Child", "Pharmacy Name", "Date Of Service", "Rx Written Date", "Pharmacy ID"],
          "2": ["Entity Child", "Pharmacy Name"],
          "4": ["Date Of Service"]
        }
      }
    }
  ]
}
```

### Map the tool to the resolver

```tsx
// ui-config.tsx
import { createGenerativeUI } from '@tenui/core';
import { TaskCard } from './components/TaskCard';

export const ui = createGenerativeUI<{ apiResponse: any }>()
  .extract(({ apiResponse }) => {
    const toolCalls = apiResponse?.tool_calls || [];
    return toolCalls.map((toolCall: any) => ({
      tool: toolCall.name,
      args: toolCall.result || toolCall.arguments || {}
    }));
  })
  .onTool('get_empty_fields')
    .component(TaskCard)
    .map((args) => ({
      file_id: args.file_id,
      filename: args.filename,
      total_rows: args.total_rows,
      rows_analyzed: args.rows_analyzed,
      empty_fields_by_row: args.empty_fields_by_row
    }))
    .key((args) => `empty-fields-${args.file_id}`)
  .end()
  .fallback(({ tool, args }) => (
    <div style={{ border: '1px dashed #94a3b8', padding: '12px' }}>
      <strong>Unknown Tool:</strong> {tool}
      <pre>{JSON.stringify(args, null, 2)}</pre>
    </div>
  ))
  .done();
```

### Resolve and render

```tsx
import { GenerativeRenderer } from '@tenui/react';
import { ui } from './ui-config';

const nodes = ui.resolve({ apiResponse });
return <GenerativeRenderer nodes={nodes} />;
```

### 2. Use in Your React Component

```tsx
import { GenerativeRenderer } from '@tenui/react';
import { ui } from './ui-config';

function App() {
  // Your AI/API response
  const apiResponse = {
    tools: [
      {
        name: 'create_task',
        arguments: {
          title: 'Review PR',
          description: 'Check the new feature implementation',
        },
      },
    ],
  };

  // Convert to render nodes
  const nodes = ui.resolve({ apiResponse });

  return (
    <div>
      <h1>My App</h1>
      <GenerativeRenderer nodes={nodes} />
    </div>
  );
}
```

---

## Creating Your First Tool

### Step 1: Create the Component

```tsx
// components/WeatherCard.tsx
interface WeatherCardProps {
  city: string;
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy';
}

export function WeatherCard({ city, temperature, condition }: WeatherCardProps) {
  const icons = {
    sunny: '☀️',
    cloudy: '☁️',
    rainy: '🌧️',
  };

  return (
    <div className="weather-card">
      <div className="icon">{icons[condition]}</div>
      <h3>{city}</h3>
      <p className="temp">{temperature}°C</p>
    </div>
  );
}
```

### Step 2: Register in UI Config

```typescript
import { createGenerativeUI } from '@tenui/core';
import { WeatherCard } from './components/WeatherCard';

export const ui = createGenerativeUI()
  .extract(({ apiResponse }) => {
    return apiResponse?.tools?.map((t: any) => ({
      tool: t.name,
      args: t.arguments,
    })) || [];
  })
  .onTool('show_weather')
    .component(WeatherCard)
    .map((args) => ({
      city: args.city,
      temperature: args.temperature_c,
      condition: args.condition,
    }))
    .key((args) => `weather-${args.city}`)  // Optional: stable key
  .end()
  .done();
```

### Step 3: Use It

```tsx
function App() {
  const apiResponse = {
    tools: [
      {
        name: 'show_weather',
        arguments: {
          city: 'San Francisco',
          temperature_c: 22,
          condition: 'sunny',
        },
      },
    ],
  };

  const nodes = ui.resolve({ apiResponse });

  return <GenerativeRenderer nodes={nodes} />;
}
```

---

## Registering Tools

### Chain Multiple Tools

```typescript
export const ui = createGenerativeUI()
  .extract(({ apiResponse }) => /* ... */)
  
  // Tool 1: Tasks
  .onTool('create_task')
    .component(TaskCard)
    .map((args) => ({ title: args.title, priority: args.priority }))
  .end()
  
  // Tool 2: Messages
  .onTool('show_message')
    .component(MessageBanner)
    .map((args) => ({ text: args.text, type: args.type }))
  .end()
  
  // Tool 3: Charts
  .onTool('show_chart')
    .component(ChartComponent)
    .map((args) => ({ data: args.data, type: args.chart_type }))
  .end()
  
  .done();
```

### Inline Components

```typescript
.onTool('show_alert')
  .component(({ message, level }: { message: string; level: string }) => (
    <div className={`alert alert-${level}`}>
      {message}
    </div>
  ))
  .map((args) => ({ message: args.text, level: args.severity }))
.end()
```

### Fallback for Unknown Tools

```typescript
const UnknownTool = ({ tool, args }: { tool: string; args: any }) => (
  <div className="unknown-tool">
    <p>Unknown tool: {tool}</p>
    <pre>{JSON.stringify(args, null, 2)}</pre>
  </div>
);

export const ui = createGenerativeUI()
  .extract(/* ... */)
  .onTool('known_tool').component(KnownComponent).end()
  .fallback(UnknownTool)  // Renders for unregistered tools
  .done();
```

---

## Rendering Components

### Basic Render

```tsx
import { GenerativeRenderer } from '@tenui/react';

function App() {
  const nodes = ui.resolve({ apiResponse });
  return <GenerativeRenderer nodes={nodes} />;
}
```

### With Container Props

```tsx
<GenerativeRenderer 
  nodes={nodes}
  className="my-container"
  as="section"  // Renders as <section> instead of <div>
/>
```

### Conditional Rendering

```tsx
function App() {
  const [apiResponse, setApiResponse] = useState(null);
  const nodes = ui.resolve({ apiResponse });

  if (!apiResponse) return <p>Waiting for AI...</p>;
  if (nodes.length === 0) return <p>No UI generated</p>;

  return <GenerativeRenderer nodes={nodes} />;
}
```

### Multiple Renderers (Split by Tool)

```tsx
function App() {
  const nodes = ui.resolve({ apiResponse });
  
  const tasks = nodes.filter(n => n.tool === 'create_task');
  const messages = nodes.filter(n => n.tool === 'show_message');

  return (
    <div className="layout">
      <aside>
        <h2>Tasks</h2>
        <GenerativeRenderer nodes={tasks} />
      </aside>
      <main>
        <h2>Messages</h2>
        <GenerativeRenderer nodes={messages} />
      </main>
    </div>
  );
}
```

---

## Advanced Usage

### Accessing Context in Extract

```typescript
interface MyContext {
  apiResponse: any;
  userId: string;
  sessionId: string;
}

export const ui = createGenerativeUI<MyContext>()
  .extract((ctx) => {
    // ctx is typed as MyContext
    console.log(ctx.userId, ctx.sessionId);
    return ctx.apiResponse?.tools || [];
  })
  .onTool('user_action')
    .component(UserActionCard)
    .map((args, ctx) => ({ 
      ...args,
      userId: ctx.userId,  // Pass context data to component
    }))
  .end()
  .done();

// Usage
const nodes = ui.resolve({ 
  apiResponse, 
  userId: 'user-123',
  sessionId: 'sess-456'
});
```

### Dynamic Keys

```typescript
.onTool('create_task')
  .component(TaskCard)
  .key((args) => args.task_id || `task-${Date.now()}`)
.end()
```

### Prop Transformation

```typescript
.onTool('create_task')
  .component(TaskCard)
  .map((args, ctx) => ({
    // Transform API args to component props
    title: args.title,
    description: args.description,
    priority: args.priority.toLowerCase(),
    isUrgent: args.priority === 'HIGH',
    createdAt: new Date(args.timestamp),
    userId: ctx.userId,  // Mix in context
  }))
.end()
```

---

## TypeScript

### Full Type Safety

```typescript
import { createGenerativeUI, ToolCall, RenderNode } from '@tenui/core';

// Define your context type
interface AppContext {
  apiResponse: {
    tools: Array<{
      name: string;
      arguments: Record<string, any>;
    }>;
  };
  userId: string;
}

// Define tool argument types
interface CreateTaskArgs {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

// Component with typed props
interface TaskCardProps {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

const TaskCard = ({ title, description, priority }: TaskCardProps) => (
  <div className={`task task-${priority}`}>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

// Typed UI instance
export const ui = createGenerativeUI<AppContext>()
  .extract((ctx) => {
    return ctx.apiResponse.tools.map(t => ({
      tool: t.name,
      args: t.arguments,
    }));
  })
  .onTool('create_task')
    .component(TaskCard)
    .map((args: CreateTaskArgs) => ({
      title: args.title,
      description: args.description,
      priority: args.priority,
    }))
  .end()
  .done();
```

---

## Troubleshooting

### "Cannot find module '@tenui/core'"

Make sure the file path is correct and you've run `yarn install`:

```json
{
  "dependencies": {
    "@tenui/core": "file:/absolute/path/to/TenUI/packages/core"
  }
}
```

### "@tenui/core@0.1.0 not found"

Add the resolution override:

```json
{
  "resolutions": {
    "@tenui/core": "file:/path/to/TenUI/packages/core"
  }
}
```

### Components not rendering

1. Check that `extract()` returns the correct shape:
   ```typescript
   [{ tool: 'tool_name', args: { ... } }]
   ```

2. Verify tool names match exactly (case-sensitive)

3. Check browser console for errors

### TypeScript errors

Make sure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "moduleResolution": "node"
  }
}
```

---

## Example: Complete Chat App

```tsx
// app/routes/chat.tsx (React Router v7)
import { useState } from 'react';
import { createGenerativeUI } from '@tenui/core';
import { GenerativeRenderer } from '@tenui/react';

const ui = createGenerativeUI()
  .extract(({ message }) => {
    // Parse AI response
    return message.tools?.map((t: any) => ({
      tool: t.function.name,
      args: JSON.parse(t.function.arguments),
    })) || [];
  })
  .onTool('show_task')
    .component(({ title, done }) => (
      <div className={`task ${done ? 'done' : ''}`}>{title}</div>
    ))
  .end()
  .onTool('show_button')
    .component(({ label, action }) => (
      <button onClick={() => console.log(action)}>{label}</button>
    ))
  .end()
  .done();

export default function Chat() {
  const [messages, setMessages] = useState([]);

  return (
    <div className="chat">
      {messages.map((msg, i) => {
        const nodes = ui.resolve({ message: msg });
        return (
          <div key={i} className="message">
            <p>{msg.text}</p>
            <GenerativeRenderer nodes={nodes} />
          </div>
        );
      })}
    </div>
  );
}
```

---

## Next Steps

- Check `ARCHITECTURE.md` for implementation details
- See `playground/react-app/src/App.tsx` for more examples
- Add more tools as your AI capabilities grow
