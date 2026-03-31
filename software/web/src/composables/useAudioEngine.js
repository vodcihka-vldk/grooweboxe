import { state, getSequence, getMaxBars } from '../store/state.js';
import { EQ_PROFILES, COMP_PROFILES } from '../utils/constants.js';
import { synthBufferRegistry, getBufferForFile } from '../utils/sampleGenerator.js';

// Module-level audio engine state
let audioCtx = null;
let isInitialized = false;
let masterGain, delayNode, convolverNode, bitcrushNode;
let delayMix, reverbMix;
let masterLowShelf, masterHighShelf, masterCompressor, masterSaturation, masterLimiter;
let preMasterBus;
let drumsBusDry, drumsBusComp, drumsBusMix;
let sidechainDuckGain;

export const chanNodes = Array.from({ length: 8 }, () => ({
    eq: null, comp: null, out: null
}));

let sampleBank = [];

export function getAudioContext() { return audioCtx; }
export function getSampleBank() { return sampleBank; }
export function setSampleBank(bank) { sampleBank = bank; }
export function getIsInitialized() { return isInitialized; }

export function classifyChannel(chanIndex) {
    const chan = state.channels[chanIndex];
    let name = '';
    if (chan.folderFiles && chan.folderFiles.length > 0) {
        const file = chan.folderFiles[chan.folderSampleIdx];
        name = (file ? file.name : '').toLowerCase();
    } else {
        const NAMES = ['kick', 'snare', 'hihat', 'hihat', 'tom', 'perc', 'clap', 'crash'];
        name = NAMES[chanIndex] || '';
    }
    if (/kick|bd|bass.?drum|808/.test(name))       return 'kick';
    if (/snare|sn|rimshot|rim/.test(name))          return 'snare';
    if (/hi.?hat|hh|hat|cymbal/.test(name))         return 'hihat';
    if (/bass|sub|reese|acid|303|moog/.test(name))  return 'bass';
    if (/loop|break|amen|jungle/.test(name))         return 'loop';
    if (/clap|cla/.test(name))                      return 'clap';
    if (/crash|ride|cymb/.test(name))               return 'crash';
    if (/perc|conga|bongo|tom/.test(name))           return 'perc';
    if (/fx|riser|impact|sweep|down/.test(name))     return 'fx';
    const fallbacks = ['kick', 'snare', 'hihat', 'hihat', 'tom', 'perc', 'clap', 'crash'];
    return fallbacks[chanIndex] || 'other';
}

export function makeTapeSatCurve(amount) {
    const n = 44100;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        const x = (i * 2) / n - 1;
        curve[i] = Math.tanh(x * amount) / Math.tanh(amount);
    }
    return curve;
}

export function buildChannelChain(chanIndex) {
    if (!audioCtx) return;
    const type = classifyChannel(chanIndex);
    const ctx = audioCtx;

    const eqFilters = (EQ_PROFILES[type] || []).map(p => {
        const f = ctx.createBiquadFilter();
        f.type = p.type;
        f.frequency.value = p.freq;
        f.Q.value = p.Q;
        f.gain.value = p.gain;
        return f;
    });

    for (let i = 1; i < eqFilters.length; i++) eqFilters[i - 1].connect(eqFilters[i]);
    const eqIn  = eqFilters[0] || ctx.createGain();
    const eqOut = eqFilters[eqFilters.length - 1] || eqIn;

    const comp = ctx.createDynamicsCompressor();
    const cp = COMP_PROFILES[type] || COMP_PROFILES.other;
    comp.threshold.value = cp.threshold;
    comp.knee.value      = cp.knee;
    comp.ratio.value     = cp.ratio;
    comp.attack.value    = cp.attack;
    comp.release.value   = cp.release;

    const outGain = ctx.createGain();
    outGain.gain.value = 1.0;

    eqOut.connect(comp);
    comp.connect(outGain);

    chanNodes[chanIndex] = { eq: eqIn, comp, out: outGain, type };
    return { eqIn, outGain, type };
}

export function rebuildChannelChain(chanIndex) {
    if (!audioCtx) return;
    buildChannelChain(chanIndex);
}

export function generateReverbIR() {
    if (!audioCtx) return;
    const sr = audioCtx.sampleRate;
    const length = sr * 2.0;
    const impulse = audioCtx.createBuffer(2, length, sr);
    for (let c = 0; c < 2; c++) {
        const channelData = impulse.getChannelData(c);
        for (let i = 0; i < length; i++) {
            channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 4);
        }
    }
    convolverNode.buffer = impulse;
}

