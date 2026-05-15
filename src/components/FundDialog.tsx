import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SourceUrlInput } from '@/components/SourceUrlInput'
import { TagEditor } from '@/components/TagEditor'
import { useStore } from '@/lib/store'
import type { Fund, FundStatus, Confidence } from '@/data/familyOffices'

const GEOGRAPHY_SUGGESTIONS = ['MENA', 'GCC', 'Global', 'US', 'Southeast Asia', 'India', 'Turkey', 'Pakistan']
const SECTOR_SUGGESTIONS = ['Tech', 'Fintech', 'AI', 'Climate', 'Healthcare', 'Consumer', 'DeepTech', 'Biotech', 'AgTech', 'Logistics', 'Mobility', 'EdTech', 'Crypto', 'PropTech', 'Robotics', 'Industrial']

interface FundDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  initial?: Fund
  onCreated?: (id: string) => void
}

interface FormState {
  name: string
  gpFirm: string
  vintageYear: string
  targetSizeUsd: string
  geographyFocus: string[]
  sectorFocus: string[]
  status: FundStatus
  notes: string
  sourceUrls: string[]
  confidence: Confidence
}

function emptyForm(): FormState {
  return {
    name: '',
    gpFirm: '',
    vintageYear: '',
    targetSizeUsd: '',
    geographyFocus: [],
    sectorFocus: [],
    status: 'raising',
    notes: '',
    sourceUrls: [],
    confidence: 'rumored',
  }
}

function fundToForm(f: Fund): FormState {
  return {
    name: f.name,
    gpFirm: f.gpFirm,
    vintageYear: f.vintageYear !== null ? String(f.vintageYear) : '',
    targetSizeUsd: f.targetSizeUsd !== null ? String(f.targetSizeUsd) : '',
    geographyFocus: f.geographyFocus,
    sectorFocus: f.sectorFocus,
    status: f.status,
    notes: f.notes,
    sourceUrls: f.sourceUrls,
    confidence: f.confidence,
  }
}

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!form.name.trim()) errors.name = 'Name is required.'
  if (!form.gpFirm.trim()) errors.gpFirm = 'GP firm is required.'
  if (form.vintageYear && (isNaN(Number(form.vintageYear)) || Number(form.vintageYear) < 1900 || Number(form.vintageYear) > 2100)) {
    errors.vintageYear = 'Vintage year must be between 1900 and 2100.'
  }
  if (form.targetSizeUsd && isNaN(Number(form.targetSizeUsd))) {
    errors.targetSizeUsd = 'Target size must be a number.'
  }
  return errors
}

export function FundDialog({ open, onOpenChange, mode, initial, onCreated }: FundDialogProps) {
  const createFund = useStore((s) => s.createFund)
  const updateFund = useStore((s) => s.updateFund)

  const [form, setForm] = useState<FormState>(
    mode === 'edit' && initial ? fundToForm(initial) : emptyForm()
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setForm(mode === 'edit' && initial ? fundToForm(initial) : emptyForm())
      setErrors({})
    }
  }, [open, mode, initial])

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => { const next = { ...e }; delete next[field]; return next })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    const payload: Omit<Fund, 'id'> = {
      name: form.name.trim(),
      gpFirm: form.gpFirm.trim(),
      vintageYear: form.vintageYear ? Number(form.vintageYear) : null,
      targetSizeUsd: form.targetSizeUsd ? Number(form.targetSizeUsd) : null,
      geographyFocus: form.geographyFocus,
      sectorFocus: form.sectorFocus,
      status: form.status,
      notes: form.notes.trim(),
      sourceUrls: form.sourceUrls,
      confidence: form.confidence,
    }

    if (mode === 'create') {
      const id = createFund(payload)
      onCreated?.(id)
    } else if (initial) {
      updateFund(initial.id, payload)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add fund' : 'Edit fund'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <Field label="Fund name *" error={errors.name}>
            <Input
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="e.g. Nuwa Capital Fund I"
              autoFocus
            />
          </Field>

          <Field label="GP firm *" error={errors.gpFirm}>
            <Input
              value={form.gpFirm}
              onChange={(e) => setField('gpFirm', e.target.value)}
              placeholder="e.g. Nuwa Capital"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Vintage year" error={errors.vintageYear}>
              <Input
                type="number"
                value={form.vintageYear}
                onChange={(e) => setField('vintageYear', e.target.value)}
                placeholder="2024"
                min={1900}
                max={2100}
              />
            </Field>
            <Field label="Target size (USD)" error={errors.targetSizeUsd}>
              <Input
                type="number"
                value={form.targetSizeUsd}
                onChange={(e) => setField('targetSizeUsd', e.target.value)}
                placeholder="100000000"
              />
            </Field>
          </div>

          <Field label="Status">
            <div className="flex flex-wrap gap-3">
              {(['raising', 'closed', 'evergreen', 'fully-deployed'] as FundStatus[]).map((st) => (
                <label key={st} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="fund-status"
                    value={st}
                    checked={form.status === st}
                    onChange={() => setField('status', st)}
                    className="accent-primary"
                  />
                  <span className="capitalize">{st.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </Field>

          <Field label="Geography focus">
            <TagEditor
              tags={form.geographyFocus}
              onChange={(tags) => setField('geographyFocus', tags)}
              suggestions={GEOGRAPHY_SUGGESTIONS}
              placeholder="Add geography..."
            />
          </Field>

          <Field label="Sector focus">
            <TagEditor
              tags={form.sectorFocus}
              onChange={(tags) => setField('sectorFocus', tags)}
              suggestions={SECTOR_SUGGESTIONS}
              placeholder="Add sector..."
            />
          </Field>

          <Field label="Confidence">
            <div className="flex gap-4">
              {(['rumored', 'confirmed', 'public'] as Confidence[]).map((c) => (
                <label key={c} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="fund-confidence"
                    value={c}
                    checked={form.confidence === c}
                    onChange={() => setField('confidence', c)}
                    className="accent-primary"
                  />
                  <span className="capitalize">{c}</span>
                </label>
              ))}
            </div>
          </Field>

          <Field label="Notes">
            <Textarea
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              placeholder="Any relevant context..."
              rows={3}
            />
          </Field>

          <Field label="Source URLs">
            <SourceUrlInput
              urls={form.sourceUrls}
              onChange={(urls) => setField('sourceUrls', urls)}
            />
          </Field>

          <DialogFooter className="pt-2 gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Add fund' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
