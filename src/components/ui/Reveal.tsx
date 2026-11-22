import { type ReactNode } from 'react'
import { useReveal } from '../../hooks/useReveal'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  threshold?: number
}

/**
 * Wraps children in a scroll-triggered reveal animation.
 * Fades + slides up when scrolled into view.
 */
export default function Reveal({ children, className = '', delay = 0, threshold = 0.15 }: RevealProps) {
  const [ref, visible] = useReveal<HTMLDivElement>(threshold)

  return (
    <div
      ref={ref}
      className={`${visible ? 'reveal-visible' : 'reveal-hidden'} ${className}`}
      style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
