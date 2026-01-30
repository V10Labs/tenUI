/**
 * TenUI React
 * React adapter for TenUI Generative UI
 *
 * @packageDocumentation
 */

// Components
export { GenerativeRenderer } from './renderer.js';

// Types
export type { GenerativeRendererProps } from './renderer.js';

// Re-export core types for convenience
export type {
  ToolCall,
  RenderNode,
  ExtractFn,
  MapFn,
  KeyFn,
  GenerativeUIInstance,
} from '@tenui/core';