import { createFileRoute } from '@tanstack/react-router'

import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { ThemeToggle } from '@/components/common/ThemeToggle'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage(): React.JSX.Element {
  return (
    <div>
      <LanguageSwitcher />
      <ThemeToggle />
    </div>
  )
}
