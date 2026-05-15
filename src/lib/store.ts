/**
 * Zustand store with persist middleware.
 * localStorage key: 'family-offices-crm:v1'
 *
 * Architecture:
 *   - Seed data (familyOffices / contacts / funds / lpPositions / directInvestments) is read-only.
 *   - User edits are stored as overrides / createdRecords / hiddenIds in localStorage.
 *   - At read time the two layers are merged: seed + overrides.
 *
 * v1 → v2: adds fundOverrides, fundCreated, fundHidden,
 *           lpOverrides, lpCreated, lpHidden,
 *           diOverrides, diCreated, diHidden
 * v2 → v3: adds interactionsCreated, tasksCreated (Sprint 5)
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  familyOffices as seedFOs,
  contacts as seedContacts,
  funds as seedFunds,
  lpPositions as seedLPs,
  directInvestments as seedDIs,
  type FamilyOffice,
  type Contact,
  type Fund,
  type LPPosition,
  type DirectInvestment,
  type Interaction,
  type Task,
} from '@/data/familyOffices'
import { parseDateLoose } from '@/lib/utils'

// ─── Persisted shape ──────────────────────────────────────────────────────────

export interface PersistedState {
  foOverrides: Record<string, Partial<FamilyOffice>>
  foCreated: FamilyOffice[]
  foHidden: string[]
  contactOverrides: Record<string, Partial<Contact>>
  contactCreated: Contact[]
  contactHidden: string[]
  favorites: string[]
  // Sprint 4
  fundOverrides: Record<string, Partial<Fund>>
  fundCreated: Fund[]
  fundHidden: string[]
  lpOverrides: Record<string, Partial<LPPosition>>
  lpCreated: LPPosition[]
  lpHidden: string[]
  diOverrides: Record<string, Partial<DirectInvestment>>
  diCreated: DirectInvestment[]
  diHidden: string[]
  // Sprint 5
  interactionsCreated: Interaction[]
  tasksCreated: Task[]
}

// ─── Store actions ────────────────────────────────────────────────────────────

interface StoreActions {
  // FO mutations
  createFO: (input: Omit<FamilyOffice, 'id'>) => string
  updateFO: (id: string, patch: Partial<FamilyOffice>) => void
  deleteFO: (id: string) => void
  restoreFO: (id: string) => void

  // Contact mutations
  createContact: (input: Omit<Contact, 'id'>) => string
  updateContact: (id: string, patch: Partial<Contact>) => void
  deleteContact: (id: string) => void
  restoreContact: (id: string) => void

  // Favorites
  toggleFavorite: (id: string) => void

  // Fund mutations
  createFund: (input: Omit<Fund, 'id'>) => string
  updateFund: (id: string, patch: Partial<Fund>) => void
  deleteFund: (id: string) => void
  restoreFund: (id: string) => void

  // LP position mutations
  createLPPosition: (input: Omit<LPPosition, 'id'>) => string
  updateLPPosition: (id: string, patch: Partial<LPPosition>) => void
  deleteLPPosition: (id: string) => void
  restoreLPPosition: (id: string) => void

  // Direct investment mutations
  createDirectInvestment: (input: Omit<DirectInvestment, 'id'>) => string
  updateDirectInvestment: (id: string, patch: Partial<DirectInvestment>) => void
  deleteDirectInvestment: (id: string) => void
  restoreDirectInvestment: (id: string) => void

  // Interaction mutations (Sprint 5)
  createInteraction: (input: Omit<Interaction, 'id'>) => string
  updateInteraction: (id: string, patch: Partial<Omit<Interaction, 'id'>>) => void
  deleteInteraction: (id: string) => void

  // Task mutations (Sprint 5)
  createTask: (input: Omit<Task, 'id'>) => string
  updateTask: (id: string, patch: Partial<Omit<Task, 'id'>>) => void
  deleteTask: (id: string) => void
  toggleTaskDone: (id: string) => void

  // Data management
  resetAll: () => void
  exportJSON: () => string
  importJSON: (blob: string) => void
}

type StoreState = PersistedState & StoreActions

// ─── Slug helper ─────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function uniqueId(base: string, existing: string[]): string {
  if (!existing.includes(base)) return base
  let n = 2
  while (existing.includes(`${base}-${n}`)) n++
  return `${base}-${n}`
}

function newContactId(existing: string[]): string {
  const base = `c-${Date.now()}`
  return uniqueId(base, existing)
}

function newLPId(existing: string[]): string {
  const base = `lp-${Date.now()}`
  return uniqueId(base, existing)
}

function newDIId(existing: string[]): string {
  const base = `di-${Date.now()}`
  return uniqueId(base, existing)
}

// ─── Empty state ─────────────────────────────────────────────────────────────

const emptyState: PersistedState = {
  foOverrides: {},
  foCreated: [],
  foHidden: [],
  contactOverrides: {},
  contactCreated: [],
  contactHidden: [],
  favorites: [],
  // Sprint 4
  fundOverrides: {},
  fundCreated: [],
  fundHidden: [],
  lpOverrides: {},
  lpCreated: [],
  lpHidden: [],
  diOverrides: {},
  diCreated: [],
  diHidden: [],
  // Sprint 5
  interactionsCreated: [],
  tasksCreated: [],
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...emptyState,

      // ── FO mutations ────────────────────────────────────────────────────────

      createFO(input) {
        const state = get()
        const allIds = [
          ...seedFOs.map((f) => f.id),
          ...state.foCreated.map((f) => f.id),
        ]
        const id = uniqueId(slugify(input.name) || 'fo', allIds)
        const newFO: FamilyOffice = { id, ...input }
        set((s) => ({ foCreated: [...s.foCreated, newFO] }))
        return id
      },

      updateFO(id, patch) {
        const isSeed = seedFOs.some((f) => f.id === id)
        if (isSeed) {
          set((s) => ({
            foOverrides: {
              ...s.foOverrides,
              [id]: { ...s.foOverrides[id], ...patch },
            },
          }))
        } else {
          set((s) => ({
            foCreated: s.foCreated.map((f) =>
              f.id === id ? { ...f, ...patch } : f
            ),
          }))
        }
      },

      deleteFO(id) {
        const isSeed = seedFOs.some((f) => f.id === id)
        if (isSeed) {
          set((s) => ({ foHidden: [...s.foHidden.filter((x) => x !== id), id] }))
        } else {
          set((s) => ({ foCreated: s.foCreated.filter((f) => f.id !== id) }))
        }
      },

      restoreFO(id) {
        set((s) => ({ foHidden: s.foHidden.filter((x) => x !== id) }))
      },

      // ── Contact mutations ───────────────────────────────────────────────────

      createContact(input) {
        const allIds = [
          ...seedContacts.map((c) => c.id),
          ...get().contactCreated.map((c) => c.id),
        ]
        const id = newContactId(allIds)
        const newContact: Contact = { id, ...input }
        set((s) => ({ contactCreated: [...s.contactCreated, newContact] }))
        return id
      },

      updateContact(id, patch) {
        const isSeed = seedContacts.some((c) => c.id === id)
        if (isSeed) {
          set((s) => ({
            contactOverrides: {
              ...s.contactOverrides,
              [id]: { ...s.contactOverrides[id], ...patch },
            },
          }))
        } else {
          set((s) => ({
            contactCreated: s.contactCreated.map((c) =>
              c.id === id ? { ...c, ...patch } : c
            ),
          }))
        }
      },

      deleteContact(id) {
        const isSeed = seedContacts.some((c) => c.id === id)
        if (isSeed) {
          set((s) => ({
            contactHidden: [...s.contactHidden.filter((x) => x !== id), id],
          }))
        } else {
          set((s) => ({ contactCreated: s.contactCreated.filter((c) => c.id !== id) }))
        }
      },

      restoreContact(id) {
        set((s) => ({ contactHidden: s.contactHidden.filter((x) => x !== id) }))
      },

      // ── Favorites ───────────────────────────────────────────────────────────

      toggleFavorite(id) {
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((x) => x !== id)
            : [...s.favorites, id],
        }))
      },

      // ── Fund mutations ───────────────────────────────────────────────────────

      createFund(input) {
        const state = get()
        const allIds = [
          ...seedFunds.map((f) => f.id),
          ...state.fundCreated.map((f) => f.id),
        ]
        const id = uniqueId(
          slugify(input.name) || crypto.randomUUID(),
          allIds
        )
        const newFund: Fund = { id, ...input }
        set((s) => ({ fundCreated: [...s.fundCreated, newFund] }))
        return id
      },

      updateFund(id, patch) {
        const isSeed = seedFunds.some((f) => f.id === id)
        if (isSeed) {
          set((s) => ({
            fundOverrides: {
              ...s.fundOverrides,
              [id]: { ...s.fundOverrides[id], ...patch },
            },
          }))
        } else {
          set((s) => ({
            fundCreated: s.fundCreated.map((f) =>
              f.id === id ? { ...f, ...patch } : f
            ),
          }))
        }
      },

      deleteFund(id) {
        const isSeed = seedFunds.some((f) => f.id === id)
        if (isSeed) {
          set((s) => ({ fundHidden: [...s.fundHidden.filter((x) => x !== id), id] }))
        } else {
          set((s) => ({ fundCreated: s.fundCreated.filter((f) => f.id !== id) }))
        }
      },

      restoreFund(id) {
        set((s) => ({ fundHidden: s.fundHidden.filter((x) => x !== id) }))
      },

      // ── LP Position mutations ────────────────────────────────────────────────

      createLPPosition(input) {
        const allIds = [
          ...seedLPs.map((l) => l.id),
          ...get().lpCreated.map((l) => l.id),
        ]
        const id = newLPId(allIds)
        const newLP: LPPosition = { id, ...input }
        set((s) => ({ lpCreated: [...s.lpCreated, newLP] }))
        return id
      },

      updateLPPosition(id, patch) {
        const isSeed = seedLPs.some((l) => l.id === id)
        if (isSeed) {
          set((s) => ({
            lpOverrides: {
              ...s.lpOverrides,
              [id]: { ...s.lpOverrides[id], ...patch },
            },
          }))
        } else {
          set((s) => ({
            lpCreated: s.lpCreated.map((l) =>
              l.id === id ? { ...l, ...patch } : l
            ),
          }))
        }
      },

      deleteLPPosition(id) {
        const isSeed = seedLPs.some((l) => l.id === id)
        if (isSeed) {
          set((s) => ({ lpHidden: [...s.lpHidden.filter((x) => x !== id), id] }))
        } else {
          set((s) => ({ lpCreated: s.lpCreated.filter((l) => l.id !== id) }))
        }
      },

      restoreLPPosition(id) {
        set((s) => ({ lpHidden: s.lpHidden.filter((x) => x !== id) }))
      },

      // ── Direct Investment mutations ──────────────────────────────────────────

      createDirectInvestment(input) {
        const allIds = [
          ...seedDIs.map((d) => d.id),
          ...get().diCreated.map((d) => d.id),
        ]
        const id = newDIId(allIds)
        const newDI: DirectInvestment = { id, ...input }
        set((s) => ({ diCreated: [...s.diCreated, newDI] }))
        return id
      },

      updateDirectInvestment(id, patch) {
        const isSeed = seedDIs.some((d) => d.id === id)
        if (isSeed) {
          set((s) => ({
            diOverrides: {
              ...s.diOverrides,
              [id]: { ...s.diOverrides[id], ...patch },
            },
          }))
        } else {
          set((s) => ({
            diCreated: s.diCreated.map((d) =>
              d.id === id ? { ...d, ...patch } : d
            ),
          }))
        }
      },

      deleteDirectInvestment(id) {
        const isSeed = seedDIs.some((d) => d.id === id)
        if (isSeed) {
          set((s) => ({ diHidden: [...s.diHidden.filter((x) => x !== id), id] }))
        } else {
          set((s) => ({ diCreated: s.diCreated.filter((d) => d.id !== id) }))
        }
      },

      restoreDirectInvestment(id) {
        set((s) => ({ diHidden: s.diHidden.filter((x) => x !== id) }))
      },

      // ── Interaction mutations (Sprint 5) ─────────────────────────────────────

      createInteraction(input) {
        const id = crypto.randomUUID()
        const newInteraction: Interaction = { id, ...input }
        set((s) => ({ interactionsCreated: [...s.interactionsCreated, newInteraction] }))
        return id
      },

      updateInteraction(id, patch) {
        set((s) => ({
          interactionsCreated: s.interactionsCreated.map((i) =>
            i.id === id ? { ...i, ...patch } : i
          ),
        }))
      },

      deleteInteraction(id) {
        set((s) => ({
          interactionsCreated: s.interactionsCreated.filter((i) => i.id !== id),
        }))
      },

      // ── Task mutations (Sprint 5) ─────────────────────────────────────────────

      createTask(input) {
        const id = crypto.randomUUID()
        const newTask: Task = { id, ...input }
        set((s) => ({ tasksCreated: [...s.tasksCreated, newTask] }))
        return id
      },

      updateTask(id, patch) {
        set((s) => ({
          tasksCreated: s.tasksCreated.map((t) =>
            t.id === id ? { ...t, ...patch } : t
          ),
        }))
      },

      deleteTask(id) {
        set((s) => ({
          tasksCreated: s.tasksCreated.filter((t) => t.id !== id),
        }))
      },

      toggleTaskDone(id) {
        set((s) => ({
          tasksCreated: s.tasksCreated.map((t) => {
            if (t.id !== id) return t
            const done = !t.done
            return { ...t, done, doneAt: done ? new Date().toISOString() : null }
          }),
        }))
      },

      // ── Data management ─────────────────────────────────────────────────────

      resetAll() {
        set({ ...emptyState })
      },

      exportJSON() {
        const {
          foOverrides,
          foCreated,
          foHidden,
          contactOverrides,
          contactCreated,
          contactHidden,
          favorites,
          fundOverrides,
          fundCreated,
          fundHidden,
          lpOverrides,
          lpCreated,
          lpHidden,
          diOverrides,
          diCreated,
          diHidden,
          interactionsCreated,
          tasksCreated,
        } = get()
        return JSON.stringify(
          {
            foOverrides,
            foCreated,
            foHidden,
            contactOverrides,
            contactCreated,
            contactHidden,
            favorites,
            fundOverrides,
            fundCreated,
            fundHidden,
            lpOverrides,
            lpCreated,
            lpHidden,
            diOverrides,
            diCreated,
            diHidden,
            interactionsCreated,
            tasksCreated,
          },
          null,
          2
        )
      },

      importJSON(blob) {
        try {
          const parsed = JSON.parse(blob) as Partial<PersistedState>
          set({
            foOverrides: parsed.foOverrides ?? {},
            foCreated: parsed.foCreated ?? [],
            foHidden: parsed.foHidden ?? [],
            contactOverrides: parsed.contactOverrides ?? {},
            contactCreated: parsed.contactCreated ?? [],
            contactHidden: parsed.contactHidden ?? [],
            favorites: parsed.favorites ?? [],
            fundOverrides: parsed.fundOverrides ?? {},
            fundCreated: parsed.fundCreated ?? [],
            fundHidden: parsed.fundHidden ?? [],
            lpOverrides: parsed.lpOverrides ?? {},
            lpCreated: parsed.lpCreated ?? [],
            lpHidden: parsed.lpHidden ?? [],
            diOverrides: parsed.diOverrides ?? {},
            diCreated: parsed.diCreated ?? [],
            diHidden: parsed.diHidden ?? [],
            interactionsCreated: parsed.interactionsCreated ?? [],
            tasksCreated: parsed.tasksCreated ?? [],
          })
        } catch {
          throw new Error('Invalid JSON — could not import.')
        }
      },
    }),
    {
      name: 'family-offices-crm:v1', // localStorage key stays same; version field bumped below
      version: 3,
      storage: createJSONStorage(() => localStorage),
      migrate(persistedState, fromVersion) {
        const s = persistedState as Partial<PersistedState>
        if (fromVersion < 2) {
          // v1 → v2: add Sprint 4 fields
          s.fundOverrides = s.fundOverrides ?? {}
          s.fundCreated = s.fundCreated ?? []
          s.fundHidden = s.fundHidden ?? []
          s.lpOverrides = s.lpOverrides ?? {}
          s.lpCreated = s.lpCreated ?? []
          s.lpHidden = s.lpHidden ?? []
          s.diOverrides = s.diOverrides ?? {}
          s.diCreated = s.diCreated ?? []
          s.diHidden = s.diHidden ?? []
        }
        if (fromVersion < 3) {
          // v2 → v3: add Sprint 5 fields
          s.interactionsCreated = s.interactionsCreated ?? []
          s.tasksCreated = s.tasksCreated ?? []
        }
        return s as PersistedState
      },
    }
  )
)

// ─── Selectors / hooks ────────────────────────────────────────────────────────

/** All FOs: seed (minus hidden) with overrides applied, then user-created. */
export function useAllFOs(): FamilyOffice[] {
  return useStore((s) => {
    const merged = seedFOs
      .filter((fo) => !s.foHidden.includes(fo.id))
      .map((fo) =>
        s.foOverrides[fo.id]
          ? ({ ...fo, ...s.foOverrides[fo.id] } as FamilyOffice)
          : fo
      )
    return [...merged, ...s.foCreated]
  })
}

