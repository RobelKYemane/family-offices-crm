import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

function getInitialTheme(): 'dark' | 'light' {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function Layout({ children }: LayoutProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex flex-col leading-tight hover:opacity-80 transition-opacity"
          >
            <span className="text-sm font-semibold text-foreground tracking-tight">
              Family Offices CRM
            </span>
            <span className="text-[10px] text-muted-foreground font-normal tracking-wide uppercase">
              ME family offices &mdash; sub-$100M VC
            </span>
          </Link>

          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>

      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-10 flex items-center">
          <p className="text-xs text-muted-foreground">
            v0.2.0 &mdash; Sprint 2 &mdash; 36 ME family offices
          </p>
        </div>
      </footer>
    </div>
  )
}
