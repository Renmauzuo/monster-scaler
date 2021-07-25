//Sizes
//Sizes start at 1 so that tiny doesn't implicitly evaluate to false.
const sizeTiny = 1;
const sizeSmall = 2;
const sizeMedium = 3;
const sizeLarge = 4;
const sizeHuge = 5;
const sizeGargantuan = 6;

const reachVeryShort = 0;
const reachShort = 1;
const reachMediumShort = 2;
const reachMedium = 3;
const reachMediumLong = 4;
const reachLong = 4;
const reachVeryLong = 5;

const monsterList = {
    ape: {
        type: 'beast',
        alignment: 'unaligned',
        lockedStats: {
            attacks: {
                fist: {
                    reach: reachMedium,
                    damageType: 'bludgeoning',
                    name: 'Fist'
                },
                rock: {
                    damageType: 'bludgeoning',
                    name: 'Rock',
                    ranged: true
                }
            },
            skills: [
                "athletics",
                "perception"
            ],
            slug: "ape",
            multiattack: {
                attacks: {
                    fist : 2
                }
            },
        },
        stats: {
            .5 : {
                name: "Ape",
                hitDice: 3,
                speed: 30,
                climb: 30,
                size: sizeMedium,
                str: 16,
                dex: 14,
                con: 14,
                int: 6,
                wis: 12,
                cha: 7,
                attacks: {
                    fist: {
                        damageDice: 1,
                        damageDieSize: 6
                    },
                    rock: {
                        range: 25,
                        longRange: 50,
                        damageDice: 1,
                        damageDieSize: 6
                    }
                }
            },
            7 : {
                name: "Giant Ape",
                hitDice: 15,
                speed: 40,
                climb: 40,
                size: sizeHuge,
                str: 23,
                dex: 14,
                con: 18,
                int: 7,
                wis: 12,
                cha: 7,
                attacks: {
                    fist: {
                        damageDice: 3,
                        damageDieSize: 10
                    },
                    rock: {
                        range: 50,
                        longRange: 100,
                        damageDice: 7,
                        damageDieSize: 6
                    }
                }
            }
        }
    },
    elephant: {
        type: 'beast',
        alignment: 'unaligned',
        lockedStats: {
            armorDescription: "Natural Armor",
            attacks: {
                gore: {
                    reach: reachMedium,
                    damageType: 'piercing',
                    name: 'Gore'
                },
                stomp: {
                    reach: reachShort,
                    damageType: 'bludgeoning',
                    name: 'Stomp'
                }
            },
            int: 3,
        },
        traits: [
            "tramplingCharge"
        ],
        stats: {
            4 : {
                slug: "elephant",
                name: "Elephant",
                bonusArmor: 3,
                hitDice: 8,
                speed: 40,
                size: sizeHuge,
                str: 22,
                dex: 9,
                con: 17,
                wis: 11,
                cha: 6,
                traits: {
                    tramplingCharge: {
                        dcAdjustment: -4
                    }
                },
                attacks: {
                    gore: {
                        damageDice: 3,
                        damageDieSize: 8
                    },
                    stomp: {
                        damageDice: 3,
                        damageDieSize: 10
                    }
                }
            },
            6 : {
                slug: "mammoth",
                name: "Mammoth",
                bonusArmor: 4,
                hitDice: 11,
                speed: 40,
                size: sizeHuge,
                str: 24,
                dex: 9,
                con: 21,
                wis: 11,
                cha: 6,
                traits: {
                    tramplingCharge: {
                        dcAdjustment: 0
                    }
                },
                attacks: {
                    gore: {
                        damageDice: 4,
                        damageDieSize: 8
                    },
                    stomp: {
                        damageDice: 4,
                        damageDieSize: 10
                    }
                }
            }
        }
    },
    trex: {
        type: 'beast',
        alignment: 'unaligned',
        lockedStats: {
            armorDescription: "Natural Armor",
            attacks: {
                bite: {
                    reach: reachMedium,
                    proc: 'grappleBite',
                    damageType: 'piercing',
                    name: 'Bite'
                },
                tail: {
                    reach: reachMedium,
                    damageType: 'bludgeoning',
                    name: 'Tail'
                }
            },
            int: 2,
            skills: [
                "perception"
            ],
            slug: "tyrannosaurus",
            multiattack: {
                attacks: {
                    bite : 1,
                    tail: 1
                },
                requireDifferentTargets: true
            },
        },
        stats: {
            8 : {
                name: "Tyrannosaurus Rex",
                bonusArmor: 3,
                hitDice: 13,
                speed: 50,
                size: sizeHuge,
                str: 25,
                dex: 10,
                con: 19,
                wis: 12,
                cha: 9,
                attacks: {
                    bite: {
                        damageDice: 4,
                        damageDieSize: 12
                    },
                    tail: {
                        damageDice: 3,
                        damageDieSize: 8
                    }
                }
            }
        }
    },
    wolf: {
        traits: [
            "keenHearingSmell",
            "packTactics",
        ],
        type: "beast",
        alignment: "unaligned",
        lockedStats: {
            armorDescription: "Natural Armor",
            attacks: {
                bite: {
                    reach: reachShort,
                    proc: 'takeDown',
                    damageType: 'piercing',
                    name: 'Bite',
                    finesse: true
                }
            },
            int: 3,
            skills: [
                "perception",
                "stealth",
            ],
            slug: "wolf",
        },
        stats: {
            0 : {
                name: "Wolf Pup",
            },
            .25: {
                name: "Wolf",
                bonusArmor: 1,
                hitDice: 2,
                speed: 40,
                size: sizeMedium,
                str: 12,
                dex: 15,
                con: 12,
                wis: 12,
                cha: 6,
                attacks: {
                    bite: {
                        damageDice: 2,
                        damageDieSize: 4
                    }
                }
            },
            1 : {
                name: "Dire Wolf",
                bonusArmor: 2,
                hitDice: 5,
                speed: 50,
                size: sizeLarge,
                str: 17,
                dex: 15,
                con: 15,
                wis: 12,
                cha: 7,
                attacks: {
                    bite: {
                        damageDice: 2,
                        damageDieSize: 6
                    }
                }
            },
            20 : {
                name: "Legendary Wolf"
            }
        }
    }
}

