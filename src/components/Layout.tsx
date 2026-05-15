import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Sun, Moon, Plus, MoreVertical, Download, Upload, RotateCcw, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FODialog } from '@/components/FODialog'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useStore } from '@/lib/store'

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
  const [newFOOpen, setNewFOOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const resetAll = useStore((s) => s.resetAll)
  const exportJSON = useStore((s) => s.exportJSON)
  const importJSON = useStore((s) => s.importJSON)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  function handleExport() {
    const json = exportJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `family-offices-crm-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        importJSON(reader.result as string)
      } catch {
        alert('Import failed: invalid JSON file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
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
            {/* Top-level nav */}
            <nav className="hidden sm:flex items-center gap-1">
              <Link
                to="/"
                className={
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors ' +
                  (location.pathname === '/'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted')
                }
              >
                Family Offices
              </Link>
              <Link
                to="/funds"
                className={
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors ' +
                  (location.pathname.startsWith('/funds')
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted')
                }
              >
                Funds
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            {/* New FO button */}
            <Button
              size="sm"
              onClick={() => setNewFOOpen(true)}
              className="h-8 gap-1.5 px-3 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </Button>

            {/* Dark mode toggle */}
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

            {/* Settings kebab */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Settings menu"
                  className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Data</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export data (JSON)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleImportClick}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import data (JSON)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setResetOpen(true)}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset to defaults
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>

      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-10 flex items-center">
          <p className="text-xs text-muted-foreground">
            v0.4.0 &mdash; Sprint 4 &mdash; Funds, LP Positions, Direct Investments
          </p>
        </div>
      </footer>

      {/* New FO dialog */}
      <FODialog
        open={newFOOpen}
        onOpenChange={setNewFOOpen}
        mode="create"
      />

      {/* Reset confirm */}
      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset everything?"
        description="This will permanently delete all your edits, created records, and favorites. The seed data will be restored. This cannot be undone."
        confirmLabel="Reset to defaults"
        destructive
        onConfirm={resetAll}
      />

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImportFile}
      />
    </div>
  )
}
