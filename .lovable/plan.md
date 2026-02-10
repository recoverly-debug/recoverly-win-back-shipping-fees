

# Fix: Unify Navigation to Access Agent Interface

## Problem
The app has two disconnected navigation systems:
- **DashboardNav** (Landing-era): serves `/dashboard`, `/claims`, `/settings`
- **AppNav** (Agent-era): serves `/agent`, `/approvals`, `/report`, `/connectors`, `/app-settings`

There are no cross-links between them, so navigating from `/dashboard` to `/agent` is impossible without manually changing the URL.

## Solution
Consolidate into a single navigation using `AppNav` (the newer, spec-compliant nav with module switcher). Update all pages that currently use `DashboardNav` to use `AppNav` instead, and merge the useful routes (`/claims`) into the AppNav links.

## Changes

### 1. Update AppNav navigation items
Add "Claims" to the nav items list so the claims page remains accessible:
```
navItems = [
  { label: "Home", path: "/agent" },
  { label: "Approvals", path: "/approvals" },
  { label: "Claims", path: "/claims" },
  { label: "Report", path: "/report" },
  { label: "Connectors", path: "/connectors" },
  { label: "Settings", path: "/app-settings" },
]
```

### 2. Update Dashboard page
Replace `DashboardNav` with `AppNav` in `src/pages/Dashboard.tsx`.

### 3. Update Claims page
Replace `DashboardNav` with `AppNav` in `src/pages/Claims.tsx`.

### 4. Update Settings page
Replace `DashboardNav` with `AppNav` in `src/pages/Settings.tsx` (or redirect to `/app-settings`).

### 5. Update Landing page links
Update `LandingNav.tsx` "Login" and "Get Started" buttons to link to `/agent` instead of `/dashboard`.

### 6. Redirect `/dashboard` to `/agent`
Make `/dashboard` redirect to `/agent` so existing links still work.

This ensures every page uses the same nav bar with access to the full agent-first experience.
