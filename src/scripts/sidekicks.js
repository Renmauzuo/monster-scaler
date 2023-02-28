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
    if (bonusSave.length) {
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

}
