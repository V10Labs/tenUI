import React from 'react';

export interface TaskCardProps {
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
}

export function TaskCard({ description, priority, assignee }: TaskCardProps) {
  const priorityColors = {
    low: '#28a745',
    medium: '#ffc107',
    high: '#fd7e14',
    urgent: '#dc3545',
  };

  return (
    <div style={{
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '1rem',
      margin: '0.5rem 0',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '0.5rem',
      }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#333' }}>
          📋 Task
        </h3>
        <span style={{
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          color: '#fff',
          backgroundColor: priorityColors[priority],
          textTransform: 'uppercase',
        }}>
          {priority}
        </span>
      </div>

      <p style={{ margin: '0.5rem 0', color: '#666', lineHeight: 1.4 }}>
        {description}
      </p>

      {assignee && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          fontSize: '0.9rem',
        }}>
          👤 <strong>Assigned to:</strong> {assignee}
        </div>
      )}
    </div>
  );
}

export interface UnknownToolProps {
  tool: string;
  args: any;
}

export function UnknownTool({ tool, args }: UnknownToolProps) {
  return (
    <div style={{
      border: '2px dashed #ffc107',
      borderRadius: '8px',
      padding: '1rem',
      margin: '0.5rem 0',
      backgroundColor: '#fff9c4',
    }}>
      <h3 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>
        ⚠️ Unknown Tool: {tool}
      </h3>
      <p style={{ margin: '0.5rem 0', color: '#856404' }}>
        This tool is not registered in the GenerativeUI configuration.
      </p>
      <details>
        <summary style={{ cursor: 'pointer', color: '#856404', fontWeight: 'bold' }}>
          Show raw arguments
        </summary>
        <pre style={{
          backgroundColor: '#f8f9fa',
          padding: '0.5rem',
          borderRadius: '4px',
          margin: '0.5rem 0',
          overflow: 'auto',
          fontSize: '0.85rem',
        }}>
          {JSON.stringify(args, null, 2)}
        </pre>
      </details>
    </div>
  );
}