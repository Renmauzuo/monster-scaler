

$(function () {

    for (let monster in monsterList) {
        $('<option value='+monster+'>'+monsterList[monster].slug+'</option>').appendTo('#monster-select');
    }

    $('#monster-select, #cr-select').on('change', function () {
        calculateSelectedMonster();
    });

    calculateSelectedMonster();

});

/**
 * Scales mosnter stats based on the selected template and challenge rating.
 */
function calculateSelectedMonster() {
    let selectedMonster = monsterList[$('#monster-select').val()];
    let targetCR = $('#cr-select').val();

    //Start with locked stats and presets for this CR, if any
    let derivedStats = selectedMonster.lockedStats ? Object.assign({}, selectedMonster.lockedStats, selectedMonster.stats[targetCR]) : {};

    //Once we have our locked stats, go through the rest of the states to interpolate or extrapolate based on existing values.
    //All of the preset monster statblocks should be complete, but if we ever add "keyframes" for individual stats it may be possible to have CRs without all stats for a template
    //For this reason we do the interpolation for EACH stat individually, rather than finding the closest statblock to draw from

    if(!derivedStats.size) {
        let sizeBenchmarks = findBenchmarksForStat("size", targetCR, selectedMonster);
        derivedStats.size = extrapolateFromBenchmark("size", targetCR, sizeBenchmarks, true);
        derivedStats.size = Math.min(6, derivedStats.size);
    }

    let abilityScores = ["str", "con", "dex", "int", "wis", "cha"];
    derivedStats.abilityModifiers = {};
    for (let i = 0; i < abilityScores.length; i++) {
        if (!derivedStats[abilityScores[i]]) {
            let abilityBenchmarks = findBenchmarksForStat(abilityScores[i], targetCR, selectedMonster);
            derivedStats[abilityScores[i]] = extrapolateFromBenchmark(abilityScores[i], targetCR, abilityBenchmarks, false);
        }
        derivedStats.abilityModifiers[abilityScores[i]] = abilityScoreModifier(derivedStats[abilityScores[i]]);
    }

    if (!derivedStats.naturalArmor) {
        /* 
         * CR is more concerned with dervid stats like total AC than source stats like natural armor bonus
         * So instead of extrapolating natural armor on its own we extrapolate total AC then reverse engineer natural armor based on other AC mods
         * This also solves the problem of average natural armor by CR being hard to calcualte, since many creatures don't have natural armor.
         */
        let acBenchmarks = findBenchmarksForStat(["naturalArmor", "dex"], targetCR, selectedMonster);
        //Creature may not have natural armor at all, in which case we skip this step
        if (acBenchmarks) {
            for (let benchmark in acBenchmarks) {
                //5e is sometimes vague about monster stat calculations, so for simplicity we assume all natural armor allows the full dex modifier
                acBenchmarks[benchmark].ac = 10 + acBenchmarks[benchmark].naturalArmor + abilityScoreModifier(acBenchmarks[benchmark].dex);
            }
            let targetAC = extrapolateFromBenchmark('ac', targetCR, acBenchmarks, false);
            //The max check shouldn't really be necessary, but we don't want to risk a creature with abnormally high dex resulting in a negative natural armor rating
            derivedStats.naturalArmor = Math.max(0, targetAC - 10 - derivedStats.abilityModifiers.dex);
        }
    }

    if (!derivedStats.hitDice) {
        //Like AC bonuses, we calculate hit dice by extrapolating a target HP number and working backwards rather than extrapolating hit dice directly
        let hpBenchmarks = findBenchmarksForStat(["size", "con", "hitDice"], targetCR, selectedMonster);
        for (let benchmark in hpBenchmarks) {
            let currentBenchmark = hpBenchmarks[benchmark];
            currentBenchmark.hp = Math.floor(hitPointsPerHitDie(currentBenchmark) * currentBenchmark.hitDice);
        }
        let targetHP = extrapolateFromBenchmark('hp', targetCR, hpBenchmarks, false);
        let hpPerHD = hitPointsPerHitDie(derivedStats);
        derivedStats.hitDice = Math.max(1, Math.round(targetHP / hpPerHD));
    }

    //console.log(JSON.stringify(derivedStats));

    //Once we have all the stats populate the statblock:
    $('#monster-name').html(findNearestLowerBenchmark("name", targetCR, selectedMonster));
    $('#monster-type').html(sizes[derivedStats.size].name + ' ' + selectedMonster.type + ', ' + selectedMonster.alignment);

    //TODO: Pick the appropriate AC formula if a creature has options (ie, natural armor vs worn armor)
    if (derivedStats.naturalArmor) {
        $('#armor-class span').html((10 + derivedStats.naturalArmor + derivedStats.abilityModifiers.dex) + ' (Natural Armor)');
    } else {
        $('#armor-class span').html(10 + derivedStats.abilityModifiers.dex);
    }
    $('#hit-points span').html(Math.floor(hitPointsPerHitDie(derivedStats)*derivedStats.hitDice)+' ('+derivedStats.hitDice+'d'+sizes[derivedStats.size].hitDie+'+'+(derivedStats.abilityModifiers.con*derivedStats.hitDice)+')');
    $('#speed span').html(findNearestLowerBenchmark('speed', targetCR, selectedMonster) + ' ft.');

    for (let i = 0; i < abilityScores.length; i++) {
        let abilityScore = abilityScores[i];
        let modifier = abilityScoreModifier(derivedStats[abilityScore]);
        let modifierString = "(" + (modifier >= 0 ? '+' : '') + modifier + ")";
       $('#monster-'+abilityScore).html(derivedStats[abilityScore] + " " + modifierString);
    }
}

