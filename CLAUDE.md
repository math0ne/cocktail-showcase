# CLAUDE.md

Guidance for AI assistants working in this repository.

## What this is

**Cocktail Showcase** is a Next.js 14 web app that shows you which cocktails you can make
from the ingredients you own. It has a bar/drinks manager and a full-screen slideshow mode
designed to run on an iPad at a bar. It is a **client-heavy, offline-first PWA**: all cocktail
data and images are bundled statically, all user state lives in the browser (localStorage +
IndexedDB), with optional Google Drive sync for cross-device backup. There is no backend/database
and no server-side API routes.

## Commands

```bash
npm install            # install deps
npm run dev            # dev server at http://localhost:3000
npm run build          # production build
npm start              # serve production build
npm run lint           # ESLint (next/core-web-vitals)

# Data tooling (run manually, rarely; commits the generated JSON/images)
npm run update-cocktails   # scripts/fetch-cocktails.ts — refetch all data from TheCocktailDB
npm run download-images    # scripts/download-images.ts — download thumbnails locally & rewrite paths
```

There is **no test suite**. Verify changes by running `npm run dev` / `npm run build` and
exercising the UI. Always run `npm run lint` before committing.

## Tech stack

- **Framework**: Next.js 14 (App Router), React 18, TypeScript (strict mode)
- **UI**: Chakra UI v2 (`@chakra-ui/react`) + Emotion; icons from `@chakra-ui/icons` and `react-icons`
- **State**: Zustand with `persist` middleware → localStorage
- **Animations**: Framer Motion
- **Auth/Sync**: `@react-oauth/google` + Google Drive REST API (appDataFolder scope)
- **Data source**: TheCocktailDB (data licensed; see `public/data/LICENSE.md`)
- Path alias: `@/*` → `src/*` (configured in `tsconfig.json`)

## Architecture & data flow

### Static data, not a live API
Cocktail and ingredient data are **pre-fetched into static JSON** and served from `public/`:
- `public/data/cocktails.json` — ~636 cocktails (`{ fetchedAt, count, cocktails[] }`)
- `public/data/ingredients.json` — ~489 ingredient names (`{ fetchedAt, count, ingredients[] }`)
- `public/images/cocktails/<idDrink>.jpg` — locally cached thumbnails (~636 images)

At runtime the app `fetch()`es these files from the public path (`src/lib/api.ts`). The
TheCocktailDB HTTP API is **only** hit by the offline build scripts, never by the running app.
`useCocktails` fetches the full list once and caches it on `window.__cocktailCache` to survive
HMR; all filtering/matching happens client-side.

### State layers (all client-side, in this order of authority)
1. **Zustand store** (`src/store/useStore.ts`) — the single source of truth for user data:
   `myIngredients`, `shoppingList`, `customCocktails`, `triedCocktails`, `heartedCocktails`,
   `cocktailNotes`, `slideShowSettings`, `drinkFilters`, plus a `cachedCocktails` map.
   Persisted to `localStorage` under key `cocktail-showcase-storage`.
2. **IndexedDB** (`src/lib/imageStore.ts`, DB `cocktail-images`) — binary image blobs for
   **custom cocktails** and user-uploaded **ingredient images**. Too large for localStorage.
   Keys: `cocktail-<id>` and `ingredient-<slug>`. Images are resized/compressed to JPEG
   (max 800px, quality 0.85) via canvas before storage.
3. **Google Drive** (`src/lib/googleDrive.ts` + `src/contexts/GoogleSyncContext.tsx`) —
   optional backup of the store JSON to the user's Drive `appDataFolder`
   (file `cocktail-data.json`). Sync is **debounced 4s** after any store change and skipped
   when a deep-equal comparison shows no real change. Image blob sync is stubbed but not yet
   implemented (`imageRefs` is always `{}`, see the `TODO` in `GoogleSyncContext`).

### Matching engine
`src/lib/matching.ts` is the core logic: `matchCocktails(cocktails, userIngredients)` produces
`CocktailMatch[]` (matched/missing ingredients, `isFullMatch`) via case-insensitive name equality.
`sortByMatch` orders full matches first, then by fewest missing / most matched / alphabetical.
Matching is **exact name comparison** (lowercased/trimmed) — there is no ingredient synonym or
category-aware substitution.

### Fuzzy search
`src/lib/fuzzyMatch.ts` is a subsequence matcher (chars appear in order), used only for the
search box (e.g. `"oj"` matches `"Orange Juice"`). Not used by the ingredient matching engine.

## Routing & UI structure

The app is effectively a **single-page app**. `src/app/page.tsx` is the whole UI and switches
between two views with a **URL-hash toggle** (`#bar` vs default drinks view) — not Next routes:
- **Drinks view**: `CocktailGrid` — filter tabs (Ready / Tried / Liked / Matches / All), fuzzy
  search, sort dropdown, category/glass grouping, card grid, detail modal, create-drink modal.
- **Bar view** (`#bar`): quick-toggle fresh ingredients, bar stock list, ingredient picker,
  shopping list, and data export/import.
