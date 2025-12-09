/**
 * Keyboard Shortcuts Composable
 * Provides hotkey support for power users
 */
import { onKeyStroke } from '@vueuse/core'

interface ShortcutOptions {
  onAiClean?: () => void
  onSearch?: () => void
  onSave?: () => void
  onEscape?: () => void
}

export function useKeyboardShortcuts(options: ShortcutOptions = {}) {
  // Ctrl+Enter or Cmd+Enter - AI Clean
  onKeyStroke('Enter', (e) => {
    if ((e.ctrlKey || e.metaKey) && options.onAiClean) {
      e.preventDefault()
      options.onAiClean()
    }
  })
  
  // Ctrl+K or Cmd+K - Focus Search
  onKeyStroke('k', (e) => {
    if ((e.ctrlKey || e.metaKey) && options.onSearch) {
      e.preventDefault()
      options.onSearch()
    }
  })
  
  // Ctrl+S or Cmd+S - Save (prevent browser save dialog)
  onKeyStroke('s', (e) => {
    if ((e.ctrlKey || e.metaKey) && options.onSave) {
      e.preventDefault()
      options.onSave()
    }
  })
  
  // Escape - Close modals
  onKeyStroke('Escape', () => {
    if (options.onEscape) options.onEscape()
  })
}

