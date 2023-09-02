let inputStats;
$(function () {
    $('#statblock-input').on('input', renderInput);

});

function renderInput() {
    console.log('yo');
    inputStats = JSON.parse($('#statblock-input').val());
    renderStatblock(inputStats);
};