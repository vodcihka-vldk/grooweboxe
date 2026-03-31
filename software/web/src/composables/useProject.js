import { state, getSequence } from '../store/state.js';
import { setKnobValue, updateChannelKnobs } from './useKnobs.js';
import { updateMasterEffects, updateMasteringEffects, getAudioContext } from './useAudioEngine.js';

// ── Serialize/Deserialize ─────────────────────────────────────────────

export function serializePattern(pIdx) {
    const pat = state.patterns[pIdx];
    const savedSettings = pat.channelSettings
        ? pat.channelSettings.map(s => ({
            sample: s.sample, volume: s.volume, pitch: s.pitch,
            drive: s.drive, start: s.start, length: s.length,
            attack: s.attack, decay: s.decay,
            folderName: s.folderName || null,
            folderSampleIdx: s.folderSampleIdx || 0,
            folderFileNames: s.folderFiles ? s.folderFiles.map(f => f.name + '.' + f.ext) : null
        }))
        : null;
    return {
        sequence: pat.sequence.map(ch => ch.map(step => step ? JSON.parse(JSON.stringify(step)) : null)),
        maxBars: pat.maxBars,
        label: pat.label || null,
        channelSettings: savedSettings
    };
}

export function serializeChannels() {
    return state.channels.map(ch => ({
        sample:          ch.sample,
        volume:          ch.volume,
        pitch:           ch.pitch,
        drive:           ch.drive,
        start:           ch.start,
        length:          ch.length,
        attack:          ch.attack,
        decay:           ch.decay,
        folderName:      ch.folderName   || null,
        folderSampleIdx: ch.folderSampleIdx || 0,
        folderFileNames: ch.folderFiles ? ch.folderFiles.map(f => f.name + '.' + f.ext) : null
    }));
}

export function deserializeChannels(data) {
    if (!data) return;
    data.forEach((saved, i) => {
        if (!state.channels[i]) return;
        const ch = state.channels[i];
        ch.sample          = saved.sample          ?? ch.sample;
        ch.volume          = saved.volume          ?? ch.volume;
        ch.pitch           = saved.pitch           ?? ch.pitch;
        ch.drive           = saved.drive           ?? ch.drive;
        ch.start           = saved.start           ?? ch.start;
        ch.length          = saved.length          ?? ch.length;
        ch.attack          = saved.attack          ?? ch.attack;
        ch.decay           = saved.decay           ?? ch.decay;
        ch.folderName      = saved.folderName      || null;
        ch.folderSampleIdx = saved.folderSampleIdx || 0;
    });
}

// ── Pattern save/load (internal to pattern) ──────────────────────────

export function savePatternSettings() {
    const pIdx = state.currentPattern;
    state.patterns[pIdx].channelSettings = state.channels.map(ch => ({
        sample:          ch.sample,
        volume:          ch.volume,
        pitch:           ch.pitch,
        drive:           ch.drive,
        start:           ch.start,
        length:          ch.length,
        attack:          ch.attack,
        decay:           ch.decay,
        folderName:      ch.folderName      || null,
        folderSampleIdx: ch.folderSampleIdx || 0,
        folderFiles:     ch.folderFiles     || null
    }));
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { msg: 'P' + (pIdx + 1) + ' settings saved' } }));
    window.dispatchEvent(new CustomEvent('flash-button', { detail: { id: 'btn-s-save' } }));
}

export function loadPatternSettings() {
    const pIdx = state.currentPattern;
    const saved = state.patterns[pIdx].channelSettings;
    if (!saved) {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { msg: 'Nothing saved for P' + (pIdx + 1), isError: true } }));
        return;
    }
    applyPatternChannelSettings(saved);
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { msg: 'P' + (pIdx + 1) + ' settings restored' } }));
}

export function applyPatternChannelSettings(settings) {
    if (!settings) return;
    settings.forEach((s, i) => {
        if (!state.channels[i]) return;
        const ch = state.channels[i];
        ch.sample          = s.sample          ?? ch.sample;
        ch.volume          = s.volume          ?? ch.volume;
        ch.pitch           = s.pitch           ?? ch.pitch;
        ch.drive           = s.drive           ?? ch.drive;
        ch.start           = s.start           ?? ch.start;
        ch.length          = s.length          ?? ch.length;
        ch.attack          = s.attack          ?? ch.attack;
        ch.decay           = s.decay           ?? ch.decay;
        ch.folderName      = s.folderName      || null;
        ch.folderSampleIdx = s.folderSampleIdx || 0;
        ch.folderFiles     = s.folderFiles     || null;
    });
    updateChannelKnobs();
    window.dispatchEvent(new CustomEvent('screen-update'));
}

// ── Project save/load (full project) ─────────────────────────────────

export function saveProject() {
    const data = {
        version: 1,
        type: 'project',
        currentPattern: state.currentPattern,
        bpm: state.bpm,
        master:    JSON.parse(JSON.stringify(state.master)),
        mastering: JSON.parse(JSON.stringify(state.mastering)),
        channels:  serializeChannels(),
        patterns:  state.patterns.map((_, i) => serializePattern(i)),
        savedAt:   new Date().toISOString()
    };
    const json = JSON.stringify(data, null, 2);
    window.dispatchEvent(new CustomEvent('show-save-modal', { detail: { content: json, filename: 'project_' + Date.now() + '.grv' } }));
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { msg: 'Project saved' } }));
    window.dispatchEvent(new CustomEvent('flash-button', { detail: { id: 'btn-g-save' } }));
}

export function applyLoadedProject(jsonText) {
    try {
        const data = JSON.parse(jsonText);
        if (data.type !== 'project') throw new Error('Not a project file');

        data.patterns.forEach((saved, i) => {
            if (!state.patterns[i]) return;
            state.patterns[i].sequence        = saved.sequence;
            state.patterns[i].maxBars         = saved.maxBars || 1;
            state.patterns[i].label           = saved.label   || null;
            state.patterns[i].channelSettings = saved.channelSettings || null;
        });

        Object.assign(state.master,    data.master    || {});
        Object.assign(state.mastering, data.mastering || {});

        if (data.bpm) {
            state.bpm = data.bpm;
            setKnobValue('bpm', (state.bpm - 40) / 2.2, true);
        }
        setKnobValue('master', state.master.masterVolume, true);
        setKnobValue('swing',  state.master.swing,  true);
        setKnobValue('gate',   state.master.gate,   true);
        setKnobValue('bitsh',  state.master.bitsh,  true);
        setKnobValue('delay',  state.master.delay,  true);
        setKnobValue('reverb', state.master.reverb, true);

        deserializeChannels(data.channels);
        state.currentPattern = data.currentPattern || 0;
        state.currentBar = 0;
        state.lockedStep = null;

        updateChannelKnobs();
        const ctx = getAudioContext();
        if (ctx) { updateMasterEffects(); updateMasteringEffects(); }

        window.dispatchEvent(new CustomEvent('project-loaded'));
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { msg: 'Project loaded' } }));
    } catch(err) {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { msg: 'Error: ' + err.message, isError: true } }));
    }
}

export function loadProject() {
    window.dispatchEvent(new CustomEvent('show-load-modal'));
}
