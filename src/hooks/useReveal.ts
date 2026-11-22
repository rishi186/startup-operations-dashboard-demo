import { useEffect, useRef, useState } from 'react'

/**
 * Reveals an element with a fade + slide-up animation when it scrolls into view.
 * Uses IntersectionObserver — fires once, then disconnects.
 *
 * @param threshold How much of the element must be visible (0-1, default 0.15)
 * @returns [ref, isVisible] — spread ref onto target element, use isVisible to toggle classes
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.15): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // If IntersectionObserver isn't available, just show it
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, visible]
}
