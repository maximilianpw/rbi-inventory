import * as React from 'react'
import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import type { FolderNode } from '@/data/types/folder-node'

interface FolderItemProps {
  folder: FolderNode
  level?: number
  selectedId?: string
  onSelect?: (id: string) => void
}

function FolderItem({
  folder,
  level = 0,
  selectedId,
  onSelect,
}: FolderItemProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const hasChildren = folder.children && folder.children.length > 0
  const isSelected = selectedId === folder.id

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    }
    onSelect?.(folder.id)
  }

  return (
    <div>
      <button
        onClick={handleClick}
        className={clsx(
          'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 transition-colors',
          isSelected && 'bg-gray-100 font-medium',
        )}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
          )
        ) : (
          <span className="w-4" />
        )}
        {isExpanded ? (
          <FolderOpen className="h-4 w-4 flex-shrink-0 text-gray-600" />
        ) : (
          <Folder className="h-4 w-4 flex-shrink-0 text-gray-600" />
        )}
        <span className="truncate">{folder.name}</span>
      </button>
      {hasChildren && isExpanded && (
        <div>
          {folder.children!.map((child) => (
            <FolderItem
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
  folders?: Array<FolderNode>
  selectedId?: string
  onSelect?: (id: string) => void
}

export default function FolderSidebar({
  folders = [],
  selectedId,
  onSelect,
}: FolderSidebarProps) {
  const { t } = useTranslation()

  return (
    <aside className="w-64 border-r border-gray-200 bg-white h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-sm">{t('folders.title')}</h2>
      </div>
      <nav className="py-2">
        {folders.length > 0 ? (
          folders.map((folder) => (
            <FolderItem
              key={folder.id}
              folder={folder}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))
        ) : (
          <div className="px-3 py-4 text-sm text-gray-500 text-center">
            {t('folders.noFolders')}
          </div>
        )}
      </nav>
    </aside>
  )
}

export type { FolderNode }
