/**
 * TaskCard component for displaying get_empty_fields tool results
 */

import React from 'react';

export interface TaskCardProps {
  file_id: string;
  filename: string;
  total_rows: number;
  rows_analyzed: number;
  empty_fields_by_row: Record<string, string[]>;
}

export function TaskCard({
  file_id,
  filename,
  total_rows,
  rows_analyzed,
  empty_fields_by_row
}: TaskCardProps) {
  const emptyRowCount = Object.keys(empty_fields_by_row).length;

  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '16px',
      margin: '8px 0',
      backgroundColor: '#f8fafc'
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#1e293b' }}>
        📊 Empty Fields Analysis
      </h3>

      <div style={{ marginBottom: '16px' }}>
        <p style={{ margin: '4px 0', fontSize: '14px' }}>
          <strong>File:</strong> {filename}
        </p>
        <p style={{ margin: '4px 0', fontSize: '14px' }}>
          <strong>File ID:</strong> <code style={{ backgroundColor: '#e2e8f0', padding: '2px 4px', borderRadius: '4px' }}>{file_id}</code>
        </p>
        <p style={{ margin: '4px 0', fontSize: '14px' }}>
          <strong>Rows:</strong> {rows_analyzed} of {total_rows} analyzed
        </p>
        <p style={{ margin: '4px 0', fontSize: '14px' }}>
          <strong>Rows with empty fields:</strong> {emptyRowCount}
        </p>
      </div>

      {emptyRowCount > 0 && (
        <div>
          <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>Empty Fields by Row:</h4>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {Object.entries(empty_fields_by_row).map(([rowIndex, fields]) => (
              <details key={rowIndex} style={{ margin: '4px 0' }}>
                <summary style={{
                  cursor: 'pointer',
                  padding: '4px 8px',
                  backgroundColor: '#fff',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '13px'
                }}>
                  Row {rowIndex} ({fields.length} empty fields)
                </summary>
                <div style={{
                  margin: '4px 0 0 16px',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  {fields.map((field, idx) => (
                    <span key={idx}>
                      <code style={{ backgroundColor: '#fef2f2', padding: '1px 3px', borderRadius: '2px' }}>
                        {field}
                      </code>
                      {idx < fields.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}