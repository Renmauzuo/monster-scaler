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
            dex: 15,
            int: 3,
            wis: 12,
        },
        stats: {
            .25: {
                naturalArmor: 1,
                speed: 40,
                size: sizeMedium,
                str: 12,
                con: 12,
                cha: 6
            },
            1 : {
                naturalArmor: 2,
                speed: 50,
                size: sizeLarge,
                str: 17,
                con: 15,
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

const averageStats = {
    0 : {
        ac: 11, 
        str: 5,
        size: sizeSmall - .5 //Low end of small
    },
    .125 : {
        ac: 12, 
        str: 9,
        size: sizeSmall
    },
    .25 : {
        ac: 12, 
        str: 10,
        size: sizeMedium - .5 //Low end of medium
    },
    .5 : {
        ac: 12, 
        str: 11,
        size: sizeMedium - .4
    },
    1 : {
        ac: 13, 
        str: 13,
        size: sizeMedium - .25
    },
    2 : {
        ac: 13, 
        str: 14,
        size: sizeMedium
    },
    3 : {
        ac: 14, 
        str: 14,
        size: sizeMedium + .25
    },
    4 : {
        ac: 14, 
        str: 15,
        size: sizeMedium + .4 //High end of medium
    },
    5 : {
        ac: 14, 
        str: 16,
        size: sizeLarge - .5 //Low end of large
    },
    6 : {
        ac: 15, 
        str: 16,
        size: sizeLarge - .4
    },
    7 : {
        ac: 15, 
        str: 17,
        size: sizeLarge - .3
    },
    8 : {
        ac: 15, 
        str: 17,
        size: sizeLarge - .25
    },
    9 : {
        ac: 15, 
        str: 17,
        size: sizeLarge - .15
    },
    10 : {
        ac: 16, 
        str: 18,
        size: sizeLarge
    },
    11 : {
        ac: 16, 
        str: 18,
        size: sizeLarge + .1
    },
    12 : {
        ac: 16, 
        str: 18,
        size: sizeLarge + .2
    },
    13 : {
        ac: 17, 
        str: 19,
        size: sizeLarge + .3
    },
    14 : {
        ac: 17, 
        str: 19,
        size: sizeHuge - .5
    },
    15 : {
        ac: 18, 
        str: 20,
        size: sizeHuge - .4
    },
    16 : {
        ac: 18, 
        str: 21,
        size: sizeHuge - .3
    },
    17 : {
        ac: 19, 
        str: 21,
        size: sizeHuge - .2
    },
    18 : {
        ac: 19, 
        str: 22,
        size: sizeHuge
    },
    19 : {
        ac: 19, 
        str: 23,
        size: sizeHuge + .1
    },
    20 : {
        ac: 19, 
        str: 24,
        size: sizeHuge + .2
    },
    21 : {
        ac: 20, 
        str: 25,
        size: sizeHuge + .3
    },
    22 : {
        ac: 20, 
        str: 26,
        size: sizeHuge + .4
    },
    23 : {
        ac: 20, 
        str: 27,
        size: sizeGargantuan - .2
    },
    24 : {
        ac: 21, 
        str: 27,
        size: sizeGargantuan
    },
    25 : {
        ac: 22, 
        str: 28,
        size: sizeGargantuan
    },
    26 : {
        ac: 22, 
        str: 28,
        size: sizeGargantuan
    },
    27 : {
        ac: 23, 
        str: 29,
        size: sizeGargantuan
    },
    28 : {
        ac: 23, 
        str: 29,
        size: sizeGargantuan
    },
    29 : {
        ac: 24, 
        str: 30,
        size: sizeGargantuan
    },
    30 : {
        ac: 25, 
        str: 30,
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