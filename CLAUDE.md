# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

PowerShell — `&&` not supported, use `;` or separate commands:

```powershell
# Dev server
npm run dev

# Build (required before Capacitor sync)
npm run build

# Lint
npm run lint

# Deploy to Android device (run sequentially)
npm run build
npx cap sync android
npx cap run android

# Open in Android Studio
npx cap open android
```

## Architecture

Feature-based structure. Each feature under `src/features/` owns its full vertical slice:

```
src/
├── app/router/          # Route definitions
├── features/
│   ├── auth/            # Auth store, hooks, services
│   ├── catalog/         # Products + categories
│   ├── sales/           # Sales management (most complex feature)
│   ├── dashboard/       # Dashboard stats
│   ├── reports/
│   └── settings/
├── shared/
│   ├── components/ui/   # shadcn/ui components
│   ├── components/layout/ # AppLayout, ProtectedRoute, AppSidebar
│   ├── store/           # Zustand: useProfileStore, useOfflineStore
│   ├── hooks/           # useNetwork (Capacitor), use-mobile
│   ├── lib/             # supabase.ts (Supabase client)
│   └── types/           # database.types.ts (Supabase-generated)
```

## Data Layer Pattern

Every feature follows: **Service → Hook → Component**

- **Services** (`feature/services/`): Raw Supabase calls, typed returns
- **Hooks** (`feature/hooks/`): React Query wrappers with query key factories
- **Mutations**: Invalidate query keys on success via `queryClient.invalidateQueries`

Query key factory pattern (follow this in all features):
```typescript
const productKeys = {
  all: ["products"],
  lists: () => [...productKeys.all, "list"],
  list: (filters) => [...productKeys.lists(), { filters }],
  detail: (id) => [...productKeys.all, "detail", id],
}
```

React Query config: stale 5min, cache 7 days, retry 1, no refetch on focus (offline-first).

## State Management

- **React Query**: Server/async state
- **Zustand** (`src/shared/store/`): Client-side persistent state
  - `useProfileStore`: Avatar URL, WhatsApp phone
  - `useOfflineStore`: Pending offline sales queue

## Supabase & Auth

Client in `src/shared/lib/supabase.ts`. Storage is platform-aware:
- Native (Capacitor): `@capacitor/preferences`
- Web: `localStorage`

Env vars required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

Auth flow: Login → rememberMe flag in storage → auto-login on next open → `/app`

## Offline-First

`OfflineSyncManager` component syncs `useOfflineStore` pending sales when network restored. `useNetwork` hook (Capacitor) monitors connectivity.

## Capacitor / Mobile

- App ID: `com.artesaniasguapinol.app`
- Web dir: `dist` — always `npm run build` before `cap sync`
- Native features used: `@capacitor/preferences`, `@capacitor/network`, `@capacitor/app` (hardware back button)
- Safe area insets applied in `AppLayout`

## UI Stack

- Tailwind CSS v4 (no `tailwind.config.js` — configured via `@tailwindcss/vite`)
- shadcn/ui components in `src/shared/components/ui/`
- Radix UI Themes v3
- Path alias `@` → `src/`
- Theme support: light/dark/system via `ThemeProvider`

## Images

Cloudinary for product images. Env var: `VITE_CLOUDINARY_CLOUD_NAME`. Components: image cropper + multi-image upload in features/catalog.
