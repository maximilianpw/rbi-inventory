import type { FolderNode } from '../types/folder-node'

export const sampleFolders: Array<FolderNode> = [
  {
    id: '1',
    name: 'Electronics',
    children: [
      {
        id: '1-1',
        name: 'Laptops',
        children: [
          { id: '1-1-1', name: 'Gaming' },
          { id: '1-1-2', name: 'Business' },
        ],
      },
      {
        id: '1-2',
        name: 'Phones',
      },
    ],
  },
  {
    id: '2',
    name: 'Furniture',
    children: [
      { id: '2-1', name: 'Office' },
      { id: '2-2', name: 'Home' },
    ],
  },
  {
    id: '3',
    name: 'Supplies',
  },
]
