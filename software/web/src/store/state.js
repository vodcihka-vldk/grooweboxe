import { reactive } from 'vue';

export const state = reactive({
    isPlaying: false,
    currentStep: 0,
    currentBar: 0,
    selectedChannel: 0,
    bpm: 132,
    isFuncPressed: false,

    // Global parameters for each of the 8 channels
    channels: Array.from({ length: 8 }).map(() => ({
        sample: 0,
        volume: 80,
        pitch: 50,
        drive: 0,
        start: 0,
        length: 100,
        attack: 5,
        decay: 50,
        folderFiles: null,
        folderName: null,
        folderSampleIdx: 0
    })),

    // 8 patterns, each with 8 channels × 64 steps
    currentPattern: 0,
    patterns: Array.from({ length: 8 }).map(() => ({
        sequence: Array.from({ length: 8 }).map(() =>
            Array.from({ length: 64 }).map(() => null)
        ),
        maxBars: 1,
        label: null,
        channelSettings: null
    })),

    // Pending pattern switch (seamless at bar boundary)
    _nextPattern: null,

    // Master effects
    master: {
        masterVolume: 80,
        swing: 0,
        bitsh: 0,
        gate: 100,
        delay: 0,
        reverb: 0
    },

    // Mastering chain
    mastering: {
        lowEq: 50,
        highEq: 50,
        compThresh: 50,
        compRatio: 50,
        saturation: 50
    },

    // UI state
    lockedStep: null
});

// Computed helpers (non-reactive getters, call as functions)
export function getSequence() {
    return state.patterns[state.currentPattern].sequence;
}

export function getMaxBars() {
    return state.patterns[state.currentPattern].maxBars;
}

export function setMaxBars(v) {
    state.patterns[state.currentPattern].maxBars = v;
}

// State event emitters (legacy compatibility)
const listeners = [];

export function onStateChange(cb) {
    listeners.push(cb);
}

export function notifyStateChange(changedKeys) {
    listeners.forEach(cb => cb(state, changedKeys));
}