/** All hidden seed FOs. */
export function useHiddenFOs(): FamilyOffice[] {
  return useStore((s) =>
    seedFOs
      .filter((fo) => s.foHidden.includes(fo.id))
      .map((fo) =>
        s.foOverrides[fo.id]
          ? ({ ...fo, ...s.foOverrides[fo.id] } as FamilyOffice)
          : fo
      )
  )
}

/** Single FO by id — from merged data. */
export function useFO(id: string | undefined): FamilyOffice | undefined {
  return useStore((s) => {
    if (!id) return undefined
    const seed = seedFOs.find((f) => f.id === id)
    if (seed) return s.foOverrides[id] ? ({ ...seed, ...s.foOverrides[id] } as FamilyOffice) : seed
    return s.foCreated.find((f) => f.id === id)
  })
}

/** Contacts for a specific FO, with overrides applied. */
export function useContactsForFO(foId: string): Contact[] {
  return useStore((s) => {
    const seedForFO = seedContacts
      .filter((c) => c.familyOfficeId === foId && !s.contactHidden.includes(c.id))
      .map((c) =>
        s.contactOverrides[c.id]
          ? ({ ...c, ...s.contactOverrides[c.id] } as Contact)
          : c
      )
    const createdForFO = s.contactCreated.filter((c) => c.familyOfficeId === foId)
    return [...seedForFO, ...createdForFO]
  })
}

