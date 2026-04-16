# Resource Tracker — Design Document

## Overview

The Resource Tracker is an interactive UI section rendered immediately below the statblock on the monster scaler page. It tracks the live encounter state of a single monster instance: current hit points, recharge ability status, rest-recovery ability status, spell slot expenditure, limited-use ability tracking, and active conditions. State is persisted to `localStorage` with debounced writes, and multiple simultaneous instances of the same monster are disambiguated by auto-generated sequential labels ("Goblin #1", "Goblin #2").

The tracker is implemented as a self-contained ES module (`resource-tracker.js`) within the monster-scaler site's `src/scripts/` directory. It exports a single `initResourceTracker(statblock, targetElement)` function, mirroring the calling convention of `renderStatblock`. It has no page-specific dependencies and can be imported from both `monsters.js` and `sidekicks.js`.

A prerequisite data model change adds an optional `recharge?: 'short' | 'long'` field to the `Trait` interface in `@toolkit5e/base`, allowing monster template authors to declare rest-recovery semantics structurally rather than relying on runtime text parsing.

---

## Architecture

### Module Boundaries

```
monster-scaler/src/scripts/
  resource-tracker.js     ← new module (this feature)
  monsters.js             ← calls initResourceTracker after renderStatblock
  sidekicks.js            ← future caller
  global.js               ← unchanged
  data.js                 ← unchanged

toolkit5e/packages/base/src/
  types.ts                ← add recharge field to Trait interface (public API)
  data.ts / monsters.ts   ← annotate relevant traits with recharge field
```

The toolkit5e package changes (`types.ts`, `data.ts`, `monsters.ts`) are a prerequisite: they must be built and the updated packages available before the site-side resource tracker work begins. The `recharge` field on `Trait` is part of `@toolkit5e/base`'s public API and the resource tracker depends on it being present at runtime.

### Data Flow

```
monsters.js
  scaleMonster() → statblock
  renderStatblock(statblock, .stat-block)
  initResourceTracker(statblock, #resource-tracker-container)
                          │
                          ▼
              resource-tracker.js
                extractResources(statblock)
                          │
                          ▼
                    ResourceState
                          │
                  ┌───────┴────────┐
                  ▼                ▼
            renderUI(state)   localStorage
            (DOM updates)     (debounced)
```

### Call Site in monsters.js

```js
import { initResourceTracker } from './resource-tracker.js';

// inside calculateSelectedMonster(), after renderStatblock():
renderStatblock(monsterStats);

const quantity = parseInt(document.getElementById('tracker-quantity').value, 10) || 1;
const container = document.getElementById('resource-tracker-instances');
container.innerHTML = '';

const trackers = [];
for (let i = 1; i <= quantity; i++) {
  const el = document.createElement('div');
  el.className = 'resource-tracker-instance';
  container.appendChild(el);
  trackers.push(initResourceTracker(monsterStats, el, i));
}

// Wire page-level controls
document.getElementById('rt-btn-round').onclick = () => trackers.forEach(t => t.applyRound());
document.getElementById('rt-btn-short-rest').onclick = () => trackers.forEach(t => t.applyShortRest());
document.getElementById('rt-btn-long-rest').onclick = () => trackers.forEach(t => t.applyLongRest());
```

`initResourceTracker` returns a controller object with three methods (`applyRound`, `applyShortRest`, `applyLongRest`) that `monsters.js` calls on all instances when a page-level button is clicked. The page-level controls are rendered once by `monsters.js`, not by `initResourceTracker`.

The `#resource-tracker` div, the page-level controls, and a quantity input are added to `monsters.pug` immediately after `#monster-stats`:

```pug
#monster-stats.container
  .stat-block
#resource-tracker
  .rt-page-controls
    input#tracker-quantity(type='number' min='1' value='1')
    span#rt-round-display Round 1
    button#rt-btn-round Next Round
    button#rt-btn-short-rest Short Rest
    button#rt-btn-long-rest Long Rest
  #resource-tracker-instances
```

