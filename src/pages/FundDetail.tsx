import { useState, lazy, Suspense } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Building2, Pencil, Trash2, MoreVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FaviconChip } from '@/components/FaviconChip'
import { ConfirmDialog } from '@/components/ConfirmDialog'

const FundDialog = lazy(() =>
  import('@/components/FundDialog').then((m) => ({ default: m.FundDialog }))
)
import { formatUsd, formatDate, cn } from '@/lib/utils'
import {
  useFund,
  useLPPositionsForFund,
  useStore,
  useAllFOs,
} from '@/lib/store'
import type { FundStatus } from '@/data/familyOffices'

function FundStatusBadge({ status }: { status: FundStatus }) {
  if (status === 'raising')
    return (
      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
        Raising
      </Badge>
    )
  if (status === 'closed') return <Badge variant="muted">Closed</Badge>
  if (status === 'evergreen')
    return (
      <Badge className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
        Evergreen
      </Badge>
    )
  return <Badge variant="warning">Fully deployed</Badge>
}

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

function ConfidenceDot({ confidence }: { confidence: 'rumored' | 'confirmed' | 'public' }) {
  const cls =
    confidence === 'public'
      ? 'bg-emerald-500'
      : confidence === 'confirmed'
      ? 'bg-amber-400'
      : 'bg-slate-400'
  return (
    <span title={confidence} className={cn('inline-block h-2 w-2 rounded-full shrink-0 mt-1', cls)} />
  )
}

export function FundDetail() {
  const { id } = useParams<{ id: string }>()
  const fund = useFund(id)
  const lpPositions = useLPPositionsForFund(id ?? '')
  const allFOs = useAllFOs()
  const deleteFund = useStore((s) => s.deleteFund)

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (!fund) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="text-4xl text-muted-foreground/20 select-none">
          <Building2 className="mx-auto h-12 w-12" />
        </div>
        <p className="text-lg font-semibold text-foreground">Fund not found.</p>
        <p className="text-sm text-muted-foreground">
          No record exists for{' '}
          <code className="bg-muted rounded px-1.5 py-0.5 text-xs font-mono">{id}</code>.
        </p>
        <Button variant="outline" asChild>
          <Link to="/funds">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to funds
          </Link>
        </Button>
      </div>
    )
  }

  // Build FO lookup for LP rows
  const foById = Object.fromEntries(allFOs.map((fo) => [fo.id, fo]))

  function handleDelete() {
    if (!id) return
    deleteFund(id)
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Back */}
      <Link
        to="/funds"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All funds
      </Link>

      {/* Hero */}
      <div className="space-y-4">
        <div>
          <div className="flex items-start gap-3">
            <h1 className="text-3xl font-bold text-foreground tracking-tight leading-tight flex-1">
              {fund.name}
            </h1>
            <button
              onClick={() => setEditOpen(true)}
              aria-label="Edit fund"
              className="mt-1 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
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
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit fund
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hide / delete fund
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <FundStatusBadge status={fund.status} />
            <ConfidenceBadge confidence={fund.confidence} />
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span>
            <span className="text-muted-foreground">GP: </span>
            <span className="text-foreground font-medium">{fund.gpFirm}</span>
          </span>
          {fund.vintageYear && (
            <span>
              <span className="text-muted-foreground">Vintage: </span>
              <span className="text-foreground font-medium">{fund.vintageYear}</span>
            </span>
          )}
          {fund.targetSizeUsd !== null && (
            <span>
              <span className="text-muted-foreground">Target: </span>
              <span className="text-foreground font-mono font-medium">
                {formatUsd(fund.targetSizeUsd)}
              </span>
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {fund.geographyFocus.map((g) => (
            <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>
          ))}
          {fund.sectorFocus.map((s) => (
            <Badge key={s} variant="outline" className="text-xs text-muted-foreground">{s}</Badge>
          ))}
        </div>
      </div>

      {/* Known LP investors */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-foreground">
            Known LP investors
            {lpPositions.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({lpPositions.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lpPositions.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No LP investors tracked for this fund yet.
            </p>
          ) : (
            <div className="-mt-1">
              {lpPositions.map((lp) => {
                const fo = foById[lp.familyOfficeId]
                return (
                  <div
                    key={lp.id}
                    className="flex items-start gap-3 py-3 border-b border-border last:border-0"
                  >
                    <ConfidenceDot confidence={lp.confidence} />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {fo ? (
                          <Link
                            to={`/fo/${fo.id}`}
                            className="text-sm font-medium text-primary hover:underline underline-offset-2"
                          >
                            {fo.name}
                          </Link>
                        ) : (
                          <span className="text-sm font-medium text-foreground">
                            {lp.familyOfficeId}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>
                          Commitment:{' '}
                          <span className="text-foreground font-mono">
                            {lp.commitmentAmountUsd !== null
                              ? formatUsd(lp.commitmentAmountUsd)
                              : '—'}
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
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {fund.notes && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">{fund.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Sources */}
      {fund.sourceUrls.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground">Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {fund.sourceUrls.map((url) => (
                <FaviconChip key={url} url={url} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit dialog — lazy loaded */}
      {editOpen && (
        <Suspense fallback={null}>
          <FundDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            mode="edit"
            initial={fund}
          />
        </Suspense>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hide / delete this fund?"
        description="Seed funds will be hidden from the list. User-created funds will be deleted permanently."
        confirmLabel="Delete / Hide"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}
