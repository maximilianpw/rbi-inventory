import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  return (
    <div>
      <LanguageSwitcher />
    </div>
  )
}
