'use client'
import * as React from 'react'

import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  type CategoryWithChildrenResponse,
  useListCategories,
} from '@/lib/data/generated'
import { cn } from '@/lib/utils'

interface CategoryItemProps {
  folder: CategoryWithChildrenResponse
  selectedId?: string
  onSelect?: (id: string) => void
  level?: number
}

function CategoryItem({
  folder,
  selectedId,
  onSelect,
  level = 0,
}: CategoryItemProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const hasChildren = folder.children.length > 0
  const isActive = selectedId === folder.id

  const handleClick = (): void => {
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    }
    onSelect?.(folder.id)
  }

  const chevronIcon = isExpanded ? (
    <ChevronDown className="h-4 w-4 shrink-0" />
  ) : (
    <ChevronRight className="h-4 w-4 shrink-0" />
  )

  return (
    <div>
      <Button
        style={{ paddingLeft: `${8 + level * 12}px` }}
        variant="ghost"
        className={cn(
          'h-9 w-full justify-start gap-2 px-2 font-normal',
          isActive && 'bg-accent font-medium',
        )}
        onClick={handleClick}
      >
        {hasChildren ? chevronIcon : <span className="w-4" />}
        {isExpanded ? (
          <FolderOpen className="h-4 w-4 shrink-0" />
        ) : (
          <Folder className="h-4 w-4 shrink-0" />
        )}
        <span className="truncate">{folder.name}</span>
      </Button>
      {!!hasChildren && !!isExpanded && (
        <div>
          {folder.children.map((child) => (
            <CategoryItem
              key={child.id}
              folder={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface FolderSidebarProps {
  selectedId?: string
  onSelect?: (id: string) => void
}

export default function CategorySidebar({
  selectedId: _selectedId,
  onSelect: _onSelect,
}: FolderSidebarProps): React.JSX.Element {
  const { t } = useTranslation()
  const { data: _categories, isLoading, error: _error } = useListCategories()

  return (
    <aside className="bg-background flex h-full w-64 flex-col border-r">
      <div className="border-b p-4">
        <h2 className="text-sm font-semibold">{t('folders.title')}</h2>
      </div>
      <nav className="flex-1 overflow-y-hidden p-2">
        {isLoading === true && (
          <div className="flex justify-center py-8">
            <Spinner className="size-6" />
          </div>
        )}
      </nav>
    </aside>
  )
}