/** Is a given FO favorited? */
export function useIsFavorite(id: string): boolean {
  return useStore((s) => s.favorites.includes(id))
}

/** Is a given FO a seed (not user-created)? */
export function useIsSeedFO(id: string): boolean {
  return seedFOs.some((f) => f.id === id)
}

/** Does a seed FO have user overrides? */
export function useIsEdited(id: string): boolean {
  return useStore((s) => id in s.foOverrides && Object.keys(s.foOverrides[id] ?? {}).length > 0)
}

/** Is this FO user-created? */
export function useIsCreated(id: string): boolean {
  return useStore((s) => s.foCreated.some((f) => f.id === id))
}

/** All unique tags across merged FO dataset (for autocomplete). */
export function useAllTags(): string[] {
  return useStore((s) => {
    const fromSeed = seedFOs.flatMap((f) => f.tags)
    const fromCreated = s.foCreated.flatMap((f) => f.tags)
    const fromOverrides = Object.values(s.foOverrides).flatMap((o) => o.tags ?? [])
    return [...new Set([...fromSeed, ...fromCreated, ...fromOverrides])].sort()
  })
}

// ── Fund selectors ────────────────────────────────────────────────────────────

/** All funds: seed (minus hidden) with overrides applied, then user-created. */
export function useAllFunds(): Fund[] {
  return useStore((s) => {
    const merged = seedFunds
      .filter((f) => !s.fundHidden.includes(f.id))
      .map((f) =>
        s.fundOverrides[f.id]
          ? ({ ...f, ...s.fundOverrides[f.id] } as Fund)
          : f
      )
    return [...merged, ...s.fundCreated]
  })
}