/**
 * Converts challenge rating to a "step" so that fractional CRs carry the same weight in scaling as full number CRs.
 *
 * @param {string} cr The challenge rating to convert to a step.
 * @return {number} The relative step for the challenge rating.
 */
function stepForCR(cr) {
    //Fractional CRs are counted as a full step in calculations, ie going from CR 1/8 to 1/4 carries as much weight as going from CR 1 to 2.
    let safeCR = parseFloat(cr);
    switch(safeCR) {
        case 0:
            return 0;
        case 0.125:
            return 1;
        case 0.25:
            return 2;
        case 0.5: 
            return 3;
        default:
            return safeCR+3;
    }
}

/**
 * Finds the closest statblocks above and below the target CR that have the target stat
 *
 * @param {Array} stats The stats to search for
 * @param {string} targetCR The challenge rating to find benchmarks for
 * @param {Object} selectedMonster The monster template for which to find stat benchmarks
 * @return {Object} Benchmarks for the selected stat at the nearest CRs above and below it that had values for that stat.
 */
function findBenchmarksForStat(stats, targetCR, selectedMonster) {
    let statList = Array.isArray(stats) ? stats : [stats];
    let benchmarks = null;
    for (let cr in selectedMonster.stats) {
        let statBlock = selectedMonster.stats[cr];
        let allStatsFound = true;
        for (let i = 0; i < statList.length; i++) {
            allStatsFound = allStatsFound && statBlock[statList[i]];
        }
        if (allStatsFound) {
            if (!benchmarks) {
                benchmarks = {};
            }
            if (cr > targetCR) {
                if (!benchmarks.upper || benchmarks.upper.cr > cr) {
                    benchmarks.upper = {
                        cr: cr,
                    }
                    for (let i = 0; i < statList.length; i++) {
                        benchmarks.upper[statList[i]] = statBlock[statList[i]];
                    }
                }
            } else {
                if (!benchmarks.lower || benchmarks.lower.cr < cr) {
                    benchmarks.lower = {
                        cr: cr,
                    }
                    for (let i = 0; i < statList.length; i++) {
                        benchmarks.lower[statList[i]] = statBlock[statList[i]];
                    }
                }
            }
        }
    }
    return benchmarks;
}

