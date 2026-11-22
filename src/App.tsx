import { lazy, Suspense } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import ErrorBoundary from './components/ErrorBoundary'
import PageTransition from './components/ui/PageTransition'
import { enterprisePrograms } from './data/synthetic'
import Overview from './pages/Overview'
import IncubationHub from './pages/IncubationHub'
import MSMEHub from './pages/MSMEHub'

const EnterpriseProgramPage = lazy(() => import('./components/msme/EnterpriseProgramPage'))
const CollegeConnects = lazy(() => import('./pages/CollegeConnects'))
const Finance = lazy(() => import('./pages/Finance'))
const MSME = lazy(() => import('./pages/MSME'))
const IdeaLab = lazy(() => import('./pages/incubation/IdeaLab'))
const FounderCohort = lazy(() => import('./pages/incubation/FounderCohort'))
const Upcoming = lazy(() => import('./pages/incubation/Upcoming'))
const IncubationEvents = lazy(() => import('./pages/incubation/IncubationEvents'))

export default function App() {
  return (
    <HashRouter>
      <AppShell>
        <ErrorBoundary>
          <PageTransition>
            <Suspense fallback={<p role="status">Loading dashboard…</p>}>
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/college-outreach" element={<CollegeConnects />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/incubation" element={<IncubationHub />}>
                  <Route index element={<Navigate to="idea-lab" replace />} />
                  <Route path="idea-lab" element={<IdeaLab />} />
                  <Route path="founder-cohort" element={<FounderCohort />} />
                  <Route path="upcoming" element={<Upcoming />} />
                  <Route path="events" element={<IncubationEvents />} />
                </Route>
                <Route path="/msme" element={<MSMEHub />}>
                  <Route index element={<Navigate to="events" replace />} />
                  <Route path="events" element={<MSME />} />
                  {enterprisePrograms.map(({ path, title, description, data }) => (
                    <Route key={path} path={path} element={
                      <EnterpriseProgramPage title={title} subtitle={description} data={data} />
                    } />
                  ))}
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </PageTransition>
        </ErrorBoundary>
      </AppShell>
    </HashRouter>
  )
}
