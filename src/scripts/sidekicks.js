let sidekickStats;
$(function () {
    populateSelect(sidekickClasses, '#class');

    if (location.search.length) {
        let params = new URLSearchParams(location.search);

        //Skip variant at first because it must come after monster
        $('select:not(#variant,#role)').each(function () {
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

        //Need to do this after monster is selected, but before variant is selected
        setupVariantSelect(false);
        //Select the variant if it has one
        let paramsVariant = params.get('variant');
        if (paramsVariant && $('#variant option[value="'+paramsVariant+'"]').length) {
            $('#variant').val(paramsVariant);
        }

        //Need to do this after class is selected, but before role is selected
        setupRoleSelect(false);
        //Select the variant if it has one
        let paramsRole = params.get('role');
        if (paramsRole && $('#role option[value="'+paramsRole+'"]').length) {
            $('#role').val(paramsRole);
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
    }

    $('#class').on('change', function () {
        setupRoleSelect(true);
    });

    //Pretty much any input change means a recalculation
    $('input,select').on('change', buildSelectedSidekick);

    buildSelectedSidekick();

});

function buildSelectedSidekick() {
    let monsterID = $('#creature').val();
    let customName = $('#name').val();
    let customGender = parseInt($('#gender').val());

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
 * Shows or hides the role dropdown based on the current class, and populates it with any role options.
 *
 * @param {boolean} animated Whether or not to animate the show/hide
 */
function setupRoleSelect(animated) {
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
}