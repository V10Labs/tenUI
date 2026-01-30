import React, { useState } from 'react';
import { GenerativeRenderer } from '@tenui/react';
import { ui } from './ui-config';

// Your test response data
const testResponse = {
  "answer": "response ...",
  "sources": [
    {
      "content": "[some data]",
      "metadata": {
        "filename": "dummy_340b_claims_mapping_test_v2.xlsx",
        "source": "file"
      }
    }
  ],
  "model_used": "gpt-5.2",
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
          "0": [
            "Entity Child",
            "Pharmacy Name",
            "Date Of Service",
            "Rx Written Date",
            "Pharmacy ID"
          ],
          "2": [
            "Entity Child",
            "Pharmacy Name"
          ],
          "4": [
            "Date Of Service"
          ]
        }
      }
    }
  ]
};

function App() {
  const [apiResponse, setApiResponse] = useState(testResponse);

  // Resolve the response into render nodes
  const nodes = ui.resolve({ apiResponse });

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1>🚀 TenUI Playground</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>
        Testing generative UI with tool calls from AI responses
      </p>

      <div style={{ marginBottom: '24px' }}>
        <h2>API Response</h2>
        <details style={{ marginBottom: '16px' }}>
          <summary style={{
            cursor: 'pointer',
            padding: '8px',
            backgroundColor: '#f3f4f6',
            borderRadius: '4px'
          }}>
            Show raw response data
          </summary>
          <pre style={{
            fontSize: '12px',
            backgroundColor: '#1f2937',
            color: '#f9fafb',
            padding: '12px',
            borderRadius: '4px',
            overflow: 'auto',
            marginTop: '8px'
          }}>
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </details>
      </div>

      <div>
        <h2>Rendered Components</h2>
        <GenerativeRenderer
          nodes={nodes}
          className="generative-ui-container"
        />
      </div>

      <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
        <h3>✅ How it works:</h3>
        <ol style={{ margin: 0 }}>
          <li>TenUI extracts tool calls from your API response</li>
          <li>Maps the <code>get_empty_fields</code> tool to the <code>TaskCard</code> component</li>
          <li>Transforms tool arguments into component props</li>
          <li>Renders the result with React</li>
        </ol>
      </div>
    </div>
  );
}

export default App;