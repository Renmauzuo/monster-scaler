let sidekickStats;
$(function () {
    populateSelect(monsterList, '#creature');
    populateSelect(sidekickClasses, '#class');
    deserializeQuery();

    //Pretty much any input change means a recalculation
    $('input,select').on('change', buildSelectedSidekick);
    buildSelectedSidekick();

});

function buildSelectedSidekick() {
    let monsterID = $('#creature').val();
    let customName = $('#name').val();
    let customGender = parseInt($('#gender').val());
    let level = parseInt($('#level').val());
    let classID = $('#class').val();
    let selectedClass = sidekickClasses[classID];

    //Gather up options to pass to the calculator
    let options = {};
    if ($('#variant').is(':visible')) {
        options.variant = $('#variant').val();
    }
    if ($('#race-select').is(':visible')) {
        options.race = $('#race-select').val();
    }

    //Generate a direct link to this specific creature and stat set
    let directLink = location.toString().replace(location.search, "");
    directLink += '?' + serializeForm($('#sidekick-form'));
    $('#direct-link').attr('href', directLink);

    sidekickStats = scaleMonster(monsterID, '0.5', options);

    //Delete the sidekick's CR, since sidekicks do not have a challenge rating
    delete sidekickStats.cr;

    //Adjust for sidekick level
    sidekickStats.hitDice += level;
    sidekickStats.proficiency = averageStats[level].proficiency;

    //Disable any skills the sidekick already has in the "bonus proficiencies" select
    $('#bonus-skills option').attr('disabled', false);
    for (let skill in sidekickStats.skills) {
        $('#bonus-skills option[value='+skill+']').attr('disabled', true);
    }

    let bonusSkills = $('#bonus-skills').val();
    if (bonusSkills.length) {
        sidekickStats.skills = sidekickStats.skills || [];
        for (let i = 0; i < bonusSkills.length; i++) {
            let skill = bonusSkills[i];
            if (!sidekickStats.skills[skill]) {
                sidekickStats.skills[skill] = 1;
            }
        }
    }

    let bonusSave = $('#bonus-save').val();
    if (bonusSave && bonusSave.length) {
        sidekickStats.saves = sidekickStats.saves || [];
        sidekickStats.saves.push(bonusSave);
    }

    //Apply any customizations to the derived statblock
    if (customGender) {
        sidekickStats.gender = customGender;
    }

    if (customName) {
        //If there's a custom name assign that.
        //No need to save the original name like we do for mosnters since there are no wild shapes here
        sidekickStats.name = customName;
        sidekickStats.description = customName;
    } else {
        sidekickStats.name = toSentenceCase(classID) + ' (' + sidekickStats.name + ')';
        sidekickStats.description = 'the ' + classID;
    }

    let asiFilter = selectedClass.asi.filter(function (x) {
        return x <= level;
    });
    //2 ASI points per level that gives an ASI
    let asiCount = asiFilter.length * 2;
    //Calculate the max of each asi input. This is based on how many ASI points are available, as well as the creature's ability scores (since the cap is 20)
    if (asiCount) {
        //Before we begin we need to calculate how many points are already spent
        let asiSpent = 0;
        $('#asi-wrapper input').each(function () {
            asiSpent += parseInt($(this).val());
        });
        let asiAvailable = asiCount - asiSpent;
        $('#asi-points').html(asiAvailable);
        asiAvailable != 1 ? $('#asi-plural').show() : $('#asi-plural').hide();

        $('#asi-wrapper input').each(function () {
            let ability = $(this).data('ability');
            let currentValue = parseInt($(this).val());
            
            //First determine the absolute max based on the creature's ability score
            //Unlikely for a CR 1/2 creature to have over 20 in a stat but y'never know
            let abilityMax = Math.max(0, 20 - sidekickStats[ability]);
            
            //The second possible max is the number of available points PLUS any already spent on this ability
            let asiMax = asiAvailable + currentValue;

            $(this).attr('max', Math.min(abilityMax, asiMax));
            $('#asi-'+ability+'-current span').html(currentValue);

            //While we're here add the ability to the statblock
            sidekickStats[ability] += currentValue;
            sidekickStats.abilityModifiers[ability] = abilityScoreModifier(sidekickStats[ability]);
        });
    }

    let earnedFeatures = selectedClass.features.filter(function (x) {
        return x.level <= level;
    });
    for (let i = 0; i < earnedFeatures.length; i++) {
        let feature = earnedFeatures[i];
        if (feature.trait) {
            sidekickStats.traits[feature.trait] = traits[feature.trait];
            if (feature.options) {
                let value = $('#'+feature.trait).val();
                feature.optionResult(sidekickStats, value);
            }
        }
    }

    //Apply role bonuses
    if ($('#role').is(':visible')) {
        let selectedRole = selectedClass.roles[$('#role').val()];
        if (selectedRole.merge) {
            sidekickStats = mergeObjects(sidekickStats, selectedRole.merge);
        }
    }

    //Once we have all the stats populate the statblock:
    renderStatblock(sidekickStats);
}

