import { Link } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          <Link
            to="/"
            className="text-base font-semibold text-slate-900 tracking-tight hover:text-slate-700 transition-colors"
          >
            Family Offices CRM
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>

      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-10 flex items-center">
          <p className="text-xs text-slate-400">Sprint 1 demo · v0.1.0</p>
        </div>
      </footer>
    </div>
  )
}
