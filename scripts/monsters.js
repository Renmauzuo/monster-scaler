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
            abilityScores: {
                dex: 15,
                int: 3,
                wis: 12,
            }
        },
        stats: {
            .25: {
                naturalArmor: 1,
                speed: 40,
                size: sizeMedium,
                abilityScores: {
                    str: 12,
                    con: 12,
                    cha: 6
                }
            },
            1 : {
                naturalArmor: 2,
                speed: 50,
                size: sizeLarge,
                abilityScores: {
                    str: 17,
                    con: 15,
                    cha: 7
                }
            }
        }
    }
}

//These are rough averages of different stats per CR
//These are not used to populate monster stats directly, but are used to compare stats to maintain relative values at different CRs
//For example, a creature with above average strength for its CR will continue to have above average strength at other CRs

//TODO: Consider adding different averages by type.
//Note on sizes: Average sizes were determined by average size of monsters in various rulebooks by CR. However, outliers sometimes skewed results for certain CRs, especially at high levels when there are very few monsters at each CR, so many of these vlaues have been "fudged" to create a smoother upward transition.


const averageStats = {
    0 : {
        size: sizeSmall - .5 //Low end of small
    },
    .125 : {
        size: sizeSmall
    },
    .25 : {
        size: sizeMedium - .5 //Low end of medium
    },
    .5 : {
        size: sizeMedium - .4
    },
    1 : {
        size: sizeMedium - .25
    },
    2 : {
        size: sizeMedium
    },
    3 : {
        size: sizeMedium + .25
    },
    4 : {
        size: sizeMedium + .4 //High end of medium
    },
    5 : {
        size: sizeLarge - .5 //Low end of large
    },
    6 : {
        size: sizeLarge - .4
    },
    7 : {
        size: sizeLarge - .3
    },
    8 : {
        size: sizeLarge - .25
    },
    9 : {
        size: sizeLarge - .15
    },
    10 : {
        size: sizeLarge
    },
    11 : {
        size: sizeLarge + .1
    },
    12 : {
        size: sizeLarge + .2
    },
    13 : {
        size: sizeLarge + .3
    },
    14 : {
        size: sizeHuge - .5
    },
    15 : {
        size: sizeHuge - .4
    },
    16 : {
        size: sizeHuge - .3
    },
    17 : {
        size: sizeHuge - .2
    },
    18 : {
        size: sizeHuge
    },
    19 : {
        size: sizeHuge + .1
    },
    20 : {
        size: sizeHuge + .2
    },
    21 : {
        size: sizeHuge + .3
    },
    22 : {
        size: sizeHuge + .4
    },
    23 : {
        size: sizeGargantuan - .2
    },
    24 : {
        size: sizeGargantuan
    },
    25 : {
        size: sizeGargantuan
    },
    26 : {
        size: sizeGargantuan
    },
    27 : {
        size: sizeGargantuan
    },
    28 : {
        size: sizeGargantuan
    },
    29 : {
        size: sizeGargantuan
    },
    30 : {
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