import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { ThemeToggle } from '@/components/common/ThemeToggle'

export default function SettingsPage(): React.JSX.Element {
  return (
    <div>
      <LanguageSwitcher />
      <ThemeToggle />
    </div>
  )
}
