'use client'
import * as React from 'react'
import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FolderNode } from '@/lib/data/types/folder-node'
import { Category } from '@/lib/data/types'
import { useCategoryQuery } from '@/lib/data/components/categories'

interface CategoryItemProps {
  folder: Category
  selectedId?: string
  onSelect?: (id: string) => void
  level?: number
}

function CategoryItem({
  folder,
  selectedId,
  onSelect,
  level = 0,
}: CategoryItemProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const hasChildren = folder.children && folder.children.length > 0
  const isActive = selectedId === folder.id

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    }
    onSelect?.(folder.id)
  }

  return (
    <div>
      <Button
        variant="ghost"
        onClick={handleClick}
        className={cn(
          'w-full justify-start gap-2 h-9 px-2 font-normal',
          isActive && 'bg-accent font-medium',
        )}
        style={{ paddingLeft: `${8 + level * 12}px` }}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )
        ) : (
          <span className="w-4" />
        )}
        {isExpanded ? (
          <FolderOpen className="h-4 w-4 shrink-0" />
        ) : (
          <Folder className="h-4 w-4 shrink-0" />
        )}
        <span className="truncate">{folder.name}</span>
      </Button>
      {hasChildren && isExpanded && (
        <div>
          {folder.children!.map((child) => (
            <CategoryItem
              key={child.id}
              folder={child}
              selectedId={selectedId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface FolderSidebarProps {
  folders?: Array<Category>
  selectedId?: string
  onSelect?: (id: string) => void
}

export default function CategorySidebar({
  selectedId,
  onSelect,
}: FolderSidebarProps) {
  const { t } = useTranslation()
  const { data } = useCategoryQuery()

  return (
    <aside className="w-64 border-r bg-background h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-sm">{t('folders.title')}</h2>
      </div>
      <nav className="flex-1 overflow-y-hidden p-2">
        {data && data.length > 0 ? (
          <div className="space-y-1">
            {data.map((folder) => (
              <CategoryItem
                key={folder.id}
                folder={folder}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </div>
        ) : (
          <div className="px-3 py-4 text-sm text-muted-foreground text-center">
            {t('folders.noFolders')}
          </div>
        )}
      </nav>
    </aside>
  )
}

export type { FolderNode }
