import clsx from 'clsx'
import { Package } from 'lucide-react'

import type { LucideIcon } from 'lucide-react'

interface ImagePlaceholderProps {
  icon?: LucideIcon
  iconSize?: 'sm' | 'md' | 'lg'
  className?: string
}

const iconSizes = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
}

export function ImagePlaceholder({
  icon: Icon = Package,
  iconSize = 'md',
  className = '',
}: ImagePlaceholderProps): React.JSX.Element {
  return (
    <div
      className={clsx(
        'text-muted-foreground flex h-full w-full items-center justify-center',
        className,
      )}
    >
      <Icon className={iconSizes[iconSize]} />
    </div>
  )
}