/** Single fund by id. */
export function useFund(id: string | undefined): Fund | undefined {
  return useStore((s) => {
    if (!id) return undefined
    const seed = seedFunds.find((f) => f.id === id)
    if (seed) return s.fundOverrides[id] ? ({ ...seed, ...s.fundOverrides[id] } as Fund) : seed
    return s.fundCreated.find((f) => f.id === id)
  })
}

// ── LP Position selectors ─────────────────────────────────────────────────────

/** All LP positions: seed (minus hidden) with overrides, then user-created. */
export function useAllLPPositions(): LPPosition[] {
  return useStore((s) => {
    const merged = seedLPs
      .filter((l) => !s.lpHidden.includes(l.id))
      .map((l) =>
        s.lpOverrides[l.id]
          ? ({ ...l, ...s.lpOverrides[l.id] } as LPPosition)
          : l
      )
    return [...merged, ...s.lpCreated]
  })
}

/** LP positions for a specific family office. */
export function useLPPositionsForFO(foId: string): LPPosition[] {
  return useStore((s) => {
    const seedForFO = seedLPs
      .filter((l) => l.familyOfficeId === foId && !s.lpHidden.includes(l.id))
      .map((l) =>
        s.lpOverrides[l.id]
          ? ({ ...l, ...s.lpOverrides[l.id] } as LPPosition)
          : l
      )
    const createdForFO = s.lpCreated.filter((l) => l.familyOfficeId === foId)
    return [...seedForFO, ...createdForFO]
  })
}

