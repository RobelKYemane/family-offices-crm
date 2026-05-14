import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { TagEditor } from '@/components/TagEditor'
import { SourceUrlInput } from '@/components/SourceUrlInput'
import { useStore, useAllTags } from '@/lib/store'
import type { FamilyOffice, FOStatus, Confidence } from '@/data/familyOffices'

const ME_COUNTRIES = [
  'Saudi Arabia',
  'United Arab Emirates',
  'Qatar',
  'Kuwait',
  'Bahrain',
  'Oman',
  'Egypt',
  'Jordan',
  'Lebanon',
  'Iraq',
  'Morocco',
  'Algeria',
  'Tunisia',
  'Libya',
  'Other',
]

interface FODialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  initial?: FamilyOffice
}

interface FormState {
  name: string
  family: string
  country: string
  countryCustom: string
  city: string
  estAumUsd: string
  status: FOStatus
  tags: string[]
  lpActivityNotes: string
  directInvestNotes: string
  sourceUrls: string[]
  confidence: Confidence
  lastKnownActivityYear: string
}

function emptyForm(): FormState {
  return {
    name: '',
    family: '',
    country: 'United Arab Emirates',
    countryCustom: '',
    city: '',
    estAumUsd: '',
    status: 'unknown',
    tags: [],
    lpActivityNotes: '',
    directInvestNotes: '',
    sourceUrls: [],
    confidence: 'rumored',
    lastKnownActivityYear: '',
  }
}

function foToForm(fo: FamilyOffice): FormState {
  const isKnown = ME_COUNTRIES.includes(fo.country)
  return {
    name: fo.name,
    family: fo.family,
    country: isKnown ? fo.country : 'Other',
    countryCustom: isKnown ? '' : fo.country,
    city: fo.city,
    estAumUsd: fo.estAumUsd !== null ? String(fo.estAumUsd) : '',
    status: fo.status,
    tags: fo.tags,
    lpActivityNotes: fo.lpActivityNotes,
    directInvestNotes: fo.directInvestNotes,
    sourceUrls: fo.sourceUrls,
    confidence: fo.confidence,
    lastKnownActivityYear:
      fo.lastKnownActivityYear !== null ? String(fo.lastKnownActivityYear) : '',
  }
}

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!form.name.trim()) errors.name = 'Name is required.'
  const country = form.country === 'Other' ? form.countryCustom.trim() : form.country
  if (!country) errors.country = 'Country is required.'
  if (form.estAumUsd.trim()) {
    const n = Number(form.estAumUsd)
    if (isNaN(n) || n <= 0) errors.estAumUsd = 'AUM must be a positive number or left empty.'
  }
  if (form.lastKnownActivityYear.trim()) {
    const y = Number(form.lastKnownActivityYear)
    if (isNaN(y) || y < 1900 || y > 2100 || !Number.isInteger(y)) {
      errors.lastKnownActivityYear = 'Year must be a 4-digit number between 1900 and 2100.'
    }
  }
  return errors
}

export function FODialog({ open, onOpenChange, mode, initial }: FODialogProps) {
  const navigate = useNavigate()
  const createFO = useStore((s) => s.createFO)
  const updateFO = useStore((s) => s.updateFO)
  const allTags = useAllTags()

  const [form, setForm] = useState<FormState>(
    mode === 'edit' && initial ? foToForm(initial) : emptyForm()
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setForm(mode === 'edit' && initial ? foToForm(initial) : emptyForm())
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
    setSubmitting(true)

    const country = form.country === 'Other' ? form.countryCustom.trim() : form.country
    const payload: Omit<FamilyOffice, 'id'> = {
      name: form.name.trim(),
      family: form.family.trim(),
      country,
      city: form.city.trim(),
      estAumUsd: form.estAumUsd.trim() ? Number(form.estAumUsd) : null,
      status: form.status,
      tags: form.tags,
      lastContactedAt: null,
      lpActivityNotes: form.lpActivityNotes.trim(),
      directInvestNotes: form.directInvestNotes.trim(),
      sourceUrls: form.sourceUrls,
      confidence: form.confidence,
      lastKnownActivityYear: form.lastKnownActivityYear.trim()
        ? Number(form.lastKnownActivityYear)
        : null,
    }

    if (mode === 'create') {
      const newId = createFO(payload)
      onOpenChange(false)
      navigate(`/fo/${newId}`)
    } else if (initial) {
      updateFO(initial.id, payload)
      onOpenChange(false)
    }

    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'New family office' : 'Edit family office'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          {/* Name */}
          <Field label="Name *" error={errors.name}>
            <Input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Al Baraka Capital"
              autoFocus
            />
          </Field>

          {/* Family */}
          <Field label="Family name">
            <Input
              value={form.family}
              onChange={(e) => set('family', e.target.value)}
              placeholder="e.g. Al Baraka"
            />
          </Field>

          {/* Country */}
          <Field label="Country *" error={errors.country}>
            <select
              value={form.country}
              onChange={(e) => set('country', e.target.value as FormState['country'])}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {ME_COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {form.country === 'Other' && (
              <Input
                className="mt-2"
                value={form.countryCustom}
                onChange={(e) => set('countryCustom', e.target.value)}
                placeholder="Enter country name"
              />
            )}
          </Field>

          {/* City */}
          <Field label="City">
            <Input
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              placeholder="e.g. Dubai"
            />
          </Field>

          {/* Status + Confidence row */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value as FOStatus)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="active">Active</option>
                <option value="dormant">Dormant</option>
                <option value="unknown">Unknown</option>
              </select>
            </Field>
            <Field label="AUM (USD)" error={errors.estAumUsd}>
              <Input
                type="number"
                min={0}
                step="any"
                value={form.estAumUsd}
                onChange={(e) => set('estAumUsd', e.target.value)}
                placeholder="e.g. 500000000"
              />
            </Field>
          </div>

          {/* Confidence */}
          <Field label="Confidence">
            <div className="flex gap-4">
              {(['rumored', 'confirmed', 'public'] as Confidence[]).map((c) => (
                <label key={c} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="confidence"
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

          {/* Last activity year */}
          <Field label="Last known activity year" error={errors.lastKnownActivityYear}>
            <Input
              type="number"
              min={1900}
              max={2100}
              value={form.lastKnownActivityYear}
              onChange={(e) => set('lastKnownActivityYear', e.target.value)}
              placeholder="e.g. 2024"
            />
          </Field>

          {/* Tags */}
          <Field label="Tags">
            <TagEditor
              tags={form.tags}
              onChange={(tags) => set('tags', tags)}
              suggestions={allTags}
            />
          </Field>

          {/* LP Notes */}
          <Field label="LP activity notes">
            <Textarea
              value={form.lpActivityNotes}
              onChange={(e) => set('lpActivityNotes', e.target.value)}
              placeholder="Notes on LP positions in VC funds..."
              rows={3}
            />
          </Field>

          {/* Direct invest notes */}
          <Field label="Direct investment notes">
            <Textarea
              value={form.directInvestNotes}
              onChange={(e) => set('directInvestNotes', e.target.value)}
              placeholder="Notes on direct VC investments..."
              rows={3}
            />
          </Field>

          {/* Source URLs */}
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
            <Button type="submit" disabled={submitting}>
              {mode === 'create' ? 'Create' : 'Save changes'}
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
