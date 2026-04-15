# Requirements Document

## Introduction

The Resource Tracker is a new section rendered below the statblock on the monster scaler page. While the statblock reflects what a DM would find in the Monster Manual, the Resource Tracker reflects the live state of a particular monster during an encounter: current hit points, recharge ability status, spell slot expenditure, limited-use ability tracking, and active conditions. It provides interactive counters and checkboxes that a DM can update in real time, plus action buttons to advance the encounter (Next Round, Short Rest, Long Rest). State is persisted to `localStorage` so a DM can resume mid-encounter after a page reload, with automatic sequential instance labeling for running multiple copies of the same monster simultaneously.

Rest ability data is declared structurally on monster template `Trait` objects via an optional `recharge` field (`'short' | 'long'`), rather than inferred from description text at runtime. Adding this field to the `Trait` interface in `@toolkit5e/base` is a deliberate public API change to the package — not merely an internal implementation detail of the monster-scaler site. Any consumer of `@toolkit5e/base` (VTT integrations, initiative trackers, other encounter tools) can read this structured data directly without parsing description text. Relevant traits in `data.ts` and monster templates in `monsters.ts` shall be annotated thoroughly — covering all traits and actions with rest-based recovery, not only those the resource tracker happens to need.

The Resource Tracker is implemented as a reusable JavaScript module within the monster-scaler site (not in the toolkit5e packages), so it can be used on both the monsters page and the sidekicks page. It accepts a statblock object and a target DOM element as inputs, similar to how `renderStatblock` works.

## Glossary

- **Resource_Tracker**: The interactive UI section rendered below the statblock that tracks encounter-specific state for a single monster instance.
- **Recharge_Ability**: An action or trait whose name contains a "Recharge X–6" pattern (e.g. "Fire Breath (Recharge 5–6)"), indicating it recharges on a die roll at the start of each round.
- **Rest_Ability**: An action or trait whose `Trait` object carries a `recharge` field explicitly set to `'short'` or `'long'`, indicating it recharges on a short rest or only on a long rest respectively. Rest ability classification is declared on the monster template data, not inferred from description text at runtime. The `recharge` field is part of the public `@toolkit5e/base` `Trait` interface and is available to all package consumers — not only the resource tracker.
- **Spell_Slot**: A per-level expendable resource used by spellcasting monsters. Tracked as a count of remaining slots at each spell level.
- **Limited_Use_Ability**: An action or trait with a fixed number of uses per day or per encounter (e.g. "3/day", "1/day"). A Limited_Use_Ability may carry a `recharge` field (`'short' | 'long'`) on its `Trait` object indicating whether it recovers on a short rest (`'short'`) or only on a long rest (`'long'`). Abilities without a `recharge` field recover only on a long rest.
- **Extractor**: The client-side logic responsible for parsing a rendered `Statblock` object to produce a structured `ResourceState` describing all trackable resources.
- **ResourceState**: A plain JavaScript object capturing the full mutable encounter state for one monster instance: current HP, recharge ability states, rest ability states, spell slot counts, limited-use ability counts, and active conditions (including exhaustion level).
- **Condition**: One of the standard 5e conditions: blinded, charmed, exhaustion, frightened, grappled, paralyzed, petrified, poisoned, prone, restrained, unconscious. Exhaustion is tracked as a numeric level 0–6; all other conditions are boolean (active or inactive).
- **Instance_Label**: An auto-generated sequential identifier (e.g. "Goblin #1", "Goblin #2") used to distinguish multiple simultaneous instances of the same monster in `localStorage`. Labels are assigned automatically by incrementing a counter per monster slug+CR combination and are not user-editable.
- **Round_Button**: A page-level UI button that advances the encounter by one round for all active tracker instances simultaneously: ticks recharge ability rolls and updates their state across every instance.
- **Short_Rest_Button**: A page-level UI button that applies short-rest recovery to all active tracker instances simultaneously: recharges short-rest abilities and heals each monster by rolling its hit dice.
- **Long_Rest_Button**: A page-level UI button that applies long-rest recovery to all active tracker instances simultaneously: recharges all abilities and restores every monster to full hit points.

---

## Requirements

### Requirement 1: Extract Trackable Resources from Statblock

**User Story:** As a DM, I want the Resource Tracker to automatically identify all trackable resources from the current statblock, so that I do not have to manually configure what to track.

#### Acceptance Criteria

