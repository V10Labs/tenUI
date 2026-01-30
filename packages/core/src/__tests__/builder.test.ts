import { createGenerativeUI } from '../builder';
import type { ToolCall, RenderNode } from '../types';

describe('createGenerativeUI', () => {
  // Simple mock component for testing
  const MockComponent = ({ name }: { name: string }) => `Hello ${name}`;
  const FallbackComponent = ({ tool }: { tool: string }) => `Unknown: ${tool}`;

  describe('basic functionality', () => {
    it('should create a builder instance', () => {
      const builder = createGenerativeUI();
      expect(builder).toBeDefined();
      expect(typeof builder.extract).toBe('function');
      expect(typeof builder.onTool).toBe('function');
      expect(typeof builder.fallback).toBe('function');
      expect(typeof builder.done).toBe('function');
    });

    it('should require extract() before done()', () => {
      const ui = createGenerativeUI();
      expect(() => ui.done()).toThrow('Missing extract()');
    });

    it('should resolve empty array when no tool calls', () => {
      const ui = createGenerativeUI()
        .extract(() => [])
        .done();

      const nodes = ui.resolve({});
      expect(nodes).toEqual([]);
    });
  });

  describe('tool extraction', () => {
    it('should extract tools from context', () => {
      const extractFn = jest.fn((ctx: { tools: ToolCall[] }) => ctx.tools);

      const ui = createGenerativeUI()
        .extract(extractFn)
        .onTool('greet')
          .component(MockComponent)
        .end()
        .done();

      const context = { tools: [{ tool: 'greet', args: { name: 'World' } }] };
      ui.resolve(context);

      expect(extractFn).toHaveBeenCalledWith(context);
    });

    it('should handle multiple tool calls', () => {
      const ui = createGenerativeUI()
        .extract((ctx: { tools: ToolCall[] }) => ctx.tools)
        .onTool('greet')
          .component(MockComponent)
        .end()
        .done();

      const context = {
        tools: [
          { tool: 'greet', args: { name: 'Alice' } },
          { tool: 'greet', args: { name: 'Bob' } },
        ],
      };

      const nodes = ui.resolve(context);
      expect(nodes).toHaveLength(2);
    });
  });

  describe('component resolution', () => {
    it('should map tool to component', () => {
      const ui = createGenerativeUI()
        .extract((ctx: { tools: ToolCall[] }) => ctx.tools)
        .onTool('greet')
          .component(MockComponent)
        .end()
        .done();

      const nodes = ui.resolve({ tools: [{ tool: 'greet', args: {} }] });
      expect(nodes[0].Component).toBe(MockComponent);
    });

    it('should require component before end()', () => {
      const ui = createGenerativeUI()
        .extract(() => [])
        .onTool('greet');

      expect(() => ui.end()).toThrow('Missing component for tool "greet"');
    });
  });

  describe('props mapping', () => {
    it('should pass raw args when no map function', () => {
      const ui = createGenerativeUI()
        .extract((ctx: { tools: ToolCall[] }) => ctx.tools)
        .onTool('greet')
          .component(MockComponent)
        .end()
        .done();

      const args = { name: 'World', extra: true };
      const nodes = ui.resolve({ tools: [{ tool: 'greet', args }] });

      expect(nodes[0].props).toEqual(args);
    });

    it('should map args with custom map function', () => {
      const ui = createGenerativeUI()
        .extract((ctx: { tools: ToolCall[] }) => ctx.tools)
        .onTool('greet')
          .component(MockComponent)
          .map((args) => ({ name: args.name.toUpperCase() }))
        .end()
        .done();

      const nodes = ui.resolve({
        tools: [{ tool: 'greet', args: { name: 'world' } }],
      });

      expect(nodes[0].props).toEqual({ name: 'WORLD' });
    });

    it('should pass context to map function', () => {
      const mapFn = jest.fn((args, ctx) => ({ name: ctx.prefix + args.name }));

      const ui = createGenerativeUI()
        .extract((ctx: { tools: ToolCall[] }) => ctx.tools)
        .onTool('greet')
          .component(MockComponent)
          .map(mapFn)
        .end()
        .done();

      const context = { tools: [{ tool: 'greet', args: { name: 'World' } }], prefix: 'Hello ' };
      ui.resolve(context);

      expect(mapFn).toHaveBeenCalledWith({ name: 'World' }, context);
    });
  });

  describe('key generation', () => {
    it('should generate default key when no key function', () => {
      const ui = createGenerativeUI()
        .extract((ctx: { tools: ToolCall[] }) => ctx.tools)
        .onTool('greet')
          .component(MockComponent)
        .end()
        .done();

      const nodes = ui.resolve({ tools: [{ tool: 'greet', args: {} }] });
      expect(nodes[0].key).toBe('greet:0');
    });

    it('should use custom key function', () => {
      const ui = createGenerativeUI()
        .extract((ctx: { tools: ToolCall[] }) => ctx.tools)
        .onTool('greet')
          .component(MockComponent)
          .key((args) => `greet-${args.id}`)
        .end()
        .done();

      const nodes = ui.resolve({
        tools: [{ tool: 'greet', args: { id: 'abc123' } }],
      });

      expect(nodes[0].key).toBe('greet-abc123');
    });

    it('should pass context to key function', () => {
      const keyFn = jest.fn((args, ctx) => `${ctx.sessionId}-${args.id}`);

      const ui = createGenerativeUI()
        .extract((ctx: { tools: ToolCall[] }) => ctx.tools)
        .onTool('greet')
          .component(MockComponent)
          .key(keyFn)
        .end()
        .done();

      const context = {
        tools: [{ tool: 'greet', args: { id: '123' } }],
        sessionId: 'sess-456',
      };
      ui.resolve(context);

      expect(keyFn).toHaveBeenCalledWith({ id: '123' }, context);
    });
  });

  describe('fallback handling', () => {
    it('should throw for unregistered tools without fallback', () => {
      const ui = createGenerativeUI()
        .extract((ctx: { tools: ToolCall[] }) => ctx.tools)
        .onTool('known')
          .component(MockComponent)
        .end()
        .done();

      expect(() =>
        ui.resolve({ tools: [{ tool: 'unknown', args: {} }] })
      ).toThrow('Unregistered tool "unknown"');
    });

    it('should use fallback component for unknown tools', () => {
      const ui = createGenerativeUI()
        .extract((ctx: { tools: ToolCall[] }) => ctx.tools)
        .onTool('known')
          .component(MockComponent)
        .end()
        .fallback(FallbackComponent)
        .done();

      const nodes = ui.resolve({
        tools: [{ tool: 'unknown', args: { foo: 'bar' } }],
      });

      expect(nodes).toHaveLength(1);
      expect(nodes[0].Component).toBe(FallbackComponent);
      expect(nodes[0].props).toEqual({ tool: 'unknown', args: { foo: 'bar' } });
      expect(nodes[0].key).toBe('unknown:0');
    });

    it('should handle multiple unknown tools with fallback', () => {
      const ui = createGenerativeUI()
        .extract((ctx: { tools: ToolCall[] }) => ctx.tools)
        .onTool('known')
          .component(MockComponent)
        .end()
        .fallback(FallbackComponent)
        .done();

      const nodes = ui.resolve({
        tools: [
          { tool: 'unknown1', args: {} },
          { tool: 'unknown2', args: {} },
        ],
      });

      expect(nodes).toHaveLength(2);
      expect(nodes[0].key).toBe('unknown:0');
      expect(nodes[1].key).toBe('unknown:1');
    });
  });

  describe('render node structure', () => {
    it('should include all required fields in render node', () => {
      const ui = createGenerativeUI()
        .extract((ctx: { tools: ToolCall[] }) => ctx.tools)
        .onTool('greet')
          .component(MockComponent)
          .map((args) => ({ name: args.name }))
        .end()
        .done();

      const originalArgs = { name: 'World', extra: 'data' };
      const nodes = ui.resolve({
        tools: [{ tool: 'greet', args: originalArgs }],
      });

      const node = nodes[0];
      expect(node.tool).toBe('greet');
      expect(node.key).toBeDefined();
      expect(node.Component).toBe(MockComponent);
      expect(node.props).toEqual({ name: 'World' });
      expect(node.rawArgs).toEqual(originalArgs);
    });
  });

  describe('chaining multiple tools', () => {
    it('should support multiple tool registrations', () => {
      const ComponentA = () => 'A';
      const ComponentB = () => 'B';

      const ui = createGenerativeUI()
        .extract((ctx: { tools: ToolCall[] }) => ctx.tools)
        .onTool('tool-a')
          .component(ComponentA)
        .end()
        .onTool('tool-b')
          .component(ComponentB)
        .end()
        .done();

      const nodes = ui.resolve({
        tools: [
          { tool: 'tool-a', args: {} },
          { tool: 'tool-b', args: {} },
        ],
      });

      expect(nodes[0].Component).toBe(ComponentA);
      expect(nodes[1].Component).toBe(ComponentB);
    });
  });

  describe('type safety', () => {
    it('should preserve context type through the chain', () => {
      interface MyContext {
        tools: ToolCall[];
        userId: string;
      }

      const ui = createGenerativeUI<MyContext>()
        .extract((ctx) => ctx.tools) // ctx is typed as MyContext
        .onTool('greet')
          .component(MockComponent)
        .end()
        .done();

      // Should compile without errors
      const nodes = ui.resolve({ tools: [{ tool: 'greet', args: {} }], userId: '123' });
      expect(nodes).toHaveLength(1);
    });
  });
});