When the quantity input changes, the same teardown-and-recreate logic runs: all previous `rt-state-{slug}-{cr}-*` localStorage keys are deleted, then N new instances are initialised with fresh state and the page-level button handlers are re-wired to the new tracker array.

---

## Components and Interfaces

### Public API

```js
/**
 * Initialises the Resource Tracker for a statblock.
 * @param {Object} statblock       Fully resolved statblock from scaleMonster()
 * @param {HTMLElement} targetElement  Container element to render into
 * @param {number} instanceNumber  Positional index (1-based) for this instance
 * @returns {{ applyRound: Function, applyShortRest: Function, applyLongRest: Function }}
 *   Controller object — monsters.js calls these on all instances when a page-level button is clicked
 */
export function initResourceTracker(statblock, targetElement, instanceNumber)
```

### Internal Module Structure

```
initResourceTracker(statblock, targetElement, instanceNumber)
  ├── extractResources(statblock, instanceNumber) → ResourceState
  ├── loadState(storageKey, ResourceState)         → ResourceState (merged from localStorage)
  ├── renderTracker(state, statblock, el)          → void (builds DOM)
  └── bindEvents(state, statblock, el)             → void (attaches handlers + schedules saves)
  └── returns { applyRound, applyShortRest, applyLongRest }
```

**extractResources(statblock)** — pure function; scans all trait/action collections and returns an initial `ResourceState`.

**renderTracker(state, statblock, el)** — pure DOM builder; clears `el` and rebuilds the full tracker UI from `state`.

**bindEvents(state, statblock, el)** — attaches all event listeners; on any state mutation calls `renderTracker` then schedules a debounced `saveState`.

**saveState / loadState** — thin wrappers around `localStorage.setItem` / `getItem` with JSON serialisation.

---

## Data Models

### Trait Interface Change (`@toolkit5e/base/src/types.ts`)

Add one optional field to the existing `Trait` interface:

```ts
export interface Trait {
  // ... existing fields ...
  recharge?: 'short' | 'long';
}
```

This is a public API addition to `@toolkit5e/base`, exported as part of the `Trait` interface. It is a non-breaking additive change — existing consumers are unaffected because the field is optional. Any consumer of the package (VTT integrations, initiative trackers, other encounter tools) can read `trait.recharge` directly without parsing description text.

The annotation work in `data.ts` and `monsters.ts` should be thorough — covering all traits and actions that have rest-based recovery, not only the ones the resource tracker happens to need. This makes the structured data genuinely useful to the broader ecosystem of package consumers.

This field is orthogonal to the "Recharge X–6" dice-roll pattern in ability names. It declares rest-based recovery for:
- Rest abilities (e.g. Legendary Resistance — `recharge: 'long'`)
- Limited-use abilities that recover on a short rest (e.g. a 3/day ability that comes back on a short rest — `recharge: 'short'`)
- Limited-use abilities without this field default to long-rest recovery only

### ResourceState Shape

```js
/**
 * Full mutable encounter state for one monster instance.
 * Serialised to / deserialised from localStorage as JSON.
 */
{
  // Identity
  instanceLabel: string,          // e.g. "Goblin #1"
  maxHp: number,                  // from statblock at init time

  // Hit points
  currentHp: number,              // lower bound 0, no upper bound

  // Recharge abilities (dice-roll recharge, e.g. "Fire Breath (Recharge 5–6)")
  rechargeAbilities: [
    {
      key: string,                // trait/action key in statblock
      name: string,               // display name
      threshold: number,          // minimum d6 roll to recharge (e.g. 5)
      available: boolean,         // true = ready, false = spent
      lastRoll: number | null,    // result of most recent recharge roll
    }
  ],

  // Rest abilities (recharge field on Trait object)
  restAbilities: [
    {
      key: string,
      name: string,
      restType: 'short' | 'long',
      available: boolean,
    }
  ],

  // Spell slots — derived from standard 5e table
  spellSlots: [
    {
      level: number,              // 1–9
      max: number,
      remaining: number,          // 0..max
    }
  ],

  // Limited-use abilities (N/day or N/encounter in description)
  limitedUseAbilities: [
    {
      key: string,
      name: string,
      max: number,
      remaining: number,          // 0..max
      recharge: 'short' | 'long' | null,  // null = long rest only
    }
  ],

  // Conditions
  conditions: {
    blinded: boolean,
    charmed: boolean,
    frightened: boolean,
    grappled: boolean,
    paralyzed: boolean,
    petrified: boolean,
    poisoned: boolean,
    prone: boolean,
    restrained: boolean,
    unconscious: boolean,
  },
  exhaustion: number,             // 0–6
}
```

