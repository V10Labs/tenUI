/**
 * TenUI Core - Builder Implementation
 * Chainable API for defining tool-to-component mappings
 */

import type {
  ExtractFn,
  MapFn,
  KeyFn,
  ToolBinding,
  RenderNode,
  GenerativeUIInstance,
  GenerativeUIBuilder,
  ToolBuilder as IToolBuilder,
} from './types';

/**
 * Internal ToolBuilder class for chaining tool configuration.
 */
class ToolBuilder<TCtx> implements IToolBuilder<TCtx> {
  private binding: Partial<ToolBinding>;
  private commit: (b: ToolBinding) => void;
  private getRoot: () => GenerativeUIBuilder<TCtx>;

  constructor(
    tool: string,
    commit: (b: ToolBinding) => void,
    getRoot: () => GenerativeUIBuilder<TCtx>
  ) {
    this.binding = { tool };
    this.commit = commit;
    this.getRoot = getRoot;
  }

  /**
   * Set the component to render for this tool.
   */
  component(Component: any): ToolBuilder<TCtx> {
    this.binding.Component = Component;
    return this;
  }

  /**
   * Set a function to map tool arguments to component props.
   */
  map(fn: MapFn): ToolBuilder<TCtx> {
    this.binding.map = fn;
    return this;
  }

  /**
   * Set a function to generate a stable key for this render node.
   */
  key(fn: KeyFn): ToolBuilder<TCtx> {
    this.binding.key = fn;
    return this;
  }

  /**
   * Complete the tool binding and return to the root builder.
   */
  end(): GenerativeUIBuilder<TCtx> {
    const b = this.binding as ToolBinding;
    if (!b.Component) {
      throw new Error(`Missing component for tool "${b.tool}". Call .component() before .end()`);
    }
    this.commit(b);
    return this.getRoot();
  }
}

/**
 * Create a new Generative UI builder instance.
 * 
 * @example
 * ```ts
 * const ui = createGenerativeUI()
 *   .extract(({ apiResponse }) => extractTools(apiResponse))
 *   .onTool('create_task')
 *     .component(TaskCard)
 *     .map((args) => ({ description: args.description }))
 *   .end()
 *   .done();
 * 
 * const nodes = ui.resolve({ apiResponse });
 * ```
 */
export function createGenerativeUI<TCtx extends object = any>(): GenerativeUIBuilder<TCtx> {
  let extractFn: ExtractFn<TCtx> | null = null;
  const bindings = new Map<string, ToolBinding>();
  let fallbackComponent: any = null;

  const api: GenerativeUIBuilder<TCtx> = {
    /**
     * Define how to extract tool calls from the context.
     */
    extract(fn: ExtractFn<TCtx>): GenerativeUIBuilder<TCtx> {
      extractFn = fn;
      return api;
    },

    /**
     * Start defining a binding for a specific tool.
     */
    onTool(tool: string): ToolBuilder<TCtx> {
      return new ToolBuilder(tool, (b) => bindings.set(tool, b), () => api);
    },

    /**
     * Set a fallback component for unregistered tools.
     */
    fallback(Component: any): GenerativeUIBuilder<TCtx> {
      fallbackComponent = Component;
      return api;
    },

    /**
     * Finalize the builder and return the resolvable instance.
     */
    done(): GenerativeUIInstance<TCtx> {
      if (!extractFn) {
        throw new Error('Missing extract() call. Define how to extract tool calls from context.');
      }

      return {
        resolve(ctx: TCtx): RenderNode[] {
          const calls = extractFn!(ctx) ?? [];

          return calls.map((call, i): RenderNode => {
            const binding = bindings.get(call.tool);

            // Handle unknown tools
            if (!binding) {
              if (!fallbackComponent) {
                throw new Error(
                  `Unregistered tool "${call.tool}". ` +
                  `Register it with .onTool("${call.tool}") or add a .fallback() component.`
                );
              }
              return {
                tool: call.tool,
                key: `unknown:${i}`,
                Component: fallbackComponent,
                props: { tool: call.tool, args: call.args },
                rawArgs: call.args,
              };
            }

            // Map props and key
            const props = binding.map ? binding.map(call.args, ctx) : call.args;
            const key = binding.key
              ? binding.key(call.args, ctx)
              : `${call.tool}:${i}`;

            return {
              tool: call.tool,
              key,
              Component: binding.Component,
              props,
              rawArgs: call.args,
            };
          });
        },
      };
    },
  };

  return api;
}
