var monsterStats;

$(function () {

    if (location.search.length) {
        let params = new URLSearchParams(location.search);

        //Skip variant at first because it must come after monster
        $('select:not(#variant)').each(function () {
            let value = params.get($(this).attr('id'));
            if (value) {
                if ($(this).attr('multiple')) {
                    //Convert value to an array
                    $(this).val(value.split(','));
                } else {
                    //Make sure the value is valid
                    if ($(this).children('option[value="'+value+'"]').length) {
                        $(this).val(value);
                    }
                }
            }
        });

        //Need to do this after mosnter is selected, but before variant is selected
        setupVariantSelect(false);
        //Select the variant if it has one
        let paramsVariant = params.get('variant');
        if (paramsVariant && $('#variant option[value="'+paramsVariant+'"]').length) {
            $('#variant').val(paramsVariant);
        }

        $('input:not([type="checkbox"])').each(function () {
            let value = params.get($(this).attr('id'));
            if (value) {
                $(this).val(value);
            }
        });

        $('input[type="checkbox"]').each(function () {
            if(params.get($(this).attr('id')) !== null) {
                $(this)[0].checked = true;
            }
        });

        if ($('#wild-shape')[0].checked) {
            $('#wild-shape-wrapper').show();
            let paramsRider = params.get('riderType');
            if (paramsRider) {
                $('#ws-rider-type').val(paramsRider);
            }
        }
    }

    $('#wild-shape').on('change', function () {
        if ($(this)[0].checked) {
            $('#wild-shape-wrapper').slideDown();
        } else {
            $('#wild-shape-wrapper').slideUp();
        }
    });

    //Pretty much any input change means a recalculation
    $('input,select').on('change', calculateSelectedMonster);

    calculateSelectedMonster();

});

/**
 * Scales monster stats based on the selected template and challenge rating.
 */
