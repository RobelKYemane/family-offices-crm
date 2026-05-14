import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Download, Upload, RotateCcw, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useStore, useStats, useHiddenFOs } from '@/lib/store'

const LS_KEY = 'family-offices-crm:v1'

function storageBytes(): number {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? new TextEncoder().encode(raw).length : 0
  } catch {
    return 0
  }
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

export function Settings() {
  const stats = useStats()
  const hiddenFOs = useHiddenFOs()
  const resetAll = useStore((s) => s.resetAll)
  const exportJSON = useStore((s) => s.exportJSON)
  const importJSON = useStore((s) => s.importJSON)
  const restoreFO = useStore((s) => s.restoreFO)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetConfirm2Open, setResetConfirm2Open] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  const bytes = storageBytes()

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
    setImportError(null)
    fileInputRef.current?.click()
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        importJSON(reader.result as string)
        setImportError(null)
      } catch {
        setImportError('Import failed: invalid JSON file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleRestoreAll() {
    hiddenFOs.forEach((fo) => restoreFO(fo.id))
  }

  // Double-confirm reset: first dialog confirms intent, second actually runs it.
  function handleFirstResetConfirm() {
    setResetConfirm2Open(true)
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your CRM data. All data is stored locally in your browser.
        </p>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Data overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <StatRow label="Seed family offices" value={stats.seedFOs} />
          <StatRow label="User-created family offices" value={stats.createdFOs} />
          <StatRow label="Edited seed entries" value={stats.editedFOs} />
          <StatRow label="Hidden seed entries" value={stats.hiddenFOs} />
          <StatRow label="Favorited" value={stats.favorites} />
          <StatRow label="Contacts added" value={stats.createdContacts} />
          <div className="pt-3 mt-2 border-t border-border">
            <StatRow
              label="Storage used"
              value={formatBytes(bytes)}
              valueClass="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Data actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ActionRow
            label="Export all data"
            description="Download your edits, created records, and favorites as a JSON file."
            action={
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 shrink-0">
                <Download className="h-3.5 w-3.5" />
                Export JSON
              </Button>
            }
          />

          <ActionRow
            label="Import data"
            description="Replace your local data from a previously exported JSON file."
            action={
              <Button variant="outline" size="sm" onClick={handleImportClick} className="gap-1.5 shrink-0">
                <Upload className="h-3.5 w-3.5" />
                Import JSON
              </Button>
            }
          />
          {importError && (
            <p className="text-xs text-destructive">{importError}</p>
          )}

          {hiddenFOs.length > 0 && (
            <ActionRow
              label={`Restore hidden entries (${hiddenFOs.length})`}
              description="Make all hidden seed family offices visible again."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRestoreAll}
                  className="gap-1.5 shrink-0"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Restore all
                </Button>
              }
            />
          )}

          <div className="pt-3 border-t border-border">
            <ActionRow
              label="Reset to defaults"
              description="Permanently delete all your edits, additions, and favorites. Seed data will be restored."
              action={
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setResetOpen(true)}
                  className="gap-1.5 shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset everything
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* First reset confirm */}
      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset everything?"
        description="This will permanently delete all your edits, created records, and favorites. The seed data will be restored. Click confirm to proceed to a final confirmation."
        confirmLabel="I understand, continue"
        destructive
        onConfirm={handleFirstResetConfirm}
      />

      {/* Second (final) reset confirm */}
      <ConfirmDialog
        open={resetConfirm2Open}
        onOpenChange={setResetConfirm2Open}
        title="Final confirmation — reset everything?"
        description="This cannot be undone. All your custom data will be gone."
        confirmLabel="Yes, reset everything"
        destructive
        onConfirm={resetAll}
      />

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

function StatRow({
  label,
  value,
  valueClass,
}: {
  label: string
  value: number | string
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={valueClass ?? 'font-semibold text-foreground tabular-nums'}>{value}</span>
    </div>
  )
}

function ActionRow({
  label,
  description,
  action,
}: {
  label: string
  description: string
  action: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}
