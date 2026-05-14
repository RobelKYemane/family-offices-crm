# Family Offices CRM

A personal CRM for tracking Middle East family offices that deploy capital into sub-$100M VC funds, as both LPs and direct investors.

**Live demo:** https://robelkyemane.github.io/family-offices-crm/

## Status: Sprint 1 — UI shell with mock data

Sprint 1 delivers the full UI shell: list view with search/filter/sort, detail view, responsive layout, and 15 seeded ME family office records. All Sprint 1 data is clearly labeled as demo data; a researched dataset replaces it in Sprint 2.

See [SPRINTS.md](./SPRINTS.md) for the full 6-sprint roadmap.

## Tech stack

- Vite 6 + React 18 + TypeScript (strict mode)
- Tailwind CSS v3
- shadcn/ui components (slate base color, CSS variables)
- react-router-dom v6 with HashRouter
- lucide-react icons
- gh-pages for deployment

## Local development

```bash
npm install
npm run dev
```

App runs at http://localhost:5173

## Deploy to GitHub Pages

```bash
npm run deploy
```

This builds the project and pushes `dist/` to the `gh-pages` branch.

## Notes

- Dark mode is not implemented in Sprint 1. It is planned for a later sprint.
- No backend or authentication in Sprint 1. Supabase integration is Sprint 2.
