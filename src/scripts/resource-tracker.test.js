// Feature: resource-tracker, Property 5: ResourceState completeness

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { extractResources, applyRechargeRoll, clampHp, clampExhaustion, applyLongRest, applyShortRest } from './resource-tracker.js';

// ---------------------------------------------------------------------------
// Arbitrary generators
// ---------------------------------------------------------------------------

const SIZES = ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan'];
const CONDITIONS = [
  'blinded', 'charmed', 'frightened', 'grappled',
  'paralyzed', 'petrified', 'poisoned', 'prone',
  'restrained', 'unconscious',
];
const CASTING_CLASSES = ['bard', 'cleric', 'druid', 'sorcerer', 'wizard', 'paladin', 'ranger', 'warlock'];

/** Arbitrary for a single trait object (no trackable resources — keeps the generator simple) */
const arbTrait = fc.record({
  name: fc.string({ minLength: 1, maxLength: 40 }),
  description: fc.string({ maxLength: 100 }),
});

/** Arbitrary for a traits/actions/bonusActions/legendaryActions collection (Record<string, Trait>) */
const arbCollection = fc.option(
  fc.dictionary(
    fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z]/.test(s)),
    arbTrait,
    { minKeys: 0, maxKeys: 5 },
  ),
  { nil: undefined },
);

/** Arbitrary for conditionImmunities — a subset of the standard conditions */
const arbConditionImmunities = fc.array(
  fc.constantFrom(...CONDITIONS),
  { minLength: 0, maxLength: CONDITIONS.length },
).map(arr => [...new Set(arr)]);

/** Arbitrary for an optional casting class + level pair */
const arbCasting = fc.option(
  fc.record({
    castingClass: fc.constantFrom(...CASTING_CLASSES),
    level: fc.integer({ min: 1, max: 20 }),
  }),
  { nil: undefined },
);

/** Arbitrary for a full statblock with optional fields */
const arbStatblock = fc.record({
  name: fc.string({ minLength: 1, maxLength: 40 }),
  hitDice: fc.integer({ min: 1, max: 20 }),
  size: fc.option(fc.constantFrom(1, 2, 3, 4, 5, 6), { nil: undefined }),
  conditionImmunities: fc.option(arbConditionImmunities, { nil: undefined }),
  legendaryResistances: fc.option(fc.integer({ min: 1, max: 5 }), { nil: undefined }),
  traits: arbCollection,
  actions: arbCollection,
  bonusActions: arbCollection,
  legendaryActions: arbCollection,
  casting: arbCasting,
}).map(({ casting, ...rest }) => ({
  ...rest,
  ...(casting ? { castingClass: casting.castingClass, level: casting.level } : {}),
}));

/** Arbitrary for instanceNumber (positive integer) */
const arbInstanceNumber = fc.integer({ min: 1, max: 100 });

// ---------------------------------------------------------------------------
// Required top-level fields on ResourceState
// ---------------------------------------------------------------------------
const REQUIRED_FIELDS = [
  'instanceLabel',
  'maxHp',
  'currentHp',
  'rechargeAbilities',
  'restAbilities',
  'spellSlots',
  'limitedUseAbilities',
  'conditions',
  'exhaustion',
  'reactionAvailable',
];

