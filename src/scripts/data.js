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
const typeElemental = 'elemental';
const typeHumanoid = 'humanoid';
const typePlant = 'plant';
const typeFey = 'fey';
const typeUndead = 'undead';

const alignmentUnaligned = 'unaligned';
const alignmentNeutral = 'neutral';
const alignmentAny = 'any alignment';
const alignmentChaoticNeutral = 'chaotic neutral';
const alignmentChaoticGood = 'chaotic good';
const alignmentChaoticEvil = 'chaotic evil'

const alignmentMaskUnaligned = 0;
const alignmentMaskLG = 1;
const alignmentMaskNG = 2;
const alignmentMaskCG = 4;
const alignmentMaskLN = 8;
const alignmentMaskTN = 16;
const alignmentMaskCN = 32;
const alignmentMaskLE = 64;
const alignmentMaskNE = 128;
const alignmentMaskCE = 256;
const alignmentMaskAny = 511;

const alignmentMaskGood = alignmentMaskLG | alignmentMaskNG | alignmentMaskCG;
const alignmentMaskEvil = alignmentMaskLE | alignmentMaskNE | alignmentMaskCE;
const alignmentMaskLawful = alignmentMaskLG | alignmentMaskLN | alignmentMaskLE;
const alignmentMaskChaotic = alignmentMaskCG | alignmentMaskCN | alignmentMaskCE;
const alignmentMaskAnyLawfulGood = alignmentMaskGood | alignmentMaskLawful;

const genderMale = 1;
const genderFemale = 2;
const genderNeutral = 3;
const genderNone = 4;

const alignmentStrings = {
    alignmentMaskUnaligned : 'unaligned',
    alignmentMaskLG: 'lawful good',
    alignmentMaskNG: 'neutral good',
    alignmentMaskCG: 'chaotic good',
    alignmentMaskLN: 'lawful neutral',
    alignmentMaskTN: 'neutral',
    alignmentMaskCN: 'chaotic neutral',
    alignmentMaskLE: 'lawful evil',
    alignmentMaskNE: 'neutral evil',
    alignmentMaskCE: 'chaotic evil',
    alignmentMaskGood : 'any good',
    alignmentMaskEvil : 'any evil',
    alignmentMaskLawful : 'any lawful',
    alignmentMaskChaotic : 'any chaotic',
    alignmentMaskAnyLawfulGood : 'any lawful or good'
}

const armorNatural = "Natural Armor";

const damageTypePiercing = 'piercing';
const damageTypeBludgeoning = 'bludgeoning';
const damageTypeSlashing = 'slashing';
const damageTypeMundanePhysical = 'Bludgeoning, Piercing, and Slashing From Nonmagical Attacks';
const damageTypeMundanePiercingSlashing = "Piercing and Slashing From Nonmagical Attacks";
const damageTypeAcid = 'acid';
const damageTypeCold = 'cold';
const damageTypeFire = 'fire';
const damageTypeLightning = 'lightning';
const damageTypeNecrotic = 'necrotic';
const damageTypePoison = 'poison';
const damageTypePsychic = 'psychic';
const damageTypeRadiant = 'radiant';
const damageTypethunder = 'thunder';

const conditionExhaustion = 'exhaustion';
const conditionGrappled = 'grappled';
const conditionParalyzed = 'paralyzed';
const conditionPetrified = 'petrified';
const conditionPoisoned = 'poisoned';
const conditionProne = 'prone';
const conditionRestrained = 'restrained';
const conditionUnconscious = 'unconscious';
const conditionCharmed = 'charmed';
const conditionFrightened = 'frightened';
const conditionBlinded = 'blinded';

const languageCreator = 'One Language Known By Its Creator';
const languageIgnan = 'Ignan';
const languageAnyOne = 'Any One Language';
const languageCommon = 'Common';
const languageDwarfish = 'Dwarfish';
const languageElvish = 'Elvish';
const languageSylvan = 'Sylvan';

const skillRankUnproficient = 0;
const skillRankProficient = 1;
const skillRankExpert = 2;

const raceAny = 'any race';
const raceDwarf = 'dwarf';
const raceHuman = 'human';

