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
import type { Contact, Confidence } from '@/data/familyOffices'

interface ContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  familyOfficeId: string
  initial?: Contact
}

interface FormState {
  name: string
  role: string
  seniority: Contact['seniority']
  linkedinUrl: string
  email: string
  notes: string
  sourceUrls: string[]
  confidence: Confidence
}

function emptyForm(): FormState {
  return {
    name: '',
    role: '',
    seniority: 'executive',
    linkedinUrl: '',
    email: '',
    notes: '',
    sourceUrls: [],
    confidence: 'rumored',
  }
}

function contactToForm(c: Contact): FormState {
  return {
    name: c.name,
    role: c.role,
    seniority: c.seniority,
    linkedinUrl: c.linkedinUrl ?? '',
    email: c.email ?? '',
    notes: c.notes,
    sourceUrls: c.sourceUrls,
    confidence: c.confidence,
  }
}

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!form.name.trim()) errors.name = 'Name is required.'
  if (!form.role.trim()) errors.role = 'Role is required.'
  return errors
}

export function ContactDialog({
  open,
  onOpenChange,
  mode,
  familyOfficeId,
  initial,
}: ContactDialogProps) {
  const createContact = useStore((s) => s.createContact)
  const updateContact = useStore((s) => s.updateContact)

  const [form, setForm] = useState<FormState>(
    mode === 'edit' && initial ? contactToForm(initial) : emptyForm()
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setForm(mode === 'edit' && initial ? contactToForm(initial) : emptyForm())
      setErrors({})
    }
  }, [open, mode, initial])

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
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

    const payload: Omit<Contact, 'id'> = {
      familyOfficeId,
      name: form.name.trim(),
      role: form.role.trim(),
      seniority: form.seniority,
      linkedinUrl: form.linkedinUrl.trim() || null,
      email: form.email.trim() || null,
      notes: form.notes.trim(),
      sourceUrls: form.sourceUrls,
      confidence: form.confidence,
    }

    if (mode === 'create') {
      createContact(payload)
    } else if (initial) {
      updateContact(initial.id, payload)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add contact' : 'Edit contact'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <Field label="Name *" error={errors.name}>
            <Input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Mohammed Al-Rashid"
              autoFocus
            />
          </Field>

          <Field label="Role / title *" error={errors.role}>
            <Input
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
              placeholder="e.g. Managing Director"
            />
          </Field>

          <Field label="Seniority">
            <select
              value={form.seniority}
              onChange={(e) => set('seniority', e.target.value as Contact['seniority'])}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="principal">Principal</option>
              <option value="executive">Executive</option>
              <option value="investment_team">Investment team</option>
              <option value="advisor">Advisor</option>
            </select>
          </Field>

          <Field label="Confidence">
            <div className="flex gap-4">
              {(['rumored', 'confirmed', 'public'] as Confidence[]).map((c) => (
                <label key={c} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="contact-confidence"
                    value={c}
                    checked={form.confidence === c}
                    onChange={() => set('confidence', c)}
                    className="accent-primary"
                  />
                  <span className="capitalize">{c}</span>
                </label>
              ))}
            </div>
          </Field>

          <Field label="LinkedIn URL">
            <Input
              type="url"
              value={form.linkedinUrl}
              onChange={(e) => set('linkedinUrl', e.target.value)}
              placeholder="https://linkedin.com/in/..."
            />
          </Field>

          <Field label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="name@example.com"
            />
          </Field>

          <Field label="Notes">
            <Textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Any relevant context..."
              rows={3}
            />
          </Field>

          <Field label="Source URLs">
            <SourceUrlInput
              urls={form.sourceUrls}
              onChange={(urls) => set('sourceUrls', urls)}
            />
          </Field>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Add contact' : 'Save changes'}
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
