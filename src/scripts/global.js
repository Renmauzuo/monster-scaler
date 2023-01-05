var numberStrings = ['zero', 'one', 'two', 'three', 'four', 'five'];
var derivedStats;

$(function () {

    for (let monster in monsterList) {
        $('<option value='+monster+'>'+(monsterList[monster].menuName || toSentenceCase(monster))+'</option>').appendTo('#monster-select');
    }

    if (location.search.length) {
        let params = new URLSearchParams(location.search);
        let paramMonster = params.get('monster');
        let paramsCR = params.get('cr');
        let paramsVariant = params.get('variant');
        let paramsRace = params.get('race');
        let paramsGender = params.get('gender');
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

        if (paramsRace) {
            $('#race-select').val(paramsRace);
        }

        if (paramsGender) {
            $('#gender').val(paramsGender);
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

    $('#monster-select').on('change', function () {
        setupVariantSelect(true);
    });

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
 * Shows or hides the variant dropdown based on the current monster, and populates it with any variant options.
 *
 * @param {boolean} animated Whether or not to animate the show/hide
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
    let wildShape = $('#wild-shape')[0].checked;
    let currentRace;
    let customName = $('#name').val();
    let customGender = parseInt($('#gender').val());
    if (selectedMonster.variants) {
        selectedVariant = selectedMonster.variants[$('#variant-select').val()];
    }

    //Generate a direct link to this specific creature and stat set
    let directLink = location.toString().replace(location.search, "");
    directLink += '?monster='+monsterID+'&cr='+targetCR;
    if (selectedVariant) {
        directLink += '&variant='+$('#variant-select').val();
    }

    if (wildShape) {
        directLink += '&riderType' + '=' + $('#ws-rider-type').val();
    }

    $('input:visible:not([type="checkbox"])').each(function () {
        let value = $(this).val();
        if (value) {
            directLink += '&' + $(this).attr('id') + '=' + value;
        }
    });

    $('input:visible:checked').each(function () {
        directLink += '&' + $(this).attr('id');
    });

    if (selectedMonster.type == typeHumanoid) {
        directLink += '&race='+ $('#race-select').val();
    }
    //Don't need to include gender if it's the default
    if (customGender) {
        directLink += '&gender='+customGender;
    }
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
    derivedStats = {};
    if (sourceStats[targetCR]) {
        derivedStats = mergeObjects(derivedStats, sourceStats[targetCR]);
    }
    derivedStats = mergeObjects(derivedStats, selectedMonster.lockedStats);
    if (selectedVariant && selectedVariant.lockedStats) {
        derivedStats = mergeObjects(derivedStats, selectedVariant.lockedStats);
    }
    if (selectedMonster.type === typeHumanoid) {
        if (selectedMonster.race === raceAny) {
            currentRace = races[$('#race-select').val()]
            derivedStats.type = selectedMonster.type + ' (' + currentRace.name + ')';
            $('#race-wrapper').show();

            //If not any race apply the mods for the chosen race
            if (currentRace !== races[0]) {
                derivedStats = mergeObjects(derivedStats, currentRace.stats);

                //If the NPC gets languages for their race deduct them from any "bonus languages"
                if (derivedStats.extraLanguages && currentRace.stats.languages) {
                    derivedStats.extraLanguages -= currentRace.stats.languages.length;
                    derivedStats.extraLanguages = Math.max(derivedStats.extraLanguages, 0); //Make sure it's not negative
                }
            }

        } else {
            derivedStats.type = selectedMonster.type + ' (' + selectedMonster.type + ')';
            $('#race-wrapper').hide();
        }
    } else {
        derivedStats.type = selectedMonster.type;
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
        derivedStats = mergeObjects(derivedStats, wildShapeStats);
        derivedStats.proficiency = averageStats[$('#player-level').val()].proficiency;
    } else {
        derivedStats.proficiency = averageStats[targetCR].proficiency;
    }


    //Store some strings in derived stats so they are available outside this scope
    derivedStats.alignment = selectedMonster.alignment;

    derivedStats.gender = customGender || selectedMonster.gender || 4; //Default to genderless if no custom or creature default
    
    //Once we have our locked stats, go through the rest of the states to interpolate or extrapolate based on existing values.
    //All of the preset monster statblocks should be complete, but if we ever add "keyframes" for individual stats it may be possible to have CRs without all stats for a template
    //For this reason we do the interpolation for EACH stat individually, rather than finding the closest statblock to draw from

    //Grab the most appropriate name if this CR doesn't have one
    if (!derivedStats.name) {
        derivedStats.name = findNearestLowerBenchmark("name", targetCR, sourceStats);
    }
    if (customName) {
        //If there's a custom name assign that, but hang onto the original name
        derivedStats.defaultName = derivedStats.name;
        derivedStats.name = customName;
        $('#npc-wrapper').show();
        derivedStats.unique = $('#unique-npc').is(':checked');
    } else {
        $('#npc-wrapper').hide();
    }

    if(!derivedStats.slug) {
        derivedStats.slug = findNearestLowerBenchmark("slug", targetCR, sourceStats);
    }
    derivedStats.appearance = derivedStats.slug; //TODO: Updated for creatures where appearance isn't slug (ie, treants are trees)
    //Description for traits. The creature's proper name if it has one, otherwise "the [slug]"
    derivedStats.description = (derivedStats.unique ? derivedStats.name : 'the ' + derivedStats.slug) ;

    //Traits require a different approach from some other stats as we take a base from the trait library, but potentially apply modifiers to it based on creature stats.
    //TODO: Adjust for creatures that gain additional traits as they level up
    derivedStats.traits = {};
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
        derivedStats.traits[traitList[i]] = generateTrait(traitList[i], targetCR, sourceStats);
    }

    //Actions are handled somewhat like traits, although at this time there are no additional ones from race or variant
    if (selectedMonster.actions) {
        derivedStats.actions = {};
        for (let i = 0; i < selectedMonster.actions.length; i++) {
            derivedStats.actions[selectedMonster.actions[i]] = generateTrait(selectedMonster.actions[i], targetCR, sourceStats);
        }
    }
    if (selectedMonster.bonusActions) {
        derivedStats.bonusActions = {};
        for (let i = 0; i < selectedMonster.bonusActions.length; i++) {
            derivedStats.bonusActions[selectedMonster.bonusActions[i]] = generateTrait(selectedMonster.bonusActions[i], targetCR, sourceStats);
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

    //Need to check vs undefined rather than do implicit cast to acocunt for cases where bonus armor is already derived as 0
    if (derivedStats.bonusArmor == undefined) {
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
        } else {
            derivedStats.bonusArmor = 0; //Need to define it to add wild shape bonus to it
        }
    }
    if (wildShape) {
        derivedStats.bonusArmor += parseInt($('#ws-ac-bonus').val());
    }

    if (!derivedStats.hitDice) {
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
                currentBenchmark.size = derivedStats.size;
            }
            currentBenchmark.hp = Math.floor(hitPointsPerHitDie(currentBenchmark) * currentBenchmark.hitDice);
        }
        let targetHP = extrapolateFromBenchmark('hp', targetCR, hpBenchmarks, false);
        let hpPerHD = hitPointsPerHitDie(derivedStats);
        derivedStats.hitDice = Math.max(1, Math.round(targetHP / hpPerHD));
    }

    //Find all attacks the creature should have at the target CR by adding attacks for all CRs equal to or below target
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

    //Add racial bonuses
    //These are added near the end so they don't affect other calculations
    //ie, a dwarf thug should not end up with fewer HD than a human thug because of their HP bonuses
    if (selectedMonster.type === typeHumanoid && selectedMonster.race === raceAny && currentRace !== races[0]) {
        for (let stat in currentRace.bonusStats) {
            //Skip mental ability scores if this is a shape change
            if (['int', 'wis', 'cha'].includes(stat) && wildShape) {
                continue;
            }
            derivedStats[stat] += currentRace.bonusStats[stat];
            //This does mean we need to recalculate the modifier
            derivedStats.abilityModifiers[stat] = abilityScoreModifier(derivedStats[stat]);
        }
    }
    

    //Calculate movement speeds. These won't scale with CR, we just take the stat the stat from the closest lower CR.
    derivedStats.speed = findNearestLowerBenchmark('speed', targetCR, sourceStats);
    derivedStats.swim = findNearestLowerBenchmark('swim', targetCR, sourceStats);
    derivedStats.climb = findNearestLowerBenchmark('climb', targetCR, sourceStats);
    derivedStats.burrow = findNearestLowerBenchmark('burrow', targetCR, sourceStats);
    derivedStats.fly = findNearestLowerBenchmark('fly', targetCR, sourceStats);

    //Determine what senses the creature should have
    if (!derivedStats.blindsight) {
        derivedStats.blindsight = findNearestLowerBenchmark('blindsight', targetCR, sourceStats);
    }

    //Once we have all the stats populate the statblock:
    $('#monster-name').html((customName && wildShape) ? (customName + ' (' + derivedStats.defaultName + ')') : derivedStats.name);
    $('#monster-type').html(sizes[derivedStats.size].name + ' ' + derivedStats.type + ', ' + selectedMonster.alignment);

    if (derivedStats.bonusArmor) {
        $('#armor-class span').html((10 + derivedStats.bonusArmor + derivedStats.abilityModifiers.dex) + ' ('+(derivedStats.armorDescription||'Bonus Armor')+')');
    } else {
        $('#armor-class span').html(10 + derivedStats.abilityModifiers.dex);
    }

    //Dwarves make HP more complicated
    let hitPoints = Math.floor(hitPointsPerHitDie(derivedStats)*derivedStats.hitDice);
    let bonusHP = derivedStats.abilityModifiers.con;
    //Dwarven toughness is only added here so it doesn't change the hit dice of dwarf NPCs
    for (let traitName in derivedStats.traits) {
        let trait = derivedStats.traits[traitName];
        if (trait.hitPointsPerHitDie) {
            bonusHP += trait.hitPointsPerHitDie;
            hitPoints += trait.hitPointsPerHitDie * derivedStats.hitDice;
        }
    }
    $('#hit-points span').html(hitPoints+' ('+derivedStats.hitDice+'d'+sizes[derivedStats.size].hitDie+ ( bonusHP > 0 ? '+'+(bonusHP*derivedStats.hitDice) : '')+')');

    let speedString = "";
    if (derivedStats.speed) {
        speedString = derivedStats.speed + ' ft.';
    }
    if (derivedStats.swim) {
        speedString += (speedString.length ? ', ' : '') + "Swim " + derivedStats.swim + ' ft.';
    }
    if (derivedStats.climb) {
        speedString += (speedString.length ? ', ' : '') + "Climb " + derivedStats.climb + ' ft.';
    }
    if (derivedStats.burrow) {
        speedString += (speedString.length ? ', ' : '') + "Burrow " + derivedStats.burrow + ' ft.';
    }
    if (derivedStats.fly) {
        speedString += (speedString.length ? ', ' : '') + "Fly " + derivedStats.fly + ' ft.';
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
            let skillModifier = derivedStats.proficiency*derivedStats.skills[skill] + derivedStats.abilityModifiers[skills[skill]];
            let modifierString = (skillModifier >= 0 ? '+' : '') + skillModifier;
            skillString+= toSentenceCase(skill) + ' ' + modifierString;
        }
        $('#skills span').html(skillString);
    } else {
        $('#skills').hide();
    }

    if (derivedStats.vulnerabilities) {
        let vulnerabilitiesString = "";
        for (let i = 0; i < derivedStats.vulnerabilities.length; i++) {
            if (i) {
                vulnerabilitiesString += ', ';
            }
            vulnerabilitiesString += toSentenceCase(derivedStats.vulnerabilities[i]);
        }
        $('#vulnerabilities span').html(vulnerabilitiesString);
        $('#vulnerabilities').show();
    } else {
        $('#vulnerabilities').hide();
    }

    if (derivedStats.resistances) {
        let resistancesString = "";
        for (let i = 0; i < derivedStats.resistances.length; i++) {
            if (i) {
                resistancesString += ', ';
            }
            resistancesString += toSentenceCase(derivedStats.resistances[i]);
        }
        $('#resistances span').html(resistancesString);
        $('#resistances').show();
    } else {
        $('#resistances').hide();
    }

    if (derivedStats.immunities) {
        let immunitiesString = "";
        for (let i = 0; i < derivedStats.immunities.length; i++) {
            if (i) {
                immunitiesString += ', ';
            }
            immunitiesString += toSentenceCase(derivedStats.immunities[i]);
        }
        $('#immunities span').html(immunitiesString);
        $('#immunities').show();
    } else {
        $('#immunities').hide();
    }

    if (derivedStats.conditionImmunities) {
        let conditionImmunitiesString = "";
        for (let i = 0; i < derivedStats.conditionImmunities.length; i++) {
            if (i) {
                conditionImmunitiesString += ', ';
            }
            conditionImmunitiesString += toSentenceCase(derivedStats.conditionImmunities[i]);
        }
        $('#condition-immunities span').html(conditionImmunitiesString);
    } else {
        $('#condition-immunities').hide();
    }

    //TODO: Add additional senses
    let sensesString = "";
    if (derivedStats.blindsight) {
        sensesString += "blindsight " + derivedStats.blindsight + ' ft., '
    }
    if (derivedStats.darkvision) {
        sensesString += "Darkvision " + derivedStats.darkvision + ' ft., '
    }
    derivedStats.sensesString = sensesString; //Need to store this without passive perception added as Fight Club tracks that separately
    derivedStats.passivePerception = (10 + derivedStats.abilityModifiers.wis + (derivedStats.skills && derivedStats.skills.hasOwnProperty('perception') ? averageStats[targetCR].proficiency : 0));
    sensesString += 'passive Perception ' + derivedStats.passivePerception;
    $('#senses span').html(sensesString);

    $('#challenge-rating span').html(stringForCR(targetCR) + ' (' + averageStats[targetCR].xp.toLocaleString() + ' XP)');

    $('#traits').empty();
    if (derivedStats.traits) {
        for (let traitName in derivedStats.traits) {
            let currentTrait = derivedStats.traits[traitName];
            currentTrait.text = replaceTokensInString(currentTrait.description, derivedStats, currentTrait); //save the output text for Fight Club
            $('<p><strong><em>'+currentTrait.name+'.</em></strong> '+currentTrait.text+'</p>').appendTo('#traits');
        }
    }

    if (derivedStats.extraLanguages) {
        derivedStats.languages = derivedStats.languages || [];
        derivedStats.languages.push("any " + numberStrings[derivedStats.extraLanguages] + ' language' + (derivedStats.extraLanguages === 1 ? ' (usually Common)' : ''));
    }
    if (derivedStats.languages) {
        let languagesString = "";
        for (let i = 0; i < derivedStats.languages.length; i++) {
            if (i) {
                languagesString += ', ';
            }
            languagesString += derivedStats.languages[i];
        }
        $('#languages span').html(languagesString).show();
    } else {
        $('#languages').hide();
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
            multiattackString = '<strong>Multiattack:</strong> ' + toSentenceCase(derivedStats.description) + ' makes ' + numberStrings[attackCount] + ' attacks:' + multiattackString + '.';
            if (derivedStats.multiattack.requireDifferentTargets) {
                //This may need to change if a creature with more than two attacks ever gets this attribute, but for now it's fine as is as only the t rex has this restriction
                multiattackString+= ' It can&rsquo;t make both attacks against the same target.';
            }
            $('<p>'+multiattackString+'</p>').appendTo('#attacks');
        } else {
            let attack = Object.keys(derivedStats.multiattack.attacks)[0];
            let multiattackString = '<strong>Multiattack:</strong> ' + toSentenceCase(derivedStats.description) + ' makes ' + numberStrings[derivedStats.multiattack.attacks[attack]] + ' ' + derivedStats.attacks[attack].name.toLowerCase() + ' attacks.';
            $('<p>'+multiattackString+'</p>').appendTo('#attacks');
        }
        
    }
    if (derivedStats.attacks) {
        for (let attack in derivedStats.attacks) {
            let currentAttack = derivedStats.attacks[attack];
            let abilityModifier;
            if (currentAttack.finesse) {
                abilityModifier = Math.max(derivedStats.abilityModifiers.str, derivedStats.abilityModifiers.dex);
            } else if (currentAttack.spellAttack) {
                abilityModifier = derivedStats.abilityModifiers[derivedStats.castingStat];
            } else {
                abilityModifier = derivedStats.abilityModifiers.str;
            }

            //Save some things for Fight Club export
            currentAttack.attackBonus = derivedStats.proficiency + abilityModifier;
            currentAttack.damageBonus = abilityModifier;
            if (wildShape) {
                currentAttack.attackBonus += parseInt($('#ws-attack-bonus').val());
                currentAttack.damageBonus += parseInt($('#ws-damage-bonus').val());
            }
            
            let attackString = '<em>' + (currentAttack.ranged ? 'Ranged' : 'Melee') + ' ' + (currentAttack.spellAttack ? 'Spell' : 'Weapon') + ' Attack:</em> ';
            let rangeString;
            if (currentAttack.ranged) {
                rangeString = 'range ' + currentAttack.range + (currentAttack.longRange ? '/' + currentAttack.longRange : '');
            } else {
                rangeString = 'reach ' + sizes[derivedStats.size].reach[currentAttack.reach];
            }
            //Monster stat blocks never have negative to hit, so we set 0 as the minimum
            attackString += '+' + Math.max(currentAttack.attackBonus, 0) + ' to hit, '+rangeString+ ' ft., ';
            if (currentAttack.proneOnly) {
                attackString += 'one prone creature';
            } else if (currentAttack.creatureOnly) {
                attackString += 'one creature;'
            } else {
                attackString += 'one target';
            }
            attackString += (currentAttack.notGrappled ? ' not grappled by ' + derivedStats.description : '') + '. '
            attackString += '<em>Hit:</em> ' + Math.max(1, (averageRoll(currentAttack.damageDice, currentAttack.damageDieSize) + currentAttack.damageBonus));
            let maxDamage = currentAttack.damageDice * currentAttack.damageDieSize + currentAttack.damageBonus;
            //If the attack can't do more than one damage total omit the roll and just show 1 flat damage
            if (maxDamage > 1) {
                attackString += ' (' + currentAttack.damageDice + 'd' + currentAttack.damageDieSize;
                if (currentAttack.damageBonus) {
                    attackString += (currentAttack.damageBonus >= 0 ? ' + ' : ' - ' ) + Math.abs(currentAttack.damageBonus);
                }
                attackString += ')';
            }

            attackString += ' ' +  currentAttack.damageType + ' damage';

            //Add riders and procs
            if (currentAttack.damageRiderDice) {
                attackString += ' plus ' + damageString(currentAttack.damageRiderDice, currentAttack.damageRiderDieSize) + ' ' + currentAttack.damageRiderType + ' damage';
            }
            let wsRiderDice = parseInt($('#ws-rider-dice').val());
            if (wildShape && wsRiderDice) {
                attackString += ' plus ' + damageString(wsRiderDice, parseInt($('#ws-rider-die-size').val())) + ' ' + $('#ws-rider-type').val() + ' damage';
            } 
            attackString += '.';
            if (currentAttack.generatedProc) {
                attackString+= ' ' + replaceTokensInString(currentAttack.generatedProc.description, derivedStats, currentAttack.generatedProc);
            }
            currentAttack.text = attackString; //Save text for Fight Club
            $('<p><strong>'+currentAttack.name+'</strong> '+attackString+'</p>').appendTo('#attacks');
        }
    }

    if (derivedStats.bonusActions) {
        $('#bonus-actions').empty();
        $('#bonus-actions-wrapper').show();
        for (let bonusActionName in derivedStats.bonusActions) {
            let currentBonusAction = derivedStats.bonusActions[bonusActionName];
            currentBonusAction.text = replaceTokensInString(currentBonusAction.description, derivedStats, currentBonusAction); //save the output text for Fight Club
            $('<p><strong><em>'+currentBonusAction.name+'.</em></strong> '+currentBonusAction.text+'</p>').appendTo('#bonus-actions');
        }
    } else {
        $('#bonus-actions-wrapper').hide();
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
            let lowerWeight = (upperStep - targetStep) / stepRange;
            let upperWeight = (targetStep - lowerStep) / stepRange;
            return Math.round(upperWeight * upperValue + lowerWeight * lowerValue);
        }
        return Math.round(lowerValue);
    }
    return Math.round(upperValue);
}