export function triggerKickSidechain(time) {
    if (!sidechainDuckGain) return;
    const g = sidechainDuckGain.gain;
    g.cancelScheduledValues(time);
    g.setValueAtTime(1.0, time);
    g.linearRampToValueAtTime(0.28, time + 0.003);
    g.exponentialRampToValueAtTime(0.999, time + 0.085);
    g.setValueAtTime(1.0, time + 0.086);
}

export function updateMasterEffects() {
    if (!audioCtx) return;
    masterGain.gain.value = state.master.masterVolume / 100;

    if (bitcrushNode) {
        const bitVal = state.master.bitsh;
        bitcrushNode.curve = bitVal > 0 ? makeTapeSatCurve(1 + bitVal * 0.12) : null;
    }

    if (delayNode) {
        const beatSec = 60 / state.bpm;
        delayNode.delayTime.value = beatSec * 0.5;
    }
    if (delayMix)  delayMix.gain.value  = state.master.delay  / 100;
    if (reverbMix) reverbMix.gain.value = state.master.reverb / 100;
}

export function updateMasteringEffects() {
    if (!audioCtx) return;

    masterLowShelf.gain.value  = ((state.mastering.lowEq  - 50) / 50) * 8;
    masterHighShelf.gain.value = ((state.mastering.highEq - 50) / 50) * 8;

    masterCompressor.threshold.value = -8 - ((state.mastering.compThresh / 100) * 16);
    masterCompressor.ratio.value     = 1.5 + ((state.mastering.compRatio  / 100) * 2.5);

    const satAmount = 1 + (state.mastering.saturation / 100) * 8;
    masterSaturation.curve = makeTapeSatCurve(satAmount);

    if (drumsBusMix) {
        drumsBusMix.gain.value = 0.2 + (state.mastering.compRatio / 100) * 0.4;
    }
}

export function initAudio() {
    if (isInitialized) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    preMasterBus = audioCtx.createGain();
    preMasterBus.gain.value = 1.0;

    drumsBusDry = audioCtx.createGain();
    drumsBusDry.gain.value = 0.7;
    drumsBusComp = audioCtx.createDynamicsCompressor();
    drumsBusComp.threshold.value = -30;
    drumsBusComp.knee.value = 6;
    drumsBusComp.ratio.value = 8;
    drumsBusComp.attack.value = 0.003;
    drumsBusComp.release.value = 0.080;
    drumsBusMix = audioCtx.createGain();
    drumsBusMix.gain.value = 0.35;

    sidechainDuckGain = audioCtx.createGain();
    sidechainDuckGain.gain.value = 1.0;

    bitcrushNode = audioCtx.createWaveShaper();

    delayNode = audioCtx.createDelay(2.0);
    const delayFeedback = audioCtx.createGain();
    delayFeedback.gain.value = 0.35;
    delayNode.delayTime.value = (60 / state.bpm) * 0.5;
    delayMix = audioCtx.createGain();
    delayMix.gain.value = 0;

    convolverNode = audioCtx.createConvolver();
    generateReverbIR();
    reverbMix = audioCtx.createGain();
    reverbMix.gain.value = 0;

    masterLowShelf = audioCtx.createBiquadFilter();
    masterLowShelf.type = 'lowshelf';
    masterLowShelf.frequency.value = 100;
    masterLowShelf.gain.value = 1.5;

    masterHighShelf = audioCtx.createBiquadFilter();
    masterHighShelf.type = 'highshelf';
    masterHighShelf.frequency.value = 10000;
    masterHighShelf.gain.value = 1.0;

    masterCompressor = audioCtx.createDynamicsCompressor();
    masterCompressor.threshold.value = -14;
    masterCompressor.knee.value = 8;
    masterCompressor.ratio.value = 2;
    masterCompressor.attack.value = 0.030;
    masterCompressor.release.value = 0.120;

    masterSaturation = audioCtx.createWaveShaper();
    masterSaturation.oversample = '4x';
    masterSaturation.curve = makeTapeSatCurve(3);

    masterLimiter = audioCtx.createDynamicsCompressor();
    masterLimiter.threshold.value = -0.5;
    masterLimiter.knee.value = 0.0;
    masterLimiter.ratio.value = 20.0;
    masterLimiter.attack.value = 0.0005;
    masterLimiter.release.value = 0.030;

    masterGain = audioCtx.createGain();
    masterGain.gain.value = state.master.masterVolume / 100;

    for (let i = 0; i < 8; i++) buildChannelChain(i);

    preMasterBus.connect(bitcrushNode);
    bitcrushNode.connect(masterLowShelf);

    preMasterBus.connect(delayNode);
    delayNode.connect(delayFeedback);
    delayFeedback.connect(delayNode);
    delayNode.connect(delayMix);
    delayMix.connect(masterLowShelf);

    preMasterBus.connect(convolverNode);
    convolverNode.connect(reverbMix);
    reverbMix.connect(masterLowShelf);

    masterLowShelf.connect(masterHighShelf);
    masterHighShelf.connect(masterCompressor);
    masterCompressor.connect(masterSaturation);
    masterSaturation.connect(masterLimiter);
    masterLimiter.connect(masterGain);
    masterGain.connect(audioCtx.destination);

    updateMasterEffects();
    updateMasteringEffects();

    isInitialized = true;
}

