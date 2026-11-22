import { useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { BarChart3 } from 'lucide-react'
import Sidebar from './Sidebar'
import Header from './Header'
import { ChartDefs } from '../../utils/chartTheme'

interface Props {
  children: React.ReactNode
}

export default function AppShell({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const main = useRef<HTMLElement>(null)
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    main.current?.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <div className="app-shell flex h-screen overflow-hidden">
      {/* Global SVG gradient/filter defs for all charts (document-scoped ids). */}
      <ChartDefs />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main ref={main} className="app-main flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-[1600px] mx-auto">
            {/* Branded header shown only when printing (the nav bar is hidden on paper). */}
            <div className="print-only mb-5">
              <div className="flex items-center gap-3 border-b border-[#d6dae2] pb-3">
                <BarChart3 aria-hidden="true" className="h-9 w-9 text-brand" />
                <div>
                  <p className="text-lg font-extrabold text-brand leading-tight">Startup Operations Dashboard</p>
                  <p className="text-xs text-[var(--text-secondary)]">Demo · Synthetic data</p>
                </div>
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