### Standard 5e Spell Slot Table

Included inline in `resource-tracker.js` as a constant. Indexed by class name (lowercase), then by level (1–20), returning an array of slot counts per spell level (indices 0–8 for levels 1–9).

```js
const SPELL_SLOTS = {
  // Full casters (Bard, Cleric, Druid, Sorcerer, Wizard)
  bard:     [ [2],[3],[4,2],[4,3],[4,3,2],[4,3,3],[4,3,3,1],[4,3,3,2],[4,3,3,3,1],[4,3,3,3,2],[4,3,3,3,2,1],[4,3,3,3,2,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1,1],[4,3,3,3,3,1,1,1,1],[4,3,3,3,3,2,1,1,1],[4,3,3,3,3,2,2,1,1] ],
  cleric:   /* same as bard */ ...,
  druid:    /* same as bard */ ...,
  sorcerer: /* same as bard */ ...,
  wizard:   /* same as bard */ ...,
  // Half casters (Paladin, Ranger) — slots start at level 2
  paladin:  [ [],[2],[3],[3],[4,2],[4,2],[4,3],[4,3],[4,3,2],[4,3,2],[4,3,3],[4,3,3],[4,3,3,1],[4,3,3,1],[4,3,3,2],[4,3,3,2],[4,3,3,3,1],[4,3,3,3,1],[4,3,3,3,2],[4,3,3,3,2] ],
  ranger:   /* same as paladin */ ...,
  // Warlock — short-rest recovery, pact slots only
  warlock:  [ [1],[2],[0,2],[0,2],[0,0,2],[0,0,2],[0,0,0,2],[0,0,0,2],[0,0,0,0,2],[0,0,0,0,2],[0,0,0,0,3],[0,0,0,0,3],[0,0,0,0,3],[0,0,0,0,3],[0,0,0,0,3],[0,0,0,0,3],[0,0,0,0,4],[0,0,0,0,4],[0,0,0,0,4],[0,0,0,0,4] ],
};
```

When `statblock.castingClass` is an array (e.g. `['bard', 'warlock']`), the extractor uses the first entry. Warlock detection for short-rest slot recovery checks whether any entry in `castingClass` is `'warlock'`.

### localStorage Schema

**State key** (one per tracker instance):
```
rt-state-{slug}-{cr}-{instanceNumber}
```
Value: JSON-serialised `ResourceState`.

Example: `rt-state-goblin-0.25-1`, `rt-state-goblin-0.25-2`.

The slug comes from `statblock.slug`; CR from `statblock.cr`. Both are lowercased and have any spaces replaced with hyphens before use in the key.

Instance numbers are assigned positionally (1..N) based on the current render, not from a persisted counter. There is no `rt-counter-{slug}-{cr}` key.

When the monster or CR changes, or when the quantity input changes, all `rt-state-{slug}-{cr}-*` keys for the previous slug+CR combination are deleted from localStorage before new instances are created.

---

## Extractor Logic

`extractResources(statblock)` scans four collections in order: `traits`, `actions`, `bonusActions`, `legendaryActions`. For each entry it applies the following classification rules (non-exclusive — an ability can be both a rest ability and a limited-use ability):

