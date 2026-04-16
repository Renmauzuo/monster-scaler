# Implementation Plan: Resource Tracker

## Overview

Implement the Resource Tracker feature in three phases: (1) add the `recharge` field to `@toolkit5e/base` and annotate all relevant traits/monsters, (2) build the `resource-tracker.js` module with extraction, state management, and UI rendering, (3) wire page-level controls and persistence into `monsters.js` and `monsters.pug`.

## Tasks

- [x] 1. Add `recharge` field to `@toolkit5e/base` public API
  - [x] 1.1 Add `recharge?: 'short' | 'long'` to the `Trait` interface in `toolkit5e/packages/base/src/types.ts`
    - This is a non-breaking additive change; all existing consumers are unaffected
    - _Requirements: 1.9_

  - [x] 1.2 Annotate rest-recovery traits in `toolkit5e/packages/base/src/data.ts`
    - Add `recharge: 'long'` to `legendaryResistance` in the `traits` map
    - Review all other entries in `traits`, `procs`, and `actions` for rest-based recovery and annotate thoroughly — not only what the resource tracker needs, but everything with short- or long-rest recovery semantics
    - _Requirements: 1.9_

  - [x] 1.3 Annotate rest-recovery traits in `toolkit5e/packages/monster-scaler/src/monsters.ts`
    - Review every monster template's `lockedStats.traits`, `traits` array, `actions`, and `bonusActions` for abilities that recover on a short or long rest
    - Add `recharge: 'short'` or `recharge: 'long'` to the relevant `Trait` objects inline in the template data
    - _Requirements: 1.9_

  - [x] 1.5 Update `@toolkit5e/statblock` renderer to use structured `recharge` data for display
    - In `toolkit5e/packages/statblock/src/index.ts`, update the trait/action rendering sections (traits loop, actions loop, bonusActions loop, legendaryActions loop) to check for `trait.recharge`
    - If `trait.recharge === 'short'`, append `" (Recharges after a Short or Long Rest)"` to the rendered trait name
    - If `trait.recharge === 'long'`, append `" (Recharges after a Long Rest)"` to the rendered trait name
    - This applies to all four rendering sections: traits, actions, bonusActions, legendaryActions
    - After making this change, any monster template that previously had the rest-recharge text baked into the description string should have that text removed from the description (since the renderer now generates it from the structured field)
    - Rebuild `toolkit5e` packages and verify no TypeScript errors
    - _References: Design doc — Trait Interface Change section; the `recharge` field is a public API addition_

  - [x] 1.6 Build `toolkit5e` packages and verify no TypeScript errors
    - Run `npm run build` from `toolkit5e/` root; confirm clean compile
    - _Requirements: 1.9_

