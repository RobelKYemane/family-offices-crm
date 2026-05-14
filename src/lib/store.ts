/**
 * Zustand store with persist middleware.
 * localStorage key: 'family-offices-crm:v1'
 *
 * Architecture:
 *   - Seed data (familyOffices / contacts) is read-only.
 *   - User edits are stored as overrides / createdRecords / hiddenIds in localStorage.
 *   - At read time the two layers are merged: seed + overrides.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  familyOffices as seedFOs,
  contacts as seedContacts,
  type FamilyOffice,
  type Contact,
} from '@/data/familyOffices'

// ─── Persisted shape ──────────────────────────────────────────────────────────

export interface PersistedState {
  foOverrides: Record<string, Partial<FamilyOffice>>
  foCreated: FamilyOffice[]
  foHidden: string[]
  contactOverrides: Record<string, Partial<Contact>>
  contactCreated: Contact[]
  contactHidden: string[]
  favorites: string[]
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

// ─── Empty state ─────────────────────────────────────────────────────────────

const emptyState: PersistedState = {
  foOverrides: {},
  foCreated: [],
  foHidden: [],
  contactOverrides: {},
  contactCreated: [],
  contactHidden: [],
  favorites: [],
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
          })
        } catch {
          throw new Error('Invalid JSON — could not import.')
        }
      },
    }),
    {
      name: 'family-offices-crm:v1', // localStorage key
      version: 1,
      storage: createJSONStorage(() => localStorage),
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
  }))
}
