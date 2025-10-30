import * as React from 'react'

import { Link, useRouterState } from '@tanstack/react-router'
import {
  BarChart2,
  LayoutDashboard,
  Menu,
  Package,
  Search,
  Settings,
  Tag,
  Truck,
} from 'lucide-react'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { SignedOut, SignInButton } from '@clerk/tanstack-react-start'

const useRoutes = () => {
  const { t } = useTranslation()

  return [
    {
      name: t('navigation.dashboard'),
      route: '/',
      icon: LayoutDashboard,
    },
    {
      name: t('navigation.items'),
      route: '/items',
      icon: Package,
    },
    {
      name: t('navigation.search'),
      route: '/search',
      icon: Search,
    },
    {
      name: t('navigation.deliveries'),
      route: '/deliveries',
      icon: Truck,
    },
    {
      name: t('navigation.tags'),
      route: '/tags',
      icon: Tag,
    },
    {
      name: t('navigation.report'),
      route: '/report',
      icon: BarChart2,
    },
  ]
}

function useIsActive(to: string) {
  const { location } = useRouterState()
  if (to === '/') return location.pathname === '/'
  return location.pathname.startsWith(to)
}

function NavItem({
  to,
  name,
  Icon,
  onClick,
}: {
  to: string
  name: string
  Icon?: React.ElementType
  onClick?: () => void
}) {
  const isActive = useIsActive(to)
  return (
    <div className={clsx('flex', isActive && 'bg-gray-100')}>
      <Link to={to} className="w-full flex items-center p-3" onClick={onClick}>
        {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
        {name}
      </Link>
    </div>
  )
}

function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const { t } = useTranslation()
  const routes = useRoutes()

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2 p-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2"
          onClick={onItemClick}
        >
          <span className="text-base font-bold tracking-tight">
            RBI Inventory
          </span>
        </Link>
      </div>
      <Separator />

      {/* Nav */}
      <nav className="flex flex-col my-auto gap-1">
        {routes.map(({ name, route, icon: Icon }) => (
          <NavItem
            key={route}
            to={route}
            name={name}
            Icon={Icon}
            onClick={onItemClick}
          />
        ))}
      </nav>

      <Separator />

      {/* Footer / Settings */}
      <div className="p-3 space-y-2">
        <LanguageSwitcher />
        <Link to="/settings" className="w-full" onClick={onItemClick}>
          <Button
            variant={'outline'}
            className="w-full justify-start rounded-xl"
          >
            <Settings className="mr-2 h-4 w-4" /> {t('navigation.settings')}
          </Button>
        </Link>
        <Separator />
        <SignedOut>
          <SignInButton mode="modal" />
        </SignedOut>
      </div>
    </div>
  )
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-base font-bold tracking-tight">
              RBI Inventory
            </span>
          </Link>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant={'outline'} size={'sm'}>
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side={'left'} className="w-64 p-0">
              <SidebarContent onItemClick={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-40 w-64 border-r border-gray-200 bg-white">
        <SidebarContent />
      </aside>
    </>
  )
}