function calculateSelectedMonster() {
    let monsterID = $('#creature').val();
    let selectedMonster = monsterList[monsterID];
    let targetCR = $('#target-cr').val();
    let numTargetCR = Number(targetCR); //Certain comparisons require a numeric version of the CR
    let selectedVariant;
    let wildShape = $('#wild-shape')[0].checked;
    let currentRace;
    let customName = $('#name').val();
    let customGender = parseInt($('#gender').val());
    if (selectedMonster.variants) {
        selectedVariant = selectedMonster.variants[$('#variant').val()];
    }

    //Generate a direct link to this specific creature and stat set
    let directLink = location.toString().replace(location.search, "");
    directLink += '?' + serializeForm($('#monster-form'));
    $('#direct-link').attr('href', directLink);

    //Need to combine variant stats with base stats, if applicable
    let sourceStats = Object.assign({}, selectedMonster.stats);
    if (selectedVariant && selectedVariant.stats) {
        for (let cr in selectedVariant.stats) {
            if (sourceStats[cr]) {
                sourceStats[cr] = mergeObjects(sourceStats[cr], selectedVariant.stats[cr]);
            } else {
                sourceStats[cr] = selectedVariant.stats[cr];
            }
        }
    }

    //Start with locked stats and presets for this CR, if any
    monsterStats = {};
    monsterStats.cr = targetCR;
    if (sourceStats[targetCR]) {
        monsterStats = mergeObjects(monsterStats, sourceStats[targetCR]);
    }
    monsterStats = mergeObjects(monsterStats, selectedMonster.lockedStats);
    if (selectedVariant && selectedVariant.lockedStats) {
        monsterStats = mergeObjects(monsterStats, selectedVariant.lockedStats);
    }
    if (selectedMonster.type === typeHumanoid) {
        if (selectedMonster.race === raceAny) {
            currentRace = races[$('#race-select').val()]
            monsterStats.type = selectedMonster.type + ' (' + currentRace.name + ')';

            //If not any race apply the mods for the chosen race
            if (currentRace !== races[0]) {
                monsterStats = mergeObjects(monsterStats, currentRace.stats);

                //If the NPC gets languages for their race deduct them from any "bonus languages"
                if (monsterStats.extraLanguages && currentRace.stats.languages) {
                    monsterStats.extraLanguages -= currentRace.stats.languages.length;
                    monsterStats.extraLanguages = Math.max(monsterStats.extraLanguages, 0); //Make sure it's not negative
                }
            }

        } else {
            monsterStats.type = selectedMonster.type + ' (' + selectedMonster.type + ')';
        }
    } else {
        monsterStats.type = selectedMonster.type;
        if (selectedMonster.subtype) {
            monsterStats.type += ' (' + selectedMonster.subtype + ')';
        }
        $('#race-wrapper').hide();
    }
    if (wildShape) {
        //Override int, wis, and cha if this is a wild shape
        let wildShapeStats = {
            int: $('#player-int').val(),
            wis: $('#player-wis').val(),
            cha: $('#player-cha').val()
        }
        if ($('#ws-resists').val().length) {
            wildShapeStats.resistances = $('#ws-resists').val();
        }
        if ($('#ws-immunities').val().length) {
            wildShapeStats.immunities = $('#ws-immunities').val();
        }
        monsterStats = mergeObjects(monsterStats, wildShapeStats);
        monsterStats.proficiency = averageStats[$('#player-level').val()].proficiency;
        monsterStats.wildShape = wildShape;
    } else {
        monsterStats.proficiency = averageStats[targetCR].proficiency;
    }


    //Store some strings in derived stats so they are available outside this scope
    monsterStats.alignment = selectedMonster.alignment;

    monsterStats.gender = customGender || selectedMonster.gender || 4; //Default to genderless if no custom or creature default
    
    //Once we have our locked stats, go through the rest of the states to interpolate or extrapolate based on existing values.
    //All of the preset monster statblocks should be complete, but if we ever add "keyframes" for individual stats it may be possible to have CRs without all stats for a template
    //For this reason we do the interpolation for EACH stat individually, rather than finding the closest statblock to draw from

    //Grab the most appropriate name if this CR doesn't have one
    if (!monsterStats.name) {
        monsterStats.name = findNearestLowerBenchmark("name", targetCR, sourceStats);
    }
    if (customName) {
        //If there's a custom name assign that, but hang onto the original name
        monsterStats.defaultName = monsterStats.name;
        monsterStats.name = customName;
        $('#npc-wrapper').show();
        monsterStats.unique = $('#unique-npc').is(':checked');
    } else {
        $('#npc-wrapper').hide();
    }

    if(!monsterStats.slug) {
        monsterStats.slug = findNearestLowerBenchmark("slug", targetCR, sourceStats);
    }
    monsterStats.appearance = monsterStats.slug; //TODO: Updated for creatures where appearance isn't slug (ie, treants are trees)
    //Description for traits. The creature's proper name if it has one, otherwise "the [slug]"
    monsterStats.description = (monsterStats.unique ? monsterStats.name : 'the ' + monsterStats.slug) ;

    //Traits require a different approach from some other stats as we take a base from the trait library, but potentially apply modifiers to it based on creature stats.
    //TODO: Adjust for creatures that gain additional traits as they level up
    monsterStats.traits = {};
    let traitList = [];
    if (selectedMonster.traits) {
        traitList = traitList.concat(selectedMonster.traits);
    }
    if (selectedVariant && selectedVariant.traits) {
        traitList = traitList.concat(selectedVariant.traits); 
    }
    if (wildShape && $('#magic-attacks')[0].checked) {
        traitList.push('magicAttacks');
    }
    if (currentRace && currentRace.traits) {
        traitList = traitList.concat(currentRace.traits);
    }
    for (let i = 0; i < traitList.length; i++) {
        monsterStats.traits[traitList[i]] = generateTrait(traitList[i], targetCR, sourceStats);
    }

    //Actions are handled somewhat like traits, although at this time there are no additional ones from race or variant
    if (selectedMonster.actions) {
        monsterStats.actions = {};
        for (let i = 0; i < selectedMonster.actions.length; i++) {
            monsterStats.actions[selectedMonster.actions[i]] = generateTrait(selectedMonster.actions[i], targetCR, sourceStats);
        }
    }
    if (selectedMonster.bonusActions) {
        monsterStats.bonusActions = {};
        for (let i = 0; i < selectedMonster.bonusActions.length; i++) {
            monsterStats.bonusActions[selectedMonster.bonusActions[i]] = generateTrait(selectedMonster.bonusActions[i], targetCR, sourceStats);
        }
    }

    if(!monsterStats.size) {
        let sizeBenchmarks = findBenchmarksForStat("size", targetCR, sourceStats);
        monsterStats.size = extrapolateFromBenchmark("size", targetCR, sizeBenchmarks, true);
        monsterStats.size = Math.min(6, monsterStats.size);
    }

    monsterStats.abilityModifiers = {};
    for (let i = 0; i < abilityScores.length; i++) {
        if (!monsterStats[abilityScores[i]]) {
            let abilityBenchmarks = findBenchmarksForStat(abilityScores[i], targetCR, sourceStats);
            monsterStats[abilityScores[i]] = extrapolateFromBenchmark(abilityScores[i], targetCR, abilityBenchmarks, false);
        }
        monsterStats.abilityModifiers[abilityScores[i]] = abilityScoreModifier(monsterStats[abilityScores[i]]);
    }    

    //Need to check vs undefined rather than do implicit cast to acocunt for cases where bonus armor is already derived as 0
    if (monsterStats.bonusArmor == undefined) {
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
            monsterStats.bonusArmor = Math.max(0, targetAC - 10 - monsterStats.abilityModifiers.dex);
        } else {
            monsterStats.bonusArmor = 0; //Need to define it to add wild shape bonus to it
        }
    }
    if (wildShape) {
        monsterStats.bonusArmor += parseInt($('#ws-ac-bonus').val());
    }

    if (!monsterStats.hitDice) {
        //Like AC bonuses, we calculate hit dice by extrapolating a target HP number and working backwards rather than extrapolating hit dice directly
        let hpStats = ["con", "hitDice"];
        //Don't search for size for humanoids as their size is locked (and will cause an error)
        if (!selectedMonster.lockedStats.size) {
            hpStats.push("size");
        }
        let hpBenchmarks = findBenchmarksForStat(hpStats, targetCR, sourceStats);
        for (let benchmark in hpBenchmarks) {
            let currentBenchmark = hpBenchmarks[benchmark];
            if (!currentBenchmark.size) {
                currentBenchmark.size = monsterStats.size;
            }
            currentBenchmark.hp = Math.floor(hitPointsPerHitDie(currentBenchmark) * currentBenchmark.hitDice);
        }
        let targetHP = extrapolateFromBenchmark('hp', targetCR, hpBenchmarks, false);
        let hpPerHD = hitPointsPerHitDie(monsterStats);
        monsterStats.hitDice = Math.max(1, Math.round(targetHP / hpPerHD));
    }

    //Find all attacks the creature should have at the target CR by adding attacks for all CRs equal to or below target
    for (let cr in sourceStats) {
        if (parseFloat(cr) <= parseFloat(targetCR) && sourceStats[cr].attacks) {
            for (let attack in sourceStats[cr].attacks) {
                if (!monsterStats.attacks[attack]) {
                    //We want to copy the attack except for its damage, as that may need to be adjusted based on CR
                    let attackCopy = Object.assign({}, sourceStats[cr].attacks[attack]);
                    delete attackCopy.damageDice;
                    delete attackCopy.damageDieSize;
                    monsterStats.attacks[attack] = attackCopy;
                }
            }
        }
    }
    for (let attack in monsterStats.attacks) {
        let currentAttack = monsterStats.attacks[attack];
        //Ensure we are using appropriate stats for the target CR, if they are present
        if (sourceStats[targetCR] && sourceStats[targetCR].attacks && sourceStats[targetCR].attacks[attack]) {
            monsterStats.attacks[attack] = Object.assign(monsterStats.attacks[attack], sourceStats[targetCR].attacks[attack]);
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
            let targetDamage = estimatedDamage - (currentAttack.finesse ? Math.max(monsterStats.abilityModifiers.str, monsterStats.abilityModifiers.dex) : monsterStats.abilityModifiers.str);
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

        //This could possibly be made into a function to share logic with the block above, but this one is a little difference since it doesn't include ability score bonuses
        if (currentAttack.damageRiderType && !currentAttack.damageRiderDice) {
            let damageDiceString = 'attacks__'+attack+'__damageRiderDice';
            let damageDieSizeString =  'attacks__'+attack+'__damageRiderDieSize';
            
            let estimatedDice = scaleDamageRoll(damageDiceString, damageDieSizeString, targetCR, sourceStats);
            currentAttack.damageRiderDice = estimatedDice[0];
            currentAttack.damageRiderDieSize = estimatedDice[1];
        }

        if (currentAttack.proc) {
            currentAttack.generatedProc = generateTrait(currentAttack.proc, targetCR, sourceStats);
        }
    }

    if (!monsterStats.multiattack) {
        //See if the creature gains multiattack as it goes up in CR
        for (let cr in sourceStats) {
            let numCR = Number(cr);
            let highestCR = 0;
            if (numCR <= numTargetCR && numCR > highestCR && sourceStats[cr].multiattack) {
                highestCR = numCR;
                monsterStats.multiattack = sourceStats[cr].multiattack;
            }
        }
    }

    //Add racial bonuses
    //These are added near the end so they don't affect other calculations
    //ie, a dwarf thug should not end up with fewer HD than a human thug because of their HP bonuses
    if (selectedMonster.type === typeHumanoid && selectedMonster.race === raceAny && currentRace !== races[0]) {
        for (let stat in currentRace.bonusStats) {
            //Skip mental ability scores if this is a shape change
            if (['int', 'wis', 'cha'].includes(stat) && wildShape) {
                continue;
            }
            monsterStats[stat] += currentRace.bonusStats[stat];
            //This does mean we need to recalculate the modifier
            monsterStats.abilityModifiers[stat] = abilityScoreModifier(monsterStats[stat]);
        }
    }
    

    //Calculate movement speeds. These won't scale with CR, we just take the stat the stat from the closest lower CR.
    monsterStats.speed = findNearestLowerBenchmark('speed', targetCR, sourceStats);
    monsterStats.swim = findNearestLowerBenchmark('swim', targetCR, sourceStats);
    monsterStats.climb = findNearestLowerBenchmark('climb', targetCR, sourceStats);
    monsterStats.burrow = findNearestLowerBenchmark('burrow', targetCR, sourceStats);
    monsterStats.fly = findNearestLowerBenchmark('fly', targetCR, sourceStats);

    //Determine what senses the creature should have
    for (let i = 0; i < senses.length; i++) {
        let sense = senses[i];
        if (!monsterStats[sense]) {
            monsterStats[sense] = findNearestLowerBenchmark(sense, targetCR, sourceStats);
        }
    }

    renderStatblock(monsterStats);

}
