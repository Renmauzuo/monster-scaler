import { monsterList, monsterSounds } from './data.js';
import { averageStats, traits, mergeObjects, toTitleCase, abilityScoreModifier } from '@toolkit5e/base';
import { scaleMonster } from '@toolkit5e/monster-scaler';
import { setupVariantSelect, renderStatblock, serializeForm, deserializeQuery, populateSelect } from './global.js';

var monsterStats;
window.monsterStats = null;

$(function () {
    populateSelect(monsterList, '#creature');
    deserializeQuery();

    if ($('#wild-shape')[0].checked) {
        $('#wild-shape-wrapper').show();
        $('#legendary').val('0').prop('disabled', true);
    }

    updateAlignmentVisibility();

    $('#wild-shape').on('change', function () {
        if ($(this)[0].checked) {
            $('#wild-shape-wrapper').slideDown();
            $('#legendary').val('0').prop('disabled', true);
        } else {
            $('#wild-shape-wrapper').slideUp();
            $('#legendary').prop('disabled', false);
        }
    });

    //Pretty much any input change means a recalculation
    $('input,select').on('change', calculateSelectedMonster);

    // Update alignment visibility when creature or variant changes
    $('#creature').on('change', updateAlignmentVisibility);
    $(document).on('change', '#variant', updateAlignmentVisibility);

    calculateSelectedMonster();

});

/**
 * Shows or hides the alignment dropdown based on the selected creature's default alignment.
 * Hidden for creatures with alignment "unaligned" since alignment doesn't apply to them.
 */
function updateAlignmentVisibility() {
    let monsterID = $('#creature').val();
    let template = monsterList[monsterID];
    if (template && template.alignment !== 'unaligned') {
        $('#alignment-wrapper').show();
    } else {
        $('#alignment-wrapper').hide();
        $('#alignment').val('');
    }
}

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
    const legendaryVal = parseInt($('#legendary').val());
    if (legendaryVal === 3 || legendaryVal === 5) {
        options.legendary = legendaryVal;
    }

    //Generate a direct link to this specific creature and stat set
    let directLink = location.toString().replace(location.search, "");
    directLink += '?' + serializeForm($('#monster-form'));
    $('#direct-link').attr('href', directLink);

    monsterStats = scaleMonster(monsterID, targetCR, options);
    window.monsterStats = monsterStats;

    //Apply any customizations to the derived statblock
    if (customGender) {
        monsterStats.gender = customGender;
    }

    // Apply alignment override if selected
    let customAlignment = $('#alignment').val();
    if (customAlignment) {
        monsterStats.alignment = customAlignment;
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

        // Apply attack/damage bonuses and rider dice directly to each attack
        const wsAttackBonus = parseInt($('#ws-attack-bonus').val()) || 0;
        const wsDamageBonus = parseInt($('#ws-damage-bonus').val()) || 0;
        const wsRiderDice = parseInt($('#ws-rider-dice').val()) || 0;
        const wsRiderDieSize = parseInt($('#ws-rider-die-size').val()) || 0;
        const wsRiderType = $('#ws-rider-type').val();
        for (const attackKey in monsterStats.attacks) {
            const atk = monsterStats.attacks[attackKey];
            if (wsAttackBonus) atk.bonusAttack = wsAttackBonus;
            if (wsDamageBonus) atk.bonusDamage = wsDamageBonus;
            if (wsRiderDice && !atk.damageRiderDice) {
                atk.damageRiderDice = wsRiderDice;
                atk.damageRiderDieSize = wsRiderDieSize;
                atk.damageRiderType = wsRiderType;
            }
        }


    }

    //Once we have all the stats populate the statblock:
    renderStatblock(monsterStats);

    const sounds = monsterSounds[monsterID];
    if (sounds) {
        $('#sound-list').empty();

        for (let i = 0; i < sounds.length; i ++) {
            const wrapper = $('<div></div>');
            $(`<p>${toTitleCase(sounds[i])}</p>`).appendTo(wrapper);
            $(`<audio controls><source src="sounds/${sounds[i]}.mp3" type="audio/mpeg"></audio>`).appendTo(wrapper);
            wrapper.appendTo('#sound-list');
        }

        $('#sounds').show();
    } else {
        $('#sounds').hide();
    }

}
