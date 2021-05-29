//Sizes
const sizeTiny = 1;
const sizeSmall = 2;
const sizeMedium = 3;
const sizeLarge = 4;
const sizeHuge = 5;
const sizeGargantuan = 6;

const monsterList = {
    wolf: {
        slug: "Wolf",
        traits: [
            "keen-hearing-smell",
            "pack-tactics",
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
            .25: {
                naturalArmor: 1,
                speed: 40,
                size: sizeMedium,
                str: 12,
                dex: 15,
                con: 12,
                wis: 12,
                cha: 6
            },
            1 : {
                naturalArmor: 2,
                speed: 50,
                size: sizeLarge,
                str: 17,
                dex: 15,
                con: 15,
                wis: 12,
                cha: 7
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
        ac: 12, 
        str: 5,
        dex: 12,
        con: 10,
        int: 7,
        wis: 10,
        cha: 5,
        size: sizeSmall - .5 //Low end of small
    },
    .125 : {
        ac: 13, 
        str: 9,
        dex: 12,
        con: 10,
        int: 7,
        wis: 10,
        cha: 6,
        size: sizeSmall
    },
    .25 : {
        ac: 13, 
        str: 10,
        dex: 12,
        con: 10,
        int: 8,
        wis: 10,
        cha: 6,
        size: sizeMedium - .5 //Low end of medium
    },
    .5 : {
        ac: 13, 
        str: 11,
        dex: 12,
        con: 11,
        int: 8,
        wis: 10,
        cha: 7,
        size: sizeMedium - .4
    },
    1 : {
        ac: 13, 
        str: 13,
        dex: 12,
        con: 13,
        int: 8,
        wis: 10,
        cha: 8,
        size: sizeMedium - .25
    },
    2 : {
        ac: 13, 
        str: 14,
        dex: 12,
        con: 14,
        int: 8,
        wis: 11,
        cha: 8,
        size: sizeMedium
    },
    3 : {
        ac: 13, 
        str: 14,
        dex: 13,
        con: 14,
        int: 9,
        wis: 11,
        cha: 9,
        size: sizeMedium + .25
    },
    4 : {
        ac: 14, 
        str: 15,
        dex: 13,
        con: 15,
        int: 9,
        wis: 11,
        cha: 9,
        size: sizeMedium + .4 //High end of medium
    },
    5 : {
        ac: 15, 
        str: 16,
        dex: 13,
        con: 16,
        int: 9,
        wis: 11,
        cha: 9,
        size: sizeLarge - .5 //Low end of large
    },
    6 : {
        ac: 15, 
        str: 16,
        dex: 13,
        con: 16,
        int: 10,
        wis: 12,
        cha: 10,
        size: sizeLarge - .4
    },
    7 : {
        ac: 15, 
        str: 17,
        dex: 13,
        con: 16,
        int: 10,
        wis: 12,
        cha: 11,
        size: sizeLarge - .3
    },
    8 : {
        ac: 16, 
        str: 17,
        dex: 13,
        con: 16,
        int: 10,
        wis: 13,
        cha: 12,
        size: sizeLarge - .25
    },
    9 : {
        ac: 16, 
        str: 17,
        dex: 13,
        con: 17,
        int: 11,
        wis: 13,
        cha: 12,
        size: sizeLarge - .15
    },
    10 : {
        ac: 17, 
        str: 18,
        dex: 14,
        con: 18,
        int: 11,
        wis: 14,
        cha: 13,
        size: sizeLarge
    },
    11 : {
        ac: 17, 
        str: 18,
        dex: 14,
        con: 18,
        int: 11,
        wis: 14,
        cha: 14,
        size: sizeLarge + .1
    },
    12 : {
        ac: 17, 
        str: 18,
        dex: 14,
        con: 19,
        int: 12,
        wis: 14,
        cha: 15,
        size: sizeLarge + .2
    },
    13 : {
        ac: 18, 
        str: 19,
        dex: 14,
        con: 19,
        int: 12,
        wis: 14,
        cha: 15,
        size: sizeLarge + .3
    },
    14 : {
        ac: 18, 
        str: 19,
        dex: 14,
        con: 19,
        int: 13,
        wis: 15,
        cha: 15,
        size: sizeHuge - .5
    },
    15 : {
        ac: 18, 
        str: 20,
        dex: 14,
        con: 19,
        int: 13,
        wis: 15,
        cha: 16,
        size: sizeHuge - .4
    },
    16 : {
        ac: 18, 
        str: 21,
        dex: 14,
        con: 20,
        int: 13,
        wis: 16,
        cha: 17,
        size: sizeHuge - .3
    },
    17 : {
        ac: 19, 
        str: 21,
        dex: 14,
        con: 20,
        int: 14,
        wis: 16,
        cha: 18,
        size: sizeHuge - .2
    },
    18 : {
        ac: 19, 
        str: 22,
        dex: 14,
        con: 20,
        int: 14,
        wis: 17,
        cha: 19,
        size: sizeHuge
    },
    19 : {
        ac: 19, 
        str: 23,
        dex: 14,
        con: 21,
        int: 15,
        wis: 18,
        cha: 20,
        size: sizeHuge + .1
    },
    20 : {
        ac: 19, 
        str: 24,
        dex: 15,
        con: 22,
        int: 15,
        wis: 18,
        cha: 20,
        size: sizeHuge + .2
    },
    21 : {
        ac: 19, 
        str: 25,
        dex: 15,
        con: 23,
        int: 16,
        wis: 19,
        cha: 21,
        size: sizeHuge + .3
    },
    22 : {
        ac: 19, 
        str: 26,
        dex: 15,
        con: 24,
        int: 17,
        wis: 19,
        cha: 21,
        size: sizeHuge + .4
    },
    23 : {
        ac: 19,
        str: 27,
        dex: 15,
        con: 25,
        int: 18,
        wis: 20,
        cha: 22,
        size: sizeGargantuan - .2
    },
    24 : {
        ac: 19,
        str: 27,
        dex: 15,
        con: 25,
        int: 18,
        wis: 20,
        cha: 23,
        size: sizeGargantuan
    },
    25 : {
        ac: 19,
        str: 28,
        dex: 15,
        con: 26,
        int: 19,
        wis: 20,
        cha: 24,
        size: sizeGargantuan
    },
    26 : {
        ac: 19,
        str: 28,
        dex: 15,
        con: 26,
        int: 20,
        wis: 21,
        cha: 25,
        size: sizeGargantuan
    },
    27 : {
        ac: 19, 
        str: 29,
        dex: 15,
        con: 27,
        int: 21,
        wis: 21,
        cha: 26,
        size: sizeGargantuan
    },
    28 : {
        ac: 19, 
        str: 29,
        dex: 15,
        con: 28,
        int: 22,
        wis: 21,
        cha: 27,
        size: sizeGargantuan
    },
    29 : {
        ac: 19, 
        str: 30,
        dex: 15,
        con: 29,
        int: 23,
        wis: 22,
        cha: 28,
        size: sizeGargantuan
    },
    30 : {
        ac: 19,
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
    
]