/**
 * Generates a trait or proc description, calculating attributes such as damage and DC and then replacing tokens in the description string
 *
 * @param {string} traitName The id of the base trait (or proc) to use
 * @param {string} targetCR The challenge rating to generate the trait for
 * @param {Object} sourceStats The stat block to use for finding trait benchmarks
 * @return {Object} A new trait or proc with a completed description and scaled attributes (DC, Damage, etc)
 */
 function generateTrait(traitName, targetCR, sourceStats) {
    let baseTrait = traits[traitName] || procs[traitName] || actions[traitName];
    let newTrait = Object.assign({}, baseTrait);
    if (sourceStats[targetCR] && sourceStats[targetCR].traits && sourceStats[targetCR].traits[traitName]) {
        newTrait = Object.assign(newTrait, sourceStats[targetCR].traits[traitName]);
    }

    if (baseTrait.allowsSave) {
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

    if (baseTrait.sizeRestricted) {
        if (!newTrait.hasOwnProperty("sizeAdjustment")) {
            let sizeAdjustmentString = "traits__"+traitName+"__sizeAdjustment";
            newTrait.sizeAdjustment = findNearestLowerBenchmark(sizeAdjustmentString, targetCR, sourceStats);
        }
    }

    if (baseTrait.appliesCondition) {
        if (!newTrait.hasOwnProperty("condition")) {
            let conditionString = "traits__"+traitName+"__condition";
            newTrait.condition = findNearestLowerBenchmark(conditionString, targetCR, sourceStats);
        }
    }

    if (baseTrait.dealsDamage) {
        let damageDiceString = 'traits__'+traitName+'__damageDice';
        let damageDieSizeString =  'traits__'+traitName+'__damageDieSize';

        let estimatedDice = scaleDamageRoll(damageDiceString, damageDieSizeString, targetCR, sourceStats);
        newTrait.damageDice = estimatedDice[0];
        newTrait.damageDieSize = estimatedDice[1];
    }

    return newTrait;
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
    return targetString.replace(/(^\s*\w|[\.\!\?]\s*\w)/g,function(c){return c.toUpperCase()});
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
        } else if (token === "castingStatName") {
            let statNames = {
                int: "Intelligence",
                wis: "Wisdom",
                cha: "Charisma"
            }
            tokenValue = statNames[statBlock.castingStat];
        } else if (token === "spellSaveDC") {
            tokenValue = 8 + statBlock.proficiency + statBlock.abilityModifiers[statBlock.castingStat];
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
                } else if (tokenArray[1] == 'size') {
                    let targetSize = statBlock.size;
                    if (trait.sizeAdjustment) {
                        targetSize += trait.sizeAdjustment;
                    }
                    tokenValue = sizes[targetSize].name;
                } else if (tokenArray[1] == 'damage') {
                    let damageDice = trait.damageDice;
                    let damageDieSize = trait.damageDieSize;
                    if (damageDieSize === 1) {
                        tokenValue = damageDice;
                    } else {
                        tokenValue = damageString(damageDice, damageDieSize);
                    }
                } else if (tokenArray[1] == 'spellListText') {
                    let spellList = [];
                    for (let spellId in trait.spellList) {
                        let spell = trait.spellList[spellId];
                        let uses = spell.uses;
                        if (spellList[uses]) {
                            spellList[uses].push(spellId);
                        } else {
                            spellList[uses] = [spellId];
                        }
                    }

                    function formatSpellNames(spellArray) {
                        let output = '';
                        for (let i = 0; i < spellArray.length; i++) {
                            if (output.length) {
                                output += ', ';
                            }
                            output += spells[spellArray[i]].name;
                        }
                        return output;
                    }

                    tokenValue = "<br/><br/>";
                    if (spellList[0]) {
                        tokenValue += "At will: " + formatSpellNames(spellList[0]);
                        tokenValue += "<br/>";
                    }
                    for (let i = spellList.length - 1; i > 0; i--) {
                        if (spellList[i]) {
                            tokenValue += i + '/day' + (spellList[i].length > 1 ? ' each' : '') + ': ' + formatSpellNames(spellList[i]); 
                            tokenValue += "<br/>";
                        }
                    }
                    console.log(spellList);
                }
            } else if (tokenArray[0] == 'pronoun') {
                tokenValue = pronouns[derivedStats.gender][tokenArray[1]];
            }
        }

        outputString = outputString.replace(fullToken, tokenValue);
    } 
    return toSentenceCase(outputString);
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
 * Returns a damage string based on a set of damage dice and a modifier.
 * Eg 1, 4, 1, becomes 3 (1d4 + 1)
 *
 * @param {Number} damageDice The number of damage dice
 * @param {Number} damageDieSize The size of the damage dice
 * @param {Number} [damageBonus=0] The damage modifier (from ability scores, enchantments, etc)
 * @return {string} The damage string
 */