```
// Special case: Legendary Resistance — classified as a Limited_Use_Ability, NOT a Rest_Ability
if statblock.legendaryResistances is set and > 0:
  → add to limitedUseAbilities:
      { key: 'legendaryResistance', name: 'Legendary Resistance',
        max: statblock.legendaryResistances, remaining: statblock.legendaryResistances,
        recharge: 'long' }
  → the 'legendaryResistance' trait key is added to a skip-set for the classification pass below

for each (key, trait) in [traits, actions, bonusActions, legendaryActions]:
  if key is in the skip-set (e.g. 'legendaryResistance'), skip this entry

  1. Recharge ability check:
     if trait.name matches /\(Recharge (\d)[–-]6\)/
       → add to rechargeAbilities with threshold = parseInt(capture group 1)

  2. Rest ability check:
     if trait.recharge === 'short' or trait.recharge === 'long'
       → add to restAbilities with restType = trait.recharge

  3. Limited-use ability check:
     if trait.description matches /(\d+)\/(day|encounter)/i
       → add to limitedUseAbilities with max = parseInt(capture group 1)
         and recharge = trait.recharge ?? null
         Note: spell-like abilities (e.g. dryad's "3/day" spells) are correctly handled
         here by the pattern on the trait description — no special-casing needed.
```

HP initialisation:
```
maxHp = computed from statblock.hitDice, size hit die, CON modifier, bonusHP
      = averageRoll(hitDice, hitDieSize) + (conMod * hitDice) + bonusHP
```
This mirrors the calculation in the statblock renderer.

Spell slot derivation:
```
if statblock.level && statblock.castingClass:
  classKey = Array.isArray(castingClass) ? castingClass[0] : castingClass
  slots = SPELL_SLOTS[classKey.toLowerCase()]?.[statblock.level - 1] ?? []
  → produce spellSlots entries for each level where slots[i] > 0
```

Condition initialisation: all boolean conditions default to `false`; exhaustion defaults to `0`. Conditions present in `statblock.conditionImmunities` are omitted from the `conditions` object entirely.

---

## UI Component Breakdown

The tracker renders as a single `<div class="resource-tracker">` containing these sections:

### Page-Level Controls

Rendered once by `monsters.js` above the tracker instances, not by `initResourceTracker`. Contains the quantity input, shared round counter, and the three action buttons.

```html
<div class="rt-page-controls">
  <input id="tracker-quantity" type="number" min="1" value="1">
  <span id="rt-round-display" class="rt-round-display">Round 1</span>
  <button id="rt-btn-round" class="rt-btn rt-btn--round">Next Round</button>
  <button id="rt-btn-short-rest" class="rt-btn rt-btn--short-rest">Short Rest</button>
  <button id="rt-btn-long-rest" class="rt-btn rt-btn--long-rest">Long Rest</button>
</div>
```

The round counter (`#rt-round-display`) is maintained by `monsters.js`: it increments on each `applyRound` call and resets to "Round 1" when the monster or CR changes.

### Header
```html
<div class="rt-header">
  <span class="rt-instance-label">Goblin #1</span>
</div>
```

### HP Section
```html
<div class="rt-section rt-hp">
  <label>Hit Points</label>
  <div class="rt-hp-display">
    <button class="rt-hp-dec">−</button>
    <input type="number" class="rt-hp-input" min="0" value="52">
    <span class="rt-hp-sep">/</span>
    <span class="rt-hp-max">52</span>
    <button class="rt-hp-inc">+</button>
  </div>
</div>
```
- When `currentHp === 0`: add class `rt-hp--zero` to `.rt-hp-display`
- When `currentHp > maxHp`: add class `rt-hp--over` to `.rt-hp-display`

