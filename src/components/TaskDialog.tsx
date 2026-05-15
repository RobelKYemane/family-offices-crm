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
import { useStore, useAllFOs, useContactsForFO } from '@/lib/store'
import type { Task } from '@/data/familyOffices'
import { cn } from '@/lib/utils'

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  /** Pre-scope to this FO when opened from FO detail. */
  familyOfficeId?: string
  initial?: Task
}

interface FormState {
  familyOfficeId: string
  contactId: string
  title: string
  dueDate: string
  notes: string
  done: boolean
}

function emptyForm(foId?: string): FormState {
  return {
    familyOfficeId: foId ?? '',
    contactId: '',
    title: '',
    dueDate: '',
    notes: '',
    done: false,
  }
}

function taskToForm(t: Task): FormState {
  return {
    familyOfficeId: t.familyOfficeId ?? '',
    contactId: t.contactId ?? '',
    title: t.title,
    dueDate: t.dueDate ?? '',
    notes: t.notes,
    done: t.done,
  }
}

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!form.title.trim()) errors.title = 'Title is required.'
  return errors
}

/** Contact dropdown rendered only when a FO is selected. */
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

export function TaskDialog({
  open,
  onOpenChange,
  mode,
  familyOfficeId,
  initial,
}: TaskDialogProps) {
  const createTask = useStore((s) => s.createTask)
  const updateTask = useStore((s) => s.updateTask)
  const allFOs = useAllFOs()

  const [form, setForm] = useState<FormState>(
    mode === 'edit' && initial ? taskToForm(initial) : emptyForm(familyOfficeId)
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setForm(mode === 'edit' && initial ? taskToForm(initial) : emptyForm(familyOfficeId))
      setErrors({})
    }
  }, [open, mode, initial, familyOfficeId])

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

    const payload: Omit<Task, 'id'> = {
      familyOfficeId: form.familyOfficeId || null,
      contactId: form.contactId || null,
      title: form.title.trim(),
      dueDate: form.dueDate || null,
      done: form.done,
      doneAt: initial?.doneAt ?? null,
      notes: form.notes.trim(),
    }

    if (mode === 'create') {
      createTask(payload)
    } else if (initial) {
      updateTask(initial.id, payload)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add task' : 'Edit task'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder='e.g. Send deck to Ramzi'
              autoFocus
              className={cn(errors.title && 'border-destructive')}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          {/* Family office (optional) */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">Family office (optional)</Label>
            {familyOfficeId && mode === 'create' ? (
              <p className="text-sm text-foreground font-medium">
                {allFOs.find((f) => f.id === familyOfficeId)?.name ?? familyOfficeId}
              </p>
            ) : (
              <select
                value={form.familyOfficeId}
                onChange={(e) => {
                  setField('familyOfficeId', e.target.value)
                  setField('contactId', '')
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">— Unscoped —</option>
                {allFOs.map((fo) => (
                  <option key={fo.id} value={fo.id}>
                    {fo.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Contact (only if FO selected) */}
          {form.familyOfficeId && (
            <ContactSelect
              foId={form.familyOfficeId}
              value={form.contactId}
              onChange={(v) => setField('contactId', v)}
            />
          )}

          {/* Due date */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">Due date (optional)</Label>
            <Input
              type="date"
              value={form.dueDate}
              onChange={(e) => setField('dueDate', e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">Notes (optional)</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              placeholder='Any context...'
              rows={3}
            />
          </div>

          {/* Done (edit only) */}
          {mode === 'edit' && (
            <div className="flex items-center gap-2">
              <input
                id="task-done"
                type="checkbox"
                checked={form.done}
                onChange={(e) => setField('done', e.target.checked)}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <Label htmlFor="task-done" className="text-sm font-medium text-foreground cursor-pointer">
                Mark as done
              </Label>
            </div>
          )}

          <DialogFooter className="pt-2 gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Add task' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
