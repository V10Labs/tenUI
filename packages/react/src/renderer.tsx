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
export function GenerativeRenderer({
  nodes,
  className,
  as: Container = 'div'
}: GenerativeRendererProps) {
  if (!nodes || nodes.length === 0) {
    return null;
  }

  return (
    <Container className={className}>
      {nodes.map((node) => {
        const { key, Component, props } = node;

        if (!Component) {
          console.warn(`GenerativeRenderer: Missing component for tool "${node.tool}"`);
          return null;
        }

        return React.createElement(Component, { ...props, key });
      })}
    </Container>
  );
}