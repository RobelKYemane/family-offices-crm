import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Building2,
  Linkedin,
  Mail,
  CalendarClock,
  Users,
  Star,
  Pencil,
  Trash2,
  MoreVertical,
  Plus,
} from 'lucide-react'
import { familyOffices as seedFOs } from '@/data/familyOffices'
import type { Contact } from '@/data/familyOffices'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FaviconChip } from '@/components/FaviconChip'
import { FODialog } from '@/components/FODialog'
import { ContactDialog } from '@/components/ContactDialog'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { formatAum, countryFlag, cn } from '@/lib/utils'
import {
  useFO,
  useContactsForFO,
  useIsFavorite,
  useIsEdited,
  useIsCreated,
  useStore,
} from '@/lib/store'

const seedIdSet = new Set(seedFOs.map((f) => f.id))

// ---- badge helpers -------------------------------------------------------

function ConfidenceBadge({ confidence }: { confidence: 'rumored' | 'confirmed' | 'public' }) {
  if (confidence === 'public')
    return (
      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
        Public
      </Badge>
    )
  if (confidence === 'confirmed')
    return (
      <Badge className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
        Confirmed
      </Badge>
    )
  return (
    <Badge variant="outline" className="text-muted-foreground">
      Rumored
    </Badge>
  )
}

function StatusBadge({ status }: { status: 'active' | 'dormant' | 'unknown' }) {
  if (status === 'active') return <Badge variant="success">Active</Badge>
  if (status === 'dormant') return <Badge variant="warning">Dormant</Badge>
  return <Badge variant="muted">Unknown</Badge>
}

function SeniorityChip({ seniority }: { seniority: Contact['seniority'] }) {
  const labels: Record<Contact['seniority'], string> = {
    principal: 'Principal',
    executive: 'Executive',
    investment_team: 'Investment team',
    advisor: 'Advisor',
  }
  return (
    <Badge variant="secondary" className="text-[10px]">
      {labels[seniority]}
    </Badge>
  )
}

function ConfidenceDot({ confidence }: { confidence: 'rumored' | 'confirmed' | 'public' }) {
  const cls =
    confidence === 'public'
      ? 'bg-emerald-500'
      : confidence === 'confirmed'
      ? 'bg-amber-400'
      : 'bg-slate-400'
  return (
    <span
      title={confidence}
      className={cn('inline-block h-2 w-2 rounded-full shrink-0 mt-1', cls)}
    />
  )
}

// ---- section card --------------------------------------------------------

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon?: React.ElementType
  children: React.ReactNode
}) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// ---- contact card --------------------------------------------------------

