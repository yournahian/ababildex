import { useEffect, useRef } from 'react'

/**
 * Hook that triggers a callback when clicking or touching outside the referenced element.
 * Uses capture phase so it works even if other elements intercept clicks.
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void,
  active: boolean = true
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!active) return

    const listener = (event: Event) => {
      const el = ref.current
      if (!el || el.contains(event.target as Node)) {
        return
      }
      handler()
    }

    // Capture phase catches events before anything stops propagation
    document.addEventListener('pointerdown', listener, true)
    document.addEventListener('touchstart', listener, true)
    document.addEventListener('mousedown', listener, true)

    return () => {
      document.removeEventListener('pointerdown', listener, true)
      document.removeEventListener('touchstart', listener, true)
      document.removeEventListener('mousedown', listener, true)
    }
  }, [handler, active])

  return ref
}
