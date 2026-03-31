import { state, getSequence, getMaxBars, setMaxBars } from '../store/state.js';
import { initAudio, getAudioContext, playChannelSample, buildChannelChain } from './useAudioEngine.js';

let nextNoteTime = 0;
let current16thNote = 0;
let timerID = null;

export function getCurrent16thNote() { return current16thNote; }
export function setCurrent16thNote(v) { current16thNote = v; }

function nextNote() {
    const secondsPerBeat = 60.0 / state.bpm;
    nextNoteTime += 0.25 * secondsPerBeat;
    current16thNote++;

    const maxSteps = getMaxBars() * 16;
    if (current16thNote >= maxSteps) {
        current16thNote = 0;
        if (state._nextPattern !== null && state._nextPattern !== undefined) {
            const next = state._nextPattern;
            state.currentPattern = next;
            state._nextPattern = null;
            requestAnimationFrame(() => {
                window.dispatchEvent(new CustomEvent('pattern-switched', { detail: { pattern: next } }));
            });
        }
    }
}

function scheduleNote(beatNumber, time) {
    if (state.isPlaying) {
        requestAnimationFrame(() => {
            window.dispatchEvent(new CustomEvent('sequencer-step', { detail: { step: beatNumber } }));
        });
    }

    const seq = getSequence();
    for (let c = 0; c < 8; c++) {
        const stepData = seq[c][beatNumber];
        if (stepData) {
            playChannelSample(c, stepData.locks || {}, time);
            requestAnimationFrame(() =>
                window.dispatchEvent(new CustomEvent('channel-triggered', { detail: { chanIndex: c } }))
            );
        }
    }
}

function scheduler() {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;
    while (nextNoteTime < audioCtx.currentTime + 0.1) {
        scheduleNote(current16thNote, nextNoteTime);
        nextNote();
    }
    if (state.isPlaying) {
        timerID = setTimeout(scheduler, 25.0);
    }
}

export function startSequencer() {
    initAudio();
    const audioCtx = getAudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    for (let i = 0; i < 8; i++) buildChannelChain(i);

    state.isPlaying = true;
    nextNoteTime = audioCtx.currentTime + 0.05;
    current16thNote = 0;
    state.currentBar = 0;
    window.dispatchEvent(new CustomEvent('sequencer-started'));
    scheduler();
}

export function stopSequencer() {
    state.isPlaying = false;
    if (timerID) clearTimeout(timerID);
    timerID = null;
    window.dispatchEvent(new CustomEvent('sequencer-stopped'));
}