/** LP positions for a specific fund. */
export function useLPPositionsForFund(fundId: string): LPPosition[] {
  return useStore((s) => {
    const seedForFund = seedLPs
      .filter((l) => l.fundId === fundId && !s.lpHidden.includes(l.id))
      .map((l) =>
        s.lpOverrides[l.id]
          ? ({ ...l, ...s.lpOverrides[l.id] } as LPPosition)
          : l
      )
    const createdForFund = s.lpCreated.filter((l) => l.fundId === fundId)
    return [...seedForFund, ...createdForFund]
  })
}

// ── Direct Investment selectors ───────────────────────────────────────────────

/** All direct investments: seed (minus hidden) with overrides, then user-created. */
export function useAllDirectInvestments(): DirectInvestment[] {
  return useStore((s) => {
    const merged = seedDIs
      .filter((d) => !s.diHidden.includes(d.id))
      .map((d) =>
        s.diOverrides[d.id]
          ? ({ ...d, ...s.diOverrides[d.id] } as DirectInvestment)
          : d
      )
    return [...merged, ...s.diCreated]
  })
}

/** Direct investments for a specific family office. */
export function useDirectInvestmentsForFO(foId: string): DirectInvestment[] {
  return useStore((s) => {
    const seedForFO = seedDIs
      .filter((d) => d.familyOfficeId === foId && !s.diHidden.includes(d.id))
      .map((d) =>
        s.diOverrides[d.id]
          ? ({ ...d, ...s.diOverrides[d.id] } as DirectInvestment)
          : d
      )
    const createdForFO = s.diCreated.filter((d) => d.familyOfficeId === foId)
    return [...seedForFO, ...createdForFO]
  })
}

