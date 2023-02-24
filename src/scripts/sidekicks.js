let sidekickStats;
$(function () {

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
    }

    //Once we have all the stats populate the statblock:
    renderStatblock(sidekickStats);
}
