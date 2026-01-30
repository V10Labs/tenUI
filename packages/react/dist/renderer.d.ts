/**
 * TenUI React - Generative Renderer Component
 * Maps RenderNodes to React components
 */
import React from 'react';
import type { RenderNode } from '@tenui/core';
/**
 * Props for the GenerativeRenderer component.
 */
export interface GenerativeRendererProps {
    /** Array of render nodes to render */
    nodes: RenderNode[];
    /** Optional className for the container */
    className?: string;
    /** Optional wrapper element, defaults to div */
    as?: React.ElementType;
}
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
export declare function GenerativeRenderer({ nodes, className, as: Container }: GenerativeRendererProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=renderer.d.ts.map