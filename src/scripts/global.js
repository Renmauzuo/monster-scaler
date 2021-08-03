var numberStrings = ['zero', 'one', 'two', 'three', 'four', 'five'];

$(function () {

    for (let monster in monsterList) {
        $('<option value='+monster+'>'+(monsterList[monster].menuName || toSentenceCase(monster))+'</option>').appendTo('#monster-select');
    }

    if (location.search.length) {
        let params = new URLSearchParams(location.search);
        let paramMonster = params.get('monster');
        let paramsCR = params.get('cr');
        let paramsVariant = params.get('variant');
        //Ensure it's a valid monster before selecting
        if ($('#monster-select option[value="'+paramMonster+'"]').length) {
            $('#monster-select').val(paramMonster);
        }
        //Ensure it's a valid cr before selecting
        if ($('#cr-select option[value="'+paramsCR+'"]').length) {
            $('#cr-select').val(paramsCR);
        }

        //Need to do this after mosnter is selected, but before variant is selected
        setupVariantSelect(false);

        //Select the variant if it has one
        if ($('#variant-select option[value="'+paramsVariant+'"]').length) {
            $('#variant-select').val(paramsVariant);
        }
    }

    $('#monster-select, #cr-select, #variant-select').on('change', function () {
        if ($(this).attr('id') === "monster-select") {
           setupVariantSelect(true);
        }
        calculateSelectedMonster();
    });

    calculateSelectedMonster();

});

/**
 * Shows or hides the variant dropdown based on the current monster, and populates it with any variant options.
 *
 * @param {boolean} animated Whether or not to animate the show/hide
 * @return {string} The sentence case string
 */
function setupVariantSelect(animated) {
    let animationDuration = animated ? 400 : 0;
    let monsterID = $('#monster-select').val();
    let selectedMonster = monsterList[monsterID];
    if (selectedMonster.variants) {
        $('#variant-select').empty();
        for (let variant in selectedMonster.variants) {
            $('<option value='+variant+'>'+selectedMonster.variants[variant].name+'</option>').appendTo('#variant-select');
        }
        $('#variant-wrapper').slideDown(animationDuration);
    } else {
        $('#variant-wrapper').slideUp(animationDuration);
    }
}

/**
 * Scales monster stats based on the selected template and challenge rating.
 */
