import { jsx as _jsx } from "react/jsx-runtime";
/**
 * TenUI React - Generative Renderer Component
 * Maps RenderNodes to React components
 */
import React from 'react';
/**
 * Renders an array of RenderNodes as React components.
 *
 * @example
 * ```tsx
 * const nodes = ui.resolve({ apiResponse });
 *
 * return (
 *   <GenerativeRenderer
 *     nodes={nodes}
 *     className="generative-ui-container"
 *   />
 * );
 * ```
 */
export function GenerativeRenderer({ nodes, className, as: Container = 'div' }) {
    if (!nodes || nodes.length === 0) {
        return null;
    }
    return (_jsx(Container, { className: className, children: nodes.map((node) => {
            const { key, Component, props } = node;
            if (!Component) {
                console.warn(`GenerativeRenderer: Missing component for tool "${node.tool}"`);
                return null;
            }
            return React.createElement(Component, { ...props, key });
        }) }));
}
//# sourceMappingURL=renderer.js.map