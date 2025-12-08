import { useMagicKeys, whenever } from '@vueuse/core'

export interface CommandPaletteAction {
  id: string
  label: string
  icon?: string
  to?: string
  onClick?: () => void
  section?: string
}

export function useCommandPalette() {
  const isOpen = ref(false)
  const router = useRouter()

  // Keyboard shortcut: Cmd+K or Ctrl+K
  const keys = useMagicKeys()
  const cmdK = keys['Meta+K']
  const ctrlK = keys['Ctrl+K']

  whenever(cmdK, () => {
    isOpen.value = !isOpen.value
  })

  whenever(ctrlK, () => {
    isOpen.value = !isOpen.value
  })

  // Navigation actions
  const navigationActions = ref<CommandPaletteAction[]>([
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'i-lucide-layout-dashboard',
      to: '/dashboard',
      section: 'Navigation'
    },
    {
      id: 'history',
      label: 'Scan History',
      icon: 'i-lucide-history',
      to: '/history',
      section: 'Navigation'
    },
    {
      id: 'scan',
      label: 'Scan Book',
      icon: 'i-lucide-scan-line',
      to: '/scan',
      section: 'Navigation'
    },
    {
      id: 'search',
      label: 'Search',
      icon: 'i-lucide-search',
      to: '/search',
      section: 'Navigation'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'i-lucide-user',
      to: '/profile',
      section: 'Navigation'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'i-lucide-settings',
      to: '/settings',
      section: 'Navigation'
    }
  ])

  function executeAction(action: CommandPaletteAction) {
    if (action.to) {
      router.push(action.to)
    } else if (action.onClick) {
      action.onClick()
    }
    isOpen.value = false
  }

  return {
    isOpen,
    navigationActions,
    executeAction
  }
}
