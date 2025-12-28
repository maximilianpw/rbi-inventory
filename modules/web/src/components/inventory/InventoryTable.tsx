'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { FormDialog } from '@/components/common/FormDialog'
import { InventoryForm } from './InventoryForm'
import { AdjustQuantity } from './AdjustQuantity'
import {
  useListInventory,
  useDeleteInventoryItem,
  getListInventoryQueryKey,
  type ListInventoryParams,
  type InventoryResponseDto,
} from '@/lib/data/generated'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

interface InventoryTableProps {
  filters?: Partial<ListInventoryParams>
}

function TableSkeleton({ showLocation }: { showLocation: boolean }): React.JSX.Element {
  return (
    <TableBody>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-1 h-3 w-20" />
          </TableCell>
          {showLocation && (
            <TableCell>
              <Skeleton className="h-4 w-24" />
            </TableCell>
          )}
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-8 ml-auto" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  )
}

interface InventoryRowProps {
  inventory: InventoryResponseDto
  showLocation?: boolean
}

function InventoryRow({ inventory, showLocation = true }: InventoryRowProps): React.JSX.Element {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const { product, location, area, quantity, batchNumber, id, expiry_date: expiryDateRaw } = inventory

  const deleteMutation = useDeleteInventoryItem({
    mutation: {
      onSuccess: async () => {
        toast.success(t('inventory.deleted') ?? 'Inventory deleted successfully')
        await queryClient.invalidateQueries({
          queryKey: getListInventoryQueryKey(),
        })
      },
      onError: (error) => {
        toast.error(t('inventory.deleteError') ?? 'Failed to delete inventory')
        console.error('Inventory deletion error:', error)
      },
    },
  })

  const handleDelete = async (): Promise<void> => {
    await deleteMutation.mutateAsync({ id })
    setDeleteOpen(false)
  }

  const isLowStock =
    product &&
    'reorder_point' in product &&
    quantity <= (product.reorder_point as number)

  const expiryDate = React.useMemo(() => {
    if (typeof expiryDateRaw === 'string' && expiryDateRaw) {
      return new Date(expiryDateRaw)
    }
    return null
  }, [expiryDateRaw])

  const [currentTime] = React.useState(() => Date.now())

  const { isExpired, isExpiringSoon } = React.useMemo(() => {
    if (!expiryDate) {
      return { isExpired: false, isExpiringSoon: false }
    }
    const expiryTime = expiryDate.getTime()
    return {
      isExpired: expiryTime < currentTime,
      isExpiringSoon: expiryTime - currentTime < THIRTY_DAYS_MS && expiryTime > currentTime,
    }
  }, [expiryDate, currentTime])

  const formId = `edit-inventory-form-${id}`

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="font-medium">{product?.name ?? 'Unknown'}</div>
          {product?.sku && (
            <div className="text-xs text-muted-foreground">{product.sku}</div>
          )}
        </TableCell>
        {showLocation && (
          <TableCell className="text-muted-foreground">
            <div>{location?.name ?? 'Unknown'}</div>
            {area?.name && (
              <div className="text-xs">{area.name}</div>
            )}
          </TableCell>
        )}
        <TableCell>
          <div className="flex items-center gap-2">
            <span className={cn(
              'font-semibold tabular-nums',
              isLowStock && 'text-destructive'
            )}>
              {quantity}
            </span>
            {isLowStock && (
              <AlertTriangle className="size-4 text-destructive" />
            )}
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {batchNumber || '—'}
        </TableCell>
        <TableCell>
          {expiryDate ? (
            <span className={cn(
              isExpired && 'text-destructive',
              isExpiringSoon && 'text-yellow-600'
            )}>
              {expiryDate.toLocaleDateString()}
              {isExpired && <Badge variant="destructive" className="ml-2 text-xs">Expired</Badge>}
              {isExpiringSoon && <Badge variant="outline" className="ml-2 text-xs border-yellow-600 text-yellow-600">Soon</Badge>}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-end gap-1">
            <AdjustQuantity inventory={inventory} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="mr-2 size-4" />
                  {t('actions.edit') ?? 'Edit'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="mr-2 size-4" />
                  {t('actions.delete') ?? 'Delete'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>

      <FormDialog
        cancelLabel={t('form.cancel') ?? 'Cancel'}
        description={t('inventory.editDescription') ?? 'Update inventory details.'}
        formId={formId}
        open={editOpen}
        submitLabel={t('actions.save') ?? 'Save'}
        title={t('inventory.editTitle') ?? 'Edit Inventory'}
        onOpenChange={setEditOpen}
      >
        <InventoryForm
          formId={formId}
          inventory={inventory}
          onSuccess={() => setEditOpen(false)}
        />
      </FormDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('inventory.deleteTitle') ?? 'Delete Inventory'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('inventory.deleteDescription') ??
                'Are you sure you want to delete this inventory record?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('form.cancel') ?? 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              {t('actions.delete') ?? 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function InventoryTable({ filters }: InventoryTableProps): React.JSX.Element {
  const { t } = useTranslation()

  const { data, isLoading, error } = useListInventory({
    page: 1,
    limit: 100,
    ...filters,
  })

  const inventoryItems = data?.data ?? []
  const showLocation = !filters?.location_id && !filters?.area_id

  if (error) {
    return (
      <div className="rounded-lg border p-8 text-center text-destructive">
        {t('inventory.errorLoading') || 'Error loading inventory'}
      </div>
    )
  }

  if (!isLoading && inventoryItems.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        {t('inventory.noInventory') || 'No inventory found'}
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('inventory.product') || 'Product'}</TableHead>
            {showLocation && (
              <TableHead>{t('inventory.location') || 'Location'}</TableHead>
            )}
            <TableHead>{t('inventory.quantity') || 'Qty'}</TableHead>
            <TableHead>{t('inventory.batch') || 'Batch'}</TableHead>
            <TableHead>{t('inventory.expiry') || 'Expiry'}</TableHead>
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        {isLoading ? (
          <TableSkeleton showLocation={showLocation} />
        ) : (
          <TableBody>
            {inventoryItems.map((inventory) => (
              <InventoryRow
                key={inventory.id}
                inventory={inventory}
                showLocation={showLocation}
              />
            ))}
          </TableBody>
        )}
      </Table>
    </div>
  )
}
