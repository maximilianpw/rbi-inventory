import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'
import type { FolderNode } from '@/data/types/folder-node'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export function findFolderPath(
  folders: Array<FolderNode>,
  targetId: string,
  currentPath: Array<FolderNode> = [],
): Array<FolderNode> | null {
  for (const folder of folders) {
    const newPath = [...currentPath, folder]
    if (folder.id === targetId) {
      return newPath
    }
    if (folder.children) {
      const result = findFolderPath(folder.children, targetId, newPath)
      if (result) return result
    }
  }
  return null
}