const senses = ['darkvision', 'blindsight'];

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
    awakenedPlant: {
        name: 'Awakened Plant',
        type: typePlant,
        alignment: alignmentUnaligned,
        variants: {
            shrub : {
                name: "Awakened Shrub",
                stats: {
                    0 : {
                        name: "Awakened Shrub",
                        attacks: {
                            rake: {
                                damageDieSize: 4,
                                damageDice: 1
                            },
                        },
                    },
                },
                lockedStats: {
                    slug: "shrub",
                    resistances: [damageTypePiercing],
                    attacks: {
                        rake: {
                            reach: reachMediumShort,
                            damageType: damageTypeSlashing,
                            name: 'Rake',
                            finesse: true
                        },
                    },
                }
            },
            tree: {
                name: "Awakened Tree",
                stats: {
                    0: {
                        name: "Awakened Sapling"
                    },
                    2 : {
                        name: "Awakened Tree",
                        attacks: {
                            slam: {
                                damageDieSize: 6,
                                damageDice: 3
                            },
                        },
                    },
                },
                lockedStats: {
                    slug: "tree",
                    resistances: [damageTypeBludgeoning, damageTypePiercing],
                    attacks: {
                        slam: {
                            reach: reachMediumShort,
                            damageType: damageTypeBludgeoning,
                            name: 'Slam',
                        },
                    },
                }
            }
        },
        lockedStats: {
            armorDescription: armorNatural,
            int: 10,
            wis: 10,
            vulnerabilities: [damageTypeFire],
            languages: [languageCreator]
        },
        traits: [
            "falseAppearance"
        ],
        stats: {
            0 : {
                bonusArmor: 0,
                speed: 20,
                hitDice: 3,
                size: sizeSmall,
                str: 3,
                dex: 8,
                con: 11,
                cha: 6,
            },
            2 : {
                bonusArmor: 5,
                hitDice: 7,
                size: sizeHuge,
                str: 19,
                dex: 6,
                con: 15,
                cha: 7,
            }
        }
    },
    baboon: {
        type: typeBeast,
        alignment: alignmentUnaligned,
        lockedStats: {
            attacks: {
                bite: {
                    reach: reachMedium,
                    damageType: damageTypePiercing,
                    name: 'Bite'
                }
            },
            slug: "baboon",
        },
        traits: [
            "packTactics"
        ],
        stats: {
            0 : {
                name: "Baboon",
                hitDice: 1,
                speed: 30,
                climb: 30,
                size: sizeSmall,
                str: 8,
                dex: 14,
                con: 11,
                int: 4,
                wis: 12,
                cha: 6,
                attacks: {
                    bite: {
                        damageDice: 1,
                        damageDieSize: 4
                    },
                }
            },
        }
    },
    badger: {
        type: typeBeast,
        alignment: alignmentUnaligned,
        lockedStats: {
            attacks: {
                bite: {
                    reach: reachMedium,
                    damageType: damageTypePiercing,
                    name: 'Bite',
                    finesse: true
                }
            },
            int: 2,
            slug: "badger",
        },
        traits: [
            "keenSmell"
        ],
        stats: {
            0 : {
                name: "Badger",
                hitDice: 1,
                speed: 20,
                burrow: 5,
                size: sizeTiny,
                str: 4,
                dex: 11,
                con: 12,
                wis: 12,
                cha: 5,
                attacks: {
                    bite: {
                        damageDice: 1,
                        damageDieSize: 1
                    },
                }
            },
            .25 : {
                name: "Giant Badger",
                hitDice: 12,
                speed: 30,
                burrow: 10,
                size: sizeMedium,
                str: 13,
                dex: 10,
                con: 15,
                wis: 12,
                cha: 5,
                multiattack: {
                  attacks: {
                    bite: 1,
                    claws: 1
                  }
                },
                attacks: {
                    bite: {
                        damageDice: 1,
                        damageDieSize: 6
                    },
                    claws: {
                        reach: reachMedium,
                        damageType: damageTypeSlashing,
                        name: 'Claws',
                        damageDice: 2,
                        damageDieSize: 4
                    }
                }
            },
        }
    },
    bat: {
        type: typeBeast,
        alignment: alignmentUnaligned,
        lockedStats: {
            attacks: {
                bite: {
                    reach: reachMedium,
                    damageType: damageTypePiercing,
                    name: 'Bite',
                }
            },
            int: 2,
            blindsight: 60,
            slug: "bat",
        },
        traits: [
            "keenHearing",
            "echolocation"
        ],
        stats: {
            0 : {
                name: "Bat",
                hitDice: 1,
                speed: 5,
                fly: 30,
                size: sizeTiny,
                str: 2,
                dex: 15,
                con: 8,
                wis: 12,
                cha: 4,
                attacks: {
                    bite: {
                        damageDice: 1,
                        damageDieSize: 1
                    },
                }
            },
            .25 : {
                name: "Giant Bat",
                hitDice: 12,
                speed: 30,
                fly: 30,
                size: sizeMedium,
                str: 15,
                dex: 16,
                con: 11,
                wis: 12,
                cha: 6,
                attacks: {
                    bite: {
                        damageDice: 1,
                        damageDieSize: 6
                    },
                }
            },
        }
    },
    //TODO: Commoners are actually extremely OP for CR 0, which leads to ridiculous scaling. Might need add some extra statblocks, or just leave commoner out
    commoner: {
        type: typeHumanoid,
        alignment: alignmentAny,
        race: raceAny,
        gender: genderNeutral,
        lockedStats: {
            attacks: {
                club: {
                    reach: reachMedium,
                    damageType: damageTypeBludgeoning,
                    name: 'Club'
                }
            },
            extraLanguages: 1,
            slug: "commoner",
            size: sizeMedium
        },
        stats: {
            0 : {
                name: "Commoner",
                hitDice: 1,
                speed: 30,
                str: 10,
                dex: 10,
                con: 10,
                int: 10,
                wis: 10,
                cha: 10,
                attacks: {
                    club: {
                        damageDice: 1,
                        damageDieSize: 4
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
    dolphinDelighter: {
        name: "Dolphin Delighter",
        type: typeFey,
        alignment: alignmentChaoticGood,
        lockedStats: {
            armorDescription: armorNatural,
            attacks: {
                dazzlingSlam: {
                    reach: reachShort,
                    damageType: damageTypeBludgeoning,
                    damageRiderType: damageTypePsychic,
                    name: 'Dazzling Slam',
                    proc: 'conditionNoSave'
                }
            },
            multiattack: {
                attacks: {
                    dazzlingSlam: 2
                }
            },
            skills: {
                perception: skillRankProficient,
                performance: skillRankProficient
            },
            slug: "dolphin",
        },
        stats: {
            3 : {
                name: "Dolphin Delighter",
                bonusArmor: 3,
                blindsight: 60,
                hitDice: 5,
                speed: 0,
                swim: 60,
                size: sizeMedium,
                str: 14,
                dex: 13,
                con: 13,
                int: 11,
                wis: 12,
                cha: 16,
                attacks: {
                    dazzlingSlam: {
                        damageDice: 1,
                        damageDieSize: 6,
                        damageRiderDice: 2,
                        damageRiderDieSize: 6
                    }
                },
                traits: {
                    conditionNoSave: {
                        condition: 'blinded'
                    },
                    delightfulLight: {
                        damageDice: 2,
                        damageDieSize: 10
                    },
                    holdBreath: {
                        duration: 20
                    },
                }
            }
        },
        bonusActions: [
            'delightfulLight',
            'feyLeap'
        ],
        traits: [
            "holdBreath"
        ]
    },
    dryad: {
        type: typeFey,
        alignment: alignmentNeutral,
        lockedStats: {
            attacks: {
                club: {
                    reach: reachMedium,
                    damageType: damageTypeBludgeoning,
                    name: 'Club',
                }
            },
            castingStat: 'cha',
            gender: genderFemale,
            languages: [
                languageElvish,
                languageSylvan
            ],
            skills: {
                perception: skillRankProficient,
                stealth: skillRankProficient
            },
            slug: "dryad",
            size: sizeMedium,
            traits: {
                innateSpellcasting: {
                    spellList: {
                        druidcraft: {
                            uses: 0
                        },
                        entangle: {
                            uses: 3
                        },
                        goodberry: {
                            uses: 3
                        },
                        barkskin: {
                            uses: 1
                        },
                        passWithoutTrace: {
                            uses: 1
                        },
                        shillelagh: {
                            uses: 1
                        }
                    }
                }
            }
        },
        stats: {
            1 : {
                name: "Dryad",
                hitDice: 5,
                speed: 30,
                str: 10,
                dex: 12,
                con: 11,
                int: 14,
                wis: 15,
                cha: 18,
                attacks: {
                    club: {
                        damageDice: 1,
                        damageDieSize: 4
                    }
                },
            }
        },
        actions: [
            "feyCharm"
        ],
        traits: [
            "innateSpellcasting",
            "magicResistance",
            "speakWithBeastsAndPlants",
            "treeStride"
        ]
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
    fireElemental: {
        name: "Fire Elemental",
        type: typeElemental,
        alignment: alignmentNeutral,
        lockedStats: {
            darkvision: 60,
            languages: [languageIgnan],
            resistances: [damageTypeMundanePhysical],
            immunities: [damageTypeFire, damageTypePoison],
            conditionImmunities: [conditionExhaustion, conditionGrappled, conditionParalyzed, conditionPetrified, conditionPoisoned, conditionProne, conditionRestrained, conditionUnconscious],
            attacks: {
                touch: {
                    reach: reachMediumShort,
                    damageType: damageTypeFire,
                    name: 'Touch',
                    proc: 'ignite'
                }
            },
            slug: "elemental",
            multiattack: {
                attacks: {
                    touch : 2
                }
            },
        },
        traits: ["fireForm", "illumination", "waterSusceptibility"],
        stats: {
            5 : {
                name: "Fire Elemental",
                hitDice: 12,
                speed: 50,
                size: sizeLarge,
                str: 10,
                dex: 17,
                con: 16,
                int: 6,
                wis: 10,
                cha: 7,
                attacks: {
                    touch: {
                        damageDice: 2,
                        damageDieSize: 6,
                        finesse: true
                    }
                },
                traits: {
                    ignite: {
                        damageDice: 1,
                        damageDieSize: 10
                    },
                    fireForm: {
                        damageDice: 1,
                        damageDieSize: 10
                    },
                    waterSusceptibility: {
                        damageDice: 1,
                        damageDieSize: 1
                    }
                }
            }
        }
    },
    killerWhale: {
        name: "Killer Whale",
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
    naiad: {
        type: typeFey,
        alignment: alignmentChaoticNeutral,
        lockedStats: {
            armorDescription: armorNatural,
            attacks: {
                psychicTouch: {
                    reach: reachMedium,
                    damageType: damageTypePsychic,
                    name: 'Psychic Touch',
                    spellAttack: true
                }
            },
            castingStat: 'cha',
            languages: [
                languageCommon,
                languageSylvan
            ],
            resistances: [damageTypePsychic],
            immunities: [damageTypePoison],
            conditionImmunities: [conditionCharmed, conditionFrightened, conditionPoisoned],
            skills: {
                persuasion: skillRankProficient,
                sleightOfHand: skillRankProficient
            },
            slug: "naiad",
            size: sizeMedium,
            traits: {
                innateSpellcasting: {
                    spellList: {
                        minorIllusion: {
                            uses: 0
                        },
                        phantasmalForce: {
                            uses: 3
                        },
                        fly: {
                            uses: 1
                        },
                        hypnoticPattern: {
                            uses: 1
                        }
                    }
                }
            },
            multiattack: {
                attacks: {
                    psychicTouch: 2,
                }
            },
        },
        stats: {
            2 : {
                name: "Naiad",
                bonusArmor: 2,
                hitDice: 7,
                speed: 30,
                swim: 30,
                str: 10,
                dex: 16,
                con: 11,
                int: 15,
                wis: 10,
                cha: 18,
                attacks: {
                    psychicTouch: {
                        damageDice: 1,
                        damageDieSize: 10
                    }
                },
            }
        },
        traits: [
            "amphibious",
            "invisibleInWater",
            "innateSpellcasting",
            "magicResistance"
        ]
    },
    quetzalcoatlus: {
        type: typeBeast,
        subtype: 'dinosaur',
        alignment: alignmentUnaligned,
        lockedStats: {
            int: 2,
            skills: {
                perception: skillRankProficient,
            },
            attacks: {
                bite: {
                    reach: reachShort,
                    damageType: damageTypePiercing,
                    name: 'Bite',
                    proc: 'flyingCharge',
                }
            },
        },
        traits: [
            "flyby"
        ],
        stats: {
            2: {
                name: 'Quetzalcoatlus',
                size: sizeHuge,
                hitDice: 4,
                str: 15,
                dex: 13,
                con: 13,
                wis: 10,
                cha: 5,
                slug: 'quetzalcoatlus',
                speed: 10,
                fly: 80,
                attacks: {
                    bite: {
                        damageDice: 3,
                        damageDieSize: 6
                    }
                },
                traits: {
                    flyingCharge: {
                        damageDice: 3,
                        damageDieSize: 6
                    }
                }
            },
            8: {
                name: "Hatzegopteryx",
                slug: "hatzegopteryx"
            }
        }
    },
    saberToothedTiger: {
        name: 'Saber-Toothed Tiger',
        type: typeBeast,
        alignment: alignmentUnaligned,
        lockedStats: {
            slug: 'tiger',
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
                speed: 40,
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
    shadow: {
        alignment: alignmentChaoticEvil,
        lockedStats: {
            attacks: {
                strengthDrain: {
                    reach: reachMedium,
                    damageType: damageTypeNecrotic,
                    name: 'Strength Drain',
                    finesse: true,
                    proc: "strengthDrain"
                }
            },
            conditionImmunities: [conditionExhaustion, conditionFrightened, conditionGrappled, conditionParalyzed, conditionPetrified, conditionPoisoned, conditionProne, conditionRestrained],
            immunities: [damageTypeNecrotic, damageTypePoison],
            resistances: [damageTypeAcid, damageTypeCold, damageTypeFire, damageTypeLightning, damageTypethunder],
            skills: {
                stealth: skillRankProficient
            },
            slug: "shadow",
        },
        stats: {
            2 : {
                hitDice: 3,
                speed: 40,
                size: sizeMedium,
                str: 6,
                dex: 14,
                con: 13,
                int: 6,
                wis: 10,
                cha: 8,
                attacks: {
                    strengthDrain: {
                        damageDice: 2,
                        damageDieSize: 6
                    }
                },
            }
        },
        traits: [
            "amorphous",
            "shadowStealth",
            "sunlightWeakness"
        ],
        variants: {
            shadow: {
                name: "Shadow",
                type: typeUndead,
                lockedStats: {
                    resistances: [damageTypeMundanePhysical],
                    vulnerabilities: [damageTypeRadiant]
                },
                stats: {
                    2: {
                        name: "Shadow"
                    }
                }
            },
            detachedShadow: {
                name: "Detached Shadow",
                type: typeFey,
                lockedStats: {
                    resistances: [damageTypeMundanePhysical],
                    vulnerabilities: [damageTypeRadiant]
                },
                stats: {
                    2: {
                        name: "Detached Shadow"
                    }
                }
            },
            reflection: {
                name: "Reflection",
                type: typeFey,
                lockedStats: {
                    slug: "reflection",
                    resistances: [damageTypeMundanePiercingSlashing],
                    vulnerabilities: [damageTypeBludgeoning]
                },
                stats: {
                    2: {
                        name: "Reflection"
                    }
                }
            }
        }
    },
    shark: {
        name: 'Shark',
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
                },
                traits: {
                    grappleBiteSizeRestricted: {
                        dcAdjustment: -1,
                        sizeAdjustment: -2
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
 * Beasts were excluded from average INT calculations, as their INT tends to be capped at 3, regardless of CR.
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
    acrobatics: {
        ability: 'dex'
    },
    animalHandling: {
        ability: 'wis',
        name: 'Animal Handling'
    },
    arcana: {
        ability: 'int'
    },
    athletics: {
        ability: 'str'
    },
    deception: {
        ability: 'cha'
    },
    history: {
        ability: 'int'
    },
    insight: {
        ability: 'wis'
    },
    intimidation: {
        ability: 'cha'
    },
    investigation: {
        ability: 'int'
    },
    medicine: {
        ability: 'wis'
    },
    nature: {
        ability: 'int'
    },
    perception: {
        ability: 'wis'
    },
    performance: {
        ability: 'cha'
    },
    persuasion: {
        ability: 'cha'
    },
    religion: {
        ability: 'int'
    },
    sleightOfHand: {
        ability: 'dex',
        name: 'Sleight Of Hand'
    },
    stealth: {
        ability: 'dex'
    },
    survival: {
        ability: 'wis'
    },
}

const races = [
    {
        name : raceAny
    },
    {
        //This includes hill dwarf stats, will need to split up if other dwarf subraces are added
        name: raceDwarf,
        stats: {
            size: sizeMedium,
            languages: [languageCommon, languageDwarfish],
            alignment: alignmentMaskAnyLawfulGood,
            speed: 25,
            darkvision: 60,
            resistances: [damageTypePoison],
        },
        traits: ['dwarvenTraining', 'dwarvenResilience', 'dwarvenToughness', 'toolProficiency', 'stoneCunning'],
        bonusStats: {
            con: 2,
            wis: 1,
        }
    },
    {
        name: raceHuman,
        stats: {
            size: sizeMedium,
            languages: [languageCommon],
            speed: 30
        },
        bonusStats: {
            str: 1,
            con: 1,
            dex: 1,
            int: 1,
            wis: 1,
            cha: 1
        }
    }
]

//Procs, traits, and actions could possibly be condensed into one list since they are used similarly.
//The only real reason they're kept apart is in case we ever add custom monster building, they'll need to be differentiated, but that could be handled with a field
const traits = {
    amorphous: {
        name: "Amorphous",
        description: "{{description}} can move through a space as narrow as 1 inch wide without squeezing."
    },
    amphibious: {
        name: "Amphibious",
        description: "{{description}} can breathe air and water."
    },
    bloodyFrenzy : {
        name: "Bloody Frenzy",
        description: "{{description}} has advantage on melee attack rolls against any creature that doesn't have all its hit points." 
    },
    dwarvenResilience : {
        name: "Dwarven Resilience",
        description: "{{description}} has advantage on saving throws against poison." 
    },
    dwarvenToughness : {
        name: "Dwarven Tougness",
        description: "{{description}} has one extra hit point per hit die.",
        hitPointsPerHitDie: 1
    },
    dwarvenTraining : {
        name: "Dwarven Combat Training",
        description: "{{description}} has proficiency with the battleaxe, handaxe, light hammer, and warhammer." 
    },
    echolocation: {
        name: "Echolocation",
        description: "{{description}} can't use {{pronoun:possessiveAdj}} blindsight while deafened."
    },
    empoweredSpells: {
        name: "Empowered Spells",
        description: "Whenever {{description}} casts a spell of the {{trait:school}} school by expending a spell slot, {{description}} can add {{pronoun:possessiveAdj}} spellcasting ability modifier ({{castingModifier}}) to the spell's damage roll or healing roll, if any."
    },
    falseAppearance: {
        name: "False Appearance",
        description: "While {{description}} remains motionless, {{pronoun:subject}} is indistinguishable from a normal {{appearance}}."
    },
    fireForm: {
        name: "Fire Form",
        description: "{{description}} can move through a space as narrow as 1 inch wide without squeezing. A creature that touches {{description}} or hits {{pronoun:object}} with a melee attack while within 5 ft. of {{pronoun:object}} takes {{trait:damage}} fire damage. In addition, {{description}} can enter a hostile creature's space and stop there. The first time {{pronoun:subject}} enters a creature's space on a turn, that creature takes {{trait:damage}} fire damage and catches fire; until someone takes an action to douse the fire, the creature takes {{trait:damage}} fire damage at the start of each of its turns.",
        dealsDamage: true
    },
    flyby: {
        name: "Flyby",
        description: "{{description}} doesn't provoke an opportunity attack when it flies out of an enemy's reach.",
    },
    holdBreath: {
        name: "Hold Breath",
        description: "{{description}} can hold {{pronoun:possessiveAdj}} breath for {{trait:duration}} minutes.",
        hasDuration: true
    },
    illumination: {
        name: "Illumination",
        description: "{{description}} sheds bright light in a 30-foot radius and dim light in an additional 30 ft."
    },
    innateSpellcasting: {
        name: "Innate Spellcasting",
        description: "{{description}}'s spellcasting ability is Charisma (spell save DC {{trait:DC}}). {{pronoun:subject}} can innately cast the following spells, requiring no material components: {{trait:spellListInnate}}",
        allowsSave: true,
        dcStat: 'cha',
    },
    invisibleInWater: {
        name: "Invisible in Water",
        description: "{{description}} is invisible while fully immersed in water."
    },
    keenHearing : {
        name: "Keen Hearing",
        description: "{{description}} has advantage on Wisdom (Perception) checks that rely on hearing." 
    },
    keenHearingSmell : {
        name: "Keen Hearing and Smell",
        description: "{{description}} has advantage on Wisdom (Perception) checks that rely on hearing or smell." 
    },
    keenSmell : {
        name: "Keen Smell",
        description: "{{description}} has advantage on Wisdom (Perception) checks that rely on smell."
    },
    packTactics: {
        name: "Pack Tactics",
        description: "{{description}} has advantage on an attack roll against a creature if at least one of {{description}}'s allies is within 5 ft. of the creature and the ally isn't incapacitated."
    },
    magicAttacks: {
        name: "Magic Weapons",
        description: "{{description}}'s weapon attacks are magical."
    },
    magicResistance: {
        name: "Magic Resistance",
        description: "{{description}} has advantage on saving throws against spells and other magical effects."
    },
    potentCantrips: {
        name: "Potent Cantrips",
        description: "{{description}} can add {{pronoun:possessiveAdj}} spellcasting ability modifier ({{castingModifier}}) to the damage {{pronoun:subject}} deals with any cantrip."
    },
    pounce: {
        name: "Pounce",
        description: "If {{description}} moves at least 20 feet straight toward a creature and then hits it with a claw attack on the same turn, that target must succeed on a DC {{trait:DC}} Strength saving throw or be knocked prone. If the target is prone, {{description}} can make one bite attack against it as a bonus action.",
        allowsSave: true,
        dcStat: "str"
    },
    shadowStealth: {
        name: "Shadow Stealth",
        description: "While in dim light or darkness, {{description}} can take the Hide action as a bonus action. {{pronoun:possessive}} stealth bonus is also improved to {{abilityBonus:dex:2}}."
    },
    speakWithBeastsAndPlants: {
        name: "Speak with Beasts and Plants",
        description: "{{description}} can communicate with beasts and plants as if they shared a language."
    },
    spellcasting: {
        name: "Spellcasting",
        description: "{{description}} is a {{trait:ordinalLevel}}-level spellcaster. {{pronoun:object}} spellcasting ability is {{castingStatName}} (spell save DC {{spellSaveDC}}, {{spellAttackModifier}} to hit with spell attacks). {{description}} has the following {{trait:castingClass}} spells prepared:{{spellListClass}}"
    },
    stoneCunning : {
        name: "Stonecunning",
        description: "Whenever {{description}} makes an Intelligence (History) check related to the origin of stonework, {{pronoun:subject}} is considered proficient in the History skill and add double {{pronoun:possessiveAdj}} proficiency bonus to the check, instead of {{pronoun:possessiveAdj}} normal proficiency bonus."
    },
    sunlightWeakness: {
        name: "Sunlight Weakness",
        description: "While in sunlight, {{description}} has disadvantage on attack rolls, ability checks, and saving throws."
    },
    treeStride: {
        name: "Tree Stride",
        description: "Once on {{pronoun:object}} turn, {{description}} can use 10 feet of {{pronoun:object}} movement to step magically into one living tree within {{pronoun:object}} reach and emerge from a second living tree within 60 feet of the first tree, appearing in an unoccupied space within 5 feet of the second tree. Both trees must be large or bigger."
    },
    toolProficiency: {
        name: 'Tool Proficiency',
        description: '{{description}} has proficiency with one type of artisan&rsquo;s tools: smith&rsquo;s tools, brewer&rsquo;s supplies, or mason&rsquo;s tools. '
    },
    tramplingCharge: {
        name: "Trampling Charge",
        description: "If {{description}} moves at least 20 ft. straight toward a creature and then hits it with a gore attack on the same turn, that target must succeed on a DC {{trait:DC}} Strength saving throw or be knocked prone. If the target is prone, {{description}} can make one stomp attack against it as a bonus action.",
        allowsSave: true,
        dcStat: "str"
    },
    waterBreathing: {
        name: "Water Breathing",
        description: "{{description}} can breathe only underwater."
    },
    waterSusceptibility: {
        name: "Water Suspceptibility",
        description: "For every 5 ft. {{description}} moves in water, or for every gallon of water splashed on {{pronoun:object}}, {{pronoun:subject}} takes {{trait:damage}} cold damage.",
        dealsDamage: true //Technically it's the opposite, but why reinvent the wheel
    }
}

//Proc names aren't currently used, but may be someday if we add an edit feature
const procs = {
    ignite: {
        name: "Ignite",
        description: "If the target is a creature or a flammable object, it ignites. Until a creature takes an action to douse the fire, the target takes {{trait:damage}} fire damage at the start of each of its turns.",
        dealsDamage: true,
    },
    flyingCharge: {
        name: "Flying Charge",
        description: "If {{description}} flew least 30 feet toward the target immediately before the hit, the target takes an extra {{trait:damage}} piercing damage.",
        dealsDamage: true
    },
    grappleBiteSizeRestricted: {
        name: "Grapple Bite",
        description: "If the target is a {{trait:size}} or smaller creature, it is grappled (escape DC {{trait:DC}}). Until this grapple ends, the target is restrained, and {{description}} can't bite another target",
        allowsSave: true,
        dcStat: "str",
        sizeRestricted: true
    },
    grappleBite: {
        name: "Grapple Bite",
        description: "The target is grappled (escape dc {{trait:DC}}) Until this grapple ends, the target is restrained, and {{description}} can't bite another target.",
        allowsSave: true,
        dcStat: "str"
    },
    conditionNoSave: {
        name: "Status No Save",
        description: "The target is {{trait:condition}} until the start of {{description}}'s next turn.",
        appliesCondition: true
    },
    strengthDrain: {
        name: "Strength Drain",
        description: "the target's Strength score is reduced by 1d4. The target dies if this reduces its Strength to 0. Otherwise, the reduction lasts until the target finishes a short or long rest. If a non-evil humanoid dies from this attack, a new {{slug}} rises from the corpse 1d4 hours later."
    },
    takeDown: {
        name: "Takedown",
        description: "If the target is a creature, it must succeed on a DC {{trait:DC}} Strength saving throw or be knocked prone",
        allowsSave: true,
        dcStat: "str"
    },
};

//TODO: Make recharge an adjustable attribute, if necessary.
const actions = {
    delightfulLight: {
        name: "Delightful Light (Recharge 5–6)",
        description: "{{description}} magically emanates light in a 10-foot radius for a moment. {{description}} and each creature of {{pronoun:possessiveAdj}} choice in that light gain {{trait:damage}} temporary hit points.",
        dealsDamage: true, //Not really but there's no reason to create an entirely separate mechanic for healing
    },
    feyCharm: {
        name: "Fey Charm",
        description: "{{description}} targets one humanoid or beast that {{pronoun:subject}} can see within 30 feet of {{pronoun:object}}. If the target can see {{description}}, it must succeed on a DC {{trait:DC}} Wisdom saving throw or be magically charmed. The charmed creature regards {{description}} as a trusted friend to be heeded and protected. Although the target isn't under {{description}}'s control, it takes {{description}}'s requests or actions in the most favorable way it can.<span class='trait-spacer'></span>Each time {{description}} or {{pronoun:possessiveAdj}} allies do anything harmful to the target, it can repeat the saving throw, ending the effect on itself on a success. Otherwise, the effect lasts 24 hours or until {{description}} dies, is on a different plane of existence from the target, or ends the effect as a bonus action. If a target's saving throw is successful, the target is immune to {{description}}'s Fey Charm for the next 24 hours.<span class='trait-spacer'></span>{{description}} can have no more than one humanoid and up to three beasts charmed at a time.",
        allowsSave: true,
        dcStat: 'cha'
    },
    feyLeap: {
        name: "Fey Leap",
        description: "{{description}} teleports up to 30 feet to an unoccupied space {{pronoun:subject}} can see. Immediately before teleporting, {{description}} can choose one creature within 5 feet of {{pronoun:object}}. That creature can teleport with {{description}}, appearing in an unoccupied space within 5 feet of {{description}}'s destination space."
    },
    helpful: {
        name: "Helpful",
        description: "{{description}} takes the Help action."
    }
};


const pronouns = [
    {}, //First one is blank since 0 is default for creature type
    {
        subject: 'he',
        object: 'him',
        possessive: 'his', 
        possessiveAdj: 'his' 
    },
    {
        subject: 'she',
        object: 'her',
        possessive: 'hers',
        possessiveAdj: 'her' 
    },

    {
        subject: 'they',
        object: 'them',
        possessive: 'theirs',
        possessiveAdj: 'their'
    },
    {
        subject: 'it',
        object: 'it',
        possessive: 'its',
        possessiveAdj: 'its'
    }
]

const classArtificer = 'artificer';
const classBard = 'bard';
const classCleric = 'cleric';
const classDruid = 'druid';
const classSorcerer = 'sorcerer';
const classWarlock = 'warlock';
const classWizard = 'wizard';

const schoolAbjuration = 'Abjuration';
const schoolConjuration = 'Conjuration';
const schoolDivination = 'Divination';
const schoolEnchantment = 'Enchantment';
const schoolEvocation = 'Evocation';
const schoolIllusion = 'Illusion';
const schoolNecromancy = 'Necromancy';
const schoolTransmutation = 'Transmutation';
const magicSchools = [
    schoolAbjuration,
    schoolConjuration,
    schoolDivination,
    schoolEnchantment,
    schoolEvocation,
    schoolIllusion,
    schoolNecromancy,
    schoolTransmutation
];

const spells = {
    barkskin: {
        name: 'barkskin'
    },
    controlFlames: {
        classes: [classDruid, classSorcerer, classWizard],
        level: 0,
        name: 'control flames',
    },
    createBonfire: {
        classes: [classDruid, classSorcerer, classWarlock, classWizard, classArtificer],
        level: 0,
        name: 'create bonfire',
    },
    druidcraft: {
        classes: [classDruid],
        level: 0,
        name: 'druidcraft'
    },
    entangle: {
        name: 'entangle'
    },
    fly: {
        name: 'fly'
    },
    frostbite: {
        classes: [classDruid, classSorcerer, classWarlock, classWizard, classArtificer],
        level: 0,
        name: 'frostbite'
    },
    goodberry: {
        name: 'goodberry'
    },
    guidance: {
        classes: [classCleric, classDruid, classArtificer],
        level: 0,
        name: 'guidance'
    },
    gust: {
        classes: [classDruid, classSorcerer, classWizard],
        level: 0,
        name: 'gust'
    },
    hypnoticPattern: {
        name: 'hypnotic pattern'
    },
    infestation: {
        classes: [classDruid, classSorcerer, classWarlock, classWizard],
        level: 0,
        name: 'infestation'
    },
    light: {
        classes: [classBard, classCleric, classSorcerer, classWizard, classArtificer],
        level: 0,
        name: 'light'
    },
    minorIllusion: {
        name: 'minor illusion'
    },
    passWithoutTrace: {
        name: 'pass without trace'
    },
    phantasmalForce: {
        name: 'phantasmal force'
    },
    shillelagh: {
        name: 'shillelagh'
    },
}

const sidekickClasses = {
    expert: {
        asi: [4,8,10,12,16,19],
        bonusProficiencies: {
            count: 5,
            saves: ['dex', 'int', 'cha']
        },
        //TODO: Add the extra armor/tool/weapon proficiencies. 
        features: [
            {
                level: 1,
                bonusAction: 'helpful'
            },
            {
                level: 3,
                options: [
                    {
                        id: 'expertExpertise',
                        label: 'Skill Expertise',
                        limit: 2,
                        list: (statblock) => {
                            let skillList = {};
                            //Get a list of skills the expert is proficient in
                            for (let skill in statblock.skills) {
                                skillList[skill] = skills[skill];
                            }
                            return skillList;
                        },
                        result: (statblock, value) => {
                            //Apply the chosen expertise
                            for (let i = 0; i < value.length; i++) {
                                statblock.skills[value[i]] = skillRankExpert;
                            }
                        }
                    }
                ]
            }
        ]
    },
    spellcaster: {
        asi: [4,8,12,16,18],
        bonusProficiencies: {
            count: 2,
            skills: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'performance', 'persuasion', 'religion'],
            saves: ['wis', 'int', 'cha']
        },
        features: [
            {
                level: 1,
                trait: 'spellcasting',
                options: [
                    {
                        id: 'cantrips',
                        label: 'Cantrips Known',
                        limit: (statblock) => {
                            return spellProgression.half[statblock.level][0];
                        },
                        list: (statblock) => {
                            let cantrips = {};
                            for (let spell in spells) {
                                if (spells[spell].level === 0) {
                                    cantrips[spell] = {name: toTitleCase(spells[spell].name) };
                                }
                            }
                            return cantrips;
                        },
                    }
                ],
            },
            {
                level: 6,
                trait: 'potentCantrips'
            },
            {
                level: 14,
                trait: 'empoweredSpells',
                options: [{
                    id: 'empoweredSpells',
                    label: 'Empowered Spells School',
                    list: magicSchools,
                    //I really wanted to make this whole thing data driven, but y'know sometimes you just need a bespoke callback function
                    result: (statblock, value) => {
                        statblock.traits.empoweredSpells.school = value;
                    }
                }], 
            }
        ],
        roles: {
            healer: {
                merge: {
                    castingClass: [classDruid, classCleric],
                    castingStat: 'wis'
                }
            },
            mage: {
                merge: {
                    castingClass: [classWizard],
                    castingStat: 'wis'
                }
            },
            prodigy: {
                merge: {
                    castingClass: [classBard, classWarlock],
                    castingStat: 'wis'
                }
            }
        }
    },
    warrior: {
        asi: [4,8,12,14,16,19],
        bonusProficiencies: {
            count: 2,
            skills: ['acrobatics', 'animalHandling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'],
            saves: ['str', 'dex', 'con']
        },
        roles: {
            defensive: {},
            offensive: {}
        }
    },
}

const abilities = {
    str: {
        name: 'Strength'
    },
    dex: {
        name: 'Dexterity'
    },
    con: {
        name: 'Constitution'
    },
    int: {
        name: 'Intelligence'
    },
    wis: {
        name: 'Wisdom'
    },
    cha: {
        name: 'Charisma'
    }
}

//TODO: Add full progression, add progression to 30 (or more)
const spellProgression = {
    half: [
       //0   1   2   3   4   5   6   7   8   9
        [2],[2],                                //1
        [2],[2],                                //2
        [2],[3],                                //3
        [3],[3],                                //4
        [3],[4],[2],                            //5
        [3],[4],[2],                            //6
        [3],[4],[3],                            //7
        [3],[4],[3],                            //8
        [3],[4],[3],[2],                        //9
        [4],[4],[3],[2],                        //10
        [4],[4],[3],[3],                        //11
        [4],[4],[3],[3],                        //12
        [4],[4],[3],[3],[1],                    //13
        [4],[4],[3],[3],[1],                    //14
        [4],[4],[3],[3],[2],                    //15
        [4],[4],[3],[3],[2],                    //16
        [4],[4],[3],[3],[3],[1],                //17
        [4],[4],[3],[3],[3],[1],                //18
        [4],[4],[3],[3],[3],[2],                //19
        [4],[4],[3],[3],[3],[2],                //20
        [5],[4],[3],[3],[3],[2],[1],            //21
        [5],[4],[3],[3],[3],[2],[1],[1]         //22
        [5],[4],[3],[3],[3],[2],[1],[1]         //23
        [5],[4],[3],[3],[3],[2],[1],[1]         //24
        [5],[4],[3],[3],[3],[2],[1],[1]         //25
        [5],[4],[3],[3],[3],[2],[1],[1]         //26
        [5],[4],[3],[3],[3],[2],[1],[1]         //27
        [5],[4],[3],[3],[3],[2],[1],[1]         //28
        [5],[4],[3],[3],[3],[2],[1],[1]         //29
        [5],[4],[3],[3],[3],[2],[1],[1]         //30
       //0   1   2   3   4   5   6   7   8   9
    ]
}

const armorTypeLight = 1;
const armorTypeMedium = 2;
const armorTypeHeavy = 3;
const armorTypes = {
    padded: {
        ac: 11,
        type: armorTypeLight
    },
    leather: {
        ac: 11,
        type: armorTypeLight
    },
    studdedLeather: {
        ac: 12,
        name: 'Studded Leather',
        type: armorTypeLight
    },
    chainShirt: {
        ac: 13,
        name: 'Chain Shirt',
        type: armorTypeMedium
    },
    scaleMail: {
        ac: 14,
        name: 'Scale Mail',
        type: armorTypeMedium
    },
    breastplate: {
        ac: 14,
        type: armorTypeMedium
    },
    halfPlate: {
        ac: 15,
        name: 'Half Plate',
        type: armorTypeMedium
    },
    ringMail: {
        ac: 14,
        name: 'Ring Mail',
        type: armorTypeHeavy
    },
    chainMail: {
        ac: 16,
        name: 'Chain Mail',
        type: armorTypeHeavy
    },
    split: {
        ac: 17,
        type: armorTypeHeavy
    },
    plate: {
        ac: 18,
        type: armorTypeHeavy
    },
}

//TODO: Add remaining weapons
const weaponTypes = {
    quarterstaff : {
        damageDice: 1,
        damageDieSize: 6,
        damageType: damageTypeBludgeoning,
        reach: 5
    }
}