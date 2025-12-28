'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Building2,
  Truck,
  Users,
  Warehouse,
  MoreHorizontal,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  User,
} from 'lucide-react'

import { LocationForm } from './LocationForm'
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
  type LocationResponseDto,
  useDeleteLocation,
  getListLocationsQueryKey,
  getListAllLocationsQueryKey,
} from '@/lib/data/generated'

interface LocationCardProps {
  location: LocationResponseDto
  onClick?: () => void
}

const TYPE_ICONS = {
  WAREHOUSE: Warehouse,
  SUPPLIER: Building2,
  IN_TRANSIT: Truck,
  CLIENT: Users,
} as const

const TYPE_COLORS = {
  WAREHOUSE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  SUPPLIER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  IN_TRANSIT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  CLIENT: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
} as const

export function LocationCard({ location, onClick }: LocationCardProps): React.JSX.Element {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const Icon = TYPE_ICONS[location.type]
  const typeColor = TYPE_COLORS[location.type]

  const deleteMutation = useDeleteLocation({
    mutation: {
      onSuccess: async () => {
        toast.success(t('locations.deleted') || 'Location deleted successfully')
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: getListLocationsQueryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: getListAllLocationsQueryKey(),
          }),
        ])
      },
      onError: (error) => {
        toast.error(t('locations.deleteError') || 'Failed to delete location')
        console.error('Location deletion error:', error)
      },
    },
  })

  const handleDelete = async (): Promise<void> => {
    await deleteMutation.mutateAsync({ id: location.id })
    setDeleteOpen(false)
  }

  return (
    <>
      <Card
        className="cursor-pointer transition-shadow hover:shadow-md"
        onClick={onClick}
      >
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${typeColor}`}>
              <Icon className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-medium">
                {location.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant={location.is_active ? 'default' : 'secondary'}>
                  {!!location.is_active && (t('form.active') || 'Active')}
                </Badge>
                <span className="text-muted-foreground text-xs">
                  {t(`locations.types.${location.type}`) || location.type}
                </span>
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button className="size-8" size="icon" variant="ghost">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setEditOpen(true)
                }}
              >
                <Pencil className="mr-2 size-4" />
                {t('actions.edit') || 'Edit'}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteOpen(true)
                }}
              >
                <Trash2 className="mr-2 size-4" />
                {t('actions.delete') || 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {typeof location.address === 'string' && !!location.address && (
            <div className="text-muted-foreground flex items-center gap-2">
              <MapPin className="size-4" />
              <span className="truncate">{location.address}</span>
            </div>
          )}
          {typeof location.contact_person === 'string' && !!location.contact_person && (
            <div className="text-muted-foreground flex items-center gap-2">
              <User className="size-4" />
              <span>{location.contact_person}</span>
            </div>
          )}
          {typeof location.phone === 'string' && !!location.phone && (
            <div className="text-muted-foreground flex items-center gap-2">
              <Phone className="size-4" />
              <span>{location.phone}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <FormDialog
        cancelLabel={t('form.cancel') || 'Cancel'}
        description={t('locations.editDescription') || 'Update location details.'}
        formId="edit-location-form"
        open={editOpen}
        submitLabel={t('actions.save') || 'Save'}
        title={t('locations.editTitle') || 'Edit Location'}
        onOpenChange={setEditOpen}
      >
        <LocationForm
          formId="edit-location-form"
          location={location}
          onSuccess={() => setEditOpen(false)}
        />
      </FormDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('locations.deleteTitle') || 'Delete Location'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('locations.deleteDescription') ||
                'Are you sure you want to delete this location? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('form.cancel') || 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              {t('actions.delete') || 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
