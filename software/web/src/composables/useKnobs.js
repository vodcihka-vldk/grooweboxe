import { state, getSequence } from '../store/state.js';
import { updateMasterEffects, rebuildChannelChain, getAudioContext } from './useAudioEngine.js';
import { previewFile, getSampleDisplayName } from './useSampler.js';
import { DEFAULT_SAMPLE_NAMES } from '../utils/constants.js';

let paramDisplayTimer = null;

/**
 * Map knob 0-100 value to CSS rotation degrees (-130 to +130)
 */
export function knobValToDeg(val) {
    return -130 + (val / 100) * 260;
}

/**
 * Apply a knob value to state and audio engine.
 * @param {string} knobId - e.g. 'volume', 'bpm', 'master'
 * @param {number} val - 0-100
 * @param {boolean} silent - if true, skip param display flash
 */
export function setKnobValue(knobId, val, silent = false) {
    val = Math.max(0, Math.min(100, val));

    const masterKnobs = ['master', 'bpm', 'swing', 'bitsh', 'gate', 'delay', 'reverb'];

    if (masterKnobs.includes(knobId)) {
        if (knobId === 'master')     state.master.masterVolume = val;
        else if (knobId === 'bpm')   state.bpm = 40 + (val * 2.2);
        else                         state.master[knobId] = val;

        if (['delay', 'reverb', 'master', 'bitsh', 'gate', 'bpm'].includes(knobId)) {
            updateMasterEffects();
        }
    } else {
        // Channel knob
        const activeChan = state.selectedChannel;
        if (state.lockedStep !== null) {
            const seq = getSequence();
            const stepData = seq[activeChan][state.lockedStep];
            if (stepData) {
                if (!stepData.locks) stepData.locks = {};
                stepData.locks[knobId] = val;
            }
        } else {
            state.channels[activeChan][knobId] = val;
            if (knobId === 'sample') {
                const chanData = state.channels[activeChan];
                if (chanData.folderFiles && chanData.folderFiles.length > 0) {
                    const count = chanData.folderFiles.length;
                    const newIdx = Math.min(count - 1, Math.floor((val / 100) * count));
                    if (newIdx !== chanData.folderSampleIdx) {
                        chanData.folderSampleIdx = newIdx;
                        previewFile(chanData.folderFiles[newIdx]);
                        rebuildChannelChain(activeChan);
                    }
                } else {
                    const newSample = Math.floor(val / 15);
                    if (newSample !== chanData.sample) {
                        chanData.sample = newSample;
                        rebuildChannelChain(activeChan);
                    }
                }
            }
        }
    }

    if (!silent) {
        window.dispatchEvent(new CustomEvent('param-display', {
            detail: buildParamDisplay(knobId, val)
        }));
    }

    // Emit general knob-changed event for Vue reactivity
    window.dispatchEvent(new CustomEvent('knob-changed', { detail: { knobId, val } }));
}

function buildParamDisplay(knobId, val) {
    let dispName = knobId.toUpperCase();
    let dispVal  = Math.round(val);

    if (knobId === 'sample') {
        const chanData = state.channels[state.selectedChannel];
        if (chanData.folderFiles && chanData.folderFiles.length > 0) {
            const file = chanData.folderFiles[chanData.folderSampleIdx];
            dispVal = file ? file.name.substring(0, 12).toUpperCase() : '---';
        } else {
            const sId = Math.floor(val / 15);
            dispVal = (DEFAULT_SAMPLE_NAMES[sId % DEFAULT_SAMPLE_NAMES.length] || 'S00' + (sId + 1)).substring(0, 12);
        }
        dispName = '';
    } else if (knobId === 'bpm') {
        dispVal = Math.round(40 + (val * 2.2));
    } else if (knobId === 'pitch') {
        const p = Math.round(val - 50);
        dispVal = p > 0 ? `+${p}` : p;
    }

    return { name: dispName, val: dispVal, knobId };
}

export function updateChannelKnobs() {
    const chan = state.channels[state.selectedChannel];
    setKnobValue('sample', chan.sample * 15, true);
    setKnobValue('volume', chan.volume, true);
    setKnobValue('pitch',  chan.pitch, true);
    setKnobValue('drive',  chan.drive, true);
    setKnobValue('start',  chan.start, true);
    setKnobValue('length', chan.length, true);
    setKnobValue('attack', chan.attack, true);
    setKnobValue('decay',  chan.decay, true);
}

export function updateKnobsForStep(globalStep) {
    const chan = state.channels[state.selectedChannel];
    const seq = getSequence();
    const locks = seq[state.selectedChannel][globalStep]?.locks || {};
    setKnobValue('volume', locks.volume !== undefined ? locks.volume : chan.volume);
    setKnobValue('pitch',  locks.pitch  !== undefined ? locks.pitch  : chan.pitch);
    setKnobValue('drive',  locks.drive  !== undefined ? locks.drive  : chan.drive);
    setKnobValue('start',  locks.start  !== undefined ? locks.start  : chan.start);
    setKnobValue('length', locks.length !== undefined ? locks.length : chan.length);
    setKnobValue('attack', locks.attack !== undefined ? locks.attack : chan.attack);
    setKnobValue('decay',  locks.decay  !== undefined ? locks.decay  : chan.decay);
}
