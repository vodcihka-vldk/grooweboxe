// Synth sound registry: filename -> AudioBuffer
export const synthBufferRegistry = {};
export let synthReady = false;

export function noise(offCtx, dur) {
    const buf = offCtx.createBuffer(1, Math.ceil(offCtx.sampleRate * dur), offCtx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = offCtx.createBufferSource();
    src.buffer = buf;
    return src;
}

export function synthSound(recipe) {
    const sr = recipe.sr || 44100;
    const offCtx = new OfflineAudioContext(1, Math.ceil(sr * recipe.dur), sr);
    recipe.fn(offCtx, offCtx.destination);
    return offCtx.startRendering();
}

export function getBufferForFile(file) {
    return synthBufferRegistry[file.name] || null;
}

export function generateAllSynthSounds() {
    const tasks = [];

    function reg(name, dur, fn) {
        tasks.push(
            synthSound({ dur, fn }).then(buf => { synthBufferRegistry[name] = buf; })
        );
    }

    // ── KICKS ────────────────────────────────────────────────
    reg('Kick_Analog_01', 0.7, (ctx, out) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, 0);
        osc.frequency.exponentialRampToValueAtTime(35, 0.12);
        g.gain.setValueAtTime(1.0, 0);
        g.gain.exponentialRampToValueAtTime(0.001, 0.6);
        osc.connect(g); g.connect(out);
        osc.start(0); osc.stop(0.7);
    });

    reg('Kick_Analog_02', 0.7, (ctx, out) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, 0);
        osc.frequency.exponentialRampToValueAtTime(40, 0.08);
        g.gain.setValueAtTime(1.0, 0);
        g.gain.exponentialRampToValueAtTime(0.001, 0.55);
        const dist = ctx.createWaveShaper();
        const curve = new Float32Array(256);
        for (let i = 0; i < 256; i++) { const x = i * 2 / 256 - 1; curve[i] = Math.tanh(x * 3); }
        dist.curve = curve;
        osc.connect(dist); dist.connect(g); g.connect(out);
        osc.start(0); osc.stop(0.7);
    });

    reg('Kick_808_Deep', 1.2, (ctx, out) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(60, 0);
        osc.frequency.exponentialRampToValueAtTime(35, 0.05);
        g.gain.setValueAtTime(1.0, 0);
        g.gain.exponentialRampToValueAtTime(0.001, 1.1);
        osc.connect(g); g.connect(out);
        osc.start(0); osc.stop(1.2);
    });

    reg('Kick_Punchy', 0.5, (ctx, out) => {
        const osc = ctx.createOscillator();
        const click = ctx.createOscillator();
        const g = ctx.createGain();
        const gc = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, 0);
        osc.frequency.exponentialRampToValueAtTime(45, 0.06);
        g.gain.setValueAtTime(1.0, 0);
        g.gain.exponentialRampToValueAtTime(0.001, 0.45);
        click.type = 'square';
        click.frequency.value = 1200;
        gc.gain.setValueAtTime(0.4, 0);
        gc.gain.exponentialRampToValueAtTime(0.001, 0.015);
        click.connect(gc); gc.connect(ctx.destination);
        osc.connect(g); g.connect(out);
        osc.start(0); osc.stop(0.5);
        click.start(0); click.stop(0.02);
    });

    reg('Kick_Distorted', 0.6, (ctx, out) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const dist = ctx.createWaveShaper();
        const curve = new Float32Array(256);
        for (let i = 0; i < 256; i++) { const x = i * 2 / 256 - 1; curve[i] = Math.tanh(x * 8); }
        dist.curve = curve;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, 0);
        osc.frequency.exponentialRampToValueAtTime(30, 0.1);
        g.gain.setValueAtTime(0.8, 0);
        g.gain.exponentialRampToValueAtTime(0.001, 0.55);
        osc.connect(dist); dist.connect(g); g.connect(out);
        osc.start(0); osc.stop(0.6);
    });

    // ── SNARES ───────────────────────────────────────────────
    reg('Snare_Crispy', 0.25, (ctx, out) => {
        const n = noise(ctx, 0.25);
        const osc = ctx.createOscillator();
        const gn = ctx.createGain();
        const go = ctx.createGain();
        const filt = ctx.createBiquadFilter();
        filt.type = 'highpass'; filt.frequency.value = 1800;
        gn.gain.setValueAtTime(0.7, 0);
        gn.gain.exponentialRampToValueAtTime(0.001, 0.22);
        osc.type = 'triangle'; osc.frequency.value = 220;
        go.gain.setValueAtTime(0.5, 0);
        go.gain.exponentialRampToValueAtTime(0.001, 0.12);
        n.connect(filt); filt.connect(gn); gn.connect(out);
        osc.connect(go); go.connect(out);
        n.start(0); osc.start(0); osc.stop(0.25);
    });

    reg('Snare_Acoustic', 0.35, (ctx, out) => {
        const n = noise(ctx, 0.35);
        const osc = ctx.createOscillator();
        const gn = ctx.createGain();
        const go = ctx.createGain();
        const filt = ctx.createBiquadFilter();
        filt.type = 'bandpass'; filt.frequency.value = 3000; filt.Q.value = 0.5;
        gn.gain.setValueAtTime(1.0, 0);
        gn.gain.exponentialRampToValueAtTime(0.001, 0.30);
        osc.type = 'sine'; osc.frequency.value = 185;
        go.gain.setValueAtTime(0.6, 0);
        go.gain.exponentialRampToValueAtTime(0.001, 0.18);
        n.connect(filt); filt.connect(gn); gn.connect(out);
        osc.connect(go); go.connect(out);
        n.start(0); osc.start(0); osc.stop(0.35);
    });

    reg('Snare_Rim', 0.12, (ctx, out) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square'; osc.frequency.value = 1600;
        g.gain.setValueAtTime(0.8, 0);
        g.gain.exponentialRampToValueAtTime(0.001, 0.10);
        osc.connect(g); g.connect(out);
        osc.start(0); osc.stop(0.12);
    });

    reg('Snare_Fat', 0.4, (ctx, out) => {
        const n = noise(ctx, 0.4);
        const osc = ctx.createOscillator();
        const gn = ctx.createGain();
        const go = ctx.createGain();
        const filt = ctx.createBiquadFilter();
        filt.type = 'lowpass'; filt.frequency.value = 5000;
        gn.gain.setValueAtTime(1.0, 0);
        gn.gain.exponentialRampToValueAtTime(0.001, 0.38);
        osc.type = 'sine'; osc.frequency.value = 140;
        go.gain.setValueAtTime(0.8, 0);
        go.gain.exponentialRampToValueAtTime(0.001, 0.22);
        n.connect(filt); filt.connect(gn); gn.connect(out);
        osc.connect(go); go.connect(out);
        n.start(0); osc.start(0); osc.stop(0.4);
    });

    // ── HI-HATS ──────────────────────────────────────────────
    reg('HH_Closed_01', 0.09, (ctx, out) => {
        const n = noise(ctx, 0.09);
        const g = ctx.createGain();
        const filt = ctx.createBiquadFilter();
        filt.type = 'highpass'; filt.frequency.value = 7000;
        g.gain.setValueAtTime(0.6, 0);
        g.gain.exponentialRampToValueAtTime(0.001, 0.08);
        n.connect(filt); filt.connect(g); g.connect(out);
        n.start(0);
    });

    reg('HH_Open_Sizzle', 0.55, (ctx, out) => {
        const n = noise(ctx, 0.55);
        const g = ctx.createGain();
        const filt = ctx.createBiquadFilter();
        filt.type = 'highpass'; filt.frequency.value = 6000;
        g.gain.setValueAtTime(0.5, 0);
        g.gain.exponentialRampToValueAtTime(0.001, 0.5);
        n.connect(filt); filt.connect(g); g.connect(out);
        n.start(0);
    });

    reg('HH_Pedal', 0.15, (ctx, out) => {
        const n = noise(ctx, 0.15);
        const g = ctx.createGain();
        const filt = ctx.createBiquadFilter();
        filt.type = 'bandpass'; filt.frequency.value = 5000; filt.Q.value = 1.5;
        g.gain.setValueAtTime(0.4, 0);
        g.gain.exponentialRampToValueAtTime(0.001, 0.13);
        n.connect(filt); filt.connect(g); g.connect(out);
        n.start(0);
    });

    // ── CLAPS / PERC ─────────────────────────────────────────
    reg('Clap_Classic', 0.22, (ctx, out) => {
        [0, 0.012, 0.024].forEach((offset, i) => {
            const n = noise(ctx, 0.22 - offset);
            const g = ctx.createGain();
            const filt = ctx.createBiquadFilter();
            filt.type = 'bandpass'; filt.frequency.value = 1200 + i * 200; filt.Q.value = 0.8;
            g.gain.setValueAtTime(0, offset);
            g.gain.linearRampToValueAtTime(0.9, offset + 0.002);
            g.gain.exponentialRampToValueAtTime(0.001, offset + 0.18);
            n.connect(filt); filt.connect(g); g.connect(out);
            n.start(offset);
        });
    });

    reg('Clap_808', 0.18, (ctx, out) => {
        const n = noise(ctx, 0.18);
        const g = ctx.createGain();
        const filt = ctx.createBiquadFilter();
        filt.type = 'highpass'; filt.frequency.value = 900;
        g.gain.setValueAtTime(1.0, 0);
        g.gain.setValueAtTime(0.3, 0.005);
        g.gain.exponentialRampToValueAtTime(0.001, 0.16);
        n.connect(filt); filt.connect(g); g.connect(out);
        n.start(0);
    });

    reg('Perc_Conga', 0.28, (ctx, out) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, 0);
        osc.frequency.exponentialRampToValueAtTime(140, 0.08);
        g.gain.setValueAtTime(0.9, 0);
        g.gain.exponentialRampToValueAtTime(0.001, 0.25);
        osc.connect(g); g.connect(out);
        osc.start(0); osc.stop(0.28);
    });

    // ── BASS ─────────────────────────────────────────────────
    reg('Bass_Sub_Deep', 1.0, (ctx, out) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = 55;
        g.gain.setValueAtTime(0, 0);
        g.gain.linearRampToValueAtTime(1.0, 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, 0.95);
        osc.connect(g); g.connect(out);
        osc.start(0); osc.stop(1.0);
    });

    reg('Bass_Acid_303', 0.7, (ctx, out) => {
        const osc = ctx.createOscillator();
        const filt = ctx.createBiquadFilter();
        const g = ctx.createGain();
        osc.type = 'sawtooth'; osc.frequency.value = 110;
        filt.type = 'lowpass';
        filt.frequency.setValueAtTime(300, 0);
        filt.frequency.exponentialRampToValueAtTime(4000, 0.15);
        filt.frequency.exponentialRampToValueAtTime(200, 0.6);
        filt.Q.value = 18;
        g.gain.setValueAtTime(0, 0);
        g.gain.linearRampToValueAtTime(0.8, 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, 0.65);
        osc.connect(filt); filt.connect(g); g.connect(out);
        osc.start(0); osc.stop(0.7);
    });

    reg('Bass_Reese', 1.2, (ctx, out) => {
        [0, 4].forEach(detune => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            const filt = ctx.createBiquadFilter();
            osc.type = 'sawtooth'; osc.frequency.value = 55; osc.detune.value = detune;
            filt.type = 'lowpass'; filt.frequency.value = 800; filt.Q.value = 2;
            g.gain.setValueAtTime(0, 0);
            g.gain.linearRampToValueAtTime(0.5, 0.05);
            g.gain.exponentialRampToValueAtTime(0.001, 1.1);
            osc.connect(filt); filt.connect(g); g.connect(out);
            osc.start(0); osc.stop(1.2);
        });
    });

    reg('Bass_Moog', 0.8, (ctx, out) => {
        const osc = ctx.createOscillator();
        const filt = ctx.createBiquadFilter();
        const g = ctx.createGain();
        osc.type = 'sawtooth'; osc.frequency.value = 82;
        filt.type = 'lowpass'; filt.frequency.value = 1200; filt.Q.value = 8;
        g.gain.setValueAtTime(0, 0);
        g.gain.linearRampToValueAtTime(0.9, 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, 0.75);
        osc.connect(filt); filt.connect(g); g.connect(out);
        osc.start(0); osc.stop(0.8);
    });

    reg('EBass_Fingered', 0.6, (ctx, out) => {
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle'; osc.frequency.value = 73;
        osc2.type = 'sine'; osc2.frequency.value = 146;
        const g2 = ctx.createGain(); g2.gain.value = 0.2;
        g.gain.setValueAtTime(0, 0);
        g.gain.linearRampToValueAtTime(0.9, 0.008);
        g.gain.exponentialRampToValueAtTime(0.001, 0.55);
        osc.connect(g); osc2.connect(g2); g2.connect(g); g.connect(out);
        osc.start(0); osc.stop(0.6); osc2.start(0); osc2.stop(0.6);
    });

    reg('EBass_Slap_A', 0.35, (ctx, out) => {
        const osc = ctx.createOscillator();
        const click = ctx.createOscillator();
        const g = ctx.createGain();
        const gc = ctx.createGain();
        osc.type = 'triangle'; osc.frequency.value = 98;
        g.gain.setValueAtTime(0, 0);
        g.gain.linearRampToValueAtTime(1.0, 0.003);
        g.gain.exponentialRampToValueAtTime(0.001, 0.30);
        click.type = 'square'; click.frequency.value = 800;
        gc.gain.setValueAtTime(0.5, 0);
        gc.gain.exponentialRampToValueAtTime(0.001, 0.02);
        osc.connect(g); g.connect(out);
        click.connect(gc); gc.connect(out);
        osc.start(0); osc.stop(0.35); click.start(0); click.stop(0.025);
    });

    reg('EBass_Plucked', 0.4, (ctx, out) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const filt = ctx.createBiquadFilter();
        osc.type = 'sawtooth'; osc.frequency.value = 82;
        filt.type = 'lowpass'; filt.frequency.value = 2000; filt.Q.value = 1;
        g.gain.setValueAtTime(0, 0);
        g.gain.linearRampToValueAtTime(0.85, 0.005);
        g.gain.exponentialRampToValueAtTime(0.001, 0.38);
        osc.connect(filt); filt.connect(g); g.connect(out);
        osc.start(0); osc.stop(0.4);
    });

    reg('Bass_One_Shot', 0.5, (ctx, out) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = 65;
        g.gain.setValueAtTime(0, 0);
        g.gain.linearRampToValueAtTime(1.0, 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, 0.48);
        osc.connect(g); g.connect(out);
        osc.start(0); osc.stop(0.5);
    });

    // ── LOOPS ────────────────────────────────────────────────
    function makeLoop(ctx, out, bpm, steps) {
        steps.forEach(s => {
            const osc = s.noise ? noise(ctx, s.dur) : ctx.createOscillator();
            const g = ctx.createGain();
            if (!s.noise) {
                osc.type = s.type || 'sine';
                osc.frequency.value = s.freq || 100;
            }
            g.gain.setValueAtTime(0, s.t);
            g.gain.linearRampToValueAtTime(s.amp || 0.8, s.t + 0.005);
            g.gain.exponentialRampToValueAtTime(0.001, s.t + s.dur);
            if (s.noise) { osc.connect(g); g.connect(out); osc.start(s.t); }
            else { osc.connect(g); g.connect(out); osc.start(s.t); osc.stop(s.t + s.dur + 0.01); }
        });
    }

    const beat120 = 60 / 120;
    reg('Loop_Drum_Funky', beat120 * 4, (ctx, out) => {
        const b = beat120;
        makeLoop(ctx, out, 120, [
            { t: 0,      freq: 60, type: 'sine', dur: 0.3, amp: 1.0 },
            { t: b,      noise: true, dur: 0.15, amp: 0.5 },
            { t: b * 1.5, freq: 60, type: 'sine', dur: 0.2, amp: 0.7 },
            { t: b * 2,  freq: 60, type: 'sine', dur: 0.35, amp: 1.0 },
            { t: b * 3,  noise: true, dur: 0.18, amp: 0.6 },
            { t: b * 3.5, noise: true, dur: 0.05, amp: 0.3 },
        ]);
    });

    reg('Loop_Perc_120', beat120 * 4, (ctx, out) => {
        const b = beat120;
        makeLoop(ctx, out, 120, [
            { t: 0,       freq: 320, type: 'sine',     dur: 0.12, amp: 0.8 },
            { t: b * 0.5, freq: 240, type: 'triangle', dur: 0.08, amp: 0.5 },
            { t: b,       freq: 440, type: 'sine',     dur: 0.10, amp: 0.7 },
            { t: b * 1.5, freq: 200, type: 'triangle', dur: 0.08, amp: 0.4 },
            { t: b * 2,   freq: 320, type: 'sine',     dur: 0.12, amp: 0.8 },
            { t: b * 2.75,freq: 560, type: 'sine',     dur: 0.07, amp: 0.6 },
            { t: b * 3,   freq: 240, type: 'triangle', dur: 0.10, amp: 0.5 },
            { t: b * 3.5, freq: 400, type: 'sine',     dur: 0.08, amp: 0.4 },
        ]);
    });

    reg('Loop_Full_Break', beat120 * 4, (ctx, out) => {
        const b = beat120;
        makeLoop(ctx, out, 120, [
            { t: 0,       freq: 55, type: 'sine', dur: 0.3, amp: 1.0 },
            { t: b * 0.75, noise: true, dur: 0.04, amp: 0.35 },
            { t: b,        noise: true, dur: 0.2, amp: 0.7 },
            { t: b * 1.5,  freq: 55, type: 'sine', dur: 0.2, amp: 0.6 },
            { t: b * 1.75, noise: true, dur: 0.04, amp: 0.3 },
            { t: b * 2,    freq: 55, type: 'sine', dur: 0.32, amp: 1.0 },
            { t: b * 2.5,  noise: true, dur: 0.04, amp: 0.35 },
            { t: b * 3,    noise: true, dur: 0.22, amp: 0.7 },
            { t: b * 3.5,  freq: 55, type: 'sine', dur: 0.15, amp: 0.5 },
            { t: b * 3.75, noise: true, dur: 0.04, amp: 0.3 },
        ]);
    });

    const beat140 = 60 / 140;
    reg('Loop_Amen_140', beat140 * 4, (ctx, out) => {
        const b = beat140;
        makeLoop(ctx, out, 140, [
            { t: 0,       freq: 55, type: 'sine', dur: 0.25, amp: 1.0 },
            { t: b * 0.5, noise: true, dur: 0.04, amp: 0.4 },
            { t: b * 0.75, freq: 55, type: 'sine', dur: 0.12, amp: 0.5 },
            { t: b,        noise: true, dur: 0.18, amp: 0.8 },
            { t: b * 1.5,  noise: true, dur: 0.04, amp: 0.35 },
            { t: b * 2,    freq: 55, type: 'sine', dur: 0.28, amp: 0.9 },
            { t: b * 2.25, noise: true, dur: 0.04, amp: 0.3 },
            { t: b * 2.5,  freq: 55, type: 'sine', dur: 0.12, amp: 0.5 },
            { t: b * 3,    noise: true, dur: 0.2, amp: 0.8 },
            { t: b * 3.25, freq: 55, type: 'sine', dur: 0.1, amp: 0.4 },
            { t: b * 3.5,  noise: true, dur: 0.04, amp: 0.35 },
            { t: b * 3.75, freq: 55, type: 'sine', dur: 0.08, amp: 0.3 },
        ]);
    });

    reg('Loop_Jungle_140', beat140 * 4, (ctx, out) => {
        const b = beat140;
        makeLoop(ctx, out, 140, [
            { t: 0,       freq: 50, type: 'sine', dur: 0.22, amp: 1.0 },
            { t: b * 0.25, noise: true, dur: 0.04, amp: 0.3 },
            { t: b * 0.5,  freq: 50, type: 'sine', dur: 0.12, amp: 0.5 },
            { t: b * 0.75, noise: true, dur: 0.04, amp: 0.4 },
            { t: b,        noise: true, dur: 0.2, amp: 0.9 },
            { t: b * 1.25, freq: 50, type: 'sine', dur: 0.1, amp: 0.4 },
            { t: b * 2,    freq: 50, type: 'sine', dur: 0.25, amp: 1.0 },
            { t: b * 2.5,  noise: true, dur: 0.04, amp: 0.35 },
            { t: b * 2.75, freq: 50, type: 'sine', dur: 0.1, amp: 0.45 },
            { t: b * 3,    noise: true, dur: 0.2, amp: 0.85 },
            { t: b * 3.5,  noise: true, dur: 0.04, amp: 0.3 },
        ]);
    });

    reg('Loop_Techno_140', beat140 * 4, (ctx, out) => {
        const b = beat140;
        makeLoop(ctx, out, 140, [
            { t: 0,       freq: 55, type: 'sine', dur: 0.28, amp: 1.0 },
            { t: b,       freq: 55, type: 'sine', dur: 0.28, amp: 0.9 },
            { t: b * 2,   freq: 55, type: 'sine', dur: 0.28, amp: 1.0 },
            { t: b * 3,   freq: 55, type: 'sine', dur: 0.28, amp: 0.9 },
            { t: b * 0.5, noise: true, dur: 0.06, amp: 0.4 },
            { t: b * 1.5, noise: true, dur: 0.06, amp: 0.4 },
            { t: b * 2.5, noise: true, dur: 0.06, amp: 0.4 },
            { t: b * 3.5, noise: true, dur: 0.06, amp: 0.4 },
        ]);
    });

    reg('Loop_House_140', beat140 * 4, (ctx, out) => {
        const b = beat140;
        for (let i = 0; i < 4; i++) {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(65, i * b);
            osc.frequency.exponentialRampToValueAtTime(35, i * b + 0.1);
            g.gain.setValueAtTime(1.0, i * b);
            g.gain.exponentialRampToValueAtTime(0.001, i * b + 0.25);
            osc.connect(g); g.connect(out);
            osc.start(i * b); osc.stop(i * b + 0.26);
        }
        [0.5, 1.5, 2.5, 3.5].forEach(off => {
            const n = noise(ctx, 0.05);
            const g = ctx.createGain();
            const filt = ctx.createBiquadFilter();
            filt.type = 'highpass'; filt.frequency.value = 8000;
            g.gain.setValueAtTime(0.4, off * b);
            g.gain.exponentialRampToValueAtTime(0.001, off * b + 0.05);
            n.connect(filt); filt.connect(g); g.connect(out);
            n.start(off * b);
        });
    });

    reg('Loop_Chill_Vibe', 2.0, (ctx, out) => {
        const b = 60 / 75;
        makeLoop(ctx, out, 75, [
            { t: 0,      freq: 50, type: 'sine', dur: 0.4, amp: 0.9 },
            { t: b * 1.5, noise: true, dur: 0.25, amp: 0.5 },
            { t: b * 2,  freq: 50, type: 'sine', dur: 0.3, amp: 0.7 },
        ]);
    });

    // ── FX ───────────────────────────────────────────────────
    reg('Riser_8bar', 4.0, (ctx, out) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const filt = ctx.createBiquadFilter();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(40, 0);
        osc.frequency.exponentialRampToValueAtTime(2000, 3.9);
        filt.type = 'lowpass';
        filt.frequency.setValueAtTime(200, 0);
        filt.frequency.exponentialRampToValueAtTime(12000, 3.9);
        filt.Q.value = 4;
        g.gain.setValueAtTime(0, 0);
        g.gain.linearRampToValueAtTime(0.8, 3.9);
        g.gain.exponentialRampToValueAtTime(0.001, 4.0);
        osc.connect(filt); filt.connect(g); g.connect(out);
        osc.start(0); osc.stop(4.0);
    });

    reg('Riser_Synth_4bar', 2.0, (ctx, out) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(80, 0);
        osc.frequency.exponentialRampToValueAtTime(1600, 1.9);
        g.gain.setValueAtTime(0.0, 0);
        g.gain.linearRampToValueAtTime(0.7, 1.9);
        g.gain.exponentialRampToValueAtTime(0.001, 2.0);
        osc.connect(g); g.connect(out);
        osc.start(0); osc.stop(2.0);
    });

    reg('Riser_Noise', 3.0, (ctx, out) => {
        const n = noise(ctx, 3.0);
        const g = ctx.createGain();
        const filt = ctx.createBiquadFilter();
        filt.type = 'bandpass';
        filt.frequency.setValueAtTime(100, 0);
        filt.frequency.exponentialRampToValueAtTime(12000, 2.9);
        filt.Q.value = 1;
        g.gain.setValueAtTime(0, 0);
        g.gain.linearRampToValueAtTime(0.9, 2.9);
        g.gain.exponentialRampToValueAtTime(0.001, 3.0);
        n.connect(filt); filt.connect(g); g.connect(out);
        n.start(0);
    });

    reg('Impact_Boom', 1.2, (ctx, out) => {
        const osc = ctx.createOscillator();
        const n = noise(ctx, 1.2);
        const g = ctx.createGain();
        const gn = ctx.createGain();
        const filt = ctx.createBiquadFilter();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, 0);
        osc.frequency.exponentialRampToValueAtTime(20, 0.5);
        g.gain.setValueAtTime(1.0, 0);
        g.gain.exponentialRampToValueAtTime(0.001, 1.1);
        filt.type = 'lowpass'; filt.frequency.value = 400;
        gn.gain.setValueAtTime(0.4, 0);
        gn.gain.exponentialRampToValueAtTime(0.001, 0.8);
        osc.connect(g); g.connect(out);
        n.connect(filt); filt.connect(gn); gn.connect(out);
        osc.start(0); osc.stop(1.2); n.start(0);
    });

    reg('Impact_Sub_Hit', 0.8, (ctx, out) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, 0);
        osc.frequency.exponentialRampToValueAtTime(25, 0.3);
        g.gain.setValueAtTime(1.0, 0);
        g.gain.exponentialRampToValueAtTime(0.001, 0.75);
        osc.connect(g); g.connect(out);
        osc.start(0); osc.stop(0.8);
    });

    reg('Impact_Crash', 1.5, (ctx, out) => {
        const n = noise(ctx, 1.5);
        const g = ctx.createGain();
        const filt = ctx.createBiquadFilter();
        filt.type = 'highpass'; filt.frequency.value = 3000;
        g.gain.setValueAtTime(1.0, 0);
        g.gain.exponentialRampToValueAtTime(0.001, 1.4);
        n.connect(filt); filt.connect(g); g.connect(out);
        n.start(0);
    });

    reg('FX_Downlifter', 2.5, (ctx, out) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1800, 0);
        osc.frequency.exponentialRampToValueAtTime(30, 2.4);
        g.gain.setValueAtTime(0.8, 0);
        g.gain.exponentialRampToValueAtTime(0.001, 2.4);
        osc.connect(g); g.connect(out);
        osc.start(0); osc.stop(2.5);
    });

    reg('FX_Sweep_White', 2.0, (ctx, out) => {
        const n = noise(ctx, 2.0);
        const filt = ctx.createBiquadFilter();
        const g = ctx.createGain();
        filt.type = 'bandpass';
        filt.frequency.setValueAtTime(8000, 0);
        filt.frequency.exponentialRampToValueAtTime(200, 1.9);
        filt.Q.value = 2;
        g.gain.setValueAtTime(0.7, 0);
        g.gain.linearRampToValueAtTime(0.9, 1.0);
        g.gain.exponentialRampToValueAtTime(0.001, 2.0);
        n.connect(filt); filt.connect(g); g.connect(out);
        n.start(0);
    });

    reg('FX_Stutter', 0.5, (ctx, out) => {
        for (let i = 0; i < 8; i++) {
            const t = i * 0.06;
            const n = noise(ctx, 0.04);
            const g = ctx.createGain();
            const filt = ctx.createBiquadFilter();
            filt.type = 'bandpass'; filt.frequency.value = 2000 + i * 400;
            g.gain.setValueAtTime(0.6 - i * 0.05, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
            n.connect(filt); filt.connect(g); g.connect(out);
            n.start(t);
        }
    });

    return Promise.all(tasks).then(() => {
        synthReady = true;
        console.log('All synth sounds generated:', Object.keys(synthBufferRegistry).length);
    });
}