// ── Activity helper ───────────────────────────────────────────────────────────

/** TODAY used for 24-month window (matches spec: 2026-05-15). */
const TODAY = new Date()

/**
 * Returns true if this FO has any LP commitment or DI deal
 * with a date within the last 24 months.
 * Null dates → unknown → not counted as "active".
 */
export function useFOActiveInLast24Months(foId: string): boolean {
  return useStore((s) => {
    const cutoff = new Date(TODAY)
    cutoff.setMonth(cutoff.getMonth() - 24)

    const lps = [
      ...seedLPs.filter((l) => l.familyOfficeId === foId && !s.lpHidden.includes(l.id))
        .map((l) => s.lpOverrides[l.id] ? { ...l, ...s.lpOverrides[l.id] } as LPPosition : l),
      ...s.lpCreated.filter((l) => l.familyOfficeId === foId),
    ]
    for (const lp of lps) {
      const d = parseDateLoose(lp.commitmentDate)
      if (d && d >= cutoff) return true
    }

    const dis = [
      ...seedDIs.filter((d) => d.familyOfficeId === foId && !s.diHidden.includes(d.id))
        .map((d) => s.diOverrides[d.id] ? { ...d, ...s.diOverrides[d.id] } as DirectInvestment : d),
      ...s.diCreated.filter((d) => d.familyOfficeId === foId),
    ]
    for (const di of dis) {
      const d = parseDateLoose(di.dealDate)
      if (d && d >= cutoff) return true
    }

    return false
  })
}

