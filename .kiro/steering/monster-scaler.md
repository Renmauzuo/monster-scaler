# Monster Scaler Website Steering

Standalone D&D 5e monster scaling tool. Users pick a monster template and target CR, and the site renders a scaled statblock. Built with Pug, SCSS, jQuery, and Gulp+Rollup.

## Project Structure

```
src/
  pages/          — Pug entry points (one per page)
  pug/            — Shared pug partials and layout (_base.pug, mixins, etc.)
  scripts/        — JavaScript source
  styles/         — SCSS source
  resources/      — Static assets
  sounds/         — Audio files (.mp3)
docs/             — Built output (deployed site)
```

## Script Architecture

The site uses ES modules bundled by Rollup into IIFE bundles — one per page.

**Entry points** (become standalone bundles):
- `monsters.js` — Monster scaler page
- `sidekicks.js` — Sidekick builder page
- `statblock.js` — JSON statblock renderer page

**Modules** (imported by entry points, not bundled standalone):
- `global.js` — Shared UI logic: `scaleMonster` wrapper, `renderStatblock`, `populateSelect`, `serializeForm`, `deserializeQuery`, export functions
- `data.js` — Site-specific data only: `sidekickClasses`, `spellProgression`, `weaponTypes`, `magicSchools`, `alignmentStrings`

**Vendored** (copied as-is, not bundled):
- `html2canvas.js` — PNG export library, loaded via `<script>` tag

## Package Dependencies

The site consumes three local toolkit5e packages via `file:` references:
- `@toolkit5e/base` — constants, data, utility functions
- `@toolkit5e/monster-scaler` — `scaleMonster()` and `monsterList`
- `@toolkit5e/statblock` — `renderStatblock()`

The packages must be built before the site build. See toolkit5e steering for details.

## Build

```bash
npm run build       # full build to docs/
npm run watch       # watch src/ for changes (does not watch toolkit5e packages)
npm run development # clean + build in development mode (source maps, unminified HTML)
npm run production  # clean + build in production mode (minified)
```

Gulp tasks: `css`, `js`, `vendor`, `html`, `json`, `sounds`, `cacheBusting`.

## Key Conventions

- `data-on-change="fnName"` attributes on inputs/selects call `window[fnName](animated)` on change. Any function used this way must be explicitly assigned to `window` at the bottom of the module that defines it. Currently: `window.setupVariantSelect`.
- Inline `onclick` attributes in pug (export buttons) also require window assignment: `window.exportFightClub`, `window.exportJSON`, `window.generateImage`.
- `global.js` wraps the package's `scaleMonster(template, cr, options)` with a site-local version that accepts a `monsterID` string and does the `monsterList` lookup internally.
- `renderStatblock` in `global.js` is a thin wrapper around the package's `renderStatblock`, passing `document.querySelector('.stat-block')` as the target element. The statblock container is just a bare `.stat-block` div in each page's pug — the renderer builds all DOM itself.
- Wild shape bonuses (attack/damage bonuses, rider dice) are applied directly to the attack objects in `monsters.js` before calling `renderStatblock`, not inside the renderer. Use `atk.bonusAttack`, `atk.bonusDamage`, and `atk.damageRiderDice`/`atk.damageRiderDieSize`/`atk.damageRiderType` on each attack.
- Statblock elements use classes (not IDs) so multiple statblocks can coexist on a page. The `exportFightClub` function reads rendered values from the DOM using class selectors (`.monster-name`, `.armor-class span`, etc.).
- The `#legendary` select (None / 3 Resistances / 5 Resistances) passes `options.legendary` to `scaleMonster`. It is disabled and reset to "None" whenever the wild shape checkbox is active — legendary and wild shape are mutually exclusive. `serializeForm` skips it when set to `'0'` so it doesn't pollute clean URLs.

## Known Gaps

- `onClassChange` and `onLevelChange` are referenced via `data-on-change` in `sidekicks.pug` but not yet implemented.

## Dependency Management

The toolkit5e packages (`@toolkit5e/base`, `@toolkit5e/monster-scaler`, `@toolkit5e/statblock`) use `file:` references to each other and to the monster-scaler site. If npm installs nested `node_modules/@toolkit5e` copies inside individual packages (e.g. `packages/monster-scaler/node_modules/@toolkit5e/base`), Rollup will resolve imports from those stale copies instead of the workspace root, causing "not exported" errors even after rebuilding.

Fix: delete the nested copies manually:
```bash
Remove-Item -Recurse -Force packages/monster-scaler/node_modules/@toolkit5e
Remove-Item -Recurse -Force packages/statblock/node_modules/@toolkit5e
```

This can recur after `npm install`. A permanent fix would be to move `@toolkit5e/base` to `peerDependencies` in the monster-scaler and statblock packages so npm doesn't install its own copy.