// Generate basic 8 drum samples (fast startup fallback)
export function generateBasicSamples() {
    const bank = new Array(8);
    const promises = [];

    for (let i = 0; i < 8; i++) {
        let dur = 2.0;
        switch (i) {
            case 0: dur = 0.5; break;
            case 1: dur = 0.2; break;
            case 2: dur = 0.1; break;
            case 3: dur = 0.6; break;
            case 4: dur = 0.4; break;
            case 5: dur = 0.2; break;
            case 6: dur = 0.3; break;
            case 7: dur = 1.5; break;
        }

        const offCtx = new OfflineAudioContext(1, Math.ceil(44100 * dur), 44100);
        const osc = offCtx.createOscillator();
        const gain = offCtx.createGain();
        osc.connect(gain);
        gain.connect(offCtx.destination);

        switch (i) {
            case 0:
                osc.type = 'sine';
                osc.frequency.setValueAtTime(150, 0);
                osc.frequency.exponentialRampToValueAtTime(0.001, 0.5);
                gain.gain.setValueAtTime(1, 0);
                gain.gain.exponentialRampToValueAtTime(0.001, 0.5);
                break;
            case 1:
                osc.type = 'triangle';
                osc.frequency.value = 250;
                gain.gain.setValueAtTime(1, 0);
                gain.gain.exponentialRampToValueAtTime(0.001, 0.2);
                break;
            case 2:
                osc.type = 'square';
                osc.frequency.value = 800;
                gain.gain.setValueAtTime(0.5, 0);
                gain.gain.exponentialRampToValueAtTime(0.001, 0.1);
                break;
            case 3:
                osc.type = 'square';
                osc.frequency.value = 800;
                gain.gain.setValueAtTime(0.5, 0);
                gain.gain.exponentialRampToValueAtTime(0.001, 0.6);
                break;
            case 4:
                osc.type = 'sine';
                osc.frequency.setValueAtTime(200, 0);
                osc.frequency.exponentialRampToValueAtTime(50, 0.3);
                gain.gain.setValueAtTime(1, 0);
                gain.gain.exponentialRampToValueAtTime(0.001, 0.4);
                break;
            case 5:
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(800, 0);
                osc.frequency.exponentialRampToValueAtTime(100, 0.1);
                gain.gain.setValueAtTime(0.8, 0);
                gain.gain.exponentialRampToValueAtTime(0.001, 0.2);
                break;
            case 6:
            case 7:
                osc.type = 'sawtooth';
                osc.frequency.value = i === 6 ? 100 : 50;
                gain.gain.setValueAtTime(1, 0);
                gain.gain.exponentialRampToValueAtTime(0.001, i === 6 ? 0.3 : 1.5);
                break;
        }
        osc.start(0);
        osc.stop(dur);

        promises.push(
            offCtx.startRendering().then(buf => { bank[i] = buf; })
        );
    }

    return Promise.all(promises).then(() => bank);
}