// ---------------------------------------------------------------------------
// Property 5: ResourceState completeness
// Validates: Requirements 1.8
// ---------------------------------------------------------------------------
describe('Property 5: ResourceState completeness', () => {
  it('extractResources returns a ResourceState with all required fields for any statblock', () => {
    fc.assert(
      fc.property(arbStatblock, arbInstanceNumber, (statblock, instanceNumber) => {
        const state = extractResources(statblock, instanceNumber);

        // All required top-level fields must be present
        for (const field of REQUIRED_FIELDS) {
          expect(state, `field "${field}" must be present`).toHaveProperty(field);
        }

        // currentHp must equal maxHp at initialisation
        expect(state.currentHp).toBe(state.maxHp);

        // exhaustion must be 0 at initialisation
        expect(state.exhaustion).toBe(0);

        // All boolean conditions must be false at initialisation
        for (const [condition, value] of Object.entries(state.conditions)) {
          expect(value, `condition "${condition}" must be false`).toBe(false);
        }
      }),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2: Recharge ability name parsing
// Feature: resource-tracker, Property 2: Recharge ability name parsing
// Validates: Requirements 1.2
// ---------------------------------------------------------------------------
describe('Property 2: Recharge ability name parsing', () => {
  it('extractResources correctly parses the recharge threshold from ability names', () => {
    // Arbitrary: a threshold N in [2,5], a prefix string, and a key for the trait
    const arbThreshold = fc.integer({ min: 2, max: 5 });
    const arbPrefix = fc.string({ minLength: 0, maxLength: 30 });
    const arbKey = fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z]/.test(s));

    fc.assert(
      fc.property(arbThreshold, arbPrefix, arbKey, (threshold, prefix, key) => {
        // Build a name with the injected recharge pattern (en-dash U+2013)
        const name = `${prefix}(Recharge ${threshold}\u20136)`;
        const statblock = {
          name: 'Test Monster',
          hitDice: 5,
          actions: {
            [key]: { name, description: '' },
          },
        };

        const state = extractResources(statblock, 1);

        // There must be at least one recharge ability matching our key
        const found = state.rechargeAbilities.find(a => a.key === key);
        expect(found, `expected recharge ability with key "${key}" to be found`).toBeDefined();
        expect(found.threshold).toBe(threshold);
      }),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 4: Limited-use ability parsing
// Feature: resource-tracker, Property 4: Limited-use ability parsing
// Validates: Requirements 1.6, 1.7
// ---------------------------------------------------------------------------
describe('Property 4: Limited-use ability parsing', () => {
  it('extractResources correctly parses max uses from N/day and N/encounter patterns', () => {
    const arbMax = fc.integer({ min: 1, max: 9 });
    const arbRechargeType = fc.constantFrom('day', 'encounter');
    // Prefix must not end with a digit (would merge with the injected N and change the parsed value)
    const arbPrefix = fc.string({ minLength: 0, maxLength: 30 }).filter(s => s.length === 0 || !/\d$/.test(s));
    const arbSuffix = fc.string({ minLength: 0, maxLength: 30 });
    const arbKey = fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z]/.test(s));

    fc.assert(
      fc.property(arbMax, arbRechargeType, arbPrefix, arbSuffix, arbKey, (max, rechargeType, prefix, suffix, key) => {
        // Build a description with the injected limited-use pattern
        const description = `${prefix}${max}/${rechargeType}${suffix}`;
        const statblock = {
          name: 'Test Monster',
          hitDice: 5,
          actions: {
            [key]: { name: 'Some Ability', description },
          },
        };

        const state = extractResources(statblock, 1);

        const found = state.limitedUseAbilities.find(a => a.key === key);
        expect(found, `expected limited-use ability with key "${key}" to be found`).toBeDefined();
        expect(found.max).toBe(max);
      }),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 1: Extractor finds resources in all collections
// Feature: resource-tracker, Property 1: Extractor finds resources in all collections
// Validates: Requirements 1.1
// ---------------------------------------------------------------------------
describe('Property 1: Extractor finds resources in all collections', () => {
  it('extractResources finds resources regardless of which collection they appear in', () => {
    // For each of the four collections, independently decide whether to inject
    // a recharge ability, a rest ability, or a limited-use ability (or none).
    const COLLECTIONS = ['traits', 'actions', 'bonusActions', 'legendaryActions'];

    // Arbitrary: for each collection, optionally inject one of the three resource types
    const arbResourceType = fc.option(
      fc.constantFrom('recharge', 'rest', 'limitedUse'),
      { nil: null },
    );

    fc.assert(
      fc.property(
        fc.tuple(arbResourceType, arbResourceType, arbResourceType, arbResourceType),
        ([traitType, actionType, bonusType, legendaryType]) => {
          const resourceTypes = [traitType, actionType, bonusType, legendaryType];
          const statblock = { name: 'Test Monster', hitDice: 5 };

          // Track what we injected so we can verify it was found
          const injected = { recharge: [], rest: [], limitedUse: [] };

          for (let i = 0; i < COLLECTIONS.length; i++) {
            const col = COLLECTIONS[i];
            const type = resourceTypes[i];
            if (type === null) continue;

            const key = `${col}Ability`;
            if (type === 'recharge') {
              statblock[col] = {
                [key]: { name: `Ability (Recharge 5\u20136)`, description: '' },
              };
              injected.recharge.push(key);
            } else if (type === 'rest') {
              statblock[col] = {
                [key]: { name: 'Rest Ability', description: '', recharge: 'short' },
              };
              injected.rest.push(key);
            } else if (type === 'limitedUse') {
              statblock[col] = {
                [key]: { name: 'Limited Ability', description: '1/day' },
              };
              injected.limitedUse.push(key);
            }
          }

          const state = extractResources(statblock, 1);

          // Every injected recharge ability must appear in rechargeAbilities
          for (const key of injected.recharge) {
            const found = state.rechargeAbilities.find(a => a.key === key);
            expect(found, `recharge ability "${key}" must be in rechargeAbilities`).toBeDefined();
          }

          // Every injected rest ability must appear in restAbilities
          for (const key of injected.rest) {
            const found = state.restAbilities.find(a => a.key === key);
            expect(found, `rest ability "${key}" must be in restAbilities`).toBeDefined();
          }

          // Every injected limited-use ability must appear in limitedUseAbilities
          for (const key of injected.limitedUse) {
            const found = state.limitedUseAbilities.find(a => a.key === key);
            expect(found, `limited-use ability "${key}" must be in limitedUseAbilities`).toBeDefined();
          }
        },
      ),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 7: Recharge roll threshold
// Feature: resource-tracker, Property 7: Recharge roll threshold
// Validates: Requirements 4.3, 4.4
// ---------------------------------------------------------------------------
describe('Property 7: Recharge roll threshold', () => {
  it('applyRechargeRoll sets available correctly based on threshold and roll', () => {
    const arbThreshold = fc.integer({ min: 2, max: 6 });
    const arbRoll = fc.integer({ min: 1, max: 6 });

    fc.assert(
      fc.property(arbThreshold, arbRoll, (threshold, roll) => {
        const ability = { available: false, threshold, lastRoll: null };
        applyRechargeRoll(ability, roll);

        if (roll >= threshold) {
          expect(ability.available).toBe(true);
        } else {
          expect(ability.available).toBe(false);
        }
        expect(ability.lastRoll).toBe(roll);
      }),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Arbitrary ResourceState generator (shared by Properties 8 and 9)
// ---------------------------------------------------------------------------

const CONDITIONS_LIST = [
  'blinded', 'charmed', 'frightened', 'grappled',
  'paralyzed', 'petrified', 'poisoned', 'prone',
  'restrained', 'unconscious',
];

const arbRechargeAbility = fc.record({
  key: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z]/.test(s)),
  name: fc.string({ minLength: 1, maxLength: 40 }),
  available: fc.boolean(),
  threshold: fc.integer({ min: 2, max: 6 }),
  lastRoll: fc.constant(null),
});

const arbRestAbility = fc.record({
  key: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z]/.test(s)),
  name: fc.string({ minLength: 1, maxLength: 40 }),
  available: fc.boolean(),
  restType: fc.constantFrom('short', 'long'),
});

const arbSpellSlot = fc.integer({ min: 1, max: 4 }).chain(max =>
  fc.record({
    level: fc.integer({ min: 1, max: 9 }),
    max: fc.constant(max),
    remaining: fc.integer({ min: 0, max: max }),
  }),
);

const arbLimitedUseAbility = fc.integer({ min: 1, max: 5 }).chain(max =>
  fc.record({
    key: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z]/.test(s)),
    name: fc.string({ minLength: 1, maxLength: 40 }),
    max: fc.constant(max),
    remaining: fc.integer({ min: 0, max: max }),
    recharge: fc.constantFrom('short', 'long', null),
  }),
);

const arbConditions = fc.array(
  fc.constantFrom(...CONDITIONS_LIST),
  { minLength: 0, maxLength: CONDITIONS_LIST.length },
).map(arr => {
  const subset = [...new Set(arr)];
  const obj = {};
  for (const c of subset) obj[c] = false;
  return obj;
});

const arbResourceState = fc.integer({ min: 1, max: 200 }).chain(maxHp =>
  fc.record({
    instanceLabel: fc.string({ minLength: 1, maxLength: 40 }),
    maxHp: fc.constant(maxHp),
    currentHp: fc.integer({ min: 0, max: maxHp }),
    reactionAvailable: fc.boolean(),
    rechargeAbilities: fc.array(arbRechargeAbility, { minLength: 0, maxLength: 3 }),
    restAbilities: fc.array(arbRestAbility, { minLength: 0, maxLength: 3 }),
    spellSlots: fc.array(arbSpellSlot, { minLength: 0, maxLength: 3 }),
    limitedUseAbilities: fc.array(arbLimitedUseAbility, { minLength: 0, maxLength: 3 }),
    conditions: arbConditions,
    exhaustion: fc.integer({ min: 0, max: 6 }),
  }),
);

// ---------------------------------------------------------------------------
// Property 8: Long rest restores all resources
// Feature: resource-tracker, Property 8: Long rest restores all resources
// Validates: Requirements 5.3, 5.4, 6.2, 7.2, 11.7, 11.8
// ---------------------------------------------------------------------------
describe('Property 8: Long rest restores all resources', () => {
  it('applyLongRest restores all resources to full and clears conditions', () => {
    fc.assert(
      fc.property(arbResourceState, (state) => {
        const preExhaustion = state.exhaustion;

        applyLongRest(state, {});

        // HP restored to max
        expect(state.currentHp).toBe(state.maxHp);

        // All rest abilities available
        for (const ability of state.restAbilities) {
          expect(ability.available).toBe(true);
        }

        // All spell slots restored
        for (const slot of state.spellSlots) {
          expect(slot.remaining).toBe(slot.max);
        }

        // All limited-use abilities restored
        for (const ability of state.limitedUseAbilities) {
          expect(ability.remaining).toBe(ability.max);
        }

        // All boolean conditions cleared
        for (const value of Object.values(state.conditions)) {
          expect(value).toBe(false);
        }

        // Exhaustion reduced by 1, minimum 0
        expect(state.exhaustion).toBe(Math.max(0, preExhaustion - 1));

        // Reaction restored
        expect(state.reactionAvailable).toBe(true);
      }),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 9: Short rest restores short-rest resources
// Feature: resource-tracker, Property 9: Short rest restores short-rest resources
// Validates: Requirements 5.2, 5.5, 6.3, 7.3
// ---------------------------------------------------------------------------
describe('Property 9: Short rest restores short-rest resources', () => {
  it('applyShortRest restores only short-rest resources and heals HP', () => {
    const arbStatblock = fc.record({
      hitDice: fc.integer({ min: 1, max: 20 }),
      size: fc.integer({ min: 1, max: 6 }),
      castingClass: fc.option(fc.constantFrom('warlock', 'wizard', 'cleric', 'bard'), { nil: undefined }),
    });

    fc.assert(
      fc.property(arbResourceState, arbStatblock, (stateTemplate, statblock) => {
        // Deep-clone state so we can compare before/after
        const state = JSON.parse(JSON.stringify(stateTemplate));
        const preCurrentHp = state.currentHp;

        // Snapshot long-rest rest abilities before the call
        const longRestAbilitiesSnapshot = state.restAbilities
          .filter(a => a.restType === 'long')
          .map(a => ({ key: a.key, available: a.available }));

        applyShortRest(state, statblock);

        // Short-rest rest abilities must be available
        for (const ability of state.restAbilities) {
          if (ability.restType === 'short') {
            expect(ability.available).toBe(true);
          }
        }

        // Long-rest rest abilities must be unchanged
        for (const snap of longRestAbilitiesSnapshot) {
          const current = state.restAbilities.find(a => a.key === snap.key);
          expect(current.available).toBe(snap.available);
        }

        // Short-recharge limited-use abilities restored
        for (const ability of state.limitedUseAbilities) {
          if (ability.recharge === 'short') {
            expect(ability.remaining).toBe(ability.max);
          }
        }

        // HP can only go up or stay the same, and must not exceed maxHp
        expect(state.currentHp).toBeGreaterThanOrEqual(preCurrentHp);
        expect(state.currentHp).toBeLessThanOrEqual(state.maxHp);

        // Warlock: all spell slots restored; non-warlock: spell slots unchanged
        const isWarlock = statblock.castingClass === 'warlock';
        if (isWarlock) {
          for (const slot of state.spellSlots) {
            expect(slot.remaining).toBe(slot.max);
          }
        } else {
          // Spell slots should be unchanged — compare with original
          for (let i = 0; i < state.spellSlots.length; i++) {
            expect(state.spellSlots[i].remaining).toBe(stateTemplate.spellSlots[i].remaining);
          }
        }
      }),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 3: Rest ability classification round-trip
// Feature: resource-tracker, Property 3: Rest ability classification round-trip
// Validates: Requirements 1.3, 1.4, 5.2, 5.3
// ---------------------------------------------------------------------------
describe('Property 3: Rest ability classification round-trip', () => {
  it('extractResources classifies rest abilities correctly and rest functions restore them', () => {
    const arbRestType = fc.constantFrom('short', 'long');
    const arbKey = fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z]/.test(s));

    fc.assert(
      fc.property(
        fc.array(
          fc.record({ key: arbKey, restType: arbRestType }),
          { minLength: 1, maxLength: 4 },
        ),
        (traits) => {
          // Deduplicate keys
          const seen = new Set();
          const uniqueTraits = traits.filter(t => {
            if (seen.has(t.key)) return false;
            seen.add(t.key);
            return true;
          });

          if (uniqueTraits.length === 0) return;

          // Build statblock with these traits in actions
          const actions = {};
          for (const t of uniqueTraits) {
            actions[t.key] = { name: t.key, description: '', recharge: t.restType };
          }
          const statblock = { name: 'Test Monster', hitDice: 5, actions };

          const state = extractResources(statblock, 1);

          // Verify classification
          for (const t of uniqueTraits) {
            const found = state.restAbilities.find(a => a.key === t.key);
            expect(found, `rest ability "${t.key}" must be classified`).toBeDefined();
            expect(found.restType).toBe(t.restType);
          }

          // Mark all as spent
          for (const ability of state.restAbilities) {
            ability.available = false;
          }

          // Short rest: only short-rest abilities restored
          const stateForShort = JSON.parse(JSON.stringify(state));
          applyShortRest(stateForShort, { hitDice: 5, size: 3 });
          for (const ability of stateForShort.restAbilities) {
            if (ability.restType === 'short') {
              expect(ability.available).toBe(true);
            } else {
              expect(ability.available).toBe(false);
            }
          }

          // Long rest: all abilities restored
          const stateForLong = JSON.parse(JSON.stringify(state));
          applyLongRest(stateForLong, {});
          for (const ability of stateForLong.restAbilities) {
            expect(ability.available).toBe(true);
          }
        },
      ),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6: HP lower bound clamping
// Feature: resource-tracker, Property 6: HP lower bound clamping
// Validates: Requirements 3.5
// ---------------------------------------------------------------------------
describe('Property 6: HP lower bound clamping', () => {
  it('clampHp returns 0 for any negative value, and passes through non-negative values', () => {
    fc.assert(
      fc.property(fc.integer({ min: -10000, max: -1 }), (value) => {
        expect(clampHp(value)).toBe(0);
      }),
      { numRuns: 200 },
    );

    // Edge cases
    expect(clampHp(0)).toBe(0);
    expect(clampHp(1)).toBe(1);
    expect(clampHp(9999)).toBe(9999);
  });
});

// ---------------------------------------------------------------------------
// Property 12: Exhaustion bounds
// Feature: resource-tracker, Property 12: Exhaustion bounds
// Validates: Requirements 11.4
// ---------------------------------------------------------------------------
describe('Property 12: Exhaustion bounds', () => {
  it('clampExhaustion always returns a value in [0, 6]', () => {
    fc.assert(
      fc.property(fc.integer({ min: -100, max: 100 }), (value) => {
        const result = clampExhaustion(value);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(6);
      }),
      { numRuns: 200 },
    );

    // Specific examples
    expect(clampExhaustion(3)).toBe(3);
    expect(clampExhaustion(-1)).toBe(0);
    expect(clampExhaustion(7)).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// Property 11: State serialisation round-trip
// Feature: resource-tracker, Property 11: State serialisation round-trip
// Validates: Requirements 9.2
// ---------------------------------------------------------------------------
describe('Property 11: State serialisation round-trip', () => {
  it('JSON serialise → deserialise produces a deeply equal ResourceState', () => {
    fc.assert(
      fc.property(arbResourceState, (state) => {
        const roundTripped = JSON.parse(JSON.stringify(state));
        expect(roundTripped).toEqual(state);
      }),
      { numRuns: 200 },
    );
  });
});
