import { createFileRoute } from '@tanstack/react-router'

import { LogTable } from '@/components/audit-logs/LogTable'

export const Route = createFileRoute('/audit-logs')({
  component: AuditPage,
})

function AuditPage(): React.JSX.Element {
  return (
    <>
      <h1>Audit Logs</h1>
      <LogTable />
    </>
  )
}
