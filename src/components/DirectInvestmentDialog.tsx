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
import { useStore } from '@/lib/store'
import type { DirectInvestment, Confidence } from '@/data/familyOffices'

const SECTOR_OPTIONS = [
  'Fintech', 'Tech', 'Consumer', 'AI', 'Climate', 'AgTech', 'Healthcare',
  'Logistics', 'Mobility', 'EdTech', 'Crypto', 'Biotech', 'PropTech',
  'Robotics', 'Industrial', 'DeepTech',
]

const STAGE_OPTIONS = [
  'Seed', 'Series A', 'Series B', 'Series C', 'Growth', 'Pre-IPO', 'Strategic',
]

const DATE_RE = /^\d{4}(-\d{2}(-\d{2})?)?$/

interface DirectInvestmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  familyOfficeId: string
  initial?: DirectInvestment
}

interface FormState {
  companyName: string
  sector: string
  stage: string
  checkSizeUsd: string
  roundSizeUsd: string
  dealDate: string
  notes: string
  sourceUrls: string[]
  confidence: Confidence
}

function emptyForm(): FormState {
  return {
    companyName: '',
    sector: '',
    stage: '',
    checkSizeUsd: '',
    roundSizeUsd: '',
    dealDate: '',
    notes: '',
    sourceUrls: [],
    confidence: 'rumored',
  }
}

function diToForm(di: DirectInvestment): FormState {
  return {
    companyName: di.companyName,
    sector: di.sector ?? '',
    stage: di.stage ?? '',
    checkSizeUsd: di.checkSizeUsd !== null ? String(di.checkSizeUsd) : '',
    roundSizeUsd: di.roundSizeUsd !== null ? String(di.roundSizeUsd) : '',
    dealDate: di.dealDate ?? '',
    notes: di.notes,
    sourceUrls: di.sourceUrls,
    confidence: di.confidence,
  }
}

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!form.companyName.trim()) errors.companyName = 'Company name is required.'
  if (form.checkSizeUsd && isNaN(Number(form.checkSizeUsd))) {
    errors.checkSizeUsd = 'Must be a number.'
  }
  if (form.roundSizeUsd && isNaN(Number(form.roundSizeUsd))) {
    errors.roundSizeUsd = 'Must be a number.'
  }
  if (form.dealDate && !DATE_RE.test(form.dealDate)) {
    errors.dealDate = 'Use YYYY, YYYY-MM, or YYYY-MM-DD format.'
  }
  return errors
}

export function DirectInvestmentDialog({
  open,
  onOpenChange,
  mode,
  familyOfficeId,
  initial,
}: DirectInvestmentDialogProps) {
  const createDirectInvestment = useStore((s) => s.createDirectInvestment)
  const updateDirectInvestment = useStore((s) => s.updateDirectInvestment)

  const [form, setForm] = useState<FormState>(
    mode === 'edit' && initial ? diToForm(initial) : emptyForm()
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setForm(mode === 'edit' && initial ? diToForm(initial) : emptyForm())
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

    const payload: Omit<DirectInvestment, 'id'> = {
      familyOfficeId,
      companyName: form.companyName.trim(),
      sector: form.sector.trim() || null,
      stage: form.stage.trim() || null,
      checkSizeUsd: form.checkSizeUsd ? Number(form.checkSizeUsd) : null,
      roundSizeUsd: form.roundSizeUsd ? Number(form.roundSizeUsd) : null,
      dealDate: form.dealDate.trim() || null,
      notes: form.notes.trim(),
      sourceUrls: form.sourceUrls,
      confidence: form.confidence,
    }

    if (mode === 'create') {
      createDirectInvestment(payload)
    } else if (initial) {
      updateDirectInvestment(initial.id, payload)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add direct investment' : 'Edit direct investment'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <Field label="Company name *" error={errors.companyName}>
            <Input
              value={form.companyName}
              onChange={(e) => setField('companyName', e.target.value)}
              placeholder="e.g. Tabby"
              autoFocus
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Sector">
              <div className="relative">
                <Input
                  value={form.sector}
                  onChange={(e) => setField('sector', e.target.value)}
                  placeholder="Fintech"
                  list="sector-options"
                />
                <datalist id="sector-options">
                  {SECTOR_OPTIONS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
            </Field>
            <Field label="Stage">
              <div className="relative">
                <Input
                  value={form.stage}
                  onChange={(e) => setField('stage', e.target.value)}
                  placeholder="Series A"
                  list="stage-options"
                />
                <datalist id="stage-options">
                  {STAGE_OPTIONS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Check size (USD)" error={errors.checkSizeUsd}>
              <Input
                type="number"
                value={form.checkSizeUsd}
                onChange={(e) => setField('checkSizeUsd', e.target.value)}
                placeholder="FO's check"
              />
            </Field>
            <Field label="Round size (USD)" error={errors.roundSizeUsd}>
              <Input
                type="number"
                value={form.roundSizeUsd}
                onChange={(e) => setField('roundSizeUsd', e.target.value)}
                placeholder="Total round"
              />
            </Field>
          </div>

          <Field label="Deal date" error={errors.dealDate}>
            <Input
              value={form.dealDate}
              onChange={(e) => setField('dealDate', e.target.value)}
              placeholder="YYYY or YYYY-MM or YYYY-MM-DD"
            />
          </Field>

          <Field label="Confidence">
            <div className="flex gap-4">
              {(['rumored', 'confirmed', 'public'] as Confidence[]).map((c) => (
                <label key={c} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="di-confidence"
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
              {mode === 'create' ? 'Add investment' : 'Save changes'}
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
