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
import { FundDialog } from '@/components/FundDialog'
import { useStore, useAllFunds } from '@/lib/store'
import type { LPPosition, Confidence } from '@/data/familyOffices'

const DATE_RE = /^\d{4}(-\d{2}(-\d{2})?)?$/

interface LPPositionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  familyOfficeId: string
  initial?: LPPosition
}

interface FormState {
  fundId: string
  commitmentAmountUsd: string
  commitmentDate: string
  notes: string
  sourceUrls: string[]
  confidence: Confidence
}

function emptyForm(): FormState {
  return {
    fundId: '',
    commitmentAmountUsd: '',
    commitmentDate: '',
    notes: '',
    sourceUrls: [],
    confidence: 'rumored',
  }
}

function lpToForm(lp: LPPosition): FormState {
  return {
    fundId: lp.fundId,
    commitmentAmountUsd: lp.commitmentAmountUsd !== null ? String(lp.commitmentAmountUsd) : '',
    commitmentDate: lp.commitmentDate ?? '',
    notes: lp.notes,
    sourceUrls: lp.sourceUrls,
    confidence: lp.confidence,
  }
}

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!form.fundId) errors.fundId = 'Please select a fund.'
  if (form.commitmentAmountUsd && isNaN(Number(form.commitmentAmountUsd))) {
    errors.commitmentAmountUsd = 'Must be a number.'
  }
  if (form.commitmentDate && !DATE_RE.test(form.commitmentDate)) {
    errors.commitmentDate = 'Use YYYY, YYYY-MM, or YYYY-MM-DD format.'
  }
  return errors
}

export function LPPositionDialog({
  open,
  onOpenChange,
  mode,
  familyOfficeId,
  initial,
}: LPPositionDialogProps) {
  const createLPPosition = useStore((s) => s.createLPPosition)
  const updateLPPosition = useStore((s) => s.updateLPPosition)
  const funds = useAllFunds()

  const [form, setForm] = useState<FormState>(
    mode === 'edit' && initial ? lpToForm(initial) : emptyForm()
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newFundOpen, setNewFundOpen] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(mode === 'edit' && initial ? lpToForm(initial) : emptyForm())
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

    const payload: Omit<LPPosition, 'id'> = {
      familyOfficeId,
      fundId: form.fundId,
      commitmentAmountUsd: form.commitmentAmountUsd ? Number(form.commitmentAmountUsd) : null,
      commitmentDate: form.commitmentDate.trim() || null,
      notes: form.notes.trim(),
      sourceUrls: form.sourceUrls,
      confidence: form.confidence,
    }

    if (mode === 'create') {
      createLPPosition(payload)
    } else if (initial) {
      updateLPPosition(initial.id, payload)
    }

    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Add LP commitment' : 'Edit LP commitment'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <Field label="Fund *" error={errors.fundId}>
              <div className="flex gap-2">
                <select
                  value={form.fundId}
                  onChange={(e) => setField('fundId', e.target.value)}
                  className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select a fund...</option>
                  {funds.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.gpFirm})
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-xs"
                  onClick={() => setNewFundOpen(true)}
                >
                  + New
                </Button>
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Commitment amount (USD)" error={errors.commitmentAmountUsd}>
                <Input
                  type="number"
                  value={form.commitmentAmountUsd}
                  onChange={(e) => setField('commitmentAmountUsd', e.target.value)}
                  placeholder="e.g. 5000000"
                />
              </Field>
              <Field label="Commitment date" error={errors.commitmentDate}>
                <Input
                  value={form.commitmentDate}
                  onChange={(e) => setField('commitmentDate', e.target.value)}
                  placeholder="YYYY or YYYY-MM"
                />
              </Field>
            </div>

            <Field label="Confidence">
              <div className="flex gap-4">
                {(['rumored', 'confirmed', 'public'] as Confidence[]).map((c) => (
                  <label key={c} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="lp-confidence"
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
                {mode === 'create' ? 'Add commitment' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <FundDialog
        open={newFundOpen}
        onOpenChange={setNewFundOpen}
        mode="create"
        onCreated={(id) => setField('fundId', id)}
      />
    </>
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