/**
 * Returns a Set of FO ids that have LP commitment or DI deal within last 24 months.
 * Single store subscription — safe to use in list components.
 */
export function useActive24moIds(): Set<string> {
  return useStore((s) => {
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - 24)

    const activeIds = new Set<string>()

    const allLPs = [
      ...seedLPs
        .filter((l) => !s.lpHidden.includes(l.id))
        .map((l) => s.lpOverrides[l.id] ? { ...l, ...s.lpOverrides[l.id] } as LPPosition : l),
      ...s.lpCreated,
    ]
    for (const lp of allLPs) {
      const d = parseDateLoose(lp.commitmentDate)
      if (d && d >= cutoff) activeIds.add(lp.familyOfficeId)
    }

    const allDIs = [
      ...seedDIs
        .filter((d) => !s.diHidden.includes(d.id))
        .map((d) => s.diOverrides[d.id] ? { ...d, ...s.diOverrides[d.id] } as DirectInvestment : d),
      ...s.diCreated,
    ]
    for (const di of allDIs) {
      const d = parseDateLoose(di.dealDate)
      if (d && d >= cutoff) activeIds.add(di.familyOfficeId)
    }

    return activeIds
  })
}

/** Count stats for settings page. */
export function useStats() {
  return useStore((s) => ({
    seedFOs: seedFOs.length,
    createdFOs: s.foCreated.length,
    editedFOs: Object.keys(s.foOverrides).filter(
      (k) => Object.keys(s.foOverrides[k] ?? {}).length > 0
    ).length,
    hiddenFOs: s.foHidden.length,
    favorites: s.favorites.length,
    createdContacts: s.contactCreated.length,
    // Sprint 4
    seedFunds: seedFunds.length,
    createdFunds: s.fundCreated.length,
    hiddenFunds: s.fundHidden.length,
    seedLPs: seedLPs.length,
    createdLPs: s.lpCreated.length,
    hiddenLPs: s.lpHidden.length,
    seedDIs: seedDIs.length,
    createdDIs: s.diCreated.length,
    hiddenDIs: s.diHidden.length,
    // Sprint 5
    totalInteractions: s.interactionsCreated.length,
    openTasks: s.tasksCreated.filter((t) => !t.done).length,
    completedTasks: s.tasksCreated.filter((t) => t.done).length,
  }))
}

// ── Sprint 5 selectors ─────────────────────────────────────────────────────────

/** Days between two dates (absolute value). */
function daysBetween(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24)
}

