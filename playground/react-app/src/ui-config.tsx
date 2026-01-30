/**
 * TenUI Configuration for the playground
 */

import { createGenerativeUI } from '@tenui/core';
import { TaskCard } from './components/TaskCard';

export const ui = createGenerativeUI<{ apiResponse: any }>()
  .extract(({ apiResponse }) => {
    // Extract tool calls from the API response
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
    <div style={{
      border: '1px dashed #94a3b8',
      borderRadius: '4px',
      padding: '12px',
      margin: '8px 0',
      backgroundColor: '#f1f5f9'
    }}>
      <h4>Unknown Tool: {tool}</h4>
      <pre style={{ fontSize: '12px', overflow: 'auto' }}>
        {JSON.stringify(args, null, 2)}
      </pre>
    </div>
  ))
  .done();