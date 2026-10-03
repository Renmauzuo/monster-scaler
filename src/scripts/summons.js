import { summonSpirit, summons } from '@toolkit5e/monster-scaler';
import { toTitleCase } from '@toolkit5e/base';
import { renderStatblock, serializeForm, deserializeQuery } from './global.js';

var summonStats;
window.summonStats = null;

$(function () {
    // Populate the summon spell dropdown
    for (const key in summons) {
        $('<option value="' + key + '">' + summons[key].spellName + '</option>').appendTo('#summon-select');
    }

    deserializeQuery();

    $('#summon-select').on('change', setupOptionSelect);
    $('input,select').on('change', calculateSummon);

    calculateSummon();
});

/**
 * Populates the option (subtype) dropdown for the selected summon, and enforces
 * the spell's minimum level on the spell-level input.
 * @param {boolean} [animated] Unused; present for data-on-change compatibility.
 */
function setupOptionSelect() {
    const summonID = $('#summon-select').val();
    const spirit = summons[summonID];
    if (!spirit) return;

    const currentOption = $('#summon-option').val();
    $('#summon-option').empty();
    for (const optionKey in spirit.options) {
        $('<option value="' + optionKey + '">' + spirit.options[optionKey].name + '</option>').appendTo('#summon-option');
    }
    // Preserve the current option if it still exists for this summon
    if (currentOption && spirit.options[currentOption]) {
        $('#summon-option').val(currentOption);
    }

    // Enforce the minimum spell level
    const levelInput = $('#spell-level');
    levelInput.attr('min', spirit.minLevel);
    if (parseInt(levelInput.val()) < spirit.minLevel) {
        levelInput.val(spirit.minLevel);
    }
    $('#min-level').text(spirit.minLevel);
}

/**
 * Resolves the selected summon into a statblock and renders it, updating the direct link.
 */
function calculateSummon() {
    const summonID = $('#summon-select').val();
    const spirit = summons[summonID];
    if (!spirit) return;

    // Make sure the option list matches the current summon before reading it
    if (!$('#summon-option option').length || !spirit.options[$('#summon-option').val()]) {
        setupOptionSelect();
    }

    const optionKey = $('#summon-option').val();
    const spellLevel = Math.max(spirit.minLevel, parseInt($('#spell-level').val()) || spirit.minLevel);
    const spellAttackModifier = parseInt($('#spell-attack').val()) || 0;
    const spellSaveDC = parseInt($('#spell-dc').val()) || 8;

    // Keep the level input in sync if it was clamped
    $('#spell-level').val(spellLevel);

    // Direct link with current selections
    let directLink = location.toString().replace(location.search, '');
    directLink += '?' + serializeForm($('#summon-form'));
    $('#direct-link').attr('href', directLink);

    summonStats = summonSpirit(summonID, optionKey, { spellLevel, spellAttackModifier, spellSaveDC });
    window.summonStats = summonStats;
    // global.js export helpers read window.monsterStats
    window.monsterStats = summonStats;

    renderStatblock(summonStats);
}

// Referenced by data-on-change and used to repopulate options on load
window.setupOptionSelect = setupOptionSelect;
