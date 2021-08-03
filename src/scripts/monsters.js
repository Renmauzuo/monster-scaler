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

const typeBeast = 'beast';

const alignmentUnaligned = 'unaligned';

const armorNatural = "Natural Armor";

const damageTypePiercing = 'piercing';
const damageTypeBludgeoning = 'bludgeoning';
const damageTypeSlashing = 'slashing';

const skillRankUnproficient = 0;
const skillRankProficient = 1;
const skillRankExpert = 2;

const monsterList = {
    ape: {
        type: typeBeast,
        alignment: alignmentUnaligned,
        lockedStats: {
            attacks: {
                fist: {
                    reach: reachMedium,
                    damageType: damageTypeBludgeoning,
                    name: 'Fist'
                },
                rock: {
                    damageType: damageTypeBludgeoning,
                    name: 'Rock',
                    ranged: true
                }
            },
            skills: {
                athletics : skillRankProficient,
                perception : skillRankProficient
            },
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
    crocodile: {
        type: typeBeast,
        alignment: alignmentUnaligned,
        lockedStats: {
            armorDescription: armorNatural,
            int: 2,
            slug: "crocodile",
            attacks: {
                bite: {
                    reach: reachShort,
                    damageType: damageTypePiercing,
                    name: 'Bite',
                    proc: 'grappleBite'
                }
            },
            skills: {
                stealth: skillRankExpert
            },
        },
        traits: [
            "holdBreath"
        ],
        stats: {
            .5: {
                name: "Crocodile",
                bonusArmor: 2,
                hitDice: 3,
                speed: 20,
                swim: 30,
                size: sizeLarge,
                str: 15,
                dex: 10,
                con: 13,
                wis: 10,
                cha: 5,
                attacks: {
                    bite: {
                        damageDice: 1,
                        damageDieSize: 10
                    }
                },
                traits: {
                    holdBreath: {
                        duration: 15
                    }
                }
            },
            5: {
                name: "Giant Crocodile",
                bonusArmor: 5,
                hitDice: 9,
                speed: 30,
                swim: 50,
                size: sizeHuge,
                str: 21,
                dex: 9,
                con: 17,
                wis: 10,
                cha: 7,
                attacks: {
                    bite: {
                        damageDice: 3,
                        damageDieSize: 10
                    },
                    tail: {
                        reach: reachMediumShort,
                        damageType: damageTypeBludgeoning,
                        name: "Tail",
                        proc: "takeDown",
                        damageDice: 2,
                        damageDieSize: 8,
                        notGrappled: true
                    }
                },
                multiattack: {
                    attacks: {
                        bite : 1,
                        tail: 1
                    }
                },
                traits: {
                    holdBreath: {
                        duration: 30
                    }
                }
            }
        }
    },
    elephant: {
        type: typeBeast,
        alignment: alignmentUnaligned,
        lockedStats: {
            armorDescription: armorNatural,
            attacks: {
                gore: {
                    reach: reachShort,
                    damageType: damageTypePiercing,
                    name: 'Gore'
                },
                stomp: {
                    reach: reachShort,
                    damageType: damageTypeBludgeoning,
                    name: 'Stomp',
                    proneOnly: true
                }
            },
            int: 3,
        },
        traits: [
            "tramplingCharge"
        ],
        variants: {
            elephant: {
                name: "Elephant",
                lockedStats: {
                    int: 3,
                },
                stats: {
                    4: {
                        slug: "elephant",
                        name: "Elephant",
                        speed: 40,
                        cha: 6,
                    },
                    6: {
                        slug: "mammoth",
                        name: "Mammoth",
                        cha: 6,
                    }
                }
            },
            triceratops: {
                name: "Triceratops",
                lockedStats: {
                    int: 2,
                },
                stats: {
                    5: {
                        slug: "triceratops",
                        name: "Triceratops",
                        speed: 50,
                        cha: 5
                    }
                }
            }
        },
        stats: {
            4 : {
                bonusArmor: 3,
                hitDice: 8,
                size: sizeHuge,
                str: 22,
                dex: 9,
                con: 17,
                wis: 11,
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
            5 : {
                bonusArmor: 4,
                hitDice: 10,
                size: sizeHuge,
                str: 22,
                dex: 9,
                con: 17,
                wis: 11,
                traits: {
                    tramplingCharge: {
                        dcAdjustment: -4
                    }
                },
                attacks: {
                    gore: {
                        damageDice: 4,
                        damageDieSize: 8
                    },
                    stomp: {
                        damageDice: 3,
                        damageDieSize: 10
                    }
                }
            },
            6 : {
                bonusArmor: 4,
                hitDice: 11,
                size: sizeHuge,
                str: 24,
                dex: 9,
                con: 21,
                wis: 11,
                traits: {
                    tramplingCharge: {
                        dcAdjustment: 0
                    }
                },
                attacks: {
                    gore: {
                        damageDice: 4,
                        damageDieSize: 8,
                        reach: reachMediumShort
                    },
                    stomp: {
                        damageDice: 4,
                        damageDieSize: 10
                    }
                }
            }
        }
    },
    killerWhale: {
        menuName: "Killer Whale",
        type: typeBeast,
        alignment: alignmentUnaligned,
        lockedStats: {
            armorDescription: armorNatural,
            attacks: {
                bite: {
                    reach: reachShort,
                    damageType: damageTypePiercing,
                    name: 'Bite'
                }
            },
            int: 3,
            skills: {
                perception: skillRankProficient
            },
            slug: "whale",
        },
        stats: {
            3 : {
                name: "Killer Whale",
                bonusArmor: 2,
                blindsight: 120,
                hitDice: 12,
                speed: 0,
                swim: 60,
                size: sizeHuge,
                str: 19,
                dex: 10,
                con: 13,
                wis: 12,
                cha: 7,
                attacks: {
                    bite: {
                        damageDice: 5,
                        damageDieSize: 6
                    }
                },
                traits: {
                    holdBreath: {
                        duration: 30
                    }
                }
            }
        },
        traits: [
            "echolocation",
            "holdBreath",
            "keenHearing"
        ]
    },
    saberToothedTiger: {
        menuName: 'Saber-Toothed Tiger',
        type: typeBeast,
        alignment: alignmentUnaligned,
        lockedStats: {
            speed: 40,
            int: 3,
            skills: {
                perception: skillRankProficient,
                stealth: skillRankExpert
            },
            attacks: {
                bite: {
                    reach: reachShort,
                    damageType: damageTypePiercing,
                    name: 'Bite'
                },
                claw: {
                    reach: reachShort,
                    damageType: damageTypeSlashing,
                    name: 'Claw'
                },
            },
        },
        traits: [
            "keenSmell",
            "pounce"
        ],
        stats: {
            2: {
                name: 'Saber-Toothed Tiger',
                size: sizeLarge,
                hitDice: 7,
                str: 18,
                dex: 14,
                con: 15,
                wis: 12,
                cha: 8,
                attacks: {
                    bite: {
                        damageDice: 1,
                        damageDieSize: 10
                    }, 
                    claw: {
                        damageDice: 2,
                        damageDieSize: 6
                    }
                }
            }
        }
    },
    shark: {
        menuName: 'Shark',
        type: typeBeast,
        alignment: alignmentUnaligned,
        variants: {
            frenzy : {
                name: "Bloody Frenzy",
                traits: [
                    "bloodyFrenzy"
                ],
                stats: {
                    .5 : {
                        name: "Small Hunter Shark",
                    },
                    2 : {
                        name: "Hunter Shark",
                    }
                }
            },
            packHunter: {
                name: "Pack Hunter",
                traits: [
                    "packTactics"
                ],
                stats: {
                    .5 : {
                        name: "Reef Shark",
                    },
                    2 : {
                        name: "Large Reef Shark",
                    }
                }
            }
        },
        lockedStats: {
            armorDescription: armorNatural,
            attacks: {
                bite: {
                    reach: reachShort,
                    damageType: damageTypePiercing,
                    name: 'Bite'
                },
            },
            int: 1,
            skills: {
                perception : skillRankProficient
            },
            slug: "shark",
        },
        traits: [
            "waterBreathing"
        ],
        stats: {
            .5 : {
                bonusArmor: 1,
                hitDice: 4,
                swim: 40,
                size: sizeMedium,
                str: 14,
                dex: 13,
                con: 13,
                wis: 10,
                cha: 4,
                attacks: {
                    bite: {
                        damageDice: 1,
                        damageDieSize: 8
                    }
                }
            },
            2 : {
                bonusArmor: 1,
                hitDice: 6,
                swim: 40,
                size: sizeLarge,
                str: 18,
                dex: 13,
                con: 15,
                wis: 10,
                cha: 4,
                attacks: {
                    bite: {
                        damageDice: 2,
                        damageDieSize: 8
                    }
                }
            },
            5 : {
                name: "Giant Shark",
                bonusArmor: 3,
                hitDice: 11,
                swim: 50,
                size: sizeHuge,
                str: 23,
                dex: 11,
                con: 21,
                wis: 10,
                cha: 5,
                attacks: {
                    bite: {
                        damageDice: 3,
                        damageDieSize: 10
                    }
                }
            }
        }
    },
    trex: {
        type: typeBeast,
        alignment: alignmentUnaligned,
        lockedStats: {
            armorDescription: armorNatural,
            attacks: {
                bite: {
                    reach: reachMedium,
                    proc: 'grappleBiteSizeRestricted',
                    damageType: damageTypePiercing,
                    name: 'Bite'
                },
                tail: {
                    reach: reachMedium,
                    damageType: damageTypeBludgeoning,
                    name: 'Tail'
                }
            },
            int: 2,
            skills: {
                perception : skillRankProficient
            },
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
            armorDescription: armorNatural,
            attacks: {
                bite: {
                    reach: reachShort,
                    proc: 'takeDown',
                    damageType: damageTypePiercing,
                    name: 'Bite',
                    finesse: true
                }
            },
            int: 3,
            skills: {
                perception : skillRankProficient,
                stealth: skillRankProficient
            },
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
    bloodyFrenzy : {
        name: "Bloody Frenzy",
        description: "The {{slug}} has advantage on melee attack rolls against any creature that doesn't have all its hit points." 
    },
    echolocation: {
        name: "Echolocation",
        description: "The {{slug}} can't use its blindsight while deafened."
    },
    holdBreath: {
        name: "Hold Breath",
        description: "The {{slug}} can hold its breath for {{trait:duration}} minutes.",
        hasDuration: true
    },
    keenHearing : {
        name: "Keen Hearing",
        description: "The {{slug}} has advantage on Wisdom (Perception) checks that rely on hearing." 
    },
    keenHearingSmell : {
        name: "Keen Hearing and Smell",
        description: "The {{slug}} has advantage on Wisdom (Perception) checks that rely on hearing or smell." 
    },
    keenSmell : {
        name: "Keen Smell",
        description: "The {{slug}} has advantage on Wisdom (Perception) checks that rely on smell."
    },
    packTactics: {
        name: "Pack Tactics",
        description: "The {{slug}} has advantage on an attack roll against a creature if at least one of the {{slug}}'s allies is within 5 ft. of the creature and the ally isn't incapacitated."
    },
    pounce: {
        name: "Pounce",
        description: "If the {{slug}} moves at least 20 feet straight toward a creature and then hits it with a claw attack on the same turn, that target must succeed on a DC {{trait:DC}} Strength saving throw or be knocked prone. If the target is prone, the {{slug}} can make one bite attack against it as a bonus action.",
        allowsSave: true,
        dcStat: "str"
    },
    tramplingCharge: {
        name: "Trampling Charge",
        description: "If the {{slug}} moves at least 20 ft. straight toward a creature and then hits it with a gore attack on the same turn, that target must succeed on a DC {{trait:DC}} Strength saving throw or be knocked prone. If the target is prone, the {{slug}} can make one stomp attack against it as a bonus action.",
        allowsSave: true,
        dcStat: "str"
    },
    waterBreathing: {
        name: "Water Breathing",
        description: "The {{slug}} can breathe only underwater."
    }
}

const procs = {
    takeDown : "If the target is a creature, it must succeed on a DC {{DC:str}} Strength saving throw or be knocked prone",
    grappleBiteSizeRestricted: "If the target is a {{size:-2}} or smaller creature, it is grappled (escape DC {{DC:str:-1}}). Until this grapple ends, the target is restrained, and the {{slug}} can't bite another target",
    grappleBite: "The target is grappled (escape dc {{DC:str}}) Until this grapple ends, the target is restrained, and the {{slug}} can't bite another target."

}