/**
 * Finds the closest statblocks above and below the target CR that have the target stat
 *
 * @param {string} stat The stat to extrapolate
 * @param {string} targetCR The challenge rating to find benchmarks for
 * @param {Object} benchmarks The upper and/or lower benchmarks to extrapolate from
 * @param {boolean} linearExtrapolation If true the extrapolation will be an offset instead of a ratio.
 *  For example, a template with a value of 5 when the average stat is 4 would result in an offset of +1 instead of a multiplier of *1.2.
 * @return {Number} The extrapolated value
 */
function extrapolateFromBenchmark(stat, targetCR, benchmarks, linearExtrapolation) {
    //If a benchmark was only found in one direction we simply use that benchmark to extrapolate a state for the target CR
    //If benchmarks were found above and below, we calculate the target result for BOTH benchmarks, then take a weighted average based on which is closer
    //So if the upper benchmark is 1 step away, and the lower benchmark is 4 steps away, then the upper will count for 80% of the average
    let upperValue, lowerValue;
    if (benchmarks.upper) {
        if (linearExtrapolation) {
            let offset = benchmarks.upper[stat] - averageStats[benchmarks.upper.cr][stat];
            upperValue = offset + averageStats[targetCR][stat];
        } else {
            let ratio = benchmarks.upper[stat] / averageStats[benchmarks.upper.cr][stat];
            upperValue = ratio * averageStats[targetCR][stat];
        }
    }
    if (benchmarks.lower) {
        if (linearExtrapolation) {
            let offset = benchmarks.lower[stat] - averageStats[benchmarks.lower.cr][stat];
            lowerValue = offset + averageStats[targetCR][stat];
        } else {
            let ratio = benchmarks.lower[stat] / averageStats[benchmarks.lower.cr][stat];
            lowerValue = ratio * averageStats[targetCR][stat];
        }
    }

    if (lowerValue) {
        if (upperValue) {
            //If upper and lower take a weighted average
            let upperStep = stepForCR(benchmarks.upper.cr);
            let lowerStep = stepForCR(benchmarks.lower.cr);
            let stepRange = upperStep - lowerStep;
            let targetStep = stepForCR(targetCR);
            let upperWeight = (upperStep - targetStep) / stepRange;
            let lowerWeight = (targetStep - lowerStep) / stepRange;
            return Math.round(upperWeight * upperValue + lowerWeight * lowerValue);
        }
        return Math.round(lowerValue);
    }
    return Math.round(upperValue);
}

/**
 * Calculates the modifier for an ability score
 *
 * @param {string} ability The ability score value
 * @return {number} The ability score modifier
 */
 function abilityScoreModifier(ability) {
    return Math.floor((ability - 10) / 2);
}

/**
 * Calculates the hit dice per hit die for a creature
 *
 * @param {Object} statblock The statblock. Must have size and con
 * @return {number} The number of hit points
 */
 function hitPointsPerHitDie(statblock) {
    return ((sizes[statblock.size].hitDie + 1) / 2) + abilityScoreModifier(statblock.con);
}

/**
 * Finds the closest benchmark that is below the target CR. If there are none then it returns the lowest benchmark.
 *
 * @param {string} stat The stat to search for
 * @param {string} targetCR The target challenge rating
 * @param {Object} selectedMonster The monster to search 
 * @return {number} The number of hit points
 */
 function findNearestLowerBenchmark(stat, targetCR, selectedMonster) {
    let numTargetCR = parseFloat(targetCR);
    let statList = selectedMonster.stats;
    let lowestValue;
    let lowestCR = 31;
    let highestValue;
    let highestCR = 0;
    for (let cr in statList) {
        let numCR = parseFloat(cr);
        if (statList[cr][stat]) {
            if (numCR < lowestCR) {
                lowestCR = cr;
                lowestValue = statList[cr][stat];
            }
            if (numCR > highestCR && numCR <= numTargetCR) {
                highestValue = statList[cr][stat];
                highestCR = cr;
            }
        }
    }
    return highestValue != null ? highestValue : lowestValue;
}