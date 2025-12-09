'use client'
import Link from 'next/link'

import { SignedOut, SignInButton } from '@clerk/nextjs'
import { LayoutDashboard, Package, Settings } from 'lucide-react'
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
  SidebarSeparator,
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
  ]
}

export default function AppSidebar(): React.JSX.Element {
  const { t } = useTranslation()
  const routes = useRoutes()

  return (
    <Sidebar>
      <SidebarHeader>
        <Link className="inline-flex items-center gap-2 px-2" href="/">
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
                return (
                  <SidebarMenuItem key={route}>
                    <SidebarMenuButton asChild isActive={false}>
                      <Link href={route}>
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
            <SidebarMenuButton asChild isActive={false}>
              <Link href="/settings">
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
