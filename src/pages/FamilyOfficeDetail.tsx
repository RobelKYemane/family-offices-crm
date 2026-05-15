import { useState, useEffect } from 'react'
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
  TrendingUp,
  Layers,
  Calendar,
  Phone,
  UserPlus,
  StickyNote,
  Hash,
  MessageSquare,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { familyOffices as seedFOs } from '@/data/familyOffices'
import type { Contact, LPPosition, DirectInvestment, Interaction, Task, InteractionType } from '@/data/familyOffices'
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
import { LPPositionDialog } from '@/components/LPPositionDialog'
import { DirectInvestmentDialog } from '@/components/DirectInvestmentDialog'
import { InteractionDialog } from '@/components/InteractionDialog'
import { TaskDialog } from '@/components/TaskDialog'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { formatAum, formatUsd, formatDate, countryFlag, cn } from '@/lib/utils'
import {
  useFO,
  useContactsForFO,
  useIsFavorite,
  useIsEdited,
  useIsCreated,
  useStore,
  useLPPositionsForFO,
  useDirectInvestmentsForFO,
  useFund,
  useInteractionsForFO,
  useTasksForFO,
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

// ---- interaction helpers -------------------------------------------------

function interactionTypeIcon(type: InteractionType): React.ElementType {
  switch (type) {
    case 'meeting': return Calendar
    case 'call': return Phone
    case 'email': return Mail
    case 'intro': return UserPlus
    case 'note': return StickyNote
    default: return Hash
  }
}

function interactionTypeLabel(type: InteractionType): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dueDateColor(dueDate: string | null, done: boolean): string {
  if (done || !dueDate) return 'text-muted-foreground'
  const today = todayISO()
  if (dueDate < today) return 'text-red-500 dark:text-red-400 font-medium'
  const diff =
    (new Date(dueDate + 'T00:00:00').getTime() - new Date(today + 'T00:00:00').getTime()) /
    (1000 * 60 * 60 * 24)
  if (diff <= 3) return 'text-amber-500 dark:text-amber-400 font-medium'
  return 'text-muted-foreground'
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

// ---- LP position row ─────────────────────────────────────────────────────

function LPPositionRow({
  lp,
  onEdit,
  onDelete,
}: {
  lp: LPPosition
  onEdit: (l: LPPosition) => void
  onDelete: (l: LPPosition) => void
}) {
  const fund = useFund(lp.fundId)

  return (
    <div className="group flex items-start gap-3 py-3 border-b border-border last:border-0">
      <ConfidenceDot confidence={lp.confidence} />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          {fund ? (
            <Link
              to={`/funds/${fund.id}`}
              className="text-sm font-medium text-primary hover:underline underline-offset-2"
              onClick={(e) => e.stopPropagation()}
            >
              {fund.name}
            </Link>
          ) : (
            <span className="text-sm font-medium text-foreground">{lp.fundId}</span>
          )}
          {fund && (
            <span className="text-xs text-muted-foreground">{fund.gpFirm}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>
            Commitment:{' '}
            <span className="text-foreground font-mono">
              {lp.commitmentAmountUsd !== null ? formatUsd(lp.commitmentAmountUsd) : '—'}
            </span>
          </span>
          <span>
            Date:{' '}
            <span className="text-foreground">{formatDate(lp.commitmentDate)}</span>
          </span>
        </div>
        {lp.notes && (
          <p className="text-xs text-muted-foreground leading-relaxed">{lp.notes}</p>
        )}
        {lp.sourceUrls.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {lp.sourceUrls.map((url) => (
              <FaviconChip key={url} url={url} />
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onEdit(lp)}
          aria-label="Edit LP position"
          className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(lp)}
          aria-label="Delete LP position"
          className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ---- Direct investment row ───────────────────────────────────────────────

function DirectInvestmentRow({
  di,
  onEdit,
  onDelete,
}: {
  di: DirectInvestment
  onEdit: (d: DirectInvestment) => void
  onDelete: (d: DirectInvestment) => void
}) {
  return (
    <div className="group flex items-start gap-3 py-3 border-b border-border last:border-0">
      <ConfidenceDot confidence={di.confidence} />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">{di.companyName}</span>
          {di.sector && (
            <Badge variant="secondary" className="text-[10px]">{di.sector}</Badge>
          )}
          {di.stage && (
            <Badge variant="outline" className="text-[10px] text-muted-foreground">{di.stage}</Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {di.checkSizeUsd !== null && (
            <span>
              Check:{' '}
              <span className="text-foreground font-mono">{formatUsd(di.checkSizeUsd)}</span>
            </span>
          )}
          {di.roundSizeUsd !== null && (
            <span>
              Round:{' '}
              <span className="text-foreground font-mono">{formatUsd(di.roundSizeUsd)}</span>
            </span>
          )}
          {di.dealDate && (
            <span>
              Date:{' '}
              <span className="text-foreground">{formatDate(di.dealDate)}</span>
            </span>
          )}
        </div>
        {di.notes && (
          <p className="text-xs text-muted-foreground leading-relaxed">{di.notes}</p>
        )}
        {di.sourceUrls.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {di.sourceUrls.map((url) => (
              <FaviconChip key={url} url={url} />
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onEdit(di)}
          aria-label="Edit investment"
          className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(di)}
          aria-label="Delete investment"
          className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ---- interaction row ─────────────────────────────────────────────────────

function InteractionRow({
  interaction,
  contactName,
  onEdit,
  onDelete,
}: {
  interaction: Interaction
  contactName: string | null
  onEdit: (i: Interaction) => void
  onDelete: (i: Interaction) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const TypeIcon = interactionTypeIcon(interaction.type)

  return (
    <div className="group py-3 border-b border-border last:border-0">
      <div className="flex items-start gap-3">
        {/* Type chip + icon */}
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground shrink-0 mt-0.5">
          <TypeIcon className="h-2.5 w-2.5" />
          {interactionTypeLabel(interaction.type)}
        </span>

        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">
              {formatDate(interaction.date)}
            </span>
            {contactName && (
              <span className="text-xs text-muted-foreground">
                &middot; {contactName}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-foreground leading-snug">{interaction.summary}</p>
          {interaction.notes && (
            <div>
              <p
                className={cn(
                  'text-xs text-muted-foreground leading-relaxed',
                  !expanded && 'line-clamp-2'
                )}
              >
                {interaction.notes}
              </p>
              {interaction.notes.length > 100 && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="text-xs text-primary hover:underline underline-offset-2 mt-0.5 inline-flex items-center gap-0.5"
                >
                  {expanded ? (
                    <>Show less <ChevronUp className="h-3 w-3" /></>
                  ) : (
                    <>Show more <ChevronDown className="h-3 w-3" /></>
                  )}
                </button>
              )}
            </div>
          )}
          {interaction.followUpAt && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Follow-up: {formatDate(interaction.followUpAt)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(interaction)}
            aria-label="Edit interaction"
            className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(interaction)}
            aria-label="Delete interaction"
            className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- task row ────────────────────────────────────────────────────────────

function TaskRow({
  task,
  onEdit,
  onDelete,
  onToggle,
}: {
  task: Task
  onEdit: (t: Task) => void
  onDelete: (t: Task) => void
  onToggle: (id: string) => void
}) {
  const dateColor = dueDateColor(task.dueDate, task.done)
  return (
    <div className="group flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <button
        onClick={() => onToggle(task.id)}
        aria-label={task.done ? 'Mark as open' : 'Mark as done'}
        className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors"
      >
        {task.done ? (
          <CheckSquare className="h-4 w-4 text-primary" />
        ) : (
          <Square className="h-4 w-4" />
        )}
      </button>

      <div className="flex-1 min-w-0 space-y-0.5">
        <p
          className={cn(
            'text-sm font-medium text-foreground',
            task.done && 'line-through text-muted-foreground'
          )}
        >
          {task.title}
        </p>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs">
          {task.dueDate && (
            <span className={dateColor}>Due {formatDate(task.dueDate)}</span>
          )}
          {task.done && task.doneAt && (
            <span className="text-muted-foreground">
              Done{' '}
              {new Date(task.doneAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
        </div>
        {task.notes && (
          <p className="text-xs text-muted-foreground leading-relaxed">{task.notes}</p>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onEdit(task)}
          aria-label="Edit task"
          className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(task)}
          aria-label="Delete task"
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
  const lpPositions = useLPPositionsForFO(id ?? '')
  const directInvestments = useDirectInvestmentsForFO(id ?? '')
  const interactions = useInteractionsForFO(id ?? '')
  const tasks = useTasksForFO(id ?? '')
  const isFav = useIsFavorite(id ?? '')
  const isEdited = useIsEdited(id ?? '')
  const isCreated = useIsCreated(id ?? '')
  const isSeed = id ? seedIdSet.has(id) : false

  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const deleteFO = useStore((s) => s.deleteFO)
  const deleteContact = useStore((s) => s.deleteContact)
  const deleteLPPosition = useStore((s) => s.deleteLPPosition)
  const deleteDirectInvestment = useStore((s) => s.deleteDirectInvestment)
  const deleteInteraction = useStore((s) => s.deleteInteraction)
  const deleteTask = useStore((s) => s.deleteTask)
  const toggleTaskDone = useStore((s) => s.toggleTaskDone)

  const [editFOOpen, setEditFOOpen] = useState(false)
  const [deleteFOOpen, setDeleteFOOpen] = useState(false)
  const [addContactOpen, setAddContactOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null)

  // LP dialog state
  const [addLPOpen, setAddLPOpen] = useState(false)
  const [editingLP, setEditingLP] = useState<LPPosition | null>(null)
  const [deletingLP, setDeletingLP] = useState<LPPosition | null>(null)

  // DI dialog state
  const [addDIOpen, setAddDIOpen] = useState(false)
  const [editingDI, setEditingDI] = useState<DirectInvestment | null>(null)
  const [deletingDI, setDeletingDI] = useState<DirectInvestment | null>(null)

  // Interaction dialog state
  const [addInteractionOpen, setAddInteractionOpen] = useState(false)
  const [addInteractionType, setAddInteractionType] = useState<InteractionType>('meeting')
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null)
  const [deletingInteraction, setDeletingInteraction] = useState<Interaction | null>(null)

  // Task dialog state
  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)

  // Keyboard shortcut "n" — quick note
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'n') return
      const target = e.target as HTMLElement
      const tag = target.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable) return
      // Don't fire if a dialog is already open
      if (document.querySelector('[role="dialog"]')) return
      e.preventDefault()
      setAddInteractionType('note')
      setAddInteractionOpen(true)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
        <Section title="LP Positions" icon={Layers}>
          {/* Free-text notes (legacy) */}
          {fo.lpActivityNotes ? (
            <p className="text-sm text-foreground leading-relaxed">{fo.lpActivityNotes}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No LP-in-VC-fund activity in public sources.
            </p>
          )}

          {/* Structured LP commitments */}
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Structured LP commitments
            </h3>
            {lpPositions.length > 0 ? (
              <div className="-mt-1">
                {lpPositions.map((lp) => (
                  <LPPositionRow
                    key={lp.id}
                    lp={lp}
                    onEdit={(l) => setEditingLP(l)}
                    onDelete={(l) => setDeletingLP(l)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic mb-3">
                No structured LP commitments tracked yet.
              </p>
            )}
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddLPOpen(true)}
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add LP position
              </Button>
            </div>
          </div>
        </Section>

        {/* Direct VC Investments */}
        <Section title="Direct VC Investments" icon={TrendingUp}>
          {/* Free-text notes (legacy) */}
          {fo.directInvestNotes ? (
            <p className="text-sm text-foreground leading-relaxed">{fo.directInvestNotes}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No direct VC investment data in public sources.
            </p>
          )}

          {/* Structured deals */}
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Structured deals
            </h3>
            {directInvestments.length > 0 ? (
              <div className="-mt-1">
                {directInvestments.map((di) => (
                  <DirectInvestmentRow
                    key={di.id}
                    di={di}
                    onEdit={(d) => setEditingDI(d)}
                    onDelete={(d) => setDeletingDI(d)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic mb-3">
                No structured deals tracked yet.
              </p>
            )}
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddDIOpen(true)}
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add deal
              </Button>
            </div>
          </div>
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

        {/* Interactions — Sprint 5 */}
        <Section title="Interactions" icon={MessageSquare}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground">
              Press <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-mono">n</kbd> to quick-log a note.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAddInteractionType('meeting')
                setAddInteractionOpen(true)
              }}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>

          {interactions.length > 0 ? (
            <div className="-mt-1">
              {interactions.map((interaction) => {
                const contact = foContacts.find((c) => c.id === interaction.contactId)
                return (
                  <InteractionRow
                    key={interaction.id}
                    interaction={interaction}
                    contactName={contact?.name ?? null}
                    onEdit={(i) => setEditingInteraction(i)}
                    onDelete={(i) => setDeletingInteraction(i)}
                  />
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No interactions logged yet. Press 'n' or click + Add to log your first.
            </p>
          )}
        </Section>

        {/* Tasks — Sprint 5 */}
        <Section title="Tasks" icon={CheckSquare}>
          <div className="flex items-center justify-between mb-3">
            <span />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddTaskOpen(true)}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>

          {tasks.length > 0 ? (() => {
            // Sort: open first by dueDate asc (undated last), then done by doneAt desc (cap at 5)
            const open = tasks
              .filter((t) => !t.done)
              .sort((a, b) => {
                if (!a.dueDate && !b.dueDate) return 0
                if (!a.dueDate) return 1
                if (!b.dueDate) return -1
                return a.dueDate.localeCompare(b.dueDate)
              })
            const done = tasks
              .filter((t) => t.done)
              .sort((a, b) => (b.doneAt ?? '').localeCompare(a.doneAt ?? ''))
              .slice(0, 5)
            return (
              <div className="-mt-1">
                {[...open, ...done].map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onEdit={(t) => setEditingTask(t)}
                    onDelete={(t) => setDeletingTask(t)}
                    onToggle={toggleTaskDone}
                  />
                ))}
              </div>
            )
          })() : (
            <p className="text-sm text-muted-foreground italic">No tasks yet.</p>
          )}
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

      {/* Add LP position dialog */}
      <LPPositionDialog
        open={addLPOpen}
        onOpenChange={setAddLPOpen}
        mode="create"
        familyOfficeId={fo.id}
      />

      {/* Edit LP position dialog */}
      {editingLP && (
        <LPPositionDialog
          open={!!editingLP}
          onOpenChange={(open) => { if (!open) setEditingLP(null) }}
          mode="edit"
          familyOfficeId={fo.id}
          initial={editingLP}
        />
      )}

      {/* Delete LP position confirm */}
      {deletingLP && (
        <ConfirmDialog
          open={!!deletingLP}
          onOpenChange={(open) => { if (!open) setDeletingLP(null) }}
          title="Delete LP commitment?"
          description="This LP commitment record will be removed."
          confirmLabel="Delete"
          destructive
          onConfirm={() => deleteLPPosition(deletingLP.id)}
        />
      )}

      {/* Add direct investment dialog */}
      <DirectInvestmentDialog
        open={addDIOpen}
        onOpenChange={setAddDIOpen}
        mode="create"
        familyOfficeId={fo.id}
      />

      {/* Edit direct investment dialog */}
      {editingDI && (
        <DirectInvestmentDialog
          open={!!editingDI}
          onOpenChange={(open) => { if (!open) setEditingDI(null) }}
          mode="edit"
          familyOfficeId={fo.id}
          initial={editingDI}
        />
      )}

      {/* Delete direct investment confirm */}
      {deletingDI && (
        <ConfirmDialog
          open={!!deletingDI}
          onOpenChange={(open) => { if (!open) setDeletingDI(null) }}
          title="Delete investment?"
          description={`Remove the ${deletingDI.companyName} deal from this family office?`}
          confirmLabel="Delete"
          destructive
          onConfirm={() => deleteDirectInvestment(deletingDI.id)}
        />
      )}

      {/* Add interaction dialog */}
      <InteractionDialog
        open={addInteractionOpen}
        onOpenChange={setAddInteractionOpen}
        mode="create"
        familyOfficeId={fo.id}
        defaultType={addInteractionType}
      />

      {/* Edit interaction dialog */}
      {editingInteraction && (
        <InteractionDialog
          open={!!editingInteraction}
          onOpenChange={(open) => { if (!open) setEditingInteraction(null) }}
          mode="edit"
          familyOfficeId={fo.id}
          initial={editingInteraction}
        />
      )}

      {/* Delete interaction confirm */}
      {deletingInteraction && (
        <ConfirmDialog
          open={!!deletingInteraction}
          onOpenChange={(open) => { if (!open) setDeletingInteraction(null) }}
          title="Delete interaction?"
          description={`Remove "${deletingInteraction.summary}"?`}
          confirmLabel="Delete"
          destructive
          onConfirm={() => deleteInteraction(deletingInteraction.id)}
        />
      )}

      {/* Add task dialog */}
      <TaskDialog
        open={addTaskOpen}
        onOpenChange={setAddTaskOpen}
        mode="create"
        familyOfficeId={fo.id}
      />

      {/* Edit task dialog */}
      {editingTask && (
        <TaskDialog
          open={!!editingTask}
          onOpenChange={(open) => { if (!open) setEditingTask(null) }}
          mode="edit"
          familyOfficeId={fo.id}
          initial={editingTask}
        />
      )}

      {/* Delete task confirm */}
      {deletingTask && (
        <ConfirmDialog
          open={!!deletingTask}
          onOpenChange={(open) => { if (!open) setDeletingTask(null) }}
          title="Delete task?"
          description={`Remove "${deletingTask.title}"?`}
          confirmLabel="Delete"
          destructive
          onConfirm={() => deleteTask(deletingTask.id)}
        />
      )}
    </div>
  )
}
