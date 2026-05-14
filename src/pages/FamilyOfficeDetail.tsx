import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Building2,
  Linkedin,
  Mail,
  CalendarClock,
  Users,
} from 'lucide-react'
import { familyOffices, contacts, type Contact } from '@/data/familyOffices'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatAum, countryFlag, urlHostname, cn } from '@/lib/utils'

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

function ContactCard({ contact }: { contact: Contact }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
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
    </div>
  )
}

// ---- main component ------------------------------------------------------

export function FamilyOfficeDetail() {
  const { id } = useParams<{ id: string }>()
  const fo = familyOffices.find((f) => f.id === id)

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

  const foContacts = contacts.filter((c) => c.familyOfficeId === fo.id)

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
        {/* Name + badges */}
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight leading-tight">
            {fo.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={fo.status} />
            <ConfidenceBadge confidence={fo.confidence} />
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
            {fo.city}, {fo.country}
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
        <div className="flex flex-wrap gap-1.5">
          {fo.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
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
                <ContactCard key={c.id} contact={c} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Contacts coming with the research drop.
            </p>
          )}
        </Section>

        {/* Sources */}
        {fo.sourceUrls.length > 0 && (
          <Section title="Sources">
            <div className="flex flex-wrap gap-2">
              {fo.sourceUrls.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-foreground hover:bg-muted hover:border-foreground/20 transition-colors"
                >
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  {urlHostname(url)}
                </a>
              ))}
            </div>
          </Section>
        )}

        {/* Interactions & Tasks — Sprint 5 placeholder */}
        <Section title="Interactions &amp; Tasks">
          <p className="text-sm text-muted-foreground italic">Coming in Sprint 5.</p>
        </Section>
      </div>
    </div>
  )
}
