interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

const toasts = ref<Toast[]>([])

export function useToast() {
  function add(toast: Omit<Toast, 'id'>) {
    const id = Math.random().toString(36).slice(2)
    const newToast = { ...toast, id }

    toasts.value.push(newToast)

    // Auto-dismiss after duration (default 5s)
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }

    return id
  }

  function dismiss(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function success(message: string, duration?: number) {
    return add({ type: 'success', message, duration })
  }

  function error(message: string, duration?: number) {
    return add({ type: 'error', message, duration })
  }

  function warning(message: string, duration?: number) {
    return add({ type: 'warning', message, duration })
  }

  function info(message: string, duration?: number) {
    return add({ type: 'info', message, duration })
  }

  return {
    toasts: readonly(toasts),
    add,
    dismiss,
    success,
    error,
    warning,
    info
  }
}
