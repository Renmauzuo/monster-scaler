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
    let targetCR = $('#target-cr').val();
    let wildShape = $('#wild-shape')[0].checked;
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
    directLink += '?' + serializeForm($('#monster-form'));
    $('#direct-link').attr('href', directLink);

    monsterStats = scaleMonster(monsterID, targetCR, options);

    //Apply any customizations to the derived statblock
    if (customGender) {
        monsterStats.gender = customGender;
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

    //Apply wildshape modifiers if any
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
        if ($('#magic-attacks')[0].checked) {
            wildShapeStats.traits = {
                magicAttacks : traits.magicAttacks
            }
        }
        monsterStats = mergeObjects(monsterStats, wildShapeStats);
        monsterStats.proficiency = averageStats[$('#player-level').val()].proficiency;
        monsterStats.wildShape = wildShape;
        monsterStats.bonusArmor += parseInt($('#ws-ac-bonus').val());

    }

    //Once we have all the stats populate the statblock:
    renderStatblock(monsterStats);

}
