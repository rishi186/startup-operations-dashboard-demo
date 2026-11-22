import { useState, useRef, useEffect, useMemo } from 'react'
import { Menu, Search, X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Overview',
  '/incubation': 'Incubation Hub',
  '/incubation/idea-lab': 'Idea Lab',
  '/incubation/founder-cohort': 'Founder Cohort',
  '/incubation/upcoming': 'Upcoming Programs',
  '/incubation/events': 'Incubation Events',
  '/msme': 'MSME',
  '/msme/events': 'MSME Events',
  '/msme/registration': 'Business Registration',
  '/msme/skills': 'Skills Development',
  '/msme/ip': 'Intellectual Property',
  '/msme/vendors': 'Vendor Development',
  '/college-outreach': 'College Outreach',
  '/finance': 'Finance',
}

interface Props {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: Props) {
  const location = useLocation()
  const navigate = useNavigate()
  const title = ROUTE_TITLES[location.pathname] ?? 'Dashboard'

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const searchRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.trim().toLowerCase()
    return Object.entries(ROUTE_TITLES)
      .filter(([path, label]) => label.toLowerCase().includes(q) || path.includes(q))
      .slice(0, 6)
  }, [searchQuery])

  useEffect(() => {
    setActiveIndex(0)
  }, [searchQuery])

  useEffect(() => {
    if (!searchOpen) {
      setSearchQuery('')
      return
    }
    searchRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchOpen(false)
    } else if (e.key === 'Enter' && searchResults.length > 0) {
      navigate(searchResults[activeIndex][0])
      setSearchOpen(false)
    } else if (e.key === 'ArrowDown' && searchResults.length > 0) {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, searchResults.length - 1))
    } else if (e.key === 'ArrowUp' && searchResults.length > 0) {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    }
  }

  return (
    <header className="h-14 glass-2 border-b border-[var(--glass-border)] flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          aria-label="Open navigation"
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-md text-[var(--text-muted)] hover:bg-[var(--glass-surface-2)] active:scale-95 shrink-0"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-sm font-medium text-[var(--text-secondary)] hidden sm:block shrink-0">
          {title}
        </h2>

        {/* Quick Search */}
        <div ref={containerRef} className="relative flex-1 max-w-xs ml-2 sm:ml-4">
          {searchOpen ? (
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKey}
                aria-label="Search pages"
                placeholder="Search pages..."
                className="w-full pl-8 pr-7 py-1.5 rounded-lg text-xs glass-1 border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-brand/40"
              />
              <button
                aria-label="Close page search"
                onClick={() => setSearchOpen(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X size={14} />
              </button>

              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 glass-3 rounded-lg border border-[var(--glass-border)] shadow-lg overflow-hidden z-50">
                  {searchResults.map(([path, label], i) => (
                    <button
                      key={path}
                      onClick={() => { navigate(path); setSearchOpen(false) }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                        i === activeIndex ? 'bg-brand-50 text-brand' : 'text-[var(--text-secondary)] hover:bg-[var(--glass-surface-1)]'
                      }`}
                    >
                      <span className="font-medium">{label}</span>
                      <span className="text-[var(--text-muted)] ml-2 text-[10px]">{path}</span>
                    </button>
                  ))}
                </div>
              )}
              {searchQuery && searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 glass-3 rounded-lg border border-[var(--glass-border)] shadow-lg px-3 py-2 text-xs text-[var(--text-muted)] z-50">
                  No pages found
                </div>
              )}
            </div>
          ) : (
            <button
              aria-label="Search pages"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[var(--text-muted)] glass-1 hover:glass-2 transition-all"
            >
              <Search size={14} /> <span className="hidden sm:inline">Search pages...</span>
            </button>
          )}
        </div>
      </div>
      <span className="shrink-0 ml-3 rounded-full bg-brand-50 border border-brand-200 px-2.5 py-1 text-[11px] font-semibold text-brand-900">
        Demo · Synthetic data
      </span>
    </header>
  )
}