/*
 * These are rough averages of different stats per CR
 * These are not used to populate monster stats directly, but are used to compare stats to maintain relative values at different CRs
 * For example, a creature with above average strength for its CR will continue to have above average strength at other CRs
 * Most of these stats were determined by average stats of monsters in various rulebooks by CR.
 * However, outliers sometimes skewed results for certain CRs, especially at high levels when there are very few monsters at each CR, so many of these vlaues have been "fudged" to create a smoother upward transition.
 * Decimal values are to ease the curve a bit, even though all final values will be rounded.
 * Beasts were excluded from average INT calculates, as their INT tends to be capped at 3, regardless of CR.
 */

const averageStats = {
    0 : {
        proficiency: 2,
        damagePerRound: .5,
        xp: 10,
        ac: 12, 
        hp: 4,
        str: 5,
        dex: 12,
        con: 10,
        int: 7,
        wis: 10,
        cha: 5,
        size: sizeSmall - .5 //Low end of small
    },
    .125 : {
        proficiency: 2,
        damagePerRound: 2.5,
        xp: 25,
        ac: 13, 
        hp: 21,
        str: 9,
        dex: 12,
        con: 10,
        int: 7,
        wis: 10,
        cha: 6,
        size: sizeSmall
    },
    .25 : {
        proficiency: 2,
        damagePerRound: 4.5,
        xp: 50,
        ac: 13, 
        hp: 43,
        str: 10,
        dex: 12,
        con: 10,
        int: 8,
        wis: 10,
        cha: 6,
        size: sizeMedium - .5 //Low end of medium
    },
    .5 : {
        proficiency: 2,
        damagePerRound: 7,
        xp: 100,
        ac: 13, 
        hp: 60,
        str: 11,
        dex: 12,
        con: 11,
        int: 8,
        wis: 10,
        cha: 7,
        size: sizeMedium - .4
    },
    1 : {
        proficiency: 2,
        damagePerRound: 11.5,
        xp: 200,
        ac: 13, 
        hp: 78,
        str: 13,
        dex: 12,
        con: 13,
        int: 8,
        wis: 10,
        cha: 8,
        size: sizeMedium - .25
    },
    2 : {
        proficiency: 2,
        damagePerRound: 17.5,
        xp: 450,
        ac: 13, 
        hp: 93,
        str: 14,
        dex: 12,
        con: 14,
        int: 8,
        wis: 11,
        cha: 8,
        size: sizeMedium
    },
    3 : {
        proficiency: 2,
        damagePerRound: 23.5,
        xp: 700,
        ac: 13, 
        hp: 108,
        str: 14,
        dex: 13,
        con: 14,
        int: 9,
        wis: 11,
        cha: 9,
        size: sizeMedium + .25
    },
    4 : {
        proficiency: 2,
        damagePerRound: 29.5,
        ac: 14, 
        xp: 1100,
        hp: 123,
        str: 15,
        dex: 13,
        con: 15,
        int: 9,
        wis: 11,
        cha: 9,
        size: sizeMedium + .4 //High end of medium
    },
    5 : {
        proficiency: 3,
        damagePerRound: 35.5,
        xp: 1800,
        ac: 15, 
        hp: 138,
        str: 16,
        dex: 13,
        con: 16,
        int: 9,
        wis: 11,
        cha: 9,
        size: sizeLarge - .5 //Low end of large
    },
    6 : {
        proficiency: 3,
        damagePerRound: 41.5,
        xp: 2300,
        ac: 15, 
        hp: 153,
        str: 16,
        dex: 13,
        con: 16,
        int: 10,
        wis: 12,
        cha: 10,
        size: sizeLarge - .4
    },
    7 : {
        proficiency: 3,
        damagePerRound: 47.5,
        xp: 2900,
        ac: 15, 
        hp: 168,
        str: 17,
        dex: 13,
        con: 16,
        int: 10,
        wis: 12,
        cha: 11,
        size: sizeLarge - .3
    },
    8 : {
        proficiency: 3,
        damagePerRound: 53.5,
        xp: 3900,
        ac: 16, 
        hp: 183,
        str: 17,
        dex: 13,
        con: 16,
        int: 10,
        wis: 13,
        cha: 12,
        size: sizeLarge - .25
    },
    9 : {
        proficiency: 4,
        damagePerRound: 59.5,
        xp: 5000,
        ac: 16, 
        hp: 198,
        str: 17,
        dex: 13,
        con: 17,
        int: 11,
        wis: 13,
        cha: 12,
        size: sizeLarge - .15
    },
    10 : {
        proficiency: 4,
        damagePerRound: 65.5,
        xp: 5900,
        ac: 17, 
        hp: 213,
        str: 18,
        dex: 14,
        con: 18,
        int: 11,
        wis: 14,
        cha: 13,
        size: sizeLarge
    },
    11 : {
        proficiency: 4,
        damagePerRound: 71.5,
        xp: 7200,
        ac: 17, 
        hp: 228,
        str: 18,
        dex: 14,
        con: 18,
        int: 11,
        wis: 14,
        cha: 14,
        size: sizeLarge + .1
    },
    12 : {
        proficiency: 4,
        damagePerRound: 77.5,
        xp: 8400,
        ac: 17, 
        hp: 243,
        str: 18,
        dex: 14,
        con: 19,
        int: 12,
        wis: 14,
        cha: 15,
        size: sizeLarge + .2
    },
    13 : {
        proficiency: 5,
        damagePerRound: 83.5,
        xp: 10000,
        ac: 18, 
        hp: 258,
        str: 19,
        dex: 14,
        con: 19,
        int: 12,
        wis: 14,
        cha: 15,
        size: sizeLarge + .3
    },
    14 : {
        proficiency: 5,
        damagePerRound: 89.5,
        xp: 11500,
        ac: 18, 
        hp: 273,
        str: 19,
        dex: 14,
        con: 19,
        int: 13,
        wis: 15,
        cha: 15,
        size: sizeHuge - .5
    },
    15 : {
        proficiency: 5,
        damagePerRound: 95.5,
        xp: 13000,
        ac: 18, 
        hp: 288,
        str: 20,
        dex: 14,
        con: 19,
        int: 13,
        wis: 15,
        cha: 16,
        size: sizeHuge - .4
    },
    16 : {
        proficiency: 5,
        damagePerRound: 101.5,
        xp: 15000,
        ac: 18, 
        hp: 303,
        str: 21,
        dex: 14,
        con: 20,
        int: 13,
        wis: 16,
        cha: 17,
        size: sizeHuge - .3
    },
    17 : {
        proficiency: 6,
        damagePerRound: 107.5,
        xp: 18000,
        ac: 19, 
        hp: 318,
        str: 21,
        dex: 14,
        con: 20,
        int: 14,
        wis: 16,
        cha: 18,
        size: sizeHuge - .2
    },
    18 : {
        proficiency: 6,
        damagePerRound: 113.5,
        xp: 20000,
        ac: 19, 
        hp: 333,
        str: 22,
        dex: 14,
        con: 20,
        int: 14,
        wis: 17,
        cha: 19,
        size: sizeHuge
    },
    19 : {
        proficiency: 6,
        damagePerRound: 119.5,
        xp: 22000,
        ac: 19, 
        hp: 348,
        str: 23,
        dex: 14,
        con: 21,
        int: 15,
        wis: 18,
        cha: 20,
        size: sizeHuge + .1
    },
    20 : {
        proficiency: 6,
        damagePerRound: 131.5,
        xp: 25000,
        ac: 19, 
        hp: 378,
        str: 24,
        dex: 15,
        con: 22,
        int: 15,
        wis: 18,
        cha: 20,
        size: sizeHuge + .2
    },
    21 : {
        proficiency: 7,
        damagePerRound: 149.5,
        xp: 33000,
        ac: 19, 
        hp: 423,
        str: 25,
        dex: 15,
        con: 23,
        int: 16,
        wis: 19,
        cha: 21,
        size: sizeHuge + .3
    },
    22 : {
        proficiency: 7,
        damagePerRound: 167.5,
        xp: 41000,
        ac: 19, 
        hp: 468,
        str: 26,
        dex: 15,
        con: 24,
        int: 17,
        wis: 19,
        cha: 21,
        size: sizeHuge + .4
    },
    23 : {
        proficiency: 7,
        damagePerRound: 185.5,
        xp: 50000,
        ac: 19,
        hp: 513,
        str: 27,
        dex: 15,
        con: 25,
        int: 18,
        wis: 20,
        cha: 22,
        size: sizeGargantuan - .2
    },
    24 : {
        proficiency: 7,
        damagePerRound: 203.5,
        xp: 62000,
        ac: 19,
        hp: 558,
        str: 27,
        dex: 15,
        con: 25,
        int: 18,
        wis: 20,
        cha: 23,
        size: sizeGargantuan
    },
    25 : {
        proficiency: 8,
        damagePerRound: 221,
        xp: 75000,
        ac: 19,
        hp: 603,
        str: 28,
        dex: 15,
        con: 26,
        int: 19,
        wis: 20,
        cha: 24,
        size: sizeGargantuan
    },
    26 : {
        proficiency: 8,
        damagePerRound: 240,
        xp: 90000,
        ac: 19,
        hp: 648,
        str: 28,
        dex: 15,
        con: 26,
        int: 20,
        wis: 21,
        cha: 25,
        size: sizeGargantuan
    },
    27 : {
        proficiency: 8,
        damagePerRound: 258,
        xp: 105000,
        ac: 19, 
        hp: 693,
        str: 29,
        dex: 15,
        con: 27,
        int: 21,
        wis: 21,
        cha: 26,
        size: sizeGargantuan
    },
    28 : {
        proficiency: 8,
        damagePerRound: 276,
        xp: 120000,
        ac: 19, 
        hp: 738,
        str: 29,
        dex: 15,
        con: 28,
        int: 22,
        wis: 21,
        cha: 27,
        size: sizeGargantuan
    },
    29 : {
        proficiency: 9,
        damagePerRound: 294,
        xp: 135000,
        ac: 19, 
        hp: 783,
        str: 30,
        dex: 15,
        con: 29,
        int: 23,
        wis: 22,
        cha: 28,
        size: sizeGargantuan
    },
    30 : {
        proficiency: 9,
        damagePerRound: 312,
        xp: 155000,
        ac: 19,
        hp: 828,
        str: 30,
        dex: 15,
        con: 30,
        int: 24,
        wis: 22,
        cha: 28,
        size: sizeGargantuan
    }
}