- **Slideshow**: rendered as a full-screen **overlay** from `page.tsx` (`<Slideshow>`), not by
  navigating. A legacy `src/app/slideshow/page.tsx` route still exists and renders the same
  component, but the in-app button uses the overlay.

### Directory layout
```
src/
├── app/
│   ├── layout.tsx          # Root layout, fonts, PWA metadata, safe-area CSS
│   ├── page.tsx            # The SPA (bar/drinks views + slideshow overlay)
│   ├── providers.tsx       # Chakra theme + Google OAuth + GoogleSync providers
│   └── slideshow/page.tsx  # Legacy standalone slideshow route
├── components/             # All UI (see below)
├── contexts/
│   └── GoogleSyncContext.tsx   # Drive sync state machine + debounce
├── hooks/
│   ├── useCocktails.ts     # Load + match + sort cocktails (window-cached)
│   ├── useIngredients.ts   # Load master ingredient list
│   └── useStoredImage.ts   # useStoredImage / useCocktailImage / useIngredientImage (IndexedDB)
├── lib/
│   ├── api.ts              # Fetch static JSON from /public/data
│   ├── matching.ts         # Ingredient matching engine
│   ├── fuzzyMatch.ts       # Subsequence search
│   ├── imageStore.ts       # IndexedDB blob CRUD + image compression
│   ├── images.ts           # TheCocktailDB ingredient image URL builder
│   └── googleDrive.ts      # Drive REST helpers + SyncData shape
├── store/useStore.ts       # Zustand store (persisted)
└── types/index.ts          # All shared types (RawCocktail, Cocktail, CocktailMatch, AppState…)
```

Notable components: `CocktailGrid`, `CocktailCard`, `CocktailModal`, `CreateDrinkModal`,
`Slideshow`, `IngredientPicker`, `IngredientList`, `FreshIngredients`, `MyShoppingList`,
`ShoppingList`, `DataExport`, `GoogleSyncStatus`, and image wrappers `CocktailImage` /
`IngredientImage` / `GlassIcon`.

## Conventions

- **Client components everywhere.** Almost every file starts with `'use client'`. This app has
  effectively no server components beyond `layout.tsx`; browser APIs (localStorage, IndexedDB,
  `window`) are used freely but always guard with `typeof window !== 'undefined'` in shared libs.
- **State goes through the Zustand store.** Add new persisted user data as a field + action in
  `src/store/useStore.ts` and the `AppState` interface in `src/types/index.ts`. If it should sync,
  also thread it through `SyncData`, `buildCompareData`, `buildSyncData`, and `applySyncData` in
  `GoogleSyncContext.tsx`. Keep those four in sync or Drive sync silently drops the field.
- **Ingredient handling is normalized** (trim + lowercase for comparison) but stored with original
  casing; lists are kept sorted case-insensitively. Reuse the existing dedupe pattern in store actions.
- **Custom cocktails** use ids prefixed `custom-` and are always visible regardless of matching;
  their images live in IndexedDB (`useCocktailImage` branches on this prefix).
- **Theming**: dark-mode-only, Chakra theme in `providers.tsx` (Revolut-style purple palette,
  page bg `#0d0d0d`, card bg `#121214`, rounded `xl`/`2xl` radii, semantic tokens like
  `bg.card`/`accent.purple`). Match this styling for new UI rather than introducing new colors.
- **TypeScript is strict.** Keep it type-clean; shared types belong in `src/types/index.ts`.
- **Modals** use Chakra's `Modal` (styled globally in the theme) — historically `createPortal`
  caused issues; prefer Chakra's `Portal`/`Modal`.

## Data & assets

- To refresh cocktail data: `npm run update-cocktails` then `npm run download-images` (the second
  rewrites `thumbnail` fields in `cocktails.json` to local `/images/cocktails/...` paths). Both
  scripts are idempotent and respectful (delays, retries). Commit the regenerated JSON + images.
- `next.config.js` allows remote images from `www.thecocktaildb.com` (fallback for any
  not-yet-downloaded thumbnails) and disables the webpack fs cache in dev (WSL2 workaround).
- PWA: `public/manifest.json` (fullscreen display). Home-screen icons `icon-192.png` /
  `icon-512.png` are referenced but may need to be added to `public/`.

## Environment

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth client id for Drive sync (see `.env.example`).
  When **absent**, the app runs fine but silently omits the Google providers, and sync UI is
  disabled (`providers.tsx` conditionally mounts `GoogleOAuthProvider`). Local overrides go in
  `.env.local` (gitignored). Only `NEXT_PUBLIC_`-prefixed vars reach the client.

## Working in this repo

- No backend, no DB, no tests: "does it work" means running the app and clicking through.
- Prefer editing the static JSON via the scripts, not by hand.
- When touching sync, remember the debounce and the compare-string change detection — a change
  that doesn't alter `buildCompareData`'s output will not sync.
- Keep everything client-safe (SSR-guarded) so `npm run build` doesn't break on `window`/`indexedDB`.
