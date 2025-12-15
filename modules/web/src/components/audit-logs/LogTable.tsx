'use client'
import { useListAuditLogs } from '@/lib/data/generated'

export function LogTable(): React.JSX.Element {
  const { data, isError } = useListAuditLogs()

  return (
    <div>
      {data && !isError
        ? data.data.map((log) => (
            <div
              key={log.id}
              style={{
                border: '1px solid black',
                margin: '10px',
                padding: '10px',
              }}
            >
              <p>
                <strong>ID:</strong> {log.id}
              </p>
              <p>
                <strong>Action:</strong> {log.action}
              </p>
              <p>
                <strong>Timestamp:</strong>{' '}
                {new Date(log.created_at).toLocaleString()}
              </p>
            </div>
          ))
        : 'Loading...'}
    </div>
  )
}
