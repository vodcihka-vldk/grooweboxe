<template>
  <div class="sequencer-section">
    <div class="section-header">
      <span>Sequencer</span>
      <div class="bar-controls">
        <button class="btn-arrow" id="btn-bar-prev" @click="onBarPrev">&lt;</button>
        <span>Bar</span>
        <button class="btn-arrow" id="btn-bar-next" @click="onBarNext">&gt;</button>
      </div>
    </div>
    <div class="sequencer-grid" id="sequencer-grid">
      <button
        v-for="i in 16"
        :key="i"
        class="seq-btn"
        :class="{
          active:  stepStates[i-1]?.active,
          playing: stepStates[i-1]?.playing
        }"
        :style="{ boxShadow: stepStates[i-1]?.locked ? '0 0 15px #f00' : '' }"
        :data-step="i - 1"
        @click="onStepClick(i - 1)"
        @contextmenu.prevent="onStepRightClick(i - 1)"
      >{{ i }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { state, getSequence, getMaxBars, setMaxBars } from '../store/state.js';
import { getCurrent16thNote } from '../composables/useSequencer.js';
import { updateKnobsForStep, updateChannelKnobs } from '../composables/useKnobs.js';

// step: { active, playing, locked }
const stepStates = ref(Array.from({ length: 16 }, () => ({ active: false, playing: false, locked: false })));

function refreshSteps() {
  const chan = state.selectedChannel;
  const seq = getSequence();
  const currentStep16 = state.isPlaying ? getCurrent16thNote() % 16 : -1;
  const playingBar    = state.isPlaying ? Math.floor(getCurrent16thNote() / 16) : -1;

  stepStates.value = Array.from({ length: 16 }, (_, i) => {
    const globalStep = state.currentBar * 16 + i;
    return {
      active:  !!seq[chan][globalStep],
      playing: state.isPlaying && playingBar === state.currentBar && i === currentStep16,
      locked:  state.lockedStep === globalStep
    };
  });
}

// ── Step toggle ───────────────────────────────────────────────────────
function onStepClick(localStep) {
  const globalStep = state.currentBar * 16 + localStep;
  const chan = state.selectedChannel;
  const seq = getSequence();

  if (!seq[chan][globalStep]) {
    seq[chan][globalStep] = { active: true, locks: {} };
  } else {
    seq[chan][globalStep] = null;
    if (state.lockedStep === globalStep) {
      state.lockedStep = null;
      updateChannelKnobs();
    }
  }
  refreshSteps();
  window.dispatchEvent(new CustomEvent('mini-seq-update'));
}

// ── Parameter Lock ────────────────────────────────────────────────────
function onStepRightClick(localStep) {
  const globalStep = state.currentBar * 16 + localStep;
  const chan = state.selectedChannel;
  const seq = getSequence();

  if (seq[chan][globalStep]) {
    if (state.lockedStep === globalStep) {
      state.lockedStep = null;
      updateChannelKnobs();
    } else {
      state.lockedStep = globalStep;
      updateKnobsForStep(globalStep);
    }
    refreshSteps();
  }
}

// ── Bar navigation ────────────────────────────────────────────────────
function onBarPrev(e) {
  e.stopImmediatePropagation();
  if (state.isFuncPressed) {
    if (getMaxBars() > 1) {
      setMaxBars(getMaxBars() - 1);
      if (state.isPlaying) {
        const maxSteps = getMaxBars() * 16;
        if (getCurrent16thNote() >= maxSteps) {
          window.dispatchEvent(new CustomEvent('reset-step'));
        }
      }
      if (state.currentBar >= getMaxBars()) state.currentBar = getMaxBars() - 1;
      refreshSteps();
      flashBar();
    }
  } else {
    state.currentBar = (state.currentBar - 1 + getMaxBars()) % getMaxBars();
    refreshSteps();
  }
  window.dispatchEvent(new CustomEvent('screen-update'));
}

function onBarNext(e) {
  e.stopImmediatePropagation();
  if (state.isFuncPressed) {
    if (getMaxBars() < 4) {
      setMaxBars(getMaxBars() + 1);
      refreshSteps();
      flashBar();
    }
  } else {
    state.currentBar = (state.currentBar + 1) % getMaxBars();
    refreshSteps();
  }
  window.dispatchEvent(new CustomEvent('screen-update'));
}

function flashBar() {
  const barEl = document.getElementById('ui-current-bar');
  if (!barEl) return;
  barEl.style.color = '#fff';
  setTimeout(() => { barEl.style.color = ''; }, 500);
}

// ── Event listeners ───────────────────────────────────────────────────
function onSequencerStep(e) {
  const step = e.detail.step;
  const localStep = step % 16;
  const playingBar = Math.floor(step / 16);

  // Auto-follow playing bar
  if (playingBar !== state.currentBar) {
    state.currentBar = playingBar;
  }
  refreshSteps();
}

function onChannelChanged() {
  state.lockedStep = null;
  refreshSteps();
}

function onProjectLoaded() { refreshSteps(); }
function onPatternSwitched() {
  state.currentBar = 0;
  state.lockedStep = null;
  refreshSteps();
}
function onSequencerStopped() {
  state.currentBar = 0;
  // Clear playing highlights
  stepStates.value = stepStates.value.map(s => ({ ...s, playing: false }));
  refreshSteps();
}

onMounted(() => {
  window.addEventListener('sequencer-step',    onSequencerStep);
  window.addEventListener('channel-changed',   onChannelChanged);
  window.addEventListener('project-loaded',    onProjectLoaded);
  window.addEventListener('pattern-switched',  onPatternSwitched);
  window.addEventListener('sequencer-stopped', onSequencerStopped);
  window.addEventListener('mini-seq-update',   refreshSteps);
  refreshSteps();
});

onUnmounted(() => {
  window.removeEventListener('sequencer-step',    onSequencerStep);
  window.removeEventListener('channel-changed',   onChannelChanged);
  window.removeEventListener('project-loaded',    onProjectLoaded);
  window.removeEventListener('pattern-switched',  onPatternSwitched);
  window.removeEventListener('sequencer-stopped', onSequencerStopped);
  window.removeEventListener('mini-seq-update',   refreshSteps);
});
</script>
