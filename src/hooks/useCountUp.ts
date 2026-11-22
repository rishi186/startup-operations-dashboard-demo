import { useEffect, useRef, useState } from 'react'

/**
 * Animates a number from 0 to `target` over `duration` ms.
 * Uses requestAnimationFrame with easeOutExpo easing.
 * Returns the current animated value.
 */
export function useCountUp(target: number, duration = 1200, delay = 0): number {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (target === 0) {
      setValue(0)
      return
    }

    const startTimer = setTimeout(() => {
      startRef.current = null

      const tick = (now: number) => {
        if (startRef.current === null) startRef.current = now
        const elapsed = now - startRef.current
        const progress = Math.min(elapsed / duration, 1)
        // easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
        setValue(target * eased)
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          setValue(target)
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }, delay)

    return () => {
      clearTimeout(startTimer)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration, delay])

  return value
}

/**
 * Formats a numeric value with optional suffix/prefix.
 * Handles decimals, thousands separators, and custom formatters.
 */
export function formatCountValue(value: number, formatter?: (v: number) => string): string {
  if (formatter) return formatter(value)
  if (Number.isInteger(value)) return Math.round(value).toLocaleString('en-IN')
  return value.toFixed(1)
}
