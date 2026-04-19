import { abilities, abilityScoreModifier } from '@toolkit5e/base';
import { renderStatblock } from './global.js';

let inputStats;
$(function () {
    $('#statblock-input').on('input', renderInput);
});

/**
 * Parses the JSON input, computes ability modifiers, and renders the statblock.
 */
function renderInput() {
    inputStats = JSON.parse($('#statblock-input').val());

    inputStats.abilityModifiers = inputStats.abilityModifiers || {};
    for (let ability in abilities) {
        let modifier = abilityScoreModifier(inputStats[ability]);
        //Save the ability modifiers if the statblock hasn't already done that
        inputStats.abilityModifiers[ability] = modifier;
    }

    window.monsterStats = inputStats;
    renderStatblock(inputStats);
};