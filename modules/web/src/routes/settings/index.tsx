import { createFileRoute } from '@tanstack/react-router'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'

export const Route = createFileRoute('/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <LanguageSwitcher />
    </div>
  )
}
