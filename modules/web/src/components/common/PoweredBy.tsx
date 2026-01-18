import { useBranding } from '@/hooks/providers/BrandingProvider'

export function PoweredBy(): React.JSX.Element {
  const { branding } = useBranding()

  return (
    <div className="flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground">
      <span>Powered by</span>
      <a
        className="font-medium underline-offset-4 hover:underline"
        href={branding.powered_by.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        {branding.powered_by.name}
      </a>
    </div>
  )
}
