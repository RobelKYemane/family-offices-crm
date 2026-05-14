# 6-Week Sprint Roadmap

Personal CRM for Middle East family offices actively deploying into sub-$100M VC funds — tracked as both LPs and direct co-investors.

Status legend: **Done** · **In progress** · **Planned**

---

## Sprint 1 — Foundation + Demo Shell · **Done**
**Goal:** Working web app on GitHub Pages, mobile-responsive, mock data.

- Vite + React + TypeScript scaffold
- Tailwind + shadcn/ui base components
- HashRouter routes: `/` list, `/fo/:id` detail
- Mock dataset of ~15 ME family offices (all marked `confidence: rumored`)
- Filter chips (country, status, tag) + search + sort
- Detail view with placeholder sections for future sprints
- Deploy via `gh-pages` package to `https://robelkyemane.github.io/family-offices-crm/`

**Demo data caveat:** Sprint 1 seeds are real entity names with placeholder AUM/notes. Real researched data lands in Sprint 2.

---

## Sprint 2 — Backend + Auth · **Planned**
**Goal:** Real data layer.

- Supabase project + 7-table schema (`family_offices`, `contacts`, `funds`, `lp_positions`, `direct_investments`, `interactions`, `tasks`)
- RLS policies (single-owner model)
- Magic-link auth, gated routes
- Wire list view to live Supabase data
- Import v1 researched CSV (~30-80 entities) compiled by the research agent
- Replace placeholder confidence badges with sourced data

---

## Sprint 3 — CRUD + Contacts · **Planned**
**Goal:** Editable CRM.

- Create / edit / delete family offices
- Nested contacts (name, role, email, LinkedIn, last contacted)
- Tag editor + status flips
- Full-text search across name / family / city
- Source link rendering with favicon

---

## Sprint 4 — LP Positions + Direct Investments · **Planned**
**Goal:** Core thesis filter — "actively deploying into sub-$100M VC funds."

- `funds` table + admin UI (name, vintage, target size, GP)
- LP positions per FO (commitment amount, date, source, confidence)
- Direct investments per FO (company, sector, stage, check size)
- Combo filter: "Sub-$100M VC, active LP or direct in last 24 months"
- Confidence badges everywhere (rumored / confirmed / public)

---

## Sprint 5 — Interactions, Tasks, Reminders · **Planned**
**Goal:** Relationship engine.

- Interaction log per FO (meeting / call / email / intro, with date and summary)
- Tasks with due dates and "done" state
- Dashboard widget: "Due this week"
- List view: aging indicator on FO rows (red if `last_contacted` > 90 days)
- Quick-add note from detail view

---

## Sprint 6 — Polish + Production · **Planned**
**Goal:** Phone-grade app.

- PWA manifest + service worker (offline-first list view)
- iOS "Add to Home Screen" polish (icons, splash)
- React Query caching tuned, list virtualization for >200 rows
- Performance pass + Lighthouse audit
- iPhone Safari QA
- Handover docs

---

## Parallel: Research stream
Across Sprints 1-2 a research agent compiles the v1 family office dataset from public sources (MAGNiTT, Wamda, news, LinkedIn, regulator filings). Output: CSV ready for Sprint 2 import. Expected size: 30-80 entities, mixed confidence levels.