function damageString(damageDice, damageDieSize, damageBonus = 0) {
    let maxDamage = damageDice * damageDieSize + damageBonus;
    //If the attack can't do more than one damage total omit the roll and just show 1 flat damage
    if (maxDamage > 1) {
        if (damageDieSize == 1) {
            return damageDice + damageBonus;
        }
        let output = averageRoll(damageDice, damageDieSize) + damageBonus + ' (' + damageDice + 'd' + damageDieSize;
        if (damageBonus) {
            output += (damageBonus >= 0 ? ' + ' : ' - ' ) + Math.abs(damageBonus);
        }
        output += ')';
        return output;
    } 
    return '1';
}

/**
 * Returns an appropriate damage die size and count to reach an estiamted average damage number
 *
 * @param {Number} targetDamage The target average damage
 * @param {Number} preferredDieSize The preferred die size to return, usually the monster's original damage die. This will be used unless the target number so low a single die is too much, or so high that this would result in an excessive number of dice
 * @return {Array} An array containing number of dice at index 0 and die size at index 1
 */
function findDamageDice(targetDamage, preferredDieSize) {
    //If target damage is too low for a d4 return 1d1
    if (targetDamage < 1.25) {
        return [1,1];
    }
    //For creatures that have a fixed 1d1 at CR 0 use d4 as their preferred die
    preferredDieSize = Math.max(preferredDieSize,4);

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

/**
 * Merges two arrays, creating a new array with the combined values excepting any duplicates
 *
 * @param {Array} array1 The first array to merge
 * @param {Array} array2 The second array to merge
 * @return {Array} An array containing the combined values of arrays 1 and 2 without any duplicates
 */
 function mergeArrays(array1, array2) {
    let output = array1.slice();
    for (let i = 0; i < array2.length; i++) {
        if (!output.includes(array2[i])) {
            output.push(array2[i]);
        }
    }
    return output;
}

/**
 * Recursively merges two objects. This differs from object assign in that it recursively merges child objects of the two params.
 * 
 * The output object will have all fields from both input objects. If both input objects contain a value for a given key the following will occur based on the value's type:
 * Array: The two arrays will be merged using the mergeArrays function.
 * Object: This function will be recursively called on the child objects.
 * All other types: The value of object2 will be used (as with Object.assign)
 *
 * @param {Object} object1 The first object to merge
 * @param {Object} object2 The second object to merge
 * @return {Object} Object containing the merged values of the two input objects
 */
 function mergeObjects(object1, object2) {
    let output = Object.assign({}, object1);
    for (const [key, value] of Object.entries(object2)) {
        if (Array.isArray(value)) {
            if (output.hasOwnProperty(key)) {
                //Merge if both object have a value
                output[key] = mergeArrays(output[key], value);
            } else {
                //If only the second input has it then copy it
                output[key] = value.slice();
            }
        } else if (typeof(value) == 'object') {
            if (output.hasOwnProperty(key)) {
                //Merge if both object have a value
                output[key] = mergeObjects(output[key], value);
            } else {
                //If only the second input has it then copy it
                output[key] = Object.assign({}, value);
            }
        } else {
            output[key] = value;
        }

    }
    return output;
}


/**
 * Converts the current creature's statistic into the XML format used by Fight Club 5e and initiates a download
 */
 function exportFightClub() {
    let cr = $('#cr-select').val();
    let fightClubXML = xmlNode('name', $('#monster-name').html());
    fightClubXML += xmlNode('size', sizes[derivedStats.size].name.substring(0,1));
    fightClubXML += xmlNode('type', derivedStats.type);
    fightClubXML += xmlNode('alignment', derivedStats.alignment);
    fightClubXML += xmlNode('ac', $('#armor-class span').html());
    fightClubXML += xmlNode('hp', $('#hit-points span').html());
    fightClubXML += xmlNode('speed', $('#speed span').html());
    fightClubXML += xmlNode('str', derivedStats.str);
    fightClubXML += xmlNode('dex', derivedStats.dex);
    fightClubXML += xmlNode('con', derivedStats.con);
    fightClubXML += xmlNode('int', derivedStats.int);
    fightClubXML += xmlNode('wis', derivedStats.wis);
    fightClubXML += xmlNode('cha', derivedStats.cha);
    //TODO: Saves
    fightClubXML += xmlNode('save', '');
    fightClubXML += xmlNode('skill', $('#skills span').html());
    fightClubXML += xmlNode('passive', derivedStats.passivePerception);
    fightClubXML += xmlNode('languages', $('#languages span').html());
    fightClubXML += xmlNode('cr', cr);
    fightClubXML += xmlNode('resist', $('#resistances span').html().toLowerCase());
    fightClubXML += xmlNode('immune', $('#immunities span').html().toLowerCase());
    fightClubXML += xmlNode('vulnerable', $('#vulnerabilities span').html().toLowerCase());
    fightClubXML += xmlNode('conditionImmune', $('#condition-immunities span').html().toLowerCase());
    fightClubXML += xmlNode('senses', derivedStats.sensesString);
    for (let traitName in derivedStats.traits) {
        let traitXML = xmlNode('name', derivedStats.traits[traitName].name);
        traitXML += xmlNode('text', derivedStats.traits[traitName].text);
        fightClubXML += xmlNode('trait', traitXML);
    }
    for (let attackName in derivedStats.attacks) {
        let currentAttack = derivedStats.attacks[attackName];
        let attackXML = xmlNode('name', currentAttack.name);
        attackXML += xmlNode('text', currentAttack.text.replace(/<\/?em>/g, '')); //Strip out <em> tags

        let attackString = currentAttack.name + '|';
        attackString += (currentAttack.attackBonus >= 0 ? '+' : '-' ) + Math.abs(currentAttack.attackBonus) + '|';
        attackString += currentAttack.damageDice + 'd' + currentAttack.damageDieSize;
        if (currentAttack.damageBonus) {
            attackString += (currentAttack.damageBonus >= 0 ? '+' : '-' ) + Math.abs(currentAttack.damageBonus);
        }

        attackXML += xmlNode('attack', attackString);
        fightClubXML += xmlNode('action', attackXML);
    }
    for (let bonusActionName in derivedStats.bonusActions) {
        //Fight club XML doesn't appear to supprot bonus actions, so for now we just export them as actions and add a note.
        let bonusActionXML = xmlNode('name', derivedStats.bonusActions[bonusActionName].name + '(Bonus Action)');
        bonusActionXML += xmlNode('text', derivedStats.bonusActions[bonusActionName].text);
        fightClubXML += xmlNode('action', bonusActionXML);
    }
    //TODO: Bonus Actions
    fightClubXML = xmlNode('monster', fightClubXML);
    fightClubXML = "<?xml version='1.0' encoding='utf-8'?>" + xmlNode("compendium", fightClubXML);

    var filename = derivedStats.slug+'-cr-'+cr+'.xml';
    var pom = document.createElement('a');
    var bb = new Blob([fightClubXML], {type: 'text/plain'});

    pom.setAttribute('href', window.URL.createObjectURL(bb));
    pom.setAttribute('download', filename);

    pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':');
    pom.draggable = true; 
    pom.classList.add('dragout');

    pom.click();
}


