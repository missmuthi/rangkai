import { LayoutDashboard, History, Users, Upload, FlaskConical, Settings, UserCircle2, type LucideIcon } from 'lucide-vue-next'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

export const useNavigation = () => {
  const route = useRoute()

  const navItems: NavItem[] = [
    { label: 'Beranda', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Riwayat', to: '/history', icon: History },
    { label: 'Grup', to: '/groups', icon: Users },
    { label: 'Impor', to: '/import', icon: Upload },
    { label: 'Profil', to: '/profile', icon: UserCircle2 },
    { label: 'Eksperimental', to: '/experimental', icon: FlaskConical },
    { label: 'Pengaturan', to: '/settings', icon: Settings },
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