### Recharge Abilities Section
```html
<div class="rt-section rt-recharge-abilities">
  <h4>Recharge Abilities</h4>
  <div class="rt-row" data-key="fireBreath">
    <button class="rt-toggle rt-toggle--available" aria-pressed="false">
      Fire Breath (Recharge 5–6)
    </button>
    <span class="rt-last-roll">Rolled: 4</span>
  </div>
</div>
```
Toggle button: `rt-toggle--available` when ready, `rt-toggle--spent` when spent. `aria-pressed` reflects spent state.

### Rest Abilities Section
```html
<div class="rt-section rt-rest-abilities">
  <h4>Rest Abilities</h4>
  <div class="rt-row" data-key="secondWind">
    <button class="rt-toggle rt-toggle--available">
      Second Wind
    </button>
    <span class="rt-rest-type">Short Rest</span>
  </div>
</div>
```
Note: Legendary Resistance is NOT rendered here — it appears in the Limited Use section as checkboxes (e.g. three checkboxes for "Legendary Resistance (3/Day)").

### Spell Slots Section
```html
<div class="rt-section rt-spell-slots">
  <h4>Spell Slots</h4>
  <div class="rt-row">
    <span class="rt-slot-label">3rd level</span>
    <div class="rt-checkboxes">
      <input type="checkbox" class="rt-slot-checkbox" data-level="3" data-index="0">
      <input type="checkbox" class="rt-slot-checkbox" data-level="3" data-index="1">
      <input type="checkbox" class="rt-slot-checkbox" data-level="3" data-index="2">
    </div>
  </div>
</div>
```
Checked = expended. Unchecked = available.

### Limited-Use Abilities Section
```html
<div class="rt-section rt-limited-use">
  <h4>Limited Use</h4>
  <div class="rt-row" data-key="breathWeapon">
    <span class="rt-ability-name">Breath Weapon (3/day)</span>
    <div class="rt-checkboxes">
      <input type="checkbox" class="rt-use-checkbox" data-key="breathWeapon" data-index="0">
      <input type="checkbox" class="rt-use-checkbox" data-key="breathWeapon" data-index="1">
      <input type="checkbox" class="rt-use-checkbox" data-key="breathWeapon" data-index="2">
    </div>
  </div>
</div>
```

### Conditions Section
```html
<div class="rt-section rt-conditions">
  <h4>Conditions</h4>
  <div class="rt-condition-grid">
    <button class="rt-condition" data-condition="blinded" aria-pressed="false">Blinded</button>
    <button class="rt-condition" data-condition="charmed" aria-pressed="false">Charmed</button>
    <!-- ... other conditions ... -->
  </div>
  <div class="rt-exhaustion">
    <label for="rt-exhaustion-input">Exhaustion</label>
    <button class="rt-exhaustion-dec">−</button>
    <input type="number" id="rt-exhaustion-input" min="0" max="6" value="0">
    <button class="rt-exhaustion-inc">+</button>
  </div>
</div>
```
Active condition buttons get class `rt-condition--active` and `aria-pressed="true"`.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Extractor finds resources in all collections

*For any* statblock with trackable resources (recharge abilities, rest abilities, or limited-use abilities) distributed across any combination of `traits`, `actions`, `bonusActions`, and `legendaryActions`, `extractResources` shall return a `ResourceState` that includes an entry for every such resource regardless of which collection it appears in.

**Validates: Requirements 1.1**

### Property 2: Recharge ability name parsing

*For any* trait or action whose name contains the pattern `(Recharge N–6)` where N is a digit 2–5, `extractResources` shall classify it as a recharge ability with `threshold === N`.

**Validates: Requirements 1.2**

### Property 3: Rest ability classification round-trip

*For any* trait with `recharge: 'short'` or `recharge: 'long'`, `extractResources` shall classify it as a rest ability with the matching `restType`, and `applyShortRest` / `applyLongRest` shall restore it to `available: true` on the appropriate rest.

**Validates: Requirements 1.3, 1.4, 5.2, 5.3**

