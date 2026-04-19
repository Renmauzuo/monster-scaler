import { initResourceTracker } from './resource-tracker.js';

/** localStorage key for the encounter creature list. */
const ENCOUNTER_KEY = 'encounter-list';

/**
 * Reads the encounter list from localStorage.
 * @returns {Array} Array of statblock objects.
 */
function loadEncounterList() {
    try {
        return JSON.parse(localStorage.getItem(ENCOUNTER_KEY) ?? '[]') ?? [];
    } catch {
        return [];
    }
}

/**
 * Saves the encounter list to localStorage.
 * @param {Array} list - Array of statblock objects.
 */
function saveEncounterList(list) {
    localStorage.setItem(ENCOUNTER_KEY, JSON.stringify(list));
}

/** Active tracker controller objects, parallel to the encounter list. */
let trackers = [];

/** Current round number. */
let round = 1;

/**
 * Renders all encounter trackers from the current localStorage list.
 */
function renderEncounter() {
    const list = loadEncounterList();
    const container = document.getElementById('encounter-instances');
    const empty = document.getElementById('encounter-empty');

    container.innerHTML = '';
    trackers = [];

    if (list.length === 0) {
        empty.style.display = '';
        return;
    }
    empty.style.display = 'none';

    list.forEach((statblock, index) => {
    // Count how many of this same slug appear in the list
    const slug = statblock.slug ?? statblock.name;
    const sameSlugTotal = list.filter(s => (s.slug ?? s.name) === slug).length;
    const instanceNumber = list.slice(0, index).filter(s => (s.slug ?? s.name) === slug).length + 1;
    const showNumber = sameSlugTotal > 1;

        const wrapper = document.createElement('div');
        wrapper.className = 'encounter-entry';

        // Tracker element — remove button is injected inside it after init
        const trackerEl = document.createElement('div');
        trackerEl.className = 'resource-tracker';
        wrapper.appendChild(trackerEl);

        container.appendChild(wrapper);
        trackers.push(initResourceTracker(statblock, trackerEl, showNumber ? instanceNumber : 0));

        // Inject remove button as first child so it floats top-right inside the box
        const removeBtn = document.createElement('button');
        removeBtn.className = 'rt-btn rt-btn--danger encounter-remove-btn';
        removeBtn.textContent = '✕ Remove';
        removeBtn.addEventListener('click', () => removeCreature(index));
        trackerEl.insertBefore(removeBtn, trackerEl.firstChild);
    });
}

/**
 * Removes a creature from the encounter by index and re-renders.
 * @param {number} index - Index in the encounter list.
 */
function removeCreature(index) {
    const list = loadEncounterList();
    list.splice(index, 1);
    saveEncounterList(list);
    renderEncounter();
}

/**
 * Clears all creatures from the encounter.
 */
function clearEncounter() {
    saveEncounterList([]);
    renderEncounter();
}

$(function () {
    renderEncounter();

    document.getElementById('rt-btn-round').addEventListener('click', () => {
        trackers.forEach(t => t.applyRound());
        round++;
        document.getElementById('rt-round-display').textContent = 'Round ' + round;
    });

    document.getElementById('rt-btn-short-rest').addEventListener('click', () => {
        trackers.forEach(t => t.applyShortRest());
    });

    document.getElementById('rt-btn-long-rest').addEventListener('click', () => {
        trackers.forEach(t => t.applyLongRest());
        round = 1;
        document.getElementById('rt-round-display').textContent = 'Round 1';
    });

    document.getElementById('rt-btn-clear').addEventListener('click', () => {
        if (confirm('Remove all creatures from the encounter?')) {
            clearEncounter();
            round = 1;
            document.getElementById('rt-round-display').textContent = 'Round 1';
        }
    });
});