/**
 * Simple helper function to return an XML node based on a tag and value. Shortcut to save having to type tags twice.
 * 
 * @param {string} tag The xml tag, eg "name"
 * @param {string} value The value to wrap within the tag, eg "Dire Wolf"
 * @return {string} The XML node, eg "<name>Dire Wolf</name>"
 */
 function xmlNode(tag, value) {
    return "<"+tag+">"+value+"</"+tag+">";
 }

 /**
 * Takes a damage (or healing) roll and scales it based on average damage by CR
 * TODO: Add ability score modifiers and use this function for basic attacks as well
 *
 * @param {string} damageDiceString Flattened path to the damage dice attribute, eg attacks__bite__damageDice
 * @param {string} damageDieString Flattened path to the damage die size attribute, eg attacks__bite__damageDieSize
 * @param {string} targetCR The challenge rating to generate the damage for
 * @param {Object} sourceStats The stat block to use for finding damage benchmarks
 * @return {Array} An array containing number of dice at index 0 and die size at index 1
 */
 function scaleDamageRoll(damageDiceString, damageDieSizeString, targetCR, sourceStats) {

    let attributes = [damageDiceString, damageDieSizeString];

    let damageBenchmarks = findBenchmarksForStat(attributes, targetCR, sourceStats);
    for (let benchmark in damageBenchmarks) {
        let currentBenchmark = damageBenchmarks[benchmark];
        currentBenchmark.damagePerRound = averageRoll(currentBenchmark[damageDiceString], currentBenchmark[damageDieSizeString]);
    }

    let estimatedDamage = extrapolateFromBenchmark('damagePerRound', targetCR, damageBenchmarks, false);
    let preferredDieSize = findNearestLowerBenchmark(damageDieSizeString, targetCR, sourceStats);
    
    let estimatedDice = findDamageDice(estimatedDamage, preferredDieSize);
    return estimatedDice;
 }