const sizes = [
    {}, //Placeholder for 0, as implicit boolean checks may fail if tiny is 0
    {
        name: 'Tiny',
        hitDie: 4,
        reach: [5,5,5,5,5,5,5]
    },
    {
        name: 'Small',
        hitDie: 6,
        reach: [5,5,5,5,10,10,10]
    },
    {
        name: 'Medium',
        hitDie: 8,
        reach: [5,5,5,5,10,15,20]
    },
    {
        name: 'Large',
        hitDie: 10,
        reach: [5,5,5,10,15,20,25]
    },
    {
        name: 'Huge',
        hitDie: 12,
        reach: [5,5,10,15,20,25,30]
    },
    {
        name: 'Gargantuan',
        hitDie: 20,
        reach: [5,10,15,20,25,30,35]
    }
    
];

const skills = {
    athletics: 'str',
    perception: 'wis',
    stealth: 'dex'

}

const traits = {
    keenHearingSmell : {
        name: "Keen Hearing and Smell",
        description: "The {{slug}} has advantage on Wisdom (Perception) checks that rely on hearing or smell." 
    },
    packTactics: {
        name: "Pack Tactics",
        description: "The {{slug}} has advantage on an attack roll against a creature if at least one of the {{slug}}'s allies is within 5 ft. of the creature and the ally isn't incapacitated."
    },
    tramplingCharge: {
        name: "Trampling Charge",
        description: "If the {{slug}} moves at least 20 ft. straight toward a creature and then hits it with a gore attack on the same turn, that target must succeed on a DC {{trait:DC}} Strength saving throw or be knocked prone. If the target is prone, the {{slug}} can make one stomp attack against it as a bonus action.",
        allowsSave: true,
        dcStat: "str"
    }
}

const procs = {
    takeDown : "If the target is a creature, it must succeed on a DC {{DC:str}} Strength saving throw or be knocked prone",
    grappleBite: "If the target is a {{size:-2}} or smaller creature, it is grappled (escape DC {{DC:str:-1}}). Until this grapple ends, the target is restrained, and the {{slug}} can't bite another target"

}