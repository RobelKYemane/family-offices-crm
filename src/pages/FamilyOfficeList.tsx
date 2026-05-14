import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ChevronUp, ChevronDown, SlidersHorizontal, Star, Eye } from 'lucide-react'
import { familyOffices as seedFOs } from '@/data/familyOffices'
import type { FamilyOffice } from '@/data/familyOffices'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatAum, countryFlag } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  useAllFOs,
  useHiddenFOs,
  useStore,
} from '@/lib/store'

type SortField = 'name' | 'aum' | 'activity'
type SortDir = 'asc' | 'desc'

function toggleSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

function StatusBadge({ status }: { status: FamilyOffice['status'] }) {
  if (status === 'active')
    return <Badge variant="success" className="text-[11px]">Active</Badge>
  if (status === 'dormant')
    return <Badge variant="warning" className="text-[11px]">Dormant</Badge>
  return <Badge variant="muted" className="text-[11px]">Unknown</Badge>
}

function ConfidenceDot({ confidence }: { confidence: FamilyOffice['confidence'] }) {
  const cls =
    confidence === 'public'
      ? 'bg-emerald-500'
      : confidence === 'confirmed'
      ? 'bg-amber-400'
      : 'bg-slate-400'
  return (
    <span
      title={confidence}
      className={cn('inline-block h-2 w-2 rounded-full shrink-0', cls)}
    />
  )
}

/** Small dot indicating user-created or edited records */
function RecordTypeDot({ foId, foCreatedIds, foOverrideIds }: {
  foId: string
  foCreatedIds: Set<string>
  foOverrideIds: Set<string>
}) {
  if (foCreatedIds.has(foId)) {
    return (
      <span
        title="User-created"
        className="inline-block h-1.5 w-1.5 rounded-full bg-primary shrink-0"
      />
    )
  }
  if (foOverrideIds.has(foId)) {
    return (
      <span
        title="Edited"
        className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0"
      />
    )
  }
  return null
}

function StarButton({ foId }: { foId: string }) {
  const isFav = useStore((s) => s.favorites.includes(foId))
  const toggle = useStore((s) => s.toggleFavorite)
  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggle(foId) }}
      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
      className={cn(
        'rounded p-0.5 transition-colors',
        isFav
          ? 'text-amber-400 hover:text-amber-500'
          : 'text-muted-foreground/30 hover:text-amber-400'
      )}
    >
      <Star className={cn('h-3.5 w-3.5', isFav && 'fill-current')} />
    </button>
  )
}

