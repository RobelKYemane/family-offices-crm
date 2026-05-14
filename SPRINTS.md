# 52-Week Roadmap

Personal CRM for Middle East family offices actively deploying into sub-$100M VC funds — tracked as both LPs and direct co-investors.

Status legend: **Done** · **In progress** · **Planned**

Cadence: weekly sprints for Q1 (rapid MVP), then 2-week sprints for Q2-Q4 (feature depth).

---

## Q1 — Foundation + Intelligence (weeks 1-12)

### Sprint 1 — Foundation + Demo Shell · **Done**
Vite + React + TypeScript scaffold, Tailwind + shadcn/ui, HashRouter, mock dataset of 15 ME family offices, filter/search/sort, detail view, deployed to GitHub Pages.

### Sprint 2 — Backend + Auth · **Planned**
Supabase project + 7-table schema (`family_offices`, `contacts`, `funds`, `lp_positions`, `direct_investments`, `interactions`, `tasks`), RLS policies, magic-link auth, gated routes, import researched v1 CSV (30-80 entities).

### Sprint 3 — CRUD + Contacts · **Planned**
Create / edit / delete family offices, nested contacts, tag editor, full-text search, source link rendering with favicons.

### Sprint 4 — LP Positions + Direct Investments · **Planned**
Funds table + admin UI, LP positions per FO, direct investments per FO, "sub-$100M VC, active in last 24 months" combo filter, confidence badges.

### Sprint 5 — Interactions, Tasks, Reminders · **Planned**
Interaction log, tasks with due dates, "due this week" dashboard widget, last-contacted aging (red if >90d), quick-add note from detail.

### Sprint 6 — Polish + Production · **Planned**
PWA manifest + service worker (offline list), iOS Add-to-Home polish, query caching, perf pass, iPhone Safari QA, handover docs.

### Sprint 7-8 — AI Summaries
Claude Haiku writes a 3-line brief per FO from public profile + your interaction notes. Refresh button per FO; bulk job for all.

### Sprint 9-10 — News Monitoring
Per-FO news feed via Google Alerts RSS + select press RSS. Surfaced in detail view; unread badge in list view.

### Sprint 11-12 — Auto-Enrichment Cron
Scheduled Supabase Edge Function re-checks MAGNiTT/Wamda weekly, updates `confidence` and `last_known_activity_year` automatically. Diff log so you can review changes.

---

## Q2 — Outreach + Relationship Engine (weeks 13-24)

### Sprint 13-14 — Gmail Integration
OAuth Gmail connect, emails to/from known FO contacts auto-logged as interactions. Surface email threads inside the FO detail view.

### Sprint 15-16 — Meeting Prep Briefs
Pre-meeting one-pager auto-generated: recent news, last interactions, talking points from your notes, suggested asks based on tags.

### Sprint 17-18 — Intro Tracking
"Who introduced whom" graph. Funnel view: intro → meeting → commitment. Conversion rate per source.

### Sprint 19-20 — Calendar Sync
Google Calendar integration. Meetings auto-create interactions. Smart follow-up reminders ("haven't talked to Olayan in 90 days").

### Sprint 21-22 — Smart Lists
Saved filters as named lists ("Saudi tech LPs", "Active fintech directs"). Bulk tag operations. Smart segments based on activity.

### Sprint 23-24 — Mobile Depth
Voice notes via Whisper (record on phone, transcribed and attached to FO). Business card OCR via camera. Quick-capture flow optimized for one-handed phone use.

---

## Q3 — Network Intelligence (weeks 25-36)

### Sprint 25-26 — Fund Database Expansion
Track every GP each FO has backed. Cross-LP overlap view ("which FOs back the same funds as Olayan?").

### Sprint 27-28 — Network Graph
Visual FO ↔ GP ↔ company map. React Flow or Cytoscape. Click any node to drill in.

### Sprint 29-30 — Warm Intro Paths
Given a target FO, surface routes through your contacts and existing FOs. "X knows Y at FO Z" pathfinding.

### Sprint 31-32 — Co-Investor Analysis
Detect FOs that consistently appear in the same rounds. Pattern: who travels together in deals.

### Sprint 33-34 — Sector Heatmaps
Visualize FO appetite by sector × stage × geography. Useful for narrowing target list when pitching a fund or company.

### Sprint 35-36 — Exit Tracker
When an FO's portfolio company exits or raises a markup, surface the signal. Liquidity events = potential redeployment opportunity.

---

## Q4 — Polish + Optional Scale (weeks 37-52)

### Sprint 37-38 — Dashboard
Pipeline view, follow-ups due this week, recent activity stream, KPIs (FOs touched / month, intro conversion, commitments tracked).

### Sprint 39-40 — Import / Export / Backup
CSV import for bulk additions. JSON export of full state. Point-in-time restore from Supabase backups.

### Sprint 41-42 — Offline Mode Hardening
Better service worker caching, conflict resolution for offline edits, queued mutations.

### Sprint 43-44 — Performance Audit
Virtualized lists for >500 rows, React Query tuning, lazy-load assets, Lighthouse 95+.

### Sprint 45-46 — Security Hardening
RLS policy audit, rate limiting on Supabase, 2FA, audit logs per record, soft-delete with restore.

### Sprint 47-48 — Shared Workspace Mode *(optional)*
Selectively share parts of CRM with a co-investor or GP. Per-FO sharing toggle, read-only mode.

### Sprint 49-50 — Productize Path *(optional)*
Only if you want to share with peers: multi-tenant rewrite, signup flow, pricing tiers, billing via Stripe.

### Sprint 51-52 — Year-End
v1.0 cut. Retro. Year 2 roadmap planning. Possible domain (foradar.com or similar) + branding pass.

---

## Parallel: Research stream
Across Sprints 1-2 a research agent compiles the v1 family office dataset from public sources (MAGNiTT, Wamda, news, LinkedIn, regulator filings). Output: CSV ready for Sprint 2 import. Expected size: 30-80 entities, mixed confidence levels.

Across Sprints 11-12 onward the research stream becomes a scheduled cron rather than a one-shot agent.
