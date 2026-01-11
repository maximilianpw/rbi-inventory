import { Link, useRouterState } from '@tanstack/react-router'
import { SignedOut, SignInButton } from '@clerk/tanstack-react-start'
import { LayoutDashboard, Package, Settings, Logs, MapPin, Boxes } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

function useRoutes(): {
  name: string
  route: string
  icon: React.ComponentType
}[] {
  const { t } = useTranslation()

  return [
    {
      name: t('navigation.dashboard'),
      route: '/',
      icon: LayoutDashboard,
    },
    {
      name: t('navigation.stock'),
      route: '/stock',
      icon: Package,
    },
    {
      name: t('navigation.products'),
      route: '/products',
      icon: Package,
    },
    {
      name: t('navigation.locations'),
      route: '/locations',
      icon: MapPin,
    },
    {
      name: t('navigation.inventory'),
      route: '/inventory',
      icon: Boxes,
    },
    {
      name: t('navigation.auditLogs'),
      route: '/audit-logs',
      icon: Logs,
    },
  ]
}

export default function AppSidebar(): React.JSX.Element {
  const { t } = useTranslation()
  const routes = useRoutes()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return (
    <Sidebar>
      <SidebarHeader>
        <Link className="inline-flex items-center gap-2" to="/">
          <span className="text-base font-bold tracking-tight">
            RBI Inventory
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes.map(({ name, route, icon: Icon }) => {
                const isActive = route === '/' 
                  ? currentPath === '/' 
                  : currentPath.startsWith(route)
                return (
                  <SidebarMenuItem key={route}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={route}>
                        <Icon />
                        <span>{name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={currentPath === '/settings'}>
              <Link to="/settings">
                <Settings />
                <span>{t('navigation.settings')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SignedOut>
          <SignInButton mode="modal" />
        </SignedOut>
      </SidebarFooter>
    </Sidebar>
  )
}
