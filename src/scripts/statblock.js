let inputStats;
$(function () {
    $('#statblock-input').on('input', renderInput);

});

function renderInput() {
    inputStats = JSON.parse($('#statblock-input').val());

    inputStats.abilityModifiers = inputStats.abilityModifiers || {};
    for (let ability in abilities) {
        let modifier = abilityScoreModifier(inputStats[ability]);
        //Save the ability modifiers if the statblock hasn't already done that
        inputStats.abilityModifiers[ability] = modifier;
    }

    renderStatblock(inputStats);
};