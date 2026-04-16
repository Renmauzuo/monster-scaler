import { monsterList, monsterSounds } from './data.js';
import { averageStats, traits, mergeObjects, toTitleCase, abilityScoreModifier } from '@toolkit5e/base';
import { scaleMonster } from '@toolkit5e/monster-scaler';
import { setupVariantSelect, renderStatblock, serializeForm, deserializeQuery, populateSelect } from './global.js';
import { initResourceTracker, clearInstanceKeys } from './resource-tracker.js';

var monsterStats;
window.monsterStats = null;

$(function () {
    populateSelect(monsterList, '#creature');
    deserializeQuery();

    if ($('#wild-shape')[0].checked) {
        $('#wild-shape-wrapper').show();
        $('#legendary').val('0').prop('disabled', true);
    }


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

    // --- Resource Tracker ---
    const quantity = parseInt(document.getElementById('tracker-quantity').value, 10) || 1;
    const instancesContainer = document.getElementById('resource-tracker-instances');

    // Clean up stale localStorage for the previous monster
    if (window._rtPrevSlug) {
      clearInstanceKeys(window._rtPrevSlug, window._rtPrevCr);
    }
    window._rtPrevSlug = monsterStats.slug ?? monsterStats.name;
    window._rtPrevCr = monsterStats.cr ?? '0';

    // Reset round counter
    document.getElementById('rt-round-display').textContent = 'Round 1';
    window._rtRound = 1;

    // Create tracker instances
    instancesContainer.innerHTML = '';
    window._rtTrackers = [];
    for (let i = 1; i <= quantity; i++) {
      const el = document.createElement('div');
      el.className = 'resource-tracker';
      instancesContainer.appendChild(el);
      window._rtTrackers.push(initResourceTracker(monsterStats, el, i));
    }

    // Wire page-level buttons (re-wire on each monster change)
    document.getElementById('rt-btn-round').onclick = () => {
      window._rtTrackers.forEach(t => t.applyRound());
      window._rtRound = (window._rtRound || 1) + 1;
      document.getElementById('rt-round-display').textContent = 'Round ' + window._rtRound;
    };
    document.getElementById('rt-btn-short-rest').onclick = () => {
      window._rtTrackers.forEach(t => t.applyShortRest());
    };
    document.getElementById('rt-btn-long-rest').onclick = () => {
      window._rtTrackers.forEach(t => t.applyLongRest());
    };

    // Wire quantity input to tear down and recreate instances
    document.getElementById('tracker-quantity').onchange = () => {
      const newQty = parseInt(document.getElementById('tracker-quantity').value, 10) || 1;
      clearInstanceKeys(window._rtPrevSlug, window._rtPrevCr);
      instancesContainer.innerHTML = '';
      window._rtTrackers = [];
      for (let i = 1; i <= newQty; i++) {
        const el = document.createElement('div');
        el.className = 'resource-tracker';
        instancesContainer.appendChild(el);
        window._rtTrackers.push(initResourceTracker(monsterStats, el, i));
      }
    };

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