1. WHEN a statblock is rendered, THE Extractor SHALL scan all entries in `statblock.traits`, `statblock.actions`, `statblock.bonusActions`, and `statblock.legendaryActions` for trackable resources.
2. WHEN a trait or action name matches the pattern `\(Recharge (\d)[-–]6\)`, THE Extractor SHALL classify it as a Recharge_Ability and record the minimum recharge roll (the captured digit).
3. WHEN a trait or action object has a `recharge` field set to `'short'`, THE Extractor SHALL classify it as a Rest_Ability that recharges on a short rest.
4. WHEN a trait or action object has a `recharge` field set to `'long'`, THE Extractor SHALL classify it as a Rest_Ability that recharges only on a long rest.
5. WHEN `statblock.level` is set and `statblock.castingClass` is set, THE Extractor SHALL derive spell slot counts per level from the standard 5e spell slot table for that class and level.
6. WHEN a trait or action description contains a pattern matching `(\d+)/day`, THE Extractor SHALL classify it as a Limited_Use_Ability and record the maximum use count.
7. WHEN a trait or action description contains a pattern matching `(\d+)/encounter`, THE Extractor SHALL classify it as a Limited_Use_Ability and record the maximum use count.
8. THE Extractor SHALL produce a ResourceState containing: current HP (initialized to the statblock's maximum HP), one entry per Recharge_Ability (available/spent), one entry per Rest_Ability (available/spent), one entry per spell level with remaining slot count, one entry per Limited_Use_Ability with remaining use count, one boolean entry per non-immune non-exhaustion condition (initialized to inactive), and an exhaustion level (initialized to 0).
9. THE `@toolkit5e/base` package SHALL expose `recharge?: 'short' | 'long'` as a first-class optional field on the `Trait` interface, and relevant traits in `data.ts` and monster templates in `monsters.ts` SHALL be annotated with the appropriate `recharge` value so that any consumer of the package can access this structured data without parsing description text.

---

### Requirement 2: Display the Resource Tracker Section

**User Story:** As a DM, I want to see a Resource Tracker section below the statblock, so that I can monitor and update encounter state at a glance.

#### Acceptance Criteria

1. WHEN a statblock is rendered, THE Resource_Tracker SHALL be rendered immediately below the `.stat-block` div.
2. WHEN the current statblock has no trackable resources (no Recharge_Abilities, no Rest_Abilities, no spell slots, no Limited_Use_Abilities), THE Resource_Tracker SHALL display only the HP counter.
3. THE Resource_Tracker SHALL display a hit point counter showing current HP and maximum HP in the format `current / max`.
4. THE Resource_Tracker SHALL display one row per Recharge_Ability showing the ability name, its recharge threshold (e.g. "Recharge 5–6"), and a toggle indicating whether it is available or spent.
5. THE Resource_Tracker SHALL display one row per Rest_Ability showing the ability name, its rest type ("Short/Long Rest" or "Long Rest"), and a toggle indicating whether it is available or spent.
6. THE Resource_Tracker SHALL display one row per spell level that has slots, showing the level label (e.g. "3rd level") and a set of checkboxes equal to the slot count for that level.
7. THE Resource_Tracker SHALL display one row per Limited_Use_Ability showing the ability name, its maximum uses, and a set of checkboxes equal to the maximum use count.
8. WHEN a new monster or CR is selected, THE Resource_Tracker SHALL re-render and reset all resource state to initial values for the new statblock.

---

### Requirement 3: Interactive HP Tracking

**User Story:** As a DM, I want to adjust a monster's current hit points during an encounter, so that I can track damage, healing, and temporary HP accurately.

#### Acceptance Criteria

1. THE Resource_Tracker SHALL display a numeric input or stepper for current HP, with a lower bound of 0 and no upper bound.
2. WHEN the current HP input value is changed by the user, THE Resource_Tracker SHALL update the displayed current HP immediately.
3. WHEN current HP reaches 0, THE Resource_Tracker SHALL visually indicate that the monster is at 0 HP (e.g. a distinct style on the HP display).
4. WHEN current HP exceeds the statblock's maximum HP, THE Resource_Tracker SHALL display the HP value in a visually distinct style to indicate the monster has temporary HP or a bonus above its normal maximum (e.g. "125 / 100" rendered differently from a normal HP display).
5. IF the user attempts to set current HP below 0, THEN THE Resource_Tracker SHALL clamp the value to 0.

---

### Requirement 4: Interactive Recharge Ability Tracking

**User Story:** As a DM, I want to mark recharge abilities as spent and have them automatically roll for recharge at the start of each round, so that I can track breath weapons and similar abilities without manual die rolls.

#### Acceptance Criteria

1. WHEN a Recharge_Ability toggle is clicked, THE Resource_Tracker SHALL toggle the ability between available and spent states.
2. WHEN the Round_Button is clicked, THE Resource_Tracker SHALL roll a virtual d6 for each spent Recharge_Ability.
3. WHEN a virtual d6 roll meets or exceeds the ability's recharge threshold, THE Resource_Tracker SHALL set that ability's state to available.
4. WHEN a virtual d6 roll does not meet the recharge threshold, THE Resource_Tracker SHALL leave that ability's state as spent.
5. THE Resource_Tracker SHALL display the result of each recharge roll (the number rolled) alongside the ability row after a round is advanced.

---

### Requirement 5: Interactive Rest Ability Tracking

**User Story:** As a DM, I want to mark rest-recharge abilities as spent and have them automatically recover on the appropriate rest button, so that I can track abilities like Legendary Resistance without manual bookkeeping.

#### Acceptance Criteria

1. WHEN a Rest_Ability toggle is clicked, THE Resource_Tracker SHALL toggle the ability between available and spent states.
2. WHEN the Short_Rest_Button is clicked, THE Short_Rest_Button SHALL set all short-rest Rest_Abilities to available across ALL active tracker instances simultaneously.
3. WHEN the Long_Rest_Button is clicked, THE Long_Rest_Button SHALL set all Rest_Abilities (both short-rest and long-rest) to available across ALL active tracker instances simultaneously.
4. WHEN the Long_Rest_Button is clicked, THE Long_Rest_Button SHALL restore current HP to the statblock's maximum HP for ALL active tracker instances simultaneously.
5. WHEN the Short_Rest_Button is clicked, THE Short_Rest_Button SHALL roll the hit dice for each active tracker instance (rolling `statblock.hitDice` dice of the monster's hit die size, adding the CON modifier once per die) and add the total to that instance's current HP, clamped to the statblock's maximum HP.

---

### Requirement 6: Interactive Spell Slot Tracking

**User Story:** As a DM, I want to check off spell slots as they are expended, so that I can track a spellcasting monster's remaining casting resources.

#### Acceptance Criteria

1. WHEN a spell slot checkbox is clicked, THE Resource_Tracker SHALL toggle that slot between available (unchecked) and expended (checked).
2. WHEN the Long_Rest_Button is clicked, THE Resource_Tracker SHALL restore all spell slots to their maximum counts (all checkboxes unchecked).
3. WHEN the Short_Rest_Button is clicked and the monster's casting class is Warlock, THE Resource_Tracker SHALL restore all spell slots to their maximum counts.
4. WHERE the monster has no spellcasting trait, THE Resource_Tracker SHALL not render any spell slot rows.

---

### Requirement 7: Interactive Limited-Use Ability Tracking

**User Story:** As a DM, I want to check off limited-use abilities as they are used, so that I can track per-day or per-encounter abilities accurately.

#### Acceptance Criteria

1. WHEN a Limited_Use_Ability checkbox is clicked, THE Resource_Tracker SHALL toggle that use between available (unchecked) and expended (checked).
2. WHEN the Long_Rest_Button is clicked, THE Resource_Tracker SHALL restore all Limited_Use_Abilities to their maximum use counts (all checkboxes unchecked).
3. WHEN the Short_Rest_Button is clicked, THE Resource_Tracker SHALL restore all Limited_Use_Abilities whose `recharge` field is `'short'` to their maximum use counts.

---

### Requirement 8: Round Advancement

**User Story:** As a DM, I want a "Next Round" button that handles all start-of-round bookkeeping automatically, so that I can focus on running the encounter.

#### Acceptance Criteria

1. THE monsters page SHALL display a single Round_Button labeled "Next Round" as a page-level control, not within any individual tracker instance.
2. WHEN the Round_Button is clicked, THE Round_Button SHALL perform recharge rolls for all spent Recharge_Abilities across ALL active tracker instances simultaneously (per Requirement 4).
3. WHEN the Round_Button is clicked, THE Round_Button SHALL increment a shared round counter and display the current round number in the page-level controls area.

---

### Requirement 9: Persist State to localStorage

**User Story:** As a DM, I want the encounter state to be saved automatically so that I can reload the page mid-encounter without losing my tracking data.

#### Acceptance Criteria

1. WHEN any resource state value changes (HP, ability toggle, slot checkbox, use checkbox), THE Resource_Tracker SHALL write the current ResourceState to `localStorage` within 500ms of the change.
2. WHEN the page loads and a matching `localStorage` entry exists for the current monster and Instance_Label, THE Resource_Tracker SHALL restore the ResourceState from storage instead of initializing to defaults.
3. WHEN a new monster or CR is selected, THE Resource_Tracker SHALL discard any previously loaded ResourceState and initialize fresh state for the new statblock.
4. THE Resource_Tracker SHALL store each instance's ResourceState under a key derived from the monster slug, CR, and auto-generated Instance_Label.
5. WHEN the user selects a different monster or CR, THE Resource_Tracker SHALL delete all localStorage entries (both state keys and the counter key) associated with the previous monster slug+CR combination.

---

### Requirement 10: Instance Disambiguation

**User Story:** As a DM running multiple instances of the same monster (e.g. five goblins), I want each tracker to be automatically labeled so that their states are stored and restored separately without any manual naming.

#### Acceptance Criteria

1. THE monsters page SHALL display a quantity input (numeric, min 1, default 1) that controls how many tracker instances are rendered for the current statblock.
2. WHEN a statblock is rendered, THE monsters page SHALL render a number of Resource_Tracker instances equal to the current quantity input value, each in its own container element below the statblock.
3. THE Resource_Tracker SHALL assign each instance an Instance_Label sequentially based on its position in the current render (e.g. "Goblin #1", "Goblin #2"), numbered 1 through N.
4. THE Resource_Tracker SHALL store each instance's ResourceState under a key derived from the monster slug, CR, and instance number.
5. THE Resource_Tracker SHALL display the current Instance_Label as a read-only label so the DM can identify which instance they are viewing.
6. WHEN the quantity input changes, THE Resource_Tracker SHALL tear down all existing tracker instances and render a new set of instances equal to the new quantity, each initialized to fresh state.
7. WHEN the monster or CR changes, THE Resource_Tracker SHALL tear down all existing tracker instances and render a new set of instances equal to the current quantity, each initialized to fresh state for the new statblock.

---

### Requirement 11: Active Condition Tracking

**User Story:** As a DM, I want to track which conditions are currently affecting a monster, so that I can remember ongoing effects without relying on physical tokens or notes.

#### Acceptance Criteria

1. THE Resource_Tracker SHALL display interactive toggles for each of the standard 5e conditions: blinded, charmed, frightened, grappled, paralyzed, petrified, poisoned, prone, restrained, and unconscious.
2. WHEN `statblock.conditionImmunities` contains a condition name, THE Resource_Tracker SHALL omit that condition's toggle entirely from the display.
3. WHEN a condition toggle is clicked, THE Resource_Tracker SHALL toggle that condition between active and inactive states.
4. THE Resource_Tracker SHALL display exhaustion as a numeric stepper bounded between 0 and 6, rather than as a boolean toggle.
5. WHEN the exhaustion stepper value is changed by the user, THE Resource_Tracker SHALL update the displayed exhaustion level immediately.
6. THE ResourceState SHALL include the active state of each non-exhaustion condition and the current exhaustion level (0–6), and these values SHALL be persisted to `localStorage` alongside all other resource state.
7. WHEN the Long_Rest_Button is clicked, THE Resource_Tracker SHALL clear all active conditions (set all boolean conditions to inactive).
8. WHEN the Long_Rest_Button is clicked, THE Resource_Tracker SHALL reduce the exhaustion level by 1 (to a minimum of 0), rather than clearing it entirely.

---

### Requirement 12: Reusable Module Interface

**User Story:** As a developer, I want the Resource Tracker to be a reusable module within the monster-scaler site, so that it can be used on both the monsters page and the sidekicks page without duplication.

#### Acceptance Criteria

1. THE Resource_Tracker module SHALL be implemented as a JavaScript module within the monster-scaler site's `src/scripts/` directory, not as a toolkit5e package.
2. THE Resource_Tracker module SHALL export a single initializer function that accepts a statblock object and a target DOM element as its two required parameters, consistent with the calling convention of `renderStatblock`.
3. WHEN the initializer function is called with a statblock and a target element, THE Resource_Tracker SHALL render its UI into the provided target element.
4. THE Resource_Tracker module SHALL not depend on any page-specific globals or DOM structure outside of the provided target element, so that it can be imported and used identically from both `monsters.js` and `sidekicks.js`.
