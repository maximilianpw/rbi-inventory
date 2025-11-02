import { Link, useRouterState } from '@tanstack/react-router'
import {
  BarChart2,
  LayoutDashboard,
  Package,
  Search,
  Settings,
  Tag,
  Truck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SignInButton, SignedOut } from '@clerk/tanstack-react-start'
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
  SidebarSeparator,
} from '@/components/ui/sidebar'

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

export default function AppSidebar() {
  const { t } = useTranslation()
  const routes = useRoutes()

  return (
    <Sidebar>
      <SidebarHeader>
        <Link to="/" className="inline-flex items-center gap-2 px-2">
          <span className="text-base font-bold tracking-tight">
            RBI Inventory
          </span>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes.map(({ name, route, icon: Icon }) => {
                const isActive = useIsActive(route)
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

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={useIsActive('/settings')}>
              <Link to="/settings">
                <Settings />
                <span>{t('navigation.settings')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />
        <SignedOut>
          <SignInButton mode="modal" />
        </SignedOut>
      </SidebarFooter>
    </Sidebar>
  )
}
