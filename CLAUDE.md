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

1. **`primitives.json`** — raw scales (color ramps, space, radius, fontSize, duration, easing, shadow, etc.). Never reference these directly from components.
2. **Semantic layer** — role-based aliases that point at primitives. Split into two files by theme-sensitivity:
   - **`semantic-global.json`** — theme-invariant roles: radius intents (`sharp`/`subtle`/`interactive`/`container`/`overlay`/`prominent`/`pill`), space roles (`inset-*`, `gap-*`, `layout-*`), composite typography styles (`text.body`, `text.heading-md`, `text.display`, etc.), motion (`motion.duration.*`, `motion.easing.*`), and elevation (`elevation.low/medium/high`). These resolve to the same value in every theme and are emitted once under `:root`.
   - **`semantic-light.json` / `semantic-dark.json`** — color roles only (e.g. `color.bg.surface`, `color.text.primary`, `color.border.default`). These are theme-variant and scoped per theme selector.
3. **`component.json`** — component-level tokens (e.g. button colors, card radius, input borders) that reference semantic tokens — both global (radius, space, typography) and color roles. Never reference primitives directly here.

Two Style Dictionary configs in `src/packages/tokens/scripts/` produce five CSS files:

- `sd.config.js` → three files under `:root`, all resolved to final values (`outputReferences: false` except component). Registers two custom transforms used by both configs:
  - `size/px` — appends `px` to `dimension` tokens (preserves unitless `0`).
  - `shadow/css` — flattens `shadow` token objects (`offsetX/offsetY/blur/spread/color`, possibly arrays) into a CSS `box-shadow` string.
  - `build/css/tokens.css` — primitives only.
  - `build/css/semantic-global.css` — theme-invariant semantic tokens (radius, space, text styles, motion, elevation).
  - `build/css/component.css` — component tokens; uses `outputReferences: true` so values emit as `var(--…)` references rather than resolved values.
- `sd.themes.js` → `build/css/theme-light.css` and `build/css/theme-dark.css`. Runs the build twice, filters output to **only** color semantic tokens, and scopes them:
  - light → `:root, [data-theme="light"]`
  - dark → `[data-theme="dark"]`

Theme switching is done by setting `data-theme="dark"` on a parent element (typically `<html>`); color semantic variables resolve to the right primitive automatically. Non-color semantics (`semantic-global`) are unaffected by theme switching.

`brokenReferences: 'throw'` is set in both configs — a typo in a token alias fails the build rather than silently producing an unresolved `var(--…)`.

The `@fitness/tokens` package exposes only built CSS via `exports`: `./css`, `./semantic-global`, `./theme-light`, `./theme-dark`, `./component`. New token consumers should import through these subpath exports rather than reaching into `build/` directly.

### App entry

`src/main.jsx` mounts `<App />` and imports the global token CSS. Note: it currently imports `./packages/tokens/build/variables.css`, but the Style Dictionary configs emit `tokens.css` / `theme-light.css` / `theme-dark.css`. If you touch the token import, align it with the actual generated filenames (and prefer the `@fitness/tokens/css` subpath export).

## Conventions

- ESLint `no-unused-vars` ignores identifiers starting with an uppercase letter or underscore (`varsIgnorePattern: '^[A-Z_]'`) — this is intentional for unused React component imports kept for JSX.
- This is a JS-only project; do not introduce `.ts`/`.tsx` files without discussing first.
