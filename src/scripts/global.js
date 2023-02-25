const abilityScores = ["str", "con", "dex", "int", "wis", "cha"]; //For iterating through all ability scores
const numberStrings = ['zero', 'one', 'two', 'three', 'four', 'five'];

$(function () {

    if ($('#creature').length) {
        populateSelect(monsterList, '#creature');
    
        $('#creature').on('change', function () {
            setupVariantSelect(true);
        });
    }

});
 
/**
 * Shows or hides the variant dropdown based on the current monster, and populates it with any variant options.
 *
 * @param {boolean} animated Whether or not to animate the show/hide
 */
function setupVariantSelect(animated) {
    let animationDuration = animated ? 400 : 0;
    let monsterID = $('#creature').val();
    let selectedMonster = monsterList[monsterID];
    if (selectedMonster.variants) {
        $('#variant').empty();
        for (let variant in selectedMonster.variants) {
            $('<option value='+variant+'>'+selectedMonster.variants[variant].name+'</option>').appendTo('#variant');
        }
        $('#variant-wrapper').fadeIn(animationDuration);
    } else {
        $('#variant-wrapper').fadeOut(animationDuration);
    }

    if (selectedMonster.type === typeHumanoid && selectedMonster.race === raceAny) {
        $('#race-wrapper').fadeIn(animationDuration);
    } else {
        $('#race-wrapper').fadeOut(animationDuration);
    }
}

/**
 * Scales the target creature to desired challenge rating. Optionally takes a dictionary of options to customize the creature further.
 *
 * @param {string} monsterID The ID (from data.js) of the mosnter to scale
 * @param {string} targetCR The target CR. Must be a string, not a number.
 * @param {Object} [options] Dictionary of options to customize the statblock
 * @param {string} [options.variant] ID of the chosen variant if this creature has them
 * @param {string} [options.race] The current race if the creature is a humanoid and of an "any race" NPC type
 * @return {Object} The scaled and modified statblock for the target creature
 */
