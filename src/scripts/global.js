import {
    sizes,
    creatureTypes, raceKeys, races,
    toTitleCase,
} from '@toolkit5e/base';

import { monsterList } from '@toolkit5e/monster-scaler';
import { renderStatblock as renderStatblockPackage } from '@toolkit5e/statblock';

$(function () {

    // Populate the race dropdown from the races data
    for (let i = 0; i < races.length; i++) {
        $('<option value=' + i + '>' + toTitleCase(races[i].name) + '</option>').appendTo('#race-select');
    }

    $('[data-on-change]').on('change', function () {
        window[$(this).data('on-change')](true);
    });

    $(document).on('change', '[data-limit]', function () {
        if ($(this).val().length > $(this).data('limit')) {
            $(this).val($(this).data('old-val'));
        } else {
            $(this).data('old-val', $(this).val());
        }
    });

});

/**
 * Shows or hides the variant dropdown based on the current monster, and populates it with any variant options.
 * @param {boolean} animated Whether or not to animate the show/hide
 */
export function setupVariantSelect(animated) {
    let animationDuration = animated ? 400 : 0;
    let monsterID = $('#creature').val();
    let selectedMonster = monsterList[monsterID];
    if (selectedMonster.variants) {
        $('#variant').empty();
        for (let variant in selectedMonster.variants) {
            $('<option value='+variant+'>'+selectedMonster.variants[variant].name+'</option>').appendTo('#variant');
        }
        $('#variant-wrapper').fadeIn(animationDuration);
    } else {
        $('#variant-wrapper').fadeOut(animationDuration);
    }

    if (selectedMonster.type === creatureTypes.humanoid && selectedMonster.race === raceKeys.any) {
        $('#race-wrapper').fadeIn(animationDuration);
        setupLineageSelect(animated);
    } else {
        $('#race-wrapper').fadeOut(animationDuration);
        $('#lineage-wrapper').fadeOut(animationDuration);
    }
}

/**
 * Shows or hides the lineage dropdown based on the selected race, and populates it with lineage options.
 * @param {boolean} animated Whether or not to animate the show/hide
 */
export function setupLineageSelect(animated) {
    let animationDuration = animated ? 400 : 0;
    let raceIndex = parseInt($('#race-select').val());
    let selectedRace = races[raceIndex];
    if (selectedRace && selectedRace.lineages && selectedRace.lineages.length > 0) {
        $('#lineage-select').empty();
        for (let i = 0; i < selectedRace.lineages.length; i++) {
            $('<option value=' + i + '>' + selectedRace.lineages[i].name + '</option>').appendTo('#lineage-select');
        }
        $('#lineage-wrapper').fadeIn(animationDuration);
    } else {
        $('#lineage-wrapper').fadeOut(animationDuration);
    }
}

/**
 * Takes a statblock object and renders it to the statblock div on screen.
 * @param {Object} sourceStats The statblock to display
 */
export function renderStatblock(sourceStats) {
    renderStatblockPackage(sourceStats, document.querySelector('.stat-block'));
}

// ---------------------------------------------------------------------------
// Export / utility functions (site-specific)
// ---------------------------------------------------------------------------