export function playChannelSample(chanIndex, locks, time) {
    if (!audioCtx) return;
    const chan = state.channels[chanIndex];
    const volume   = locks.volume  !== undefined ? locks.volume  : chan.volume;
    const pitch    = locks.pitch   !== undefined ? locks.pitch   : chan.pitch;
    const driveObj = locks.drive   !== undefined ? locks.drive   : chan.drive;
    const startObj = locks.start   !== undefined ? locks.start   : chan.start;
    const lengthObj= locks.length  !== undefined ? locks.length  : chan.length;
    const attackObj= locks.attack  !== undefined ? locks.attack  : chan.attack;
    const decayObj = locks.decay   !== undefined ? locks.decay   : chan.decay;

    let buffer;
    if (chan.folderFiles && chan.folderFiles.length > 0) {
        const file = chan.folderFiles[chan.folderSampleIdx];
        buffer = file ? getBufferForFile(file) : null;
    } else {
        const sampleIdx = chan.sample % sampleBank.length;
        buffer = sampleBank[sampleIdx];
    }
    if (!buffer) return;

    const type = chanNodes[chanIndex]?.type || classifyChannel(chanIndex);

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    const playbackRate = Math.pow(2, (pitch - 50) / 24);
    source.playbackRate.setValueAtTime(playbackRate, time);

    const envGain = audioCtx.createGain();
    const attTime = (attackObj / 100) * 0.3;
    const decTime = (decayObj  / 100) * 1.8;
    envGain.gain.setValueAtTime(0.0001, time);
    envGain.gain.linearRampToValueAtTime(volume / 100, time + attTime + 0.005);
    envGain.gain.exponentialRampToValueAtTime(0.0001, time + attTime + decTime + 0.05);

    let transientGain = null;
    if (['kick', 'snare', 'clap', 'perc'].includes(type)) {
        const transAmt = type === 'kick' ? 0.35 : type === 'snare' ? 0.25 : 0.20;
        transientGain = audioCtx.createGain();
        const transFilter = audioCtx.createBiquadFilter();
        transFilter.type = 'highpass';
        transFilter.frequency.value = type === 'kick' ? 2000 : 4000;
        transientGain.gain.setValueAtTime(transAmt, time);
        transientGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.018);
        source.connect(transFilter);
        transFilter.connect(transientGain);
    }

    const driveGain = audioCtx.createGain();
    driveGain.gain.value = 1.0;
    if (driveObj > 0) {
        const driveNode = audioCtx.createWaveShaper();
        driveNode.curve = makeTapeSatCurve(1 + driveObj * 0.15);
        driveNode.oversample = '2x';
        source.connect(driveNode);
        driveNode.connect(driveGain);
    } else {
        source.connect(driveGain);
    }

    if (type === 'kick') {
        triggerKickSidechain(time);
    }

    const nodes = chanNodes[chanIndex];

    if (nodes && nodes.eq) {
        driveGain.connect(envGain);
        envGain.connect(nodes.eq);
        if (transientGain) transientGain.connect(nodes.eq);

        if (type === 'bass') {
            nodes.out.connect(sidechainDuckGain);
        }

        const isDrum = ['kick', 'snare', 'hihat', 'clap', 'perc', 'crash', 'tom'].includes(type);
        if (isDrum) {
            nodes.out.connect(drumsBusDry);
            drumsBusDry.connect(preMasterBus);
            nodes.out.connect(drumsBusComp);
            drumsBusComp.connect(drumsBusMix);
            drumsBusMix.connect(preMasterBus);
        } else {
            nodes.out.connect(preMasterBus);
        }
        if (type === 'bass') {
            sidechainDuckGain.connect(preMasterBus);
        }
    } else {
        driveGain.connect(envGain);
        envGain.connect(preMasterBus);
        if (transientGain) transientGain.connect(preMasterBus);
    }

    const durRatio = lengthObj / 100;
    const startLoc = (startObj / 100) * buffer.duration;
    const playDur = buffer.duration * durRatio;

    const evt = new CustomEvent('sample-triggered', {
        detail: {
            chanIndex,
            startTime: time,
            startLoc,
            playDur,
            bufferDuration: buffer.duration
        }
    });
    window.dispatchEvent(evt);

    source.start(time, startLoc, playDur);
}
