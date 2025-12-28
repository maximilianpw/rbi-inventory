'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Package,
  MapPin,
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import { InventoryForm } from './InventoryForm'
import { AdjustQuantity } from './AdjustQuantity'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
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
import {
  type InventoryResponseDto,
  useDeleteInventoryItem,
  getListInventoryQueryKey,
} from '@/lib/data/generated'

// Constants for time calculations
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

// Helper to parse expiry date from nullable field
const parseExpiryDate = (expiryDate: unknown): Date | null => {
  if (typeof expiryDate === 'string' && expiryDate) {
    return new Date(expiryDate)
  }
  return null
}

interface InventoryCardProps {
  inventory: InventoryResponseDto
}

export function InventoryCard({ inventory }: InventoryCardProps): React.JSX.Element {
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

  // Check if low stock (below reorder point)
  const isLowStock =
    product &&
    'reorder_point' in product &&
    quantity <= (product.reorder_point as number)

  // Parse expiry date and compute status
  const expiryDate = React.useMemo(
    () => parseExpiryDate(expiryDateRaw),
    [expiryDateRaw]
  )

  // Store current time on mount to avoid impure function calls during render
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
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Package className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-medium">
                {product?.name ?? 'Unknown Product'}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                {product?.sku ? (
                  <span className="text-muted-foreground text-xs">
                    {product.sku}
                  </span>
                ) : null}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="size-8" size="icon" variant="ghost">
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
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Location and Area */}
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <MapPin className="size-4" />
            <span>
              {location?.name ?? 'Unknown Location'}
              {area?.name ? ` > ${area.name}` : ''}
            </span>
          </div>

          {/* Quantity with warnings */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{quantity}</span>
              {isLowStock ? (
                <Badge className="gap-1" variant="destructive">
                  <AlertTriangle className="size-3" />
                  {t('inventory.lowStock') ?? 'Low Stock'}
                </Badge>
              ) : null}
            </div>
            <AdjustQuantity inventory={inventory} />
          </div>

          {/* Expiry Date */}
          {expiryDate ? (
            <div
              className={`flex items-center gap-2 text-sm ${
                isExpired
                  ? 'text-destructive'
                  : isExpiringSoon
                    ? 'text-yellow-600'
                    : 'text-muted-foreground'
              }`}
            >
              <Clock className="size-4" />
              <span>
                {isExpired
                  ? 'Expired: '
                  : isExpiringSoon
                    ? `${t('inventory.expiringSoon') ?? 'Expiring Soon'}: `
                    : `${t('inventory.expiryDate') ?? 'Expires'}: `}
                {expiryDate.toLocaleDateString()}
              </span>
            </div>
          ) : null}

          {/* Batch Number */}
          {batchNumber ? (
            <div className="text-muted-foreground text-sm">
              {t('inventory.batchNumber') ?? 'Batch'}: {batchNumber}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
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

      {/* Delete Confirmation */}
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
