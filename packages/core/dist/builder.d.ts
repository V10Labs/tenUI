/**
 * TenUI Core - Builder Implementation
 * Chainable API for defining tool-to-component mappings
 */
import type { GenerativeUIBuilder } from './types';
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
export declare function createGenerativeUI<TCtx extends object = any>(): GenerativeUIBuilder<TCtx>;
//# sourceMappingURL=builder.d.ts.map