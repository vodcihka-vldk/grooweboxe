<template>
  <div class="channels-section">
    <div class="section-header">
      <span id="chan-section-title" :style="{ opacity: isPtrnMode ? '0.3' : '1' }">Channel</span>
      <span id="ptrn-mode-label" :style="{ display: isPtrnMode ? 'inline' : 'none' }">PTRN</span>
    </div>
    <div class="channels-grid" id="channels-grid">
      <button
        v-for="i in 8"
        :key="i"
        class="chan-btn"
        :class="chanClass(i - 1)"
        @click="onChanClick(i - 1)"
        @mousedown="onChanMouseDown($event, i - 1)"
      >
        {{ isPtrnMode ? 'P' + i : i }}
        <span v-if="isPtrnMode" class="ptrn-dot"></span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { state, getSequence } from '../store/state.js';
import { updateChannelKnobs } from '../composables/useKnobs.js';
import { applyPatternChannelSettings } from '../composables/useProject.js';

const isPtrnMode     = ref(false);
const triggeredChans = ref(new Set());

// ── Channel button classes ────────────────────────────────────────────
function chanClass(i) {
  const classes = [];

  if (isPtrnMode.value) {
    classes.push('ptrn-mode');
    if (patternHasContent(i)) classes.push('ptrn-active');
    if (state.patterns[i].channelSettings) {
      // dots handled in template
    }
    if (i === state.currentPattern) classes.push('ptrn-selected');
  } else {
    if (i === state.selectedChannel) classes.push('selected');
    if (triggeredChans.value.has(i)) classes.push('triggered');
  }

  return classes;
}

function patternHasContent(pIdx) {
  return state.patterns[pIdx].sequence.some(ch => ch.some(step => step !== null));
}

// ── Channel click ─────────────────────────────────────────────────────
function onChanClick(i) {
  if (isPtrnMode.value) {
    switchPattern(i);
    exitPtrnMode();
    return;
  }
  state.selectedChannel = i;
  state.lockedStep = null;
  updateChannelKnobs();
  window.dispatchEvent(new CustomEvent('channel-changed', { detail: { channel: i } }));
  window.dispatchEvent(new CustomEvent('screen-update'));
}

function onChanMouseDown(e, i) {
  // Nothing special needed — click handles selection
}

// ── Pattern mode ──────────────────────────────────────────────────────
function enterPtrnMode() {
  isPtrnMode.value = true;
}

function exitPtrnMode() {
  isPtrnMode.value = false;
}

function switchPattern(pIdx) {
  if (pIdx === state.currentPattern) return;

  if (state.isPlaying) {
    state._nextPattern = pIdx;
  } else {
    applyPatternSwitch(pIdx);
  }
}

function applyPatternSwitch(pIdx) {
  // Auto-save current pattern settings
  const curPat = state.patterns[state.currentPattern];
  if (!curPat.channelSettings) {
    curPat.channelSettings = state.channels.map(ch => ({
      sample: ch.sample, volume: ch.volume, pitch: ch.pitch,
      drive: ch.drive, start: ch.start, length: ch.length,
      attack: ch.attack, decay: ch.decay,
      folderName: ch.folderName || null,
      folderSampleIdx: ch.folderSampleIdx || 0,
      folderFiles: ch.folderFiles || null
    }));
  }

  state.currentPattern = pIdx;
  state._nextPattern = null;
  state.currentBar = 0;
  state.lockedStep = null;

  const newPat = state.patterns[pIdx];
  if (newPat.channelSettings) {
    applyPatternChannelSettings(newPat.channelSettings);
  }

  window.dispatchEvent(new CustomEvent('pattern-switched', { detail: { pattern: pIdx } }));
  window.dispatchEvent(new CustomEvent('show-pattern-indicator', { detail: { pattern: pIdx } }));
  window.dispatchEvent(new CustomEvent('screen-update'));
}

// ── Ptrn button events (from App) ─────────────────────────────────────
function onEnterPtrn() { enterPtrnMode(); }
function onExitPtrn()  { exitPtrnMode(); }

// ── Channel trigger flash ─────────────────────────────────────────────
function onChannelTriggered(e) {
  if (isPtrnMode.value) return;
  const idx = e.detail.chanIndex;
  triggeredChans.value.add(idx);
  setTimeout(() => {
    triggeredChans.value.delete(idx);
    // Force reactivity
    triggeredChans.value = new Set(triggeredChans.value);
  }, 80);
  triggeredChans.value = new Set(triggeredChans.value);
}

// ── Pattern switch on seamless boundary ──────────────────────────────
function onPatternSwitched(e) {
  // Already handled in state, just re-render
}

onMounted(() => {
  window.addEventListener('enter-ptrn-mode',   onEnterPtrn);
  window.addEventListener('exit-ptrn-mode',    onExitPtrn);
  window.addEventListener('channel-triggered', onChannelTriggered);
  window.addEventListener('pattern-switched',  onPatternSwitched);
});

onUnmounted(() => {
  window.removeEventListener('enter-ptrn-mode',   onEnterPtrn);
  window.removeEventListener('exit-ptrn-mode',    onExitPtrn);
  window.removeEventListener('channel-triggered', onChannelTriggered);
  window.removeEventListener('pattern-switched',  onPatternSwitched);
});
</script>
