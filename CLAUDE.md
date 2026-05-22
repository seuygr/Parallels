# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # start dev server
npm run build        # production build
npm run lint         # eslint

# Database
npm run db:migrate   # run migrations (reads .env.local via prisma.config.ts)
npm run db:seed      # seed with mock data
npm run db:studio    # open Prisma Studio
npm run db:generate  # regenerate Prisma client after schema changes
```

## Environment

Three variables required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase anon/publishable key
- `DATABASE_URL` — Postgres connection string (from Supabase dashboard → Settings → Database → URI)

## Architecture

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Prisma 7 (PostgreSQL via `@prisma/adapter-pg`) · Supabase (auth + database host) · Zustand · Framer Motion

**Data flow:**
- `src/store/canvas.ts` — Zustand store is the single source of truth for the canvas: loaded persons, their events, the visible year range, and selected event/intersection. Currently seeded from `src/data/mock.ts`; DB integration is in progress.
- `src/lib/intersection.ts` — pure functions that compute temporal overlaps between persons; called directly by the timeline renderer.
- `src/lib/prisma.ts` — singleton Prisma client using the pg driver adapter (not the default Node.js driver).

**Prisma client is generated into `src/generated/prisma/`**, not the default location. Always import from `@/generated/prisma/client`.

**Auth:** Supabase SSR auth via `src/utils/supabase/{client,server,middleware}.ts`. The Next.js 16 proxy at `src/proxy.ts` refreshes sessions on every non-static request.

**Routes:**
- `/` — landing page (`src/app/page.tsx`), client component
- `/canvas` — main interactive canvas (`src/app/canvas/page.tsx`), client component

**Key components:**
- `src/components/timeline/TimelineCanvas.tsx` — SVG-based timeline renderer. Handles zoom (wheel) and pan (drag) by mapping pixel ↔ year via `yearToX`/`xToYear`. Renders person tracks, life bars, event dots, and intersection zones.
- `src/components/IntersectionPanel.tsx` — slide-in panel shown when a temporal overlap badge is clicked.
- `src/components/StoryCard.tsx` — modal shown when an event dot is clicked.
- `src/components/ui/` — shadcn components.

**Schema models:** `User`, `Person`, `LifeEvent`, `Canvas`, `CanvasPerson`. Persons can be `"famous"` (Wikidata-backed) or `"personal"` (user-created). A `Canvas` holds an ordered list of persons via the `CanvasPerson` join table.

## Next.js version note

This project uses Next.js 16.2.6 — APIs and conventions may differ from training data. Read `node_modules/next/dist/docs/` before writing any Next.js-specific code.
