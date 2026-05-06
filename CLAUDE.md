# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **Yarn 4** (`packageManager: yarn@4.14.1`). Use `yarn`, not `npm`.

- `yarn dev` — Vite dev server (app entry: `src/main.jsx`).
- `yarn build` — Vite production build.
- `yarn preview` — Preview the production build.
- `yarn lint` — ESLint flat config across the repo (`eslint.config.js`).
- `yarn tokens` — Rebuild the design-token CSS (delegates to the `@fitness/tokens` workspace `build` script). Run this whenever any file under `src/packages/tokens/tokens/*.json` changes; the app consumes the generated CSS, not the JSON.
- Inside `src/packages/tokens/`: `yarn watch` rebuilds `build/css/tokens.css` on token edits (does not rebuild themes — re-run `yarn tokens` for theme files).

## Architecture

### Workspace layout

Yarn workspaces with a single internal package today:

- Root: React 19 + Vite 8 app (plain JS/JSX, no TypeScript).
- `src/packages/tokens` (`@fitness/tokens`): Style Dictionary v5 design-token pipeline. The app imports its built CSS via the workspace; do not edit files under `src/packages/tokens/build/` — they are generated.

### Design tokens (3-tier)

Tokens live in `src/packages/tokens/tokens/` and follow the W3C DTCG format (`$value`/`$type`):

1. **`primitives.json`** — raw scales (color ramps, space, radius, fontSize, etc.). Never reference these directly from components.
2. **`semantic-light.json` / `semantic-dark.json`** — role-based aliases (e.g. `surface.bg`, `text.primary`) that point at primitives. These are what UI code should consume.
3. **`component.json`** — component-level tokens (e.g. button paddings) that reference semantic or primitive tokens.

Two Style Dictionary configs in `src/packages/tokens/scripts/` produce three CSS files:

- `sd.config.js` → `build/css/tokens.css` (primitives + component, emitted under `:root`). Registers two custom transforms used by both configs in spirit:
  - `size/px` — appends `px` to `dimension` tokens (preserves unitless `0`).
  - `shadow/css` — flattens `shadow` token objects (`offsetX/offsetY/blur/spread/color`, possibly arrays) into a CSS `box-shadow` string.
- `sd.themes.js` → `build/css/theme-light.css` and `build/css/theme-dark.css`. Runs the build twice, filters output to **only** semantic tokens, and scopes them:
  - light → `:root, [data-theme="light"]`
  - dark → `[data-theme="dark"]`

Theme switching is therefore done by setting `data-theme="dark"` on a parent element (typically `<html>`); semantic CSS variables resolve to the right primitive automatically.

`brokenReferences: 'throw'` is set in both configs — a typo in a token alias fails the build rather than silently producing an unresolved `var(--…)`.

The `@fitness/tokens` package exposes only built CSS via `exports`: `./css`, `./theme-light`, `./theme-dark`. New token consumers should import through these subpath exports rather than reaching into `build/` directly.

### App entry

`src/main.jsx` mounts `<App />` and imports the global token CSS. Note: it currently imports `./packages/tokens/build/variables.css`, but the Style Dictionary configs emit `tokens.css` / `theme-light.css` / `theme-dark.css`. If you touch the token import, align it with the actual generated filenames (and prefer the `@fitness/tokens/css` subpath export).

## Conventions

- ESLint `no-unused-vars` ignores identifiers starting with an uppercase letter or underscore (`varsIgnorePattern: '^[A-Z_]'`) — this is intentional for unused React component imports kept for JSX.
- This is a JS-only project; do not introduce `.ts`/`.tsx` files without discussing first.
