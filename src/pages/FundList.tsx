import { useState, useMemo, lazy, Suspense } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, X, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatUsd, cn } from '@/lib/utils'
import { useAllFunds, useAllLPPositions } from '@/lib/store'
import type { Fund, FundStatus } from '@/data/familyOffices'

const FundDialog = lazy(() =>
  import('@/components/FundDialog').then((m) => ({ default: m.FundDialog }))
)

function FundStatusBadge({ status }: { status: FundStatus }) {
  if (status === 'raising')
    return <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px]">Raising</Badge>
  if (status === 'closed')
    return <Badge variant="muted" className="text-[11px]">Closed</Badge>
  if (status === 'evergreen')
    return <Badge className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[11px]">Evergreen</Badge>
  return <Badge variant="warning" className="text-[11px]">Fully deployed</Badge>
}

function ConfidenceDot({ confidence }: { confidence: Fund['confidence'] }) {
  const cls =
    confidence === 'public'
      ? 'bg-emerald-500'
      : confidence === 'confirmed'
      ? 'bg-amber-400'
      : 'bg-slate-400'
  return (
    <span title={confidence} className={cn('inline-block h-2 w-2 rounded-full shrink-0', cls)} />
  )
}

export function FundList() {
  const navigate = useNavigate()
  const allFunds = useAllFunds()
  const allLPs = useAllLPPositions()
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<FundStatus | ''>('')
  const [newFundOpen, setNewFundOpen] = useState(false)

  // Precompute LP count per fund
  const lpCountByFund = useMemo(() => {
    const map: Record<string, Set<string>> = {}
    for (const lp of allLPs) {
      if (!map[lp.fundId]) map[lp.fundId] = new Set()
      map[lp.fundId].add(lp.familyOfficeId)
    }
    return map
  }, [allLPs])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return allFunds.filter((f) => {
      if (
        q &&
        !f.name.toLowerCase().includes(q) &&
        !f.gpFirm.toLowerCase().includes(q)
      ) return false
      if (selectedStatus && f.status !== selectedStatus) return false
      return true
    })
  }, [allFunds, search, selectedStatus])

  const statuses: FundStatus[] = ['raising', 'closed', 'evergreen', 'fully-deployed']
  const hasFilters = !!search || !!selectedStatus

  function clearFilters() {
    setSearch('')
    setSelectedStatus('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Funds</h1>
          <span className="text-sm text-muted-foreground tabular-nums">
            {filtered.length} of {allFunds.length}
          </span>
        </div>
        <Button size="sm" onClick={() => setNewFundOpen(true)} className="h-8 gap-1.5 px-3 text-xs">
          <Plus className="h-3.5 w-3.5" />
          New Fund
        </Button>
      </div>

      {/* Search + status filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search by fund name or GP firm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Status:</span>
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(selectedStatus === st ? '' : st)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
                selectedStatus === st
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
              )}
            >
              {st.replace('-', ' ')}
            </button>
          ))}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table — desktop */}
      <div className="hidden md:block">
        {filtered.length === 0 ? (
          <EmptyState onClear={hasFilters ? clearFilters : undefined} />
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground w-[28%]">Name</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">GP Firm</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Vintage</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Target</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Geography</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground"># LPs</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Conf.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((fund) => {
                  const lpCount = lpCountByFund[fund.id]?.size ?? 0
                  return (
                    <tr
                      key={fund.id}
                      onClick={() => navigate(`/funds/${fund.id}`)}
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') navigate(`/funds/${fund.id}`)
                      }}
                      className="cursor-pointer hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{fund.name}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{fund.gpFirm}</td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">
                        {fund.vintageYear ?? '—'}
                      </td>
                      <td className="px-4 py-3 font-mono tabular-nums text-foreground/80 text-sm">
                        {formatUsd(fund.targetSizeUsd)}
                      </td>
                      <td className="px-4 py-3">
                        <FundStatusBadge status={fund.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {fund.geographyFocus.slice(0, 3).map((g) => (
                            <Badge key={g} variant="secondary" className="text-[10px]">{g}</Badge>
                          ))}
                          {fund.geographyFocus.length > 3 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{fund.geographyFocus.length - 3}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center tabular-nums text-foreground/80">
                        {lpCount > 0 ? (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {lpCount}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <ConfidenceDot confidence={fund.confidence} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden">
        {filtered.length === 0 ? (
          <EmptyState onClear={hasFilters ? clearFilters : undefined} />
        ) : (
          <div className="space-y-2">
            {filtered.map((fund) => {
              const lpCount = lpCountByFund[fund.id]?.size ?? 0
              return (
                <Link
                  key={fund.id}
                  to={`/funds/${fund.id}`}
                  className="block rounded-lg border border-border bg-card p-4 hover:border-primary/40 hover:bg-muted/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm leading-snug">{fund.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{fund.gpFirm}</p>
                    </div>
                    <FundStatusBadge status={fund.status} />
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    {fund.vintageYear && <span>Vintage {fund.vintageYear}</span>}
                    {fund.targetSizeUsd !== null && (
                      <span className="font-mono">{formatUsd(fund.targetSizeUsd)}</span>
                    )}
                    {lpCount > 0 && <span>{lpCount} LP{lpCount > 1 ? 's' : ''}</span>}
                  </div>
                  {fund.geographyFocus.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {fund.geographyFocus.map((g) => (
                        <Badge key={g} variant="secondary" className="text-[10px]">{g}</Badge>
                      ))}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {newFundOpen && (
        <Suspense fallback={null}>
          <FundDialog
            open={newFundOpen}
            onOpenChange={setNewFundOpen}
            mode="create"
          />
        </Suspense>
      )}
    </div>
  )
}

function EmptyState({ onClear }: { onClear?: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-border py-20 text-center space-y-3">
      <p className="text-sm font-medium text-muted-foreground">No funds match your filters.</p>
      {onClear && (
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  )
}