### Property 4: Limited-use ability parsing

*For any* trait description containing the pattern `N/day` or `N/encounter` (where N is a positive integer), `extractResources` shall classify it as a limited-use ability with `max === N`.

**Validates: Requirements 1.6, 1.7**

### Property 5: ResourceState completeness

*For any* statblock, `extractResources` shall return a `ResourceState` with all required top-level fields present (`instanceLabel`, `maxHp`, `round`, `currentHp`, `rechargeAbilities`, `restAbilities`, `spellSlots`, `limitedUseAbilities`, `conditions`, `exhaustion`), with `currentHp` initialised to `maxHp`, `exhaustion` initialised to `0`, and all boolean conditions initialised to `false`.

**Validates: Requirements 1.8**

### Property 6: HP lower bound clamping

*For any* attempted HP value less than 0, the HP update logic shall clamp the stored `currentHp` to 0.

**Validates: Requirements 3.5**

### Property 7: Recharge roll threshold

*For any* spent recharge ability with threshold T and a virtual d6 roll R: if R >= T then `applyRechargeRoll` shall set `available` to `true`; if R < T then `available` shall remain `false`.

**Validates: Requirements 4.3, 4.4**

### Property 8: Long rest restores all resources

*For any* `ResourceState`, `applyLongRest` shall: set `currentHp` to `maxHp`; set all `restAbilities` to `available: true`; restore all `spellSlots[i].remaining` to `spellSlots[i].max`; restore all `limitedUseAbilities[i].remaining` to `limitedUseAbilities[i].max`; set all boolean conditions to `false`; and reduce `exhaustion` by 1 to a minimum of 0.

**Validates: Requirements 5.3, 5.4, 6.2, 7.2, 11.7, 11.8**

### Property 9: Short rest restores short-rest resources

*For any* `ResourceState`, `applyShortRest` shall: set all `restAbilities` with `restType === 'short'` to `available: true`; restore all `limitedUseAbilities` with `recharge === 'short'` to their max; result in `currentHp` that is >= the pre-rest `currentHp` and <= `maxHp`; and (when `castingClass` includes `'warlock'`) restore all `spellSlots` to their max.

**Validates: Requirements 5.2, 5.5, 6.3, 7.3**

### Property 10: Spell slot table lookup

*For any* `(castingClass, level)` pair present in `SPELL_SLOTS`, `deriveSpellSlots` shall return slot counts that exactly match the standard 5e table for that class and level.

**Validates: Requirements 1.5**

### Property 11: State serialisation round-trip

*For any* `ResourceState`, serialising it to JSON and deserialising it shall produce a deeply equal object.

**Validates: Requirements 9.2**

### Property 12: Exhaustion bounds

*For any* exhaustion value, the exhaustion update logic shall clamp the stored value to the range [0, 6].

**Validates: Requirements 11.4**

---

## Error Handling

**Missing statblock fields** — `extractResources` treats all collections (`traits`, `actions`, `bonusActions`, `legendaryActions`) as optional. If any is `undefined` or `null`, it is skipped without error. If `hitDice` or `size` is missing, `maxHp` defaults to 1.

**Unknown casting class** — if `castingClass` is not found in `SPELL_SLOTS`, `spellSlots` is initialised to an empty array and no spell slot section is rendered.

**Corrupt localStorage** — `loadState` wraps `JSON.parse` in a try/catch. On parse failure the entry is discarded and fresh state is used.

**Monster or quantity change** — before creating new instances, all `rt-state-{slug}-{cr}-*` keys for the previous slug+CR combination are enumerated via `localStorage` key iteration and deleted. This ensures stale state from a previous monster or a larger quantity does not accumulate.

**HP input validation** — the HP `<input type="number">` has `min="0"` as a browser hint, but the event handler also enforces the lower bound programmatically via `Math.max(0, value)` to guard against direct DOM manipulation.

**Exhaustion input validation** — similarly clamped to [0, 6] in the event handler.