/** All interactions sorted by date desc. */
export function useAllInteractions(): Interaction[] {
  return useStore((s) =>
    [...s.interactionsCreated].sort((a, b) => b.date.localeCompare(a.date))
  )
}

/** Interactions for one FO, sorted by date desc. */
export function useInteractionsForFO(foId: string): Interaction[] {
  return useStore((s) =>
    s.interactionsCreated
      .filter((i) => i.familyOfficeId === foId)
      .sort((a, b) => b.date.localeCompare(a.date))
  )
}

/** All tasks. */
export function useAllTasks(): Task[] {
  return useStore((s) => s.tasksCreated)
}

/** Tasks for one FO (tasks where familyOfficeId matches foId). */
export function useTasksForFO(foId: string): Task[] {
  return useStore((s) =>
    s.tasksCreated.filter((t) => t.familyOfficeId === foId)
  )
}

/** Open tasks (done === false). */
export function useOpenTasks(): Task[] {
  return useStore((s) => s.tasksCreated.filter((t) => !t.done))
}

/** Open tasks with dueDate from today through 7 days out. */
export function useTasksDueThisWeek(): Task[] {
  return useStore((s) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekOut = new Date(today)
    weekOut.setDate(weekOut.getDate() + 7)
    return s.tasksCreated.filter((t) => {
      if (t.done || !t.dueDate) return false
      const d = new Date(t.dueDate + 'T00:00:00')
      return d >= today && d <= weekOut
    })
  })
}

/**
 * FO ids where no interaction has been logged in thresholdDays days.
 * An FO with zero interactions counts as stale.
 */
export function useStaleFOs(thresholdDays = 90): string[] {
  return useStore((s) => {
    const allFOIds = [
      ...seedFOs.filter((f) => !s.foHidden.includes(f.id)).map((f) => f.id),
      ...s.foCreated.map((f) => f.id),
    ]
    const today = new Date()
    return allFOIds.filter((foId) => {
      const interactions = s.interactionsCreated.filter((i) => i.familyOfficeId === foId)
      if (interactions.length === 0) return true
      const latest = interactions.reduce(
        (best, i) => (i.date > best ? i.date : best),
        interactions[0].date
      )
      const latestDate = new Date(latest + 'T00:00:00')
      return daysBetween(today, latestDate) > thresholdDays
    })
  })
}

/** Most recent interaction date for an FO, or null. */
export function useLastInteractionDate(foId: string): string | null {
  return useStore((s) => {
    const interactions = s.interactionsCreated.filter((i) => i.familyOfficeId === foId)
    if (interactions.length === 0) return null
    return interactions.reduce(
      (best, i) => (i.date > best ? i.date : best),
      interactions[0].date
    )
  })
}

/** Dashboard stats convenience hook. */
export function useDashboardStats() {
  return useStore((s) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekOut = new Date(today)
    weekOut.setDate(weekOut.getDate() + 7)

    const openTasks = s.tasksCreated.filter((t) => !t.done)

    const tasksDueThisWeek = openTasks.filter((t) => {
      if (!t.dueDate) return false
      const d = new Date(t.dueDate + 'T00:00:00')
      return d >= today && d <= weekOut
    }).length

    // Stale FOs count
    const allFOIds = [
      ...seedFOs.filter((f) => !s.foHidden.includes(f.id)).map((f) => f.id),
      ...s.foCreated.map((f) => f.id),
    ]
    const staleFOs = allFOIds.filter((foId) => {
      const interactions = s.interactionsCreated.filter((i) => i.familyOfficeId === foId)
      if (interactions.length === 0) return true
      const latest = interactions.reduce(
        (best, i) => (i.date > best ? i.date : best),
        interactions[0].date
      )
      const latestDate = new Date(latest + 'T00:00:00')
      return daysBetween(today, latestDate) > 90
    }).length

    const recentInteractions = [...s.interactionsCreated]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)

    return {
      tasksDueThisWeek,
      openTasks: openTasks.length,
      staleFOs,
      totalInteractions: s.interactionsCreated.length,
      recentInteractions,
    }
  })
}