export function FamilyOfficeList() {
  const navigate = useNavigate()
  const allFOs = useAllFOs()
  const hiddenFOs = useHiddenFOs()
  const restoreFO = useStore((s) => s.restoreFO)
  const favorites = useStore((s) => s.favorites)
  const foOverrides = useStore((s) => s.foOverrides)
  const foCreated = useStore((s) => s.foCreated)

  const foCreatedIds = useMemo(() => new Set(foCreated.map((f) => f.id)), [foCreated])
  const foOverrideIds = useMemo(
    () => new Set(Object.keys(foOverrides).filter((k) => Object.keys(foOverrides[k] ?? {}).length > 0)),
    [foOverrides]
  )

  const [search, setSearch] = useState('')
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set())
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set())
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [infoDismissed, setInfoDismissed] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [showHidden, setShowHidden] = useState(false)

  // Derive filter options from the merged (visible) list
  const allCountries = useMemo(
    () => [...new Set(allFOs.map((fo) => fo.country))].sort(),
    [allFOs]
  )
  const allStatuses = useMemo(
    () => [...new Set(allFOs.map((fo) => fo.status))].sort() as FamilyOffice['status'][],
    [allFOs]
  )
  const allTags = useMemo(
    () => [...new Set(allFOs.flatMap((fo) => fo.tags))].sort(),
    [allFOs]
  )

  function countryCount(country: string) {
    return allFOs.filter((fo) => fo.country === country).length
  }

  const favCount = favorites.length

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return allFOs
      .filter((fo) => {
        if (favoritesOnly && !favorites.includes(fo.id)) return false
        if (
          q &&
          !fo.name.toLowerCase().includes(q) &&
          !fo.family.toLowerCase().includes(q) &&
          !fo.city.toLowerCase().includes(q) &&
          !fo.country.toLowerCase().includes(q) &&
          !fo.tags.some((t) => t.toLowerCase().includes(q))
        ) {
          return false
        }
        if (selectedCountries.size > 0 && !selectedCountries.has(fo.country)) return false
        if (selectedStatuses.size > 0 && !selectedStatuses.has(fo.status)) return false
        if (selectedTags.size > 0 && !fo.tags.some((t) => selectedTags.has(t))) return false
        return true
      })
      .sort((a, b) => {
        if (sortField === 'name') {
          const cmp = a.name.localeCompare(b.name)
          return sortDir === 'asc' ? cmp : -cmp
        }
        if (sortField === 'aum') {
          const aVal = a.estAumUsd ?? -1
          const bVal = b.estAumUsd ?? -1
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal
        }
        const aVal = a.lastKnownActivityYear ?? 0
        const bVal = b.lastKnownActivityYear ?? 0
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      })
  }, [allFOs, search, selectedCountries, selectedStatuses, selectedTags, sortField, sortDir, favoritesOnly, favorites])

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field)
      return <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/40" />
    return sortDir === 'asc' ? (
      <ChevronUp className="h-3.5 w-3.5 text-foreground" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-foreground" />
    )
  }

  const hasFilters =
    !!search ||
    selectedCountries.size > 0 ||
    selectedStatuses.size > 0 ||
    selectedTags.size > 0 ||
    favoritesOnly

  function clearFilters() {
    setSearch('')
    setSelectedCountries(new Set())
    setSelectedStatuses(new Set())
    setSelectedTags(new Set())
    setFavoritesOnly(false)
  }

  const totalCount = allFOs.length

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-baseline gap-3">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Family Offices</h1>
        <span className="text-sm text-muted-foreground tabular-nums">
          {filtered.length} of {totalCount}
        </span>
      </div>

      {/* Info pill */}
      {!infoDismissed && (
        <div className="flex items-center justify-between gap-3 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground w-fit max-w-full">
          <span>v0.3 &mdash; {seedFOs.length} seed entities + your additions</span>
          <button
            onClick={() => setInfoDismissed(true)}
            className="rounded-full p-0.5 hover:bg-muted transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Search + filter toggle */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search by name, family, city, or tag..."
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
          <Button
            variant="outline"
            size="icon"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-label="Toggle filters"
            className={cn(filtersOpen && 'border-primary text-primary')}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick chips: Favorites + Hidden toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFavoritesOnly((v) => !v)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
              favoritesOnly
                ? 'border-amber-400 bg-amber-400/10 text-amber-500'
                : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
            )}
          >
            <Star className={cn('h-3 w-3', favoritesOnly && 'fill-current')} />
            Favorites
            {favCount > 0 && (
              <span className={cn('tabular-nums', favoritesOnly ? 'opacity-80' : 'opacity-60')}>
                {favCount}
              </span>
            )}
          </button>

          {hiddenFOs.length > 0 && (
            <button
              onClick={() => setShowHidden((v) => !v)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
                showHidden
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
              )}
            >
              <Eye className="h-3 w-3" />
              Hidden
              <span className={cn('tabular-nums', showHidden ? 'opacity-80' : 'opacity-60')}>
                {hiddenFOs.length}
              </span>
            </button>
          )}
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <FilterRow
              label="Country"
              options={allCountries}
              selected={selectedCountries}
              onToggle={(v) => setSelectedCountries((s) => toggleSet(s, v))}
              getCount={countryCount}
            />
            <FilterRow
              label="Status"
              options={allStatuses}
              selected={selectedStatuses}
              onToggle={(v) => setSelectedStatuses((s) => toggleSet(s, v))}
            />
            <FilterRow
              label="Tag"
              options={allTags}
              selected={selectedTags}
              onToggle={(v) => setSelectedTags((s) => toggleSet(s, v))}
            />
          </div>
        )}

        {/* Sort row */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs text-muted-foreground mr-1">Sort:</span>
          {(['name', 'aum', 'activity'] as const).map((f) => (
            <button
              key={f}
              onClick={() => handleSort(f)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
                sortField === f
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
              )}
            >
              {f === 'name' ? 'Name' : f === 'aum' ? 'AUM' : 'Last activity'}
              {sortField === f ? (
                sortDir === 'asc' ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )
              ) : null}
            </button>
          ))}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Hidden FOs panel */}
      {showHidden && hiddenFOs.length > 0 && (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Hidden family offices ({hiddenFOs.length})
          </p>
          {hiddenFOs.map((fo) => (
            <div key={fo.id} className="flex items-center justify-between gap-3 py-1.5">
              <span className="text-sm text-foreground/70">{fo.name}</span>
              <button
                onClick={() => restoreFO(fo.id)}
                className="text-xs text-primary hover:underline underline-offset-2 shrink-0"
              >
                Restore
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block">
        {filtered.length === 0 ? (
          <EmptyState onClear={hasFilters ? clearFilters : undefined} />
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left">
                  <th className="px-2 py-3 w-8" aria-label="Favorite" />
                  <th className="px-4 py-3 font-medium text-muted-foreground w-[34%]">
                    <button
                      onClick={() => handleSort('name')}
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Name / Family
                      <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Country / City</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    <button
                      onClick={() => handleSort('aum')}
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Est. AUM
                      <SortIcon field="aum" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    <button
                      onClick={() => handleSort('activity')}
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Last activity
                      <SortIcon field="activity" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Confidence</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((fo) => (
                  <tr
                    key={fo.id}
                    onClick={() => navigate(`/fo/${fo.id}`)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') navigate(`/fo/${fo.id}`)
                    }}
                    className="cursor-pointer hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                      <StarButton foId={fo.id} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <RecordTypeDot
                          foId={fo.id}
                          foCreatedIds={foCreatedIds}
                          foOverrideIds={foOverrideIds}
                        />
                        <div>
                          <p className="font-medium text-foreground">{fo.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{fo.family}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="mr-1">{countryFlag(fo.country)}</span>
                      {fo.city}{fo.city && fo.country ? ', ' : ''}{fo.country}
                    </td>
                    <td className="px-4 py-3 font-mono text-foreground/80 tabular-nums text-sm">
                      {formatAum(fo.estAumUsd)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">
                      {fo.lastKnownActivityYear ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <ConfidenceDot confidence={fo.confidence} />
                        <span className="text-xs text-muted-foreground capitalize">
                          {fo.confidence}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {fo.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[11px]">
                            {tag}
                          </Badge>
                        ))}
                        {fo.tags.length > 3 && (
                          <Badge variant="outline" className="text-[11px]">
                            +{fo.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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
            {filtered.map((fo) => (
              <button
                key={fo.id}
                onClick={() => navigate(`/fo/${fo.id}`)}
                className="w-full text-left rounded-lg border border-border bg-card p-4 hover:border-primary/40 hover:bg-muted/20 transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex items-start gap-2">
                    <RecordTypeDot
                      foId={fo.id}
                      foCreatedIds={foCreatedIds}
                      foOverrideIds={foOverrideIds}
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm leading-snug">{fo.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {fo.family}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div onClick={(e) => e.stopPropagation()}>
                      <StarButton foId={fo.id} />
                    </div>
                    <StatusBadge status={fo.status} />
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>{countryFlag(fo.country)}</span>
                  <span>{fo.city}{fo.city && fo.country ? ', ' : ''}{fo.country}</span>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {fo.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <ConfidenceDot confidence={fo.confidence} />
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                      {formatAum(fo.estAumUsd)}
                    </span>
                  </div>
                </div>

                {fo.lastKnownActivityYear && (
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Last activity: {fo.lastKnownActivityYear}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterRow({
  label,
  options,
  selected,
  onToggle,
  getCount,
}: {
  label: string
  options: string[]
  selected: Set<string>
  onToggle: (value: string) => void
  getCount?: (value: string) => number
}) {
  return (
    <div className="flex items-start gap-3 flex-wrap">
      <span className="text-xs font-medium text-muted-foreground mt-1 shrink-0 w-14">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected.has(opt)
          const count = getCount ? getCount(opt) : null
          return (
            <button
              key={opt}
              onClick={() => onToggle(opt)}
              className={cn(
                'rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground',
              )}
            >
              {opt}
              {count !== null && (
                <span className={cn('ml-1.5 tabular-nums', active ? 'opacity-80' : 'opacity-60')}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function EmptyState({ onClear }: { onClear?: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-border py-20 text-center space-y-3">
      <div className="text-3xl text-muted-foreground/30 select-none" aria-hidden>
        <SlidersHorizontal className="mx-auto h-10 w-10" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        No family offices match your filters.
      </p>
      {onClear && (
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  )
}


