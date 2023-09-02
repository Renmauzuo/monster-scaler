let inputStats;
$(function () {
    $('#statblock-input').on('input', renderInput);

});

function renderInput() {
    inputStats = JSON.parse($('#statblock-input').val());
    renderStatblock(inputStats);
};