function ContactCard({
  contact,
  onEdit,
  onDelete,
}: {
  contact: Contact
  onEdit: (c: Contact) => void
  onDelete: (c: Contact) => void
}) {
  return (
    <div className="group flex items-start gap-3 py-3 border-b border-border last:border-0">
      <ConfidenceDot confidence={contact.confidence} />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">{contact.name}</span>
          <SeniorityChip seniority={contact.seniority} />
        </div>
        <p className="text-xs text-muted-foreground">{contact.role}</p>
        {contact.notes && (
          <p className="text-xs text-muted-foreground leading-relaxed">{contact.notes}</p>
        )}
        <div className="flex gap-2 mt-1.5">
          {contact.linkedinUrl && (
            <a
              href={contact.linkedinUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Linkedin className="h-3 w-3" />
              LinkedIn
            </a>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Mail className="h-3 w-3" />
              Email
            </a>
          )}
        </div>
      </div>
      {/* Edit / delete — always visible on mobile, hover on desktop */}
      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onEdit(contact)}
          aria-label="Edit contact"
          className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(contact)}
          aria-label="Delete contact"
          className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ---- main component ------------------------------------------------------

export function FamilyOfficeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fo = useFO(id)
  const foContacts = useContactsForFO(id ?? '')
  const isFav = useIsFavorite(id ?? '')
  const isEdited = useIsEdited(id ?? '')
  const isCreated = useIsCreated(id ?? '')
  const isSeed = id ? seedIdSet.has(id) : false

  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const deleteFO = useStore((s) => s.deleteFO)
  const deleteContact = useStore((s) => s.deleteContact)

  const [editFOOpen, setEditFOOpen] = useState(false)
  const [deleteFOOpen, setDeleteFOOpen] = useState(false)
  const [addContactOpen, setAddContactOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null)

  if (!fo) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="text-4xl text-muted-foreground/20 select-none">
          <Building2 className="mx-auto h-12 w-12" />
        </div>
        <p className="text-lg font-semibold text-foreground">Family office not found.</p>
        <p className="text-sm text-muted-foreground">
          No record exists for{' '}
          <code className="bg-muted rounded px-1.5 py-0.5 text-xs font-mono">{id}</code>.
        </p>
        <Button variant="outline" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to list
          </Link>
        </Button>
      </div>
    )
  }

  function handleDeleteFO() {
    if (!id) return
    deleteFO(id)
    navigate('/')
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All family offices
      </Link>

      {/* Hero */}
      <div className="space-y-4">
        {/* Name + badges + actions */}
        <div>
          <div className="flex items-start gap-3">
            <h1 className="text-3xl font-bold text-foreground tracking-tight leading-tight flex-1">
              {fo.name}
            </h1>
            {/* Star */}
            <button
              onClick={() => toggleFavorite(fo.id)}
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
              className={cn(
                'mt-1 rounded-md p-1.5 transition-colors',
                isFav
                  ? 'text-amber-400 hover:text-amber-500 hover:bg-amber-400/10'
                  : 'text-muted-foreground hover:text-amber-400 hover:bg-muted'
              )}
            >
              <Star className={cn('h-5 w-5', isFav && 'fill-current')} />
            </button>
            {/* Edit pencil */}
            <button
              onClick={() => setEditFOOpen(true)}
              aria-label="Edit family office"
              className="mt-1 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
            {/* Kebab menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="More options"
                  className="mt-1 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditFOOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteFOOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isSeed ? 'Hide from list' : 'Delete permanently'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={fo.status} />
            <ConfidenceBadge confidence={fo.confidence} />
            {isEdited && !isCreated && (
              <Badge variant="muted" className="text-[10px]">
                Edited
              </Badge>
            )}
            {isCreated && (
              <Badge variant="muted" className="text-[10px]">
                User-created
              </Badge>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-muted-foreground/60" />
            {fo.family} Family
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-muted-foreground/60" />
            {countryFlag(fo.country) && (
              <span className="mr-0.5">{countryFlag(fo.country)}</span>
            )}
            {fo.city}{fo.city && fo.country ? ', ' : ''}{fo.country}
          </span>
          {fo.lastKnownActivityYear && (
            <span className="flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4 text-muted-foreground/60" />
              Last tracked activity: {fo.lastKnownActivityYear}
            </span>
          )}
        </div>

        {/* AUM */}
        <div>
          {fo.estAumUsd !== null ? (
            <p className="text-2xl font-semibold text-foreground font-mono tabular-nums">
              {formatAum(fo.estAumUsd)}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">AUM not disclosed</p>
          )}
        </div>

        {/* Tags */}
        {fo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {fo.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Content sections */}
      <div className="space-y-4">

        {/* LP Positions */}
        <Section title="LP Positions">
          {fo.lpActivityNotes ? (
            <p className="text-sm text-foreground leading-relaxed">{fo.lpActivityNotes}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No LP-in-VC-fund activity in public sources.
            </p>
          )}
          <p className="mt-4 text-xs text-muted-foreground border-t border-border pt-3">
            Structured LP fund tracking coming in Sprint 4.
          </p>
        </Section>

        {/* Direct VC Investments */}
        <Section title="Direct VC Investments">
          {fo.directInvestNotes ? (
            <p className="text-sm text-foreground leading-relaxed">{fo.directInvestNotes}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No direct VC investment data in public sources.
            </p>
          )}
          <p className="mt-4 text-xs text-muted-foreground border-t border-border pt-3">
            Structured deal tracking coming in Sprint 4.
          </p>
        </Section>

        {/* Contacts */}
        <Section title="Contacts" icon={Users}>
          {foContacts.length > 0 ? (
            <div className="-mt-1">
              {foContacts.map((c) => (
                <ContactCard
                  key={c.id}
                  contact={c}
                  onEdit={(contact) => setEditingContact(contact)}
                  onDelete={(contact) => setDeletingContact(contact)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic mb-4">
              No contacts yet.
            </p>
          )}
          <div className={foContacts.length > 0 ? 'mt-3' : ''}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddContactOpen(true)}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Add contact
            </Button>
          </div>
        </Section>

        {/* Sources */}
        {fo.sourceUrls.length > 0 && (
          <Section title="Sources">
            <div className="flex flex-wrap gap-2">
              {fo.sourceUrls.map((url) => (
                <FaviconChip key={url} url={url} />
              ))}
            </div>
          </Section>
        )}

        {/* Interactions & Tasks — Sprint 5 placeholder */}
        <Section title="Interactions &amp; Tasks">
          <p className="text-sm text-muted-foreground italic">Coming in Sprint 5.</p>
        </Section>
      </div>

      {/* Edit FO dialog */}
      <FODialog
        open={editFOOpen}
        onOpenChange={setEditFOOpen}
        mode="edit"
        initial={fo}
      />

      {/* Delete FO confirm */}
      <ConfirmDialog
        open={deleteFOOpen}
        onOpenChange={setDeleteFOOpen}
        title={isSeed ? 'Hide this family office?' : 'Delete this family office?'}
        description={
          isSeed
            ? 'This seed entry will be hidden from the list. You can restore it from the list view or Settings.'
            : 'This user-created record will be permanently deleted.'
        }
        confirmLabel={isSeed ? 'Hide' : 'Delete'}
        destructive
        onConfirm={handleDeleteFO}
      />

      {/* Add contact dialog */}
      <ContactDialog
        open={addContactOpen}
        onOpenChange={setAddContactOpen}
        mode="create"
        familyOfficeId={fo.id}
      />

      {/* Edit contact dialog */}
      {editingContact && (
        <ContactDialog
          open={!!editingContact}
          onOpenChange={(open) => { if (!open) setEditingContact(null) }}
          mode="edit"
          familyOfficeId={fo.id}
          initial={editingContact}
        />
      )}

      {/* Delete contact confirm */}
      {deletingContact && (
        <ConfirmDialog
          open={!!deletingContact}
          onOpenChange={(open) => { if (!open) setDeletingContact(null) }}
          title="Delete contact?"
          description={`Remove ${deletingContact.name} from this family office?`}
          confirmLabel="Delete"
          destructive
          onConfirm={() => deleteContact(deletingContact.id)}
        />
      )}
    </div>
  )
}
