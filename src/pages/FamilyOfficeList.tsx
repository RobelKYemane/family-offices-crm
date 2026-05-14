import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react'
import { familyOffices, type FamilyOffice } from '@/data/familyOffices'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatAum } from '@/lib/utils'

type SortField = 'name' | 'aum'
type SortDir = 'asc' | 'desc'

const ALL_COUNTRIES = [...new Set(familyOffices.map((fo) => fo.country))].sort()
const ALL_STATUSES = [...new Set(familyOffices.map((fo) => fo.status))].sort() as FamilyOffice['status'][]
const ALL_TAGS = [...new Set(familyOffices.flatMap((fo) => fo.tags))].sort()

function toggleSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set)
  if (next.has(value)) {
    next.delete(value)
  } else {
    next.add(value)
  }
  return next
}

function StatusBadge({ status }: { status: FamilyOffice['status'] }) {
  if (status === 'active') return <Badge variant="success">Active</Badge>
  if (status === 'dormant') return <Badge variant="warning">Dormant</Badge>
  return <Badge variant="muted">Unknown</Badge>
}

export function FamilyOfficeList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set())
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set())
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return familyOffices
      .filter((fo) => {
        if (q && !fo.name.toLowerCase().includes(q) && !fo.family.toLowerCase().includes(q) && !fo.city.toLowerCase().includes(q)) {
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
        const aVal = a.estAumUsd ?? -1
        const bVal = b.estAumUsd ?? -1
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      })
  }, [search, selectedCountries, selectedStatuses, selectedTags, sortField, sortDir])

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronUp className="h-3.5 w-3.5 text-slate-300" />
    return sortDir === 'asc' ? (
      <ChevronUp className="h-3.5 w-3.5 text-slate-600" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-slate-600" />
    )
  }

  const hasFilters =
    search || selectedCountries.size > 0 || selectedStatuses.size > 0 || selectedTags.size > 0

  function clearFilters() {
    setSearch('')
    setSelectedCountries(new Set())
    setSelectedStatuses(new Set())
    setSelectedTags(new Set())
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Family Offices</h1>
        <p className="mt-1 text-sm text-slate-500">
          ME family offices deploying into sub-$100M VC funds
        </p>
      </div>

      {/* Demo-data banner */}
      {!bannerDismissed && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>
            Sprint 1 demo data — replaced with researched dataset in Sprint 2.
          </span>
          <button
            onClick={() => setBannerDismissed(true)}
            className="shrink-0 rounded p-0.5 hover:bg-amber-100 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            type="search"
            placeholder="Search by name, family, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter chips */}
        <div className="space-y-2">
          <FilterRow
            label="Country"
            options={ALL_COUNTRIES}
            selected={selectedCountries}
            onToggle={(v) => setSelectedCountries((s) => toggleSet(s, v))}
          />
          <FilterRow
            label="Status"
            options={ALL_STATUSES}
            selected={selectedStatuses}
            onToggle={(v) => setSelectedStatuses((s) => toggleSet(s, v))}
          />
          <FilterRow
            label="Tag"
            options={ALL_TAGS}
            selected={selectedTags}
            onToggle={(v) => setSelectedTags((s) => toggleSet(s, v))}
          />
        </div>

        {hasFilters && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            <button
              onClick={clearFilters}
              className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-700"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Table (desktop) */}
      <div className="hidden md:block">
        {filtered.length === 0 ? (
          <EmptyState onClear={hasFilters ? clearFilters : undefined} />
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50 text-left">
                  <th className="px-4 py-3 font-medium text-slate-600">
                    <button
                      onClick={() => handleSort('name')}
                      className="inline-flex items-center gap-1 hover:text-slate-900"
                    >
                      Name
                      <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-600">Family / Location</th>
                  <th className="px-4 py-3 font-medium text-slate-600">
                    <button
                      onClick={() => handleSort('aum')}
                      className="inline-flex items-center gap-1 hover:text-slate-900"
                    >
                      Est. AUM
                      <SortIcon field="aum" />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-600">Tags</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((fo) => (
                  <tr
                    key={fo.id}
                    onClick={() => navigate(`/fo/${fo.id}`)}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900">{fo.name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {fo.family} · {fo.city}, {fo.country}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700 tabular-nums">
                      {formatAum(fo.estAumUsd)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {fo.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {fo.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{fo.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={fo.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Card grid (mobile) */}
      <div className="md:hidden">
        {filtered.length === 0 ? (
          <EmptyState onClear={hasFilters ? clearFilters : undefined} />
        ) : (
          <div className="space-y-3">
            {filtered.map((fo) => (
              <button
                key={fo.id}
                onClick={() => navigate(`/fo/${fo.id}`)}
                className="w-full text-left rounded-lg border border-border bg-card p-4 shadow-sm hover:border-slate-300 hover:shadow transition-all min-h-[44px] active:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{fo.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {fo.family} · {fo.city}, {fo.country}
                    </p>
                  </div>
                  <StatusBadge status={fo.status} />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {fo.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <span className="font-mono text-xs text-slate-600 tabular-nums shrink-0 ml-2">
                    {formatAum(fo.estAumUsd)}
                  </span>
                </div>
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
}: {
  label: string
  options: string[]
  selected: Set<string>
  onToggle: (value: string) => void
}) {
  return (
    <div className="flex items-start gap-2 flex-wrap">
      <span className="text-xs font-medium text-slate-500 mt-1.5 shrink-0 w-14">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected.has(opt)
          return (
            <button
              key={opt}
              onClick={() => onToggle(opt)}
              className={[
                'rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
                active
                  ? 'border-slate-700 bg-slate-800 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-800',
              ].join(' ')}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function EmptyState({ onClear }: { onClear?: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 py-16 text-center">
      <p className="text-sm font-medium text-slate-600">No family offices match your filters.</p>
      {onClear && (
        <Button variant="outline" size="sm" onClick={onClear} className="mt-3">
          Clear filters
        </Button>
      )}
    </div>
  )
}