- [x] 2. Implement `extractResources` — pure statblock parser
  - [x] 2.1 Create `monster-scaler/src/scripts/resource-tracker.js` with the `extractResources(statblock, instanceNumber)` function
    - Scan `traits`, `actions`, `bonusActions`, `legendaryActions` (each treated as optional/nullable)
    - **Legendary Resistance special case**: BEFORE the trait scan loop, check `statblock.legendaryResistances`; if set and > 0, add a `limitedUseAbilities` entry with `key: 'legendaryResistance'`, `name: 'Legendary Resistance'`, `max: statblock.legendaryResistances`, `remaining: statblock.legendaryResistances`, `recharge: 'long'`; add `'legendaryResistance'` to a skip-set so the trait loop does not double-count it as a Rest_Ability
    - Classify recharge abilities via `/\(Recharge (\d)[–-]6\)/` on the trait name; record `threshold`
    - Classify rest abilities via `trait.recharge === 'short' | 'long'`; record `restType` (skip any key in the skip-set)
    - Classify limited-use abilities via `/(\d+)\/(day|encounter)/i` on the description; record `max` and `recharge ?? null` (spell-like abilities such as dryad's 3/day spells are handled here automatically)
    - Derive `maxHp` using `averageRoll(hitDice, hitDieSize) + (conMod * hitDice) + (bonusHP ?? 0)` mirroring the statblock renderer
    - Derive `spellSlots` from the inline `SPELL_SLOTS` table using `statblock.castingClass` and `statblock.level`
    - Initialise `conditions` object omitting any condition present in `statblock.conditionImmunities`; default all to `false`; `exhaustion` defaults to `0`
    - Return a fully-shaped `ResourceState` with `instanceLabel` set to `"${statblock.name} #${instanceNumber}"`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

  - [x] 2.2 Write property test — Property 5: ResourceState completeness
    - Add `fast-check` as a dev dependency in `monster-scaler/`
    - Generate arbitrary statblocks; verify all required top-level fields are present, `currentHp === maxHp`, `exhaustion === 0`, all boolean conditions are `false`
    - **Property 5: ResourceState completeness**
    - **Validates: Requirements 1.8**

  - [x] 2.3 Write property test — Property 2: Recharge ability name parsing
    - Generate arbitrary ability names with injected `(Recharge N–6)` patterns (N in 2–5); verify `threshold === N`
    - **Property 2: Recharge ability name parsing**
    - **Validates: Requirements 1.2**

  - [x] 2.4 Write property test — Property 4: Limited-use ability parsing
    - Generate arbitrary descriptions with injected `N/day` or `N/encounter` patterns; verify `max === N`
    - **Property 4: Limited-use ability parsing**
    - **Validates: Requirements 1.6, 1.7**

  - [x] 2.5 Write property test — Property 1: Extractor finds resources in all collections
    - Generate statblocks with trackable resources distributed across any combination of the four collections; verify every resource appears in the returned `ResourceState`
    - **Property 1: Extractor finds resources in all collections**
    - **Validates: Requirements 1.1**

- [x] 3. Checkpoint — Ensure all extractor tests pass, ask the user if questions arise.

- [x] 4. Implement state mutation functions
  - [x] 4.1 Implement `applyRechargeRoll(ability, roll)`, `applyRound(state)`, `applyShortRest(state, statblock)`, and `applyLongRest(state, statblock)` in `resource-tracker.js`
    - `applyRound`: for each spent recharge ability roll a virtual d6 (`Math.ceil(Math.random() * 6)`); set `available = true` if `roll >= threshold`; record `lastRoll`; **also reset `state.reactionAvailable = true`** (reaction refreshes at the start of each turn/round)
    - `applyShortRest`: set short-rest `restAbilities` to available; restore short-rest `limitedUseAbilities` to max; roll hit dice (`hitDice` × hit die size + CON mod per die) and add to `currentHp` clamped to `maxHp`; restore all spell slots if any `castingClass` entry is `'warlock'`
    - `applyLongRest`: set `currentHp` to `maxHp`; set all `restAbilities` to available; restore all `spellSlots` and `limitedUseAbilities` to max; set all boolean conditions to `false`; reduce `exhaustion` by 1 to minimum 0; **reset `state.reactionAvailable = true`**
    - Implement `clampHp(value)` (lower bound 0) and `clampExhaustion(value)` (clamp to [0, 6])
    - Add `reactionAvailable: true` to the initial `ResourceState` returned by `extractResources`
    - _Requirements: 4.2, 4.3, 4.4, 5.2, 5.3, 5.4, 5.5, 6.2, 6.3, 7.2, 7.3, 11.7, 11.8_

  - [x] 4.2 Write property test — Property 7: Recharge roll threshold
    - Generate `(threshold, roll)` pairs; verify `available` is set correctly
    - **Property 7: Recharge roll threshold**
    - **Validates: Requirements 4.3, 4.4**

  - [x] 4.3 Write property test — Property 8: Long rest restores all resources
    - Generate arbitrary `ResourceState` objects; verify all long-rest postconditions hold
    - **Property 8: Long rest restores all resources**
    - **Validates: Requirements 5.3, 5.4, 6.2, 7.2, 11.7, 11.8**

  - [x] 4.4 Write property test — Property 9: Short rest restores short-rest resources
    - Generate arbitrary `ResourceState` objects; verify short-rest postconditions hold
    - **Property 9: Short rest restores short-rest resources**
    - **Validates: Requirements 5.2, 5.5, 6.3, 7.3**

  - [x] 4.5 Write property test — Property 3: Rest ability classification round-trip
    - Generate traits with `recharge: 'short'` or `recharge: 'long'`; verify `extractResources` classifies correctly and the appropriate rest function restores availability
    - **Property 3: Rest ability classification round-trip**
    - **Validates: Requirements 1.3, 1.4, 5.2, 5.3**

  - [x] 4.6 Write property test — Property 6: HP lower bound clamping
    - Generate arbitrary negative numbers; verify `clampHp` returns 0
    - **Property 6: HP lower bound clamping**
    - **Validates: Requirements 3.5**

  - [x] 4.7 Write property test — Property 12: Exhaustion bounds
    - Generate arbitrary integers; verify `clampExhaustion` clamps to [0, 6]
    - **Property 12: Exhaustion bounds**
    - **Validates: Requirements 11.4**

- [x] 5. Implement localStorage persistence
  - [x] 5.1 Implement `buildStorageKey(slug, cr, instanceNumber)`, `saveState(key, state)`, `loadState(key, defaultState)`, and `clearInstanceKeys(slug, cr)` in `resource-tracker.js`
    - `buildStorageKey`: returns `rt-state-{slug}-{cr}-{instanceNumber}` (slug and cr lowercased, spaces → hyphens)
    - `saveState`: `localStorage.setItem(key, JSON.stringify(state))`
    - `loadState`: wraps `JSON.parse(localStorage.getItem(key))` in try/catch; returns `defaultState` on failure or missing key
    - `clearInstanceKeys`: iterates `localStorage` keys and removes all matching `rt-state-{slug}-{cr}-*`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 5.2 Write property test — Property 11: State serialisation round-trip
    - Generate arbitrary `ResourceState` objects; verify JSON serialise → deserialise produces a deeply equal object
    - **Property 11: State serialisation round-trip**
    - **Validates: Requirements 9.2**

- [x] 6. Checkpoint — Ensure all state mutation and persistence tests pass, ask the user if questions arise.

- [x] 7. Implement `renderTracker` and `bindEvents` — DOM rendering and interactivity
  - [x] 7.1 Implement `renderTracker(state, statblock, el)` in `resource-tracker.js`
    - Clear `el` and rebuild the full tracker DOM from `state` per the HTML structure in the design doc
    - Render header with `rt-instance-label`
    - Render HP section with `rt-hp-input`, `rt-hp-max`, `rt-hp-dec`/`rt-hp-inc` buttons; apply `rt-hp--zero` / `rt-hp--over` classes
    - **Render reaction toggle**: a single checkbox or toggle button labeled "Reaction available", bound to `state.reactionAvailable`; when unchecked/spent, show a visually distinct style (e.g. strikethrough or muted)
    - Render recharge abilities section (skip if empty); each row has a toggle button and `rt-last-roll` span
    - Render rest abilities section (skip if empty); each row has a toggle button and `rt-rest-type` span
    - Render spell slots section (skip if empty); one row per level with checkboxes
    - Render limited-use abilities section (skip if empty); one row per ability with checkboxes
    - Render conditions section; omit immune conditions; render exhaustion stepper
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.3, 3.4, 4.5, 5.1, 6.1, 6.4, 7.1, 11.1, 11.2, 11.4, 11.5_

  - [x] 7.2 Implement `bindEvents(state, statblock, el, saveDebounced)` in `resource-tracker.js`
    - HP input change and `±` button clicks: update `state.currentHp` via `clampHp`; call `renderTracker` then `saveDebounced`
    - Recharge ability toggle clicks: flip `available`; call `renderTracker` then `saveDebounced`
    - Rest ability toggle clicks: flip `available`; call `renderTracker` then `saveDebounced`
    - Spell slot checkbox changes: update `remaining` count; call `renderTracker` then `saveDebounced`
    - Limited-use checkbox changes: update `remaining` count; call `renderTracker` then `saveDebounced`
    - Condition button clicks: flip boolean; call `renderTracker` then `saveDebounced`
    - Exhaustion stepper: update via `clampExhaustion`; call `renderTracker` then `saveDebounced`
    - **Reaction toggle click**: flip `state.reactionAvailable`; call `renderTracker` then `saveDebounced`
    - Debounce delay: 500 ms
    - _Requirements: 3.1, 3.2, 3.5, 4.1, 5.1, 6.1, 7.1, 9.1, 11.3, 11.5_

- [x] 8. Implement `initResourceTracker` — public API and controller object
  - Implement the exported `initResourceTracker(statblock, targetElement, instanceNumber)` function
  - Call `extractResources`, then `loadState` (restoring from localStorage if available), then `renderTracker`, then `bindEvents`
  - Create a debounced save function (500 ms) and pass it to `bindEvents`
  - Return `{ applyRound, applyShortRest, applyLongRest }` — each method mutates `state`, calls `renderTracker`, and calls `saveState` immediately (not debounced, since these are explicit user actions)
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 9. Add SCSS styles for the resource tracker
  - Add all `.resource-tracker`, `.rt-*` rules to `monster-scaler/src/styles/global.scss` per the SCSS section of the design doc
  - Include `$rtRed`, `$rtParchment`, `$rtBorder`, `$rtShadow` variables
  - Style the `.rt-page-controls` block, HP display, toggle buttons, checkboxes, condition grid, exhaustion stepper, and panel label
  - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 10. Wire resource tracker into `monsters.pug` and `monsters.js`
  - [x] 10.1 Add page-level tracker markup to `monster-scaler/src/pages/monsters.pug`
    - Add `#resource-tracker` block immediately after `#monster-stats.container` per the design doc pug snippet
    - Include quantity input `#tracker-quantity`, round display `#rt-round-display`, and the three buttons `#rt-btn-round`, `#rt-btn-short-rest`, `#rt-btn-long-rest`
    - Add `#resource-tracker-instances` container for per-instance tracker divs
    - _Requirements: 8.1, 8.3, 10.1_

  - [x] 10.2 Wire `initResourceTracker` into `calculateSelectedMonster()` in `monster-scaler/src/scripts/monsters.js`
    - Import `initResourceTracker` from `./resource-tracker.js`
    - After `renderStatblock(monsterStats)`, read `#tracker-quantity`, clear `#resource-tracker-instances`, and create N tracker instances in a loop
    - Store the tracker controller array; wire `#rt-btn-round` to call `applyRound()` on all instances and increment `#rt-round-display`
    - Wire `#rt-btn-short-rest` and `#rt-btn-long-rest` to call the corresponding method on all instances
    - Before creating new instances, call `clearInstanceKeys` for the previous slug+CR to clean up stale localStorage
    - Reset `#rt-round-display` to "Round 1" on each monster/CR change
    - Wire `#tracker-quantity` change event to tear down and recreate instances (same teardown-and-recreate logic)
    - _Requirements: 2.1, 2.8, 8.2, 8.3, 9.3, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [x] 11. Final checkpoint — Ensure all tests pass and the tracker renders correctly for a known monster (e.g. Giant Spider with its Web recharge ability). Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Build order: `toolkit5e` packages first (`cd toolkit5e && npm run build`), then the monster-scaler site (`cd monster-scaler && npm run build`)
- `fast-check` must be added as a dev dependency in `monster-scaler/` before writing property tests
- Property tests use the tag format `// Feature: resource-tracker, Property N: <property text>`
- The `SPELL_SLOTS` table is defined inline in `resource-tracker.js` — it is not imported from any package
- `initResourceTracker` has no dependency on page globals; it can be imported identically from `sidekicks.js` in the future
