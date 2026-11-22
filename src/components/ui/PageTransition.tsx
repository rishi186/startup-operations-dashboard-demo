import { useLocation } from 'react-router-dom'

interface Props {
  children: React.ReactNode
}

export default function PageTransition({ children }: Props) {
  const location = useLocation()
  return (
    <div key={location.pathname} className="animate-slide-up">
      {children}
    </div>
  )
}
