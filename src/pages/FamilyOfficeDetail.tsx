import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, MapPin, Building2 } from 'lucide-react'
import { familyOffices } from '@/data/familyOffices'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatAum } from '@/lib/utils'

function ConfidenceBadge({ confidence }: { confidence: 'rumored' | 'confirmed' | 'public' }) {
  if (confidence === 'public') return <Badge variant="success">Public</Badge>
  if (confidence === 'confirmed') return <Badge variant="default">Confirmed</Badge>
  return <Badge variant="outline">Rumored</Badge>
}

function StatusBadge({ status }: { status: 'active' | 'dormant' | 'unknown' }) {
  if (status === 'active') return <Badge variant="success">Active</Badge>
  if (status === 'dormant') return <Badge variant="warning">Dormant</Badge>
  return <Badge variant="muted">Unknown</Badge>
}

const PLACEHOLDER_SECTIONS: { title: string; sprint: string }[] = [
  { title: 'Contacts', sprint: 'Sprint 3' },
  { title: 'LP Positions', sprint: 'Sprint 4' },
  { title: 'Direct Investments', sprint: 'Sprint 4' },
  { title: 'Interactions & Tasks', sprint: 'Sprint 5' },
]

export function FamilyOfficeDetail() {
  const { id } = useParams<{ id: string }>()
  const fo = familyOffices.find((f) => f.id === id)

  if (!fo) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-lg font-semibold text-slate-700">Family office not found.</p>
        <p className="text-sm text-slate-500">
          No record exists for ID <code className="bg-slate-100 rounded px-1.5 py-0.5 text-xs">{id}</code>.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 underline underline-offset-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All family offices
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{fo.name}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={fo.status} />
            <ConfidenceBadge confidence={fo.confidence} />
          </div>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-600">
          <span className="flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-slate-400" />
            {fo.family} Family
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-slate-400" />
            {fo.city}, {fo.country}
          </span>
          <span className="font-mono font-medium text-slate-700">
            AUM: {formatAum(fo.estAumUsd)}
          </span>
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

      {/* Summary */}
      <div className="rounded-lg border border-border bg-slate-50 px-4 py-4">
        <p className="text-sm text-slate-700 leading-relaxed">{fo.summary}</p>
        {fo.sourceUrl && (
          <a
            href={fo.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2"
          >
            Source
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLACEHOLDER_SECTIONS.map((section) => (
          <Card key={section.title} className="opacity-60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Coming in {section.sprint}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