function exportFileSlug(statblock) {
    const name = statblock.defaultName ? statblock.name : statblock.slug;
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function exportFightClub() {
    const statblock = window.monsterStats;
    let cr = $('#target-cr').val();
    let fightClubXML = xmlNode('name', $('.monster-name').html());
    fightClubXML += xmlNode('size', sizes[statblock.size].name.substring(0, 1));
    fightClubXML += xmlNode('type', statblock.type);
    fightClubXML += xmlNode('alignment', statblock.alignment);
    fightClubXML += xmlNode('ac', $('.armor-class span').html());
    fightClubXML += xmlNode('hp', $('.hit-points span').html());
    fightClubXML += xmlNode('speed', $('.speed span').html());
    fightClubXML += xmlNode('str', statblock.str);
    fightClubXML += xmlNode('dex', statblock.dex);
    fightClubXML += xmlNode('con', statblock.con);
    fightClubXML += xmlNode('int', statblock.int);
    fightClubXML += xmlNode('wis', statblock.wis);
    fightClubXML += xmlNode('cha', statblock.cha);
    fightClubXML += xmlNode('save', '');
    fightClubXML += xmlNode('skill', $('.skills span').html());
    fightClubXML += xmlNode('passive', statblock.passivePerception);
    fightClubXML += xmlNode('languages', $('.languages span').html());
    fightClubXML += xmlNode('cr', cr);
    fightClubXML += xmlNode('resist', ($('.resistances span').html() ?? '').toLowerCase());
    fightClubXML += xmlNode('immune', ($('.immunities span').html() ?? '').toLowerCase());
    fightClubXML += xmlNode('vulnerable', ($('.vulnerabilities span').html() ?? '').toLowerCase());
    fightClubXML += xmlNode('conditionImmune', ($('.condition-immunities span').html() ?? '').toLowerCase());
    fightClubXML += xmlNode('senses', statblock.sensesString);
    for (let traitName in statblock.traits) {
        let traitXML = xmlNode('name', statblock.traits[traitName].name);
        traitXML += xmlNode('text', statblock.traits[traitName].text.replace(/<br\/>/g, '</text><text>').replace(/<span class='trait-spacer'><\/span>/g, '</text><text>'));
        fightClubXML += xmlNode('trait', traitXML);
    }
    if (statblock.multiattack) {
        fightClubXML += xmlNode('action', xmlNode('name', 'Multiattack') + xmlNode('text', statblock.multiattackString));
    }
    for (let attackName in statblock.attacks) {
        let a = statblock.attacks[attackName];
        let attackXML = xmlNode('name', a.name) + xmlNode('text', a.text.replace(/<\/?em>/g, ''));
        let attackStr = a.name + '|' + (a.attackBonus >= 0 ? '+' : '-') + Math.abs(a.attackBonus) + '|' + a.damageDice + 'd' + a.damageDieSize;
        if (a.damageBonus) attackStr += (a.damageBonus >= 0 ? '+' : '-') + Math.abs(a.damageBonus);
        attackXML += xmlNode('attack', attackStr);
        fightClubXML += xmlNode('action', attackXML);
    }
    for (let bonusActionName in statblock.bonusActions) {
        let ba = statblock.bonusActions[bonusActionName];
        fightClubXML += xmlNode('action', xmlNode('name', ba.name + ' (Bonus Action)') + xmlNode('text', ba.text));
    }
    if (statblock.legendaryActions) {
        const legendaryDesc = statblock.description ?? 'the ' + statblock.slug;
        const cap = legendaryDesc.charAt(0).toUpperCase() + legendaryDesc.slice(1);
        fightClubXML += xmlNode('legendary', xmlNode('text', `${cap} can take 3 legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature's turn. ${cap} regains spent legendary actions at the start of its turn.`));
        for (let actionName in statblock.legendaryActions) {
            let la = statblock.legendaryActions[actionName];
            fightClubXML += xmlNode('legendary', xmlNode('name', la.name) + xmlNode('text', la.text));
        }
    }
    fightClubXML = "<?xml version='1.0' encoding='utf-8'?>" + xmlNode('compendium', xmlNode('monster', fightClubXML));
    downloadBlob(fightClubXML, exportFileSlug(statblock) + '-cr-' + cr + '.xml', 'text/plain');
}

function exportJSON() {
    const statblock = window.monsterStats;
    let cr = $('#target-cr').val();
    downloadBlob(JSON.stringify(statblock), exportFileSlug(statblock) + '-cr-' + cr + '.json', 'text/plain');
}

function generateImage() {
    const statblock = window.monsterStats;
    const cr = $('#target-cr').val();
    const filename = exportFileSlug(statblock) + '-cr-' + cr + '.png';
    html2canvas(document.querySelector('.stat-block'), { scale: '2' }).then(canvas => {
        let link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

function downloadBlob(content, filename, mimeType) {
    let pom = document.createElement('a');
    pom.setAttribute('href', window.URL.createObjectURL(new Blob([content], { type: mimeType })));
    pom.setAttribute('download', filename);
    pom.click();
}

function xmlNode(tag, value) {
    return '<' + tag + '>' + value + '</' + tag + '>';
}

export function serializeForm($form) {
    let output = '';
    $form.find('select:visible').each(function () {
        if ($(this).closest('[id$="-wrapper"]').length && !$(this).closest('[id$="-wrapper"]').is(':visible')) return;
        let value = $(this).val();
        if (value && value.length && value !== '0') {
            output += '&' + $(this).attr('id') + '=' + value;
        }
    });
    $form.find('input:visible:not([type="checkbox"])').each(function () {
        let value = $(this).val();
        if (value) output += '&' + $(this).attr('id') + '=' + value;
    });
    $form.find('input:visible:checked').each(function () {
        output += '&' + $(this).attr('id');
    });
    return output.replace('&', '');
}

export function deserializeQuery() {
    if (location.search.length) {
        let params = new URLSearchParams(location.search);
        $('select').each(function () {
            let value = params.get($(this).attr('id'));
            if (value) {
                if ($(this).attr('multiple')) {
                    $(this).val(value.split(','));
                    if ($(this).is('[data-limit]')) $(this).data('old-val', $(this).val());
                } else {
                    if ($(this).children('option[value="' + value + '"]').length) $(this).val(value);
                }
            }
            if ($(this).data('on-change')) window[$(this).data('on-change')](false);
        });
        $('input:not([type="checkbox"])').each(function () {
            let value = params.get($(this).attr('id'));
            if (value) $(this).val(value);
            if ($(this).data('on-change')) window[$(this).data('on-change')](false);
        });
        $('input[type="checkbox"]').each(function () {
            if (params.get($(this).attr('id')) !== null) $(this)[0].checked = true;
        });
    } else {
        $('[data-on-change]').each(function () {
            window[$(this).data('on-change')](false);
        });
    }
}

export function populateSelect(dataSource, selector) {
    if (Array.isArray(dataSource)) {
        for (let i = 0; i < dataSource.length; i++) {
            $('<option value=' + i + '>' + dataSource[i].name + '</option>').appendTo(selector);
        }
    } else {
        for (let key in dataSource) {
            $('<option value=' + key + '>' + (dataSource[key].name || toTitleCase(key)) + '</option>').appendTo(selector);
        }
    }
}

/**
 * Adds the current statblock (window.monsterStats) to the encounter list in localStorage.
 */
function addToEncounter() {
    const statblock = window.monsterStats;
    if (!statblock) return;
    const list = JSON.parse(localStorage.getItem('encounter-list') ?? '[]');
    list.push(statblock);
    localStorage.setItem('encounter-list', JSON.stringify(list));
    // Brief visual feedback
    const btn = document.getElementById('add-to-encounter');
    const orig = btn.textContent;
    btn.textContent = 'Added!';
    setTimeout(() => { btn.textContent = orig; }, 1000);
}

// Expose functions referenced by data-on-change attributes
window.setupVariantSelect = setupVariantSelect;
window.setupLineageSelect = setupLineageSelect;
window.exportFightClub = exportFightClub;
window.exportJSON = exportJSON;
window.generateImage = generateImage;
window.addToEncounter = addToEncounter;
