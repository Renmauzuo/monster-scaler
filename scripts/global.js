$(function () {

    for (let monster in monsterList) {
        $('<option value='+monster+'>'+monsterList[monster].slug+'</option>').appendTo('#monster-select');
    }

    $('#monster-select, #cr-select').on('change', function () {
        calculateSelectedMonster();
    });

    calculateSelectedMonster();

});

function calculateSelectedMonster() {
    let selectedMonster = monsterList[$('#monster-select').val()];
    let targetCR = $('#cr-select').val();

    //Start with locked stats and presets for this CR, if any
    let derivedStats = selectedMonster.lockedStats ? Object.assign({}, selectedMonster.lockedStats, selectedMonster.stats[targetCR]) : {};

    //Once we have our locked stats, go through the rest of the states to interpolate or extrapolate based on existing values.
    //All of the preset monster statblocks should be complete, but if we ever add "keyframes" for individual stats it may be possible to have CRs without all stats for a template
    //For this reason we do the interpolation for EACH stat individually, rather than finding the closest statblock to draw from

    if(!derivedStats.size) {
        let upperCR, upperSize, lowerCR, lowerSize;
        for (let cr in selectedMonster.stats) {
            let statBlock = selectedMonster.stats[cr];
            if (statBlock.size) {
                if (cr > targetCR) {
                    if (!upperCR || upperCR > cr) {
                        upperCR = cr;
                        upperSize = statBlock.size;
                    }
                } else {
                    if (!lowerCR || lowerCR < cr) {
                        lowerCR = cr;
                        lowerSize = statBlock.size;
                    }
                }
            }
        }

        //If a benchmark was only found in one direction we simply use that benchmark to extrapolate a state for the target CR
        //If benchmarks were found above and below, we calculate the target result for BOTH benchmarks, then take a weighted average based on which is closer
        //So if the upper benchmark is 1 step away, and the lower benchmark is 4 steps away, then the upper will count for 80% of the average
        let upperValue, lowerValue;
        if (upperCR) {
            let offset = upperSize - averageStats[upperCR].size;
            upperValue = offset + averageStats[targetCR].size;
        }
        if (lowerCR) {
            let offset = lowerSize - averageStats[lowerCR].size;
            lowerValue = offset + averageStats[targetCR].size;
        }

        if (lowerValue) {
            if (upperValue) {
                //If upper and lower take a weighted average
                let upperStep = stepForCR(upperCR);
                let lowerStep = stepForCR(lowerCR);
                let stepRange = upperStep - lowerStep;
                let targetStep = stepForCR(targetCR);
                let upperWeight = (upperStep - targetStep) / stepRange;
                let lowerWeight = (targetStep - lowerStep) / stepRange;
                derivedStats.size = upperWeight * upperValue + lowerWeight * lowerValue;
            } else {
                derivedStats.size = lowerValue;
            }
        } else {
            derivedStats.size = upperValue;
        }

        console.log("Closest above: " + upperValue + ' Closest Below: ' + lowerValue);
    }
    console.log(JSON.stringify(derivedStats));

    //Once we have all the stats populate the statblock:
    $('#monster-name').html(selectedMonster.slug);
    $('#monster-subtitle').html(sizes[Math.round(derivedStats.size)].name + ' ' + selectedMonster.type + ', ' + selectedMonster.alignment);
}

//Fractional CRs are counted as a full step in calculations, ie going from CR 1/8 to 1/4 carries as much weight as going from CR 1 to 2.
//This function converts CR into a "step" to ease calculations elsewhere
function stepForCR(cr) {
    let safeCR = parseFloat(cr);
    switch(safeCR) {
        case 0:
            return 0;
        case 0.125:
            return 1;
        case 0.25:
            return 2;
        case 0.5: 
            return 3;
        default:
            return safeCR+3;
    }

}