function scaleMonster(monsterID, targetCR, options = {}) {
    let selectedMonster = monsterList[monsterID];
    let numTargetCR = Number(targetCR); //Certain comparisons require a numeric version of the CR
    let selectedVariant;
    if (selectedMonster.variants) {
        selectedVariant = selectedMonster.variants[options.variant];
    }

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
    let derivedStats = {};

    derivedStats.cr = targetCR;
    derivedStats.gender = selectedMonster.gender || 4; //Default to genderless
    
    if (sourceStats[targetCR]) {
        derivedStats = mergeObjects(derivedStats, sourceStats[targetCR]);
    }
    derivedStats = mergeObjects(derivedStats, selectedMonster.lockedStats);
    if (selectedVariant && selectedVariant.lockedStats) {
        derivedStats = mergeObjects(derivedStats, selectedVariant.lockedStats);
    }
    let currentRace;
    if (selectedMonster.type === typeHumanoid) {
        if (selectedMonster.race === raceAny) {
            currentRace = races[options.race];
            derivedStats.type = selectedMonster.type + ' (' + currentRace.name + ')';

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
        }
    } else {
        derivedStats.type = selectedMonster.type;
        if (selectedMonster.subtype) {
            derivedStats.type += ' (' + selectedMonster.subtype + ')';
        }
        $('#race-wrapper').hide();
    }

    derivedStats.proficiency = averageStats[targetCR].proficiency;
    
    //Store some strings in derived stats so they are available outside this scope
    derivedStats.alignment = selectedMonster.alignment;


    //Once we have our locked stats, go through the rest of the states to interpolate or extrapolate based on existing values.
    //All of the preset monster statblocks should be complete, but if we ever add "keyframes" for individual stats it may be possible to have CRs without all stats for a template
    //For this reason we do the interpolation for EACH stat individually, rather than finding the closest statblock to draw from

    //Grab the most appropriate name if this CR doesn't have one
    if (!derivedStats.name) {
        derivedStats.name = findNearestLowerBenchmark("name", targetCR, sourceStats);
    }

    if(!derivedStats.slug) {
        derivedStats.slug = findNearestLowerBenchmark("slug", targetCR, sourceStats);
    }
    derivedStats.appearance = derivedStats.slug; //TODO: Updated for creatures where appearance isn't slug (ie, treants are trees)
    //Description for traits. The creature's proper name if it has one, otherwise "the [slug]"
    derivedStats.description = (derivedStats.unique ? derivedStats.name : 'the ' + derivedStats.slug);

    //Traits require a different approach from some other stats as we take a base from the trait library, but potentially apply modifiers to it based on creature stats.
    //TODO: Adjust for creatures that gain additional traits as they level up
    let lockedTraits = derivedStats.traits;
    derivedStats.traits = {};
    let traitList = [];
    if (selectedMonster.traits) {
        traitList = traitList.concat(selectedMonster.traits);
    }
    if (selectedVariant && selectedVariant.traits) {
        traitList = traitList.concat(selectedVariant.traits); 
    }
    if (currentRace && currentRace.traits) {
        traitList = traitList.concat(currentRace.traits);
    }
    for (let i = 0; i < traitList.length; i++) {
        derivedStats.traits[traitList[i]] = generateTrait(traitList[i], targetCR, sourceStats);
    }
    //Overwrite with any locked attributes (such as spell list)
    if (lockedTraits) {
        derivedStats.traits = mergeObjects(derivedStats.traits, lockedTraits);
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
    for (let i = 0; i < senses.length; i++) {
        let sense = senses[i];
        if (!derivedStats[sense]) {
            derivedStats[sense] = findNearestLowerBenchmark(sense, targetCR, sourceStats);
        }
    }

    return derivedStats;
}

/**
 * Takes a stablock object and renders it to the stablock div on screen
 * Some of the strings this function generates are also used by the FightClub export, but as we always populate the statblock for any creature you can export this is ok (for now)
 * TODO: Rework this to support multiple statblocks by replacing classes with IDs and taking the desired statblock as a param
 * 
 * @param {Object} sourceStats The statblock to display
 */
function renderStatblock(sourceStats) {
    //Create a list of spells available to the creature (via spellcasting, innate spellcasting, or spell like abilities) in case any affect the stateblock
    let availableSpells = [];   
    for (let traitName in sourceStats.traits) {
        let trait = sourceStats.traits[traitName];
        if (trait.spellList) {
            for (let spell in trait.spellList) {
                availableSpells.push(spell);
            }
        }
    }

    //If this is a wildshape we show their name, but also what type of creature this form is in parenthesis. This makes it easier for shapeshifters to track multiple stat blocks.
    $('#monster-name').html((sourceStats.wildShape && sourceStats.defaultName !== sourceStats.name) ? (sourceStats.name + ' (' + sourceStats.defaultName + ')') : sourceStats.name);
    $('#monster-type').html(sizes[sourceStats.size].name + ' ' + sourceStats.type + ', ' + sourceStats.alignment);

    let armorString;
    if (sourceStats.bonusArmor) {
        armorString = (10 + sourceStats.bonusArmor + sourceStats.abilityModifiers.dex) + ' ('+(sourceStats.armorDescription||'Bonus Armor')+')';
    } else {
        armorString = 10 + sourceStats.abilityModifiers.dex;
    }
    if (availableSpells.includes('barkskin')) {
        armorString+= ' (16 with barkskin)';
    }
    $('#armor-class span').html(armorString);

    //Dwarves make HP more complicated
    let bonusHP = sourceStats.abilityModifiers.con * sourceStats.hitDice;
    //Dwarven toughness is only added here so it doesn't change the hit dice of dwarf NPCs
    for (let traitName in sourceStats.traits) {
        let trait = sourceStats.traits[traitName];
        if (trait.hitPointsPerHitDie) {
            bonusHP += trait.hitPointsPerHitDie * sourceStats.hitDice;
        }
    }
    $('#hit-points span').html(damageString(sourceStats.hitDice, sizes[sourceStats.size].hitDie, bonusHP));

    let speedString = "";
    if (sourceStats.speed) {
        speedString = sourceStats.speed + ' ft.';
    }
    if (sourceStats.swim) {
        speedString += (speedString.length ? ', ' : '') + "Swim " + sourceStats.swim + ' ft.';
    }
    if (sourceStats.climb) {
        speedString += (speedString.length ? ', ' : '') + "Climb " + sourceStats.climb + ' ft.';
    }
    if (sourceStats.burrow) {
        speedString += (speedString.length ? ', ' : '') + "Burrow " + sourceStats.burrow + ' ft.';
    }
    if (sourceStats.fly) {
        speedString += (speedString.length ? ', ' : '') + "Fly " + sourceStats.fly + ' ft.';
    }
    $('#speed span').html(speedString);

    for (let i = 0; i < abilityScores.length; i++) {
        let abilityScore = abilityScores[i];
        let modifier = abilityScoreModifier(sourceStats[abilityScore]);
        let modifierString = "(" + (modifier >= 0 ? '+' : '') + modifier + ")";
       $('#monster-'+abilityScore).html(sourceStats[abilityScore] + " " + modifierString);
    }

    //TODO: When we add homebrow monsters we may need to account for creatures that gain new skills as they go up in CR.
    if (sourceStats.skills) {
        $('#skills').show();
        let skillString = "";
        for (let skill in sourceStats.skills) {
            if (skillString.length) {
                skillString += ', ';
            }
            let skillModifier = sourceStats.proficiency*sourceStats.skills[skill] + sourceStats.abilityModifiers[skills[skill].ability];
            let modifierString = (skillModifier >= 0 ? '+' : '') + skillModifier;
            skillString+= (skills[skill].name || toSentenceCase(skill)) + ' ' + modifierString;
        }
        $('#skills span').html(skillString);
    } else {
        $('#skills').hide();
    }

    if (sourceStats.vulnerabilities) {
        let vulnerabilitiesString = "";
        for (let i = 0; i < sourceStats.vulnerabilities.length; i++) {
            if (i) {
                vulnerabilitiesString += ', ';
            }
            vulnerabilitiesString += toSentenceCase(sourceStats.vulnerabilities[i]);
        }
        $('#vulnerabilities span').html(vulnerabilitiesString);
        $('#vulnerabilities').show();
    } else {
        $('#vulnerabilities').hide();
    }

    if (sourceStats.resistances) {
        let resistancesString = "";
        for (let i = 0; i < sourceStats.resistances.length; i++) {
            if (i) {
                resistancesString += ', ';
            }
            resistancesString += toSentenceCase(sourceStats.resistances[i]);
        }
        $('#resistances span').html(resistancesString);
        $('#resistances').show();
    } else {
        $('#resistances').hide();
    }

    if (sourceStats.immunities) {
        let immunitiesString = "";
        for (let i = 0; i < sourceStats.immunities.length; i++) {
            if (i) {
                immunitiesString += ', ';
            }
            immunitiesString += toSentenceCase(sourceStats.immunities[i]);
        }
        $('#immunities span').html(immunitiesString);
        $('#immunities').show();
    } else {
        $('#immunities').hide();
    }

    if (sourceStats.conditionImmunities) {
        let conditionImmunitiesString = "";
        for (let i = 0; i < sourceStats.conditionImmunities.length; i++) {
            if (i) {
                conditionImmunitiesString += ', ';
            }
            conditionImmunitiesString += toSentenceCase(sourceStats.conditionImmunities[i]);
        }
        $('#condition-immunities span').html(conditionImmunitiesString);
    } else {
        $('#condition-immunities').hide();
    }

    let sensesString = "";
    for (let i = 0; i < senses.length; i++) {
        let sense = senses[i];
        if (sourceStats[sense]) {
            sensesString += sensesString.length ? ', ' : '';
            sensesString += sense + " " + sourceStats[sense] + ' ft.'
        }
    }

    sourceStats.sensesString = sensesString; //Need to store this without passive perception added as Fight Club tracks that separately
    sensesString += sensesString.length ? ', ' : '';
    sourceStats.passivePerception = (10 + sourceStats.abilityModifiers.wis + (sourceStats.skills && sourceStats.skills.hasOwnProperty('perception') ? sourceStats.proficiency : 0));
    sensesString += 'passive Perception ' + sourceStats.passivePerception;
    $('#senses span').html(sensesString);

    //TODO: Adjust this for creatures with no CR (eg sidekicks, certain summons)
    $('#challenge-rating span').html(stringForCR(sourceStats.cr) + ' (' + averageStats[sourceStats.cr].xp.toLocaleString() + ' XP)');

    $('#traits').empty();
    if (sourceStats.traits) {
        for (let traitName in sourceStats.traits) {
            let currentTrait = sourceStats.traits[traitName];
            currentTrait.text = replaceTokensInString(currentTrait.description, sourceStats, currentTrait); //save the output text for Fight Club
            $('<p><strong><em>'+currentTrait.name+'.</em></strong> '+currentTrait.text+'</p>').appendTo('#traits');
        }
    }

    if (sourceStats.extraLanguages) {
        sourceStats.languages = sourceStats.languages || [];
        sourceStats.languages.push("any " + numberStrings[sourceStats.extraLanguages] + ' language' + (sourceStats.extraLanguages === 1 ? ' (usually Common)' : ''));
    }
    if (sourceStats.languages) {
        let languagesString = "";
        for (let i = 0; i < sourceStats.languages.length; i++) {
            if (i) {
                languagesString += ', ';
            }
            languagesString += sourceStats.languages[i];
        }
        $('#languages span').html(languagesString).show();
    } else {
        $('#languages').hide();
    }

    $('#attacks').empty();
    if (sourceStats.multiattack) {
        let multiattackString;
        if (Object.keys(sourceStats.multiattack.attacks).length > 1) {
            //Text reads differently if there are multiple different attack types
            let attackCount = 0;
            multiattackString = "";
            let attacks = Object.keys(sourceStats.multiattack.attacks);
            for (let i = 0; i < attacks.length; i++) {
                attackCount += sourceStats.multiattack.attacks[attacks[i]];
                multiattackString += numberStrings[sourceStats.multiattack.attacks[attacks[i]]] + ' with its ' + sourceStats.attacks[attacks[i]].name.toLowerCase();
                if (i < attacks.length - 2) {
                    //Separate attacks with commas
                    multiattackString += ', ';
                } else if (i == attacks.length - 2) {
                    //Add "and" before last attack. Add an oxford comma, but only if there are more than two types of attacks.
                    multiattackString += (attacks.length > 2 ? ',' : '') + ' and ';
                }
            }
            multiattackString = toSentenceCase(sourceStats.description) + ' makes ' + numberStrings[attackCount] + ' attacks:' + multiattackString + '.';
            if (sourceStats.multiattack.requireDifferentTargets) {
                //This may need to change if a creature with more than two attacks ever gets this attribute, but for now it's fine as is as only the t rex has this restriction
                multiattackString+= ' It can&rsquo;t make both attacks against the same target.';
            }
        } else {
            let attack = Object.keys(sourceStats.multiattack.attacks)[0];
            multiattackString = toSentenceCase(sourceStats.description) + ' makes ' + numberStrings[sourceStats.multiattack.attacks[attack]] + ' ' + sourceStats.attacks[attack].name.toLowerCase() + ' attacks.';
        }
        //Store the string for fight club
        sourceStats.multiattackString = multiattackString;
        $('<p><strong>Multiattack:</strong>'+multiattackString+'</p>').appendTo('#attacks');
        
    }
    if (sourceStats.attacks) {
        for (let attack in sourceStats.attacks) {
            let currentAttack = sourceStats.attacks[attack];
            let abilityModifier;
            if (currentAttack.finesse) {
                abilityModifier = Math.max(sourceStats.abilityModifiers.str, sourceStats.abilityModifiers.dex);
            } else if (currentAttack.spellAttack) {
                abilityModifier = sourceStats.abilityModifiers[sourceStats.castingStat];
            } else {
                abilityModifier = sourceStats.abilityModifiers.str;
            }
            let shillelagh = false;
            if (availableSpells.includes('shillelagh') && attack === 'club' || attack ==='quarterstaff') {
                shillelagh = true;
            }

            //Save some things for Fight Club export
            currentAttack.attackBonus = sourceStats.proficiency + abilityModifier;
            currentAttack.damageBonus = abilityModifier;
            if (sourceStats.wildShape) {
                //TODO: Handle these differently
                currentAttack.attackBonus += parseInt($('#ws-attack-bonus').val());
                currentAttack.damageBonus += parseInt($('#ws-damage-bonus').val());
            }
            
            let attackString = '<em>' + (currentAttack.ranged ? 'Ranged' : 'Melee') + ' ' + (currentAttack.spellAttack ? 'Spell' : 'Weapon') + ' Attack:</em> ';
            let rangeString;
            if (currentAttack.ranged) {
                rangeString = 'range ' + currentAttack.range + (currentAttack.longRange ? '/' + currentAttack.longRange : '');
            } else {
                rangeString = 'reach ' + sizes[sourceStats.size].reach[currentAttack.reach];
            }
            //Monster stat blocks never have negative to hit, so we set 0 as the minimum
            attackString += '+' + Math.max(currentAttack.attackBonus, 0) + ' to hit';
            if(shillelagh) {
                attackString += ' (+' + (sourceStats.proficiency + sourceStats.abilityModifiers[sourceStats.castingStat]) + ' to hit with shillelagh)';
            }

            attackString += ', ' + rangeString+ ' ft., ';
            if (currentAttack.proneOnly) {
                attackString += 'one prone creature';
            } else if (currentAttack.creatureOnly) {
                attackString += 'one creature;'
            } else {
                attackString += 'one target';
            }
            attackString += (currentAttack.notGrappled ? ' not grappled by ' + sourceStats.description : '') + '. '
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

            if (shillelagh) {
                attackString += ', or ' + damageString(currentAttack.damageDice, 8, sourceStats.abilityModifiers[sourceStats.castingStat]) + ' with shillelagh'
            }

            //Add riders and procs
            if (currentAttack.damageRiderDice) {
                attackString += ' plus ' + damageString(currentAttack.damageRiderDice, currentAttack.damageRiderDieSize) + ' ' + currentAttack.damageRiderType + ' damage';
            }
            let wsRiderDice = parseInt($('#ws-rider-dice').val());
            if (sourceStats.wildShape && wsRiderDice) {
                attackString += ' plus ' + damageString(wsRiderDice, parseInt($('#ws-rider-die-size').val())) + ' ' + $('#ws-rider-type').val() + ' damage';
            } 
            attackString += '.';
            if (currentAttack.generatedProc) {
                attackString+= ' ' + replaceTokensInString(currentAttack.generatedProc.description, sourceStats, currentAttack.generatedProc);
            }
            currentAttack.text = attackString; //Save text for Fight Club
            $('<p><strong>'+currentAttack.name+'</strong> '+attackString+'</p>').appendTo('#attacks');
        }
    }

    if (sourceStats.actions) {
        for (let actionName in sourceStats.actions) {
            let currentAction = sourceStats.actions[actionName];
            currentAction.text = replaceTokensInString(currentAction.description, sourceStats, currentAction); //save the output text for Fight Club
            $('<p><strong><em>'+currentAction.name+'.</em></strong> '+currentAction.text+'</p>').appendTo('#attacks');
        }
    }

    if (sourceStats.bonusActions) {
        $('#bonus-actions').empty();
        $('#bonus-actions-wrapper').show();
        for (let bonusActionName in sourceStats.bonusActions) {
            let currentBonusAction = sourceStats.bonusActions[bonusActionName];
            currentBonusAction.text = replaceTokensInString(currentBonusAction.description, sourceStats, currentBonusAction); //save the output text for Fight Club
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

                    tokenValue = "<span class='trait-spacer'></span>";
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
                }
            } else if (tokenArray[0] == 'pronoun') {
                tokenValue = pronouns[statBlock.gender][tokenArray[1]];
            }
        }

        outputString = outputString.replace(fullToken, tokenValue);
    } 
    return toSentenceCase(outputString);
 }

 /**
 * Recursively flattens an object. ie, {x: {y:5}, z: 10} would become {x__y : 5, z : 10}
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
 * Converts a creature's statistic into the XML format used by Fight Club 5e and initiates a download
 * TODO: Values pulled from the statblock div should be saved to the statblock object and pulled from there instead
 * @param {Object} statblock The statblock to convert to XML
 */
