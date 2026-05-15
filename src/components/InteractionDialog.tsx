import { useState, useEffect, useRef } from 'react'
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
import { useStore, useAllFOs, useContactsForFO } from '@/lib/store'
import type { Interaction, InteractionType } from '@/data/familyOffices'
import { cn } from '@/lib/utils'

interface InteractionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  /** When opened from FO detail, lock to this FO. */
  familyOfficeId?: string
  /** Prefill type — used by keyboard shortcut "n" to default to 'note'. */
  defaultType?: InteractionType
  initial?: Interaction
}

interface FormState {
  familyOfficeId: string
  contactId: string
  type: InteractionType
  date: string
  summary: string
  notes: string
  followUpAt: string
}

const INTERACTION_TYPES: { value: InteractionType; label: string }[] = [
  { value: 'meeting', label: 'Meeting' },
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'intro', label: 'Intro' },
  { value: 'note', label: 'Note' },
  { value: 'other', label: 'Other' },
]

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function emptyForm(foId?: string, defaultType?: InteractionType): FormState {
  return {
    familyOfficeId: foId ?? '',
    contactId: '',
    type: defaultType ?? 'meeting',
    date: todayISO(),
    summary: '',
    notes: '',
    followUpAt: '',
  }
}

function interactionToForm(i: Interaction): FormState {
  return {
    familyOfficeId: i.familyOfficeId,
    contactId: i.contactId ?? '',
    type: i.type,
    date: i.date,
    summary: i.summary,
    notes: i.notes,
    followUpAt: i.followUpAt ?? '',
  }
}

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!form.familyOfficeId) errors.familyOfficeId = 'Family office is required.'
  if (!form.summary.trim()) errors.summary = 'Summary is required.'
  if (!form.date) errors.date = 'Date is required.'
  return errors
}

/** Inner contacts selector — rendered only when a FO is selected. */
function ContactSelect({
  foId,
  value,
  onChange,
}: {
  foId: string
  value: string
  onChange: (v: string) => void
}) {
  const contacts = useContactsForFO(foId)
  if (contacts.length === 0) return null
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">Contact (optional)</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option value="">— None —</option>
        {contacts.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} ({c.role})
          </option>
        ))}
      </select>
    </div>
  )
}

export function InteractionDialog({
  open,
  onOpenChange,
  mode,
  familyOfficeId,
  defaultType,
  initial,
}: InteractionDialogProps) {
  const createInteraction = useStore((s) => s.createInteraction)
  const updateInteraction = useStore((s) => s.updateInteraction)
  const createTask = useStore((s) => s.createTask)
  const allFOs = useAllFOs()

  const [form, setForm] = useState<FormState>(
    mode === 'edit' && initial
      ? interactionToForm(initial)
      : emptyForm(familyOfficeId, defaultType)
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const summaryRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      const next =
        mode === 'edit' && initial
          ? interactionToForm(initial)
          : emptyForm(familyOfficeId, defaultType)
      setForm(next)
      setErrors({})
      // Auto-focus summary when opened via keyboard shortcut
      if (mode === 'create') {
        setTimeout(() => summaryRef.current?.focus(), 80)
      }
    }
  }, [open, mode, initial, familyOfficeId, defaultType])

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    const payload: Omit<Interaction, 'id'> = {
      familyOfficeId: form.familyOfficeId,
      contactId: form.contactId || null,
      type: form.type,
      date: form.date,
      summary: form.summary.trim(),
      notes: form.notes.trim(),
      followUpAt: form.followUpAt || null,
    }

    if (mode === 'create') {
      createInteraction(payload)
      // Auto-create a follow-up task if followUpAt is set
      if (form.followUpAt) {
        const foName = allFOs.find((f) => f.id === form.familyOfficeId)?.name ?? ''
        createTask({
          familyOfficeId: form.familyOfficeId,
          contactId: form.contactId || null,
          title: `Follow up: ${form.summary.trim() || foName}`,
          dueDate: form.followUpAt,
          done: false,
          doneAt: null,
          notes: '',
        })
      }
    } else if (initial) {
      updateInteraction(initial.id, payload)
    }

    onOpenChange(false)
  }

  const foLocked = !!familyOfficeId && mode === 'create'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Log interaction' : 'Edit interaction'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Family office */}
          {foLocked ? (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Family office</Label>
              <p className="text-sm text-foreground font-medium">
                {allFOs.find((f) => f.id === familyOfficeId)?.name ?? familyOfficeId}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Family office *</Label>
              <select
                value={form.familyOfficeId}
                onChange={(e) => {
                  setField('familyOfficeId', e.target.value)
                  setField('contactId', '')
                }}
                className={cn(
                  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  errors.familyOfficeId && 'border-destructive'
                )}
              >
                <option value="">— Select family office —</option>
                {allFOs.map((fo) => (
                  <option key={fo.id} value={fo.id}>
                    {fo.name}
                  </option>
                ))}
              </select>
              {errors.familyOfficeId && (
                <p className="text-xs text-destructive">{errors.familyOfficeId}</p>
              )}
            </div>
          )}

          {/* Contact (conditional) */}
          {form.familyOfficeId && (
            <ContactSelect
              foId={form.familyOfficeId}
              value={form.contactId}
              onChange={(v) => setField('contactId', v)}
            />
          )}

          {/* Type chips */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">Type</Label>
            <div className="flex flex-wrap gap-2">
              {INTERACTION_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setField('type', value)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    form.type === value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">Date *</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setField('date', e.target.value)}
              className={cn(errors.date && 'border-destructive')}
            />
            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
          </div>

          {/* Summary */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">Summary *</Label>
            <Input
              ref={summaryRef}
              value={form.summary}
              onChange={(e) => setField('summary', e.target.value)}
              placeholder='e.g. Coffee with Ramzi at MASIC'
              className={cn(errors.summary && 'border-destructive')}
            />
            {errors.summary && <p className="text-xs text-destructive">{errors.summary}</p>}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">Notes (optional)</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              placeholder='Longer detail, key takeaways...'
              rows={3}
            />
          </div>

          {/* Follow-up date */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">Follow-up date (optional)</Label>
            <Input
              type="date"
              value={form.followUpAt}
              onChange={(e) => setField('followUpAt', e.target.value)}
            />
            {form.followUpAt && mode === 'create' && (
              <p className="text-xs text-muted-foreground">
                A follow-up task will be automatically created.
              </p>
            )}
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Log interaction' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
