import { ChevronRight } from 'lucide-react'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import type { FolderNode } from './FolderSidebar'

interface BreadcrumbProps {
  path: Array<FolderNode>
  setSelectedFolderId: (id: string) => void
}

export default function Breadcrumbs({
  path,
  setSelectedFolderId,
}: BreadcrumbProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
      {path.length > 0 ? (
        <>
          {path.map((folder, index) => (
            <Fragment key={folder.id}>
              <button
                onClick={() => setSelectedFolderId(folder.id)}
                className="font-medium hover:text-gray-600 truncate"
              >
                {folder.name}
              </button>
              {index < path.length - 1 && (
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
              )}
            </Fragment>
          ))}
        </>
      ) : (
        <span className="font-medium text-gray-900">{t('items.allItems')}</span>
      )}
    </div>
  )
}
