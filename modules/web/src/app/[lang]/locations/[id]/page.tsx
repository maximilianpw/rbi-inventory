'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Building2,
  Truck,
  Users,
  Warehouse,
  MapPin,
  Phone,
  User,
  Pencil,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { LocationForm } from '@/components/locations/LocationForm'
import { AreaTree } from '@/components/areas/AreaTree'
import { Spinner } from '@/components/ui/spinner'
import {
  useGetLocation,
  useDeleteLocation,
  getListLocationsQueryKey,
  getListAllLocationsQueryKey,
} from '@/lib/data/generated'

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

const LOCATIONS_ROUTE = '/locations'
const BACK_TO_LOCATIONS = 'Back to Locations'
const NAV_LOCATIONS_KEY = 'navigation.locations'

export default function LocationDetailPage(): React.JSX.Element {
  const { t } = useTranslation()
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const locationId = params.id as string

  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const {
    data: location,
    isLoading,
    error,
  } = useGetLocation(locationId, {
    query: {
      enabled: !!locationId,
    },
  })

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
        router.push(LOCATIONS_ROUTE)
      },
      onError: (error) => {
        toast.error(t('locations.deleteError') || 'Failed to delete location')
        console.error('Location deletion error:', error)
      },
    },
  })

  const handleDelete = async () => {
    await deleteMutation.mutateAsync({ id: locationId })
    setDeleteOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (error || !location) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-destructive">
          {t('locations.errorLoading') || 'Error loading location'}
        </p>
        <Button variant="outline" onClick={() => router.push(LOCATIONS_ROUTE)}>
          <ArrowLeft className="mr-2 size-4" />
          {t(NAV_LOCATIONS_KEY) ?? BACK_TO_LOCATIONS}
        </Button>
      </div>
    )
  }

  const Icon = TYPE_ICONS[location.type]
  const typeColor = TYPE_COLORS[location.type]

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <Button
          className="mb-4"
          size="sm"
          variant="ghost"
          onClick={() => router.push(LOCATIONS_ROUTE)}
        >
          <ArrowLeft className="mr-2 size-4" />
          {t(NAV_LOCATIONS_KEY) ?? BACK_TO_LOCATIONS}
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`rounded-lg p-3 ${typeColor}`}>
              <Icon className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{location.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={location.is_active ? 'default' : 'secondary'}>
                  {!!location.is_active && (t('form.active') || 'Active')}
                </Badge>
                <span className="text-muted-foreground text-sm">
                  {t(`locations.types.${location.type}`) || location.type}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 size-4" />
              {t('actions.edit') || 'Edit'}
            </Button>
            <Button
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              variant="outline"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-2 size-4" />
              {t('actions.delete') || 'Delete'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Location Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t(NAV_LOCATIONS_KEY) ?? 'Location Details'}
            </CardTitle>
            <CardDescription>
              {t('locations.subtitle') || 'Contact and address information'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {!!location.address && (
              <div className="flex items-start gap-2">
                <MapPin className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    {t('locations.address') || 'Address'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {String(location.address)}
                  </p>
                </div>
              </div>
            )}
            {!!location.contact_person && (
              <div className="flex items-start gap-2">
                <User className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    {t('locations.contactPerson') || 'Contact Person'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {String(location.contact_person)}
                  </p>
                </div>
              </div>
            )}
            {!!location.phone && (
              <div className="flex items-start gap-2">
                <Phone className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    {t('locations.phone') || 'Phone'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {String(location.phone)}
                  </p>
                </div>
              </div>
            )}
            {!location.address && !location.contact_person && !location.phone && (
              <p className="text-sm text-muted-foreground col-span-full">
                No additional details provided.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Areas Tree */}
        <AreaTree locationId={locationId} />
      </div>

      {/* Edit Dialog */}
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

      {/* Delete Confirmation */}
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
    </div>
  )
}
