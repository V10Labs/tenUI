/**
 * TenUI Core - Type Definitions
 * Framework-agnostic types for Generative UI
 */
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
/** Internal tool binding configuration */
export type ToolBinding = {
    tool: string;
    Component: any;
    map?: MapFn;
    key?: KeyFn;
};
/** Resolved instance API */
export type GenerativeUIInstance<TCtx> = {
    resolve: (ctx: TCtx) => RenderNode[];
};
/** Builder API interface for type safety */
export interface GenerativeUIBuilder<TCtx> {
    extract(fn: ExtractFn<TCtx>): GenerativeUIBuilder<TCtx>;
    onTool(tool: string): ToolBuilder<TCtx>;
    fallback(Component: any): GenerativeUIBuilder<TCtx>;
    done(): GenerativeUIInstance<TCtx>;
}
/** Tool builder interface for chaining */
export interface ToolBuilder<TCtx> {
    component(Component: any): ToolBuilder<TCtx>;
    map(fn: MapFn): ToolBuilder<TCtx>;
    key(fn: KeyFn): ToolBuilder<TCtx>;
    end(): GenerativeUIBuilder<TCtx>;
}
//# sourceMappingURL=types.d.ts.map