/**
 * Makes changes to the form based on selected class:
 * Shows or hides the role dropdown based on the current class, and populates it with any role options.
 * Updates the list of bonus proficiencies
 *
 * @param {boolean} animated Whether or not to animate the show/hide
 */
function onClassChange(animated) {
    let animationDuration = animated ? 400 : 0;
    let classID = $('#class').val();
    let selectedClass = sidekickClasses[classID];

    if (selectedClass.roles) {
        $('#role').empty();
        populateSelect(selectedClass.roles, '#role');
        $('#role-wrapper').fadeIn(animationDuration);
    } else {
        $('#role-wrapper').fadeOut(animationDuration);
    }

    $('#bonus-skills').empty().data('limit', selectedClass.bonusProficiencies.count);
    $('#bonus-skill-count').html(selectedClass.bonusProficiencies.count);
    if (selectedClass.bonusProficiencies.skills) {
        for (let i = 0; i < selectedClass.bonusProficiencies.skills.length; i++) {
            let key = selectedClass.bonusProficiencies.skills[i];
            $('<option value='+key+'>'+(skills[key].name || toSentenceCase(key))+'</option>').appendTo('#bonus-skills');
        }
    } else {
        //If there's no list of skills use all
        populateSelect(skills, '#bonus-skills');
    }

    $('#bonus-save').empty();
    for (let i = 0; i < selectedClass.bonusProficiencies.saves.length; i++) {
        let key = selectedClass.bonusProficiencies.saves[i];
        $('<option value='+key+'>'+abilities[key].name+'</option>').appendTo('#bonus-save');
    }

    //Delete old feature inputs when changing class
    $('#class-features').empty();
    //Create new class feature inputs if necessary
    for (let i = 0; i < selectedClass.features.length; i++) {
        let feature = selectedClass.features[i];
        if (feature.options) {
            let traitId = feature.trait;
            let $wrapper = $('<div data-level='+feature.level+'></div>');
            $('<label for='+traitId+'>'+traits[traitId].name+'</label>').appendTo($wrapper);

            let $select = $('<select id='+traitId+' name='+traitId+' data-result='+feature.optionResult+'></select>');
            for (let i = 0; i < feature.options.length; i++) {
                let option = feature.options[i];
                $('<option>'+option+'</option>').appendTo($select);
            }
            $select.appendTo($wrapper);

            //See if there's a query param for this new input
            let params = new URLSearchParams(location.search);
            let value = params.get(traitId);
            if (value) {
                $select.val(value);
            }

            $wrapper.appendTo('#class-features');
        }
    }
}

/**
 * Handles certain changes based on character level, such as showing and hiding inputs for class specific features
 *
 * @param {boolean} animated Whether or not to animate the show/hide
 */
function onLevelChange(animated) {
    let animationDuration = animated ? 400 : 0;
    let level = parseInt($('#level').val());
    let classID = $('#class').val();
    let selectedClass = sidekickClasses[classID];
    //Show ASI inputs if sidekick qualifies
    //While different classes get ASIs at different levels, getting the first one at 4 is pretty universal
    if (level >= 4) {
        $('#asi-wrapper').slideDown(animationDuration);
    } else {
        $('#asi-wrapper').slideUp(animationDuration);
    }
    //Range max will also be adjusted, but that can't be done until after the monster is scaled, since we need its ability scores to determine the cap
    //This is just done here so the ASI Wrapper is shown/hidden appropriately on page load based on the query params

    //Update features based on new level
    $('[data-level]').each(function () {
        if ($(this).data('level') > level) {
            $(this).slideUp(animated);
        } else {
            $(this).slideDown(animated);            
        }
    });
}
