import { state } from '../store/state.js';
import { initAudio, getAudioContext, rebuildChannelChain, chanNodes, setSampleBank, getSampleBank } from './useAudioEngine.js';
import { synthBufferRegistry, synthReady, generateAllSynthSounds, generateBasicSamples, getBufferForFile } from '../utils/sampleGenerator.js';
import { FILESYSTEM, getFolderNode, getFolderItems, getFolderPathNames, LOADABLE_EXTS } from '../utils/fileSystem.js';
import { DEFAULT_SAMPLE_NAMES } from '../utils/constants.js';

let synthStarted = false;

export function ensureSynthSounds() {
    if (synthStarted || synthReady) return;
    synthStarted = true;
    initAudio();
    generateAllSynthSounds().then(() => {
        window.dispatchEvent(new CustomEvent('synth-sounds-ready'));
    });
}

export function initBasicSamples() {
    generateBasicSamples().then(bank => {
        setSampleBank(bank);
        window.dispatchEvent(new CustomEvent('samples-ready'));
    });
}

export function previewFile(file) {
    const ctx = getAudioContext();
    if (!ctx) return;
    const buf = getBufferForFile(file);
    if (!buf) return;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.value = 0.7;
    src.connect(g);
    g.connect(ctx.destination);
    src.start(ctx.currentTime);
    src.stop(ctx.currentTime + Math.min(buf.duration, 0.5));
}

export function loadFileToChannel(file, folderPath) {
    const chan = state.selectedChannel;
    const chanState = state.channels[chan];

    const items = getFolderItems(folderPath);
    const folderFiles = items.filter(it => it.type === 'file' && LOADABLE_EXTS.includes(it.ext));
    const fileIdx = folderFiles.findIndex(f => f.name === file.name && f.ext === file.ext);

    const pathParts = getFolderPathNames(folderPath);
    chanState.folderFiles = folderFiles;
    chanState.folderName  = 'USB / ' + pathParts.join(' / ');
    chanState.folderSampleIdx = Math.max(0, fileIdx);
    rebuildChannelChain(chan);
    chanState.sample = 0;

    window.dispatchEvent(new CustomEvent('file-loaded-to-channel', {
        detail: { chan, file }
    }));
}

export function getSampleDisplayName(chanIndex) {
    const chan = state.channels[chanIndex];
    if (chan.folderFiles && chan.folderFiles.length > 0) {
        const file = chan.folderFiles[chan.folderSampleIdx];
        return file ? file.name.toUpperCase() : '---';
    }
    const sIdx = chan.sample % 8;
    return DEFAULT_SAMPLE_NAMES[sIdx] || 'SAMPLE';
}

export function getSamplePath(chanIndex) {
    const chan = state.channels[chanIndex];
    if (chan.folderFiles && chan.folderFiles.length > 0) {
        const parts = (chan.folderName || 'USB').split(' / ');
        return parts.length > 1 ? '…/' + parts.slice(-1)[0] : parts[0];
    }
    return 'built-in';
}

export function getSampleIndexDisplay(chanIndex) {
    const chan = state.channels[chanIndex];
    if (chan.folderFiles && chan.folderFiles.length > 0) {
        return 'S' + (chan.folderSampleIdx + 1) + '/' + chan.folderFiles.length;
    }
    const sIdx = chan.sample % 8;
    return 'S' + (sIdx + 1) + '/8';
}

export function getSampleExt(chanIndex) {
    const chan = state.channels[chanIndex];
    if (chan.folderFiles && chan.folderFiles.length > 0) {
        const file = chan.folderFiles[chan.folderSampleIdx];
        return file ? file.ext.toUpperCase() : 'WAV';
    }
    return 'WAV';
}

export function getCurrentBuffer(chanIndex) {
    const chan = state.channels[chanIndex];
    if (chan.folderFiles && chan.folderFiles.length > 0) {
        const file = chan.folderFiles[chan.folderSampleIdx];
        return file ? getBufferForFile(file) : null;
    }
    const bank = getSampleBank();
    if (!bank || bank.length === 0) return null;
    const sampleIdx = chan.sample % bank.length;
    return bank[sampleIdx];
}
