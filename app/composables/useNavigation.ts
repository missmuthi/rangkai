import { LayoutDashboard, History, Settings, type LucideIcon } from 'lucide-vue-next'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

export const useNavigation = () => {
  const route = useRoute()

  const navItems: NavItem[] = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'History', to: '/history', icon: History },
    { label: 'Settings', to: '/settings', icon: Settings },
  ]

  /**
   * Check if a route is active (exact match or nested route)
   */
  const isActive = (path: string): boolean => {
    return route.path === path || route.path.startsWith(`${path}/`)
  }

  return {
    navItems,
    isActive,
  }
}
