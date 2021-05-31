//Sizes
const sizeTiny = 1;
const sizeSmall = 2;
const sizeMedium = 3;
const sizeLarge = 4;
const sizeHuge = 5;
const sizeGargantuan = 6;

const monsterList = {
    wolf: {
        slug: "wolf",
        traits: [
            "keenHearingSmell",
            "packTactics",
        ],
        skills: [
            "perception",
            "stealth",
        ],
        actions: [
            "bite"
        ],
        type: "beast",
        alignment: "unaligned",
        lockedStats: {
            int: 3,
        },
        stats: {
            0 : {
                name: "Wolf Pup"
            },
            .25: {
                name: "Wolf",
                naturalArmor: 1,
                hitDice: 2,
                speed: 40,
                size: sizeMedium,
                str: 12,
                dex: 15,
                con: 12,
                wis: 12,
                cha: 6
            },
            1 : {
                name: "Dire Wolf",
                naturalArmor: 2,
                hitDice: 5,
                speed: 50,
                size: sizeLarge,
                str: 17,
                dex: 15,
                con: 15,
                wis: 12,
                cha: 7
            },
            20 : {
                name: "Legendary Wolf"
            }
        }
    }
}

//These are rough averages of different stats per CR
//These are not used to populate monster stats directly, but are used to compare stats to maintain relative values at different CRs
//For example, a creature with above average strength for its CR will continue to have above average strength at other CRs

//TODO: Consider adding different averages by type.
//Most of these stats were determined by average size of monsters in various rulebooks by CR. However, outliers sometimes skewed results for certain CRs, especially at high levels when there are very few monsters at each CR, so many of these vlaues have been "fudged" to create a smoother upward transition.
//Decimal values are to ease the curve a bit, even though all final values will be rounded.
//Beasts were excluded from average INT calculates, as their INT tends to be capped at 3, regardless of CR.

const averageStats = {
    0 : {
        proficiency: 2,
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
        hitDie: 4
    },
    {
        name: 'Small',
        hitDie: 6
    },
    {
        name: 'Medium',
        hitDie: 8
    },
    {
        name: 'Large',
        hitDie: 10
    },
    {
        name: 'Huge',
        hitDie: 12
    },
    {
        name: 'Gargantuan',
        hitDie: 20
    }
    
];

const skills = {
    perception : 'wis',
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
    }
}