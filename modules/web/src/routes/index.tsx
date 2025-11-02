import { createFileRoute } from '@tanstack/react-router'
import * as Sentry from '@sentry/tanstackstart-react'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return <div className="text-center"></div>
}
