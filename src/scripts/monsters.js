var monsterStats;

$(function () {
    populateSelect(monsterList, '#creature');
    deserializeQuery();

    if ($('#wild-shape')[0].checked) {
        $('#wild-shape-wrapper').show();
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
    //Description for traits. The creature's proper name if it has one, otherwise "the [slug]"
    monsterStats.description = (monsterStats.unique ? monsterStats.name : 'the ' + monsterStats.slug);

    //Apply wildshape modifiers if any
    if (wildShape) {
        //Override int, wis, and cha if this is a wild shape
        let wildShapeStats = {
            int: $('#player-int').val(),
            wis: $('#player-wis').val(),
            cha: $('#player-cha').val()
        }
        
        //Recalculate int, wis, and cha modifiers
        wildShapeStats.abilityModifiers = {};
        wildShapeStats.abilityModifiers.int = abilityScoreModifier(wildShapeStats.int);
        wildShapeStats.abilityModifiers.wis = abilityScoreModifier(wildShapeStats.wis);
        wildShapeStats.abilityModifiers.cha = abilityScoreModifier(wildShapeStats.cha);

        if ($('#ws-resists').val().length) {
            wildShapeStats.resistances = $('#ws-resists').val();
        }
        if ($('#ws-immunities').val().length) {
            wildShapeStats.immunities = $('#ws-immunities').val();
        }
        if ($('#ws-condition-immunities').val().length) {
            wildShapeStats.conditionImmunities = $('#ws-condition-immunities').val();
        }
        if ($('#ws-saves').val().length) {
            wildShapeStats.saves = $('#ws-saves').val();
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
        monsterStats.saveBonus = parseInt($('#ws-save-bonus').val());
        monsterStats.bonusHP = parseInt($('#ws-hp-bonus').val());


    }

    //Once we have all the stats populate the statblock:
    renderStatblock(monsterStats);

}