function exportFightClub(statblock) {
    let cr = $('#target-cr').val();
    let fightClubXML = xmlNode('name', $('#monster-name').html());
    fightClubXML += xmlNode('size', sizes[statblock.size].name.substring(0,1));
    fightClubXML += xmlNode('type', statblock.type);
    fightClubXML += xmlNode('alignment', statblock.alignment);
    fightClubXML += xmlNode('ac', $('#armor-class span').html());
    fightClubXML += xmlNode('hp', $('#hit-points span').html());
    fightClubXML += xmlNode('speed', $('#speed span').html());
    fightClubXML += xmlNode('str', statblock.str);
    fightClubXML += xmlNode('dex', statblock.dex);
    fightClubXML += xmlNode('con', statblock.con);
    fightClubXML += xmlNode('int', statblock.int);
    fightClubXML += xmlNode('wis', statblock.wis);
    fightClubXML += xmlNode('cha', statblock.cha);
    //TODO: Saves
    fightClubXML += xmlNode('save', '');
    fightClubXML += xmlNode('skill', $('#skills span').html());
    fightClubXML += xmlNode('passive', statblock.passivePerception);
    fightClubXML += xmlNode('languages', $('#languages span').html());
    fightClubXML += xmlNode('cr', cr);
    fightClubXML += xmlNode('resist', $('#resistances span').html().toLowerCase());
    fightClubXML += xmlNode('immune', $('#immunities span').html().toLowerCase());
    fightClubXML += xmlNode('vulnerable', $('#vulnerabilities span').html().toLowerCase());
    fightClubXML += xmlNode('conditionImmune', $('#condition-immunities span').html().toLowerCase());
    fightClubXML += xmlNode('senses', statblock.sensesString);
    for (let traitName in statblock.traits) {
        let traitXML = xmlNode('name', statblock.traits[traitName].name);
        traitXML += xmlNode('text', statblock.traits[traitName].text);
        fightClubXML += xmlNode('trait', traitXML);
    }
    if (statblock.multiattack) {
        let multiattackXML = xmlNode('name', "Multiattack");
        multiattackXML += xmlNode('text', statblock.multiattackString);
        fightClubXML += xmlNode('action', multiattackXML);
    }
    for (let attackName in statblock.attacks) {
        let currentAttack = statblock.attacks[attackName];
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
    for (let bonusActionName in statblock.bonusActions) {
        //Fight club XML doesn't appear to supprot bonus actions, so for now we just export them as actions and add a note.
        let bonusActionXML = xmlNode('name', statblock.bonusActions[bonusActionName].name + ' (Bonus Action)');
        bonusActionXML += xmlNode('text', statblock.bonusActions[bonusActionName].text);
        fightClubXML += xmlNode('action', bonusActionXML);
    }
    //TODO: Bonus Actions
    fightClubXML = xmlNode('monster', fightClubXML);
    fightClubXML = "<?xml version='1.0' encoding='utf-8'?>" + xmlNode("compendium", fightClubXML);

    var filename = statblock.slug+'-cr-'+cr+'.xml';
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

/**
 * Serializes a form by turning all of its inputs into a query string. 
 * This custom method is used in place of the native JQuery one to avoid including hidden inputs.
 * 
 * @param {Object} $form The form to serialize
 * @return {string} The serialized query string
 */
function serializeForm($form) {
    let output = '';
    $form.find('select:visible').each(function () {
        let value = $(this).val();
        //Some selects default to 0 so we can comfortably skip it
        if (value && value.length && value !== '0') {
            output += '&' + $(this).attr('id') + '=' + value;
        }
    });

    $form.find('input:visible:not([type="checkbox"])').each(function () {
        let value = $(this).val();
        if (value) {
            output += '&' + $(this).attr('id') + '=' + value;
        }
    });

    //No need for a value for checkboxes, just including the id if they are checked is enough
    $form.find('input:visible:checked').each(function () {
        output += '&' + $(this).attr('id');
    });

    //Trim the first &
    output = output.replace('&', '');

    return output;
}

/**
 * Populates a select with entries from an object.
 * 
 * @param {object} dataSource The source object
 * @param {string} selector The query selector for the select to populate
 */
function populateSelect(dataSource, selector) {
    for (let key in dataSource) {
        $('<option value='+key+'>'+(dataSource[key].name || toSentenceCase(key))+'</option>').appendTo(selector);
    }
}