---

## Testing Strategy

### Unit Tests

Focus on the pure logic functions that have no DOM or localStorage dependencies:

- `extractResources(statblock)` — verify correct classification of recharge, rest, and limited-use abilities; verify HP initialisation; verify condition filtering against `conditionImmunities`
- `deriveSpellSlots(castingClass, level)` — verify against the full SPELL_SLOTS table for all classes and levels
- `applyRechargeRoll(ability, roll)` — verify threshold logic
- `applyShortRest(state, statblock)` — verify selective recovery
- `applyLongRest(state, statblock)` — verify full recovery
- `clampHp(value)` — verify lower bound
- `clampExhaustion(value)` — verify [0, 6] bounds
- `serializeState / deserializeState` — verify round-trip fidelity
- `buildStorageKey(slug, cr, instanceNumber)` — verify key format
- `clearInstanceKeys(slug, cr)` — verify all `rt-state-{slug}-{cr}-*` keys are removed from localStorage

### Property-Based Tests

Use [fast-check](https://github.com/dubzzz/fast-check) (already available in the JS ecosystem; add as a dev dependency in `monster-scaler/`). Each property test runs a minimum of 100 iterations.

Tag format: `// Feature: resource-tracker, Property N: <property text>`

Properties to implement as PBT:

- **Property 2** — generate arbitrary ability names with injected `(Recharge N–6)` patterns; verify threshold extraction
- **Property 4** — generate arbitrary descriptions with injected `N/day` or `N/encounter` patterns; verify max extraction
- **Property 5** — generate arbitrary statblocks; verify ResourceState completeness and default values
- **Property 6** — generate arbitrary negative numbers; verify HP clamping to 0
- **Property 7** — generate (threshold, roll) pairs; verify recharge logic
- **Property 8** — generate arbitrary ResourceState objects; verify long rest postconditions
- **Property 9** — generate arbitrary ResourceState objects; verify short rest postconditions
- **Property 11** — generate arbitrary ResourceState objects; verify JSON round-trip
- **Property 12** — generate arbitrary integers; verify exhaustion clamping to [0, 6]

### Integration / Example Tests

- Render a full tracker for a known statblock (e.g. Adult Red Dragon) and verify the DOM contains the expected sections
- Verify that selecting a new monster clears and re-renders the tracker and deletes previous localStorage keys
- Verify that changing the quantity input tears down existing instances and creates the correct number of new ones
- Verify that localStorage state is restored on re-initialisation with the same slug+CR+instance number

---

## SCSS Approach

Styles are added to `monster-scaler/src/styles/global.scss`. The tracker is a distinct "DM tool" panel — visually separate from the statblock rather than an extension of it. It uses a warmer, more worn parchment tone (`#F5E6C8`) and a simple ruled border, giving it the feel of a DM's encounter sheet or notepad rather than a Monster Manual entry. A margin gap and a labelled heading ("Encounter Tracker") make the boundary between the two panels explicit.

The statblock continues to look exactly as it does in the Monster Manual. The tracker sits below it as its own thing.

```scss
$rtRed: #922610;
$rtParchment: #F5E6C8;   // warmer, more worn than the statblock's #FDF1DC
$rtShadow: #867453;
$rtBorder: #8B6914;      // muted brown ruled border — distinct from the statblock's ornate double-rule

// Clear visual gap between the statblock and the tracker panel
#monster-stats {
  margin-bottom: 0;
}

.resource-tracker {
  // Distinct panel identity — DM encounter sheet, not a Monster Manual entry
  background: $rtParchment;
  border: 2px solid $rtBorder;
  box-shadow: 0 0 1.5em $rtShadow;
  max-width: 440px;
  margin: 24px auto 50px;  // top margin creates clear separation from the statblock above
  padding: 10px;
  font-family: sans-serif;
  font-size: 16px;
  text-align: left;

  // No ::before pseudo-element — the gold top bar was making the tracker look
  // like a continuation of the statblock. This panel has its own identity.

  h4 {
    color: $rtRed;
    font-variant: small-caps;
    border-bottom: 1px solid $rtBorder;
    font-size: 18px;
    font-weight: normal;
    margin: 10px 0 6px;
  }
}

// Section label that signals this is a different kind of UI from the statblock
.rt-panel-label {
  font-variant: small-caps;
  font-size: 13px;
  letter-spacing: 0.08em;
  color: $rtBorder;
  text-align: center;
  margin-bottom: 8px;
  border-bottom: 1px solid $rtBorder;
  padding-bottom: 4px;
}

.rt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  .rt-instance-label { font-weight: bold; color: $rtRed; }
}


.rt-hp-display {
  display: flex;
  align-items: center;
  gap: 6px;

  .rt-hp-input {
    width: 60px;
    text-align: center;
    font-size: 1.2em;
    margin: 0;
    min-width: unset;
  }

  .rt-hp-sep, .rt-hp-max { font-size: 1.1em; }

  &.rt-hp--zero .rt-hp-input { color: $rtRed; font-weight: bold; }
  &.rt-hp--over .rt-hp-input { color: #1a6e1a; font-weight: bold; }
}

.rt-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.rt-toggle {
  flex: 1;
  text-align: left;
  padding: 4px 8px;
  border: 1px solid $rtRed;
  background: transparent;
  cursor: pointer;
  font-size: 0.9em;

  &.rt-toggle--spent {
    background: #ddd;
    color: #888;
    text-decoration: line-through;
  }
}

.rt-checkboxes {
  display: flex;
  gap: 4px;

  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    margin: 0;
    min-width: unset;
    cursor: pointer;
  }
}

.rt-condition-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.rt-condition {
  padding: 3px 8px;
  border: 1px solid #aaa;
  background: transparent;
  cursor: pointer;
  font-size: 0.85em;
  border-radius: 3px;

  &.rt-condition--active {
    background: $rtRed;
    color: #fff;
    border-color: $rtRed;
  }
}

.rt-exhaustion {
  display: flex;
  align-items: center;
  gap: 6px;

  label { display: inline; margin: 0; }

  input[type='number'] {
    width: 50px;
    text-align: center;
    margin: 0;
    min-width: unset;
  }
}

.rt-page-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  max-width: 440px;
  margin: 16px auto 8px;
  padding: 8px 12px;
  background: darken($rtParchment, 6%);
  border: 1px solid $rtBorder;
  border-radius: 3px;

  #tracker-quantity {
    width: 56px;
    text-align: center;
    margin: 0;
    min-width: unset;
  }

  .rt-round-display {
    font-style: italic;
    color: #555;
    white-space: nowrap;
    margin-right: auto;  // pushes buttons to the right
  }

  .rt-btn {
    padding: 6px 10px;
    border: 1px solid $rtRed;
    background: transparent;
    color: $rtRed;
    cursor: pointer;
    font-variant: small-caps;
    font-size: 0.95em;

    &:hover { background: $rtRed; color: #fff; }
    &--round { font-weight: bold; }
  }
}

.rt-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;

  .rt-btn {
    flex: 1;
    min-width: 100px;
    padding: 6px 10px;
    border: 1px solid $rtRed;
    background: transparent;
    color: $rtRed;
    cursor: pointer;
    font-variant: small-caps;
    font-size: 0.95em;

    &:hover { background: $rtRed; color: #fff; }
    &--round { font-weight: bold; }
  }
}

.rt-rest-type, .rt-last-roll {
  font-size: 0.8em;
  color: #666;
  white-space: nowrap;
}
```

The tracker sits directly below the `.stat-block` div, sharing the same `max-width: 440px` and `margin: auto` so they align horizontally. A `24px` top margin and the "Encounter Tracker" panel label make it clear this is a separate UI panel, not a continuation of the statblock.