function calculateSelectedMonster() {
    let monsterID = $('#monster-select').val();
    let selectedMonster = monsterList[monsterID];
    let targetCR = $('#cr-select').val();
    let numTargetCR = Number(targetCR); //Certain comparisons require a numeric version of the CR
    let selectedVariant;
    if (selectedMonster.variants) {
        selectedVariant = selectedMonster.variants[$('#variant-select').val()];
    }

    let directLink = location.toString().replace(location.search, "");
    directLink += '?monster='+monsterID+'&cr='+targetCR;
    if (selectedVariant) {
        directLink += '&variant='+$('#variant-select').val();
    }
    $('#direct-link').attr('href', directLink);

    //Need to combine variant stats with base stats, if applicable
    let sourceStats = Object.assign({}, selectedMonster.stats);
    if (selectedVariant && selectedVariant.stats) {
        for (let cr in selectedVariant.stats) {
            if (sourceStats[cr]) {
                sourceStats[cr] = Object.assign({}, sourceStats[cr], selectedVariant.stats[cr]);
            } else {
                sourceStats[cr] = selectedVariant.stats[cr];
            }
        }
    }

    //Start with locked stats and presets for this CR, if any
    let derivedStats = Object.assign({}, selectedMonster.lockedStats, sourceStats[targetCR]);
    if (selectedVariant && selectedVariant.lockedStats) {
        Object.assign(derivedStats, selectedVariant.lockedStats);
    }
    derivedStats.proficiency = averageStats[targetCR].proficiency;
    //Once we have our locked stats, go through the rest of the states to interpolate or extrapolate based on existing values.
    //All of the preset monster statblocks should be complete, but if we ever add "keyframes" for individual stats it may be possible to have CRs without all stats for a template
    //For this reason we do the interpolation for EACH stat individually, rather than finding the closest statblock to draw from

    if(!derivedStats.slug) {
        derivedStats.slug = findNearestLowerBenchmark("slug", targetCR, sourceStats);
    }

    //Traits require a different approach from some other stats as we take a base from the trait library, but potentially apply modifiers to it based on creature stats.
    //TODO: Adjust for creatures that gain additional traits as they level up
    if (selectedMonster.traits) {
        derivedStats.traits = {};
        let traitList;
        if (selectedVariant && selectedVariant.traits) {
            traitList = selectedMonster.traits.concat(selectedVariant.traits); 
        } else {
            traitList = selectedMonster.traits;
        }
        for (let i = 0; i < traitList.length; i++) {
            const traitName =traitList[i];
            const baseTrait = traits[traitName];
            let newTrait;
            derivedStats.traits[traitName] = newTrait = {};
            newTrait.name = baseTrait.name;
            newTrait.description = baseTrait.description;
            if (sourceStats[targetCR] && sourceStats[targetCR].traits && sourceStats[targetCR].traits[traitName]) {
                newTrait = Object.assign(newTrait, sourceStats[targetCR].traits[traitName]);
            }

            if (baseTrait.allowsSave) {
                newTrait.dcStat = baseTrait.dcStat;
                if (!newTrait.hasOwnProperty("dcAdjustment")) {
                    let dcAdjustmentString = "traits__"+traitName+"__dcAdjustment";
                    let dcAdjustmentBenchmarks = findBenchmarksForStat(dcAdjustmentString, targetCR, sourceStats);
                    if (dcAdjustmentBenchmarks) {
                        if (dcAdjustmentBenchmarks.upper) {
                            if (dcAdjustmentBenchmarks.lower) {
                                newTrait.dcAdjustment = calculateWeightedAverage(dcAdjustmentString, dcAdjustmentBenchmarks, targetCR);
                            } else {
                                newTrait.dcAdjustment = dcAdjustmentBenchmarks.upper[dcAdjustmentString];
                            }
                        } else if (dcAdjustmentBenchmarks.lower) {
                            newTrait.dcAdjustment = dcAdjustmentBenchmarks.lower[dcAdjustmentString];
                        }
                    } else {
                        newTrait.dcAdjustment = 0;
                    }
                }
            }

            if (baseTrait.hasDuration) {
                if (!newTrait.hasOwnProperty("duration")) {
                    let durationString = "traits__"+traitName+"__duration";
                    newTrait.duration = findNearestLowerBenchmark(durationString, targetCR, sourceStats);
                }
            }
        }
    }

    if(!derivedStats.size) {
        let sizeBenchmarks = findBenchmarksForStat("size", targetCR, sourceStats);
        derivedStats.size = extrapolateFromBenchmark("size", targetCR, sizeBenchmarks, true);
        derivedStats.size = Math.min(6, derivedStats.size);
    }

    let abilityScores = ["str", "con", "dex", "int", "wis", "cha"];
    derivedStats.abilityModifiers = {};
    for (let i = 0; i < abilityScores.length; i++) {
        if (!derivedStats[abilityScores[i]]) {
            let abilityBenchmarks = findBenchmarksForStat(abilityScores[i], targetCR, sourceStats);
            derivedStats[abilityScores[i]] = extrapolateFromBenchmark(abilityScores[i], targetCR, abilityBenchmarks, false);
        }
        derivedStats.abilityModifiers[abilityScores[i]] = abilityScoreModifier(derivedStats[abilityScores[i]]);
    }

    if (!derivedStats.bonusArmor) {
        /* 
         * CR is more concerned with derived stats like total AC than source stats like armor bonus
         * So instead of extrapolating the armor bonus on its own we extrapolate total AC then reverse engineer armor bonus based on other AC mods
         * This also solves the problem of average natural armor by CR being hard to calculate, since many creatures don't have natural armor.
         */
        let acBenchmarks = findBenchmarksForStat(["bonusArmor", "dex"], targetCR, sourceStats);
        //Creature may not have bonus armor at all, in which case we skip this step
        if (acBenchmarks) {
            for (let benchmark in acBenchmarks) {
                //5e is sometimes vague about monster stat calculations, so for simplicity we assume all bonus armor allows the full dex modifier
                acBenchmarks[benchmark].ac = 10 + acBenchmarks[benchmark].bonusArmor + abilityScoreModifier(acBenchmarks[benchmark].dex);
            }
            let targetAC = extrapolateFromBenchmark('ac', targetCR, acBenchmarks, false);
            //The max check shouldn't really be necessary, but we don't want to risk a creature with abnormally high dex resulting in a negative bonus armor rating
            derivedStats.bonusArmor = Math.max(0, targetAC - 10 - derivedStats.abilityModifiers.dex);
        }
    }

    if (!derivedStats.hitDice) {
        //Like AC bonuses, we calculate hit dice by extrapolating a target HP number and working backwards rather than extrapolating hit dice directly
        let hpBenchmarks = findBenchmarksForStat(["size", "con", "hitDice"], targetCR, sourceStats);
        for (let benchmark in hpBenchmarks) {
            let currentBenchmark = hpBenchmarks[benchmark];
            currentBenchmark.hp = Math.floor(hitPointsPerHitDie(currentBenchmark) * currentBenchmark.hitDice);
        }
        let targetHP = extrapolateFromBenchmark('hp', targetCR, hpBenchmarks, false);
        let hpPerHD = hitPointsPerHitDie(derivedStats);
        derivedStats.hitDice = Math.max(1, Math.round(targetHP / hpPerHD));
    }

    //Find all attacks the creature should have at the target CR by adding locked attacks to attacks for all CRs equal to or below target
    derivedStats.attacks = {};
    if (selectedMonster.lockedStats && selectedMonster.lockedStats.attacks) {
        for (let attack in selectedMonster.lockedStats.attacks) {
            derivedStats.attacks[attack] = Object.assign({}, selectedMonster.lockedStats.attacks[attack]);
        }
    }
    for (let cr in sourceStats) {
        if (parseFloat(cr) <= parseFloat(targetCR) && sourceStats[cr].attacks) {
            for (let attack in sourceStats[cr].attacks) {
                if (!derivedStats.attacks[attack]) {
                    //We want to copy the attack except for its damage, as that may need to be adjusted based on CR
                    let attackCopy = Object.assign({}, sourceStats[cr].attacks[attack]);
                    delete attackCopy.damageDice;
                    delete attackCopy.damageDieSize;
                    derivedStats.attacks[attack] = attackCopy;
                }
            }
        }
    }
    for (let attack in derivedStats.attacks) {
        let currentAttack = derivedStats.attacks[attack];
        //Ensure we are using appropriate stats for the target CR, if they are present
        if (sourceStats[targetCR] && sourceStats[targetCR].attacks && sourceStats[targetCR].attacks[attack]) {
            derivedStats.attacks[attack] = Object.assign(derivedStats.attacks[attack], sourceStats[targetCR].attacks[attack]);
        }

        //Fill in the gaps by extrapolating any missing attributes (such as attack damage)
        if (!currentAttack.damageDice) {
            let damageDiceString = 'attacks__'+attack+'__damageDice';
            let damageDieString =  'attacks__'+attack+'__damageDieSize';
            let attributes = ['str', damageDiceString, damageDieString];
            if (currentAttack.finesse) {
                attributes.push('dex');
            }
            let damageBenchmarks = findBenchmarksForStat(attributes, targetCR, sourceStats);
            for (let benchmark in damageBenchmarks) {
                let currentBenchmark = damageBenchmarks[benchmark];
                currentBenchmark.damagePerRound = averageRoll(currentBenchmark[damageDiceString], currentBenchmark[damageDieString]);
                currentBenchmark.damagePerRound +=  abilityScoreModifier(currentAttack.finesse ? Math.max(currentBenchmark.str, currentBenchmark.dex) : currentBenchmark.str);
            }
            let estimatedDamage = extrapolateFromBenchmark('damagePerRound', targetCR, damageBenchmarks, false);
            let targetDamage = estimatedDamage - (currentAttack.finesse ? Math.max(derivedStats.abilityModifiers.str, derivedStats.abilityModifiers.dex) : derivedStats.abilityModifiers.str);
            //console.log(targetDamage);
            let preferredDieSize = findNearestLowerBenchmark(damageDieString, targetCR, sourceStats);
            let estimatedDice = findDamageDice(targetDamage, preferredDieSize);
            currentAttack.damageDice = estimatedDice[0];
            currentAttack.damageDieSize = estimatedDice[1];
        }

        if (currentAttack.ranged && !currentAttack.range) {
            currentAttack.range = findNearestLowerBenchmark('attacks__'+attack+'__range', targetCR, sourceStats);
            currentAttack.longRange = findNearestLowerBenchmark('attacks__'+attack+'__longRange', targetCR, sourceStats);
        }
    }

    if (!derivedStats.multiattack) {
        //See if the creature gains multiattack as it goes up in CR
        for (let cr in sourceStats) {
            let numCR = Number(cr);
            let highestCR = 0;
            if (numCR <= numTargetCR && numCR > highestCR && sourceStats[cr].multiattack) {
                highestCR = numCR;
                derivedStats.multiattack = sourceStats[cr].multiattack;
            }
        }
    }

    //Calculate movement speeds. These won't scale with CR, we just take the stat the stat from the closest lower CR.
    derivedStats.speed = findNearestLowerBenchmark('speed', targetCR, sourceStats);
    derivedStats.swim = findNearestLowerBenchmark('swim', targetCR, sourceStats);

    //Determine what senses the creature should have
    if (!derivedStats.blindsight) {
        derivedStats.blindsight = findNearestLowerBenchmark('blindsight', targetCR, sourceStats);
    }

    //Once we have all the stats populate the statblock:
    $('#monster-name').html(findNearestLowerBenchmark("name", targetCR, sourceStats));
    $('#monster-type').html(sizes[derivedStats.size].name + ' ' + selectedMonster.type + ', ' + selectedMonster.alignment);

    if (derivedStats.bonusArmor) {
        $('#armor-class span').html((10 + derivedStats.bonusArmor + derivedStats.abilityModifiers.dex) + ' ('+derivedStats.armorDescription+')');
    } else {
        $('#armor-class span').html(10 + derivedStats.abilityModifiers.dex);
    }
    $('#hit-points span').html(Math.floor(hitPointsPerHitDie(derivedStats)*derivedStats.hitDice)+' ('+derivedStats.hitDice+'d'+sizes[derivedStats.size].hitDie+'+'+(derivedStats.abilityModifiers.con*derivedStats.hitDice)+')');
    let speedString = "";
    if (derivedStats.speed) {
        speedString = derivedStats.speed + ' ft.';
    }
    if (derivedStats.swim) {
        speedString += (speedString.length ? ', ' : '') + "Swim " + derivedStats.swim + ' ft.';
    }
    $('#speed span').html(speedString);

    for (let i = 0; i < abilityScores.length; i++) {
        let abilityScore = abilityScores[i];
        let modifier = abilityScoreModifier(derivedStats[abilityScore]);
        let modifierString = "(" + (modifier >= 0 ? '+' : '') + modifier + ")";
       $('#monster-'+abilityScore).html(derivedStats[abilityScore] + " " + modifierString);
    }

    //TODO: When we add homebrow monsters we may need to account for creatures that gain new skills as they go up in CR.
    if (derivedStats.skills) {
        $('#skills').show();
        let skillString = "";
        for (let skill in derivedStats.skills) {
            if (skillString.length) {
                skillString += ', ';
            }
            let skillModifier = averageStats[targetCR].proficiency*derivedStats.skills[skill] + derivedStats.abilityModifiers[skills[skill]];
            let modifierString = (skillModifier >= 0 ? '+' : '') + skillModifier;
            skillString+= toSentenceCase(skill) + ' ' + modifierString;
        }
        $('#skills span').html(skillString);
    } else {
        $('#skills').hide();
    }

    //TODO: Add additional senses
    let sensesString = "";
    if (derivedStats.blindsight) {
        sensesString += "blindsight " + derivedStats.blindsight + ' ft., '
    }
    sensesString += 'passive Perception ' + (10 + derivedStats.abilityModifiers.wis + (derivedStats.skills && derivedStats.skills.hasOwnProperty('perception') ? averageStats[targetCR].proficiency : 0));
    $('#senses span').html(sensesString);

    $('#challenge-rating span').html(stringForCR(targetCR) + ' (' + averageStats[targetCR].xp.toLocaleString() + ' XP)');

    $('#traits').empty();
    if (derivedStats.traits) {
        for (let traitName in derivedStats.traits) {
            let currentTrait = derivedStats.traits[traitName];
            $('<p><strong><em>'+currentTrait.name+'.</em></strong> '+replaceTokensInString(currentTrait.description, derivedStats, currentTrait)+'</p>').appendTo('#traits');
        }
    }

    $('#attacks').empty();
    if (derivedStats.multiattack) {
        if (Object.keys(derivedStats.multiattack.attacks).length > 1) {
            //Text reads differently if there are multiple different attack types
            let attackCount = 0;
            let multiattackString = "";
            let attacks = Object.keys(derivedStats.multiattack.attacks);
            for (let i = 0; i < attacks.length; i++) {
                attackCount += derivedStats.multiattack.attacks[attacks[i]];
                multiattackString += numberStrings[derivedStats.multiattack.attacks[attacks[i]]] + ' with its ' + derivedStats.attacks[attacks[i]].name.toLowerCase();
                if (i < attacks.length - 2) {
                    //Separate attacks with commas
                    multiattackString += ', ';
                } else if (i == attacks.length - 2) {
                    //Add "and" before last attack. Add an oxford comma, but only if there are more than two types of attacks.
                    multiattackString += (attacks.length > 2 ? ',' : '') + ' and ';
                }
            }
            multiattackString = '<strong>Multiattack:</strong> The ' + derivedStats.slug + ' makes ' + numberStrings[attackCount] + ' attacks:' + multiattackString + '.';
            if (derivedStats.multiattack.requireDifferentTargets) {
                //This may need to change if a creature with more than two attacks ever gets this attribute, but for now it's fine as is as only the t rex has this restriction
                multiattackString+= ' It can&rsquo;t make both attacks against the same target.';
            }
            $('<p>'+multiattackString+'</p>').appendTo('#attacks');
        } else {
            let attack = Object.keys(derivedStats.multiattack.attacks)[0];
            let multiattackString = '<strong>Multiattack:</strong> The ' + derivedStats.slug + ' makes ' + numberStrings[derivedStats.multiattack.attacks[attack]] + ' ' + derivedStats.attacks[attack].name.toLowerCase() + ' attacks.';
            $('<p>'+multiattackString+'</p>').appendTo('#attacks');
        }
        
    }
    if (derivedStats.attacks) {
        for (let attack in derivedStats.attacks) {
            let currentAttack = derivedStats.attacks[attack];
            let attackString = '<strong>'+currentAttack.name+'.</strong> ';
            attackString += '<em>' + (currentAttack.ranged ? 'Ranged' : 'Melee') + ' Weapon Attack:</em> ';
            let abilityModifier = currentAttack.finesse ? Math.max(derivedStats.abilityModifiers.str, derivedStats.abilityModifiers.dex) : derivedStats.abilityModifiers.str;
            let rangeString;
            if (currentAttack.ranged) {
                rangeString = 'range ' + currentAttack.range + (currentAttack.longRange ? '/' + currentAttack.longRange : '');
            } else {
                rangeString = 'reach ' + sizes[derivedStats.size].reach[currentAttack.reach];
            }
            attackString += '+' + (derivedStats.proficiency + abilityModifier) + ' to hit, '+rangeString+ ' ft., ';
            if (currentAttack.proneOnly) {
                attackString += 'one prone creature';
            } else if (currentAttack.creatureOnly) {
                attackString += 'one creature;'
            } else {
                attackString += 'one target';
            }
            attackString += (currentAttack.notGrappled ? ' not grappled by the ' + derivedStats.slug : '') + '. '
            attackString += '<em>Hit:</em> ' + Math.max(1, (averageRoll(currentAttack.damageDice, currentAttack.damageDieSize) + abilityModifier));
            attackString += ' (' + currentAttack.damageDice + 'd' + currentAttack.damageDieSize + (abilityModifier >= 0 ? ' + ' : ' - ' ) + Math.abs(abilityModifier) + ') ' + currentAttack.damageType + ' damage.';
            if (currentAttack.proc) {
                attackString+= ' ' + replaceTokensInString(procs[currentAttack.proc], derivedStats);
            }
            $('<p>'+attackString+'</p>').appendTo('#attacks');
        }
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
 * Converts challenge rating to a string so that decimal CRs become fractions
 *
 * @param {string} cr The challenge rating to convert to a string.
 * @return {string} The string version of the challenge rating
 */
 function stringForCR(cr) {
    let safeCR = parseFloat(cr);
    switch(safeCR) {
        case 0.125:
            return '1/8';
        case 0.25:
            return '1/4';
        case 0.5: 
            return '1/2';
        default:
            return cr;
    }
}

/**
 * Finds the closest statblocks above and below the target CR that have the target stat(s)
 *
 * @param {Array} stats The stats to search for
 * @param {string} targetCR The challenge rating to find benchmarks for
 * @param {Object} sourceStats The stat block for which to find stat benchmarks
 * @return {Object} Benchmarks for the selected stat at the nearest CRs above and below it that had values for that stat.
 */
function findBenchmarksForStat(stats, targetCR, sourceStats) {
    let numTargetCR = Number(targetCR); //CRs must be compared as ints or the equality checks sometimes return the wrong result
    let statList = Array.isArray(stats) ? stats : [stats];
    let benchmarks = null;
    for (let cr in sourceStats) {
        let numCR = Number(cr);
        let statBlock = flattenObject(sourceStats[cr]);
        let allStatsFound = true;
        for (let i = 0; i < statList.length; i++) {
            allStatsFound = allStatsFound && statBlock.hasOwnProperty(statList[i]);
            if (!allStatsFound) {
                break;
            }
        }
        if (allStatsFound) {
            if (!benchmarks) {
                benchmarks = {};
            }
            if (numCR > numTargetCR) {
                if (!benchmarks.upper || benchmarks.upper.cr > numCR) {
                    benchmarks.upper = {
                        cr: numCR,
                    }
                    for (let i = 0; i < statList.length; i++) {
                        benchmarks.upper[statList[i]] = statBlock[statList[i]];
                    }
                }
            } else {
                if (!benchmarks.lower || benchmarks.lower.cr < numCR) {
                    benchmarks.lower = {
                        cr: numCR,
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
 * Calculates the weighted average for a state between two CRs, ie if benchmarks are found for one CR below and 4 CR above, an average weighted toward the lower benchmark will be calculated
 *
 * @param {string} stat The name of the stat to average.
 * @param {Object} benchmarks The benchmarks to average from.
 * @return {number} The weighted average value
 */
 function calculateWeightedAverage(stat, benchmarks, targetCR) {
    let upperStep = stepForCR(benchmarks.upper.cr);
    let lowerStep = stepForCR(benchmarks.lower.cr);
    let stepRange = upperStep - lowerStep;
    let targetStep = stepForCR(targetCR);
    let upperWeight = (upperStep - targetStep) / stepRange;
    let lowerWeight = (targetStep - lowerStep) / stepRange;
    return Math.round(upperWeight * benchmarks.upper[stat] + lowerWeight * benchmarks.lower[stat]);
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
 * @param {Object} statList The stat list to search 
 * @return {number} The benchmark found
 */
 function findNearestLowerBenchmark(stat, targetCR, statList) {
    let numTargetCR = parseFloat(targetCR);
    let lowestValue;
    let lowestCR = 31;
    let highestValue;
    let highestCR = 0;
    for (let cr in statList) {
        let numCR = parseFloat(cr);
        let statBlock = flattenObject(statList[cr]);
        if (statBlock[stat]) {
            if (numCR < lowestCR) {
                lowestCR = cr;
                lowestValue = statBlock[stat];
            }
            if (numCR > highestCR && numCR <= numTargetCR) {
                highestValue = statBlock[stat];
                highestCR = cr;
            }
        }
    }
    return highestValue != null ? highestValue : lowestValue;
}

/**
 * Returns a sentence case version of a string
 *
 * @param {string} targetString The string to convert to sentence case
 * @return {string} The sentence case string
 */
 function toSentenceCase(targetString) {
    return targetString[0].toUpperCase() + targetString.substr(1);
 }
 
 /**
 * Replaced various tokens in a string with appropriate values
 *
 * @param {string} targetString The string in which to find and replace tokens
 * @param {Object} statBlock The statblock to use when replacing stat related tokens, such as save DCs
 * @param {Object} trait Secondary stat block for a specific trait, which is used when determing trait related tokens
 * @return {string} The result string with tokens replaced
 */
  function replaceTokensInString(targetString, statBlock, trait) {
    let outputString = targetString;
    while (outputString.indexOf('{{') >= 0) {
        let tokenStartIndex = outputString.indexOf('{{');
        let tokenEndIndex = outputString.indexOf('}}')+2;
        let fullToken = outputString.substr(tokenStartIndex,tokenEndIndex-tokenStartIndex);
        let token = fullToken.substr(2, fullToken.length-4);
        let tokenValue = '';

        if (statBlock[token]) {
            tokenValue = statBlock[token];
        } else {
            let tokenArray = token.split(':');
            if (tokenArray[0] == 'DC') {
                let dc =  8 + statBlock.proficiency + statBlock.abilityModifiers[tokenArray[1]];
                if (tokenArray.length > 2) {
                    dc += parseInt(tokenArray[2]);
                }
                tokenValue = dc;
            } else if (tokenArray[0] == 'size') {
                let targetSize = statBlock.size + parseInt(tokenArray[1]);
                tokenValue = sizes[targetSize].name;
            } else if (tokenArray[0] == 'trait') {
                if (trait[tokenArray[1]]) {
                    tokenValue = trait[tokenArray[1]];
                } else if (tokenArray[1] == 'DC') {
                    let dc =  8 + statBlock.proficiency + statBlock.abilityModifiers[trait.dcStat];
                    if (trait.dcAdjustment) {
                        dc += parseInt(trait.dcAdjustment);
                    }
                    tokenValue = dc;
                }
            }
        }

        outputString = outputString.replace(fullToken, tokenValue);
    } 
    return outputString;
 }

 /**
 * Recursively flattens and object. ie, {x: {y:5}, z: 10} would become {x__y : 5, z : 10}
 *
 * @param {Object} targetObject The object to flatten
 * @return {Object} The flattened object
 */
  function flattenObject(targetObject) {
    let outputObject = {};
    for (let property in targetObject) {
        let value = targetObject[property];
        if (typeof(value) == 'object') {
            let flattenedChild = flattenObject(value);
            for (let childProperty in flattenedChild) {
                outputObject[property+'__'+childProperty] = flattenedChild[childProperty];
            }
        } else {
            outputObject[property] = value;
        }
    }
    return outputObject;
}

 /**
 * Returns the average roll for a number of dice
 *
 * @param {Number} diceCount The number of dice to roll
 * @param {Number} dieSize The size of the dice being rolled
 * @return {Number} The average roll, rounded down
 */
  function averageRoll(diceCount, dieSize) {
      let averagePerDie = (1 + dieSize) / 2;
      return Math.floor(diceCount * averagePerDie);
  }

/**
 * Returns an appropriate damage die size and count to reach an estiamted average damage number
 *
 * @param {Number} targetDamage The target average damage
 * @param {Number} preferredDieSize The preferred die size to return, usually the monster's original damage die. This will be used unless the target number so low a single die is too much, or so high that this would result in an excessive number of dice
 * @return {Array} An array containing number of dice at index 0 and die size at index 1
 */
function findDamageDice(targetDamage, preferredDieSize) {
    //TODO: Consider capping damage dice for specific attacks and split high damage attacks into multiattacks
    //This method tries to find the damage die that would yield the best average damage, but favors larger dice so mosnters don't all end up using loads of d4s.
    let maximumDice = 15; //If the number of dice exceeds this the next step up will be used, unless the die size is already d12.
    let dice = [12, 10, 8, 6, 4];
    let dieAverages = [6.5, 5.5, 4.5, 3.5, 2.5];
    //If the preferred die is a larger one make sure that a single die is not too much.
    //For example, if a creature with d12 attacks is scaled down to CR 0 even 1d12 may be too much average damage
    if (targetDamage < dieAverages[dice.indexOf(preferredDieSize)] - .5) {
        //If target damage is closer to a lower average then the preferred die size is too high
        let desiredAverage = Math.floor(targetDamage) + .5; //Round and add .5 to make it match a die average
        desiredAverage = Math.max(desiredAverage, 2.5); //Make sure it's at least the average for a d4 in case it's a very low number
        return [1, dice[dieAverages.indexOf(desiredAverage)]];        

    }

    let dieCount = Math.round(targetDamage/dieAverages[dice.indexOf(preferredDieSize)]);
    let dieSize = preferredDieSize;
    while (dieCount > maximumDice && dieSize < 12) {
        dieSize = dice[dice.indexOf(dieSize)-1];
        dieCount = Math.round(targetDamage/dieAverages[dice.indexOf(dieSize)]);
    }
    return [dieCount, dieSize];
}