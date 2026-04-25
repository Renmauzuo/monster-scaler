import { skills, skillRanks, spells, sizes } from '@toolkit5e/base';
import { monsterList } from '@toolkit5e/monster-scaler';

export { monsterList };

// ---------------------------------------------------------------------------
// Site-specific data (not shared with other packages)
// ---------------------------------------------------------------------------

export const alignmentStrings = {
    0:   'unaligned',
    1:   'lawful good',
    2:   'neutral good',
    4:   'chaotic good',
    8:   'lawful neutral',
    16:  'neutral',
    32:  'chaotic neutral',
    64:  'lawful evil',
    128: 'neutral evil',
    256: 'chaotic evil',
    7:   'any good',
    448: 'any evil',
    73:  'any lawful',
    292: 'any chaotic',
    79:  'any lawful or good',
};

export const magicSchools = [
    'Abjuration', 'Conjuration', 'Divination', 'Enchantment',
    'Evocation', 'Illusion', 'Necromancy', 'Transmutation',
];

export const weaponTypes = {
    quarterstaff: {
        damageDice: 1,
        damageDieSize: 6,
        damageType: 'bludgeoning',
        reach: 5,
    },
};

// TODO: Add full progression to 30
export const spellProgression = {
    half: [
        [2],[2],  //1
        [2],[2],  //2
        [2],[3],  //3
        [3],[3],  //4
        [3],[4],[2],  //5
        [3],[4],[2],  //6
        [3],[4],[3],  //7
        [3],[4],[3],  //8
        [3],[4],[3],[2],  //9
        [4],[4],[3],[2],  //10
        [4],[4],[3],[3],  //11
        [4],[4],[3],[3],  //12
        [4],[4],[3],[3],[1],  //13
        [4],[4],[3],[3],[1],  //14
        [4],[4],[3],[3],[2],  //15
        [4],[4],[3],[3],[2],  //16
        [4],[4],[3],[3],[3],[1],  //17
        [4],[4],[3],[3],[3],[1],  //18
        [4],[4],[3],[3],[3],[2],  //19
        [4],[4],[3],[3],[3],[2],  //20
    ],
};

// Sound effects for the monster soundboard, keyed by monsterList ID.
// Site-specific — not part of the @toolkit5e/monster-scaler package.
export const monsterSounds = {
    elephant: ['elephant-trumpet'],
    shadow:   ['creepy-sound'],
    wolf:     ['howl', 'growl'],
};

export const sidekickClasses = {
    expert: {
        asi: [4,8,10,12,16,19],
        bonusProficiencies: { count: 5, saves: ['dex', 'int', 'cha'] },
        features: [
            { level: 1, bonusAction: 'helpful' },
            {
                level: 3,
                options: [{
                    id: 'expertExpertise',
                    label: 'Skill Expertise',
                    limit: 2,
                    list: (statblock) => {
                        let skillList = {};
                        for (let skill in statblock.skills) { skillList[skill] = skills[skill]; }
                        return skillList;
                    },
                    result: (statblock, value) => {
                        for (let i = 0; i < value.length; i++) { statblock.skills[value[i]] = skillRanks.expert; }
                    },
                }],
            },
        ],
    },
    spellcaster: {
        asi: [4,8,12,16,18],
        bonusProficiencies: {
            count: 2,
            skills: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'performance', 'persuasion', 'religion'],
            saves: ['wis', 'int', 'cha'],
        },
        features: [
            {
                level: 1,
                trait: 'spellcasting',
                options: [{
                    id: 'cantrips',
                    label: 'Cantrips Known',
                    limit: (statblock) => spellProgression.half[statblock.level][0],
                    list: (statblock) => {
                        let cantrips = {};
                        for (let spell in spells) {
                            if (spells[spell].level === 0) { cantrips[spell] = { name: spells[spell].name }; }
                        }
                        return cantrips;
                    },
                }],
            },
            { level: 6, trait: 'potentCantrips' },
            {
                level: 14,
                trait: 'empoweredSpells',
                options: [{
                    id: 'empoweredSpells',
                    label: 'Empowered Spells School',
                    list: magicSchools,
                    result: (statblock, value) => { statblock.traits.empoweredSpells.school = value; },
                }],
            },
        ],
        roles: {
            healer:  { merge: { castingClass: ['druid', 'cleric'],  castingStat: 'wis' } },
            mage:    { merge: { castingClass: ['wizard'],           castingStat: 'wis' } },
            prodigy: { merge: { castingClass: ['bard', 'warlock'],  castingStat: 'wis' } },
        },
    },
    warrior: {
        asi: [4,8,12,14,16,19],
        bonusProficiencies: {
            count: 2,
            skills: ['acrobatics', 'animalHandling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'],
            saves: ['str', 'dex', 'con'],
        },
        roles: { defensive: {}, offensive: {} },
    },
};
